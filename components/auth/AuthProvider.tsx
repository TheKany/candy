"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createAuthBrowserClient } from "@/lib/auth/browser";
import { handleResetStore } from "@/util/handleResetStore";
import type { Account } from "@/lib/auth/member";
type AuthValue = {
  status: "loading" | "guest" | "member" | "super" | "error";
  account: Account | null; error: string;
  signIn: () => Promise<void>; signOut: () => Promise<void>; refreshAccount: () => Promise<boolean>;
};
const AuthContext = createContext<AuthValue | null>(null);
export function useAuth() { const value = useContext(AuthContext); if (!value) throw new Error("AuthProvider missing"); return value; }
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = useState<AuthValue["status"]>("loading");
  const [account, setAccount] = useState<Account | null>(null);
  const [error, setError] = useState("");
  const [generation, setGeneration] = useState(0);
  const identity = useRef<string | undefined>(undefined);
  const requestSequence = useRef(0);
  const refreshAccount = useCallback(async () => {
    const sequence = ++requestSequence.current;
    try {
      const response = await fetch("/api/account", { cache: "no-store" });
      if (sequence !== requestSequence.current) return false;
      if (!response.ok && response.status !== 401) throw new Error("회원 연결을 확인하지 못했어요. 다시 시도해주세요.");
      const next: Account | null = response.status === 401 ? null : await response.json();
      if (sequence !== requestSequence.current) return false;
      const key = next ? `${next.id}:${next.role}` : "guest";
      if (identity.current !== undefined && identity.current !== key) {
        handleResetStore(); setGeneration(value => value + 1);
      }
      identity.current = key; setAccount(next); setStatus(next?.role ?? "guest"); setError("");
      return true;
    } catch {
      if (sequence === requestSequence.current) { setAccount(null); setStatus("error"); setError("회원 연결을 확인하지 못했어요. 다시 시도해주세요."); }
      return false;
    }
  }, []);
  useEffect(() => {
    // Clear the old question-only cache left by versions before membership.
    try { sessionStorage.removeItem("tarot-question"); } catch { /* Storage can be disabled. */ }
    void refreshAccount();
    let timer: ReturnType<typeof setTimeout>;
    try {
      const client = createAuthBrowserClient();
      const { data: { subscription } } = client.auth.onAuthStateChange(() => { clearTimeout(timer); timer = setTimeout(() => { void refreshAccount(); }, 0); });
      const onFocus = () => { void refreshAccount(); };
      window.addEventListener("focus", onFocus);
      return () => { ++requestSequence.current; clearTimeout(timer); subscription.unsubscribe(); window.removeEventListener("focus", onFocus); };
    } catch { setStatus("error"); setError("로그인 연결을 준비하고 있어요."); }
  }, [refreshAccount]);
  const signIn = async () => {
    setError("");
    try {
      // `scopes` appends to Supabase's Kakao defaults (email/photo); override the provider scope instead.
      const { error } = await createAuthBrowserClient().auth.signInWithOAuth({ provider: "kakao", options: { redirectTo: `${window.location.origin}/auth/callback`, queryParams: { scope: "profile_nickname" } } });
      if (error) throw error;
    } catch { setError("카카오 로그인을 시작하지 못했어요. 다시 시도해주세요."); }
  };
  const signOut = async () => {
    try {
      const { error } = await createAuthBrowserClient().auth.signOut({ scope: "local" });
      if (error) throw error;
      ++requestSequence.current; handleResetStore(); setGeneration(value => value + 1);
      identity.current = "guest"; setAccount(null); setStatus("guest"); setError(""); router.replace("/"); router.refresh();
    } catch { setError("로그아웃하지 못했어요. 다시 시도해주세요."); }
  };
  return <AuthContext.Provider value={{ status, account, error, signIn, signOut, refreshAccount }}><div key={generation} style={{ display: "contents" }}>{children}</div></AuthContext.Provider>;
}
