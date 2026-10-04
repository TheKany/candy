"use client";
import Link from 'next/link';
import styled from 'styled-components';
import { groupActivities } from '@/util/readingPresentation';
import type { AccountActivity } from '@/types/mypageTypes';
import DeleteRecordButton from './DeleteRecordButton';
const kinds: Record<string, string> = { one: '한 장 타로', three: '세 장 타로', five: '다섯 장 타로', monthly: '월별 타로' };

export default function ActivityList({ items, onDelete }: { items: AccountActivity[]; onDelete?: (savedId: string) => Promise<void> }) {
  return <List>{groupActivities(items).map(group => {
    const parent = group.items.find(item => item.ordinal === 1);
    const first = parent ?? group.items[0];
    const savedId = group.items.find(item => item.savedId)?.savedId;
    const followUps = group.items.filter(item => item.ordinal > 1);
    const mainQuestion = parent?.title || parent?.topic || '메인 질문';

    return <li key={group.id}>
      <div className="record-header">
        <div className="record-meta">
          <time dateTime={first.created_at}>{new Date(first.created_at).toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' })}</time>
          <span>{kinds[first.kind] || '타로'}</span>
          {!savedId && <span className="save-status">저장 안 함</span>}
        </div>
        {savedId && onDelete && <div className="record-actions"><DeleteRecordButton onDelete={() => onDelete(savedId)} /></div>}
      </div>
      <div className="question-row">
        <div className="main-question">
          {parent?.savedId
            ? <Link href={`/account/readings/${parent.savedId}?reading=0`} title={mainQuestion} aria-label={`메인 질문: ${mainQuestion}`}>{mainQuestion}</Link>
            : <span title={mainQuestion}>{mainQuestion}</span>}
        </div>
        {followUps.length > 0 && <ul className="follow-ups" aria-label="연계 질문">
          {followUps.map(item => {
            const label = `연계질문 ${item.ordinal - 1}`;
            const question = item.title || item.topic;
            return <li key={item.ordinal}>
              {item.savedId
                ? <Link className="badge" href={`/account/readings/${item.savedId}?reading=${item.ordinal - 1}`} title={question} aria-label={`${label}: ${question}`}>{label}</Link>
                : <button type="button" className="badge" disabled title={`${question} · 저장 안 함`} aria-label={`${label}: ${question} · 저장 안 함`}>{label}</button>}
            </li>;
          })}
        </ul>}
      </div>
    </li>;
  })}</List>;
}

const List = styled.ul`
  list-style:none;padding:0;margin:4px 0 12px;
  >li{position:relative;padding:10px 0;border-bottom:1px solid #ddcc9f20;}
  .record-header{padding-right:36px;}
  .record-meta{display:flex;flex-wrap:wrap;align-items:center;gap:3px 8px;font-size:10px;line-height:1.5;color:#acbda8;}
  .record-meta>span{color:#c6b584;}
  .record-meta .save-status{color:#97aa99;}
  .record-actions{position:absolute;right:0;top:8px;}
  .record-actions>button{min-width:28px;min-height:28px;padding:5px;background:transparent;}
  .record-actions svg{width:15px;height:15px;}
  .question-row{display:flex;flex-wrap:wrap;align-items:center;justify-content:flex-start;gap:4px 8px;margin-top:4px;padding-right:32px;}
  .main-question{flex:0 1 auto;min-width:0;max-width:100%;}
  .main-question>a,.main-question>span{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden;color:inherit;text-decoration:none;font-size:13px;line-height:1.8;word-break:keep-all;overflow-wrap:anywhere;}
  .follow-ups{display:flex;flex-wrap:wrap;align-items:center;gap:5px;max-width:100%;list-style:none;margin:0;padding:0 0 0 8px;border-left:1px solid #d8c08635;}
  .follow-ups>li{margin:0;padding:0;}
  .badge{display:inline-flex;align-items:center;justify-content:center;min-height:28px;padding:4px 8px;border:1px solid #d8c08645;border-radius:6px;background:#edcf8a0d;color:#edcf8a;text-decoration:none;font:inherit;font-size:10px;line-height:1.4;white-space:nowrap;box-sizing:border-box;}
  a.badge:hover{background:#edcf8a20;border-color:#edcf8a;}
  .main-question>a:hover{color:#edcf8a;}
  a:focus-visible{outline:2px solid #edcf8a;outline-offset:3px;border-radius:8px;}
  .badge:focus-visible{border-radius:6px;}
  .badge:disabled{opacity:1;color:#a9b8aa;border-color:#a9b8aa25;background:#ffffff04;cursor:default;}
  @media(max-width:320px){.main-question>a,.main-question>span{font-size:12px;}.question-row{column-gap:6px;}.follow-ups{padding-left:6px;}.badge{padding:4px 6px;}}
`;
