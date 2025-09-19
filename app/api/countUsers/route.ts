import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST() {
  try {
    const { data, error } = await supabase
      .from("tarot_count_logs")
      .insert({ used_at: new Date().toISOString() });

    if (error) {
      throw error;
    }

    return NextResponse.json({ message: "Log successful", data });
  } catch (error) {
    console.error("Supabase Error:", error);
    return NextResponse.json({ error: "서버 에러" }, { status: 500 });
  }
}
