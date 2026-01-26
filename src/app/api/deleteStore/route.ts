import { supabase } from "@/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { store_id } = await req.json();

    if (!store_id) {
      return NextResponse.json(
        { error: "store_id is required" },
        { status: 400 },
      );
    }

    const { error } = await supabase.from("stores").delete().eq("id", store_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
