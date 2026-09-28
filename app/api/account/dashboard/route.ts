import { requireAccount, accountReply, accountFailure } from "@/lib/auth/member";
export async function GET(request: Request) {
  try {
    const { client, account } = await requireAccount();
    const value = Number(new URL(request.url).searchParams.get("offset") ?? 0);
    const offset = Number.isInteger(value) && value >= 0 && value <= 100000 ? value : 0;
    const day = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
    const [profile, wallet, reward, activities] = await Promise.all([
      client.from("member_accounts").select("representative_card").eq("user_id", account.id).single(),
      client.from("member_wallets").select("paid,free").eq("user_id", account.id).maybeSingle(),
      client.from("member_reward_days").select("ads,free_used").eq("user_id", account.id).eq("day", day).maybeSingle(),
      client.from("member_activity").select("consultation_id,ordinal,kind,topic,created_at", { count: "exact" }).eq("user_id", account.id).order("created_at", { ascending: false }).order("consultation_id").order("ordinal").range(offset, offset + 19),
    ]);
    if ([profile, wallet, reward, activities].some(result => result.error)) throw new Error("DASHBOARD_UNAVAILABLE");
    const records = activities.data ?? [];
    const saved = records.length ? await client.from("saved_consultations").select("id,consultation_id,revision,title:readings->0->>title").eq("user_id", account.id).in("consultation_id",records.map(item=>item.consultation_id)) : { data: [], error: null };
    if(saved.error) throw new Error("SAVED_LOOKUP_FAILED");
    return accountReply({ representativeCard: profile.data?.representative_card ?? null,
      paid: wallet.data?.paid ?? 0, free: wallet.data?.free ?? 0, ads: reward.data?.ads ?? 0, freeUsedToday: reward.data?.free_used ?? false,
      day, total: activities.count ?? 0, hasMore: offset + records.length < (activities.count ?? 0),
      activities: records.map(item => {const record=saved.data?.find(row => row.consultation_id === item.consultation_id && row.revision >= item.ordinal);return { ...item, savedId:record?.id??null,title:record?.title||undefined };}),
      adsAvailable: false, paymentsAvailable: false,
    });
  } catch (error) { return accountFailure(error); }
}
