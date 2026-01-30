import { supabase } from "@/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Extract query parameters
    const storeParam = searchParams.get("store");
    const title = searchParams.get("name") || null;
    const badge = searchParams.get("badge") || null;
    const discount = searchParams.get("discount") || null;
    const minPrice = searchParams.get("min")
      ? parseFloat(searchParams.get("min")!)
      : null;
    const maxPrice = searchParams.get("max")
      ? parseFloat(searchParams.get("max")!)
      : null;
    const stock = searchParams.get("stock")
      ? parseInt(searchParams.get("stock")!)
      : null;
    const page = searchParams.get("page")
      ? parseInt(searchParams.get("page")!)
      : 1;
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!)
      : 10;

    // Calculate pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Build query
    let query = supabase.from("products").select("*", { count: "exact" });

    // Apply store_id filter ONLY if store parameter is provided
    if (storeParam) {
      if (storeParam === "noStore") {
        // Fetch products with no store (null store_id)
        query = query.is("store_id", null);
      } else {
        // Fetch products for specific store
        query = query.eq("store_id", storeParam);
      }
    }
    // If no store parameter, fetch ALL products (no filter applied)

    // Apply title filter
    if (title) {
      query = query.ilike("title", `%${title}%`);
    }

    // Apply badge filter - convert 'best' to Arabic
    if (badge === "best") {
      query = query.eq("badge", "أفضل المنتجات");
    } else if (badge) {
      query = query.eq("badge", badge);
    }

    // Apply discount filter
    if (discount === "with") {
      // Products with discount (not null and greater than 0)
      query = query.not("discount", "is", null).gt("discount", 0);
    } else if (discount === "without") {
      // Products without discount (null or 0)
      query = query.or("discount.is.null,discount.eq.0");
    }

    // Apply price filters
    if (minPrice !== null) {
      query = query.gte("price", minPrice);
    }

    if (maxPrice !== null) {
      query = query.lte("price", maxPrice);
    }

    // Apply stock filter
    if (stock !== null) {
      // Match pattern like "باقي 1 وحدات في المخزون" or "باقي X وحدات في المخزون"
      query = query.ilike("stock_info", `%باقي ${stock} وحدات في المخزون%`);
    }

    // Apply pagination
    query = query.range(from, to);

    // Execute query
    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json(
        {
          message: error.message || "Failed to fetch products",
          status: 500,
          errors: error,
        },
        { status: 500 },
      );
    }

    // Extract stock numbers from stock_info for response
    const productsWithStock = data?.map((product) => {
      let stockNumber = null;
      if (product.stock_info) {
        // Extract number from "باقي X وحدات في المخزون"
        const match = product.stock_info.match(/باقي (\d+) وحدات في المخزون/);
        if (match && match[1]) {
          stockNumber = parseInt(match[1]);
        }
      }
      return {
        ...product,
        extracted_stock: stockNumber,
      };
    });

    return NextResponse.json(
      {
        status: "success",
        data: productsWithStock || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        message: error?.message || "Request failed",
        status: 500,
        errors: error,
      },
      { status: 500 },
    );
  }
}
