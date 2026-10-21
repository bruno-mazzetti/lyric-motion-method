import React from 'react';
import {k,ease,energyAt,beatPulse,rnd} from '../lib';
import {barlow,RED,BONE,INK} from '../styles/instruments';
import {Ink,wob,C} from './objects';
import {PROJECT} from '../project.config';

const Svg:React.FC<{children:any;op?:number}> = ({children,op=1}) =>
  <svg width={1280} height={720} style={{position:'absolute',left:0,top:0,overflow:'visible',opacity:op}}>{children}</svg>;
const F = (s:number,w=800):React.CSSProperties=>({fontFamily:barlow,fontWeight:w,fontSize:s});

/* ---------- Intro: birth of the world (0 -> first sung word) ---------- */
export const Genesis:React.FC<{t:number;end:number}> = ({t,end}) => {
  const cx=640, cy=500, tb=end*0.42;                 // tb = the instant of the "big bang"
  const e=energyAt(t), pre=ease(k(t,1.2,tb));
  const dotR = t<1.2?0: 3+pre*10+e*8+(t<tb?0:0);
  const N=170, age=Math.max(0,t-tb);
  const parts=Array.from({length:N},(_,i)=>{
    const an=rnd(i)*Math.PI*2, sp=80+rnd(i+7)*620, d=sp*(1-Math.exp(-age*1.4)), d0=sp*(1-Math.exp(-Math.max(0,age-.12)*1.4));
    const fade=age<0?0:Math.min(1,age*6)*(.25+.75*Math.exp(-age*.35));
    return {x:cx+Math.cos(an)*d,y:cy+Math.sin(an)*d*.62,x0:cx+Math.cos(an)*d0,y0:cy+Math.sin(an)*d0*.62,fade,r:1+rnd(i+3)*2.4,red:rnd(i+11)>.9};});
  const shock=Math.exp(-age*3.2), ringsAfter=[0,1,2].map(i=>{const q=Math.max(0,age-i*.55);return {r:q*420,o:Math.max(0,1-q*.45)};});
  const beatRings=[0,1,2,3].map(i=>{const q=((t-1.2)*0.45+i/4)%1;return {r:20+q*220,o:(1-q)*.35*pre*(t<tb?1:0)};});
  const hz=ease(k(t,tb+3,tb+6.5)), mt=ease(k(t,tb+4.5,tb+8));
  const ridge=(amp:number,base:number,s:number)=>'M-20,720 '+Array.from({length:36},(_,i)=>{const x=i*38,u=x/260;return `L${x},${base-amp*(Math.sin(u*1.3+s)*.5+Math.sin(u*3.1+s*2)*.3+.65)}`}).join(' ')+' L1300,720Z';
  return <Svg>
    {t>=tb && <rect x={0} y={0} width={1280} height={720} fill={BONE} opacity={Math.exp(-age*14)*.9}/>}
    {t<tb && beatRings.map((q,i)=><circle key={i} cx={cx} cy={cy} r={q.r} fill="none" stroke={BONE} strokeWidth={2} opacity={q.o}/>)}
    {t<tb && <circle cx={cx} cy={cy} r={dotR*2.6} fill={RED} opacity={.12+pre*.2}/>}
    {t>=tb && ringsAfter.map((q,i)=><circle key={i} cx={cx} cy={cy} r={q.r} fill="none" stroke={i===0?RED:BONE} strokeWidth={i===0?5:2} opacity={q.o}/>)}
    {parts.map((p,i)=>age>0 && <g key={i} opacity={p.fade}><line x1={p.x0} y1={p.y0} x2={p.x} y2={p.y} stroke={p.red?RED:BONE} strokeWidth={p.r*.9}/><circle cx={p.x} cy={p.y} r={p.r} fill={p.red?RED:BONE}/></g>)}
    <path d={ridge(150,700,1.7)} fill={INK} stroke={BONE} strokeWidth={2} opacity={mt*.8} transform={`translate(0 ${(1-mt)*60})`}/>
    <path d={ridge(90,730,4.2)} fill={INK} stroke={BONE} strokeWidth={2} opacity={mt*.8} transform={`translate(0 ${(1-mt)*90})`}/>
    <line x1={640-640*hz} x2={640+640*hz} y1={500} y2={500} stroke={BONE} strokeWidth={2} opacity={.55}/>
    {t>=1.2 && <circle cx={cx} cy={cy} r={Math.max(dotR,t>=tb?10+beatPulse(t,5)*6:dotR)+beatPulse(t,6)*4} fill={RED}/>}
  </Svg>;
};

