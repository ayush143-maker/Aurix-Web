import {search,streams,diag} from './api.js';
const $=s=>document.querySelector(s),au=$('#au');
const ld=k=>{try{return JSON.parse(localStorage.getItem(k))}catch{return null}},sv=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=s=>{s=Math.max(0,Math.floor(s||0));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};
const S={route:'home',q:'',st:'idle',items:[],all:false,pos:0,dur:0,play:false,ready:false,i:-1,queue:[],msg:'',hist:ld('aurix.hist')||[],sec:{},open:innerWidth>=1280,sheet:false,f:{remix:1,live:1,cover:1,podcast:1,slowed:1}};
const FL={remix:'Hide remixes',live:'Hide live versions',cover:'Hide covers',podcast:'Hide podcasts',slowed:'Hide slowed and sped up'};
const RX={remix:/remix|rework|bootleg|\bflip\b/i,live:/[(\[-]\s*live\b|live (at|in|from|on)\b/i,cover:/\bcover\b|karaoke|tribute/i,slowed:/slowed|sped up|speed up|nightcore|8d audio|bass boosted/i};
const bad=t=>Object.keys(S.f).some(k=>S.f[k]&&(k=='podcast'?t.d>900||/podcast|episode|interview/i.test(t.title):RX[k].test(t.title)));
const sv2=(d,x)=>`<svg viewBox="0 0 24 24"${x||''}>${d}</svg>`,L=' fill="none" stroke="currentColor" stroke-width="1.75"';
const ic={p:sv2('<path d="M7 4.5v15L19 12z" fill="currentColor"/>'),z:sv2('<path d="M6 5h4v14H6zM14 5h4v14h-4z" fill="currentColor"/>'),n:sv2('<path d="M6 5v14l10-7zM17 5h2v14h-2z" fill="currentColor"/>'),b:sv2('<path d="M18 5v14L8 12zM5 5h2v14H5z" fill="currentColor"/>'),l:sv2('<path d="M4 6h16M4 12h16M4 18h9"/>',L),x:sv2('<path d="M5 5l14 14M19 5L5 19"/>',L),d:sv2('<path d="m6 9 6 6 6-6"/>',L)};
const cur=()=>S.queue[S.i];
const art=(t,alt)=>`<span class="art">${t&&t.art?`<img src="${esc(t.art)}" alt="${alt?esc(t.title):''}" loading="lazy" referrerpolicy="no-referrer">`:''}</span>`;
const row=(t,k,s,tag)=>{const c=cur()&&cur().id===t.id;return `<li><button class="tr" data-a="play" data-s="${s}" data-k="${k}"${c?' aria-current="true"':''}><span class="n">${c?'':k+1}</span>${art(t)}<span><span class="t">${esc(t.title)}</span><span class="m">${esc(t.artist)}</span></span><span class="d">${tag&&bad(t)?'Filtered, ':''}${t.d?fmt(t.d):''}</span></button></li>`};
const list=(a,s,tag,o=0)=>`<ol class="ls">${a.map((t,k)=>row(t,k+o,s,tag)).join('')}</ol>`;
const empty=(h,p,x='')=>`<div class="empty"><h2>${h}</h2><p>${p}</p>${x}</div>`;
const SEC=[['made','Made for You'],['recent','Recent plays'],['quick','Quick picks','top hits 2026'],['love','Love songs','love songs'],['party','Party hits','party hits'],['chill','Chill','chill songs'],['gym','Workout','workout songs'],['bolly','Bollywood hits','bollywood hits'],['retro','Throwback','90s hits']];
const secQ=(id,q)=>id=='made'?(S.hist[0]?S.hist[0].artist+' songs':'top songs 2026'):q;
const card=(t,k,s)=>`<button class="card" data-a="play" data-s="${s}" data-k="${k}">${art(t)}<span class="t">${esc(t.title)}</span><span class="m">${esc(t.artist)}</span></button>`;
const secItems=id=>((S.sec[id]||{}).items||[]).filter(t=>!bad(t));
const rowH=id=>{const x=S.sec[id];if(!x||x.st=='load')return Array(8).fill('<span class="card sk"><span class="art"></span></span>').join('');
 if(x.st=='err')return '<button class="link" data-a="rs" data-id="'+id+'">Couldn’t load. Try again</button>';
 const it=secItems(id);return it.length?it.map((t,k)=>card(t,k,'s:'+id)).join(''):'<p class="m">Nothing here right now.</p>'};
const home=()=>{const h=S.hist,f=h[0];return `<h1 class="sr">Home</h1>`+(f?`<section class="hero">${art(f,1)}<div><h2>${esc(f.title)}</h2><p>${esc(f.artist)}</p><button class="btn solid" data-a="play" data-s="h" data-k="0">${S.play&&cur()&&cur().id==f.id?'Pause':'Play'}</button></div></section>`:'')+
 SEC.map(([id,title,q])=>id=='recent'?(h.length?`<section class="sec hs"><h2>${title}</h2><div class="hrow">${h.map((t,k)=>card(t,k,'h')).join('')}</div></section>`:''):`<section class="sec hs" data-sec="${id}" data-q="${esc(secQ(id,q))}"><h2>${title}</h2><div class="hrow">${rowH(id)}</div></section>`).join('')};
const paint=id=>{const e=document.querySelector('[data-sec="'+id+'"] .hrow');if(e)e.innerHTML=rowH(id)};
async function loadSec(id,q){const k='aurix.sec.'+q,c=ld(k);if(c&&Date.now()-c.t<216e5){S.sec[id]={st:'ok',items:c.items};return paint(id)}
 S.sec[id]={st:'load'};paint(id);try{const items=await search(q);S.sec[id]={st:'ok',items};if(items.length)sv(k,{t:Date.now(),items:items.slice(0,20)})}catch{S.sec[id]={st:'err'}}paint(id)}
function watch(){if(typeof IntersectionObserver=='undefined')return;const io=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;io.unobserve(e.target);const id=e.target.dataset.sec;if(!S.sec[id]||S.sec[id].st=='err')loadSec(id,e.target.dataset.q)}),{rootMargin:'300px'});document.querySelectorAll('[data-sec][data-q]').forEach(e=>io.observe(e))}
const heroBtn=()=>{const b=document.querySelector('.hero .btn');if(b&&S.hist[0])b.textContent=S.play&&cur()&&cur().id==S.hist[0].id?'Pause':'Play'};
const shown=()=>S.all?S.items:S.items.filter(t=>!bad(t));
function results(){const q=S.q.trim();
 if(S.st=='idle')return empty('Find a song.','Search by song or artist. Podcasts, remixes and live versions stay out unless you turn the filters off.');
 if(S.st=='load')return '<p class="hint">Searching…</p>';
 if(S.st=='err')return empty('Couldn’t load results.','The music servers did not respond. Check your connection and try again.'+(diag.length?`</p><p class="hint">${esc(diag.slice(0,3).join(' / '))}`:'')+'','<button class="btn solid" data-a="retry">Try again</button>');
 if(!S.items.length)return empty(`No songs found for “${esc(q)}”.`,'Check the spelling or try the artist name.');
 const hid=S.items.filter(bad).length,ok=shown();
 return (hid?`<p class="hint">${S.all?'Showing everything.':hid+' hidden by your filters.'} <button class="link" data-a="all">${S.all?'Hide filtered results':'Show them'}</button></p>`:'')+(ok.length?list(ok,'r',S.all):'')}
