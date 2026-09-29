'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import styled from 'styled-components';
import TarotCardBoard from '@/components/shuffle/TarotCardBoard';
import PickCardBoard from '@/components/shuffle/PickCardBoard';
import NumberPad from '@/components/shuffle/NumberPad';
import { useDailyReadingStore } from '@/store/useDailyReadingStore';
import { useTarotTypeStore } from '@/store/useTarotTypeStore';
import { useReadingSessionStore } from '@/store/useReadingSessionStore';
import { useShuffleTypeStore } from '@/store/useShuffleTypeStore';
import { useUserPickNum } from '@/store/useUserPickNumStore';
import { handleResetCardProgress } from '@/util/handleResetStore';

const positions = Array.from({length:78},(_,i)=>({top:'0%',left:`${100*i/77}%`,rotate:0}));
export default function DailyShuffle() {
  const router=useRouter();
  const reduced=useReducedMotion();
  const [deck,setDeck]=useState<number[]>([]);
  const [ready,setReady]=useState(false);
  const [locked,setLocked]=useState(false);
  const [number,setNumber]=useState('');
  const revealTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
  useEffect(()=>{
    let active=true;
    let timer:ReturnType<typeof setTimeout>|undefined;
    void Promise.resolve(useDailyReadingStore.persist.rehydrate()).then(()=>{
      if(!active)return;
      const daily=useDailyReadingStore.getState();
      if(!daily.drawId) daily.begin();
      if(daily.cardId!==null){router.replace('/daily/result');return;}
      handleResetCardProgress();
      useTarotTypeStore.getState().setType('daily');
      const cards=Array.from({length:78},(_,i)=>i);
      for(let i=77;i>0;i--){const j=Math.floor(Math.random()*(i+1));[cards[i],cards[j]]=[cards[j],cards[i]];}
      useReadingSessionStore.getState().start(cards);
      useShuffleTypeStore.getState().setShuffleStep(4);
      setDeck(cards);
      timer=setTimeout(()=>setReady(true),reduced?0:1050);
    });
    return()=>{active=false;clearTimeout(timer);if(revealTimer.current)clearTimeout(revealTimer.current);};
  },[router,reduced]);
  const onReveal=()=>{
    if(revealTimer.current)return;
    const raw=useUserPickNum.getState().realCard[0];
    if(raw===undefined)return;
    useDailyReadingStore.getState().select(Number(raw));
    revealTimer.current=setTimeout(()=>router.replace('/daily/result'),250);
  };
  return <Screen>
    <Nav><Link href="/select">← 다른 주문 하러가기</Link><span>TODAY’S TART</span></Nav>
    <Heading><small>질문 없이 가볍게 한 입</small><h1>오늘의 타로</h1><p aria-live="polite">{ready?'오늘의 카드 한 장을 골라주세요':'오늘의 흐름을 담고 있어요'}</p></Heading>
    <Selection>
      {!ready && <ShuffleScene aria-label="카드를 빠르게 섞고 있어요">
        {Array.from({length:10},(_,i)=><motion.div key={i} initial={{x:i%2?-65:65,y:i*2,rotate:i%2?-12:12}}
          animate={reduced?{x:0,y:0,rotate:0}:{x:[i%2?-65:65, i%2?-40:40,0,0],y:[i*2,-10+i*3,i*1.4,0],rotate:[i%2?-12:12,i%2?-6:6,0,0]}}
          transition={{duration:.92,delay:i*.009,times:[0,.3,.78,1],ease:'easeInOut'}}>
          <Image src="/cardBack.png" alt="" fill sizes="76px" priority /></motion.div>)}
      </ShuffleScene>}
      <div style={{visibility:ready?'visible':'hidden'}}>
        {deck.length>0 && <TarotCardBoard cardCnt={78} positions={positions} isRotating={false} onOrbitComplete={()=>{}}
          onCardRevealComplete={onReveal} browsingEnabled={ready&&!locked} browsedPosition={Number(number)||null} onBrowse={n=>setNumber(String(n))}/>}
        <PickCardBoard finishedShuffle={ready}/>
        <NumberPad deck={deck} finishedShuffle={ready} selectionLocked={!ready||locked} onSelectionStarted={()=>setLocked(true)} number={number} setNumber={setNumber}/>
      </div>
    </Selection>
  </Screen>;
}
const Screen=styled.main`width:100%;max-width:480px;margin:auto;padding:14px 0 max(8px,env(safe-area-inset-bottom));color:#fff5dc;min-height:100dvh;`;
const Nav=styled.nav`display:flex;align-items:center;justify-content:space-between;gap:8px;padding:0 16px;font-size:11px;a{color:#e4d3ad;}span{font-family:Georgia,serif;font-size:9px;letter-spacing:1px;color:#a5ac94;}@media(max-width:319px){span{display:none;}}`;
const Heading=styled.header`padding:22px 16px 0;text-align:center;small{font-size:11px;color:#d0bb83;}h1{font-size:26px;margin:5px 0 9px;}p{font-size:13px;color:#ded4b4;}@media(max-height:650px){padding-top:12px;h1{font-size:22px;}}`;
const Selection=styled.section`position:relative;`;
const ShuffleScene=styled.div`position:absolute;inset:0;z-index:4;pointer-events:none;display:grid;place-items:start center;padding-top:68px;>div{position:absolute;width:76px;height:126px;border:2px solid #e6d3ad;border-radius:5px;overflow:hidden;box-shadow:0 4px 12px #0004;}`;
