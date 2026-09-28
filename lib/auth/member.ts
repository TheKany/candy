import "server-only";
import { NextResponse } from "next/server";
import { createAuthServerClient } from "./server";
import { AccountRequestError } from "@/util/validateSavedConsultation";
export type Account = { id: string; role: "member" | "super"; superNoticeAcknowledged: boolean; isAdmin: boolean; roleVersion: number | null };
export async function requireAccount() {
  const client = await createAuthServerClient();
  const { data: { user }, error: authError } = await client.auth.getUser();
  if (authError || !user) throw new AccountRequestError("로그인이 필요해요.", 401);
  const { data, error } = await client.from("member_accounts").select("*").eq("user_id", user.id).single();
  if (error || !data || !["member", "super"].includes(data.role)) throw new AccountRequestError("회원 정보를 불러오지 못했어요. 잠시 후 다시 시도해주세요.", 503);
  // Old databases remain usable while the administrator migration is pending.
  const migrated = Number.isInteger(data.role_version);
  const admin = migrated ? await client.rpc("is_member_admin") : null;
  return { client, account: { id: user.id, role: data.role, superNoticeAcknowledged: !!data.super_notice_ack_at,
    isAdmin: admin?.error ? false : admin?.data === true, roleVersion: migrated ? data.role_version : null } as Account };
}
export function accountReply(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "private, no-store", "Vary": "Cookie", "X-Content-Type-Options": "nosniff" } });
}
export function accountFailure(error: unknown) {
  return error instanceof AccountRequestError ? accountReply({ error: error.message }, error.status) : accountReply({ error: "요청을 처리하지 못했어요. 잠시 후 다시 시도해주세요." }, 503);
}