const search_=()=>`<h1 class="sr">Search</h1><label class="sf"><span class="sr">Search songs and artists</span><input id="q" type="search" placeholder="Search songs and artists" value="${esc(S.q)}" autocomplete="off"></label><div class="chips">${Object.keys(FL).map(k=>`<button class="chip" data-a="f" data-k="${k}" aria-pressed="${!!S.f[k]}">${FL[k]}</button>`).join('')}</div><div id="res">${results()}</div>`;
const lib=()=>`<h1 class="pt">Library</h1>`+empty('Nothing saved yet.','Songs you save and playlists you make will appear here.','<a class="btn solid" href="#/search">Find songs</a>');
const queue=()=>`<div class="qh"><h2>Up next</h2><button class="ib" data-a="q" aria-label="Close queue">${ic.x}</button></div><div class="qs">${cur()?`<p class="g">Now playing</p><div class="sm">${list([cur()],'q',0,S.i)}</div><p class="g">Next</p><div class="sm">${list(S.queue.slice(S.i+1),'q',0,S.i+1)}</div>`:'<p class="g">Nothing queued yet.</p>'}</div>`;
const pp=()=>`<button class="ib pp" data-a="pp" aria-label="${S.play?'Pause':'Play'}"${cur()?'':' disabled'}>${S.play?ic.z:ic.p}</button>`;
const ctl=()=>`<button class="ib" data-a="prev" aria-label="Previous"${cur()?'':' disabled'}>${ic.b}</button>${pp()}<button class="ib" data-a="next" aria-label="Next"${cur()?'':' disabled'}>${ic.n}</button>`;
const scrub=()=>`<div class="sc"><span data-cur>0:00</span><div class="bar" role="slider" tabindex="0" aria-label="Seek" aria-valuemin="0" data-a="seek"><i></i></div><span data-dur>0:00</span></div>`;
const player=()=>{const t=cur()||{title:'Nothing playing',artist:'Search for a song'},txt=`<span class="txt"><span class="t">${esc(t.title)}</span><span class="m">${esc(S.msg||t.artist)}</span></span>`;
 return `<div class="mini"><i class="pf"></i><button class="mo" data-a="sheet">${art(t)}${txt}</button>${pp()}</div><div class="full"><div class="now">${art(t)}${txt}</div><div class="ctr"><div class="tp">${ctl()}</div>${scrub()}</div><div class="rt"><button class="ib" data-a="q" aria-label="Toggle queue">${ic.l}</button></div></div>`};
