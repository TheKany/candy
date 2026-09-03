export const clampResultPage = (index: number, pageCount: number) =>
  Math.min(Math.max(index, 0), Math.max(pageCount - 1, 0));

export const getNavigationButtonTarget = (
  currentPage: number,
  direction: "previous" | "next",
  pageCount: number,
) => clampResultPage(currentPage + (direction === "next" ? 1 : -1), pageCount);
