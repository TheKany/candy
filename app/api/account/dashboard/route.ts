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
    const pageRecords = activities.data ?? [];
    const ids = [...new Set(pageRecords.map(item=>item.consultation_id))];
    // Include the whole family even when a page boundary falls between follow-ups.
    const family = ids.length ? await client.from('member_activity').select('consultation_id,ordinal,kind,topic,created_at').eq('user_id',account.id).in('consultation_id',ids).order('created_at',{ascending:false}) : {data:[],error:null};
    if(family.error) throw new Error('ACTIVITY_FAMILY_FAILED');
    const records = family.data ?? [];
    const saved = records.length ? await client.from("saved_consultations").select("id,consultation_id,revision,q0:readings->0->>question,q1:readings->1->>question,q2:readings->2->>question,k0:readings->0->keywords,k1:readings->1->keywords,k2:readings->2->keywords").eq("user_id", account.id).in("consultation_id",ids) : { data: [], error: null };
    if(saved.error) throw new Error("SAVED_LOOKUP_FAILED");
    return accountReply({ representativeCard: profile.data?.representative_card ?? null,
      paid: wallet.data?.paid ?? 0, free: wallet.data?.free ?? 0, ads: reward.data?.ads ?? 0, freeUsedToday: reward.data?.free_used ?? false,
      day, total: activities.count ?? 0, nextOffset:offset+pageRecords.length, hasMore: offset + pageRecords.length < (activities.count ?? 0),
      activities: records.map(item => {const record=saved.data?.find(row => row.consultation_id === item.consultation_id && row.revision >= item.ordinal);const questions=record?[record.q0,record.q1,record.q2]:[];const keywords=record?[record.k0,record.k1,record.k2]:[];const words=keywords[item.ordinal-1];return { ...item, savedId:record?.id??null,title:questions[item.ordinal-1]||(Array.isArray(words)?words.join(' · '):undefined) };}),
      adsAvailable: false, paymentsAvailable: false,
    });
  } catch (error) { return accountFailure(error); }
}
