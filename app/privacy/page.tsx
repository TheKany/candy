"use client";

import Link from "next/link";
import styled from "styled-components";

export default function PrivacyPage() {
  return <Page>
    <Link className="back" href="/">← 홈으로</Link>
    <header>
      <span className="eyebrow">개인정보 안내</span>
      <h1>내 이야기는<br />어떻게 보관되나요?</h1>
      <p>타로타르트에 남기는 이야기,<br />궁금한 점만 쉽게 정리했어요.</p>
    </header>
    <Summary aria-label="핵심 안내">
      <span aria-hidden="true">✦</span>
      <div><strong>내 기록에 담을지는 내가 선택해요</strong>
        <p>회원이 ‘내 기록에 저장’을 눌렀을 때만 질문·카드·해설을 계정에 보관해요.</p></div>
    </Summary>
    <div className="questions">
      <Card>
        <h2>내 질문이 자동으로 저장되나요?</h2>
        <p>내 계정의 상담 기록에 자동으로 저장되지는 않아요. 회원이 <strong>‘내 기록에 저장’</strong>을 누르면 질문과 뽑은 카드, 해설이 함께 저장돼요.</p>
        <p>이어서 나눈 추가 질문과 해설도 한 번에 담을 수 있어요.</p>
        <p>로그인한 회원의 이용내역에는 날짜·타로 종류·일반적인 주제 분류가 남아요. 저장하지 않은 질문 원문과 해설은 이 내역에 담지 않아요.</p>
      </Card>
      <Card>
        <h2>저장한 이야기는 누가 볼 수 있나요?</h2>
        <p><strong>다른 회원은 내 기록을 볼 수 없어요.</strong> 내가 로그인한 계정에서 다시 꺼내볼 수 있어요.</p>
        <p>다만 서비스를 관리하는 운영자는 저장된 내용을 확인할 수 있어요.</p>
      </Card>
      <Card>
        <h2>저장한 내용을 지울 수 있나요?</h2>
        <p><strong>‘내 타로 기록’에서 직접 삭제</strong>할 수 있어요.</p>
        <p>PDF나 이미지로 따로 내려받았다면, 그 파일은 내 기기에서 직접 지워주세요.</p>
      </Card>
      <Card>
        <h2>비회원으로 이용하면요?</h2>
        <p>질문과 해설을 계정의 상담 기록에 보관하지 않아요. 상담을 이어가는 동안만 화면에 잠시 유지해요.</p>
        <p>이야기를 간직하고 싶다면 <strong>PDF나 이미지로 내려받을 수 있어요.</strong></p>
      </Card>
      <Card>
        <h2>카카오 비밀번호도 저장하나요?</h2>
        <p><strong>아니요. 카카오 비밀번호는 받거나 저장하지 않아요.</strong></p>
        <p>로그인을 유지하고 내 기록을 찾아주기 위한 계정 정보와 회원 구분을 보관해요.</p>
        <p>직접 고른 대표 카드, 시트 잔량, 날짜별 광고 완료·무료 시트 사용 횟수도 계정에 보관해요.</p>
      </Card>
    </div>
    <section className="processing" aria-labelledby="processing-title">
      <span className="eyebrow">해설을 준비하는 과정</span>
      <h2 id="processing-title">해설을 위해 전달되는 정보</h2>
      <p>타로타르트는 <strong>타로 전문가의 해설을 바탕으로 생성되는 AI 서비스</strong>예요.</p>
      <p>질문에 맞는 해설을 만들기 위해 아래 내용을 Google에 전달해요. 내 기록에 저장하지 않아도 이 과정은 필요해요.</p>
      <dl>
        <div><dt>전달하는 내용</dt><dd>작성한 질문과 뽑은 카드 정보<br />추가 질문을 했다면 필요한 이전 질문과 상담 요약</dd></div>
        <div><dt>따로 보내지 않는 정보</dt><dd>카카오 회원 ID와 이메일은 해설 요청에 따로 붙여 보내지 않아요. 다만 질문 안에 직접 적은 정보는 함께 전달돼요.</dd></div>
        <div><dt>전달된 내용의 보관</dt><dd>Google에서 처리·보관하는 방식은 Google의 이용 조건을 따라요. 타로타르트의 기록 삭제와는 별개예요.</dd></div>
      </dl>
      <p className="note">이름이나 연락처처럼 나 또는 다른 사람을 알아볼 수 있는 정보는 질문에 적지 않는 것을 권해요.</p>
    </section>
    <section className="contact" aria-labelledby="contact-title">
      <span className="eyebrow">궁금한 점이 남았다면</span>
      <h2 id="contact-title">편하게 물어보세요</h2>
      <p>운영자 Kaan</p>
      <a className="contact-link" href="mailto:kaanzy@naver.com"><span>개인정보 · 서비스 문의</span><strong>kaanzy@naver.com</strong></a>
      <a className="contact-link kakao" href="https://open.kakao.com/o/sIZKvBPi" target="_blank" rel="noopener noreferrer"><span>좋았던 점, 아쉬웠던 점</span><strong>카카오톡으로 의견 보내기 ↗</strong></a>
    </section>
    <Link className="home" href="/">홈으로 돌아가기</Link>
  </Page>;
}

