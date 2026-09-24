"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import styled, { keyframes } from "styled-components";

const steps = [
  { label: "이야기의 시작", title: "오늘은 어떤 타로가\n끌리나요?", description: "한 장으로 가볍게, 여러 장으로 깊이 있게.\n월별 타로에서는 한 달씩 흐름을 살펴봐요.", note: "지금 마음에 맞는 타로를 골라주세요." },
  { label: "이용 요금", title: "필요한 만큼만\n이야기를 나눠요", description: "타로 1회 990원\n추가 질문 1회 500원 · 2회 묶음 990원", note: "추가 질문은 한 상담에서 최대 2번 이용할 수 있어요." },
  { label: "마음을 담는 시간", title: "마음속 질문을\n들려주세요", description: "누구와 어떤 일이 있었는지, 무엇이 궁금한지\n편하게 문장으로 적어주세요.", note: "구체적인 질문일수록 이야기도 선명해져요." },
  { label: "당신의 카드", title: "마음이 가는 카드를\n골라보세요", description: "카드를 훑어보며 마음이 가는 번호를 찾고,\n그 번호를 입력해 한 장씩 선택해요.", note: "카드를 섞는 동안 질문을 떠올려보세요." },
  { label: "펼쳐지는 이야기", title: "카드가 전하는 이야기를\n천천히 읽어요", description: "핵심 결론부터 자세한 해설까지,\n이전·다음 버튼으로 한 페이지씩 읽어보세요.", note: "더 궁금한 점은 추가 질문으로 이어갈 수 있어요." },
  { label: "한 번 더, 무료로", title: "광고 세 번 보고\n질문 한 번 더", description: "추가 질문을 고른 뒤 ‘광고 보기’를 선택해요.\n광고 3개를 끝까지 보면 추가 질문 1회가 무료예요.\n광고 대신 결제해서 이용할 수도 있어요.", note: "광고는 하루 최대 3개, 무료 추가 질문은 하루 1회예요.\n중간에 닫은 광고는 완료 횟수에 포함되지 않아요." },
  { label: "이야기 포장", title: "오늘의 이야기를\n가져가세요", description: "해설을 PDF나 이미지로 간직할 수 있어요.\n질문을 함께 담을지는 직접 선택해요.", note: "좋은 시간이었다면 타로타르트도 소문내주세요." },
];

