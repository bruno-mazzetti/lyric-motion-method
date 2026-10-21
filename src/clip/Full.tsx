import React from 'react';
import {AbsoluteFill} from 'remotion';
import scenesJson from '../../data/scenes.json';
import wordsJson from '../../data/words.json';
import {allWords,k,ease,beatPulse,rnd,wordT,Word} from '../lib';
import {barlow,hand,KEY,RED,BONE,INK,Ruler,Caliper,Tag,Barcode,Dial,Bars,Tally,Progress,Ecg,Underline,Check,Stamp} from '../styles/instruments';
import * as O from './objects';
import {J} from './objects';
import {AltarKPI,CalcReal,SignsNot} from './objects3';
import {Genesis,Prisoner,Credits} from './objects2';
import {PROJECT} from '../project.config';

export const DUR = wordsJson.duration;
export const TOTAL = DUR + PROJECT.creditsSeconds;            // + title/credits
type Sc = {i:number;section:string;echo:boolean;a:number;b:number;n:number;text:string};
const SC = scenesJson as Sc[];
const FIRST_WORD = SC[0].a;

const Svg:React.FC<{children:any}> = ({children}) => <svg width={1280} height={720} style={{position:'absolute',left:0,top:0,overflow:'visible'}}>{children}</svg>;
const Shift:React.FC<{x?:number;y?:number;children:any}> = ({x=0,y=0,children}) => <div style={{position:'absolute',left:0,top:0,transform:`translate(${x}px,${y}px)`}}>{children}</div>;
const Countdown:React.FC<O.C> = ({t,a,b}) => {
  const q=k(t,a,b-1), v=Math.floor(9999*(1-q*q)), d=String(v).padStart(4,'0').split('');
  return <Svg><rect x={380} y={360} width={520} height={220} rx={30} fill={INK} stroke={BONE} strokeWidth={5}/>
    {d.map((c,i)=><g key={i}><rect x={405+i*120} y={390} width={100} height={140} fill={BONE}/><text x={455+i*120} y={505} textAnchor="middle" fill={v===0?RED:INK} style={{fontFamily:barlow,fontWeight:800,fontSize:130}}>{c}</text></g>)}</Svg>;
};
const RulerBreak:React.FC<O.C> = ({t,a,b}) => {
  const q=ease(k(t,a+1,b-1));
  return <Svg>{Array.from({length:65},(_,i)=>{const gone=rnd(i)<q;const dy=gone?(q*120*(rnd(i+3)+.3)):0;
    return <line key={i} x1={i*20} x2={i*20} y1={560+dy} y2={560+dy+(i%5===0?50:25)} stroke={BONE} strokeWidth={i%5===0?3:1.5} opacity={gone?1-q:1}/>;})}
    <rect x={0} y={556} width={1280*(1-q)} height={8} fill={RED}/></Svg>;
};
const Cage:React.FC<O.C> = ({t,a,wt}) => {
  const tf=wt('flame'), g=1-ease(k(t,tf+.2,tf+1.2)), s=.6+ease(k(t,tf,tf+6))*1.6;
  return <><O.Flame t={t} x={640} y={640} s={s}/>
    <Svg>{Array.from({length:9},(_,i)=><line key={i} x1={440+i*50} x2={440+i*50} y1={380} y2={680} stroke={BONE} strokeWidth={5} opacity={g*ease(k(t,a,a+.8))}/>)}</Svg></>;
};
const River:React.FC<O.C> = ({t,a}) => <Svg><O.Ink c={RED} w={7} draw={ease(k(t,a+.5,a+3))} d={'M'+Array.from({length:30},(_,i)=>`${60+i*40},${540+Math.sin(i*.5)*70-i*3}`).join(' L')}/></Svg>;
const Dot:React.FC<{t:number}> = ({t}) => <Svg><circle cx={640} cy={500} r={11+beatPulse(t,6)*7} fill={RED}/></Svg>;

