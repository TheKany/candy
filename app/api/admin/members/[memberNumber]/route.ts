import { requireAdmin, adminRpcError } from "@/lib/auth/admin";
import { accountReply, accountFailure } from "@/lib/auth/member";
import { AccountRequestError, assertSameOrigin, readLimitedJson } from "@/util/validateSavedConsultation";
import { parseMemberRole, validMemberNumber } from "@/util/adminInput";
type Context = { params: Promise<{ memberNumber: string }> };
async function numberFrom(context: Context) {
  const { memberNumber } = await context.params;
  if (!validMemberNumber(memberNumber)) throw new AccountRequestError("회원을 찾을 수 없어요.", 404);
  return memberNumber;
}
export async function GET(_request: Request, context: Context) {
  try {
    const { client } = await requireAdmin();
    const { data, error } = await client.rpc("admin_member_detail", { p_member_number: await numberFrom(context) });
    if (error) adminRpcError(error);
    return accountReply(data);
  } catch (error) { return accountFailure(error); }
}
export async function PATCH(request: Request, context: Context) {
  try {
    assertSameOrigin(request);
    const { client } = await requireAdmin();
    const memberNumber = await numberFrom(context);
    const body = await readLimitedJson(request);
    let role;
    try { role = parseMemberRole(body); } catch { throw new AccountRequestError("변경할 등급을 확인해주세요."); }
    const { error } = await client.rpc("admin_set_member_role", { p_member_number: memberNumber, p_role: role });
    if (error) adminRpcError(error);
    return accountReply({ updated: true });
  } catch (error) { return accountFailure(error); }
}
