export function safeAuthReturnPath(value: string | null): string {
  return value === "/account" || value === "/select" ? value : "/";
}