const Page = styled.main`
  width:100%;padding:12px clamp(14px,4vw,20px) 24px;color:#f5f0e4;
  font-family:Arial,"Apple SD Gothic Neo","Malgun Gothic",sans-serif;
  background:linear-gradient(160deg,#123b2d 0%,#0c3427 35%,#09291f 100%);overflow-wrap:anywhere;
  a{font-family:inherit;}a:focus-visible{outline:2px solid #efd18e;outline-offset:4px;}
  .back{display:inline-flex;align-items:center;min-height:44px;color:#d3ddcf;font-size:14px;}
  header{padding:10px 0 16px;}
  .eyebrow{display:block;font-size:12px;font-weight:700;letter-spacing:.06em;color:#e9cd8f;margin-bottom:8px;}
  h1{font-size:clamp(24px,6vw,28px);font-weight:700;line-height:1.4;letter-spacing:-.045em;margin-bottom:10px;}
  h2{font-size:18px;line-height:1.55;letter-spacing:-.025em;margin:0 0 14px;word-break:keep-all;overflow-wrap:anywhere;}
  p,dd{font-size:15px;line-height:1.7;color:#dce3d8;word-break:keep-all;overflow-wrap:anywhere;}
  p+p{margin-top:8px;}strong{font-weight:700;color:#fff6df;}
  .questions{display:grid;gap:10px;}
  .processing{margin-top:22px;padding:20px 0;border-top:1px solid #d6c79933;border-bottom:1px solid #d6c79933;}
  dl{margin-top:16px;}dl>div+div{margin-top:14px;padding-top:14px;border-top:1px solid #ffffff12;}
  dt{font-size:13px;font-weight:700;color:#edcf91;margin-bottom:6px;}dd{margin:0;}
  .note{margin-top:16px;padding:12px;border-radius:10px;background:#ffffff07;font-size:14px;color:#d0d9cd;}
  .contact{padding-top:20px;}.contact>p{font-size:13px;margin-bottom:12px;}
  .contact-link{display:flex;flex-direction:column;gap:4px;margin-top:8px;padding:12px 14px;border-radius:10px;border:1px solid #c8bc9355;text-decoration:none;}
  .contact-link span{font-size:12px;color:#d1dacb;}.contact-link strong{font-size:15px;line-height:1.6;}
  .kakao{background:#fee500;border-color:#fee500;}.kakao span{color:#544c17;}.kakao strong{color:#282414;}
  .home{display:flex;align-items:center;justify-content:center;min-height:48px;margin-top:26px;font-size:14px;color:#d7dfd0;}
  @media(max-width:320px){h2{font-size:17px;}}
`;
const Summary = styled.aside`
  display:flex;align-items:flex-start;gap:8px;padding:14px 12px;margin-bottom:16px;
  border-radius:12px;background:#f7edcf;color:#294734;
  >span{color:#8d713a;font-size:20px;line-height:1.4;}
  strong{display:block;color:#284831;font-size:15px;line-height:1.7;}
  p{margin-top:6px;color:#51614b;font-size:14px;line-height:1.65;}
`;
const Card = styled.section`
  border:1px solid #ddcca538;border-radius:12px;background:#ffffff06;overflow:hidden;
  && h2{display:flex;align-items:baseline;gap:9px;margin:0;padding:12px 14px;background:#061e1780;border-bottom:1px solid #ddcca538;font-size:16px;line-height:1.5;color:#f6e6be;}
  h2::before{content:"Q";flex-shrink:0;font-size:14px;font-weight:700;color:#edc978;}
  >p{margin:0 14px;padding:0;}
  >h2+p{padding-top:12px;}
  >p:last-child{padding-bottom:14px;}
`;
