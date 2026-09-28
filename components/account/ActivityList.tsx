"use client";
import Link from 'next/link';
import styled from 'styled-components';
import { groupActivities } from '@/util/readingPresentation';
import type { AccountActivity } from '@/types/mypageTypes';
const kinds:Record<string,string>={one:'한 장 타로',three:'세 장 타로',five:'다섯 장 타로',monthly:'월별 타로'};
export default function ActivityList({items}:{items:AccountActivity[]}){
  const entry=(item:AccountActivity)=>{
    const content=<><span><small>{item.ordinal===1?'처음 질문':`연계 질문 ${item.ordinal-1}`} · {kinds[item.kind]||'타로'}</small><strong>{item.title||item.topic}</strong></span>{item.savedId?<b aria-hidden>›</b>:<em>저장 안 함</em>}</>;
    return item.savedId?<Link className="entry" href={`/account/readings/${item.savedId}?reading=${item.ordinal-1}`}>{content}</Link>:<div className="entry">{content}</div>;
  };
  return <List>{groupActivities(items).map(group=>{const parent=group.items.find(i=>i.ordinal===1);return <li key={group.id}><time>{new Date((parent||group.items[0]).created_at).toLocaleDateString('ko-KR',{timeZone:'Asia/Seoul'})}</time>{parent?entry(parent):<p>처음 질문</p>}<ul>{group.items.filter(i=>i.ordinal>1).map(item=><li key={item.ordinal}>{entry(item)}</li>)}</ul></li>;})}</List>;
}
const List=styled.ul`
  list-style:none;padding:0;margin:12px 0;>li{padding:16px 14px;border:1px solid #edcf8a25;border-radius:14px;margin:0 0 14px;background:#ffffff03;}time{font-size:10px;color:#acbda8;}.entry{display:flex;align-items:center;gap:10px;padding:14px 0;text-decoration:none;color:inherit;}.entry>span{flex:1;min-width:0;}.entry small{display:block;font-size:10px;color:#d9bf80;margin-bottom:6px;}.entry strong{display:block;font-size:14px;font-weight:500;line-height:1.65;word-break:keep-all;overflow-wrap:anywhere;}.entry b{color:#d9bf80;font-size:23px;font-weight:400;}.entry em{font-size:10px;white-space:nowrap;color:#97aa99;font-style:normal;}ul{list-style:none;border-left:1px solid #d8c08645;margin:4px 0 0 5px;padding:0 0 0 16px;}ul:empty{display:none;}ul li{position:relative;}ul li:before{position:absolute;content:'';left:-17px;top:24px;width:9px;height:1px;background:#d8c08660;}ul strong{font-size:12px;}@media(max-width:320px){>li{padding:14px 10px;}.entry strong{font-size:12px;}}
`;
