import { requireAccount, accountReply, accountFailure } from "@/lib/auth/member";
export async function GET() { try { return accountReply((await requireAccount()).account); } catch (error) { return accountFailure(error); } }
