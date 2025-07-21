import { RADIUS, CENTER } from "@/constants/tarot";

// 랜덤한 카드 위치 및 회전 생성 함수
export const handleCardShufflePosition = (length: number) => {
  return Array.from({ length }).map(() => {
    // 0~360도 범위의 각도
    const angle = Math.random() * 360;
    // RADIUS ± 20 범위의 거리
    const minRadius = RADIUS - 100;
    const maxRadius = RADIUS + 100;
    const distance = Math.random() * (maxRadius - minRadius) + minRadius;
    // 중심 기준 좌표 계산
    const x = CENTER + distance * Math.cos((angle * Math.PI) / 180);
    const y = CENTER + distance * Math.sin((angle * Math.PI) / 180);
    // 카드 자체의 회전 (±180도)
    const rotate = Math.random() * 360 - 180;
    return { top: `${y}px`, left: `${x}px`, rotate };
  });
};
