// "Aurix Mix": builds an Up Next list from a seed song. Songs with the same title are dropped,
// results are scored (relevance, taste, length) and spread across artists, like a radio.
import {search} from './api.js';
const NOISE=/\(.*?\)|\[.*?\]|official|video|audio|lyrics?|lyrical|full song|remaster(ed)?|\b(ft|feat)\b\.?.*/gi;
export const tkey=t=>t.title.toLowerCase().replace(NOISE,' ').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const ak=a=>(a||'').toLowerCase().replace(/ - topic|vevo|official|records|t-series/g,'').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const LANG=[[/[\u0900-\u097F]/,'bollywood hits'],[/[\u0A00-\u0A7F]/,'punjabi hits'],[/[\uAC00-\uD7AF]/,'kpop hits'],[/[\u3040-\u30FF]/,'jpop hits'],[/[\u0600-\u06FF]/,'arabic hits']];
const memo=new Map();
const find=async q=>{const c=memo.get(q);if(c&&Date.now()-c.t<6e5)return c.r;const r=await search(q);memo.set(q,{t:Date.now(),r});return r};
export async function mix({seed,anchor,ctx,taste=[],avoid,avk,bad,limit=12}){
 const tk=tkey(seed),qs=[[seed.artist+' songs',3],['songs like '+tk+' '+seed.artist,2.2]];
 if(anchor&&anchor.id!=seed.id)qs.push([anchor.artist+' songs',1.5]);
 if(ctx)qs.push([ctx,1.6]);
 const lg=LANG.find(([r])=>r.test(seed.title+seed.artist));if(lg)qs.push([lg[1],1.4]);
 const tt=taste.find(a=>ak(a)!=ak(seed.artist));if(tt)qs.push([tt+' songs',1]);
 const res=await Promise.allSettled(qs.map(([q])=>find(q))),fav=new Set(taste.map(ak)),seen=new Set(avk),pool=[];
 res.forEach((r,i)=>{if(r.status!='fulfilled')return;r.value.forEach((t,j)=>{
  if(avoid.has(t.id)||bad(t))return;const k=tkey(t);if(!k||k==tk||seen.has(k))return;seen.add(k);
  let s=qs[i][1]-j*.03;const d=t.d;s+=d>=130&&d<=340?.5:(d&&(d<90||d>480)?-1:0);if(fav.has(ak(t.artist)))s+=.7;s+=Math.random()*.6;
  pool.push({t,s,a:ak(t.artist)})})});
 pool.sort((x,y)=>y.s-x.s);
 const out=[],n={};
 for(const cap of [2,3,99]){for(const p of pool){if(out.length>=limit)break;if(out.includes(p)||(n[p.a]||0)>=cap)continue;
  if(cap<99&&out.slice(-2).some(o=>o.a==p.a))continue;out.push(p);n[p.a]=(n[p.a]||0)+1}}
 return out.map(p=>p.t)}
