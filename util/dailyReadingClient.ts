import { parseDailyReading, type DailyReadingResult } from './dailyReadingWriter.ts';
import { isReadingFailureCode, ReadingRequestError } from './readingFailure.ts';
const pending=new Map<string,Promise<DailyReadingResult>>();
export function fetchDailyReading(drawId:string,cardId:number):Promise<DailyReadingResult> {
  const key=`${drawId}:${cardId}`;
  const existing=pending.get(key);
  if(existing)return existing;
  const work=(async()=>{
    let response:Response;
    try { response=await fetch('/api/dailyReading',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({cardId}),signal:AbortSignal.timeout(115000),cache:'no-store'}); }
    catch(error){throw new ReadingRequestError(error instanceof Error&&error.name==='TimeoutError'?'timeout':'network');}
    const data=await response.json().catch(()=>null);
    if(!response.ok)throw new ReadingRequestError(isReadingFailureCode(data?.code)?data.code:'unknown');
    if(!data||data.card?.card_id!==cardId||typeof data.card?.name_ko!=='string'||typeof data.date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(data.date))throw new ReadingRequestError('incomplete');
    try{return {date:data.date,card:data.card,reading:parseDailyReading(data.reading)};}
    catch{throw new ReadingRequestError('incomplete');}
  })();
  pending.set(key,work);
  void work.then(()=>pending.delete(key),()=>pending.delete(key));
  return work;
}
