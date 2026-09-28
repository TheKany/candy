"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styled from "styled-components";

const cards = [
  { id: 23, name: "완드 2", light: "방향을 정하고 움직이세요", shadow: "계획만 세우며 미루지 마세요", lead: "지금은 성급히 자리를 옮기기보다, 다음에 맡을 일을 정하는 게 좋아요.", paragraphs: ["완드 2의 인물은 성벽 위에서 더 넓은 세상을 바라보고 있어요. 이 질문에서 중요한 건 ‘떠날까, 남을까’를 서둘러 결정하는 일이 아니라, 어떤 일을 하며 성장하고 싶은지 정하는 일이에요.", "먼저 현재 업무에서 더 키울 강점 한 가지를 골라보세요. 그 강점을 쓸 수 있는 역할을 찾아 상사와 이야기하는 게 좋아요. 준비 없이 환경부터 바꾸거나, 생각만 하며 결정을 미루는 건 피하세요."], advice: "이번 주 안에 맡고 싶은 업무 한 가지와 그 이유를 적어보세요." },
  { id: 11, name: "정의", light: "성과를 근거로 이야기하세요", shadow: "추측으로 평가를 단정하지 마세요", lead: "가장 먼저 할 일은 성과 정리예요. 평가 기준도 직접 확인하세요.", paragraphs: ["정의가 든 저울은 노력과 평가 사이의 균형을 돌아보게 해요. 이 카드의 조언은 분명해요. 회사에서 인정받고 싶다면 얼마나 바빴는지보다 어떤 문제를 해결했는지 보여주는 게 좋아요.", "평가가 기대와 다르다고 곧바로 ‘나를 싫어해서’라고 결론 내리지는 마세요. 다음 평가에서 무엇을 보완해야 하는지 구체적으로 물어보세요. 기준을 확인한 뒤 준비해야 불필요하게 힘을 쓰지 않아요."], advice: "최근 성과 세 가지를 ‘한 일 → 달라진 결과’로 정리해보세요." },
  { id: 38, name: "컵 3", light: "도움을 주고받으세요", shadow: "분위기에 휩쓸려 무리하지 마세요", lead: "동료에게 먼저 다가가는 게 좋아요. 모두와 친해질 필요는 없어요.", paragraphs: ["함께 잔을 드는 세 사람은 혼자 애쓰기보다 서로 기여하며 관계를 쌓으라고 말해요. 동료와 편해지고 싶다면 억지로 사적인 이야기를 꺼내기보다 업무에서 작은 도움을 주고받는 것부터 시작하세요.", "도움을 받았다면 무엇이 고마웠는지 구체적으로 표현하세요. 반대로 친해지기 위해 부탁을 전부 받아주는 건 좋지 않아요. 내 업무와 휴식을 지키면서 꾸준히 교류하는 쪽을 선택하세요."], advice: "도움받은 동료에게 구체적인 감사 한마디를 전해보세요." },
];
const questions = ["앞으로 회사생활은 어떻게 될까요?", "지금 가장 먼저 준비할 것은 무엇일까요?", "동료들과 더 편하게 지낼 수 있을까요?"];

