import wordsJson from '../data/words.json';
import audio from '../data/audio.json';
export const FPS = 30;
export type Word = {text:string;w:string;section:string;line:number;echo:boolean;start:number;end:number;score:number};
export const allWords = wordsJson.words as Word[];
export const clamp = (x:number,a=0,b=1)=>Math.min(b,Math.max(a,x));
export const k = (t:number,a:number,b:number)=>clamp((t-a)/(b-a));
export const ease = (x:number)=>x*x*(3-2*x);
export const energyAt = (t:number)=>audio.energy[clamp(Math.round(t*10),0,audio.energy.length-1)];
export const beatPulse = (t:number,decay=7)=>{
  let last = -9; for (const b of audio.beats){ if (b<=t) last=b; else break; }
  return Math.exp(-(t-last)*decay);
};
export type Line = {n:number;words:Word[];t0:number;t1:number};
export const linesIn = (from:number,to:number):Line[] => {
  const m = new Map<number,Word[]>();
  for (const w of allWords) if (w.end>=from && w.start<=to) { (m.get(w.line)??m.set(w.line,[]).get(w.line)!).push(w); }
  return [...m.entries()].map(([n,words])=>({n,words,t0:words[0].start,t1:words[words.length-1].end}));
};
export const wordT = (w:string,near:number)=>allWords.filter(x=>x.w.toLowerCase()===w.toLowerCase()).sort((a,b)=>Math.abs(a.start-near)-Math.abs(b.start-near))[0];
export const rnd = (i:number)=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x);};
