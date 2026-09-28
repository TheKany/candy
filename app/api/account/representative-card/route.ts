import { requireAccount, accountReply, accountFailure } from "@/lib/auth/member";
import { assertSameOrigin, readLimitedJson, AccountRequestError } from "@/util/validateSavedConsultation";
import { isRepresentativeCard } from "@/util/mypageRules";
export async function PATCH(request: Request) {
  try {
    assertSameOrigin(request);
    const { client } = await requireAccount();
    const body = await readLimitedJson(request);
    if (!body || typeof body !== "object" || !isRepresentativeCard((body as { cardId?: unknown }).cardId)) throw new AccountRequestError("대표 카드를 다시 골라주세요.");
    const cardId = (body as { cardId: number | null }).cardId;
    const { error } = await client.rpc("set_representative_card", { p_card: cardId });
    if (error) throw new Error("PROFILE_UPDATE_FAILED");
    return accountReply({ cardId });
  } catch (error) { return accountFailure(error); }
}
