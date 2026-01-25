import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/supabase";

import { parseNumericValue } from "@/utils/parseNumericValue";
import { scrapeSingleProduct } from "@/lib/scrapers/scrapeSingleProduct";

export async function POST(req: NextRequest) {
  try {
    const { productId, store_id } = await req.json();

    // Scrape product
    const product = await scrapeSingleProduct(productId);

    if (!product) {
      return NextResponse.json(
        { success: false, message: "No Product Found", data: [] },
        { status: 200 },
      );
    }

    // Parse numeric fields
    const price = parseNumericValue(product.price);
    const originalPrice = parseNumericValue(product.oldPrice);
    const discountValue = parseNumericValue(product.discount);
    const reviewCount =
      parseInt(product.reviewCount?.replace(/[^\d]/g, "")) || 0;

    // Check if product already exists
    const productFound = await checkFoundProduct(productId);
    if (productFound) {
      return NextResponse.json(
        { success: false, message: "Product already exists", data: [] },
        { status: 200 },
      );
    }

    // Upsert product
    const { data: upsertedProduct, error: upsertError } = await supabase
      .from("products")
      .upsert(
        {
          external_product_id: product.productId,
          store_id: store_id && store_id.trim() !== "" ? store_id : null,
          title: product.title,
          price: price,
          original_price: originalPrice,
          discount: discountValue,
          rating: product.rating || null,
          review_count: reviewCount,
          images: product.images ?? [],
          nudges: product.nudges ?? [],
          product_url: product.productUrl,
          badge: null,
          stock_info: null,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "external_product_id",
          ignoreDuplicates: false,
        },
      )
      .select("product_id, price, discount")
      .single();

    const results = {
      productsProcessed: 0,
      pricesRecorded: 0,
      errors: [] as string[],
    };

    if (upsertError) {
      results.errors.push(`Upsert error: ${upsertError.message}`);
    } else if (upsertedProduct) {
      results.productsProcessed += 1;

      // Check latest price history
      const { data: latestPrice } = await supabase
        .from("product_price_history")
        .select("price, discount")
        .eq("product_id", upsertedProduct.product_id)
        .order("recorded_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const priceChanged =
        !latestPrice ||
        latestPrice.price !== upsertedProduct.price ||
        latestPrice.discount !== upsertedProduct.discount;

      if (priceChanged) {
        const { data: insertedHistory, error: historyError } = await supabase
          .from("product_price_history")
          .insert({
            product_id: upsertedProduct.product_id,
            price: upsertedProduct.price,
            discount: upsertedProduct.discount,
            recorded_at: new Date().toISOString(),
          })
          .select("id")
          .single();

        if (historyError) {
          results.errors.push(`Price history error: ${historyError.message}`);
        } else if (insertedHistory) {
          results.pricesRecorded += 1;
        }
      }
    }

    return NextResponse.json(
      {
        success: true,
        product_id: upsertedProduct?.product_id,
        productId: product.productId,
        productTitle: product.title,
        results,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error in scrape-single-product route:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// Helper to check if product exists
async function checkFoundProduct(product_id: string): Promise<boolean> {
  const { data: existingProduct, error } = await supabase
    .from("products")
    .select("product_id")
    .eq("external_product_id", product_id)
    .single();

  if (error && error.code !== "PGRST116") {
    throw error;
  }

  return !!existingProduct;
}
