"use client";
import { useState, type ReactNode } from 'react';
import type { ReadingExport } from '@/util/readingExportLayout';
import { presentReading } from '@/util/readingPresentation';
import { ReadingOverview, ReadingCardPanel } from './ReadingPanels';
import { Shell, Header, Viewport, Track, Slide, Pager, NavButton, NavigationHint } from './ResultPager.styles';

export default function SavedReadingCarousel({readings,initial=0,onBack,actions,headerAction}:{readings:ReadingExport[];initial?:number;onBack:()=>void;actions?:ReactNode;headerAction?:ReactNode}){
  const [index,setIndex]=useState(Math.min(Math.max(0,initial),readings.length-1));
  const [page,setPage]=useState(0);
  const reading=readings[index];
  if(!reading)return null;
  const view=presentReading(reading);
  const last=view.cards.length+(actions?1:0);
  return <Shell>
    <Header style={{justifyContent:'space-between',paddingInline:20}}><button onClick={onBack} style={{background:'none',border:0,color:'inherit',minHeight:44,cursor:'pointer'}}>‹ 내 기록</button><select aria-label="상담 질문 선택" value={index} onChange={e=>{setIndex(Number(e.target.value));setPage(0);}} style={{background:'#153a2c',color:'#edcf8a',border:'1px solid #edcf8a40',borderRadius:8,padding:8,maxWidth:'60%'}}>{readings.map((r,i)=><option key={i} value={i}>{i?`연계 질문 ${i}`:'처음 질문'} · {r.keywords?.join(' · ')||'타로'}</option>)}</select></Header>
    {headerAction&&<div style={{display:'flex',justifyContent:'flex-end',padding:'0 20px',flexShrink:0}}>{headerAction}</div>}
    <Viewport><Track $page={page} key={index}>
      <Slide inert={page!==0} aria-hidden={page!==0}><ReadingOverview question={reading.question||reading.keywords?.join(' · ')||reading.title} cards={view.cards} conclusion={view.conclusion} advice={view.advice} onCard={view.monthly?i=>setPage(i+1):undefined}/>{!view.cards.length&&reading.sections.map((s,i)=><section key={i}><h2>{s.title}</h2><p style={{whiteSpace:'pre-line'}}>{s.text}</p></section>)}</Slide>
      {view.cards.map((card,i)=><Slide key={i} inert={page!==i+1} aria-hidden={page!==i+1}><ReadingCardPanel card={card}/></Slide>)}
      {actions&&<Slide inert={page!==last} aria-hidden={page!==last}><h2>이야기 간직하기</h2>{actions}</Slide>}
    </Track></Viewport>
    <Pager><NavButton disabled={page===0} onClick={()=>setPage(p=>p-1)}>이전</NavButton><span aria-live="polite" style={{textAlign:'center',fontSize:13,color:'#edcf8a'}}>{page+1} / {last+1}</span><NavButton $home onClick={()=>page===last?onBack():setPage(p=>p+1)}>{page===last?'내 기록':'다음'}</NavButton></Pager>
    <NavigationHint>긴 해설은 안쪽에서 스크롤하고, 페이지는 버튼으로 넘겨요</NavigationHint>
  </Shell>;
}
