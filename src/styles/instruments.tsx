import React from 'react';
import {AbsoluteFill} from 'remotion';
import {loadFont as loadBarlow} from '@remotion/google-fonts/BarlowCondensed';
import {loadFont as loadCaveat} from '@remotion/google-fonts/Caveat';
import {k,ease,energyAt,beatPulse,rnd,Word} from '../lib';

export const barlow = loadBarlow('normal',{weights:['500','800']}).fontFamily;
export const hand = loadCaveat('normal',{weights:['700']}).fontFamily;
export const RED='#e0342b', BONE='#e8e2d0', INK='#0c0c0c';

const clean = (s:string)=>s.replace(/[.,]/g,'');
export const KEY = ['measure','graph','metric','task','prayer','silence','source','origin','height','depth','axis','grace','center','language','vanished','wonder','meaning','otherwise','signs','fire','flame','light','weightlessness','measured','endure','remain','beginning','order','number','still'];

export const Words:React.FC<{t:number;words:Word[];paper:boolean;x:number;y:number;size:number}> = ({t,words,paper,x,y,size}) => (
  <div style={{position:'absolute',left:x,top:y,width:1150,display:'flex',flexWrap:'wrap',gap:`0 ${size*0.22}px`}}>
    {words.map((w,n)=>{
      const on=t>=w.start, key=KEY.includes(w.w.toLowerCase());
      const s=1+0.55*Math.exp(-(t-w.start)*13);
      const fs=Math.min(key?size*1.35:size, 1000/(clean(w.text).length*0.5));
      return <span key={n} style={{
        fontFamily:paper?hand:barlow, fontWeight:paper?700:800, textTransform:paper?'none':'uppercase',
        fontSize:paper?fs*0.95:fs, lineHeight:1.0, opacity:on?1:0, display:'inline-block',
        color:key?RED:(paper?INK:BONE), transform:`scale(${s}) rotate(${paper?(rnd(n+w.start)-.5)*4:0}deg)`, transformOrigin:'left bottom'}}>{clean(w.text)}</span>;})}
  </div>
);

