import QuestionEntry from "@/components/topic/QuestionEntry";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "나의 질문 | 타로타르트",
  description: "마음에 걸리는 질문을 적고 고민을 정리해보세요.",
};

export default function TopicPage() {
  return <QuestionEntry />;
}