/* ---------- A line about being trapped by a map: map, walker, bars ---------- */
export const Prisoner:React.FC<C> = ({t,a,b,wt}) => {
  const dr=ease(k(t,a,a+1.4)), tp=wt('prisoners'), walk=ease(k(t,a+.6,tp)), bars=k(t,tp,tp+1.2);
  const route:[number,number][]=[[180,640],[300,560],[440,600],[560,500],[700,540],[820,470],[960,520]];
  const idx=walk*(route.length-1), i0=Math.min(route.length-2,Math.floor(idx)), f=idx-i0;
  const px=route[i0][0]+(route[i0+1][0]-route[i0][0])*f, py=route[i0][1]+(route[i0+1][1]-route[i0][1])*f;
  const caged=bars>.9, shake=caged?Math.sin(t*30)*Math.exp(-(t-tp-1.2)*3)*3:0;
  const tm=wt('map'), pin=ease(k(t,tm,tm+.8));
  return <Svg>
    <Ink d={wob([[110,660],[150,520],[260,430],[380,470],[470,380],[610,410],[740,360],[890,420],[1010,380],[1140,470],[1120,600],[1000,670],[820,640],[640,680],[420,650],[110,660]],8,4)} draw={dr} c={INK} w={5}/>
    {[0,1,2,3,4].map(i=><Ink key={'h'+i} d={wob([[110,400+i*60],[1140,400+i*60]],i,2)} draw={dr} c={INK} w={2} op={.35}/>)}
    {[0,1,2,3,4,5,6].map(i=><Ink key={'v'+i} d={wob([[200+i*140,360],[200+i*140,690]],i+9,2)} draw={dr} c={INK} w={2} op={.35}/>)}
    <path d={'M'+route.map(p=>p.join(',')).join(' L')} fill="none" stroke={RED} strokeWidth={4} strokeDasharray="4 12" opacity={ease(k(t,a+.4,a+1))}/>
    <g transform={`translate(${px+shake} ${py})`} opacity={ease(k(t,a+.4,a+.8))}>
      <circle cy={-46} r={13} fill="none" stroke={RED} strokeWidth={6}/><line y1={-33} y2={0} stroke={RED} strokeWidth={6}/>
      <line y1={-24} x1={0} x2={caged?-22:-16} y2={caged?-62:-10} stroke={RED} strokeWidth={6}/><line y1={-24} x1={0} x2={caged?22:16} y2={caged?-62:-10} stroke={RED} strokeWidth={6}/>
      <line y1={0} x2={-12} y2={30} stroke={RED} strokeWidth={6}/><line y1={0} x2={12} y2={30} stroke={RED} strokeWidth={6}/></g>
    {Array.from({length:10},(_,i)=>{const q=ease(k(bars,i*.06,i*.06+.4));return <line key={i} x1={130+i*110} x2={130+i*110} y1={340} y2={340+q*350} stroke={INK} strokeWidth={13} strokeLinecap="round"/>;})}
    {bars>0 && <line x1={110} x2={1140} y1={340+ease(bars)*8} y2={340+ease(bars)*8} stroke={INK} strokeWidth={13}/>}
    <g opacity={pin}><text x={1130} y={330} textAnchor="end" fill={RED} style={F(54)}>N 47.2° · E 8.5°</text></g></Svg>;
};

/* ---------- Title, then credits ---------- */
export const Credits:React.FC<{t:number;a:number}> = ({t,a}) => {
  const rows=PROJECT.credits;
  const line=ease(k(t,a,a+1.0)), tt=ease(k(t,a+1.0,a+1.6)), tOut=ease(k(t,a+5.0,a+5.6)), c0=a+5.8;
  return <div style={{position:'absolute',inset:0,background:INK}}>
    <svg width={1280} height={720} style={{position:'absolute',opacity:.12}}>{Array.from({length:17},(_,i)=><line key={i} x1={i*80-(t*20)%80} x2={i*80-(t*20)%80} y1={0} y2={720} stroke={BONE}/>)}
      {Array.from({length:10},(_,i)=><line key={'h'+i} x1={0} x2={1280} y1={i*80} y2={i*80} stroke={BONE}/>)}</svg>
    <div style={{position:'absolute',left:638,width:4,top:0,height:720*line,background:RED,opacity:t<c0?1:.35}}/>
    <div style={{position:'absolute',left:0,right:0,top:215,textAlign:'center',opacity:tt*(1-tOut),transform:`translateY(${(1-tt)*30}px)`}}>
      <div style={{...F(96),color:BONE,letterSpacing:'.05em',textShadow:`0 0 12px ${INK},0 0 28px ${INK}`}}>{PROJECT.title[0]}</div>
      <div style={{...F(56,500),color:RED,letterSpacing:'.22em',marginTop:18,textShadow:`0 0 12px ${INK},0 0 28px ${INK}`}}>{PROJECT.title[1]}</div></div>
    {rows.map((r,i)=>{const at=c0+i*1.0, p=ease(k(t,at,at+.5)), w=ease(k(t,at,at+.7));
      return <div key={i} style={{position:'absolute',left:0,right:0,top:Math.max(40,360-rows.length*75)+i*150,textAlign:'center',opacity:p,transform:`translateY(${(1-p)*24}px)`,textShadow:`0 0 10px ${INK},0 0 22px ${INK}`}}>
        <div style={{...F(30,500),color:RED,letterSpacing:'.3em'}}>{r[0]}</div>
        <div style={{...F(76),color:BONE,letterSpacing:'.06em'}}>{r[1]}</div>
        <div style={{height:3,width:260*w,background:RED,margin:'6px auto 0'}}/></div>;})}
  </div>;
};
