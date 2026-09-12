// Keep movement durations and page timers on the same shuffle tempo.
export const SHUFFLE_TIME_SCALE = 0.8;

export type OrganicOrbitMotion = {
  axisX: number;
  axisY: number;
  speedScale: number;
  delayMs: number;
};

export const getOrganicOrbitMotion = (
  cardIndex: number,
  center: number
): OrganicOrbitMotion => {
  const angle = cardIndex * 2.399963;

  return {
    axisX: center + Math.sin(angle) * 12,
    axisY: center + Math.cos(angle * 0.83) * 10,
    speedScale: 0.9 + ((cardIndex * 37) % 21) / 100,
    delayMs: ((cardIndex * 29) % 101) * SHUFFLE_TIME_SCALE,
  };
};

export const getOrbitAnimationTiming = (
  motion: OrganicOrbitMotion,
  phaseDurationMs: number
) => {
  const delayMs = Math.round(motion.delayMs * motion.speedScale);

  return {
    durationMs: phaseDurationMs - delayMs,
    delayMs,
    easing: "linear" as const,
  };
};
