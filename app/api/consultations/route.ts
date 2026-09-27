import { requireAccount, accountReply, accountFailure } from "@/lib/auth/member";
import { assertSameOrigin, readLimitedJson, parseSavedConsultation, AccountRequestError } from "@/util/validateSavedConsultation";
export async function GET() {
  try {
    const { client, account } = await requireAccount();
    if (account.role !== "member") throw new AccountRequestError("슈퍼 계정은 상담 기록을 보관하지 않아요.", 403);
    const { data, error } = await client.from("saved_consultations").select("id,created_at,updated_at,revision").eq("user_id", account.id).order("updated_at", { ascending: false }).limit(100);
    if (error) throw new Error("LIST_FAILED");
    return accountReply({ readings: data });
  } catch (error) { return accountFailure(error); }
}
export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const { client, account } = await requireAccount();
    if (account.role !== "member") throw new AccountRequestError("이 계정은 상담 기록을 저장하지 않아요.", 403);
    const payload = parseSavedConsultation(await readLimitedJson(request));
    const { data, error } = await client.rpc("save_consultation", { p_consultation_id: payload.consultationId, p_revision: payload.revision, p_readings: payload.readings });
    if (error?.code === "40001") throw new AccountRequestError("더 최신 상담이 이미 저장돼 있어요.", 409);
    if (error) throw new Error("SAVE_FAILED");
    return accountReply({ id: data, revision: payload.revision });
  } catch (error) { return accountFailure(error); }
}
