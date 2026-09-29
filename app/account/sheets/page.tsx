"use client";
import Link from "next/link";
import { useState } from "react";
import styled from "styled-components";
import { AccountPageShell } from "@/components/account/AccountChrome";
import { useAuth } from "@/components/auth/AuthProvider";
const sheets = [
  { name: '고급 시트', price: 990, icon: '✦', description: '새로운 질문, 첫 타로 상담' },
  { name: '기본 시트', price: 500, icon: '✧', description: '이야기를 이어가는 연계질문' },
];
export default function Page() {
  const auth = useAuth();
  const [quantities, setQuantities] = useState([0, 0]);
  const changeQuantity = (index: number, change: number) => setQuantities(previous => previous.map((value, i) => i === index ? Math.min(1000, Math.max(0, value + change)) : value));
  const total = sheets.reduce((sum, item, index) => sum + item.price * quantities[index], 0);
  return <Shop>
    <nav><Link href="/account">← 마이페이지</Link><span>타르트 시트 구매</span></nav>
    {auth.status === 'super' ? <><h1>시트 없이 자유롭게</h1><p>무료 이용 계정이에요.<br/>상담에 시트가 필요하지 않아요.</p></> : <>
      <header className="intro"><small>TAROTART · SHEET SHOP</small><h1>다음 이야기를 위한<br/>시트를 담아주세요</h1><p>필요한 만큼, 마음이 가는 만큼.</p></header>
      <section className="order" aria-label="시트 주문서">
        <div className="order-label"><span>YOUR LITTLE ORDER</span><span aria-hidden="true">✦</span></div>
        <h2><em>01</em> 어떤 시트를 담을까요?</h2>
        <div className="choices" role="group" aria-label="시트 종류">
          {sheets.map((item, index) => <div key={item.name} className={`choice ${quantities[index] > 0 ? 'selected' : ''}`}>
            <div className="choice-header">
            <span className="symbol" aria-hidden="true">{item.icon}</span>
            <span className="choice-copy"><strong>{item.name}</strong><small>{item.description}</small><b>1장 {item.price}원</b></span>
            <span className="check" aria-hidden="true">{quantities[index] > 0 ? '✓' : ''}</span>
            </div>
            <div className="stepper" role="group" aria-label={`${item.name} 구매 수량`}>
              <button type="button" aria-label={`${item.name} 수량 줄이기`} disabled={quantities[index] === 0} onClick={() => changeQuantity(index, -1)}>−</button>
              <output aria-live="polite" aria-label={`${item.name} 선택 수량`}>{quantities[index]}<small>장</small></output>
              <button type="button" aria-label={`${item.name} 수량 늘리기`} disabled={quantities[index] >= 1000} onClick={() => changeQuantity(index, 1)}>+</button>
            </div>
          </div>)}
        </div>
        <small className="limit">두 종류를 함께 담을 수 있어요. 종류별 최대 1,000장</small>
        <div className="receipt" aria-live="polite">
          <h2><em>02</em> 담은 시트를 확인해주세요</h2>
          {sheets.map((item, index) => <div className="receipt-item" key={item.name}><span>{item.name} {quantities[index]}장</span><span>{(item.price * quantities[index]).toLocaleString('ko-KR')}원</span></div>)}
          <div><span>합계 금액</span><strong>{total.toLocaleString('ko-KR')}<small>원</small></strong></div>
        </div>
        <p className="exchange-note">고급 시트 1장은 기본 시트 2장으로 교환할 수 있어요.</p>
      </section>
      <footer><button className="action" disabled>{total === 0 ? '시트를 담아주세요' : '결제 준비 중'}</button><p>지금은 결제가 진행되지 않아요.</p></footer>
    </>}
  </Shop>;
}
const Shop = styled(AccountPageShell)`
  .choices .choice{display:block;}.choice-header{display:flex;align-items:center;gap:10px;}.choice .stepper{margin-top:14px;width:100%;}.receipt .receipt-item{font-size:12px;color:#75816c;}.receipt h2{margin-top:0;}
  max-width:540px;margin:0 auto;padding-bottom:calc(20px + env(safe-area-inset-bottom));
  .intro{padding:26px 2px 20px;}.intro>small{font-size:10px;letter-spacing:.16em;color:#d6bc81;}.intro h1{font-family:"NotoSerifKR",serif;font-size:clamp(23px,6vw,29px);margin:10px 0;letter-spacing:-.04em;}.intro p{margin:0;color:#b9cbbb;font-size:13px;}
  .order{background:#fff8e7;color:#234636;border:1px solid #e2cd9a;border-radius:7px 7px 22px 22px;padding:20px clamp(12px,4vw,22px);box-shadow:0 7px 0 #051f1630;}.order-label{display:flex;justify-content:space-between;align-items:center;color:#92784c;font-size:9px;letter-spacing:.13em;border-bottom:1px dashed #d8c9a7;padding-bottom:15px;}.order h2{font-size:15px;margin:20px 0 14px;display:flex;align-items:center;gap:9px;}.order h2 em{font:italic 16px Georgia,serif;color:#a38b5b;}
  .choices{display:grid;gap:10px;}.choice{width:100%;display:flex;align-items:center;gap:10px;text-align:left;padding:15px 12px;background:#fffdf6;border:1px solid #ded4bb;border-radius:12px;color:#294a37;transition:background .18s,border-color .18s;}.choice.selected{border-color:#53735b;background:#edf0df;box-shadow:inset 0 0 0 1px #53735b;}.symbol{font:30px Georgia,serif;color:#a98a47;flex-shrink:0;}.choice-copy{flex:1;min-width:0;}.choice-copy strong{display:block;font:600 17px "NotoSerifKR",serif;}.choice-copy small{display:block;font-size:11px;line-height:1.6;color:#75816c;margin:5px 0;}.choice-copy b{font-size:13px;font-weight:500;}.check{display:grid;place-items:center;flex-shrink:0;width:21px;height:21px;border:1px solid #bbbea5;border-radius:50%;font-size:14px;}.selected .check{background:#355640;color:#fff8e7;border-color:#355640;}
  .quantity-section{border-top:1px dashed #d8c9a7;margin-top:22px;padding-top:2px;}.selection-hint{font-size:12px;color:#78816a;margin:0 0 14px;}.stepper{display:flex;align-items:center;justify-content:space-between;gap:10px;max-width:250px;margin:auto;background:#f3eddd;border:1px solid #ded2b3;border-radius:12px;padding:5px;}.stepper button{width:46px;height:46px;border:0;border-radius:9px;background:#fffdf6;color:#31553e;font-size:24px;flex-shrink:0;}.stepper output{font-size:27px;font-variant-numeric:tabular-nums;white-space:nowrap;}.stepper output small{font-size:12px;margin-left:5px;}.limit{display:block;text-align:center;color:#8c8d76;font-size:10px;margin-top:10px;}
  .receipt{border-top:1px dashed #cdbc97;margin-top:22px;padding-top:18px;}.receipt>span{font-size:12px;color:#75816c;}.receipt>div{display:flex;align-items:baseline;justify-content:space-between;gap:8px;margin-top:8px;font-size:14px;}.receipt strong{font-size:28px;white-space:nowrap;letter-spacing:-.04em;}.receipt strong small{font-size:14px;margin-left:4px;}.exchange-note{font-size:10px;line-height:1.7;color:#8c8065;margin:14px 0 0;}
  footer{padding-top:22px;}footer p{text-align:center;font-size:11px;color:#b9cbbb;margin:9px 0 0;}
  @media(max-width:320px){.choice{gap:8px;padding:12px 9px;}.symbol{font-size:24px;}.choice-copy strong{font-size:15px;}.order h2{font-size:14px;}}
  @media(prefers-reduced-motion:reduce){.choice{transition:none;}}
`;
