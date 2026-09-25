"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import styled from "styled-components";

const cards = [
  {
    id: 71, name: "펜타클 8", keyword: "쌓아온 실력", role: "지금의 나",
    title: "익숙해진 일이\n의미 없는 시간은 아니에요",
    paragraphs: [
      "매일 비슷한 일을 반복하다 보면, 잘하고 있는 건지 그저 버티고 있는 건지 헷갈릴 때가 있죠. 펜타클 8 속 인물은 하나의 작업에 집중하며 동전을 다듬고 있어요. 이 장면은 눈에 띄는 변화가 없더라도, 반복 속에서 손에 익은 능력을 먼저 돌아보게 해요.",
      "지금의 답답함이 곧 실력의 부족을 뜻하는 건 아니에요. 처음에는 오래 걸렸지만 이제는 수월해진 일, 다른 사람이 당신에게 맡기는 일이 있다면 그 안에 쌓아온 경험이 있어요. 다만 일을 능숙하게 해내는 것과 앞으로도 그 일을 하고 싶은 것은 다른 문제예요.",
      "이 카드에서 살펴볼 건 ‘얼마나 오래 버텼나’보다 ‘여기서 무엇을 배웠고, 무엇을 더 배우고 싶은가’예요. 남는다면 얻을 수 있는 경험이 무엇인지, 이미 익힌 일만 반복하는 건 아닌지 나눠보세요.",
    ],
    prompt: "지금의 직장에서 배운 것 중, 다른 곳에서도 가져갈 수 있는 능력은 무엇인가요?",
  },
  {
    id: 23, name: "완드 2", keyword: "다음 가능성", role: "살펴볼 방향",
    title: "떠날지 결정하기 전에\n바깥의 선택지를 살펴봐요",
    paragraphs: [
      "완드 2의 인물은 손에 작은 지구를 들고 먼 곳을 바라봐요. 아직 익숙한 자리에서 발을 떼지는 않았지만, 시선은 이미 더 넓은 곳을 향하고 있죠. 새로운 일을 생각하는 지금의 고민에 겹쳐볼 수 있는 장면이에요.",
      "이 카드를 당장 회사를 떠나라는 신호로 읽기보다는, 막연한 가능성을 구체적인 선택지로 바꿔보라는 제안으로 읽어보세요. ‘다른 곳은 더 좋겠지’라는 기대만으로는 지금의 회사와 공정하게 비교하기 어려워요.",
      "관심 있는 공고 몇 개를 찾아 실제 업무와 필요한 역량을 살펴보세요. 현재 회사 안에서 역할을 바꿀 수 있는지도 함께 알아보면 좋아요. 선택지를 확인하는 일은 퇴사를 약속하는 일이 아니에요. 결정할 근거를 모으는 과정일 뿐이죠.",
    ],
    prompt: "다음 일에서 꼭 달라졌으면 하는 조건 한 가지는 무엇인가요?",
  },
  {
    id: 14, name: "절제", keyword: "나에게 맞는 속도", role: "지금 필요한 태도",
    title: "지금의 생활과 새로운 준비를\n함께 가져갈 수 있어요",
    paragraphs: [
      "절제의 인물은 두 잔 사이로 물을 옮기고 있어요. 한쪽을 모두 비워버리는 대신, 서로 다른 것을 조금씩 섞어 균형을 찾는 모습이에요. 세 장을 함께 놓으면 ‘남기 아니면 떠나기’라는 두 가지 선택 사이에 준비하는 시간을 두라는 이야기로 이어져요.",
      "새로운 일을 준비한다고 해서 현재의 경험을 버릴 필요는 없어요. 지금 하는 일에서 성과를 정리하고, 감당할 수 있는 시간만큼 다음 일을 알아보는 식으로 두 흐름을 연결할 수 있어요. 준비 때문에 일상이 더 지친다면 속도를 줄여도 괜찮아요.",
      "이 카드는 기다리기만 하면 좋은 결과가 온다고 약속하지 않아요. 대신 내가 지킬 수 있는 속도로 준비하고, 실제 정보를 얻을 때마다 판단을 조정해보라고 권해요. 조급함이 조금 잦아들면 무엇을 바꾸고 싶은지도 더 분명해질 수 있어요.",
    ],
    prompt: "현재 생활을 무너뜨리지 않고 이번 주에 해볼 수 있는 작은 준비는 무엇인가요?",
  },
];

