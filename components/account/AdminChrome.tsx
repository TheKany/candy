"use client";
import styled from "styled-components";
import { AccountPageShell } from "./AccountChrome";
export const AdminPage = styled(AccountPageShell)`
  .eyebrow{font-size:11px;letter-spacing:.16em;color:#edcf8a;margin-top:24px;}
  h1{margin-top:8px;} .number{font-family:monospace;overflow-wrap:anywhere;line-height:1.7;}
  form{display:flex;gap:8px;margin:22px 0;}input{min-width:0;flex:1;background:#ffffff09;border:1px solid #d9c38b55;border-radius:8px;padding:12px;color:#fff8df;font:inherit;font-size:12px;}
  input:focus-visible{outline:2px solid #efd18c;} .small-button{border:1px solid #d9c38b55;border-radius:8px;padding:10px 12px;background:#edcf8a;color:#173b2c;min-height:44px;}
  .member-list{padding:0;list-style:none;margin:0;}.member{border-top:1px solid #d9c38b40;padding:20px 0;}.member header{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:12px;}.member header .number{font-size:13px;min-width:0;}.status-badge{font-size:11px;white-space:nowrap;border-radius:20px;padding:5px 9px;background:#ffffff0d;color:#d4dfc7;}
  .meta{display:flex;flex-wrap:wrap;align-items:center;gap:12px;justify-content:space-between;font-size:12px;}.meta time{color:#bdcbbd;}select{max-width:100%;padding:9px;background:#fff6dd;color:#183c2d;border-radius:7px;border:0;min-height:44px;}.detail{display:inline-flex;align-items:center;min-height:44px;color:#edcf8a;text-decoration:underline;}
  .confirm{margin-top:14px;padding:14px;border-radius:12px;background:#fff6dd;color:#183c2d;}.confirm p{margin:0 0 10px;font-size:13px;}.confirm .plain{color:#183c2d;}.pager{display:flex;justify-content:space-between;align-items:center;border-top:1px solid #d9c38b40;padding-top:15px;font-size:12px;}.empty{padding:30px 0;color:#bdcbbd;}.note{font-size:12px;color:#bdcbbd;}
`;
