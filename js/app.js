import {search,streams,diag,big} from './api.js';
import {mix,tkey} from './rec.js';
import {lib} from './lib.js';
const $=s=>document.querySelector(s),au=$('#au');
const ld=k=>{try{return JSON.parse(localStorage.getItem(k))}catch{return null}},sv=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=s=>{s=Math.max(0,Math.floor(s||0));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};
const S={route:'home',q:'',st:'idle',items:[],all:false,pos:0,dur:0,play:false,ready:false,i:-1,queue:[],msg:'',hist:ld('aurix.hist')||[],sec:{},sq:{},m:'au',noPiped:0,lg:0,fill:'',auto:ld('aurix.auto')!==false,ctx:'',seed:null,menu:null,lt:'liked',pid:'',open:innerWidth>=1280,sheet:false,f:{remix:1,live:1,cover:1,podcast:1,slowed:1,mashup:1,...(ld('aurix.f')||{})}};
const FL={remix:'Hide remixes',live:'Hide live versions',cover:'Hide covers',podcast:'Hide podcasts',slowed:'Hide slowed and sped up',mashup:'Hide mashups and jukeboxes'};
const RX={remix:/remix|rework|bootleg|\bflip\b/i,live:/[(\[-]\s*live\b|live (at|in|from|on)\b/i,cover:/\bcover\b|karaoke|tribute/i,slowed:/slowed|sped up|speed up|nightcore|8d audio|bass boosted|lofi remix/i,mashup:/mashup|jukebox|non-?stop|medley|mega ?mix|full album|compilation|\d+ ?(hour|hr)s?\b/i};
const bad=t=>(t.d>0&&t.d<50)||Object.keys(S.f).some(k=>S.f[k]&&RX2(k,t));
const RX2=(k,t)=>k=='podcast'?t.d>900||/podcast|episode|interview|reaction|trailer|ringtone/i.test(t.title):RX[k]?RX[k].test(t.title):false;
const sv2=(d,x)=>`<svg viewBox="0 0 24 24"${x||''}>${d}</svg>`,L=' fill="none" stroke="currentColor" stroke-width="1.75"';
const ic={p:sv2('<path d="M7 4.5v15L19 12z" fill="currentColor"/>'),z:sv2('<path d="M6 5h4v14H6zM14 5h4v14h-4z" fill="currentColor"/>'),n:sv2('<path d="M6 5v14l10-7zM17 5h2v14h-2z" fill="currentColor"/>'),b:sv2('<path d="M18 5v14L8 12zM5 5h2v14H5z" fill="currentColor"/>'),l:sv2('<path d="M4 6h16M4 12h16M4 18h9"/>',L),x:sv2('<path d="M5 5l14 14M19 5L5 19"/>',L),d:sv2('<path d="m6 9 6 6 6-6"/>',L)};
const hp='<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>';
ic.h=sv2(hp,L);ic.hf=sv2(hp,' fill="currentColor" stroke="currentColor" stroke-width="1.75"');ic.m=sv2('<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',L);
const cur=()=>S.queue[S.i];
const heart=()=>{const t=cur(),on=t&&lib.isLiked(t.id);return `<button class="ib" data-a="likecur" aria-label="${on?'Remove from liked songs':'Add to liked songs'}"${t?'':' disabled'}>${on?ic.hf:ic.h}</button>`};
const greet=()=>{const h=new Date().getHours();return h<5?'Late night':h<12?'Good morning':h<17?'Good afternoon':'Good evening'};
const art=(t,alt)=>`<span class="art">${t&&t.art?`<img src="${esc(big(t.art))}" alt="${alt?esc(t.title):''}" loading="lazy" referrerpolicy="no-referrer">`:''}</span>`;
const row=(t,k,s,tag)=>{const c=cur()&&cur().id===t.id;return `<li class="rw"><button class="tr" data-a="play" data-s="${s}" data-k="${k}"${c?' aria-current="true"':''}><span class="n">${c?'':k+1}</span>${art(t)}<span><span class="t">${esc(t.title)}</span><span class="m">${esc(t.artist)}</span></span><span class="d">${tag&&bad(t)?'Filtered, ':''}${t.d?fmt(t.d):''}</span></button><button class="ra" data-a="menu" data-s="${s}" data-k="${k}" aria-label="More options for ${esc(t.title)}">${ic.m}</button></li>`};
const list=(a,s,tag,o=0)=>`<ol class="ls">${a.map((t,k)=>row(t,k+o,s,tag)).join('')}</ol>`;
const empty=(h,p,x='')=>`<div class="empty"><h2>${h}</h2><p>${p}</p>${x}</div>`;
const SEC=[['made','Made for You'],['recent','Recent plays'],['quick','Quick picks','top hits 2026'],['love','Love songs','love songs'],['party','Party hits','party hits'],['chill','Chill','chill songs'],['gym','Workout','workout songs'],['bolly','Bollywood hits','bollywood hits'],['retro','Throwback','90s hits']];
const secQ=(id,q)=>id=='made'?(S.hist[0]?S.hist[0].artist+' songs':'top songs 2026'):q;
const card=(t,k,s)=>`<button class="card" data-a="play" data-s="${s}" data-k="${k}">${art(t)}<span class="t">${esc(t.title)}</span><span class="m">${esc(t.artist)}</span></button>`;
const secItems=id=>((S.sec[id]||{}).items||[]).filter(t=>!bad(t));
const rowH=id=>{const x=S.sec[id];if(!x||x.st=='load')return Array(8).fill('<span class="card sk"><span class="art"></span></span>').join('');
 if(x.st=='err')return '<button class="link" data-a="rs" data-id="'+id+'">Couldn’t load. Try again</button>';
 const it=secItems(id);return it.length?it.map((t,k)=>card(t,k,'s:'+id)).join(''):'<p class="m">Nothing here right now.</p>'};
const home=()=>{const h=S.hist,f=h[0];return `<h1 class="gr">${greet()}</h1>`+(f?`<section class="hero">${art(f,1)}<div><h2>${esc(f.title)}</h2><p>${esc(f.artist)}</p><button class="btn solid" data-a="play" data-s="h" data-k="0">${S.play&&cur()&&cur().id==f.id?'Pause':'Play'}</button></div></section>`:'')+
 SEC.map(([id,title,q])=>id=='recent'?(h.length?`<section class="sec hs"><h2>${title}</h2><div class="hrow">${h.map((t,k)=>card(t,k,'h')).join('')}</div></section>`:''):`<section class="sec hs" data-sec="${id}" data-q="${esc(secQ(id,q))}"><h2>${title}</h2><div class="hrow">${rowH(id)}</div></section>`).join('')};
const paint=id=>{const e=document.querySelector('[data-sec="'+id+'"] .hrow');if(e)e.innerHTML=rowH(id)};
async function loadSec(id,q){S.sq[id]=q;const k='aurix.sec2.'+q,c=ld(k);if(c&&Date.now()-c.t<216e5){S.sec[id]={st:'ok',items:c.items};return paint(id)}
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
const search_=()=>`<h1 class="sr">Search</h1><div class="sb"><label class="sf"><span class="sr">Search songs and artists</span><input id="q" type="search" placeholder="Search songs and artists" value="${esc(S.q)}" autocomplete="off"></label><div class="chips">${Object.keys(FL).map(k=>`<button class="chip" data-a="f" data-k="${k}" aria-pressed="${!!S.f[k]}">${FL[k]}</button>`).join('')}</div></div><div id="res">${results()}</div>`;
const libV=()=>{const tabs=`<div class="seg" role="group" aria-label="Library view">${['liked','pls'].map(k=>`<button data-a="lt" data-k="${k}" aria-pressed="${S.lt==k}">${k=='liked'?'Liked songs':'Playlists'}</button>`).join('')}</div>`;let b;
 if(S.lt=='liked'){const l=lib.liked;b=l.length?`<div class="acts"><button class="btn solid" data-a="playall" data-s="l">Play</button><button class="btn" data-a="shuf" data-s="l">Shuffle</button></div>`+list(l,'l'):empty('No liked songs yet.','Tap the heart in the player, or the menu on any song, to save it here.','<a class="btn solid" href="#/search">Find songs</a>')}
 else b=`<div class="np"><input id="npn" placeholder="New playlist name" autocomplete="off"><button class="btn solid" data-a="newpl2">Create</button></div>`+(lib.pls.length?`<div class="grid pg">${lib.pls.map(p=>`<a class="card" href="#/pl/${p.id}">${art(p.tracks[0])}<span class="t">${esc(p.name)}</span><span class="m">${p.tracks.length} songs</span></a>`).join('')}</div>`:empty('No playlists yet.','Name one above, then add songs from the menu next to any song.'));
 return `<h1 class="pt">Library</h1>${tabs}${b}<div class="acts bk"><button class="btn" data-a="exp">Export backup</button><label class="btn">Import backup<input type="file" id="imp" accept="application/json" hidden></label></div>`};
const plV=()=>{const p=lib.pl(S.pid);if(!p)return empty('Playlist not found.','It may have been deleted.','<a class="btn solid" href="#/library">Back to library</a>');
 return `<h1 class="pt">${esc(p.name)}</h1><p class="m pm">${p.tracks.length} songs</p><div class="acts"><button class="btn solid" data-a="playall" data-s="p:${p.id}">Play</button><button class="btn" data-a="shuf" data-s="p:${p.id}">Shuffle</button><button class="btn" data-a="ren">Rename</button><button class="btn" data-a="delpl">Delete</button></div>`+(p.tracks.length?list(p.tracks,'p:'+p.id):empty('This playlist is empty.','Add songs from the menu next to any song.'))};
const fnote=()=>S.fill=='load'&&S.queue.length-1-S.i<3?'<p class="g">Finding songs you may like…</p>':'';
const autoB=()=>`<button class="chip" data-a="auto" aria-pressed="${!!S.auto}">Autoplay</button>`;
const queue=()=>`<div class="qh"><h2>Up next</h2><div>${autoB()}<button class="ib" data-a="q" aria-label="Close queue">${ic.x}</button></div></div><div class="qs">${cur()?`<p class="g">Now playing</p><div class="sm">${list([cur()],'q',0,S.i)}</div><p class="g">Next</p><div class="sm">${list(S.queue.slice(S.i+1),'q',0,S.i+1)}</div>${fnote()}`:'<p class="g">Nothing queued yet.</p>'}</div>`;
const pp=()=>`<button class="ib pp" data-a="pp" aria-label="${S.play?'Pause':'Play'}"${cur()?'':' disabled'}>${S.play?ic.z:ic.p}</button>`;
const ctl=()=>`<button class="ib" data-a="prev" aria-label="Previous"${cur()?'':' disabled'}>${ic.b}</button>${pp()}<button class="ib" data-a="next" aria-label="Next"${cur()?'':' disabled'}>${ic.n}</button>`;
const scrub=()=>`<div class="sc"><span data-cur>0:00</span><div class="bar" role="slider" tabindex="0" aria-label="Seek" aria-valuemin="0" data-a="seek"><i></i></div><span data-dur>0:00</span></div>`;
const player=()=>{const t=cur()||{title:'Nothing playing',artist:'Search for a song'},txt=`<span class="txt"><span class="t">${esc(t.title)}</span><span class="m">${esc(S.msg||t.artist)}</span></span>`;
 return `<div class="mini"><i class="pf"></i><button class="mo" data-a="sheet">${art(t)}${txt}</button>${pp()}</div><div class="full"><div class="now">${art(t)}${txt}</div><div class="ctr"><div class="tp">${ctl()}</div>${scrub()}</div><div class="rt">${heart()}<button class="ib" data-a="q" aria-label="Toggle queue">${ic.l}</button></div></div>`};
const sheet=()=>{const t=cur(),x=`<button class="ib" data-a="sheet" aria-label="Close player">${ic.d}</button>`;
 return t?`<div class="sh">${x}${art(t,1)}<div class="tl"><div><h2>${esc(t.title)}</h2><p class="m">${esc(S.msg||t.artist)}</p></div>${heart()}</div>${scrub()}<div class="tp">${ctl()}</div><div class="sm"><p class="g">Up next</p><div class="acts">${autoB()}</div>${list(S.queue.slice(S.i+1),'q',0,S.i+1)}${fnote()}</div></div>`:`<div class="sh">${x}</div>`};
function tick(){const t=cur(),d=S.dur||(t&&t.d)||0,p=d?Math.min(100,S.pos/d*100):0;
 document.querySelectorAll('.bar i,.pf').forEach(e=>e.style.width=p+'%');
 document.querySelectorAll('[data-cur]').forEach(e=>e.textContent=fmt(S.pos));document.querySelectorAll('[data-dur]').forEach(e=>e.textContent=fmt(d));
 document.querySelectorAll('.bar').forEach(e=>{e.setAttribute('aria-valuemax',Math.round(d));e.setAttribute('aria-valuenow',Math.round(S.pos))});
 if('mediaSession' in navigator&&d&&S.ready)try{navigator.mediaSession.setPositionState({duration:d,position:Math.min(S.pos,d),playbackRate:1})}catch{}}
function stage(){$('#stage').innerHTML=S.route=='search'?search_():S.route=='library'?libV():S.route=='pl'?plV():home();if(S.route=='home')watch()}
function chrome(){$('#queue').innerHTML=queue();$('#player').innerHTML=player();$('#sheet').innerHTML=sheet();$('#app').classList.toggle('queue-open',S.open);$('#app').classList.toggle('sheet-open',S.sheet);tick()}
const res=()=>{const e=$('#res');if(e)e.innerHTML=results()};
function refresh(){S.route=='search'?res():S.route=='home'?heroBtn():stage();chrome()}
function nav(){const r=location.hash.slice(2);S.pid='';if(r.startsWith('pl/')){S.route='pl';S.pid=r.slice(3)}else S.route=r=='search'||r=='library'?r:'home';S.sheet=false;S.menu=null;rmenu();document.querySelectorAll('[data-r]').forEach(a=>a.dataset.r==(S.route=='pl'?'library':S.route)?a.setAttribute('aria-current','page'):a.removeAttribute('aria-current'));stage();chrome();$('#stage').scrollTo(0,0)}
// Queue, autoplay mix, library actions
const getList=s=>s=='r'?shown():s=='h'?S.hist:s=='q'?S.queue:s=='l'?lib.liked:s[0]=='p'?(lib.pl(s.slice(2))||{tracks:[]}).tracks:secItems(s.slice(2));
const topArtists=()=>{const c={};lib.liked.forEach(t=>c[t.artist]=(c[t.artist]||0)+2);S.hist.forEach(t=>c[t.artist]=(c[t.artist]||0)+1);return Object.entries(c).sort((a,b)=>b[1]-a[1]).slice(0,4).map(x=>x[0])};
function start(L,k,ctx){S.queue=[...L];S.ctx=ctx||'';S.seed=L[k];load(k)}
let fp=null;
function fill(){if(!S.auto)return Promise.resolve();if(fp)return fp;
 fp=(async()=>{const t=S.queue[S.queue.length-1];if(!t)return;S.fill='load';chrome();
  try{const avoid=new Set([...S.queue,...S.hist].map(x=>x.id)),avk=new Set([...S.queue,...S.hist.slice(0,20)].map(tkey));
   S.queue.push(...await mix({seed:t,anchor:S.seed,ctx:S.ctx,taste:topArtists(),avoid,avk,bad}))}catch{}})().finally(()=>{fp=null;S.fill='';chrome()});return fp}
let tt;const toast=m=>{const e=$('#toast');e.textContent=m;e.classList.add('show');clearTimeout(tt);tt=setTimeout(()=>e.classList.remove('show'),1800)};
const menuH=()=>{const m=S.menu,t=m.t,head=`<div class="mh">${art(t)}<span class="txt"><span class="t">${esc(t.title)}</span><span class="m">${esc(t.artist)}</span></span><button class="ib" data-a="mx" aria-label="Close">${ic.x}</button></div>`;
 if(m.v=='pl')return head+`<div class="ml"><div class="np"><input id="npn" placeholder="New playlist name" autocomplete="off"><button class="btn solid" data-a="newpl">Create</button></div>${lib.pls.map(p=>`<button class="mi" data-a="addpl" data-id="${p.id}">${esc(p.name)}<span class="m">${p.tracks.length}</span></button>`).join('')}</div>`;
 return head+`<div class="ml"><button class="mi" data-a="like">${lib.isLiked(t.id)?'Remove from liked songs':'Add to liked songs'}</button><button class="mi" data-a="mpl">Add to playlist</button><button class="mi" data-a="pnext">Play next</button><button class="mi" data-a="qadd">Add to queue</button>${m.s&&m.s[0]=='p'?'<button class="mi" data-a="rmpl">Remove from this playlist</button>':''}</div>`};
const rmenu=()=>{const e=$('#menu');e.innerHTML=S.menu?`<div class="mb" data-a="mx"></div><div class="mp" role="dialog" aria-label="Song options">${menuH()}</div>`:'';e.classList.toggle('open',!!S.menu)};
const refreshLib=()=>{if(S.route=='library'||S.route=='pl')stage()};
function act(a,b){const m=S.menu,t=m&&m.t;
 if(!t&&['like','mpl','addpl','newpl','pnext','qadd','rmpl'].includes(a))return 1;
 switch(a){
 case 'menu':{const x=getList(b.dataset.s)[+b.dataset.k];if(x){S.menu={t:x,s:b.dataset.s,v:'main'};rmenu()}return 1}
 case 'mx':S.menu=null;rmenu();return 1;
 case 'like':{const on=lib.like(t);S.menu=null;rmenu();toast(on?'Added to liked songs':'Removed from liked songs');refreshLib();return 1}
 case 'likecur':{if(!cur())return 1;const on=lib.like(cur());toast(on?'Added to liked songs':'Removed from liked songs');chrome();refreshLib();return 1}
 case 'mpl':m.v='pl';rmenu();return 1;
 case 'addpl':{const p=lib.pl(b.dataset.id),ok=lib.addTo(p.id,t);S.menu=null;rmenu();toast(ok?'Added to '+p.name:'Already in '+p.name);refreshLib();return 1}
 case 'newpl':{const p=lib.newPl($('#npn').value);lib.addTo(p.id,t);S.menu=null;rmenu();toast('Added to '+p.name);refreshLib();return 1}
 case 'pnext':S.queue.splice(S.i+1,0,t);S.menu=null;rmenu();toast('Playing next');chrome();return 1;
 case 'qadd':S.queue.push(t);S.menu=null;rmenu();toast('Added to queue');chrome();return 1;
 case 'rmpl':lib.removeFrom(m.s.slice(2),t.id);S.menu=null;rmenu();stage();return 1;
 case 'lt':S.lt=b.dataset.k;stage();return 1;
 case 'playall':case 'shuf':{const L=[...getList(b.dataset.s)];if(!L.length)return 1;if(a=='shuf')for(let i=L.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[L[i],L[j]]=[L[j],L[i]]}start(L,0,'');return 1}
 case 'newpl2':{const i=$('#npn');if(!i.value.trim()){i.focus();return 1}lib.newPl(i.value);stage();return 1}
 case 'ren':{const p=lib.pl(S.pid),n=prompt('Rename playlist',p.name);if(n){lib.rename(p.id,n);stage()}return 1}
 case 'delpl':if(confirm('Delete this playlist?')){lib.delPl(S.pid);location.hash='#/library'}return 1;
 case 'exp':{const u=URL.createObjectURL(new Blob([lib.export()],{type:'application/json'})),x=document.createElement('a');x.href=u;x.download='aurix-backup.json';x.click();setTimeout(()=>URL.revokeObjectURL(u),1e3);return 1}
 case 'auto':S.auto=!S.auto;sv('aurix.auto',S.auto);chrome();if(S.auto)fill();return 1}
 return 0}
document.addEventListener('keydown',e=>{if(e.key=='Enter'&&e.target.id=='npn')act(S.menu?'newpl':'newpl2',e.target);if(e.key=='Escape'){if(S.menu){S.menu=null;rmenu()}else if(S.sheet){S.sheet=false;chrome()}}});
document.addEventListener('change',e=>{if(e.target.id!='imp')return;const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{lib.import(r.result);toast('Backup imported');stage()}catch(x){toast(x.message||'Could not import that file')}};r.readAsText(f)});
document.body.insertAdjacentHTML('beforeend','<div class="menu" id="menu"></div><div class="toast" id="toast" role="status"></div>');
// Playback
function meta(t){if(!('mediaSession' in navigator))return;navigator.mediaSession.metadata=new MediaMetadata({title:t.title,artist:t.artist,artwork:t.art?[{src:t.art}]:[]})}
const tryUrl=u=>new Promise(res=>{let d=0;const fin=v=>{if(d)return;d=1;clearTimeout(tm);au.removeEventListener('loadedmetadata',ok);au.removeEventListener('error',er);res(v)},
 ok=()=>fin(true),er=()=>fin('Audio error '+(au.error?au.error.code:'?')),tm=setTimeout(()=>fin('Audio timeout'),9000);
 au.addEventListener('loadedmetadata',ok);au.addEventListener('error',er);au.src=u;au.load()});
// Public Piped instances are mostly blocked by YouTube for /streams, so we fall back to the YouTube player.
let yt=null,ytP=null,poll=0,lt=0;
const P={play:()=>S.m=='yt'?yt.playVideo():au.play(),pause:()=>S.m=='yt'?yt.pauseVideo():au.pause(),paused:()=>S.m=='yt'?yt.getPlayerState()!=1:au.paused,seek:x=>S.m=='yt'?yt.seekTo(x,true):(au.currentTime=x),time:()=>S.m=='yt'?yt.getCurrentTime():au.currentTime};
const logPlay=t=>{if(S.lg==t.id)return;S.lg=t.id;S.hist=[t,...S.hist.filter(x=>x.id!==t.id)].slice(0,12);sv('aurix.hist',S.hist);meta(t)};
function ytLoad(){return ytP||(ytP=new Promise((ok,no)=>{const d=document.createElement('div');d.style.cssText='position:fixed;right:0;bottom:0;width:200px;height:200px;opacity:.01;pointer-events:none;z-index:-1';d.innerHTML='<div id="ytp"></div>';document.body.append(d);
 window.onYouTubeIframeAPIReady=()=>{yt=new YT.Player('ytp',{width:200,height:200,playerVars:{playsinline:1,controls:0,disablekb:1,rel:0,origin:location.origin},events:{onReady:()=>ok(),onStateChange:ytState,onError:ytErr}})};
 const sc=document.createElement('script');sc.src='https://www.youtube.com/iframe_api';sc.onerror=()=>{ytP=null;no(new Error('YouTube player blocked'))};document.head.append(sc);setTimeout(()=>no(new Error('YouTube player timeout')),10000)}))}
function ytState(e){if(S.m!='yt')return;const x=e.data;clearInterval(poll);
 if(x==1){S.play=true;S.msg='';logPlay(cur());poll=setInterval(()=>{S.pos=yt.getCurrentTime();const d=yt.getDuration();if(d>0)S.dur=d;tick()},500);chrome();heroBtn()}
 else if(x==2){S.play=false;chrome();heroBtn()}else if(x==0)step(1)}
function ytErr(){const t=cur();S.play=false;S.msg='Not playable here. Skipping.';chrome();setTimeout(()=>{if(cur()===t)step(1)},1200)}
async function viaPiped(t,tok){const skip=[];
 for(let n=0;n<2;n++){let x;try{x=await streams(t.id,skip)}catch{return false}
  if(tok!=lt)return false;skip.push(x.base);if(x.d>0)S.dur=x.d;
  for(const u of x.urls){if(tok!=lt)return false;const r=await tryUrl(u);if(tok!=lt)return false;
   if(r===true){S.m='au';S.ready=true;try{await au.play()}catch(e){if(e.name!='NotAllowedError')return false;S.msg='Tap play to start.';S.play=false}logPlay(t);return true}}}
 return false}
async function load(k){const t=S.queue[k];if(!t)return;let tok=++lt;S.i=k;S.pos=0;S.dur=t.d;S.play=true;S.ready=false;S.msg='';S.lg=0;refresh();if(S.queue.length-1-k<=3)fill();
 try{if(!S.noPiped){const ok=await Promise.race([viaPiped(t,tok),new Promise(r=>setTimeout(()=>r(false),5000))]);if(tok!=lt)return;if(ok){refresh();return}S.noPiped=1}
  tok=++lt;await ytLoad();if(tok!=lt)return;au.pause();S.m='yt';S.ready=true;yt.loadVideoById(t.id);meta(t)}
 catch(e){if(cur()!==t)return;S.play=false;S.ready=false;S.msg='No sound: '+e.message;refresh()}}
const toggle=()=>{if(!cur())return;if(!S.ready)return load(S.i);P.paused()?Promise.resolve(P.play()).catch(()=>{}):P.pause()};
const step=d=>{if(d<0&&S.pos>3&&S.ready){P.seek(0);return}const n=S.i+d;if(n>=0&&n<S.queue.length)load(n);else if(d>0){if(S.auto)fill().then(()=>{if(S.i==n-1&&S.queue.length>n)load(n);else{if(S.ready)P.pause();S.play=false;chrome()}});else{if(S.ready)P.pause();S.pos=0;chrome()}}};
au.addEventListener('timeupdate',()=>{if(S.m!='au')return;S.pos=au.currentTime;if(isFinite(au.duration))S.dur=au.duration;tick()});
au.addEventListener('ended',()=>{if(S.m=='au')step(1)});
['play','pause'].forEach(e=>au.addEventListener(e,()=>{if(!S.ready||S.m!='au')return;S.play=!au.paused;chrome();heroBtn()}));
if('mediaSession' in navigator){const m=(a,f)=>{try{navigator.mediaSession.setActionHandler(a,f)}catch{}};m('play',()=>P.play());m('pause',()=>P.pause());m('previoustrack',()=>step(-1));m('nexttrack',()=>step(1));m('seekto',e=>P.seek(e.seekTime))}
// Search
let tk=0,tm;
async function run(){const q=S.q.trim(),n=++tk;if(!q){S.st='idle';return res()}S.st='load';res();
 try{const items=await search(q);if(n!=tk)return;S.items=items;S.st='ok'}catch{if(n!=tk)return;S.st='err'}res()}
document.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b)return;const a=b.dataset.a;
 if(a=='play'){const s=b.dataset.s,k=+b.dataset.k;if(s=='q')return k==S.i?toggle():load(k);const Lst=getList(s),t=Lst[k];if(!t)return;if(cur()&&cur().id==t.id)return toggle();s=='r'?start([t],0,''):start(Lst,k,s[0]=='s'?S.sq[s.slice(2)]:'')}
 else if(a=='pp')toggle();else if(a=='next')step(1);else if(a=='prev')step(-1);
 else if(a=='q'){S.open=!S.open;chrome()}else if(a=='sheet'){S.sheet=!S.sheet;chrome()}
 else if(a=='all'){S.all=!S.all;res()}else if(a=='retry')run();else if(act(a,b))return;else if(a=='rs')loadSec(b.dataset.id,b.closest('[data-sec]').dataset.q);
 else if(a=='f'){S.f[b.dataset.k]=!S.f[b.dataset.k];sv('aurix.f',S.f);b.setAttribute('aria-pressed',!!S.f[b.dataset.k]);res()}
 else if(a=='seek'&&S.ready){const r=b.getBoundingClientRect();P.seek(Math.max(0,Math.min(1,(e.clientX-r.left)/r.width))*(S.dur||0))}});
document.addEventListener('input',e=>{if(e.target.id=='q'){S.q=e.target.value;clearTimeout(tm);tm=setTimeout(run,350)}});
document.addEventListener('keydown',e=>{if(e.target.matches&&e.target.matches('.bar')&&S.ready&&(e.key=='ArrowRight'||e.key=='ArrowLeft'))P.seek(Math.max(0,P.time()+(e.key=='ArrowRight'?5:-5)))});
addEventListener('hashchange',nav);nav();
