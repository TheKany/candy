export function parseAdminQuery(params: URLSearchParams) {
  const search = (params.get("search") ?? "").trim().toUpperCase();
  const raw = params.get("offset") ?? "0";
  const offset = Number(raw);
  if (!/^[A-Z0-9-]{0,35}$/.test(search) || !/^\d+$/.test(raw) || !Number.isSafeInteger(offset) || offset > 1000000) throw new Error("INVALID_QUERY");
  return { search, offset };
}
export const validMemberNumber = (value: string) => /^TR-[A-F0-9]{32}$/.test(value);
function object(value: unknown): value is Record<string, unknown> { return !!value && typeof value === "object" && !Array.isArray(value); }
export function parseMemberRole(value: unknown): "member" | "super" {
  if (!object(value) || Object.keys(value).length !== 1 || (value.role !== "member" && value.role !== "super")) throw new Error("INVALID_ROLE");
  return value.role;
}
export function parseRoleVersion(value: unknown): number {
  if (!object(value) || Object.keys(value).length !== 1 || !Number.isInteger(value.roleVersion) || Number(value.roleVersion) < 0 || Number(value.roleVersion) > 2147483647) throw new Error("INVALID_VERSION");
  return Number(value.roleVersion);
}