/* ---------- Objects: measuring instruments (thin strokes, red = what is being measured) ---------- */
export const Ruler:React.FC<{t:number;a:number;b:number}> = ({t,a,b}) => {
  const p=k(t,a,b), op=ease(k(t,a,a+0.3));
  return <svg width={1280} height={120} style={{position:'absolute',left:0,top:600,opacity:op}}>
    {Array.from({length:65},(_,n)=><line key={n} x1={n*20} x2={n*20} y1={20} y2={20+(n%5===0?50:25)} stroke={BONE} strokeWidth={n%5===0?3:1.5}/>)}
    <rect x={0} y={16} width={1280*p} height={8} fill={RED}/>
    <text x={1250} y={108} textAnchor="end" fill={RED} fontFamily={barlow} fontWeight={800} fontSize={36}>{(p*1000).toFixed(0).padStart(4,'0')} u</text></svg>;
};
export const Caliper:React.FC<{t:number;a:number}> = ({t,a}) => {
  const p=ease(k(t,a,a+0.9)), gap=300-230*p+ Math.sin(t*20)*2*(1-p), op=ease(k(t,a,a+0.2));
  return <svg width={600} height={260} style={{position:'absolute',left:620,top:330,opacity:op}}>
    <line x1={20} x2={580} y1={40} y2={40} stroke={BONE} strokeWidth={5}/>
    {Array.from({length:28},(_,n)=><line key={n} x1={30+n*20} x2={30+n*20} y1={40} y2={40+(n%5===0?22:12)} stroke={BONE}/>)}
    <rect x={40} y={40} width={26} height={170} fill={BONE}/><rect x={40+gap} y={30} width={26} height={180} fill={RED}/>
    <rect x={40+gap-18} y={22} width={62} height={30} fill={INK} stroke={BONE} strokeWidth={3}/>
    <text x={70+gap} y={246} textAnchor="middle" fill={BONE} fontFamily={barlow} fontWeight={500} fontSize={40}>{(gap*0.1).toFixed(1)} mm</text></svg>;
};
export const Tag:React.FC<{t:number;a:number}> = ({t,a}) => {
  const p=ease(k(t,a,a+0.4)), sw=Math.sin((t-a)*5)*10*Math.exp(-(t-a)*1.2);
  const price=Math.floor(p*k(t,a,a+3)*1999)/100;
  return <svg width={300} height={300} style={{position:'absolute',left:900,top:40,opacity:p,transformOrigin:'150px 0px',transform:`rotate(${sw}deg)`}}>
    <line x1={150} y1={0} x2={150} y2={60} stroke={BONE} strokeWidth={2}/>
    <path d="M70,80 L230,80 L250,110 L250,270 L50,270 L50,110Z" fill={INK} stroke={BONE} strokeWidth={4}/>
    <circle cx={150} cy={102} r={9} fill={BONE}/>
    <text x={150} y={190} textAnchor="middle" fill={RED} fontFamily={barlow} fontWeight={800} fontSize={72}>{price.toFixed(2)}</text>
    <text x={150} y={240} textAnchor="middle" fill={BONE} fontFamily={barlow} fontWeight={500} fontSize={30}>PER UNIT</text></svg>;
};
export const Barcode:React.FC<{t:number;a:number}> = ({t,a}) => {
  const n=Math.floor(k(t,a,a+1.2)*48);
  return <svg width={420} height={120} style={{position:'absolute',left:70,top:420}}>
    {Array.from({length:n},(_,i)=><rect key={i} x={i*8} y={0} width={rnd(i)>.6?6:3} height={100} fill={BONE}/>)}
    <text x={0} y={118} fill={BONE} fontFamily={barlow} fontWeight={500} fontSize={22}>0 0 1 1 1 · 0 0 0 4 2</text></svg>;
};
export const Dial:React.FC<{t:number;a:number}> = ({t,a}) => {
  const op=ease(k(t,a,a+0.3)), v=0.15+0.8*energyAt(t), ang=-120+v*240;
  return <svg width={420} height={420} style={{position:'absolute',left:760,top:290,opacity:op}}>
    <circle cx={210} cy={210} r={190} fill={INK} stroke={BONE} strokeWidth={5}/>
    {Array.from({length:25},(_,i)=>{const r=(-120+i*10)*Math.PI/180;const L=i%5===0?30:16;
      return <line key={i} x1={210+Math.sin(r)*(180-L)} y1={210-Math.cos(r)*(180-L)} x2={210+Math.sin(r)*180} y2={210-Math.cos(r)*180} stroke={i>19?RED:BONE} strokeWidth={i%5===0?4:2}/>;})}
    <g transform={`rotate(${ang} 210 210)`}><line x1={210} y1={210} x2={210} y2={50} stroke={RED} strokeWidth={6}/></g>
    <circle cx={210} cy={210} r={14} fill={BONE}/>
    <text x={210} y={330} textAnchor="middle" fill={BONE} fontFamily={barlow} fontWeight={800} fontSize={52}>{Math.round(10+v*20)} / MIN</text></svg>;
};
export const Bars:React.FC<{t:number;a:number}> = ({t,a}) => (
  <svg width={600} height={260} style={{position:'absolute',left:70,top:430,opacity:ease(k(t,a,a+0.3))}}>
    {Array.from({length:16},(_,i)=>{const h=(20+energyAt(t-(15-i)*0.35)*200)*ease(k(t,a+i*0.04,a+i*0.04+0.3));
      return <rect key={i} x={i*36} y={240-h} width={26} height={h} fill={i===15?RED:BONE}/>;})}
    <line x1={0} x2={580} y1={242} y2={242} stroke={BONE} strokeWidth={3}/></svg>
);
export const Tally:React.FC<{t:number;a:number}> = ({t,a}) => {
  const op=ease(k(t,a,a+0.3)); const clicks=Math.floor(Math.max(0,t-a)*3.4*1.0)+0; const bp=beatPulse(t,9);
  const d=String(clicks*17+4000).padStart(4,'0').split('');
  return <svg width={460} height={330} style={{position:'absolute',left:780,top:235,opacity:op,transform:`translateY(${bp*4}px)`}}>
    <rect x={20} y={40} width={420} height={250} rx={36} fill={INK} stroke={BONE} strokeWidth={5}/>
    {d.map((c,i)=><g key={i}><rect x={50+i*93} y={70} width={80} height={110} fill={BONE}/><text x={90+i*93} y={156} textAnchor="middle" fill={INK} fontFamily={barlow} fontWeight={800} fontSize={100}>{c}</text></g>)}
    <circle cx={370} cy={238} r={34} fill={RED} stroke={BONE} strokeWidth={4} transform={`translate(0 ${bp*6})`}/>
    <text x={60} y={254} fill={BONE} fontFamily={barlow} fontWeight={500} fontSize={30}>PRAYERS / H</text></svg>;
};
export const Progress:React.FC<{t:number;a:number;b:number}> = ({t,a,b}) => {
  const p=ease(k(t,a,b));
  return <div style={{position:'absolute',left:70,right:70,top:585,opacity:ease(k(t,a,a+0.3))}}>
    <div style={{height:54,border:`4px solid ${BONE}`}}><div style={{height:'100%',width:`${p*100}%`,background:RED}}/></div>
    <div style={{display:'flex',justifyContent:'space-between',fontFamily:barlow,fontWeight:800,fontSize:44,color:BONE,marginTop:4}}><span>EFFICIENCY</span><span>{(p*100).toFixed(1)}%</span></div></div>;
};

