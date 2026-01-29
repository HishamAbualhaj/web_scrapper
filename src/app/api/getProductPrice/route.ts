import { supabase } from "@/supabase";
import { ProductAnalytics } from "@/types/api/response";
import { NextRequest, NextResponse } from "next/server";

interface PriceHistoryRecord {
  id: string;
  product_id: string;
  price: number;
  discount: number | null;
  recorded_at: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId } = body;

    // Validate productId
    if (!productId) {
      return NextResponse.json(
        { error: "productId is required" },
        { status: 400 },
      );
    }

    // Fetch product details
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("product_id, title")
      .eq("product_id", productId)
      .single();

    if (productError) {
      console.error("Product fetch error:", productError);
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Fetch price history from the view/table
    const { data: priceHistory, error: priceError } = await supabase
      .from("product_price_history")
      .select("id, product_id, price, discount, recorded_at")
      .eq("product_id", productId)
      .order("recorded_at", { ascending: true });

    if (priceError) {
      console.error("Price history fetch error:", priceError);
      throw priceError;
    }

    // If no price history found, return empty prices array
    if (!priceHistory || priceHistory.length === 0) {
      return NextResponse.json([
        {
          id: productId,
          product_id: productId,
          title: product.title || "",
          prices: [],
        },
      ]);
    }

    // Transform the data into the required structure
    const transformedData: ProductAnalytics = {
      id: priceHistory[0].id, // Use the first record's id as the main id
      product_id: productId,
      title: product.title || "",
      prices: priceHistory.map((record: PriceHistoryRecord) => ({
        date: new Date(record.recorded_at).toISOString().split("T")[0], // Format: YYYY-MM-DD
        price: Number(record.price),
      })),
    };
    return NextResponse.json(transformedData);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch product price history",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
