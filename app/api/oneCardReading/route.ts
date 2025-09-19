// 한 장 타로

import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("ids");

    if (!id) {
      return NextResponse.json(
        { error: "카드 정보가 없습니다." },
        { status: 400 }
      );
    }

    const cardId = id.split(",").map((id) => parseInt(id, 10));

    const { data, error } = await supabase
      .from("one_card_readings")
      .select("*")
      .in("card_id", cardId);

    if (error) {
      console.error("Supabase query error:", error);
      return NextResponse.json(
        { error: "데이터 통신에 실패" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "카드를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Server error:", err);
    return NextResponse.json({ error: "서버 에러" }, { status: 500 });
  }
}
