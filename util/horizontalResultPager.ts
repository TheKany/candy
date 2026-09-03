export const clampResultPage = (index: number, pageCount: number) =>
  Math.min(Math.max(index, 0), Math.max(pageCount - 1, 0));

export const getSwipeTargetPage = (
  currentPage: number,
  startX: number,
  endX: number,
  pageCount: number,
) => {
  const distance = startX - endX;
  if (Math.abs(distance) < 40) return currentPage;
  return clampResultPage(currentPage + (distance > 0 ? 1 : -1), pageCount);
};
