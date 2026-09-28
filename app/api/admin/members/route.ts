import { requireAdmin, adminRpcError } from "@/lib/auth/admin";
import { accountReply, accountFailure } from "@/lib/auth/member";
import { AccountRequestError } from "@/util/validateSavedConsultation";
import { parseAdminQuery } from "@/util/adminInput";
export async function GET(request: Request) {
  try {
    const { client } = await requireAdmin();
    let query;
    try { query = parseAdminQuery(new URL(request.url).searchParams); } catch { throw new AccountRequestError("검색 조건을 확인해주세요."); }
    const { data, error } = await client.rpc("admin_list_members", { p_search: query.search, p_offset: query.offset });
    if (error) adminRpcError(error);
    return accountReply(data);
  } catch (error) { return accountFailure(error); }
}
