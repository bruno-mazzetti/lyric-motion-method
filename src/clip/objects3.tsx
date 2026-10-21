import React from 'react';
import {k,ease,energyAt,beatPulse,rnd,wordT} from '../lib';
import {barlow,hand,RED,BONE,INK} from '../styles/instruments';
import {Ink,wob,circ,Flame,C} from './objects';

const Svg:React.FC<{children:any}> = ({children}) =>
  <svg width={1280} height={720} style={{position:'absolute',left:0,top:0,overflow:'visible'}}>{children}</svg>;
const F = (s:number,w=800):React.CSSProperties=>({fontFamily:barlow,fontWeight:w,fontSize:s});
const H = (s:number):React.CSSProperties=>({fontFamily:hand,fontWeight:700,fontSize:s});
const rect=(x:number,y:number,w:number,h:number,seed=0,j=2)=>wob([[x,y],[x+w,y],[x+w,y+h],[x,y+h],[x,y]],seed,j);

/* ---------- Altar scene: altar + dashboard whose target is never met ---------- */
const NOTES=['+12% OUTPUT','−8% IDLE','+5% EFFICIENCY','×2 SPEED','TARGET +10%','0 WASTE','KPI ↑↑','LOG EVERYTHING'];
export const AltarKPI:React.FC<C> = ({t,a,b}) => {
  const L=4.2, q=(t-a)/L, cyc=Math.floor(q), p=ease(Math.min(1,(q-cyc)*1.15)), dr=ease(k(t,a,a+1.6));
  const kpi=Math.min(100,Math.round((cyc*10+p*100)*1)), tgt=100+cyc*10;
  const ang=(-80+p*160)*Math.PI/180;
  const bars=Array.from({length:6},(_,i)=>({h:(40+i*32+cyc*12)*ease(k(p,i*.1,i*.1+.5))}));
  const nNotes=Math.min(NOTES.length+4,Math.floor((t-a-1.5)/1.7)+1);
  return <Svg>
    {/* altar */}
    <Ink d={rect(360,650,560,40,1)} draw={dr} c={INK} w={6}/><Ink d={rect(430,600,420,50,2)} draw={dr} c={INK} w={6}/><Ink d={rect(500,540,280,60,3)} draw={dr} c={INK} w={6}/>
    {/* dashboard on the altar */}
    <g opacity={ease(k(t,a+.8,a+1.4))}><Ink d={rect(520,390,240,150,4)} c={INK} w={6} fill={BONE}/>
      <text x={540} y={430} fill={INK} style={H(40)}>KPI</text><text x={740} y={430} textAnchor="end" fill={RED} style={F(46)}>{kpi}%</text>
      <rect x={540} y={452} width={200} height={26} fill="none" stroke={INK} strokeWidth={4}/><rect x={544} y={456} width={192*Math.min(1,kpi/100)} height={18} fill={RED}/>
      <text x={640} y={520} textAnchor="middle" fill={INK} style={H(34)}>target {tgt}%</text></g>
    {/* gauge on the left */}
    <g opacity={ease(k(t,a+1,a+1.6))}><path d="M120,640 A150,150 0 0 1 420,640" fill="none" stroke={INK} strokeWidth={6}/>
      {Array.from({length:9},(_,i)=>{const an=Math.PI*(i/8);return <line key={i} x1={270-Math.cos(an)*150} y1={640-Math.sin(an)*150} x2={270-Math.cos(an)*125} y2={640-Math.sin(an)*125} stroke={INK} strokeWidth={4}/>;})}
      <line x1={270} y1={640} x2={270+Math.sin(ang)*130} y2={640-Math.cos(ang)*130} stroke={RED} strokeWidth={7} strokeLinecap="round"/><circle cx={270} cy={640} r={12} fill={INK}/>
      <text x={270} y={690} textAnchor="middle" fill={INK} style={H(34)}>efficiency</text></g>
    {/* bar chart on the right */}
    <g opacity={ease(k(t,a+1.2,a+1.8))}>{bars.map((r,i)=><g key={i}><rect x={870+i*52} y={680-r.h} width={38} height={r.h} fill="none" stroke={INK} strokeWidth={5}/>{i===5 && <rect x={870+i*52} y={680-r.h} width={38} height={10} fill={RED}/>}</g>)}
      <line x1={850} x2={1200} y1={683} y2={683} stroke={INK} strokeWidth={5}/><text x={1020} y={718} textAnchor="middle" fill={INK} style={H(34)}>output</text></g>
    {/* notes falling onto the altar */}
    {Array.from({length:Math.max(0,nNotes)},(_,n)=>{const at=a+1.5+n*1.7, d=t-at, fall=ease(k(d,0,.45)), bounce=Math.sin(Math.min(1,d/.7)*Math.PI*2)*(d<.7?8*(1-d/.7):0);
      const x=[420,640,860,500,780,350,930,600][n%8], y=[350,360,355,420,430,520,540,330][n%8]; const age=t-at-4.5; const fade=1-ease(k(age,0,1.2));
      return d<0?null:<g key={n} opacity={fade} transform={`translate(${x},${y+(fall-1)*260+bounce}) rotate(${(rnd(n)-.5)*16})`}>
        <rect x={-70} y={-24} width={140} height={48} fill={BONE} stroke={INK} strokeWidth={4}/><text textAnchor="middle" y={10} fill={n%2?RED:INK} style={H(30)}>{NOTES[n%8]}</text></g>;})}
    {(q-cyc)>.88 && <text x={640} y={365} textAnchor="middle" fill={RED} style={{...F(60),transform:'rotate(-4deg)',transformOrigin:'640px 365px'}}>NOT ENOUGH</text>}
  </Svg>;
};

