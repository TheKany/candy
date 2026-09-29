import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseServer';
import { CARD_READING_FOUNDATIONS } from '@/constants/cardReadingFoundations';
import { generateGeminiJSON, GeminiReadingError } from '@/util/geminiReading';
import { DAILY_READING_PROMPT, DAILY_READING_SCHEMA, parseDailyReading, parseDailyRequest } from '@/util/dailyReadingWriter';
export const runtime = 'nodejs';
export const maxDuration = 120;
const reply = (body: unknown, status = 200) => NextResponse.json(body, {status, headers:{'Cache-Control':'no-store'}});
export async function POST(request: Request) {
  let input;
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).length > 2048) return reply({code:'unknown'},400);
    input = parseDailyRequest(JSON.parse(raw));
  } catch { return reply({code:'unknown'},400); }
  if (!input) return reply({code:'unknown'},400);
  try {
    const db = getSupabaseServer();
    if (!db || !process.env.GEMINI_API_KEY) return reply({code:'configuration'},503);
    const {data:card,error} = await db.from('tarot_card_profiles')
      .select('card_id,name_ko,name_en,arcana,suit,rank,upright_keywords,reversed_keywords,upright_one_line,reversed_one_line')
      .eq('card_id',input.cardId).single();
    if (error || !card) return reply({code:'configuration'},503);
    const date = new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
    const value = await generateGeminiJSON(DAILY_READING_PROMPT,JSON.stringify({date,cardId:card.card_id,name:card.name_ko,meaning:CARD_READING_FOUNDATIONS[card.card_id]}),DAILY_READING_SCHEMA,request.signal,4096);
    try { return reply({date,card,reading:parseDailyReading(value)}); }
    catch { return reply({code:'incomplete'},503); }
  } catch(error) {
    if (error instanceof GeminiReadingError) return reply({code:error.code},error.status);
    return reply({code:'unknown'},503);
  }
}