type Entry = {r:(c:O.C)=>React.ReactNode; hits?:(c:O.C)=>number[]};
const at=(c:O.C,o:number)=>c.a+o;
/* Scene visuals: key = scene index in data/scenes.json. The indices below belong to the reference song's scene list; replace them with your own. */
const TABLE:Record<number,Entry> = {
  0:/* Genesis */{r:c=><Genesis t={c.t} end={FIRST_WORD}/>, hits:()=>[FIRST_WORD*0.42]},
  1:/* Orbit */{r:c=><O.Orbit {...c}/>},
  2:/* Ruler, Tally */{r:c=><><Ruler t={c.t} a={c.a} b={c.b}/><Tally t={c.t} a={c.a+.3}/></>},
  3:/* SortBars */{r:c=><O.SortBars {...c}/>},
  4:/* FlatWave, Origin */{r:c=><><O.FlatWave {...c}/><O.Origin {...c} a={c.a+2}/></>},
  5:/* Mountain */{r:c=><O.Mountain {...c}/>},
  6:/* Sounding */{r:c=><O.Sounding {...c} tDepth={c.wt('depth')}/>},
  7:/* Waves, Origin */{r:c=><><O.Waves {...c} y={500}/><O.Origin {...c} y={420} r={18}/></>},
  8:/* TallyRow */{r:c=><Shift y={150}><O.TallyRow {...c}/></Shift>},
  9:/* Stars */{r:c=><O.Stars {...c}/>},
  10:/* GridBuild, River */{r:c=><><O.GridBuild {...c}/><River {...c}/></>},
  11:/* Cards */{r:c=><O.Cards {...c}/>},
  12:/* Radar */{r:c=><O.Radar {...c}/>},
  13:/* Orbit */{r:c=><O.Orbit {...c}/>},
  14:/* Stopwatch, Bars */{r:c=><><Shift x={380}><O.Stopwatch {...c}/></Shift><Bars t={c.t} a={c.a+.3}/></>},
  15:/* Orbit, Stamp */{r:c=><><O.Orbit {...c}/><Stamp t={c.t} a={at(c,1.5)} x={90} y={380} rot={-7} text="NOT FOUND"/><Stamp t={c.t} a={at(c,5.5)} x={760} y={450} rot={5} text="VANISHED" size={84}/><Stamp t={c.t} a={at(c,11)} x={300} y={560} rot={-3} text="0 RESULTS" size={72}/></>,
     hits:c=>[at(c,1.5),at(c,5.5),at(c,11)]},
  16:/* Ruler, Tag, Barcode, Caliper */{r:c=><><Ruler t={c.t} a={c.a} b={c.b}/><Tag t={c.t} a={c.a+.6}/><Barcode t={c.t} a={c.a+.2}/><Caliper t={c.t} a={c.a+1.2}/></>},
  17:/* Ecg, Underline */{r:c=><><Ecg t={c.t} a={c.a}/><Underline t={c.t} a={c.wt('graph')+.2} x={60} y={300} w={880}/></>, hits:c=>[c.a]},
  18:/* Dial, Bars */{r:c=><><Dial t={c.t} a={c.a+.1}/><Bars t={c.t} a={c.a+.4}/></>},
  19:/* Check, Stamp */{r:c=><><Check t={c.t} a={c.a+.7} y={360} label="spirit" done={c.e!-.4}/><Check t={c.t} a={c.a+1.5} y={450} label="hours logged" done={c.e!+.5}/><Check t={c.t} a={c.a+2.3} y={540} label="output" done={c.e!+1.4}/>
     <Stamp t={c.t} a={c.e!} x={700} y={330} rot={-8} text="DONE"/><Stamp t={c.t} a={c.e!+.9} x={820} y={470} rot={6} text="APPROVED" size={72}/><Stamp t={c.t} a={c.e!+1.8} x={640} y={560} rot={-3} text="OPTIMIZED" size={88}/></>,
     hits:c=>[c.e!,c.e!+.9,c.e!+1.8]},
  20:/* Tally, Progress */{r:c=><><Tally t={c.t} a={c.a+.1}/><Progress t={c.t} a={c.a+.3} b={c.b}/></>},
  21:/* Slider */{r:c=><O.Slider {...c}/>},
  22:/* GridBuild */{r:c=><O.GridBuild {...c}/>},
  23:/* Prisoner */{r:c=><Prisoner {...c}/>, hits:c=>[c.wt('prisoners')+.4]},
  24:/* Temple */{r:c=><O.Temple {...c}/>},
  25:/* BubbleTemple */{r:c=><O.BubbleTemple {...c}/>},
  26:/* Temple */{r:c=><O.Temple {...c} tags={false} ruler/>},
  27:/* AltarKPI */{r:c=><AltarKPI {...c}/>, hits:c=>Array.from({length:Math.floor((c.b-c.a)/4.2)},(_,n)=>c.a+(n+1)*4.2)},
  28:/* FlatWave */{r:c=><O.FlatWave {...c}/>},
  29:/* Screens */{r:c=><O.Screens {...c}/>},
  30:/* CalcReal */{r:c=><CalcReal {...c}/>, hits:c=>[c.wt('certainty')]},
  31:/* Network */{r:c=><O.Network {...c}/>},
  32:/* Protractor */{r:c=><O.Protractor {...c}/>},
  33:/* Origin */{r:c=><O.Origin {...c} y={540} r={16}/>},
  34:/* StarSpiral */{r:c=><O.StarSpiral {...c}/>},
  35:/* Tag, QMark */{r:c=><><Shift y={300}><Tag t={c.t} a={c.a+.3}/></Shift><O.QMark {...c} a={c.a+1}/></>},
  36:/* QMark */{r:c=><O.QMark {...c} txt="WHY" a={c.a+.3}/>},
  37:/* Pie, Dial */{r:c=><><O.Pie {...c}/><Dial t={c.t} a={c.a+1}/></>},
  38:/* Wind */{r:c=><O.Wind {...c}/>},
  39:/* Sign */{r:c=><O.Sign {...c}/>},
  40:/* SignsNot */{r:c=><SignsNot {...c}/>, hits:c=>[wordT('eclipses',313).start+.45]},
  41:/* SignsNot */{r:c=><SignsNot {...c}/>, hits:c=>[wordT('prophecy',319).start+.45]},
  42:/* SignsNot */{r:c=><SignsNot {...c}/>, hits:c=>[wordT('fire',323).start+.45,wordT('fire',323).start+1.4]},
  43:/* Compare */{r:c=><O.Compare {...c}/>},
  44:/* FormHand */{r:c=><O.FormHand {...c} a={c.a-.2}/>},
  45:/* FormHand, Stamp */{r:c=><><O.FormHand {...c} a={c.a-9}/><Stamp t={c.t} a={c.b-2.5} x={640} y={500} rot={-10} text="PENDING" size={90}/></>, hits:c=>[c.b-2.5]},
  46:/* FormHand, Stamp */{r:c=><><O.FormHand {...c} a={c.a-1}/><Stamp t={c.t} a={c.a+.9} x={560} y={480} rot={8} text="DENIED" size={100}/></>, hits:c=>[c.a+.9]},
  47:/* Input */{r:c=><O.Input {...c} text="JUSTIFY YOUR EXISTENCE" result="INSUFFICIENT DATA" resultAt={c.b-1.5}/>, hits:c=>[c.b-1.5]},
  48:/* Input */{r:c=><O.Input {...c} text="JUSTIFY ITSELF" rate={9} result="ERROR 404" resultAt={c.a+1.9}/>, hits:c=>[c.a+1.9]},
  49:/* Ledger */{r:c=><O.Ledger {...c} tClose={c.wt('closed')}/>, hits:c=>[c.wt('closed')]},
  50:/* Stamp */{r:c=><Stamp t={c.t} a={c.a+.1} x={420} y={430} rot={-6} text="CLOSED" size={150}/>, hits:c=>[c.a+.1]},
  51:/* Scales */{r:c=><O.Scales {...c} paper tLight={c.wt('weightlessness')}/>},
  52:/* Countdown */{r:c=><Countdown {...c}/>},
  53:/* TagsFall */{r:c=><O.TagsFall {...c}/>},
  54:/* RulerBreak */{r:c=><RulerBreak {...c}/>},
  55:/* Calendar */{r:c=><O.Calendar {...c}/>},
  56:/* NoChange */{r:c=><O.NoChange {...c}/>},
  57:/* Cage */{r:c=><Cage {...c}/>},
  58:/* Rays */{r:c=><O.Rays {...c}/>},
  59:/* Dot */{r:c=><Dot t={c.t}/>},
};
const RUNS=PROJECT.continuousRuns;