/* ---------- "Paper" scenes: the echo voice, drawn by hand ---------- */
export const Ecg:React.FC<{t:number;a:number}> = ({t,a}) => {
  const n=120, vis=Math.floor(ease(k(t,a,a+1.5))*n);
  const pts=Array.from({length:vis},(_,i)=>{const tt=t-6+i*0.05;return `${i*10.7},${170-energyAt(tt)*140+(rnd(i)-.5)*10}`}).join(' ');
  return <svg width={1280} height={200} style={{position:'absolute',left:0,top:470}}>
    {[0,1,2,3].map(i=><line key={i} x1={0} x2={1280} y1={i*55+10} y2={i*55+10} stroke={INK} opacity={.15}/>)}
    <polyline points={pts} fill="none" stroke={RED} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round"/></svg>;
};
export const Underline:React.FC<{t:number;a:number;x:number;y:number;w:number}> = ({t,a,x,y,w}) => (
  <svg width={w+40} height={40} style={{position:'absolute',left:x,top:y}}>
    <path d={`M5,20 Q${w*.25},4 ${w*.5},20 T${w},16`} fill="none" stroke={RED} strokeWidth={7} strokeLinecap="round" strokeDasharray={w*1.2} strokeDashoffset={w*1.2*(1-ease(k(t,a,a+0.35)))}/></svg>
);
export const Check:React.FC<{t:number;a:number;y:number;label:string;done:number}> = ({t,a,y,label,done}) => {
  const op=ease(k(t,a,a+0.25)), tick=ease(k(t,done,done+0.2));
  return <div style={{position:'absolute',left:80,top:y,opacity:op,display:'flex',alignItems:'center',gap:24}}>
    <svg width={64} height={64}><rect x={4} y={4} width={56} height={56} fill="none" stroke={INK} strokeWidth={5}/>
      <path d="M12,34 L26,50 L56,8" fill="none" stroke={RED} strokeWidth={8} strokeLinecap="round" strokeDasharray={80} strokeDashoffset={80*(1-tick)}/></svg>
    <span style={{fontFamily:hand,fontWeight:700,fontSize:62,color:INK,textDecoration:tick>.9?'line-through':'none'}}>{label}</span></div>;
};
export const Stamp:React.FC<{t:number;a:number;x:number;y:number;rot:number;text:string;size?:number}> = ({t,a,x,y,rot,text,size=96}) => {
  if(t<a) return null; const d=t-a; const s=1+2.2*Math.exp(-d*20);
  return <div style={{position:'absolute',left:x,top:y,transform:`rotate(${rot}deg) scale(${s})`,border:`8px solid ${RED}`,color:RED,fontFamily:barlow,fontWeight:800,fontSize:size,
    padding:'0 22px',letterSpacing:'.06em',opacity:d<0.04?0.4:0.92}}>{text}</div>;
};