const sheet=()=>{const t=cur(),x=`<button class="ib" data-a="sheet" aria-label="Close player">${ic.d}</button>`;
 return t?`<div class="sh">${x}${art(t,1)}<div><h2>${esc(t.title)}</h2><p class="m">${esc(S.msg||t.artist)}</p></div>${scrub()}<div class="tp">${ctl()}</div><div class="sm"><p class="g">Up next</p>${list(S.queue.slice(S.i+1),'q',0,S.i+1)}</div></div>`:`<div class="sh">${x}</div>`};
function tick(){const t=cur(),d=S.dur||(t&&t.d)||0,p=d?Math.min(100,S.pos/d*100):0;
 document.querySelectorAll('.bar i,.pf').forEach(e=>e.style.width=p+'%');
 document.querySelectorAll('[data-cur]').forEach(e=>e.textContent=fmt(S.pos));document.querySelectorAll('[data-dur]').forEach(e=>e.textContent=fmt(d));
 document.querySelectorAll('.bar').forEach(e=>{e.setAttribute('aria-valuemax',Math.round(d));e.setAttribute('aria-valuenow',Math.round(S.pos))});
 if('mediaSession' in navigator&&d&&S.ready)try{navigator.mediaSession.setPositionState({duration:d,position:Math.min(S.pos,d),playbackRate:1})}catch{}}
function stage(){$('#stage').innerHTML=S.route=='search'?search_():S.route=='library'?lib():home();if(S.route=='home')watch()}
function chrome(){$('#queue').innerHTML=queue();$('#player').innerHTML=player();$('#sheet').innerHTML=sheet();$('#app').classList.toggle('queue-open',S.open);$('#app').classList.toggle('sheet-open',S.sheet);tick()}
const res=()=>{const e=$('#res');if(e)e.innerHTML=results()};
function refresh(){S.route=='search'?res():S.route=='home'?heroBtn():stage();chrome()}
function nav(){const r=location.hash.slice(2);S.route=r=='search'||r=='library'?r:'home';S.sheet=false;document.querySelectorAll('[data-r]').forEach(a=>a.dataset.r==S.route?a.setAttribute('aria-current','page'):a.removeAttribute('aria-current'));stage();chrome();$('#stage').scrollTo(0,0)}
// Playback
function meta(t){if(!('mediaSession' in navigator))return;navigator.mediaSession.metadata=new MediaMetadata({title:t.title,artist:t.artist,artwork:t.art?[{src:t.art}]:[]})}
const tryUrl=u=>new Promise(res=>{let d=0;const fin=v=>{if(d)return;d=1;clearTimeout(tm);au.removeEventListener('loadedmetadata',ok);au.removeEventListener('error',er);res(v)},
 ok=()=>fin(true),er=()=>fin('Audio error '+(au.error?au.error.code:'?')),tm=setTimeout(()=>fin('Audio timeout'),9000);
 au.addEventListener('loadedmetadata',ok);au.addEventListener('error',er);au.src=u;au.load()});
