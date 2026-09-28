"use client";
import styled from "styled-components";
export const AccountPageShell = styled.main`
  width:100%;min-height:100dvh;padding:16px clamp(14px,4vw,22px) 30px;box-sizing:border-box;color:#f7efdb;background:#10362a;font-family:Arial,"Apple SD Gothic Neo","Malgun Gothic",sans-serif;
  *{box-sizing:border-box;}nav{display:flex;align-items:center;justify-content:space-between;gap:10px;padding-bottom:15px;border-bottom:1px solid #ddcc9f30;font-size:13px;}a{color:inherit;text-decoration:none;}button,select{font:inherit;}button{cursor:pointer;}button:disabled{opacity:.5;cursor:default;}a:focus-visible,button:focus-visible,select:focus-visible{outline:2px solid #efd18c;outline-offset:4px;}h1{font-size:23px;line-height:1.5;margin:22px 0 10px;}h2{font-size:16px;font-weight:600;}p{font-size:14px;line-height:1.8;overflow-wrap:anywhere;}.muted{color:#bdcbbd;}.action{display:block;width:100%;padding:13px;border:0;border-radius:12px;background:#efd18c;color:#183c2d;min-height:48px;text-align:center;}.status{padding:28px 0;}.error{color:#f3cfab;}.plain{border:0;background:transparent;color:#d6dfcb;min-height:44px;padding:8px 10px;}
`;
