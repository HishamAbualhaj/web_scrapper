import { NextRequest } from "next/server";
import scrapeStoreProducts from "@/lib/scrapers/scrapeStoreProducts";
import { sendSSE } from "@/utils/sse";
import { supabase } from "@/supabase";
import { parseNumericValue } from "@/utils/parseNumericValue";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { storeUrl, storeName } = body;

  // Validate required field
  if (!storeUrl) {
    return new Response(JSON.stringify({ error: "storeUrl is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Create a ReadableStream for SSE
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Step 1: Start scraping
        sendSSE(controller, {
          type: "progress",
          message: "Starting to scrape products...",
          msgT: "start_sraping",
          current: 0,
          total: 0,
          percentage: 0,
        });

        const scrapedProducts = await scrapeStoreProducts(storeUrl);

        if (!scrapedProducts || scrapedProducts.length === 0) {
          sendSSE(controller, {
            type: "error",
            message: "No products found from the provided store URL",
            msgT: "not_found",
          });
          controller.close();
          return;
        }

        const totalProducts = scrapedProducts.length;
        sendSSE(controller, {
          type: "progress",
          message: `Found ${totalProducts} products...`,
          current: 0,
          msgT: "products_found",
          total: totalProducts,
          percentage: 0,
        });

        sendSSE(controller, {
          type: "progress",
          message: `Processing store...`,
          current: 0,
          msgT: "process_store",
          total: totalProducts,
          percentage: 0,
        });

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
          sendSSE(controller, {
            type: "progress",
            message: `Using existing store: ${store.name}`,
            current: 0,
            msgT: "existing_store",
            total: totalProducts,
            percentage: 0,
          });
        } else {
          sendSSE(controller, {
            type: "progress",
            message: `Creating new store`,
            msgT: "create_store",
            total: totalProducts,
          });

          const { data: newStore, error: storeCreateError } = await supabase
            .from("stores")
            .insert([
              {
                external_store_id: externalStoreId,
                name: extractedStoreName,
                created_at: new Date().toISOString(),
              },
            ])
            .select()
            .single();

          if (storeCreateError) throw storeCreateError;
          store = newStore;
          sendSSE(controller, {
            type: "progress",
            message: `Created new store: ${store.name}`,
            msgT: "store_created",
            total: totalProducts,
          });
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
          // const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
          // const totalBatches = Math.ceil(scrapedProducts.length / BATCH_SIZE);

          // sendSSE(controller, {
          //   type: "progress",
          //   message: `Processing batch ${batchNumber}/${totalBatches} (${batch.length} products)...`,
          //   current: i,
          //   msgT: "process_product",
          //   total: totalProducts,
          //   percentage: Math.round((i / totalProducts) * 100),
          // });

          const batchResult = await processBatch(batch, store.id);

          results.productsProcessed += batchResult.productsProcessed;
          results.pricesRecorded += batchResult.pricesRecorded;
          results.errors.push(...batchResult.errors);

          const current = Math.min(i + BATCH_SIZE, totalProducts);
          sendSSE(controller, {
            type: "progress",
            message: `Completed ${current}/${totalProducts} products`,
            current: current,
            msgT: "completion_status",
            total: totalProducts,
            percentage: Math.round((current / totalProducts) * 100),
          });

          // Small delay to prevent overwhelming the database
          if (i + BATCH_SIZE < scrapedProducts.length) {
            await new Promise((resolve) => setTimeout(resolve, 100));
          }
        }
        sendSSE(controller, {
          type: "progress",
          message: `Completed ${totalProducts}/${totalProducts} products`,
          current: totalProducts,
          msgT: "completion_status",
          total: totalProducts,
          percentage: 100,
        });

        // Step 4: Send completion event
        sendSSE(controller, {
          type: "complete",
          message: "All products processed successfully!",
          current: totalProducts,
          total: totalProducts,
          percentage: 100,
          msgT: "completed_all",
          data: {
            storeId: store.id,
            externalStoreId: store.external_store_id,
            storeName: store.name,
            isNewStore: !existingStore,
            productsProcessed: results.productsProcessed,
            pricesRecorded: results.pricesRecorded,
            errors: results.errors,
          },
        });

        controller.close();
      } catch (error) {
        console.error("Error in scrape-products route:", error);
        sendSSE(controller, {
          type: "error",
          msgT: "error",
          message:
            error instanceof Error ? error.message : "Unknown error occurred",
        });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
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
        }`
      );
    }
  }

  // Batch upsert all products (insert or update in one operation)
  if (productsToUpsert.length > 0) {
    const { data: upsertedProducts, error: upsertError } = await supabase
      .from("products")
      .upsert(productsToUpsert, {
        onConflict: "external_product_id",
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
            `Price history batch error: ${historyError.message}`
          );
        } else if (insertedHistory) {
          results.pricesRecorded += insertedHistory.length;
        }
      }
    }
  }

  return results;
}
