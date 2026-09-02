import { getSupabaseClient } from "@/lib/supabaseClient";
import { v4 as uuidv4 } from "uuid";

const getSessionId = () => {
  let sessionId = localStorage.getItem("session_id");
  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem("session_id", sessionId);
  }
  return sessionId;
};

export const handleCountUsers = async (page: string) => {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  await supabase.from("tarot_count_logs").insert({
    session_id: getSessionId(),
  });
};

export const getTotalUsers = async () => {
  const supabase = getSupabaseClient();
  if (!supabase) return 0;

  const { count } = await supabase
    .from("tarot_count_logs")
    .select("id", { count: "exact", head: true });

  return count ?? 0;
};
