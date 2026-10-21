import React from 'react';
import {k,ease,energyAt,beatPulse,rnd} from '../lib';
import {barlow,hand,RED,BONE,INK} from '../styles/instruments';

export type C = {t:number;a:number;b:number;e?:number;wt:(s:string)=>number};   // e = end of the scene's last sung word
const abs:React.CSSProperties = {position:'absolute',left:0,top:0};
const F = (s:number,w=800):React.CSSProperties=>({fontFamily:barlow,fontWeight:w,fontSize:s});

/* ---------- hand-drawing helpers ---------- */
export const Ink:React.FC<{d:string;draw?:number;c?:string;w?:number;fill?:string;op?:number}> = ({d,draw=1,c=INK,w=6,fill='none',op=1}) =>
  <path d={d} pathLength={1} strokeDasharray={1} strokeDashoffset={1-draw} fill={fill} stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" opacity={op}/>;
export const J={v:0};   // "boiling lines": 3 jitter variants swapped 8x/s in paper scenes
export const wob = (pts:[number,number][],seed=0,j=3)=>pts.map(([x,y],i)=>`${i?'L':'M'}${(x+(rnd(i+seed+J.v*131)-.5)*j*2).toFixed(1)},${(y+(rnd(i+seed+50+J.v*131)-.5)*j*2).toFixed(1)}`).join(' ');
export const circ = (cx:number,cy:number,r:number,seed=0,n=30)=>wob(Array.from({length:n+3},(_,i)=>{const an=i/n*Math.PI*2;const rr=r*(1+(rnd(i+seed)-.5)*.06);return [cx+Math.cos(an)*rr,cy+Math.sin(an)*rr] as [number,number];}),seed,1);
const Svg:React.FC<{children:any;x?:number;y?:number;w?:number;h?:number;op?:number}> = ({children,x=0,y=0,w=1280,h=720,op=1}) =>
  <svg width={w} height={h} style={{...abs,left:x,top:y,opacity:op,overflow:'visible'}}>{children}</svg>;

/* ================= DARK SCENES: instruments ================= */
export const Origin:React.FC<C&{x?:number;y?:number;r?:number}> = ({t,a,x=640,y=500,r=14}) => {
  const bp=beatPulse(t,5), g=ease(k(t,a,a+0.8));
  return <Svg op={g}><circle cx={x} cy={y} r={r+bp*8} fill={RED}/>
    {[0,1,2].map(i=>{const q=((t-a)*0.5+i/3)%1;return <circle key={i} cx={x} cy={y} r={r+q*190} fill="none" stroke={RED} strokeWidth={2} opacity={(1-q)*.6}/>;})}</Svg>;
};
export const Horizon:React.FC<C> = ({t,a}) => <Svg><line x1={640-640*ease(k(t,a,a+3))} x2={640+640*ease(k(t,a,a+3))} y1={500} y2={500} stroke={BONE} strokeWidth={2} opacity={.5}/></Svg>;

export const Mountain:React.FC<C> = ({t,a,wt}) => {
  const tp=wt('height'), pts:[number,number][]=[[0,660],[180,620],[330,500],[430,540],[560,400],[640,330],[720,430],[830,480],[950,590],[1100,640],[1280,660]];
  const d='M'+pts.map(p=>p.join(',')).join(' L'), dim=ease(k(t,tp,tp+0.6)), q=Math.floor(t*6)%2===0;
  return <Svg><Ink d={d} draw={ease(k(t,a,a+1.5))} c={BONE} w={4}/>
    {Array.from({length:12},(_,i)=><g key={i} opacity={ease(k(t,a+0.5,a+1.5))}><line x1={1160} x2={1190} y1={330+i*30} y2={330+i*30} stroke={BONE} strokeWidth={i%5===0?4:2}/></g>)}
    <line x1={640} x2={640} y1={660} y2={660-330*dim} stroke={RED} strokeWidth={6}/><line x1={620} x2={1200} y1={330} y2={330} stroke={RED} strokeWidth={2} opacity={dim} strokeDasharray="10 8"/>
    <text x={1000} y={320} fill={RED} {...{style:F(64)}} opacity={dim}>{q?'????':'? ? ? ?'} m</text></Svg>;
};
export const Waves:React.FC<C&{x?:number;y?:number;s?:number;c?:string}> = ({t,a,y=420,c=BONE}) =>
  <Svg>{Array.from({length:9},(_,n)=><Ink key={n} c={c} w={3} op={.25+n*.07} draw={ease(k(t,a+n*.1,a+n*.1+1.2))}
    d={`M0,${y+n*34} `+Array.from({length:33},(_,m)=>`L${m*40},${y+n*34+Math.sin(m*.6+t*2+n)*(6+n)}`).join(' ')}/>)}</Svg>;
