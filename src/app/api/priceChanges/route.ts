import { supabase } from "@/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit = Math.min(
      100,
      Math.max(1, Number(searchParams.get("limit") ?? 10)),
    );
    const store_id = searchParams.get("store_id") ?? null;

    // Call the existing RPC function
    const { data, error } = await supabase.rpc("get_top_price_changes");

    if (error) {
      console.error("[price-changes] supabase rpc error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Filter by store if provided
    const filtered = store_id
      ? (data ?? []).filter((row: any) => row.store_id === store_id)
      : (data ?? []);

    // Build unique stores list for the dropdown
    const storeMap = new Map<string, string>();
    (data ?? []).forEach((row: any) => {
      if (!storeMap.has(row.store_id))
        storeMap.set(row.store_id, row.store_name);
    });
    const stores = Array.from(storeMap.entries()).map(([id, name]) => ({
      id,
      name,
    }));

    // Paginate in-memory (RPC returns all rows)
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * limit;
    const paginated = filtered.slice(start, start + limit);

    return NextResponse.json({
      data: paginated,
      stores,
      pagination: {
        page: safePage,
        limit,
        total,
        totalPages,
      },
    });
  } catch (err) {
    console.error("[price-changes] unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
