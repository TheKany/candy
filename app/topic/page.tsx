import TopicSelection from "@/components/topic/TopicSelection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "타로 주제 선택 | 타로타르트",
  description: "지금 가장 마음에 걸리는 고민 주제를 하나 골라보세요.",
};

export default function TopicPage() {
  return <TopicSelection />;
}
