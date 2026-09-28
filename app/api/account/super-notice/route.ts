import { requireAccount, accountReply, accountFailure } from "@/lib/auth/member";
import { assertSameOrigin, AccountRequestError, readLimitedJson } from "@/util/validateSavedConsultation";
import { parseRoleVersion } from "@/util/adminInput";
export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const { client, account } = await requireAccount();
    if (account.role !== "super") throw new AccountRequestError("이용 권한이 없어요.", 403);
    const body = await readLimitedJson(request);
    let roleVersion;
    try { roleVersion = parseRoleVersion(body); } catch { throw new AccountRequestError("안내를 다시 열고 확인해주세요."); }
    const { error } = await client.rpc("acknowledge_super_notice", { p_role_version: roleVersion });
    if (error?.code === "40001") throw new AccountRequestError("등급이 변경됐어요. 새 안내를 확인해주세요.", 409);
    if (error) throw new Error("NOTICE_FAILED");
    return accountReply({ acknowledged: true });
  } catch (error) { return accountFailure(error); }
}