/* ---------- Text: several entrance modes ---------- */
const clean=(s:string)=>s.replace(/[.,]/g,'');
const Words2:React.FC<{t:number;words:Word[];paper:boolean;size:number;mode:number;align:'left'|'center'|'right';y:number;bg:string}> = ({t,words,paper,size,mode,align,y,bg}) => {
  const last=words.length?words[words.length-1].start:0, rec=ease(k(t-last,3,4.2)), bp=beatPulse(t,6);
  const sh=`0 0 6px ${bg},0 0 14px ${bg},0 0 24px ${bg}`;
  return <div style={{position:'absolute',left:70,top:y,width:1140,display:'flex',flexWrap:'wrap',justifyContent:align==='left'?'flex-start':align==='center'?'center':'flex-end',
    gap:`0 ${size*0.22}px`,opacity:1-rec*.35,transform:`translateY(${-rec*10}px)`,textShadow:sh}}>
    {words.map((w,n)=>{
      const d=t-w.start, on=d>=-0.001, key=KEY.includes(w.w.toLowerCase());
      const fs=Math.min(key?size*1.35:size,1000/(clean(w.text).length*0.5));
      const p=ease(k(d,0,.3)), pulse=key?1+bp*.05:1;
      const base:React.CSSProperties={fontFamily:paper?hand:barlow,fontWeight:paper?700:800,textTransform:paper?'none':'uppercase',fontSize:paper?fs*.95:fs,lineHeight:1.0,
        display:'inline-block',color:key?RED:(paper?INK:BONE),opacity:on?1:0};
      const txt=clean(w.text);
      if(mode===2) return <span key={n} style={{...base,opacity:on?1:0}}>{txt.split('').map((ch,i)=>{const pp=ease(k(d-i*.025,0,.25));
        return <span key={i} style={{display:'inline-block',opacity:pp,transform:`translateY(${(1-pp)*-70}px) scale(${pulse})`}}>{ch}</span>;})}</span>;
      const tr = mode===1?`translateX(${(1-p)*-160}px) skewX(${(1-p)*-14}deg) scale(${pulse})`
               : mode===3?`translateY(${(1-p)*90}px) scale(${pulse})`
               : mode===4?`perspective(500px) rotateX(${(1-p)*90}deg) scale(${pulse})`
               : `scale(${(1+0.55*Math.exp(-d*13))*pulse}) rotate(${paper?(rnd(n+w.start)-.5)*4:0}deg)`;
      return <span key={n} style={{...base,opacity:on?(mode===0?1:p):0,transform:tr,transformOrigin:'left bottom',filter:mode===3?`blur(${(1-p)*6}px)`:undefined}}>{txt}</span>;})}
  </div>;
};

