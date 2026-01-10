// app/api/scrape-products/route.ts

import { supabase } from "@/supabase";
import { NextRequest, NextResponse } from "next/server";
import scrapeStoreProducts from "@/lib/scrapers/scrapeStoreProducts";
import extractStoreData from "@/lib/helpers/extractStoreData";
import { parseNumericValue } from "@/utils/parseNumericValue";

// Helper function to clean numeric values

export async function POST(request: NextRequest) {
  try {
    let scrapedProducts: ProductDetails[] = [];
    const body = await request.json();
    const { storeUrl, storeName } = body;

    if (!storeUrl) {
      return NextResponse.json(
        { error: "storeUrl is required" },
        { status: 400 }
      );
    }

    // Step 1: Check if store exists or create it
    const [storeId, _] = extractStoreData(storeUrl, "");
    if (!storeId) {
      return NextResponse.json(
        { error: "storeId is not valid" },
        { status: 500 }
      );
    }
    const { data: existingStore, error: storeCheckError } = await supabase
      .from("stores")
      .select("id, name")
      .eq("external_store_id", storeId)
      .single();

    if (storeCheckError && storeCheckError.code !== "PGRST116") {
      throw storeCheckError;
    }

    let store;
    if (existingStore) {
      return NextResponse.json(
        {
          message: "Store already exists",
          storeId: existingStore.id,
          storeName: existingStore.name,
        },
        { status: 200 }
      );
    } else {
      // Step 2: Scrape products
      scrapedProducts = await scrapeStoreProducts(storeUrl);

      // Create new store
      const { data: newStore, error: storeCreateError } = await supabase
        .from("stores")
        .insert([
          {
            external_store_id: storeId,
            name: storeName || scrapedProducts[0].storeName,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (storeCreateError) throw storeCreateError;
      store = newStore;
    }

    // Step 3: Insert/Update products and record prices
    const results = await processProducts(scrapedProducts, store.id);

    return NextResponse.json({
      success: true,
      storeId: store.id,
      external_store_id: store.external_store_id,
      storeName: store.name,
      productsProcessed: results.productsProcessed,
      pricesRecorded: results.pricesRecorded,
      errors: results.errors,
    });
  } catch (error) {
    console.error("Error in scrape-products route:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

async function processProducts(products: ProductDetails[], storeId: string) {
  const results = {
    productsProcessed: 0,
    pricesRecorded: 0,
    errors: [] as string[],
  };

  for (const product of products) {
    try {
      // Parse numeric values
      const price = parseNumericValue(product.price);
      const originalPrice = parseNumericValue(product.originalPrice);
      const discountValue = parseNumericValue(product.discount);

      // Step 1: Upsert product
      const { data: productData, error: productError } = await supabase
        .from("products")
        .upsert(
          {
            external_product_id: product.productId,
            store_id: storeId,
            title: product.title,
            price: price,
            original_price: originalPrice,
            discount: discountValue,
            rating: product.rating || null,
            review_count:
              parseInt(product.reviewCount.replace(/[^\d]/g, "")) || 0,
            images: product.images,
            nudges: product.nudges,
            product_url: product.productUrl,
            badge: product.badge || null,
            stock_info: product.stockInfo || null,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "external_product_id",
            ignoreDuplicates: false,
          }
        )
        .select()
        .single();

      if (productError) {
        results.errors.push(
          `Product ${product.productId}: ${productError.message}`
        );
        continue;
      }

      results.productsProcessed++;

      // Step 2: Record price history
      const { error: priceHistoryError } = await supabase
        .from("product_price_history")
        .insert([
          {
            product_id: productData.product_id,
            price: price,
            discount: discountValue,
            recorded_at: new Date().toISOString(),
          },
        ]);

      if (priceHistoryError) {
        results.errors.push(
          `Price history ${product.productId}: ${priceHistoryError.message}`
        );
      } else {
        results.pricesRecorded++;
      }
    } catch (err) {
      results.errors.push(
        `Product ${product.productId}: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    }
  }

  return results;
}
