import { supabase } from "@/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limitParam = Number(searchParams.get("limit"));

    const { store_id } = await req.json();

    if (!store_id) {
      return NextResponse.json(
        { error: "store_id is required" },
        { status: 400 },
      );
    }

    let query = supabase
      .from("products")
      .select("product_id, store_id, title,external_product_id")
      .eq("store_id", store_id)
      .order("created_at", { ascending: false });

    if (limitParam) {
      const limit = Number(limitParam);
      if (!Number.isNaN(limit)) {
        query = query.limit(limit);
      }
    }

    const { data: products, error } = await query;

    if (error) {
      console.error("SUPABASE ERROR:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
