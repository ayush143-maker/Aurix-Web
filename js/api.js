// Piped API with automatic failover between public instances.
const ld=k=>{try{return JSON.parse(localStorage.getItem(k))}catch{return null}};
const sv=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}};
const FALLBACK=['https://pipedapi.kavin.rocks'];
let pool;
async function instances(){
 if(pool)return pool;
 const c=ld('aurix.inst');if(c&&Date.now()-c.t<36e5&&c.l.length)return pool=c.l;
 try{const j=await(await fetch('https://piped-instances.kavin.rocks/',{signal:AbortSignal.timeout(6000)})).json();
  const l=[...new Set(j.filter(i=>i.api_url).map(i=>i.api_url.replace(/\/$/,'')))];
  if(l.length){sv('aurix.inst',{t:Date.now(),l});return pool=l}}catch{}
 return pool=FALLBACK}
async function call(path){
 const l=await instances(),best=ld('aurix.best'),order=best?[best,...l.filter(x=>x!==best)]:l;let err;
 for(const b of order.slice(0,6)){
  try{const r=await fetch(b+path,{signal:AbortSignal.timeout(9000)});if(!r.ok)throw new Error(r.status);const j=await r.json();if(j.error)throw new Error(j.error);sv('aurix.best',b);return j}catch(e){err=e}}
 throw err||new Error('No instance')}
export async function search(q){
 const j=await call('/search?q='+encodeURIComponent(q)+'&filter=music_songs');
 return(j.items||[]).filter(i=>i.url&&i.url.includes('v=')).map(i=>({id:new URL(i.url,'https://x.y').searchParams.get('v'),title:i.title,artist:i.uploaderName||'',art:i.thumbnail,d:i.duration>0?i.duration:0}))}
export async function stream(id){
 const j=await call('/streams/'+id),a=(j.audioStreams||[]).filter(s=>s.url),m=a.filter(s=>(s.mimeType||'').includes('mp4')),
 p=(m.length?m:a).sort((x,y)=>(y.bitrate||0)-(x.bitrate||0))[0];
 if(!p)throw new Error('No audio stream');return{url:p.url,d:j.duration}}
