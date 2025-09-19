import { supabase } from "@/lib/supabaseClient";
import { v4 as uuidv4 } from "uuid";

export const handleUserFeedback = async (feedback: string) => {
  if (!feedback.trim()) return null;

  let sessionId = localStorage.getItem("session_id");

  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem("session_id", sessionId);
  }

  const { error } = await supabase.from("tarot_feedbacks").insert({
    session_id: sessionId,
    content: feedback,
  });

  return error ?? "ok";
};
