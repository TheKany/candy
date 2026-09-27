import { NextResponse } from "next/server";
import { createAuthServerClient } from "@/lib/auth/server";
import { safeAuthReturnPath } from "@/lib/auth/redirect";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  let path = "/auth/error";
  if (code) {
    try {
      const client = await createAuthServerClient();
      const { error } = await client.auth.exchangeCodeForSession(code);
      if (!error) path = safeAuthReturnPath(url.searchParams.get("next"));
    } catch { /* Never log OAuth credentials or callback URL. */ }
  }
  const response = NextResponse.redirect(new URL(path, url.origin));
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}
