import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

const getClient = () => {
  const client = getSupabaseServer();
  if (!client) {
    return NextResponse.json(
      { error: "Supabase가 설정되지 않았습니다." },
      { status: 503 },
    );
  }

  return client;
};

export async function GET() {
  const supabaseServer = getClient();
  if (supabaseServer instanceof NextResponse) return supabaseServer;

  const { count, error } = await supabaseServer
    .from("tarot_count_logs")
    .select("id", { count: "exact", head: true });

  if (error) {
    console.error("Tarot count query failed:", error);
    return NextResponse.json({ error: "집계 정보를 불러오지 못했습니다." }, { status: 500 });
  }

  return NextResponse.json({ count: count ?? 0 });
}

export async function POST() {
  try {
    const supabaseServer = getClient();
    if (supabaseServer instanceof NextResponse) return supabaseServer;

    const { error } = await supabaseServer
      .from("tarot_count_logs")
      .insert({ reached_at: new Date().toISOString() });

    if (error) throw error;

    return NextResponse.json({ recorded: true });
  } catch (error) {
    console.error("Tarot count insert failed:", error);
    return NextResponse.json({ error: "결과 도달을 기록하지 못했습니다." }, { status: 500 });
  }
}