export default function ReadingExample() {
  const [page, setPage] = useState(0);
  const content = useRef<HTMLDivElement>(null);
  const changePage = (next: number) => {
    setPage(next);
    content.current?.scrollTo({ top: 0 });
  };
  return <Screen>
    <Header><Link href="/">‹ 홈으로</Link><span>세 장 타로 · 해설 미리보기</span></Header>
    <Content ref={content}>
      <article hidden={page !== 0}>
        <Kicker>당신의 고민은 이렇게 이야기가 돼요</Kicker>
        <h1>남을까, 새롭게 시작할까?</h1>
        <Question><small>예시 질문</small><p>지금 회사에서 계속 일해도 될까요? 익숙한 일만 반복하는 것 같아서 새로운 일을 준비할지 고민돼요.</p></Question>
        <Cards>{cards.map(card => <figure key={card.id}><Image src={`/cards/card${card.id}.webp`} width={78} height={130} alt={card.name} /><figcaption>{card.name}<small>{card.keyword}</small></figcaption></figure>)}</Cards>
        <Paper><Kicker>그래서, 질문에 대한 답은</Kicker><h2>지금은 퇴사를 서두르기보다,<br />다음 선택지를 구체적으로<br />준비해볼 때예요.</h2><p>쌓아온 실력이 사라진 건 아니에요. 다만 그 실력을 앞으로 어디에 쓰고 싶은지 살펴볼 시간이 필요해 보여요.</p><p>이 세 장을 함께 읽으면, 익숙한 일을 무조건 견디거나 불안한 마음에 떠나기보다 <strong>현재의 생활을 지키면서 다른 가능성을 확인해보자</strong>는 이야기로 이어져요.</p></Paper>
        <Disclaimer>서비스를 소개하기 위해 작성한 가상의 질문과 해설이에요. 실제 상담에서는 질문과 선택한 카드에 따라 내용이 달라져요.</Disclaimer>
      </article>
      {cards.map((card, index) => <article key={card.id} hidden={page !== index + 1}>
        <CardHeading><Image src={`/cards/card${card.id}.webp`} width={66} height={110} alt={card.name} /><div><Kicker>{card.role}</Kicker><h1>{card.name}</h1><span>{card.keyword}</span></div></CardHeading>
        <Paper><h2>{card.title}</h2>{card.paragraphs.map(text => <p key={text}>{text}</p>)}</Paper>
        <Reflection><small>잠깐, 내 마음에 물어보세요</small><p>{card.prompt}</p></Reflection>
      </article>)}
      <article hidden={page !== 4}>
        <Kicker>이야기를 일상으로 가져가는 법</Kicker><h1>이번 주에는<br />이것 하나부터 해봐요</h1>
        <Paper><h2>퇴사 여부를 결정하기 전에,<br />나의 기준부터 적어보세요.</h2><p>종이를 반으로 나눠 한쪽에는 ‘계속 가져가고 싶은 것’, 다른 쪽에는 ‘바꾸고 싶은 것’을 적어보세요. 업무 내용, 배우는 기회, 생활 리듬처럼 실제로 비교할 수 있는 말이면 더 좋아요.</p><p>그다음 관심 있는 공고 하나를 골라 그 기준과 비교해보세요. 당장 지원하지 않아도 괜찮아요. 막연했던 고민에 확인할 수 있는 근거 하나를 더하는 것으로 충분해요.</p></Paper>
        <Reflection><small>세 장이 함께 전하는 말</small><p>쌓아온 것을 믿고, 가능성을 살펴보고, 나에게 맞는 속도로 움직여보세요.</p></Reflection>
        <Disclaimer>타로는 미래를 확정하는 답이 아니라, 고민을 다른 시선으로 바라보는 참고예요. 중요한 결정은 실제 여건과 정보를 함께 살펴보세요.</Disclaimer>
        <Start href="/select">내 이야기로 타로 보기 <span aria-hidden>✦</span></Start>
      </article>
    </Content>
    <Footer><Progress aria-label={`전체 5페이지 중 ${page + 1}페이지`}>{[0, 1, 2, 3, 4].map(index => <i key={index} data-active={page === index} />)}</Progress><Navigation><button type="button" disabled={page === 0} onClick={() => changePage(page - 1)}>이전</button><span aria-live="polite">{page + 1} / 5</span>{page === 4 ? <Link href="/">홈으로</Link> : <button type="button" onClick={() => changePage(page + 1)}>다음</button>}</Navigation></Footer>
  </Screen>;
}

