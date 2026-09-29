'use client';
import styled from 'styled-components';

export default function TartEnergy({value}:{value:number}) {
  const percent=Math.min(100,Math.max(0,value));
  // Fill height uses the custard's own bounds (y=210..855), not the whole canvas.
  const cut=100*(855-645*percent/100)/1280;
  return <Energy aria-label={`오늘의 에너지 ${percent}%`}>
    <small>오늘의 에너지</small>
    <Character aria-hidden="true">
      <svg viewBox="0 0 1280 1280"><path fill="#e2bb79" d="M121 775C96 727 162 692 215 698L1057 709C1090 707 1160 742 1140 799L1069 985Q1042 1060 980 1059Q932 1110 864 1084Q791 1140 716 1110Q632 1157 550 1113Q460 1142 399 1090Q320 1117 275 1059Q211 1064 180 983Z"/><path fill="#fff2cf" d="M183 529L337 473L407 696L257 749Z"/></svg>
      <Body><Fill style={{clipPath:`inset(${cut}% 0 0 0)`}}/></Body>
      <Lines/>
    </Character>
    <strong>{percent}<span>%</span></strong>
    <p>{percent>=75?'가볍게 힘을 내봐요':percent>=45?'내 속도로 나아가요':'여유 있게 쉬어가요'}</p>
  </Energy>;
}
const Energy=styled.div`min-width:0;text-align:center;small{font-size:11px;color:#778068;}strong{font-size:clamp(28px,9vw,42px);color:#365e44;line-height:1.1;display:block;font-variant-numeric:tabular-nums;}strong span{font-size:16px;margin-left:3px;}p{font-size:11px;color:#8c7551;margin-top:7px;}`;
const Character=styled.div`position:relative;width:100%;max-width:180px;aspect-ratio:1;margin:0 auto;>svg{position:absolute;inset:0;width:100%;height:100%;}`;
const Body=styled.div`position:absolute;inset:0;background:#e4e5df;mask:url('/images/mascot/tart-oracle-body-mask-v1.svg') center/contain no-repeat;-webkit-mask:url('/images/mascot/tart-oracle-body-mask-v1.svg') center/contain no-repeat;`;
const Fill=styled.div`position:absolute;inset:0;background:linear-gradient(#ffe5a0,#e9bc58);transition:clip-path .8s ease;@media(prefers-reduced-motion:reduce){transition:none;}`;
const Lines=styled.div`position:absolute;inset:0;background:#866341;mask:url('/images/mascot/tart-oracle-watermark-v1.png') center/contain no-repeat;-webkit-mask:url('/images/mascot/tart-oracle-watermark-v1.png') center/contain no-repeat;`;