/* ---------- Camera: several shots per scene (cuts + slow drift), never a long static shot ---------- */
const PRESET:[number,number,number,number][]=[[.97,.5,.8,0],[.9,.4,.8,-.7],[.92,.65,.75,.6],[.88,.5,.7,-.5],[.93,.35,.85,.8],[.9,.7,.8,-.6],[.95,.5,.6,.5]];
// the camera never zooms beyond 1.0, so no object is cropped by the frame; each shot "breathes" from 0.88-0.97 up to 1.0
const camera=(si:number,t:number,a:number,b:number)=>{
  const D=Math.max(0.5,b-a), shots=Math.max(1,Math.round(D/3.4)), len=D/shots;
  const j=Math.min(shots-1,Math.floor((t-a)/len)), d=Math.max(0,t-a-j*len), q=ease(Math.min(1,d/len));
  const pr=j===0?PRESET[0]:PRESET[(si*3+j*2)%PRESET.length];
  return {z:pr[0]+(1-pr[0])*q,ox:pr[1]*1280,oy:pr[2]*720,rot:pr[3]*(1-q)};
};
const CALL_D=['Δ +3.2%','n = 4,812','σ = 0.07','t + 12 ms','Q4 ↑','± 0.5','CRC OK','ε < 1e-3','p < 0.05','AVG 4.27'];
const CALL_P=['to be checked?','+12%','n = 482','ok ✓','≈ 3.7','next →','?!','−8%'];
const CALL_POS:[number,number][]=[[1000,665],[260,665],[1000,365],[640,690],[300,350]];
const Callouts:React.FC<{t:number;a:number;paper:boolean;si:number}> = ({t,a,paper,si}) => {
  const n=Math.floor((t-a-3)/6.5); if(n<0) return null; const d=t-a-3-n*6.5; if(d>1.8) return null;   // rare: one every ~6.5 s, long scenes only
  const [x,y]=CALL_POS[(si+n*2)%CALL_POS.length], txt=(paper?CALL_P:CALL_D)[(si+n*3)%(paper?CALL_P:CALL_D).length], p=ease(k(d,0,.2))*(1-ease(k(d,1.3,1.7)));
  return <div style={{position:'absolute',left:x,top:y,transform:`translate(-50%,-50%) scale(${.8+.2*p})`,opacity:p,padding:'2px 12px',border:`3px solid ${RED}`,color:RED,background:paper?BONE:INK,
    fontFamily:paper?hand:barlow,fontWeight:paper?700:500,fontSize:paper?34:28,letterSpacing:paper?0:'.05em',whiteSpace:'nowrap'}}>{txt}</div>;
};