/* ---------- Calculator scene: a real calculator + a printing receipt ---------- */
const KEYS=['7','8','9','÷','4','5','6','×','1','2','3','−','0','.','=','+'];
export const CalcReal:React.FC<C> = ({t,a,b,wt}) => {
  const dr=ease(k(t,a,a+1.2)), tc=wt('certainty'), cert=t>=tc, pk=Math.floor((t-a)*6)%16, pressed=Math.floor(rnd(pk+Math.floor((t-a)*6)*3)*16)%16, since=((t-a)*6)%1;
  const nb=Math.floor((t-a)*16), disp=cert?'100.00 %':(String(Math.floor(rnd(nb)*99999)/100+(nb%7)).padEnd(7,'0').slice(0,8));
  const lines=Math.min(8,Math.floor(Math.max(0,t-a-.8)*2.6)), tape=ease(k(t,a+.6,a+1.3));
  return <Svg>
    {/* body */}
    <Ink d={wob([[150,700],[130,420],[150,340],[500,340],[520,420],[540,700],[150,700]],5,2)} draw={dr} c={INK} w={7} fill={BONE}/>
    <Ink d={rect(180,365,330,66,6)} draw={dr} c={INK} w={5} fill="#cfd8c4"/>
    <rect x={186} y={371} width={318} height={54} fill="#cfd8c4"/>
    <text x={496} y={415} textAnchor="end" fill={cert?RED:INK} style={{...F(52,500),letterSpacing:'.05em'}}>{disp}</text>
    {[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].map(i=>{const c=i%4,r=Math.floor(i/4),x=180+c*84,y=455+r*58,on=i===pressed&&since<.5;
      return <g key={i} transform={`translate(0 ${on?5:0})`}><Ink d={rect(x,y,68,48,i+9,1.5)} draw={dr} c={INK} w={5} fill={on?RED:(c===3?'#e7d9bd':BONE)}/>
        <text x={x+34} y={y+34} textAnchor="middle" fill={on?BONE:INK} style={H(36)}>{KEYS[i]}</text></g>;})}
    {/* receipt */}
    <g opacity={tape}><rect x={620} y={340} width={300} height={40+lines*28+(cert?64:0)} fill={BONE} stroke={INK} strokeWidth={4} strokeDasharray="14 8"/>
      {Array.from({length:lines},(_,i)=><text key={i} x={640} y={372+i*28} fill={INK} style={F(26,500)}>{(rnd(i+3)*900+10).toFixed(2).padStart(7,' ')} +</text>)}
      {cert && <><text x={640} y={372+lines*28+36} fill={RED} style={F(46)}>= 100.00 %</text><Ink d={wob([[636,372+lines*28+52],[900,372+lines*28+48]],3,2)} c={RED} w={5} draw={ease(k(t,tc,tc+.3))}/></>}</g>
    {/* certainty stamp */}
    {cert && <g transform={`translate(1010 540) rotate(-10) scale(${1+2.2*Math.exp(-(t-tc)*18)})`} opacity={.95}><rect x={-120} y={-60} width={240} height={120} fill="none" stroke={RED} strokeWidth={8}/><text textAnchor="middle" y={22} fill={RED} style={F(66)}>CERTAIN</text></g>}
  </Svg>;
};

