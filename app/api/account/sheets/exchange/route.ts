import { requireAccount, accountReply, accountFailure } from '@/lib/auth/member';
import { assertSameOrigin, readLimitedJson, uuidPattern, AccountRequestError } from '@/util/validateSavedConsultation';

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const { client } = await requireAccount();
    const body = await readLimitedJson(request);
    if (!body || typeof body !== 'object' || Array.isArray(body) || Object.keys(body).some(key => key !== 'requestId')) throw new AccountRequestError('교환 요청을 확인해주세요.');
    const requestId = (body as { requestId?: unknown }).requestId;
    if (typeof requestId !== 'string' || !uuidPattern.test(requestId)) throw new AccountRequestError('교환 요청을 확인해주세요.');
    const { data, error } = await client.rpc('exchange_member_sheet', { p_request: requestId });
    if (error?.message.includes('PREMIUM_UNAVAILABLE')) throw new AccountRequestError('교환할 고급 시트가 없어요.', 409);
    if (error) throw new Error('EXCHANGE_FAILED');
    return accountReply(data);
  } catch (error) { return accountFailure(error); }
}