async function load(k){const t=S.queue[k];if(!t)return;S.i=k;S.pos=0;S.dur=t.d;S.play=true;S.ready=false;S.msg='';refresh();
 try{const skip=[];let ok=false,last='';
  for(let n=0;n<4&&!ok;n++){let s;try{s=await streams(t.id,skip)}catch(e){last=last||e.message;break}
   if(cur()!==t)return;skip.push(s.base);if(s.d>0)S.dur=s.d;
   for(const u of s.urls){const r=await tryUrl(u);if(cur()!==t)return;if(r===true){ok=true;break}last=r}}
  if(!ok)throw new Error(last||'No playable stream');
  S.ready=true;await au.play();S.hist=[t,...S.hist.filter(x=>x.id!==t.id)].slice(0,12);sv('aurix.hist',S.hist);meta(t)}
 catch(e){if(cur()!==t)return;S.play=false;if(e.name=='NotAllowedError'){S.msg='Tap play to start.';refresh();return}S.ready=false;S.msg='No sound: '+e.message;refresh()}}
const toggle=()=>{if(!cur())return;if(!S.ready)return load(S.i);au.paused?au.play().catch(()=>{}):au.pause()};
const step=d=>{if(d<0&&S.pos>3&&S.ready){au.currentTime=0;return}const n=S.i+d;if(n>=0&&n<S.queue.length)load(n);else if(d>0){au.pause();S.pos=0;chrome()}};
au.addEventListener('timeupdate',()=>{S.pos=au.currentTime;if(isFinite(au.duration))S.dur=au.duration;tick()});
au.addEventListener('ended',()=>step(1));
['play','pause'].forEach(e=>au.addEventListener(e,()=>{if(!S.ready)return;S.play=!au.paused;chrome();heroBtn()}));
if('mediaSession' in navigator){const m=(a,f)=>{try{navigator.mediaSession.setActionHandler(a,f)}catch{}};m('play',()=>au.play());m('pause',()=>au.pause());m('previoustrack',()=>step(-1));m('nexttrack',()=>step(1));m('seekto',e=>{au.currentTime=e.seekTime})}
// Search
let tk=0,tm;
async function run(){const q=S.q.trim(),n=++tk;if(!q){S.st='idle';return res()}S.st='load';res();
 try{const items=await search(q);if(n!=tk)return;S.items=items;S.st='ok'}catch{if(n!=tk)return;S.st='err'}res()}
document.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b)return;const a=b.dataset.a;
 if(a=='play'){const s=b.dataset.s,k=+b.dataset.k;if(s=='q')return k==S.i?toggle():load(k);const Lst=s=='r'?shown():s=='h'?S.hist:secItems(s.slice(2)),t=Lst[k];if(!t)return;if(cur()&&cur().id==t.id)return toggle();S.queue=[...Lst];load(k)}
 else if(a=='pp')toggle();else if(a=='next')step(1);else if(a=='prev')step(-1);
 else if(a=='q'){S.open=!S.open;chrome()}else if(a=='sheet'){S.sheet=!S.sheet;chrome()}
 else if(a=='all'){S.all=!S.all;res()}else if(a=='retry')run();else if(a=='rs')loadSec(b.dataset.id,b.closest('[data-sec]').dataset.q);
 else if(a=='f'){S.f[b.dataset.k]=!S.f[b.dataset.k];b.setAttribute('aria-pressed',!!S.f[b.dataset.k]);res()}
 else if(a=='seek'&&S.ready){const r=b.getBoundingClientRect();au.currentTime=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width))*(S.dur||0)}});
document.addEventListener('input',e=>{if(e.target.id=='q'){S.q=e.target.value;clearTimeout(tm);tm=setTimeout(run,350)}});
document.addEventListener('keydown',e=>{if(e.target.matches&&e.target.matches('.bar')&&S.ready&&(e.key=='ArrowRight'||e.key=='ArrowLeft'))au.currentTime=Math.max(0,au.currentTime+(e.key=='ArrowRight'?5:-5))});
addEventListener('hashchange',nav);nav();