/* ---------- Three parallel lines: a scanner moves from display case to display case ---------- */
export const SignsNot:React.FC<C> = ({t}) => {
  const tE=wordT('eclipses',313).start, tP=wordT('prophecy',319).start, tF=wordT('fire',323).start, a0=wordT('Not',312.8).start-.3;
  const X=[tE+.45,tP+.45,tF+.45], cx=[250,640,1030], cy=470, dr=ease(k(t,a0,a0+1.2));
  // scanner position: lands on each display case just before the word
  const tgt=[tE-.6,tP-.6,tF-.6]; let sx=cx[0]; for(let i=1;i<3;i++) sx=sx+(cx[i]-cx[i-1])*ease(k(t,tgt[i]-.9,tgt[i]));
  const after=t>tF+1.6, sweep=after?(Math.sin((t-tF)*3.2)*.5+.5)*780+250:sx;
  const bx=(i:number)=>cx[i]-140;
  return <Svg>
    {[0,1,2].map(i=><g key={i}>
      <Ink d={rect(bx(i),cy-150,280,300,i+4,3)} draw={dr} c={INK} w={6}/>
      <g opacity={ease(k(t,a0+.4+i*.2,a0+1.2+i*.2))}>
        {i===0&&<><circle cx={cx[0]} cy={cy} r={95} fill={INK}/><circle cx={cx[0]+34} cy={cy-14} r={92} fill={BONE}/></>}
        {i===1&&<>{Array.from({length:6},(_,n)=><Ink key={n} d={wob([[cx[1]-80,cy-90+n*34],[cx[1]+80,cy-90+n*34]],n+20,3)} c={INK} w={5}/>)}<Ink d={rect(cx[1]-100,cy-115,200,230,30)} c={INK} w={5}/></>}
        {i===2&&<Flame t={t} x={cx[2]} y={cy+90} s={1.15} paper/>}</g>
      {t>=X[i] && <g opacity={1}><Ink d={wob([[bx(i)+10,cy-140],[bx(i)+270,cy+140]],i+1,3)} c={RED} w={16} draw={ease(k(t,X[i],X[i]+.25))}/><Ink d={wob([[bx(i)+270,cy-140],[bx(i)+10,cy+140]],i+2,3)} c={RED} w={16} draw={ease(k(t,X[i]+.18,X[i]+.43))}/>
        <text x={cx[i]} y={cy+190} textAnchor="middle" fill={RED} style={{...H(48),transform:'rotate(-3deg)',transformOrigin:`${cx[i]}px ${cy+190}px`}}>not here</text></g>}</g>)}
    {/* magnifier-scanner */}
    <g transform={`translate(${sweep} ${cy-10+Math.sin(t*5)*6}) rotate(${Math.sin(t*2)*4})`} opacity={dr}>
      <Ink d={circ(0,0,120,7)} c={INK} w={7}/><line x1={86} y1={86} x2={170} y2={170} stroke={INK} strokeWidth={14} strokeLinecap="round"/>
      <line x1={-100} x2={100} y1={(((t*1.6)%1)-.5)*190} y2={(((t*1.6)%1)-.5)*190} stroke={RED} strokeWidth={4} opacity={.75}/></g>
    <text x={1230} y={705} textAnchor="end" fill={RED} style={F(46)}>FOUND 0 / 3</text>
    {t>tF+1.4 && <g transform={`translate(640 400) rotate(-5) scale(${1+2*Math.exp(-(t-tF-1.4)*16)})`}><rect x={-250} y={-62} width={500} height={124} fill={BONE} stroke={RED} strokeWidth={9}/><text textAnchor="middle" y={26} fill={RED} style={F(84)}>NOTHING FOUND</text></g>}
  </Svg>;
};