export const Radar:React.FC<C> = ({t,a,b}) => {
  const cx=640,cy=520,e=ease(k(t,a,a+1)), sw=((t-a)*140)%360;
  return <Svg op={e}>{[0,1,2,3,4].map(i=>{const r=(((t-a)*70+i*100)%500)+10;return <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={BONE} strokeWidth={2} opacity={1-r/520}/>;})}
    <line x1={cx} y1={cy} x2={cx+Math.cos(sw*Math.PI/180)*480} y2={cy+Math.sin(sw*Math.PI/180)*480} stroke={BONE} strokeWidth={3} opacity={.6}/>
    <circle cx={cx} cy={cy} r={12} fill={RED}/><text x={1240} y={700} textAnchor="end" fill={BONE} {...{style:F(44,500)}}>R = {(((t-a)*70)*1.3).toFixed(0)} km</text></Svg>;
};
export const Temple:React.FC<C&{tags?:boolean;ruler?:boolean;x?:number}> = ({t,a,tags=true,ruler=false,x=640}) => {
  const dr=ease(k(t,a,a+1.4)); const cols=[-210,-70,70,210];
  return <Svg><Ink c={BONE} w={5} d={`M${x-290},470 L${x},350 L${x+290},470 Z`} draw={dr}/>
    {cols.map((c,i)=><Ink key={i} c={BONE} w={5} d={`M${x+c},475 L${x+c},660`} draw={ease(k(t,a+.3+i*.15,a+1.2+i*.15))}/>)}
    <Ink c={BONE} w={5} d={`M${x-310},665 L${x+310},665`} draw={dr}/>
    {tags && cols.map((c,i)=>{const at=a+1.2+i*.7, p=ease(k(t,at,at+.3));const sw=Math.sin((t-at)*5+i)*9*Math.exp(-(t-at)*.8);
      return <g key={i} opacity={p} transform={`rotate(${sw} ${x+c} 480)`}><line x1={x+c} y1={480} x2={x+c} y2={520} stroke={BONE} strokeWidth={2}/>
        <rect x={x+c-38} y={520} width={76} height={44} fill={INK} stroke={RED} strokeWidth={3}/><text x={x+c} y={553} textAnchor="middle" fill={RED} {...{style:F(32)}}>{(rnd(i+3)*90+9).toFixed(0)}$</text></g>;})}
    {ruler && <g opacity={ease(k(t,a+2,a+2.4))}><rect x={x-310} y={690} width={620*ease(k(t,a+2,a+5))} height={8} fill={RED}/></g>}</Svg>;
};
export const Network:React.FC<C> = ({t,a,b}) => {
  const N=26, pos=Array.from({length:N},(_,i)=>[90+rnd(i)*1100,340+rnd(i+40)*340] as [number,number]);
  const n=Math.floor(ease(k(t,a,b-2))*N), edges:[number,number][]=[];
  for(let i=1;i<n;i++){let best=0,bd=1e9;for(let j=0;j<i;j++){const d=Math.hypot(pos[i][0]-pos[j][0],pos[i][1]-pos[j][1]);if(d<bd){bd=d;best=j;}}edges.push([i,best]);
    if(i>3){let b2=(i*7)%i;edges.push([i,b2]);}}
  return <Svg>{edges.map(([i,j],q)=><line key={q} x1={pos[i][0]} y1={pos[i][1]} x2={pos[j][0]} y2={pos[j][1]} stroke={BONE} strokeWidth={1.5} opacity={.55}/>)}
    {pos.slice(0,n).map((p,i)=><circle key={i} cx={p[0]} cy={p[1]} r={8+(i===n-1?6:0)} fill={i===n-1?RED:BONE}/>)}
    <text x={70} y={710} fill={BONE} {...{style:F(40,500)}}>NODES {n*41} · LINKS {edges.length*263}</text></Svg>;
};
export const Screens:React.FC<C> = ({t,a,b}) => {
  const on=Math.floor(k(t,a+.4,b-1)*8);
  return <Svg>{Array.from({length:8},(_,i)=>{const x=60+(i%4)*300, y=340+Math.floor(i/4)*180, lit=i<on;
    return <g key={i}><rect x={x} y={y} width={270} height={150} fill={INK} stroke={BONE} strokeWidth={4}/>
      {lit && <><rect x={x+6} y={y+6} width={258} height={138} fill={BONE} opacity={.12}/><text x={x+135} y={y+98} textAnchor="middle" fill={i===on-1?RED:BONE} {...{style:F(70)}}>TRUE ✓</text>
        <rect x={x+4} y={y+((t*140+i*30)%146)} width={262} height={3} fill={BONE} opacity={.5}/></>}</g>;})}</Svg>;
};
export const Input:React.FC<C&{text:string;result:string;rate?:number;resultAt?:number;y?:number}> = ({t,a,text,result,rate=4,resultAt,y=380}) => {
  const n=Math.floor(Math.max(0,t-a-.3)*rate), shown=text.slice(0,n), done=resultAt!==undefined&&t>=resultAt, ang=(t*300)%360;
  return <Svg><rect x={70} y={y} width={1140} height={96} fill={INK} stroke={BONE} strokeWidth={4}/>
    <text x={100} y={y+68} fill={BONE} {...{style:F(64,500)}}>{shown}{Math.floor(t*2)%2===0?'▌':''}</text>
    {!done && n>=text.length && <circle cx={1150} cy={y+48} r={26} fill="none" stroke={RED} strokeWidth={8} strokeDasharray="40 120" transform={`rotate(${ang} 1150 ${y+48})`}/>}
    {done && <g transform={`translate(0 ${Math.exp(-(t-resultAt!)*20)*-30})`}><rect x={70} y={y+130} width={1140} height={110} fill={RED}/><text x={640} y={y+215} textAnchor="middle" fill={INK} {...{style:F(84)}}>{result}</text></g>}</Svg>;
};
export const Calendar:React.FC<C> = ({t,a,b}) => {
  const q=k(t,a,b), yr=2026+Math.floor(q*q*180), fl=((t-a)*4)%1;
  return <Svg>{[3,2,1,0].map(i=><rect key={i} x={380+i*8} y={330+i*8} width={520} height={340} fill={BONE} stroke={INK} strokeWidth={3}/>)}
    <rect x={380} y={330} width={520} height={80} fill={RED}/>
    <text x={640} y={620} textAnchor="middle" fill={INK} {...{style:F(250)}}>{yr}</text>
    <rect x={380} y={330} width={520} height={340*fl} fill={INK} opacity={.2*(1-fl)}/></Svg>;
};
export const Flame:React.FC<{t:number;x:number;y:number;s:number;paper?:boolean;op?:number}> = ({t,x,y,s,paper=false,op=1}) => {
  const fl=1+energyAt(t)*.25+Math.sin(t*19)*.03;
  return <Svg op={op}><g transform={`translate(${x} ${y}) scale(${s*fl} ${s*fl})`}>
    <path d="M0,0 C-70,-20 -80,-110 -20,-190 C-30,-120 10,-110 20,-160 C70,-110 80,-30 0,0Z" fill={RED} stroke={paper?INK:BONE} strokeWidth={4/Math.max(s,.3)} strokeLinejoin="round"/>
    <path d="M0,-4 C-30,-20 -30,-70 0,-100 C25,-70 30,-20 0,-4Z" fill={paper?BONE:BONE} opacity={.9}/></g></Svg>;
};
export const Scales:React.FC<C&{paper?:boolean;tLight:number}> = ({t,a,tLight,paper=false}) => {
  const ink=paper?INK:BONE, heavy=1-ease(k(t,tLight-1.5,tLight+.5)), lift=ease(k(t,tLight,tLight+3)), ang=-13*heavy+Math.sin(t*2)*(1-heavy)*1.5;
  const pan=(s:number)=>{const q=ang*Math.PI/180;return [s*250*Math.cos(q),s*250*Math.sin(q)];};
  return <Svg y={20}><g transform="translate(640,340)"><rect x={-6} y={-10} width={12} height={290} fill={ink}/><rect x={-110} y={280} width={220} height={14} fill={ink}/>
    <g transform={`rotate(${ang})`}><rect x={-250} y={-6} width={500} height={12} fill={ink}/></g>
    {[-1,1].map((s,i)=>{const [px,py]=pan(s);return <g key={i} transform={`translate(${px},${py-lift*(i?50:70)})`}>
      <line x1={0} y1={0} x2={-70} y2={110} stroke={ink} strokeWidth={2}/><line x1={0} y1={0} x2={70} y2={110} stroke={ink} strokeWidth={2}/>
      <path d="M-80,110 L80,110 Q70,150 0,150 Q-70,150 -80,110Z" fill="none" stroke={ink} strokeWidth={4}/>
      {i===0 && Array.from({length:12},(_,n)=>{const fly=lift*(40+rnd(n+9)*240), dx=(rnd(n+3)-.5)*lift*160;
        return <g key={n} transform={`translate(${(rnd(n)-.5)*50+dx},${100-n*13-fly})`} opacity={1-lift*.8}><ellipse rx={30} ry={8} fill={RED}/><text y={4} textAnchor="middle" fontSize={9} fill={INK} fontFamily={barlow}>$</text></g>;})}</g>;})}
    <circle r={12+lift*50} fill={RED} opacity={lift*.9}/></g></Svg>;
};
export const Ledger:React.FC<C&{tClose:number}> = ({t,a,tClose}) => {
  const bk=ease(k(t,tClose-.5,tClose+.05)), rows=Math.floor(k(t,a,tClose)*9);
  return <Svg y={130}><g transform="translate(640,380)">
    <rect x={-300-(1-bk)*300} y={-150} width={300} height={300} fill={INK} stroke={BONE} strokeWidth={5}/><rect x={(1-bk)*300} y={-150} width={300} height={300} fill={INK} stroke={BONE} strokeWidth={5}/>
    {Array.from({length:rows},(_,i)=><g key={i} opacity={1-bk}><line x1={-280} x2={-30} y1={-110+i*30} y2={-110+i*30} stroke={BONE} opacity={.5}/>
      <text x={-30} y={-116+i*30} textAnchor="end" fill={i===rows-1?RED:BONE} {...{style:F(26,500)}}>{(rnd(i+1)*9000+100).toFixed(2)}</text></g>)}</g></Svg>;
};
export const FlatWave:React.FC<C> = ({t,a}) => {
  const sq=ease(k(t,a+1,a+3.5)), pts=Array.from({length:110},(_,i)=>{const tt=t-5+i*.05;const e=energyAt(tt);return `${i*11.6},${520-(e*(1-sq)+.12*sq)*(rnd(i)>.5?1:-1)*220*(1-sq*.9)}`}).join(' ');
  return <Svg><polyline points={pts} fill="none" stroke={BONE} strokeWidth={4}/>
    <text x={1240} y={690} textAnchor="end" fill={sq>.9?RED:BONE} {...{style:F(54,500)}}>{sq>.9?'NORMALIZED −0.1 dB':'−'+(30-sq*29.9).toFixed(1)+' dB'}</text></Svg>;
};
export const GridBuild:React.FC<C> = ({t,a,b}) => {
  const q=ease(k(t,a,b-.5)), step=Math.max(30,240-q*210);
  return <Svg>{Array.from({length:Math.ceil(1280/step)},(_,i)=><line key={'v'+i} x1={i*step} x2={i*step} y1={330} y2={330+ (720-330)*Math.min(1,q*2)} stroke={BONE} strokeWidth={2}/>)}
    {Array.from({length:Math.ceil(400/step)+1},(_,i)=><line key={'h'+i} x1={0} x2={1280*Math.min(1,q*2)} y1={330+i*step} y2={330+i*step} stroke={BONE} strokeWidth={2}/>)}
    <text x={1240} y={700} textAnchor="end" fill={RED} {...{style:F(44,500)}}>CELL {step.toFixed(0)} u</text></Svg>;
};
export const Stopwatch:React.FC<C> = ({t,a}) => {
  const q=t-a, sp=q*q*40+q*60;
  return <Svg x={380} y={320}><circle cx={260} cy={200} r={170} fill={INK} stroke={BONE} strokeWidth={5}/>
    {Array.from({length:12},(_,i)=><line key={i} x1={260+Math.sin(i*Math.PI/6)*150} y1={200-Math.cos(i*Math.PI/6)*150} x2={260+Math.sin(i*Math.PI/6)*170} y2={200-Math.cos(i*Math.PI/6)*170} stroke={BONE} strokeWidth={4}/>)}
    <g transform={`rotate(${sp*6} 260 200)`}><line x1={260} y1={200} x2={260} y2={55} stroke={RED} strokeWidth={6}/></g>
    <text x={260} y={300} textAnchor="middle" fill={BONE} {...{style:F(52)}}>{(q*3.7).toFixed(2)} s</text></Svg>;
};
export const Pie:React.FC<C> = ({t,a}) => {
  const vals=[.34,.21,.18,.15,.12], sec=Math.floor(k(t,a,a+3)*5+.01); let acc=0;
  return <Svg x={90} y={330}><g transform="translate(180,180)">{vals.map((v,i)=>{const a0=acc*2*Math.PI-Math.PI/2;acc+=v;const a1=acc*2*Math.PI-Math.PI/2;if(i>=sec+1)return null;
    return <path key={i} d={`M0,0 L${Math.cos(a0)*170},${Math.sin(a0)*170} A170,170 0 ${v>.5?1:0} 1 ${Math.cos(a1)*170},${Math.sin(a1)*170}Z`} fill={i===0?RED:'none'} stroke={BONE} strokeWidth={4}/>;})}</g>
    {['MEAN 4.27','σ 1.93','p<0.05','N=10⁶','R²=.98'].map((s,i)=><text key={i} x={460} y={60+i*66} fill={i===0?RED:BONE} opacity={ease(k(t,a+i*.5,a+i*.5+.3))} {...{style:F(54,500)}}>{s}</text>)}</Svg>;
};
export const Compare:React.FC<C> = ({t,a,b}) => {
  const rows=['QUALITY','PRICE','SPEED','RANK'], q=k(t,a,b);
  return <Svg>{[0,1].map(c=><g key={c}><rect x={90+c*600} y={340} width={500} height={340} fill={INK} stroke={BONE} strokeWidth={4}/>
    <text x={340+c*600} y={410} textAnchor="middle" fill={c===0?RED:BONE} {...{style:F(70)}}>{c?'B':'A'}</text>
    {rows.map((r,i)=>{const v=(rnd(i+c*7+Math.floor(t*(2+i)))*.9+.1)*ease(k(t,a+.3+i*.4,a+.8+i*.4));return <g key={i}><text x={110+c*600} y={470+i*50} fill={BONE} {...{style:F(32,500)}}>{r}</text>
      <rect x={290+c*600} y={445+i*50} width={280*v} height={22} fill={c===0?RED:BONE}/></g>;})}</g>)}
    <text x={640} y={520} textAnchor="middle" fill={BONE} {...{style:F(80)}}>VS</text><rect x={0} y={718} width={1280*q} height={2} fill={RED}/></Svg>;
};
export const Sign:React.FC<C> = ({t,a,b}) => {
  const n=Math.floor(k(t,a+.5,b-2)*6+.99), icons=['!','◐','≈','△','?','⌖'];
  return <Svg>{Array.from({length:6},(_,i)=>{const x=110+i*190;if(i>=n)return null;const lit=i===n-1;
    return <g key={i}><path d={`M${x},640 L${x+75},510 L${x+150},640Z`} fill={lit?RED:'none'} stroke={BONE} strokeWidth={5}/><text x={x+75} y={625} textAnchor="middle" fill={lit?INK:BONE} {...{style:F(70)}}>{icons[i]}</text>
      <text x={x+75} y={690} textAnchor="middle" fill={BONE} {...{style:F(28,500)}}>SIGN {String(i+1).padStart(2,'0')}</text></g>;})}</Svg>;
};
export const TallyRow:React.FC<C> = ({t,a}) => (
  <Svg>{Array.from({length:4},(_,i)=>{const x=60+i*300,c=Math.floor(Math.max(0,t-a-i*.3)*(3+i*2.2)*13),d=String(c).padStart(4,'0').split('');
    return <g key={i} opacity={ease(k(t,a+i*.3,a+i*.3+.3))}><rect x={x} y={360} width={270} height={150} rx={22} fill={INK} stroke={BONE} strokeWidth={4}/>
      {d.map((ch,j)=><g key={j}><rect x={x+14+j*61} y={380} width={52} height={80} fill={BONE}/><text x={x+40+j*61} y={440} textAnchor="middle" fill={INK} {...{style:F(70)}}>{ch}</text></g>)}
      <circle cx={x+235} cy={485} r={14} fill={RED}/></g>;})}</Svg>
);