export const Full:React.FC<{t:number}> = ({t}) => {
  let si=0; for(let i=0;i<SC.length;i++) if(t>=(i===0?0:SC[i].a-0.02)) si=i;
  const sc=SC[si], paper=sc.echo, nxt=SC[si+1];
  const run=RUNS.find(r=>r.includes(si)); const inRun=(i:number)=>RUNS.some(r=>r.includes(i)&&r.includes(i-1));
  const re=(run?SC[Math.max(...run)+1]?.a:nxt?.a)??DUR, ra=si===0?0:(run?SC[Math.min(...run)].a:sc.a);
  J.v=paper?Math.floor(t*8)%3:0;
  const words=allWords.filter(w=>w.start>=sc.a-.01&&w.start<=sc.b+.01&&w.echo===sc.echo);
  const wt=(s:string)=>(words.find(w=>w.w.toLowerCase()===s.toLowerCase())?.start)??sc.a;
  const c:O.C={t,a:si===0?0:sc.a,b:Math.max(sc.b,re-.01),e:sc.b,wt};
  const ent=TABLE[si];
  let shake=0; for(const h of ent?.hits?ent.hits(c):[]) if(t>=h) shake=Math.max(shake,Math.exp(-(t-h)*12)*10);
  let wipeX=-3000, cut=0;
  for(let i=1;i<SC.length;i++){const d=(t-(SC[i].a-0.02))/0.26;
    if(SC[i].echo!==SC[i-1].echo){ if(d>-0.5&&d<0.5) wipeX=(d+0.5)*2560-1280; } else if(d>=0&&d<1&&!inRun(i)) cut=Math.max(cut,Math.exp(-d*6)*8);}
  shake=Math.max(shake,cut);
  const n=words.length, C=Math.max(8,sc.text.length), size=Math.round(Math.max(62,Math.min(132,(paper?5200:4400)/C)));  // text limited to ~2 lines
  const modes=paper?[0,3,2,1]:[0,1,3,4,2], mode=modes[(si*3+(paper?1:0))%modes.length];
  const align:'left'|'center'|'right'=n<=3?(['left','center','right'] as const)[si%3]:'left';
  const bp=beatPulse(t,6), bg=paper?BONE:INK, cam=camera(si,t,ra,re);
  const fadeOut=ease(k(t,TOTAL-1.6,TOTAL-.2));
  const cr=t>=DUR+0.3;
  return <AbsoluteFill style={{background:bg,overflow:'hidden',transform:`translate(${shake*Math.sin(t*97)}px,${shake*Math.cos(t*71)}px)`}}>
    <svg width={1280} height={720} style={{position:'absolute',opacity:paper?.12:.16}}>
      {Array.from({length:17},(_,i)=><line key={'v'+i} x1={i*80-(t*30)%80} x2={i*80-(t*30)%80} y1={0} y2={720} stroke={paper?INK:BONE}/>)}
      {Array.from({length:10},(_,i)=><line key={'h'+i} x1={0} x2={1280} y1={i*80-(t*12)%80} y2={i*80-(t*12)%80} stroke={paper?INK:BONE}/>)}</svg>
    <div style={{position:'absolute',inset:0,transform:`scale(${cam.z}) rotate(${cam.rot}deg)`,transformOrigin:`${cam.ox}px ${cam.oy}px`}}>{ent?.r(c)}</div>
    {(re-ra)>12 && si>0 && <Callouts t={t} a={ra} paper={paper} si={si}/>}
    <Words2 t={t} words={words} paper={paper} size={size} mode={mode} align={align} y={50} bg={bg}/>
    <div style={{position:'absolute',top:0,bottom:0,left:wipeX,width:1280,background:RED,opacity:wipeX>-2000?1:0}}/>
    <div style={{position:'absolute',inset:0,background:'#fff',opacity:Math.max(0,bp-.8)*0.04}}/>
    {cr && <Credits t={t} a={DUR+0.3}/>}
    <div style={{position:'absolute',inset:0,background:'#000',opacity:cr?fadeOut:0}}/>
  </AbsoluteFill>;
};
