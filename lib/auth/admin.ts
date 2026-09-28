import "server-only";
import { requireAccount } from "./member";
import { AccountRequestError } from "@/util/validateSavedConsultation";

export async function requireAdmin() {
  const result = await requireAccount();
  if (!result.account.isAdmin) throw new AccountRequestError("관리자만 이용할 수 있어요.", 403);
  return result;
}
export function adminRpcError(error: { code?: string }) {
  if (error.code === "42501") throw new AccountRequestError("관리자 권한을 확인해주세요.", 403);
  if (error.code === "P0002") throw new AccountRequestError("회원을 찾을 수 없어요.", 404);
  if (error.code === "22023") throw new AccountRequestError("입력한 내용을 확인해주세요.", 400);
  throw new Error("ADMIN_REQUEST_FAILED");
}
