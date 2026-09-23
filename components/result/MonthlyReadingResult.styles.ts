"use client";
import styled from "styled-components";

export const Shell = styled.section`
  width:100%;height:100dvh;display:grid;grid-template-rows:auto minmax(0,1fr) auto;
  overflow:hidden;color:#fff5dc;background:radial-gradient(ellipse at top left,#40563b70,transparent 55%),#0b2d24;
  padding-top:env(safe-area-inset-top);word-break:keep-all;overflow-wrap:anywhere;
`;
export const Header = styled.header`
  text-align:center;padding:15px 12px 12px;border-bottom:1px solid #edcf8a22;
  span{color:#dac58e;font-size:11px;letter-spacing:1px;}h1{font-size:20px;margin:7px 0 0;font-weight:500;}
`;
export const Body = styled.div`
  overflow-y:auto;overflow-x:hidden;min-height:0;overscroll-behavior:contain;padding:20px clamp(12px,5vw,24px) 28px;
  >p{text-align:center;color:#becdbf;font-size:13px;line-height:1.8;margin:0 0 20px;}
`;
export const Grid = styled.div`
  display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;
  @media(min-width:380px){grid-template-columns:repeat(3,minmax(0,1fr));}
  button{min-width:0;padding:14px 7px;border:1px solid #d9bf7544;border-radius:16px;background:#ffffff06;color:inherit;cursor:pointer;}
  strong{display:block;color:#edcf8a;font-size:16px;margin-bottom:10px;}
  img{display:block;margin:0 auto 10px;width:66px;height:110px;border-radius:5px;}
  b,span{display:block;font-size:12px;line-height:1.65;}span{color:#bbcbba;font-size:11px;margin-top:4px;}
  button:focus-visible{outline:2px solid #edcf8a;outline-offset:2px;}
`;
export const Hero = styled.div`
  text-align:center;margin-bottom:26px;img{border-radius:7px;display:block;margin:0 auto 16px;}
  p{font-size:13px;color:#dbc58f;margin:8px 0;}h2{font-size:24px;font-weight:500;margin:8px 0 18px;}
  blockquote{margin:0;padding:20px 16px;border:1px solid #d7bf7866;border-radius:18px;background:#ffffff07;font-size:18px;line-height:1.85;}
`;
export const Category = styled.section`
  padding:20px 0;border-bottom:1px solid #dbc58f25;
  h3{font-size:16px;color:#edcf8a;margin:0 0 12px;}p{font-size:15px;line-height:1.95;margin:0;white-space:pre-line;}
`;
export const Luck = styled.section`
  text-align:center;margin-top:26px;padding:22px 16px;border-radius:20px;background:#ffffff07;
  h3{font-size:16px;margin:0;}svg{display:block;margin:10px auto 0;}
  strong{display:block;font-size:30px;color:#9cd6a5;}p{font-size:14px;line-height:1.85;margin:14px 0;}
  small{display:block;font-size:11px;color:#b6c6b8;line-height:1.7;}
`;
export const Footer = styled.footer`
  display:flex;align-items:center;justify-content:center;gap:8px;padding:12px 12px calc(12px + env(safe-area-inset-bottom));
  border-top:1px solid #edcf8a33;background:#0b2d24;
  button{flex:1;min-width:0;min-height:44px;padding:8px 4px;border:1px solid #ddc47e66;border-radius:12px;background:transparent;color:#fff0c5;font-size:13px;cursor:pointer;}
  button:disabled{opacity:.3;cursor:default;}button:focus-visible{outline:2px solid #edcf8a;outline-offset:2px;}
  .all{background:#edcf8a;color:#17392c;}
`;
