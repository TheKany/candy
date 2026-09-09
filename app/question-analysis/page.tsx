import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "질문 분석 | 타로타르트",
  description: "질문에 담긴 고민을 정리하고 확인해보세요.",
};

export default function QuestionAnalysisPage() {
  redirect("/topic");
}
