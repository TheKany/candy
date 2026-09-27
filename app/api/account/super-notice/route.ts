import { requireAccount, accountReply, accountFailure } from "@/lib/auth/member";
import { assertSameOrigin, AccountRequestError } from "@/util/validateSavedConsultation";
export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const { client, account } = await requireAccount();
    if (account.role !== "super") throw new AccountRequestError("이용 권한이 없어요.", 403);
    const { error } = await client.rpc("acknowledge_super_notice");
    if (error) throw new Error("NOTICE_FAILED");
    return accountReply({ acknowledged: true });
  } catch (error) { return accountFailure(error); }
}
