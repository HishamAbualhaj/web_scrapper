import { NextRequest, NextResponse } from "next/server";
import scrapeStoreProducts from "@/lib/scrapers/scrapeStoreProducts";
import { supabase } from "@/supabase";
import { parseNumericValue } from "@/utils/parseNumericValue";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { storeUrl, storeName } = body;

  // Validate required field
  if (!storeUrl) {
    return NextResponse.json(
      { message: "Store url is required", error: "Store url is required" },
      { status: 400 },
    );
  }

  try {
    const scrapedProducts = await scrapeStoreProducts(storeUrl);

    if (!scrapedProducts || scrapedProducts.length === 0) {
      return NextResponse.json(
        { message: "No Products Found" },
        { status: 404 },
      );
    }

    const totalProducts = scrapedProducts.length;

    // Step 2: Handle store
    const externalStoreId = scrapedProducts[0].storeId;
    const extractedStoreName = storeName || scrapedProducts[0].storeName;

    const { data: existingStore, error: storeCheckError } = await supabase
      .from("stores")
      .select("id, name, external_store_id")
      .eq("external_store_id", externalStoreId)
      .maybeSingle();

    if (storeCheckError) {
      throw storeCheckError;
    }

    let store;
    if (existingStore) {
      store = existingStore;
    } else {
      const { data: newStore, error: storeCreateError } = await supabase
        .from("stores")
        .insert([
          {
            external_store_id: externalStoreId,
            name: extractedStoreName,
            created_at: new Date().toISOString(),
            store_url: storeUrl,
          },
        ])
        .select()
        .single();

      if (storeCreateError) throw storeCreateError;
      store = newStore;
    }

    // Step 3: Process products in batches
    const BATCH_SIZE = 20;
    const results = {
      productsProcessed: 0,
      pricesRecorded: 0,
      errors: [] as string[],
    };

    for (let i = 0; i < scrapedProducts.length; i += BATCH_SIZE) {
      const batch = scrapedProducts.slice(i, i + BATCH_SIZE);

      const batchResult = await processBatch(batch, store.id);

      results.productsProcessed += batchResult.productsProcessed;
      results.pricesRecorded += batchResult.pricesRecorded;
      results.errors.push(...batchResult.errors);

      // Small delay to prevent overwhelming the database
      if (i + BATCH_SIZE < scrapedProducts.length) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
    return NextResponse.json(
      {
        message: "All products processed successfully!",
        data: {
          storeId: store.id,
          externalStoreId: store.external_store_id,
          storeName: store.name,
          isNewStore: !existingStore,
          productsProcessed: results.productsProcessed,
          pricesRecorded: results.pricesRecorded,
          errors: results.errors,
        },
        products: scrapedProducts,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error in scrape-products route:", error);
    return NextResponse.json(
      { error: "Something went wrong while scrapping data" },
      { status: 500 },
    );
  }
}

async function processBatch(products: ProductDetails[], storeUUID: string) {
  const results = {
    productsProcessed: 0,
    pricesRecorded: 0,
    errors: [] as string[],
  };

  const productsToUpsert: any[] = [];

  // Prepare all product data for upsert
  for (const product of products) {
    try {
      const price = parseNumericValue(product.price);
      const originalPrice = parseNumericValue(product.originalPrice);
      const discountValue = parseNumericValue(product.discount);

      const productData = {
        external_product_id: product.productId,
        store_id: storeUUID,
        store_title: product.storeName,
        title: product.title,
        price: price,
        original_price: originalPrice,
        discount: discountValue,
        rating: product.rating || null,
        review_count: parseInt(product.reviewCount.replace(/[^\d]/g, "")) || 0,
        images: product.images,
        nudges: product.nudges,
        product_url: product.productUrl,
        badge: product.badge || null,
        stock_info: product.stockInfo || null,
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };

      productsToUpsert.push(productData);
    } catch (err) {
      results.errors.push(
        `Product ${product.productId}: ${
          err instanceof Error ? err.message : "Unknown error"
        }`,
      );
    }
  }

  // Batch upsert all products (insert or update in one operation)
  if (productsToUpsert.length > 0) {
    const { data: upsertedProducts, error: upsertError } = await supabase
      .from("products")
      .upsert(productsToUpsert, {
        onConflict: "external_product_id,store_id",
        ignoreDuplicates: false,
      })
      .select("product_id, external_product_id, price, discount");

    if (upsertError) {
      results.errors.push(`Batch upsert error: ${upsertError.message}`);
    } else if (upsertedProducts) {
      results.productsProcessed += upsertedProducts.length;

      // Get product UUIDs to check latest price history
      const productUUIDs = upsertedProducts.map((p) => p.product_id);

      // Fetch the most recent price record for each product
      const { data: latestPrices } = await supabase
        .from("product_price_history")
        .select("product_id, price, discount")
        .in("product_id", productUUIDs)
        .order("recorded_at", { ascending: false });

      // Create a map of product_id -> latest price record
      const latestPriceMap = new Map();
      if (latestPrices) {
        for (const record of latestPrices) {
          if (!latestPriceMap.has(record.product_id)) {
            latestPriceMap.set(record.product_id, {
              price: record.price,
              discount: record.discount,
            });
          }
        }
      }

      // Prepare price history only for products with price changes
      const priceHistoryToInsert: any[] = [];

      for (const upserted of upsertedProducts) {
        const latestPrice = latestPriceMap.get(upserted.product_id);

        // Insert if:
        // 1. No previous price record exists, OR
        // 2. Price has changed, OR
        // 3. Discount has changed
        const priceChanged =
          !latestPrice ||
          latestPrice.price !== upserted.price ||
          latestPrice.discount !== upserted.discount;

        if (priceChanged) {
          priceHistoryToInsert.push({
            product_id: upserted.product_id,
            price: upserted.price,
            discount: upserted.discount,
            recorded_at: new Date().toISOString(),
          });
        }
      }

      // Batch insert price history (only for changed prices)
      if (priceHistoryToInsert.length > 0) {
        const { data: insertedHistory, error: historyError } = await supabase
          .from("product_price_history")
          .insert(priceHistoryToInsert)
          .select("id");

        if (historyError) {
          results.errors.push(
            `Price history batch error: ${historyError.message}`,
          );
        } else if (insertedHistory) {
          results.pricesRecorded += insertedHistory.length;
        }
      }
    }
  }

  return results;
}