export default function UsageGuide() {
  const dialog = useRef<HTMLDialogElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const step = steps[page];
  const changePage = (next: number) => {
    setPage(next);
    body.current?.scrollTo({ top: 0 });
  };

  return <>
    <Help type="button" aria-label="타로타르트 이용 방법" aria-haspopup="dialog" onClick={() => {
      setPage(0);
      dialog.current?.showModal();
      body.current?.scrollTo({ top: 0 });
    }}>?</Help>
    <Modal ref={dialog} aria-labelledby="usage-guide-title" onClick={(event) => {
      if (event.target !== event.currentTarget) return;
      const rect = event.currentTarget.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.current?.close();
    }}>
      <Header><span>타로타르트 이용 안내</span><Close type="button" aria-label="이용 안내 닫기" onClick={() => dialog.current?.close()}>×</Close></Header>
      <Body ref={body}>
        <Page key={page} aria-live="polite" aria-atomic="true">
          <Scene aria-hidden="true">
            <Orbit />
            {page === 0 && <><Logo src="/main.png" width={230} height={230} alt="" /><MiniTag>한 장의 카드, 나만의 이야기</MiniTag></>}
            {page === 1 && <PriceMenu><small>TAROT TARTE MENU</small><div><span>타로 한 번</span><b>990<em>원</em></b></div><div><span>추가 질문 한 번</span><b>500<em>원</em></b></div><div><span>추가 질문 두 번</span><b>990<em>원</em></b></div><p>마음에 맞는 이야기를 골라요</p></PriceMenu>}
            {page === 2 && <Question><small>오늘의 고민</small><p>새로운 일을 시작하고 싶어요.<br />어떤 점을 준비하면 좋을까요?</p><i>나의 이야기에서 시작해요</i></Question>}
            {page === 3 && <Deck>{[0, 1, 2, 3, 4].map((card) => <Card key={card} $index={card} $picked={card === 2}><span>✦</span>{card === 2 && <b>23</b>}</Card>)}</Deck>}
            {page === 4 && <Reading><small>당신에게 전하는 한마디</small><strong>서두르지 않아도 괜찮아요.</strong><p>지금 할 수 있는 작은 한 걸음부터<br />당신의 이야기가 이어져요.</p><div><span /> <span /> <span /></div></Reading>}
            {page === 5 && <RewardTicket><small>당신을 위한 작은 선물</small><Stamps>{[1, 2, 3].map(number => <div key={number}><span>✦</span><small>{number}회 시청</small></div>)}</Stamps><strong>추가 질문 1회 무료</strong><p>광고 3개 시청 완료</p></RewardTicket>}
            {page === 6 && <><Package src="/images/bakery/packed-tart.png" width={220} height={180} alt="" /><MiniTag>당신의 이야기를 포장했어요</MiniTag></>}
            <Spark $left>✧</Spark><Spark>✦</Spark>
          </Scene>
          <Label>0{page + 1} <span /> {step.label}</Label>
          <Title id="usage-guide-title">{step.title}</Title>
          <Description>{step.description}</Description>
          <Note>{step.note}</Note>
        </Page>
      </Body>
      <Footer>
        <Progress aria-label={`전체 ${steps.length}단계 중 ${page + 1}단계`}>{steps.map((_, index) => <Dot key={index} $active={index === page} />)}</Progress>
        <Navigation>
          <Previous type="button" disabled={page === 0} onClick={() => changePage(page - 1)}>이전</Previous>
          <Count>{page + 1}<span> / {steps.length}</span></Count>
          <Next type="button" onClick={() => page === steps.length - 1 ? dialog.current?.close() : changePage(page + 1)}>{page === steps.length - 1 ? "알겠어요" : "다음"}</Next>
        </Navigation>
      </Footer>
    </Modal>
  </>;
}

