import { requireAccount, accountReply, accountFailure } from "@/lib/auth/member";
import { assertSameOrigin, readLimitedJson, uuidPattern, AccountRequestError } from "@/util/validateSavedConsultation";
import { ACTIVITY_TOPICS } from "@/util/mypageRules";
export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const { client } = await requireAccount();
    const body = await readLimitedJson(request) as Record<string, unknown>;
    if (!body || typeof body !== "object" || Object.keys(body).some(k => !["consultationId","ordinal","kind","topic"].includes(k)) || typeof body.consultationId !== "string" || !uuidPattern.test(body.consultationId)
      || !Number.isInteger(body.ordinal) || Number(body.ordinal)<1 || Number(body.ordinal)>78 || !["one","three","five","monthly"].includes(String(body.kind)) || !ACTIVITY_TOPICS.includes(body.topic as typeof ACTIVITY_TOPICS[number])) throw new AccountRequestError("이용내역을 확인해주세요.");
    const { error } = await client.rpc("record_member_activity", { p_consultation: body.consultationId, p_ordinal: body.ordinal, p_kind: body.kind, p_topic: body.topic });
    if (error) throw new Error("ACTIVITY_FAILED");
    return accountReply({ recorded: true });
  } catch (error) { return accountFailure(error); }
}
