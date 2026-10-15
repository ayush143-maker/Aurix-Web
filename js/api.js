// Piped API: races instances in batches of 5 (first valid answer wins), like the reference _piped.js.
const DEFAULTS=["https://pipedapi.kavin.rocks","https://pipedapi.leptons.xyz","https://pipedapi.nosebs.ru","https://pipedapi-libre.kavin.rocks","https://piped-api.privacy.com.de","https://pipedapi.adminforge.de","https://api.piped.yt","https://pipedapi.drgns.space","https://pipedapi.owo.si","https://pipedapi.ducks.party","https://piped-api.codespace.cz","https://pipedapi.reallyaweso.me","https://api.piped.private.coffee","https://pipedapi.darkness.services","https://pipedapi.orangenet.cc"];
const ld=k=>{try{return JSON.parse(localStorage.getItem(k))}catch{return null}};
const sv=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}};
export const diag=[];
const valid=(path,d)=>path.startsWith('/search')?Array.isArray(d)||Array.isArray(d&&d.items):!!d&&typeof d=='object'&&(Array.isArray(d.audioStreams)||Array.isArray(d.videoStreams));
async function probe(base,path,ms,ctl){const t=setTimeout(()=>ctl.abort(),ms);
 try{const r=await fetch(base+path,{signal:ctl.signal});if(!r.ok)throw new Error('HTTP '+r.status);const d=await r.json();if(!valid(path,d))throw new Error('Bad response');return d}finally{clearTimeout(t)}}
async function call(path,ms,skip=[]){
 diag.length=0;const best=ld('aurix.best'),l=(best?[best,...DEFAULTS.filter(x=>x!==best)]:DEFAULTS).filter(x=>!skip.includes(x));
 for(let o=0;o<l.length;o+=5){const b=l.slice(o,o+5),cs=b.map(()=>new AbortController());
  try{return await Promise.any(b.map(async(u,i)=>{try{const d=await probe(u,path,ms,cs[i]);d.__b=u;cs.forEach((c,j)=>j!=i&&c.abort());sv('aurix.best',u);return d}
   catch(e){diag.push(new URL(u).host+': '+(e.name=='AbortError'?'timeout':e.message));throw e}}))}catch{}}
 throw new Error('All servers failed')}
const map=j=>(Array.isArray(j)?j:j.items||[]).filter(i=>i&&typeof i.url=='string'&&i.url.includes('v=')&&(!i.type||i.type=='stream')).map(i=>({id:new URL(i.url,'https://x.y').searchParams.get('v'),title:i.title,artist:i.uploaderName||'',art:i.thumbnail,d:i.duration>0?i.duration:0}));
export async function search(q){const e=encodeURIComponent(q);let r=[];
 try{r=map(await call('/search?q='+e+'&filter=music_songs',4000))}catch{}
 if(!r.length)r=map(await call('/search?q='+e+'&filter=videos',4000)).filter(t=>t.d>=45);
 return r}
export async function streams(id,skip=[]){const j=await call('/streams/'+id,7000,skip),
 a=(j.audioStreams||[]).filter(s=>s&&typeof s.url=='string'&&s.url.startsWith('https:')).sort((x,y)=>((y.mimeType||'').includes('mp4')-(x.mimeType||'').includes('mp4'))||((y.bitrate||0)-(x.bitrate||0)));
 if(!a.length)throw new Error('No audio stream');return{base:j.__b,d:j.duration,urls:a.slice(0,3).map(s=>s.url)}}
