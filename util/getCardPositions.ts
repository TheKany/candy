export function getCardPositions(
  count: number,
  radius: number,
  center: number
) {
  return Array.from({ length: count }, () => {
    const angle = Math.random() * 360;
    const distance = radius + Math.random() * 30 - 15;
    const rotate = Math.random() * 360 - 180;

    const x = center + distance * Math.cos((angle * Math.PI) / 180);
    const y = center + distance * Math.sin((angle * Math.PI) / 180);

    return { top: y, left: x, rotate };
  });
}
