"use client";
import Link from "next/link";
import { useRef } from "react";
import styled from "styled-components";
import { useAuth } from "@/components/auth/AuthProvider";
import Loading from "@/components/_common/Loading";
export default function MemberEntry() {
  const auth = useAuth(); const dialog = useRef<HTMLDialogElement>(null);
  return <Box>
    {auth.status === "loading" ? <Loading compact message="이용 정보를 확인하고 있어요" /> : auth.account ? <>
      <Link className="primary" href="/select">시작하기 ✦</Link>
    </> : <>
      <button className="primary" type="button" onClick={auth.signIn}>회원으로 이용하기</button>
      <button type="button" onClick={() => dialog.current?.showModal()}>비회원으로 이용하기</button>
    </>}
    {auth.error && <p role="alert">{auth.error} <button type="button" onClick={auth.refreshAccount}>다시 확인</button></p>}
    <Link className="privacy" href="/privacy">개인정보 안내</Link>
    <Benefits ref={dialog} aria-labelledby="member-benefits-title">
      <button className="close" type="button" aria-label="닫기" onClick={() => dialog.current?.close()}>×</button>
      <small>타로타르트와 조금 더 가까이</small><h2 id="member-benefits-title">회원으로 함께하면</h2>
      <ul><li>내 타로 기록 저장·다시 보기</li><li>타르트 시트 미리 구매 <em>준비 중</em></li><li>매일 광고 3회 보고 무료 시트 받기 <em>준비 중</em></li></ul>
      <p>비회원은 계정에 기록을 저장하거나<br />광고 무료 시트를 받을 수 없어요.</p>
      <Link href="/select" onClick={() => dialog.current?.close()}>그냥 이용할래요</Link>
      <button className="primary" type="button" onClick={() => { dialog.current?.close(); void auth.signIn(); }}>회원으로 이용할래요</button>
    </Benefits>
  </Box>;
}
const Box = styled.div`
  position:relative;z-index:1;display:grid;gap:10px;width:100%;
  button,a{box-sizing:border-box;font:inherit;} > button, > a.primary{display:block;width:100%;min-height:50px;padding:13px;border:1px solid #e7ca7080;border-radius:14px;background:#ffffff08;color:#fff7df;text-align:center;font-weight:700;cursor:pointer;text-decoration:none;}
  && .primary{background:linear-gradient(135deg,#f7da83,#d8a940,#f3cb69);color:#173629;}
  p{color:#e6dfc8;text-align:center;font-size:13px;line-height:1.7;}.links{display:flex;gap:18px;justify-content:center;align-items:center;color:#edcf8a;font-size:13px;}.links button{min-height:44px;border:0;background:none;color:inherit;cursor:pointer;}
  .privacy{text-align:center;font-size:11px;color:#c7ceb9;padding:8px;}button:focus-visible,a:focus-visible{outline:2px solid #edcf8a;outline-offset:3px;}
`;
const Benefits = styled.dialog`
  box-sizing:border-box;width:calc(100% - 28px);max-width:380px;max-height:90dvh;margin:auto;padding:36px 22px 24px;border:1px solid #d8bf8a;border-radius:24px;background:#fff8e9;color:#214433;overflow-y:auto;
  &::backdrop{background:#03150fbb;backdrop-filter:blur(4px);}small{color:#8d7139;font-size:12px;}h2{font-size:24px;margin:12px 0 20px;}ul{padding-left:20px;}li{font-size:14px;line-height:1.8;margin:14px 0;}em{font-size:10px;font-style:normal;color:#7a6c50;white-space:nowrap;}
  && p{color:#657460;font-size:12px;line-height:1.8;margin:22px 0;}
  > a, > button:not(.close){display:block;width:100%;min-height:48px;padding:12px 8px;margin-top:10px;border:1px solid #d4be88;border-radius:12px;background:transparent;color:inherit;text-align:center;text-decoration:none;font-size:14px;cursor:pointer;}
  .close{position:absolute;right:12px;top:10px;min-width:40px;min-height:40px;border:0;background:none;color:inherit;font-size:24px;cursor:pointer;}
`;
