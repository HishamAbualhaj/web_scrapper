import { NextRequest, NextResponse } from "next/server";
import scrapeSingleProduct from "@/lib/scrapers/scrapeSingleProduct";
import { supabase } from "@/supabase";
import { parseNumericValue } from "@/utils/parseNumericValue";

export async function POST(req: NextRequest) {
  try {
    const { productId } = await req.json();
    const product = await scrapeSingleProduct(productId);

    if (!product) {
      return NextResponse.json(
        { success: false, message: "No Product Found", data: [] },
        { status: 200 }
      );
    }

    const price = parseNumericValue(product.price);
    const originalPrice = parseNumericValue(product.oldPrice);
    const discountValue = parseNumericValue(product.discount);

    const productFound = await checkFoundProduct(productId);

    if (productFound) {
      return NextResponse.json(
        { success: false, message: "Product already there", data: [] },
        { status: 200 }
      );
    }

    const { data: productData, error: productError } = await supabase
      .from("products")
      .upsert(
        {
          external_product_id: product.productId,
          store_id: null,
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
          badge: null,
          stock_info: null,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "external_product_id",
          ignoreDuplicates: false,
        }
      )
      .select()
      .single();

    return NextResponse.json(
      {
        success: true,
        product_id_uui: productData.product_id,
        productId: product.productId,
        productTitle: product.title,
        error: productError,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in scrape-single-product route:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

async function checkFoundProduct(product_id: string): Promise<boolean> {
  const { data: existingProduct, error: productCheckError } = await supabase
    .from("products")
    .select("product_id, title")
    .eq("external_product_id", product_id)
    .single();

  if (productCheckError && productCheckError.code !== "PGRST116") {
    throw productCheckError;
  }

  return existingProduct ? true : false;
}
