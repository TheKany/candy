import type { ReadingExport } from './readingExportLayout';
import type { AccountActivity } from '../types/mypageTypes';

export type PresentedCard = { id:number; name:string; label?:string; detail:string; headline?:string; remember?:string; avoid?:string };
export function presentReading(reading: ReadingExport) {
  const sections=reading.sections;
  const drawn=sections.filter(s=>s.cardId!==undefined && s.title.startsWith('뽑은 카드'));
  const monthly=drawn.length===0;
  const source=monthly?sections.filter(s=>s.cardId!==undefined):drawn;
  const details=sections.filter(s=>!s.title.startsWith('뽑은 카드') && !s.title.startsWith('기억할 것') && !s.title.startsWith('주의할 것') && s.title!=='종합 해설' && s.title!=='지금 해볼 수 있는 일');
  const cards:PresentedCard[]=source.map((s,i)=>{
    const name=s.title.split(' · ').slice(1).join(' · ') || s.title;
    const start=sections.indexOf(s);
    const end=monthly ? sections.findIndex((next,j)=>j>start && next.cardId!==undefined) : -1;
    const group=monthly?sections.slice(start,end<0?undefined:end):[];
    const parts=(details[i]?.text||s.text).split(/\n\s*\n/);
    return {id:s.cardId!,name,label:monthly?s.title.split(' · ')[0]:details[i]?.title.split(' · ')[0],
      headline:!monthly&&parts.length>1?parts[0]:undefined,
      detail:monthly?group.filter(v=>!v.title.startsWith('기억할 것')&&!v.title.startsWith('주의할 것')).map(v=>v===s?v.text:`${v.title}\n${v.text}`).join('\n\n'):parts.length>1?parts.slice(1).join('\n\n'):parts[0],
      remember:sections.find(v=>v.title===`기억할 것 · ${monthly?s.title:name}`)?.text,
      avoid:sections.find(v=>v.title===`주의할 것 · ${monthly?s.title:name}`)?.text,
    };
  });
  return {cards,conclusion:sections.find(s=>s.title==='종합 해설')?.text||'',advice:sections.find(s=>s.title==='지금 해볼 수 있는 일')?.text||'',monthly};
}

export function groupActivities(items:AccountActivity[]) {
  const groups=new Map<string,AccountActivity[]>();
  for(const item of items){const group=groups.get(item.consultation_id)||[];if(!group.some(r=>r.ordinal===item.ordinal))group.push(item);groups.set(item.consultation_id,group);}
  return [...groups].map(([id,rows])=>({id,items:rows.sort((a,b)=>a.ordinal-b.ordinal)}));
}

export function clearSavedActivity(items:AccountActivity[],savedId:string):AccountActivity[] {
  return items.map(item=>item.savedId===savedId?{...item,savedId:null,title:undefined}:item);
}