export default function ReadingHistoryPreview() {
  const [reading, setReading] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [deleted, setDeleted] = useState(false);
  const remove = () => {
    if (!window.confirm('이 상담의 처음 질문과 연계 질문 기록을 모두 삭제할까요? 삭제한 기록은 복구할 수 없어요.')) return;
    setDeleted(true); setReading(null); setPage(0);
  };
  const scroll = useRef<HTMLDivElement>(null);
  const selected = reading === 0 ? cards : [cards[reading === 1 ? 1 : 2]];
  const open = (index: number) => { setReading(index); setPage(0); };
  const turn = (next: number) => { setPage(next); scroll.current?.scrollTo({ top: 0 }); };
  const card = selected[page - 1];

  return <Shell>
    <header className="top"><button onClick={() => { setReading(null); setPage(0); }} disabled={reading === null}>‹ 내 기록</button><span>타로타르트</span><small>시안</small></header>
    {reading === null ? <div className="list-body">
      <span className="eyebrow">MY TAROT DIARY</span><h1>차곡차곡 쌓인<br/>나의 이야기</h1><p className="intro">처음의 고민부터, 이어진 질문까지.</p>
      <div className="wallet"><span>보유 타르트 시트</span><span>무료 <b>-장</b> · 유료 <b>-장</b></span><small>슈퍼 계정 · 시트 없이 자유롭게 이용해요</small></div>
      <div className="list-title"><h2>지금까지 먹은 타르트</h2><span>4개</span></div>
      {!deleted ? <section className="group"><div className="date">2026. 09. 28 <span>세 장 타로 · 일과 커리어</span></div>
        <button className="entry main" onClick={() => open(0)}><span><small>처음 질문</small><strong>{questions[0]}</strong><em>계획을 세우고, 함께 성장하는 시간</em></span><span className="arrow">›</span></button>
        <div className="branches">{[1,2].map(i => <button className="entry" key={i} onClick={() => open(i)}><span><small>연계 질문 {i} <i>한 장 타로</i></small><strong>{questions[i]}</strong></span><span className="arrow">›</span></button>)}</div>
      </section> : <p role="status" className="sample">샘플 저장 기록을 삭제했어요.<br/>실제 기록은 변경되지 않았어요.</p>}
      <section className="group older"><div className="date">2026. 09. 24 <span>한 장 타로 · 나의 마음</span></div><div className="entry"><span><small>처음 질문</small><strong>마음의 여유를 되찾고 싶어요.</strong></span><span className="unsaved">저장 안 함</span></div></section>
      <p className="sample">샘플 기록으로 구성한 디자인 미리보기예요.<br/>실제 상담 기록은 변경되지 않아요.</p><Link className="home" href="/">홈으로</Link>
    </div> : <>
      <div className="reading-label"><span>{reading === 0 ? "처음 질문" : `연계 질문 ${reading}`}<i> · {selected.length === 3 ? "세" : "한"} 장 타로</i></span><button type="button" onClick={remove} style={{color:'#dfb09b',fontSize:12,minHeight:44}}>기록 삭제</button></div>
      <div className="reading-scroll" ref={scroll} key={reading}>
        <article key={page} className="paper">
          {page === 0 ? <><span className="eyebrow">그날의 질문</span><h1 className="question">{questions[reading]}</h1><div className="drawn">{selected.map(c => <figure key={c.id}><Image src={`/cards/card${c.id}.webp`} width={88} height={147} alt={c.name}/><figcaption>{c.name}</figcaption></figure>)}</div><div className="divider"><span>종합 해설</span></div><h2 className="conclusion">{reading === 0 ? "지금은 자리를 바꾸기보다, 성과를 정리하고 협력하는 게 좋아요." : selected[0].lead}</h2><p>{reading === 0 ? "이번 카드의 조언은 ‘현재 자리에서 다음 역할을 준비하라’예요. 맡고 싶은 일을 하나 정하고, 지금까지의 성과를 근거로 상사와 이야기하세요. 동료에게 도움을 요청하는 것도 좋아요. 인정받고 싶다는 마음에 모든 일을 혼자 떠안거나, 답답하다는 이유만으로 이직을 결정하는 건 피하세요." : selected[0].paragraphs[0]}</p><aside><small>마음에 담아갈 한마디</small><p>{reading === 0 ? "다음 역할은 구체적으로 요청하고, 감당할 수 없는 일에는 선을 그으세요." : selected[0].advice}</p></aside></> : <>
            <div className="card-heading"><Image src={`/cards/card${card.id}.webp`} width={105} height={175} alt={card.name}/><div className="card-info"><span className="eyebrow">{page}번째 카드</span><h1>{card.name}</h1><div className="guidance positive"><small>기억할 것</small><p>{card.light}</p></div><div className="guidance caution"><small>주의할 것</small><p>{card.shadow}</p></div></div></div>
            <div className="divider"><span>이 카드가 전하는 이야기</span></div><h2 className="conclusion">{card.lead}</h2>{card.paragraphs.map(p=><p key={p}>{p}</p>)}<aside><small>작은 실천</small><p>{card.advice}</p></aside>
          </>}
        </article>
      </div>
      <footer><button disabled={page===0} onClick={()=>turn(page-1)}>이전</button><span aria-live="polite">{page+1} <i>/ {selected.length+1}</i></span>{page<selected.length ? <button className="next" onClick={()=>turn(page+1)}>다음</button> : <button className="next" onClick={()=>setReading(null)}>내 기록</button>}</footer>
    </>}
  </Shell>;
}

