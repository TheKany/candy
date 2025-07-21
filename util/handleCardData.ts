import { supabase } from "@/lib/supabaseClient";
import { CategoryKeyword } from "@/types/tarotCardTypes";

// 카드 갯수
export const handleCardCount = async (): Promise<number> => {
  const { count, error } = await supabase
    .from("card_data")
    .select("*", { count: "exact", head: true });

  if (error) {
    console.error("Count Error:", error);
    return 0;
  }

  return count ?? 0;
};

// 멘트
type Props = {
  id: number;
  keyword?: CategoryKeyword;
};

type CardBasicInfo = {
  id: number;
  name: string;
  nickname: string;
  coreKeyword: string[];
  type: "major" | "minor";
};

export const handleCardBasicInfo = async ({
  id,
}: Props): Promise<CardBasicInfo[]> => {
  const { data, error } = await supabase
    .from("card_data")
    .select("*")
    .eq("id", id);

  if (error || !data) {
    console.error("Count Error:", error);
    return [];
  }

  return data;
};

// 멘트1: 고민 멘트
export const handleCardWorryData = async ({ id, keyword }: Props) => {
  const { data, error } = await supabase
    .from("tarot_worry")
    .select("solution")
    .eq("card_id", id)
    .eq("category", keyword);

  if (error) {
    console.error("고민 멘트 Error:", error);
    return null;
  }

  return data;
};

// 멘트2: 감정 멘트
export const handleCardEmoData = async ({ id, keyword }: Props) => {
  const { data, error } = await supabase
    .from("tarot_emotion")
    .select("solution")
    .eq("card_id", id)
    .eq("category", keyword);

  if (error) {
    console.error("감정 멘트 Error:", error);
    return null;
  }

  return data;
};

// 멘트3: 흐름 멘트
export const handleCardFlowData = async ({ id, keyword }: Props) => {
  const { data, error } = await supabase
    .from("tarot_flow")
    .select("solution")
    .eq("card_id", id)
    .eq("category", keyword);

  if (error) {
    console.error("흐름 멘트 Error:", error);
    return null;
  }

  return data;
};
