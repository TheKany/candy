import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

export async function POST() {
  try {
    const supabaseServer = getSupabaseServer();
    if (!supabaseServer) {
      return NextResponse.json(
        { error: "Supabase가 설정되지 않았습니다." },
        { status: 503 }
      );
    }

    const { data, error } = await supabaseServer
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
