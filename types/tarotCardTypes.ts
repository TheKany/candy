export const categoryKeywords = [
  "career",
  "finance",
  "fortune",
  "health",
  "love",
  "path",
  "relationship",
  "self",
] as const;

export type CategoryKeyword = (typeof categoryKeywords)[number];

export interface CategoryList {
  keyword: CategoryKeyword;
}

export interface TarotCardsData {
  cardNo: number;
  name: string;
  nickname: string;

  score: Record<CategoryKeyword, number>;

  keyword: Record<CategoryKeyword, string[]>;

  message: Record<CategoryKeyword, string>;

  type: "major" | "minor";
}