const Shell = styled.main`
  height:100dvh; min-height:0; display:flex; flex-direction:column; overflow:hidden; color:#f8f0d9;
  background:radial-gradient(ellipse at 0 0,#284a38 0,transparent 55%),#0b2b21;
  button,a{-webkit-tap-highlight-color:transparent;}button{font:inherit;cursor:pointer;color:inherit;border:0;background:none;}button:disabled{opacity:.35;cursor:default;}button:focus-visible,a:focus-visible{outline:2px solid #edcf8a;outline-offset:3px;}
  .top{display:flex;align-items:center;gap:12px;flex-shrink:0;padding:calc(10px + env(safe-area-inset-top)) 20px 8px;border-bottom:1px solid #edcf8a18;min-height:58px;}.top button{padding:8px 0;min-height:40px;font-size:13px;}.top>span{margin-left:auto;color:#dcca9e;font-size:12px;}.top>small{font-size:10px;border:1px solid #edcf8a40;padding:3px 6px;border-radius:5px;color:#bdc6b7;}
  .list-body{overflow-y:auto;padding:28px 22px;}.eyebrow{color:#d9bf80;font-size:10px;letter-spacing:.12em;}h1{font-family:'NotoSerifKR',serif;font-size:28px;line-height:1.55;font-weight:600;margin:12px 0;letter-spacing:-.04em;}.intro{color:#aabdab;font-size:13px;margin:0 0 26px;}.wallet{display:flex;flex-wrap:wrap;justify-content:space-between;gap:12px;padding:16px 0;border-block:1px solid #edcf8a30;font-size:12px;}.wallet b{color:#efd599;font-weight:500;}.wallet small{flex-basis:100%;font-size:11px;color:#aebfae;}
  .list-title{display:flex;align-items:center;justify-content:space-between;margin:30px 0 16px;}.list-title h2{font-size:15px;margin:0;}.list-title>span{font-size:15px;color:#edcf8a;}.group{padding:18px 15px;background:#ffffff04;border:1px solid #edcf8a25;border-radius:15px;margin-bottom:14px;}.date{font-size:10px;color:#c9be9d;display:flex;flex-wrap:wrap;gap:8px;}.date>span{color:#94ab99;}.entry{display:flex;align-items:center;gap:12px;width:100%;text-align:left;padding:16px 0;}.entry>span:first-child{min-width:0;flex:1;}.entry small{display:block;font-size:10px;color:#d9bf80;margin-bottom:6px;}.entry strong{display:block;font-weight:500;font-size:14px;line-height:1.65;word-break:keep-all;overflow-wrap:anywhere;}.entry em{display:block;font-style:normal;color:#96ad9c;font-size:11px;line-height:1.6;margin-top:6px;}.arrow{font-size:23px;color:#d9bf80;}.branches{border-left:1px solid #d8c08645;margin:4px 0 0 5px;padding-left:16px;}.branches .entry{position:relative;padding:12px 0;}.branches .entry::before{position:absolute;content:'';left:-17px;top:24px;width:9px;height:1px;background:#d8c08660;}.entry i{font-style:normal;font-size:9px;color:#9aaf9e;margin-left:5px;}.branches strong{font-size:12px;}.unsaved{font-size:10px;white-space:nowrap;color:#97aa99;}.older{background:none;border-color:#ffffff0b;}.sample{text-align:center;color:#9bac98;font-size:10px;line-height:1.8;margin:25px 0 12px;}.home{display:block;text-align:center;color:#cbbd97;font-size:12px;padding:10px;}
  .reading-label{display:flex;justify-content:space-between;gap:8px;padding:15px 22px;font-size:12px;flex-shrink:0;color:#edcf8a;}.reading-label i{font-style:normal;color:#a0b5a3;}.reading-label>small{font-size:10px;color:#9baf9c;}.reading-scroll{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:0 16px 16px;}.paper{padding:23px 20px;background:linear-gradient(145deg,#214333aa,#153a2c99);border:1px solid #dec58b35;border-radius:18px;}.question{font-size:22px;margin:10px 0 22px;word-break:keep-all;overflow-wrap:anywhere;}.drawn{display:flex;justify-content:center;gap:14px;margin:0 0 24px;}.drawn figure{margin:0;min-width:0;max-width:88px;}.drawn img{display:block;width:100%;height:auto;border-radius:6px;box-shadow:0 5px 12px #0004;}.drawn figcaption{text-align:center;font-size:10px;color:#d8c799;margin-top:9px;}.divider{display:flex;align-items:center;gap:12px;margin:24px 0 19px;font-size:10px;letter-spacing:.03em;color:#cabb91;}.divider:after{content:'';height:1px;background:#edcf8a35;flex:1;}.conclusion{font-family:'NotoSerifKR',serif;font-size:20px;font-weight:500;line-height:1.7;letter-spacing:-.03em;margin:0 0 16px;word-break:keep-all;overflow-wrap:anywhere;}.paper>p{font-size:14px;line-height:1.95;color:#d1ddcd;word-break:keep-all;overflow-wrap:anywhere;margin:14px 0;}aside{margin-top:22px;padding:16px;background:#f4e8be;border-radius:10px;color:#294334;}aside small{font-size:10px;color:#6c7050;}aside p{margin:7px 0 0;font-size:13px;line-height:1.8;word-break:keep-all;}.card-heading{display:grid;grid-template-columns:minmax(0,105px) minmax(0,1fr);gap:20px;align-items:center;}.card-heading>img{width:100%;height:auto;border-radius:6px;box-shadow:0 6px 15px #0004;}.card-info h1{font-size:24px;margin:5px 0 16px;}.metric{margin-top:12px;}.metric>small{font-size:9px;opacity:.75;}.metric>div:not(.track){display:flex;justify-content:space-between;gap:4px;margin:4px 0 7px;font-size:14px;}.metric strong{font-weight:500;}.metric span small{font-size:9px;margin-left:2px;opacity:.65;}.positive{color:#c6dab1;}.caution{color:#dfb09b;}.track{height:3px;border-radius:4px;background:#ffffff12;overflow:hidden;}.track>span{display:block;height:100%;background:currentColor;}.track span{max-width:100%;}
  .card-heading{align-items:start;}.guidance{margin-top:14px;padding-left:10px;border-left:2px solid currentColor;}.guidance small{font-size:10px;opacity:.8;}.guidance p{font-size:13px;line-height:1.65;margin:5px 0 0;word-break:keep-all;overflow-wrap:anywhere;}
  footer{flex-shrink:0;display:flex;align-items:center;justify-content:space-between;padding:12px 20px calc(12px + env(safe-area-inset-bottom));border-top:1px solid #edcf8a22;background:#0b2b21;}footer button{min-height:44px;min-width:74px;padding:10px 17px;border:1px solid #dec58b55;border-radius:10px;font-size:13px;}footer .next{background:#ecd18b;color:#213d2e;border-color:#ecd18b;}footer>span{font-size:13px;color:#edcf8a;}footer i{font-style:normal;color:#899f8c;font-size:11px;}
  @media(max-width:320px){.list-body{padding:22px 14px;}.reading-scroll{padding:0 10px 12px;}.paper{padding:19px 14px;}.card-heading{grid-template-columns:82px minmax(0,1fr);gap:14px;}.card-info h1{font-size:21px;}.question{font-size:20px;}.conclusion{font-size:18px;}.drawn{gap:9px;}.top{padding-inline:14px;}.group{padding:14px 11px;}.entry strong{font-size:13px;}.wallet{font-size:11px;}}
`;
