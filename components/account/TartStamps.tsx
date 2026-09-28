"use client";
import styled from "styled-components";
export default function TartStamps({ ads, available }: { ads: number; available: boolean }) {
  if (ads >= 3) return <Done role="status">오늘의 무료 시트를 받았어요. 내일 또 만나요.</Done>;
  return <Box><header><h2>오늘의 타르트 스탬프</h2><span>{ads} / 3</span></header><p>광고 3번을 보면 무료 시트 한 장을 드려요.</p>
    <div className="stamps">{[0,1,2].map(i => <div key={i} className={i<ads?"stamp done":"stamp"} aria-label={`${i+1}번째 광고 ${i<ads?"완료":"미완료"}`}><div className="seal" aria-hidden="true"><div className="tart"><span className="crust"/><span className="filling"/><span className="berry"/></div></div><small>{["첫 번째","두 번째","세 번째"][i]}</small></div>)}</div>
    <button type="button" disabled={!available}>광고 준비 중</button><p className="limit">계정당 하루 광고 3회 · 무료 시트 사용 하루 1장</p>
  </Box>;
}
const Done=styled.p`text-align:center;color:#cedbbb;font-size:12px!important;`;
const Box=styled.section`
  margin-top:18px;padding:18px 14px 12px;border-radius:16px;background:#f5ebd2;color:#314735;header{display:flex;align-items:center;justify-content:space-between;gap:6px;}h2{font-size:15px;margin:0;}header>span{font-size:12px;}p{font-size:12px;margin:8px 0 0;color:#67735d;}.stamps{display:flex;gap:8px;justify-content:space-between;margin:18px 0;}.stamp{display:grid;justify-items:center;gap:7px;flex:1;}small{font-size:11px;color:#737d64;}.seal{display:grid;place-items:center;width:66px;height:66px;border:1px dashed #b5b79c;border-radius:50%;background:#ece5ce;}.tart{position:relative;width:48px;height:40px;opacity:.45;filter:grayscale(1);}.crust{position:absolute;left:4px;right:4px;bottom:2px;height:24px;background:repeating-linear-gradient(90deg,#c59750 0 4px,#ddb371 4px 8px);clip-path:polygon(0 0,100% 0,88% 100%,12% 100%);border-radius:0 0 8px 8px;}.filling{position:absolute;top:5px;left:0;width:48px;height:22px;border:4px solid #dfb66c;background:#fff0c6;border-radius:50%;box-shadow:0 2px 0 #bd8c49;}.berry{position:absolute;top:1px;left:17px;width:14px;height:17px;border-radius:45% 45% 55% 55%;background:#c8786b;transform:rotate(-10deg);box-shadow:inset 3px 0 0 #e7a08a;}.berry::before{content:"";position:absolute;top:-3px;left:4px;width:10px;height:6px;border-radius:8px 0 8px 0;background:#638e60;}.done .seal{border:1px solid #afbc97;background:#e3e9cf;}.done .tart{opacity:1;filter:none;}button{width:100%;min-height:44px;border:0;border-radius:10px;background:#254d39;color:#fff5dd;font-size:13px;}.limit{text-align:center;font-size:11px;}
  @media(max-width:320px){.seal{width:58px;height:58px;}}
`;
