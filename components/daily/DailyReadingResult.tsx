'use client';
import Image from 'next/image';
import Link from 'next/link';
import styled from 'styled-components';
import type { DailyReadingResult as Result } from '@/util/dailyReadingWriter';
import TartEnergy from './TartEnergy';
export default function DailyReadingResult({result,onAgain}:{result:Result;onAgain:()=>void}) {
  const {card,reading,date}=result;
  return <Page>
    <Nav><Link href="/select">← 주문서로</Link><span>{date.replaceAll('-','. ')}</span></Nav>
    <Title><small>A LITTLE MOMENT FOR TODAY</small><h1>오늘의 타로타르트</h1></Title>
    <Receipt>
      <Top><Card><Image src={`/cards/card${card.card_id}.webp`} alt={card.name_ko} width={120} height={200} priority/><figcaption>{card.name_ko}<small>오늘 당신에게 온 한 장</small></figcaption></Card><TartEnergy value={reading.energy}/></Top>
      <IndexNote>카드의 상징으로 읽는 오늘의 흐름이에요</IndexNote>
      <Story><small>오늘의 한마디</small><h2>{reading.headline}</h2><p>{reading.interpretation}</p>
        <Advice><h3>오늘은 이렇게 해보세요</h3><p>{reading.helpfulAction}</p></Advice>
        <Advice $caution><h3>이 행동은 잠깐 멈춰요</h3><p>{reading.cautionAction}</p></Advice>
      </Story>
      <Footer>당신의 하루에 따뜻한 한 조각 <span>✦</span></Footer>
    </Receipt>
    <Actions><button onClick={onAgain}>한 장 더 만나보기</button><Link href="/">홈으로</Link></Actions>
  </Page>;
}
const Page=styled.main`max-width:480px;width:100%;margin:auto;padding:18px 16px calc(24px + env(safe-area-inset-bottom));color:#244636;`;
const Nav=styled.nav`display:flex;justify-content:space-between;gap:8px;color:#cabc98;font-size:11px;a{color:#e8dab9;}`;
const Title=styled.header`text-align:center;margin:25px 0 20px;color:#fff1cb;small{font-size:9px;letter-spacing:1.4px;color:#c3ad75;}h1{font-size:24px;margin-top:8px;}`;
const Receipt=styled.article`background:linear-gradient(115deg,#fff8e9,#f4ead6);border-radius:6px;box-shadow:0 12px 32px #0002;overflow:hidden;`;
const Top=styled.div`display:grid;grid-template-columns:1fr 1fr;gap:18px;align-items:center;padding:24px 20px 12px;@media(max-width:319px){padding:18px 12px 12px;gap:8px;}`;
const Card=styled.figure`min-width:0;text-align:center;img{display:block;width:min(100%,112px);height:auto;margin:auto;border:3px solid #e3cc8f;border-radius:5px;}figcaption{font-weight:700;margin-top:10px;font-size:15px;}small{display:block;font-size:10px;color:#90866a;font-weight:400;margin-top:5px;}`;
const IndexNote=styled.p`font-size:10px;color:#8c876f;text-align:center;padding:4px 12px 22px;`;
const Story=styled.section`border-top:1px dashed #baa578;padding:24px 22px;>small{font-size:11px;color:#9a7745;}h2{font-size:21px;line-height:1.6;margin:9px 0 20px;word-break:keep-all;}p{font-size:15px;line-height:1.95;white-space:pre-line;overflow-wrap:anywhere;}@media(max-width:319px){padding:20px 15px;h2{font-size:19px;}p{font-size:14px;}}`;
const Advice=styled.div<{$caution?:boolean}>`margin-top:22px;padding:16px;border-radius:10px;background:${p=>p.$caution?'#b68d6712':'#6a885818'};h3{font-size:12px;color:${p=>p.$caution?'#966f51':'#557246'};margin-bottom:8px;}p{font-size:14px;line-height:1.8;}`;
const Footer=styled.footer`margin:0 22px;padding:14px 0 18px;border-top:1px dashed #baa578;font-size:10px;color:#96805a;display:flex;justify-content:space-between;`;
const Actions=styled.div`display:flex;gap:10px;margin-top:24px;button,a{flex:1;padding:14px 8px;border:1px solid #b8a16c60;border-radius:12px;text-align:center;color:#ecd59f;font-size:13px;}button{background:#f0d493;color:#254633;}`;
