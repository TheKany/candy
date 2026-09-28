"use client";
import Image from 'next/image';
import styled from 'styled-components';
import type { ReactNode } from 'react';
import type { PresentedCard } from '@/util/readingPresentation';

export function ReadingOverview({question,cards,conclusion,overview=[],advice,onCard}:{question:string;cards:PresentedCard[];conclusion:string;overview?:string[];advice?:string;onCard?:(index:number)=>void}){
  const paragraphs=conclusion.split(/\n\s*\n/).filter(Boolean);
  return <ReadingPaper><small className="eyebrow">{question?'나의 질문':'나의 이야기'}</small><h1 className="question">{question||'뽑은 카드의 이야기를 만나보세요'}</h1><div className="drawn">{cards.map((card,i)=><figure key={`${card.id}-${i}`}><button disabled={!onCard} onClick={()=>onCard?.(i)} aria-label={`${card.label||card.name} 해설 보기`}><Image src={`/cards/card${card.id}.webp`} width={88} height={147} alt={card.name}/></button><figcaption>{card.label&&<strong>{card.label}<br/></strong>}{card.name}</figcaption></figure>)}</div>{paragraphs.length>0&&<><div className="divider">종합 해설</div><h2>{paragraphs[0]}</h2>{[...paragraphs.slice(1),...overview].map((p,i)=><p key={i}>{p}</p>)}</>}{advice&&<aside><small>지금 해볼 수 있는 일</small><p>{advice}</p></aside>}</ReadingPaper>;
}
export function ReadingCardPanel({card,headline,advice,children}:{card:PresentedCard;headline?:string;advice?:string;children?:ReactNode}){
  const paragraphs=card.detail.split(/\n\s*\n/).filter(Boolean);
  headline = headline || card.headline;
  return <ReadingPaper><div className="card-heading"><Image src={`/cards/card${card.id}.webp`} width={105} height={175} alt={card.name}/><div><small className="eyebrow">{card.label||'카드의 메시지'}</small><h1>{card.name}</h1>{card.remember&&<div className="guidance remember"><small>기억할 것</small><p>{card.remember}</p></div>}{card.avoid&&<div className="guidance avoid"><small>주의할 것</small><p>{card.avoid}</p></div>}</div></div><div className="divider">이 카드가 전하는 이야기</div>{headline&&<h2>{headline}</h2>}{paragraphs.map((p,i)=><p key={i}>{p}</p>)}{children}{advice&&<aside><small>지금 해볼 수 있는 일</small><p>{advice}</p></aside>}</ReadingPaper>;
}
export const ReadingPaper=styled.div`
  padding:23px 20px;border:1px solid #dec58b35;border-radius:18px;background:linear-gradient(145deg,#214333aa,#153a2c99);color:#f8f0d9;overflow-wrap:anywhere;
  .eyebrow{font-size:10px;letter-spacing:.08em;color:#d9bf80;}h1,h2{font-family:'NotoSerifKR',serif;font-weight:500;letter-spacing:-.03em;word-break:keep-all;}h1{font-size:24px;line-height:1.55;margin:6px 0 16px;}.question{font-size:22px;margin:10px 0 22px;}h2{font-size:20px;line-height:1.7;margin:0 0 16px;}p{font-size:14px;line-height:1.95;color:#d1ddcd;word-break:keep-all;white-space:pre-line;margin:14px 0;}
  .drawn{display:flex;flex-wrap:wrap;justify-content:center;gap:14px;margin-bottom:24px;}.drawn figure{margin:0;width:calc((100% - 28px)/3);max-width:88px;}.drawn button{display:block;width:100%;background:none;border:0;padding:0;cursor:pointer;}.drawn button:disabled{cursor:default;}.drawn img{width:100%;height:auto;display:block;border-radius:6px;}.drawn figcaption{text-align:center;font-size:10px;color:#d8c799;line-height:1.6;margin-top:8px;}
  .divider{display:flex;align-items:center;gap:12px;margin:24px 0 19px;font-size:10px;color:#cabb91;}.divider:after{content:'';height:1px;background:#edcf8a35;flex:1;}.card-heading{display:grid;grid-template-columns:105px minmax(0,1fr);gap:20px;align-items:start;}.card-heading>img{width:100%;height:auto;border-radius:6px;box-shadow:0 6px 15px #0004;}.guidance{margin-top:14px;padding-left:10px;border-left:2px solid currentColor;}.guidance small{font-size:10px;}.guidance p{color:inherit;font-size:13px;line-height:1.65;margin:5px 0 0;}.remember{color:#c6dab1;}.avoid{color:#dfb09b;}aside{margin-top:22px;padding:16px;border-radius:10px;background:#f4e8be;color:#294334;}aside small{font-size:10px;}aside p{color:inherit;font-size:13px;margin:7px 0 0;}
  @media(max-width:320px){padding:19px 14px;.card-heading{grid-template-columns:82px minmax(0,1fr);gap:14px;}h1{font-size:21px;}.question{font-size:20px;}h2{font-size:18px;}.drawn{gap:9px;}}
`;