/* ================= PAPER SCENES: hand-drawn ================= */
export const Spiral:React.FC<C> = ({t,a,b}) => {
  const q=ease(k(t,a,b-1)); const pts:[number,number][]=Array.from({length:160},(_,i)=>{const an=i*.16, r=6+i*1.7;return [640+Math.cos(an)*r,500+Math.sin(an)*r*.75];});
  return <Svg><Ink d={wob(pts,3,1.2)} draw={q} c={INK} w={5}/><circle cx={640} cy={500} r={11} fill={RED}/></Svg>;
};
export const SortBars:React.FC<C> = ({t,a,b}) => {
  const q=ease(k(t,a+.5,b-.5)), n=12;
  return <Svg>{Array.from({length:n},(_,i)=>{const rawH=60+rnd(i+4)*220, sortedH=60+i*20, h=rawH+(sortedH-rawH)*q;const x0=100+rnd(i+9)*20*(1-q);
    return <rect key={i} x={110+i*90+(rnd(i)-.5)*30*(1-q)} y={680-h} width={64} height={h} fill="none" stroke={INK} strokeWidth={5} transform={`rotate(${(rnd(i+1)-.5)*14*(1-q)} ${140+i*90} 680)`}/>;})}</Svg>;
};
export const Sounding:React.FC<C&{tDepth:number}> = ({t,a,tDepth}) => {
  const d=ease(k(t,tDepth,tDepth+2));
  return <Svg><Waves t={t} a={a} b={a+1} wt={()=>a} y={380} c={INK}/>
    <line x1={640} x2={640} y1={380} y2={380+300*d} stroke={RED} strokeWidth={5}/><circle cx={640} cy={380+300*d} r={16} fill={RED}/>
    {Array.from({length:7},(_,i)=><g key={i}><line x1={700} x2={730} y1={420+i*40} y2={420+i*40} stroke={INK} strokeWidth={3}/></g>)}
    <text x={760} y={700} fill={RED} {...{style:{...F(64),fontFamily:hand}}}>{d>.95?'? m':''}</text></Svg>;
};
export const Stars:React.FC<C> = ({t,a,b,wt}) => {
  const n=Math.floor(ease(k(t,a,a+2.2))*16), tl=wt('lost'), lost=ease(k(t,tl,tl+1));
  return <Svg>{Array.from({length:n},(_,i)=>{const x=110+rnd(i)*1060,y=380+rnd(i+30)*290;
    return <g key={i}><path d={wob([[x,y-18],[x+5,y-5],[x+18,y],[x+5,y+5],[x,y+18],[x-5,y+5],[x-18,y],[x-5,y-5],[x,y-18]],i,1)} fill="none" stroke={INK} strokeWidth={4} opacity={1-lost}/>
      <text x={x+14} y={y-14} fill={RED} {...{style:{...F(30),fontFamily:hand}}}>{i+1}</text></g>;})}</Svg>;
};
export const Cards:React.FC<C> = ({t,a,b}) => {
  const n=Math.floor(k(t,a,b-4)*22), cnt=Math.floor(k(t,a,b-4)*1204331);
  return <Svg>{Array.from({length:n},(_,i)=><g key={i} transform={`rotate(${(rnd(i)-.5)*30} ${300+rnd(i+3)*500} 550)`}><rect x={200+rnd(i+3)*500} y={430+rnd(i+6)*120} width={260} height={150} fill={BONE} stroke={INK} strokeWidth={4}/><line x1={220+rnd(i+3)*500} x2={420+rnd(i+3)*500} y1={470+rnd(i+6)*120} y2={470+rnd(i+6)*120} stroke={INK} strokeWidth={3}/></g>)}
    <text x={1230} y={700} textAnchor="end" fill={RED} {...{style:F(54)}}>ARCHIVE · {cnt.toLocaleString('en-US')} WORDS</text></Svg>;
};
export const Orbit:React.FC<C> = ({t,a}) => {
  const e=ease(k(t,a,a+1)), an=(t-a)*2.2;
  return <Svg op={e}><Ink d={circ(640,500,190,2)} c={INK} w={4} op={.5}/><circle cx={640+Math.cos(an)*190} cy={500+Math.sin(an)*190} r={12} fill={INK}/>
    <circle cx={640} cy={500} r={16} fill={RED}/><line x1={600} x2={680} y1={500} y2={500} stroke={INK} strokeWidth={2}/><line x1={640} x2={640} y1={460} y2={540} stroke={INK} strokeWidth={2}/></Svg>;
};
export const Slider:React.FC<C> = ({t,a,b}) => {
  const q=ease(k(t,a+.5,b-1.5));
  return <Svg><Ink d={wob([[120,520],[1160,520]],5,2)} c={INK} w={8}/><Ink d={wob([[120,520],[120+1040*q,520]],7,2)} c={RED} w={14}/>
    <circle cx={120+1040*q} cy={520} r={34} fill={BONE} stroke={INK} strokeWidth={6}/>
    <text x={1160} y={620} textAnchor="end" fill={INK} {...{style:{...F(80),fontFamily:hand}}}>{Math.round(q*100)}% ↑</text></Svg>;
};
export const MapBars:React.FC<C> = ({t,a,b}) => {
  const dr=ease(k(t,a,a+1.5)), bars=ease(k(t,a+2.5,b-1.5));
  return <Svg><Ink d={wob([[160,640],[220,470],[360,420],[470,470],[590,360],[760,400],[860,480],[1000,430],[1090,560],[980,660],[760,630],[560,670],[360,650],[160,640]],8,4)} draw={dr} c={INK} w={6}/>
    {Array.from({length:9},(_,i)=><line key={i} x1={150+i*125} x2={150+i*125} y1={330} y2={330+360*bars*ease(k(bars,i*.07,i*.07+.3))} stroke={INK} strokeWidth={14} opacity={.9}/>)}</Svg>;
};
export const BubbleTemple:React.FC<C> = ({t,a}) => (
  <Svg><Ink d={wob([[200,640],[200,470],[320,400],[440,470],[440,640],[200,640]],2,3)} draw={ease(k(t,a,a+1.2))} c={INK} w={6}/>
    <g opacity={ease(k(t,a+1.4,a+1.9))}><path d="M470,440 L1150,440 L1150,570 L560,570 L520,620 L525,570 L470,570Z" fill={BONE} stroke={INK} strokeWidth={5}/>
      <text x={810} y={535} textAnchor="middle" fill={RED} {...{style:F(84)}}>$ € % ↑↑</text></g></Svg>
);
export const Altar:React.FC<C> = ({t,a,b}) => {
  const q=ease(k(t,a+1,b-3));
  return <Svg><Ink d={wob([[300,650],[300,520],[980,520],[980,650],[300,650]],4,3)} draw={ease(k(t,a,a+1.2))} c={INK} w={7}/>
    <rect x={380} y={430} width={520} height={50} fill="none" stroke={INK} strokeWidth={6}/><rect x={386} y={436} width={508*q} height={38} fill={RED}/>
    <text x={640} y={400} textAnchor="middle" fill={INK} {...{style:{...F(60),fontFamily:hand}}}>KPI {Math.round(q*100)}%</text></Svg>;
};
export const CalcHand:React.FC<C> = ({t,a,b}) => {
  const n=Math.floor(k(t,a+.5,b-1)*10);
  return <Svg><Ink d={wob([[420,340],[860,340],[860,690],[420,690],[420,340]],6,3)} draw={ease(k(t,a,a+1))} c={INK} w={6}/>
    <rect x={450} y={365} width={380} height={90} fill="none" stroke={INK} strokeWidth={5}/><text x={820} y={436} textAnchor="end" fill={RED} {...{style:{...F(76),fontFamily:hand}}}>{n>=9?'= 100 %':(rnd(n+Math.floor(t*6))*99).toFixed(0)}</text>
    {Array.from({length:12},(_,i)=><circle key={i} cx={490+(i%3)*130} cy={510+Math.floor(i/3)*45} r={16} fill="none" stroke={INK} strokeWidth={4}/>)}</Svg>;
};
export const Protractor:React.FC<C> = ({t,a,b}) => {
  const n=Math.floor(k(t,a+1,b-2)*14);
  return <Svg><path d="M240,690 A400,400 0 0 1 1040,690" fill="none" stroke={INK} strokeWidth={5}/>
    {Array.from({length:19},(_,i)=>{const an=Math.PI*i/18;return <line key={i} x1={640-Math.cos(an)*400} y1={690-Math.sin(an)*400} x2={640-Math.cos(an)*(i%3?370:350)} y2={690-Math.sin(an)*(i%3?370:350)} stroke={INK} strokeWidth={3}/>;})}
    {Array.from({length:n},(_,i)=>{const an=Math.PI/2+(i+1)*.045;return <line key={i} x1={640} y1={690} x2={640+Math.cos(an)*360} y2={690-Math.sin(an)*360} stroke={INK} strokeWidth={3} opacity={.65-i*.03}/>;})}
    <line x1={640} y1={690} x2={640} y2={310} stroke={RED} strokeWidth={9}/><text x={660} y={330} fill={RED} {...{style:{...F(52),fontFamily:hand}}}>AXIS</text>
    <text x={1230} y={700} textAnchor="end" fill={INK} {...{style:F(50,500)}}>+{n}°</text></Svg>;
};
export const StarSpiral:React.FC<C> = ({t,a,b}) => (
  <Svg><Ink d={wob(Array.from({length:120},(_,i)=>[640+Math.cos(i*.2)*(10+i*1.7),520+Math.sin(i*.2)*(10+i*1.5)] as [number,number]),9,2)} draw={ease(k(t,a,b-1))} c={INK} w={5}/>
    {Array.from({length:7},(_,i)=>{const x=150+rnd(i)*980,y=350+rnd(i+20)*300;return <path key={i} d={wob([[x,y-22],[x+6,y-6],[x+22,y],[x+6,y+6],[x,y+22],[x-6,y+6],[x-22,y],[x-6,y-6],[x,y-22]],i,1)} fill="none" stroke={RED} strokeWidth={5} opacity={ease(k(t,a+i*.5,a+i*.5+.4))}/>;})}</Svg>
);
export const QMark:React.FC<C&{txt?:string}> = ({t,a,txt='?'}) => (
  <Svg><text x={640} y={680} textAnchor="middle" fill={RED} opacity={ease(k(t,a,a+.5))} {...{style:{fontFamily:hand,fontWeight:700,fontSize:420,transform:`rotate(${Math.sin(t*2)*3}deg)`,transformOrigin:'640px 540px'}}}>{txt}</text></Svg>
);
export const Wind:React.FC<C> = ({t,a,b}) => {
  const q=k(t,a+.8,b);
  return <Svg>{Array.from({length:30},(_,i)=>{const x=(rnd(i)*1100+60)+q*q*1400*(.4+rnd(i+5)), y=360+rnd(i+11)*300+Math.sin(q*9+i)*20;
    return <text key={i} x={x} y={y} fill={INK} opacity={Math.max(0,1-q*.9)} transform={`rotate(${q*220*(rnd(i+2)-.5)} ${x} ${y})`} {...{style:F(34+rnd(i)*30,500)}}>{Math.floor(rnd(i+8)*9999)}</text>;})}
    {Array.from({length:5},(_,i)=><Ink key={i} d={wob(Array.from({length:14},(_,j)=>[80+j*85,420+i*50+Math.sin(j*.7+i)*22] as [number,number]),i,1)} draw={ease(k(t,a+i*.3,a+i*.3+1.6))} c={RED} w={5} op={.8}/>)}</Svg>;
};
export const CrossOut:React.FC<C&{kind:'eclipse'|'scroll'|'fire'}> = ({t,a,kind}) => {
  const dr=ease(k(t,a,a+.8)), x=ease(k(t,a+1,a+1.4));
  return <Svg>{kind==='eclipse' && <><circle cx={640} cy={520} r={130} fill={INK}/><circle cx={690} cy={500} r={125} fill={BONE}/><Ink d={circ(640,520,160,5)} c={INK} w={4} draw={dr}/></>}
    {kind==='scroll' && <><Ink d={wob([[440,380],[840,380],[840,660],[440,660],[440,380]],2,3)} c={INK} w={6} draw={dr}/>{[0,1,2,3,4].map(i=><Ink key={i} d={wob([[480,430+i*45],[800,430+i*45]],i,2)} c={INK} w={4} draw={dr}/>)}</>}
    {kind==='fire' && <Flame t={t} x={640} y={650} s={1.6} paper op={dr}/>}
    <Ink d={wob([[420,360],[860,690]],1,3)} c={RED} w={16} draw={x}/><Ink d={wob([[860,360],[420,690]],2,3)} c={RED} w={16} draw={ease(k(t,a+1.3,a+1.7))}/></Svg>;
};
export const FormHand:React.FC<C> = ({t,a,b}) => {
  const sig=ease(k(t,a+2,a+5));
  return <Svg><Ink d={wob([[260,340],[1020,340],[1020,690],[260,690],[260,340]],3,3)} c={INK} w={6} draw={ease(k(t,a,a+1))}/>
    <text x={300} y={410} fill={INK} {...{style:{...F(60),fontFamily:hand}}}>PERMISSION REQUESTED</text>
    {[0,1,2].map(i=><Ink key={i} d={wob([[300,470+i*55],[980,470+i*55]],i+2,2)} c={INK} w={3} op={.5} draw={ease(k(t,a+.8+i*.2,a+1.4+i*.2))}/>)}
    <Ink d={wob([[320,650],[380,600],[430,660],[500,590],[560,640],[640,610]],11,3)} c={RED} w={6} draw={sig}/></Svg>;
};
export const TagsFall:React.FC<C> = ({t,a,b}) => (
  <Svg>{Array.from({length:12},(_,i)=>{const at=a+i*.25,d=Math.max(0,t-at),x=100+rnd(i)*1050;const y=360+d*d*180;
    return d<=0?null:<g key={i} transform={`translate(${x},${y}) rotate(${d*40*(rnd(i+3)-.5)})`} opacity={Math.max(0,1-d*.5)}><rect width={110} height={60} fill={BONE} stroke={INK} strokeWidth={4}/><text x={55} y={44} textAnchor="middle" fill={RED} {...{style:F(36)}}>{(rnd(i)*90+9).toFixed(0)}$</text></g>;})}</Svg>
);
export const NoChange:React.FC<C> = ({t,a,b}) => {
  const v=Math.floor(k(t,a,b)*k(t,a,b)*4000);
  return <Svg><Ink d={circ(640,500,150,3)} c={INK} w={6} draw={ease(k(t,a,a+1.5))}/><circle cx={640} cy={500} r={12} fill={RED}/>
    <text x={90} y={700} fill={INK} {...{style:F(50,500)}}>VERSION 1.{v}</text><text x={1230} y={700} textAnchor="end" fill={RED} {...{style:F(50)}}>CHANGES: 0</text></Svg>;
};
export const Rays:React.FC<C> = ({t,a,b}) => {
  const q=ease(k(t,a,b-2));
  return <Svg>{Array.from({length:22},(_,i)=>{const an=i/22*Math.PI*2;return <Ink key={i} d={wob([[640+Math.cos(an)*(130+(1-q)*120),520+Math.sin(an)*(130+(1-q)*120)],[640+Math.cos(an)*(190+q*180+rnd(i)*50),520+Math.sin(an)*(190+q*180+rnd(i)*50)]],i,3)} c={INK} w={5} draw={ease(k(t,a+i*.05,a+i*.05+.8))}/>;})}
    <Flame t={t} x={640} y={610} s={1.2+q*.5} paper/></Svg>;
};