const PriceMenu = styled.div`
  z-index: 1; width: 92%; max-width: 290px; padding: 14px 18px; border: 1px solid #d8c394;
  border-radius: 8px 8px 18px 18px; background: #fffdf6; box-shadow: 4px 6px 0 #e8ddbf80;
  transform: rotate(-2deg); color: #31513d;
  > small { display: block; padding-bottom: 10px; color: #95753e; font-size: 9px; letter-spacing: .13em; }
  > div { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; padding: 7px 0; border-top: 1px dashed #dfd4b9; }
  span { font-size: 11px; } b { font-size: 17px; font-family: Georgia, serif; white-space: nowrap; }
  em { font-size: 10px; font-style: normal; font-weight: 400; margin-left: 3px; }
  p { margin: 7px 0 0; color: #95896e; font-size: 9px; }
`;
const RewardTicket = styled.div`
  z-index: 1; width: 92%; max-width: 290px; padding: 16px 12px; border: 1px solid #cbb37a; border-radius: 18px;
  background: #f5e8c4; box-shadow: 4px 6px 0 #e8ddbf80;
  > small { color: #90713b; font-size: 10px; letter-spacing: .06em; }
  > strong { display: block; padding-top: 11px; border-top: 1px dashed #cbb37a; font-family: "NotoSerifKR", serif; font-size: 17px; }
  > p { margin: 5px 0 0; font-size: 9px; color: #86774f; }
`;
const Stamps = styled.div`
  display: flex; justify-content: center; gap: 13px; margin: 12px 0;
  div { display: flex; flex-direction: column; align-items: center; gap: 5px; }
  span { display: grid; place-items: center; width: 37px; height: 37px; border: 1px dashed #42654b; border-radius: 50%; color: #42654b; font-size: 22px; box-shadow: inset 0 0 0 3px #42654b0a; }
  small { font-size: 9px; color: #807449; }
`;
const enter = keyframes`from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); }`;
const Help = styled.button`
  position: absolute; top: calc(12px + env(safe-area-inset-top)); right: calc(16px + env(safe-area-inset-right)); z-index: 3;
  width: 44px; height: 44px; border: 1px solid #efd28b66; border-radius: 50%;
  background: #173f32; color: #f7dfaa; font: 22px Georgia, serif; cursor: pointer;
  box-shadow: inset 0 0 0 4px #ffffff04; transition: background 160ms;
  &:hover { background: #285341; }
  &:focus-visible { outline: 2px solid #f7dfaa; outline-offset: 3px; }
`;
const Modal = styled.dialog`
  box-sizing: border-box; position: fixed; inset: 0; width: min(420px, calc(100% - 28px));
  max-width: none; max-height: calc(100dvh - 32px); margin: auto; padding: 0;
  border: 1px solid #e4cfa2; border-radius: 28px; background: #fff9ec; color: #234536;
  box-shadow: 0 24px 100px #0006; overflow: hidden; font-family: inherit;
  &[open] { display: flex; flex-direction: column; animation: ${enter} 220ms ease-out; }
  &::backdrop { background: rgb(1 15 10 / 74%); backdrop-filter: blur(4px); }
  button { font-family: inherit; cursor: pointer; }
  button:focus-visible { outline: 2px solid #9f7a36; outline-offset: 3px; }
  @media (max-width: 319px) { width: calc(100% - 20px); border-radius: 22px; }
  @media (prefers-reduced-motion: reduce) { &[open], * { animation: none !important; } }
`;
const Header = styled.div`
  display: flex; flex-shrink: 0; align-items: center; justify-content: space-between;
  padding: 14px 16px 0 24px; color: #7d8068; font-size: 11px; letter-spacing: .08em;
`;
const Close = styled.button`width: 36px; height: 36px; border: 0; border-radius: 50%; background: #eee8d9; color: #6b7466; font-size: 23px;`;
const Body = styled.div`min-height: 0; overflow-y: auto; overscroll-behavior: contain;`;
const Page = styled.div`padding: 0 24px; text-align: center; animation: ${enter} 220ms ease-out; @media(max-width:319px) { padding: 0 16px; }`;
const Scene = styled.div`
  position: relative; display: flex; align-items: center; justify-content: center; height: clamp(155px, 27dvh, 218px);
  margin: 2px 0 16px; isolation: isolate;
`;
const Orbit = styled.div`position: absolute; z-index: -1; width: 175px; height: 175px; max-height: 100%; border: 1px solid #dcc68e70; border-radius: 50%; background: radial-gradient(circle, #f3e8c9 0%, #f7efd9 65%, transparent 66%);`;
const Logo = styled(Image)`width: 210px; height: 100%; object-fit: contain; padding-bottom: 14px; filter: drop-shadow(0 8px 7px #6f53221c);`;
const Package = styled(Image)`width: min(220px, 95%); height: 100%; object-fit: contain; padding-bottom: 25px;`;
const MiniTag = styled.div`position: absolute; bottom: 0; padding: 7px 13px; background: #fffdf6; border: 1px solid #e6d9b9; border-radius: 30px; color: #8b713d; font-size: 10px; box-shadow: 0 3px 10px #9b79320a;`;
const Spark = styled.span<{ $left?: boolean }>`position: absolute; top: ${({ $left }) => $left ? "23%" : "60%"}; ${({ $left }) => $left ? "left: 6%;" : "right: 5%;"} color: #b99b54; font-size: ${({ $left }) => $left ? "23px" : "13px"};`;
const Question = styled.div`
  z-index: 1; width: 92%; padding: 18px 16px; text-align: left; border: 1px solid #e0d0ab; border-radius: 16px 16px 16px 3px;
  background: #fffdf6; box-shadow: 5px 8px 0 #e9dfc680; transform: rotate(-3deg);
  small { font-size: 10px; color: #9b8050; } p { font-size: 12px; line-height: 1.9; margin: 10px 0; word-break: keep-all; }
  i { font-style: normal; font-size: 9px; color: #9c9a86; }
`;
const Deck = styled.div`position: relative; width: 210px; height: 125px; max-width: 100%; margin-top: 30px;`;
const Card = styled.div<{ $index: number; $picked: boolean }>`
  position: absolute; left: ${({ $index }) => $index * 17}%; top: ${({ $picked }) => $picked ? "-22px" : "12px"}; width: 31%; height: 103px;
  display: grid; place-items: center; border: 2px solid #e5c782; border-radius: 7px; color: #ebcf8c;
  background: repeating-linear-gradient(45deg, #ffffff04 0 1px, transparent 1px 8px), #244a39;
  box-shadow: 0 4px 8px #16362625; transform: rotate(${({ $index }) => ($index - 2) * 7}deg);
  &::after { content: ''; position: absolute; inset: 5px; border: 1px solid #d1b57477; border-radius: 3px; }
  span { font-size: 27px; } b { position: absolute; top: -29px; font-size: 13px; color: #806636; font-weight: 500; }
`;
const Reading = styled.div`
  z-index: 1; width: 96%; padding: 20px 14px; border-radius: 15px; text-align: left;
  background: #244a39; color: #fff5da; box-shadow: 5px 7px 0 #d9caa3;
  small { color: #dec68e; font-size: 9px; } strong { display: block; font-family: "NotoSerifKR", serif; font-size: 14px; margin: 12px 0 8px; }
  p { margin: 0; font-size: 10px; line-height: 1.9; color: #e5e8d8; }
  div { display: flex; gap: 4px; margin-top: 15px; } span { width: 5px; height: 5px; border-radius: 10px; background: #ffffff40; } span:first-child { width: 17px; background: #e5c782; }
`;
const Label = styled.div`display: flex; justify-content: center; align-items: center; gap: 9px; color: #a17d39; font-size: 10px; letter-spacing: .08em; span { width: 16px; height: 1px; background: #ccb784; }`;
const Title = styled.h2`margin: 13px 0 15px; font-family: "NotoSerifKR", serif; font-size: clamp(20px, 5.6vw, 26px); font-weight: 600; letter-spacing: -.055em; line-height: 1.55; white-space: pre-line; word-break: keep-all;`;
const Description = styled.p`margin: 0; color: #667362; font-size: 12px; line-height: 1.9; white-space: pre-line; word-break: keep-all; overflow-wrap: anywhere;`;
const Note = styled.p`margin: 18px 0 8px; padding: 12px 10px; border-radius: 12px; background: #eee9d8; color: #7c795d; font-size: 10px; line-height: 1.7; word-break: keep-all;`;
const Footer = styled.div`flex-shrink: 0; padding: 12px 24px 22px; @media(max-width:319px) { padding: 10px 16px 16px; }`;
const Progress = styled.div`display: flex; gap: 5px; justify-content: center; margin-bottom: 17px;`;
const Dot = styled.span<{ $active: boolean }>`height: 4px; width: ${({ $active }) => $active ? "23px" : "5px"}; border-radius: 8px; background: ${({ $active }) => $active ? "#ad8b43" : "#d9d5c5"}; transition: width 200ms;`;
const Navigation = styled.div`display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 15px;`;
const Previous = styled.button`min-height: 44px; border: 1px solid #d9d2bb; border-radius: 12px; background: transparent; color: #56634f; font-size: 12px; &:disabled { opacity: .35; cursor: default; }`;
const Next = styled.button`min-height: 44px; border: 1px solid #244a39; border-radius: 12px; background: #244a39; color: #fff2cb; font-size: 12px; box-shadow: 0 4px 10px #244a3915;`;
const Count = styled.span`color: #53614b; font-size: 11px; font-variant-numeric: tabular-nums; span { color: #a8aa99; }`;
