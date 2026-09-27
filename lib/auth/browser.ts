"use client";
import { createBrowserClient } from "@supabase/ssr";

export function createAuthBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("로그인 연결을 준비하고 있어요.");
  return createBrowserClient(url, key);
}
