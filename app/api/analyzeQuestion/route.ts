import { NextResponse } from "next/server";

// Retired: old clients must not spend an extra Gemini request on classification.
export async function POST() {
  return NextResponse.json(
    { error: "질문 분석 단계가 없어졌어요. 질문 입력 화면에서 바로 카드를 뽑아주세요." },
    { status: 410, headers: { "Cache-Control": "no-store" } },
  );
}
