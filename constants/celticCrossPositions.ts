import type { TarotOrientation } from "@/types/tarotReadingTypes";

export const CELTIC_CROSS_POSITIONS = [
  { id: "present", label: "현재 상황", description: "질문의 중심과 지금 작동하는 핵심 에너지" },
  { id: "obstacle", label: "장애물", description: "현재 상황을 가로막거나 밀어붙이는 영향" },
  { id: "root", label: "내면의 원인", description: "무의식과 아직 드러나지 않은 원인" },
  { id: "goal", label: "의식적인 바람", description: "알고 있는 목표와 기대" },
  { id: "past", label: "지나간 영향", description: "현재에 남아 있는 과거의 영향" },
  { id: "near-future", label: "다가오는 흐름", description: "가까운 시기의 변화와 전개" },
  { id: "self", label: "나의 태도", description: "상황을 대하는 자세와 선택 방식" },
  { id: "environment", label: "주변 환경", description: "상대와 외부 조건의 영향" },
  { id: "hopes-fears", label: "희망과 두려움", description: "기대와 불안이 만드는 긴장" },
  { id: "outcome", label: "최종 흐름", description: "현재 선택이 이어질 때의 가능성" },
] as const;

export type CelticCrossPosition = (typeof CELTIC_CROSS_POSITIONS)[number];

export const getCelticCrossPosition = (index: number): CelticCrossPosition | null =>
  CELTIC_CROSS_POSITIONS[index] ?? null;

export const getRandomOrientation = (
  random: () => number = Math.random,
): TarotOrientation => random() < 0.5 ? "upright" : "reversed";
