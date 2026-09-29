'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDailyReadingStore } from '@/store/useDailyReadingStore';
import { fetchDailyReading } from '@/util/dailyReadingClient';
import { ReadingRequestError, type ReadingFailureCode } from '@/util/readingFailure';
import TartOvenStatus from '@/components/result/TartOvenStatus';
import DailyReadingResult from '@/components/daily/DailyReadingResult';
export default function DailyResultPage() {
  const router=useRouter();
  const {drawId,cardId,result}=useDailyReadingStore();
  const [hydrated,setHydrated]=useState(false);
  const [error,setError]=useState<ReadingFailureCode|null>(null);
  const [attempt,setAttempt]=useState(0);
  useEffect(()=>{void Promise.resolve(useDailyReadingStore.persist.rehydrate()).then(()=>setHydrated(true));},[]);
  useEffect(()=>{
    if(!hydrated)return;
    if(!drawId||cardId===null){router.replace('/select');return;}
    if(result)return;
    let active=true;
    setError(null);
    void fetchDailyReading(drawId,cardId).then(value=>{
      useDailyReadingStore.getState().complete(drawId,value);
    }).catch(cause=>{if(active)setError(cause instanceof ReadingRequestError?cause.code:'unknown');});
    return()=>{active=false;};
  },[hydrated,drawId,cardId,result,attempt,router]);
  if(hydrated&&result)return <DailyReadingResult result={result} onAgain={()=>{useDailyReadingStore.getState().begin();router.push('/daily');}}/>;
  return <TartOvenStatus variant="daily" error={error} retrying={attempt>0} onRetry={()=>setAttempt(n=>n+1)} onHome={()=>router.push('/select')}/>;
}
