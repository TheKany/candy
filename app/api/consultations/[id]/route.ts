import { requireAccount, accountReply, accountFailure } from "@/lib/auth/member";
import { assertSameOrigin, uuidPattern, AccountRequestError } from "@/util/validateSavedConsultation";
type Context = { params: Promise<{ id: string }> };
async function lookup(context: Context) {
  const { id } = await context.params;
  if (!uuidPattern.test(id)) throw new AccountRequestError("기록을 찾을 수 없어요.", 404);
  const { client, account } = await requireAccount();
  return { id, client, account };
}
export async function GET(_request: Request, context: Context) {
  try {
    const { id, client, account } = await lookup(context);
    const { data, error } = await client.from("saved_consultations").select("id,readings,revision,created_at,updated_at").eq("id", id).eq("user_id", account.id).maybeSingle();
    if (error) throw new Error("READ_FAILED");
    if (!data) throw new AccountRequestError("기록을 찾을 수 없어요.", 404);
    return accountReply(data);
  } catch (error) { return accountFailure(error); }
}
export async function DELETE(request: Request, context: Context) {
  try {
    assertSameOrigin(request);
    const { id, client, account } = await lookup(context);
    const { data, error } = await client.from("saved_consultations").delete().eq("id", id).eq("user_id", account.id).select("id");
    if (error) throw new Error("DELETE_FAILED");
    if (!data?.length) throw new AccountRequestError("기록을 찾을 수 없어요.", 404);
    return accountReply({ deleted: true });
  } catch (error) { return accountFailure(error); }
}
