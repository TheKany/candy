import ReadingSelect from "@/components/home/ReadingSelect";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "타로 유형 선택 | 타로타르트",
  description: "지금 마음에 가장 가까운 타로 리딩을 골라보세요.",
};

export default function SelectPage() {
  return <ReadingSelect />;
}
