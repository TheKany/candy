import { supabase } from "@/lib/supabaseClient";

export const handleUserFeedback = async (feedback: string) => {
  if (!feedback.trim()) return null;

  const sessionId = localStorage.getItem("session_id");
  if (!sessionId) return new Error("sessionId 없음");

  const { error } = await supabase.from("tarot_feedbacks").insert({
    session_id: sessionId,
    content: feedback,
  });

  return error ?? "ok";
};
