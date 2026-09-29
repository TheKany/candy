export const DAILY_DEAL_DURATION = 2100;
type DealFrame = {offset:number;left:string;top:string;transform:string;easing:string};

// Fixed per-card variation keeps each trajectory stable across React renders.
export function getDailyDealFrames(index:number,count:number):DealFrame[] {
  const progress=index/Math.max(1,count-1);
  const noise=(salt:number)=>{const n=Math.sin((index+1)*salt)*43758.5453;return n-Math.floor(n);};
  const frame=(offset:number,left:string,top:string,angle:number,easing='cubic-bezier(.22,.7,.3,1)'):DealFrame=>({offset,left,top,transform:`translate(-50%, -50%) rotate(${angle}deg)`,easing});
  const start=frame(0,'145%','-58px',28);
  const scattered=frame(.25+progress*.19,`${8+noise(12.9898)*84}%`,`${-25+noise(78.233)*65}px`,-65+noise(39.425)*130);
  const gathered=frame(.67+noise(7.13)*.025,'0%',`${-progress*3}px`,-3+noise(16.77)*6);
  const final=frame(.87+progress*.13,`${progress*100}%`,'0px',0);
  return [start,{...start,offset:.02+progress*.16,easing:'cubic-bezier(.15,.35,.32,1)'},scattered,
    {...scattered,offset:.49},gathered,{...gathered,offset:.72+progress*.09},final,{...final,offset:1}];
}
