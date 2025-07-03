import { supabase } from "@/lib/supabaseClient"

export const handlePickCard = async (cardNo: number[]) => {
  const { data, error } = await supabase
    .from("tarot_cards")
    .select("*")
    .in("cardNo", cardNo);

  if (error) {
    console.error("error: ", error);
    return [];
  }

  if (!data) return [];

  const ordered = cardNo.map(no => data.find(card => card.cardNo === no));

  return ordered;
};



export const handleCardCount = async (): Promise<number> => {
  const { count, error } = await supabase
    .from("tarot_cards")
    .select("*", { count: "exact", head: true });

  if (error) {
    console.error("Count Error:", error);
    return 0;
  }

  return count ?? 0;
};