const Screen = styled.main`
  height: 100dvh; display: flex; flex-direction: column; overflow: hidden; color: #fff5df;
  background: radial-gradient(ellipse at 0 0, #49654255, transparent 55%), #0c3025;
  h1, h2 { font-weight: 500; letter-spacing: -.04em; word-break: keep-all; }
  h1 { font-size: clamp(21px, 6vw, 28px); line-height: 1.6; margin: 8px 0 20px; }
  button:focus-visible, a:focus-visible { outline: 2px solid #eace87; outline-offset: 3px; }
`;
const Header = styled.header`
  display: flex; flex-shrink: 0; align-items: center; justify-content: space-between; gap: 8px;
  padding: calc(14px + env(safe-area-inset-top)) 20px 14px; border-bottom: 1px solid #ead29620;
  a { font-size: 13px; min-height: 36px; display: flex; align-items: center; }
  span { font-size: 10px; color: #c4c7af; }
  @media(max-width:319px) { padding-left: 14px; padding-right: 14px; }
`;
const Content = styled.div`
  flex: 1; min-height: 0; overflow-y: auto; overscroll-behavior: contain; padding: 24px 22px;
  article[hidden] { display: none; }
  @media(max-width:319px) { padding: 20px 14px; }
`;
const Kicker = styled.p`font-size: 10px; color: #ddc488; line-height: 1.7; letter-spacing: .07em;`;
const Question = styled.div`padding: 16px 18px; border: 1px solid #e5c98240; border-radius: 16px; background: #ffffff05; small { color: #d9c188; font-size: 10px; } p { font-size: 13px; line-height: 1.9; margin: 7px 0 0; word-break: keep-all; }`;
const Cards = styled.div`
  display: flex; justify-content: space-around; gap: 10px; padding: 25px 0;
  figure { flex: 1; min-width: 0; text-align: center; }
  img { display: block; width: min(100%, 78px); height: auto; margin: 0 auto 10px; border-radius: 6px; box-shadow: 0 5px 14px #0004; }
  figcaption { font-size: 12px; } small { display: block; color: #d5c69d; font-size: 9px; margin-top: 5px; }
`;
const Paper = styled.section`
  padding: 24px 22px; border: 1px solid #dec790; border-radius: 20px; background: #fff8e8; color: #294535;
  h2 { font-size: clamp(19px, 5vw, 23px); line-height: 1.65; white-space: pre-line; margin: 8px 0 21px; }
  > p { font-size: 13px; line-height: 2; margin: 17px 0 0; word-break: keep-all; overflow-wrap: anywhere; }
  > p:first-child { color: #8a713a; font-size: 10px; margin: 0; }
  @media(max-width:319px) { padding: 20px 16px; }
`;
const Disclaimer = styled.p`font-size: 10px; line-height: 1.9; color: #c0c9b7; margin: 20px 2px 0; word-break: keep-all;`;
const CardHeading = styled.div`display: flex; align-items: center; gap: 20px; margin: 0 0 24px; img { border-radius: 6px; } h1 { margin: 4px 0 5px; } span { color: #d0c6a9; font-size: 12px; }`;
const Reflection = styled.aside`margin-top: 20px; padding: 20px; border: 1px solid #eed18750; border-radius: 16px; background: #f4d67b0b; small { color: #dfc58a; font-size: 10px; } p { margin-top: 9px; font-size: 13px; line-height: 1.9; word-break: keep-all; }`;
const Footer = styled.footer`flex-shrink: 0; padding: 12px 22px calc(16px + env(safe-area-inset-bottom)); background: #0b2b21; border-top: 1px solid #ead29620;`;
const Progress = styled.div`display: flex; justify-content: center; gap: 6px; margin-bottom: 12px; i { width: 5px; height: 5px; border-radius: 5px; background: #becab53d; } i[data-active="true"] { width: 22px; background: #e9cb7f; }`;
const Navigation = styled.nav`display: grid; grid-template-columns: 1fr auto 1fr; gap: 18px; align-items: center; text-align: center; button, a { min-height: 44px; display: grid; place-items: center; border: 1px solid #e4c98866; border-radius: 12px; color: #ffe8b4; font-size: 12px; cursor: pointer; } button:disabled { opacity: .3; cursor: default; } span { font-size: 11px; color: #d2c59f; }`;
const Start = styled(Link)`display: flex; align-items: center; justify-content: center; gap: 14px; min-height: 50px; margin-top: 24px; padding: 12px; border-radius: 14px; background: #f2d385; color: #294535; font-size: 14px; font-weight: 700;`;
