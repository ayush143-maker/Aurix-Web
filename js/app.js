import {search,searchArtists,streams,diag,big} from './api.js';
import {mix,tkey} from './rec.js';
import {lib} from './lib.js';
import {patch} from './dom.js';
const $=s=>document.querySelector(s),au=$('#au');
const ld=k=>{try{return JSON.parse(localStorage.getItem(k))}catch{return null}},sv=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=s=>{s=Math.max(0,Math.floor(s||0));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};
const ak=a=>(a||'').toLowerCase().replace(/ - topic|vevo|official/g,'').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const slim=t=>({id:t.id,title:t.title,artist:t.artist,art:t.art,d:t.d,u:t.u});
const S={route:'home',q:'',st:'idle',items:[],arts:[],all:false,pos:0,dur:0,play:false,ready:false,i:-1,queue:[],msg:'',hist:ld('aurix.hist')||[],sec:{},sq:{},ar:{},rec:{},m:'au',noPiped:0,lg:0,fill:'',auto:ld('aurix.auto')!==false,ctx:'',seed:null,menu:null,lt:'liked',ls:'recent',lq:'',pid:'',an:'',hc:ld('aurix.hc')||'all',rs:ld('aurix.rs')||[],shuf:false,rep:'off',mute:false,vol:ld('aurix.vol')??80,resume:0,sw:0,open:innerWidth>=1280,sheet:false,f:{remix:1,live:1,cover:1,podcast:1,slowed:1,mashup:1,...(ld('aurix.f')||{})}};
{const q=ld('aurix.q');if(q&&Array.isArray(q.q)&&q.q[q.i]){S.queue=q.q;S.i=q.i;S.pos=S.resume=q.pos||0;S.dur=S.queue[S.i].d;S.seed=q.seed||null;S.ctx=q.ctx||''}}
const FL={remix:'Hide remixes',live:'Hide live versions',cover:'Hide covers',podcast:'Hide podcasts',slowed:'Hide slowed and sped up',mashup:'Hide mashups and jukeboxes'};
const RX={remix:/remix|rework|bootleg|\bflip\b/i,live:/[(\[-]\s*live\b|live (at|in|from|on)\b/i,cover:/\bcover\b|karaoke|tribute/i,slowed:/slowed|sped up|speed up|nightcore|8d audio|bass boosted|lofi remix/i,mashup:/mashup|jukebox|non-?stop|medley|mega ?mix|full album|compilation|\d+ ?(hour|hr)s?\b/i};
const RX2=(k,t)=>k=='podcast'?t.d>900||/podcast|episode|interview|reaction|trailer|ringtone/i.test(t.title):RX[k]?RX[k].test(t.title):false;
const bad=t=>(t.d>0&&t.d<50)||Object.keys(S.f).some(k=>S.f[k]&&RX2(k,t));
const sv2=(d,x)=>`<svg viewBox="0 0 24 24"${x||''}>${d}</svg>`,L=' fill="none" stroke="currentColor" stroke-width="1.75"';
const hp='<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',rp='<path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/>';
const ic={p:sv2('<path d="M7 4.5v15L19 12z" fill="currentColor"/>'),z:sv2('<path d="M6 5h4v14H6zM14 5h4v14h-4z" fill="currentColor"/>'),n:sv2('<path d="M6 5v14l10-7zM17 5h2v14h-2z" fill="currentColor"/>'),b:sv2('<path d="M18 5v14L8 12zM5 5h2v14H5z" fill="currentColor"/>'),
 l:sv2('<path d="M4 6h16M4 12h16M4 18h9"/>',L),x:sv2('<path d="M5 5l14 14M19 5L5 19"/>',L),d:sv2('<path d="m6 9 6 6 6-6"/>',L),h:sv2(hp,L),hf:sv2(hp,' fill="currentColor" stroke="currentColor" stroke-width="1.75"'),
 m:sv2('<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',L),pl:sv2('<path d="M5 12h14"/><path d="M12 5v14"/>',L),rp:sv2(rp,L),r1:sv2(rp+'<path d="M11 10h1v4"/>',L),
 sh:sv2('<path d="m18 14 4 4-4 4"/><path d="m18 2 4 4-4 4"/><path d="M2 18h1.973a4 4 0 0 0 3.3-1.7l5.454-8.6a4 4 0 0 1 3.3-1.7H22"/><path d="M2 6h1.972a4 4 0 0 1 3.6 2.2"/><path d="M22 18h-6.041a4 4 0 0 1-3.3-1.8l-.359-.45"/>',L)};
const cur=()=>S.queue[S.i];
const heart=()=>{const t=cur(),on=t&&lib.isLiked(t.id);return `<button class="ib" data-a="likecur" aria-label="${on?'Remove from liked songs':'Add to liked songs'}"${t?'':' disabled'}>${on?ic.hf:ic.h}</button>`};
const greet=()=>{const h=new Date().getHours();return h<5?'Late night':h<12?'Good morning':h<17?'Good afternoon':'Good evening'};
const art=(t,alt)=>`<span class="art">${t&&t.art?`<img src="${esc(big(t.art))}" alt="${alt?esc(t.title):''}" loading="lazy" referrerpolicy="no-referrer">`:''}</span>`;
const mosaic=p=>{const a=p.tracks.slice(0,4);return a.length<4?art(a[0]):`<span class="art mo4">${a.map(t=>`<img src="${esc(big(t.art))}" alt="" loading="lazy" referrerpolicy="no-referrer">`).join('')}</span>`};
const row=(t,k,s,tag)=>{const c=cur()&&cur().id===t.id,e=esc(s);return `<li class="rw"><button class="tr" data-a="play" data-s="${e}" data-k="${k}"${c?' aria-current="true"':''}><span class="n">${c?'':k+1}</span>${art(t)}<span><span class="t">${esc(t.title)}</span><span class="m">${esc(t.artist)}</span></span><span class="d">${t.u?'Queued, ':''}${tag&&bad(t)?'Filtered, ':''}${t.d?fmt(t.d):''}</span></button>${s.startsWith('rc:')?`<button class="ra" data-a="addrec" data-s="${e}" data-k="${k}" aria-label="Add ${esc(t.title)} to playlist">${ic.pl}</button>`:`<button class="ra" data-a="menu" data-s="${e}" data-k="${k}" aria-label="More options for ${esc(t.title)}">${ic.m}</button>`}</li>`};
const list=(a,s,tag,o=0)=>`<ol class="ls">${a.map((t,k)=>row(t,k+o,s,tag)).join('')}</ol>`;
const empty=(h,p,x='')=>`<div class="empty"><h2>${h}</h2><p>${p}</p>${x}</div>`;
const card=(t,k,s)=>`<button class="card" data-a="play" data-s="${esc(s)}" data-k="${k}">${art(t)}<span class="t">${esc(t.title)}</span><span class="m">${esc(t.artist)}</span></button>`;
// Home
const CHIPS=[['all','All'],['bolly','Bollywood'],['punjabi','Punjabi'],['english','English'],['chill','Chill'],['gym','Workout']],LANGS={bolly:'bollywood',punjabi:'punjabi',english:'english'};
const topArtists=()=>{const c={};lib.liked.forEach(t=>c[t.artist]=(c[t.artist]||0)+2);S.hist.forEach(t=>c[t.artist]=(c[t.artist]||0)+1);return Object.entries(c).sort((a,b)=>b[1]-a[1]).slice(0,4).map(x=>x[0])};
const setFor=k=>{
 if(k=='all')return [['quick','Quick picks','top hits 2026'],['love','Love songs','love songs'],['party','Party hits','party hits'],['chill','Chill','chill songs'],['gym','Workout','workout songs'],['bolly','Bollywood hits','bollywood hits'],['retro','Throwback','90s hits']];
 if(k=='chill')return [['c1','Lofi beats','lofi chill songs'],['c2','Rainy day','rainy day songs'],['c3','Focus','focus music'],['c4','Acoustic','acoustic songs'],['c5','Sleep','sleep songs'],['c6','Soft hits','soft pop songs']];
 if(k=='gym')return [['g1','Workout','workout songs'],['g2','Gym motivation','gym motivation songs'],['g3','Running','running songs'],['g4','Hip-hop workout','hip hop workout'],['g5','EDM','edm workout'],['g6','Cardio','cardio songs']];
 const l=LANGS[k];return [[k+'1','Top hits',l+' top hits 2026'],[k+'2','Love songs',l+' love songs'],[k+'3','Party hits',l+' party songs'],[k+'4','Chill',l+' chill songs'],[k+'5','Workout',l+' workout songs'],[k+'6','Throwback',l+' old hits']]};
const personal=()=>{const t=S.hist[0],ta=topArtists(),o=[['made','Made for You',t?t.artist+' songs':'top songs 2026']];
 if(t)o.push(['bcz','Because you listened to '+t.title,'songs like '+tkey(t)+' '+t.artist]);if(ta[0])o.push(['mf','More from '+ta[0],ta[0]+' songs']);
 ta.slice(0,2).forEach((a,i)=>o.push(['dm'+i,'Daily Mix '+(i+1),'dm:'+a]));return o};
const secs=()=>{if(S.hc!='all')return setFor(S.hc);const p=personal();return [p[0],['recent','Recent plays'],...p.slice(1),...setFor('all')]};
const secItems=id=>((S.sec[id]||{}).items||[]).filter(t=>!bad(t));
const rowH=id=>{const x=S.sec[id];if(!x||x.st=='load')return Array(8).fill('<span class="card sk"><span class="art"></span></span>').join('');
 if(x.st=='err')return `<button class="link" data-a="rs" data-id="${id}">Couldn’t load. Try again</button>`;
 const it=secItems(id);return it.length?it.map((t,k)=>card(t,k,'s:'+id)).join(''):'<p class="m">Nothing here right now.</p>'};
const home=()=>{const cu=cur()||S.hist[0],h=S.hist,pls=lib.pls.slice(0,2),
 tiles=[`<a class="qt" href="#/library" data-a="likedtab"><span class="art lk">${ic.hf}</span><span class="t">Liked songs</span></a>`,...pls.map(p=>`<a class="qt" href="#/pl/${p.id}">${mosaic(p)}<span class="t">${esc(p.name)}</span></a>`),...h.slice(0,5-pls.length).map((t,k)=>`<button class="qt" data-a="play" data-s="h" data-k="${k}">${art(t)}<span class="t">${esc(t.title)}</span></button>`)].slice(0,6);
 return `<header class="hh"><h1 class="wm" aria-label="Aurix"><span class="rv" aria-hidden="true">V</span><span aria-hidden="true">urix</span></h1><p class="m">${greet()}</p></header>`+
 (cu?`<section class="hero">${art(cu,1)}<div><h2>${esc(cu.title)}</h2><a class="m ln" href="#/ar/${encodeURIComponent(cu.artist)}">${esc(cu.artist)}</a><button class="btn solid" data-a="herop">${S.play&&cur()?'Pause':'Play'}</button></div></section>`:'')+
 `<div class="chips hc">${CHIPS.map(([k,l])=>`<button class="chip" data-a="hchip" data-k="${k}" aria-pressed="${S.hc==k}">${l}</button>`).join('')}</div><div class="qg">${tiles.join('')}</div>`+
 secs().map(([id,t,q])=>id=='recent'?(h.length?`<section class="sec hs"><h2>${t}</h2><div class="hrow">${h.map((x,k)=>card(x,k,'h')).join('')}</div></section>`:''):`<section class="sec hs" data-sec="${id}" data-q="${esc(q)}"><h2>${esc(t)}</h2><div class="hrow">${rowH(id)}</div></section>`).join('')};
async function loadSec(id,q){S.sq[id]=q;const k='aurix.sec3.'+q,c=ld(k);if(c&&Date.now()-c.t<216e5){S.sec[id]={st:'ok',items:c.items};return paint()}
 S.sec[id]={st:'load'};paint();
 try{const items=q.startsWith('dm:')?await mix({seed:{id:'dm',title:'',artist:q.slice(3),d:0},taste:topArtists(),avoid:new Set(),avk:new Set(),bad,limit:15}):await search(q);
  if(S.sq[id]!==q)return;S.sec[id]={st:'ok',items};if(items.length)sv(k,{t:Date.now(),items:items.slice(0,20)})}catch{if(S.sq[id]!==q)return;S.sec[id]={st:'err'}}paint()}
const paint=()=>{if(S.route=='home')stage()};
const vis=new Set(),seen=new WeakSet(),chk=e=>{const id=e.dataset.sec,q=e.dataset.q;if(!S.sec[id]||S.sec[id].st=='err'||S.sq[id]!==q)loadSec(id,q)};
const io=typeof IntersectionObserver=='undefined'?null:new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){vis.add(e.target);chk(e.target)}else vis.delete(e.target)}),{rootMargin:'300px'});
function watch(){if(!io)return;document.querySelectorAll('[data-sec][data-q]').forEach(e=>{if(!seen.has(e)){seen.add(e);io.observe(e)}});vis.forEach(e=>e.isConnected?chk(e):vis.delete(e))}
// Search
const CATS=['Bollywood hits','Punjabi hits','Hip-hop','Pop','Romance','Lofi','Party','Workout'];
const shown=()=>S.all?S.items:S.items.filter(t=>!bad(t));
function results(){const q=S.q.trim();
 if(S.st=='idle')return (S.rs.length?`<div class="rsh"><h2 class="h2">Recent searches</h2><button class="link" data-a="rsclr">Clear</button></div><div class="chips rs">${S.rs.map(x=>`<button class="chip" data-a="rsq" data-q="${esc(x)}">${esc(x)}</button>`).join('')}</div>`:'')+`<h2 class="h2">Browse all</h2><div class="cats">${CATS.map((c,i)=>`<button class="cat c${i%3}" data-a="rsq" data-q="${c}">${c}</button>`).join('')}</div>`;
 if(S.st=='load')return '<p class="hint">Searching…</p>';
 if(S.st=='err')return empty('Couldn’t load results.','The music servers did not respond. Check your connection and try again.'+(diag.length?`</p><p class="hint">${esc(diag.slice(0,3).join(' / '))}`:''),'<button class="btn solid" data-a="retry">Try again</button>');
 if(!S.items.length)return empty(`No songs found for “${esc(q)}”.`,'Check the spelling or try the artist name.');
 const hid=S.items.filter(bad).length,ok=shown(),top=ok[0];
 return (hid?`<p class="hint">${S.all?'Showing everything.':hid+' hidden by your filters.'} <button class="link" data-a="all">${S.all?'Hide filtered results':'Show them'}</button></p>`:'')+
 (top?`<h2 class="h2">Top result</h2><button class="top" data-a="play" data-s="r" data-k="0">${art(top)}<span class="txt"><span class="tt">${esc(top.title)}</span><span class="m">${esc(top.artist)}</span></span><span class="pb">${ic.p}</span></button>`:'')+
 (S.arts.length?`<h2 class="h2">Artists</h2><div class="hrow">${S.arts.map(a=>`<a class="card" href="#/ar/${encodeURIComponent(a.name)}">${art({art:a.art,title:a.name})}<span class="t">${esc(a.name)}</span><span class="m">Artist</span></a>`).join('')}</div>`:'')+
 (ok.length>1?`<h2 class="h2">Songs</h2>`+list(ok.slice(1),'r',S.all,1):'')}
const search_=()=>`<h1 class="sr">Search</h1><div class="sb"><label class="sf"><span class="sr">Search songs and artists</span><input id="q" type="search" placeholder="What do you want to play?" value="${esc(S.q)}" autocomplete="off" enterkeyhint="search"></label><div class="chips">${Object.keys(FL).map(k=>`<button class="chip" data-a="f" data-k="${k}" aria-pressed="${!!S.f[k]}">${FL[k]}</button>`).join('')}</div></div><div id="res">${results()}</div>`;
let tk=0,tm;
async function run(){const q=S.q.trim(),n=++tk;S.arts=[];if(!q){S.st='idle';return stage()}S.st='load';stage();
 searchArtists(q).then(a=>{if(n==tk){S.arts=a;stage()}}).catch(()=>{});
 try{const items=await search(q);if(n!=tk)return;S.items=items;S.st='ok';if(items.length){S.rs=[q,...S.rs.filter(x=>x.toLowerCase()!=q.toLowerCase())].slice(0,8);sv('aurix.rs',S.rs)}}catch{if(n!=tk)return;S.st='err'}stage()}
// Library, playlist, artist
const libV=()=>{const q=S.lq.trim().toLowerCase(),tabs=`<div class="seg" role="group" aria-label="Library view">${['liked','pls'].map(k=>`<button data-a="lt" data-k="${k}" aria-pressed="${S.lt==k}">${k=='liked'?'Liked songs':'Playlists'}</button>`).join('')}</div>`;let b;
 if(S.lt=='liked'){const l=lib.liked.filter(t=>!q||(t.title+' '+t.artist).toLowerCase().includes(q));b=l.length?`<div class="acts"><button class="btn solid" data-a="playall" data-s="l">Play</button><button class="btn" data-a="shuf" data-s="l">Shuffle</button></div>`+list(l,'l'):empty(q?'Nothing matches.':'No liked songs yet.',q?'Try a different word.':'Tap the heart in the player, or the menu on any song, to save it here.',q?'':'<a class="btn solid" href="#/search">Find songs</a>')}
 else{let ps=lib.pls.filter(p=>!q||p.name.toLowerCase().includes(q));if(S.ls=='az')ps=[...ps].sort((a,c)=>a.name.localeCompare(c.name));
  b=`<div class="np"><input id="npn" placeholder="New playlist name" autocomplete="off"><button class="btn solid" data-a="newpl2">Create</button></div><div class="chips">${[['recent','Recent'],['az','A to Z']].map(([k,l])=>`<button class="chip" data-a="ls" data-k="${k}" aria-pressed="${S.ls==k}">${l}</button>`).join('')}</div><div class="grid pg">${q?'':`<button class="card" data-a="lt" data-k="liked"><span class="art lk">${ic.hf}</span><span class="t">Liked songs</span><span class="m">${lib.liked.length} songs</span></button>`}${ps.map(p=>`<a class="card" href="#/pl/${p.id}">${mosaic(p)}<span class="t">${esc(p.name)}</span><span class="m">${p.tracks.length} songs</span></a>`).join('')}</div>`}
 return `<h1 class="pt">Library</h1>${tabs}<label class="sf sf2"><span class="sr">Search in library</span><input id="lq" type="search" placeholder="Search in library" value="${esc(S.lq)}" autocomplete="off"></label>${b}<div class="acts bk"><button class="btn" data-a="exp">Export backup</button><label class="btn">Import backup<input type="file" id="imp" accept="application/json" hidden></label></div>`};
const plV=()=>{const p=lib.pl(S.pid);if(!p)return empty('Playlist not found.','It may have been deleted.','<a class="btn solid" href="#/library">Back to library</a>');
 const mins=Math.round(p.tracks.reduce((s,t)=>s+(t.d||0),0)/60),rc=S.rec[p.id]||{};
 return `<h1 class="pt">${esc(p.name)}</h1><p class="m pm">${p.tracks.length} songs, ${mins} min</p><div class="acts"><button class="btn solid" data-a="playall" data-s="p:${p.id}">Play</button><button class="btn" data-a="shuf" data-s="p:${p.id}">Shuffle</button><button class="btn" data-a="ren">Rename</button><button class="btn" data-a="delpl">Delete</button></div>`+(p.tracks.length?list(p.tracks,'p:'+p.id):empty('This playlist is empty.','Add songs from the menu next to any song.'))+
 (p.tracks.length?`<div class="rsh"><h2 class="h2">Recommended songs</h2><button class="link" data-a="recr">Refresh</button></div>`+(rc.st=='load'?'<p class="hint">Finding songs…</p>':rc.items&&rc.items.length?list(rc.items,'rc:'+p.id):'<p class="hint">No suggestions right now.</p>'):'')};
async function loadRec(pid,force){const p=lib.pl(pid);if(!p||!p.tracks.length||(S.rec[pid]&&!force))return;S.rec[pid]={st:'load'};if(S.route=='pl')stage();
 try{const seed=p.tracks[Math.floor(Math.random()*p.tracks.length)];S.rec[pid]={st:'ok',items:await mix({seed,anchor:seed,ctx:'',taste:topArtists(),avoid:new Set(p.tracks.map(t=>t.id)),avk:new Set(p.tracks.map(tkey)),bad,limit:8})}}catch{S.rec[pid]={st:'ok',items:[]}}if(S.route=='pl')stage()}
const arV=()=>{const n=S.an,a=S.ar[n]||{st:'load'},e=esc(n);
 return `<h1 class="pt">${e}</h1>`+(a.st=='load'?'<p class="hint">Loading…</p>':a.st=='err'?empty('Couldn’t load this artist.','Try again in a moment.','<button class="btn solid" data-a="arr">Try again</button>'):`<div class="acts"><button class="btn solid" data-a="playall" data-s="a:${e}">Play</button><button class="btn" data-a="shuf" data-s="a:${e}">Shuffle</button></div><h2 class="h2">Popular</h2>${list(a.pop,'a:'+n)}${a.more.length?`<h2 class="h2">Fans also like</h2><div class="hrow">${a.more.map((t,k)=>card(t,k,'am:'+n)).join('')}</div>`:''}`)};
async function loadAr(n,force){if(S.ar[n]&&!force)return;S.ar[n]={st:'load'};if(S.route=='ar')stage();
 try{const items=(await search(n+' songs')).filter(t=>!bad(t)),k=ak(n),mine=items.filter(t=>ak(t.artist).includes(k)||(ak(t.artist)&&k.includes(ak(t.artist)))),seen=new Set(),pop=(mine.length>2?mine:items).filter(t=>{const x=tkey(t);return !seen.has(x)&&seen.add(x)}).slice(0,10);
  const more=(await mix({seed:{id:'ar',title:'',artist:n,d:0},taste:topArtists(),avoid:new Set(pop.map(t=>t.id)),avk:new Set(pop.map(tkey)),bad,limit:14}).catch(()=>[])).filter(t=>ak(t.artist)!=k);
  S.ar[n]={st:'ok',pop,more}}catch{S.ar[n]={st:'err'}}if(S.route=='ar')stage()}
// Queue and player views
const fnote=()=>S.fill=='load'&&S.queue.length-1-S.i<3?'<p class="g">Finding songs you may like…</p>':'';
const autoB=()=>`<button class="chip" data-a="auto" aria-pressed="${!!S.auto}">Autoplay</button>`;
const queue=()=>`<div class="qh"><h2>Up next</h2><div>${autoB()}<button class="link ql" data-a="qclr">Clear</button><button class="ib" data-a="q" aria-label="Close queue">${ic.x}</button></div></div><div class="qs">${cur()?`<p class="g">Now playing</p><div class="sm">${list([cur()],'q',0,S.i)}</div><p class="g">Next</p><div class="sm">${list(S.queue.slice(S.i+1),'q',0,S.i+1)}</div>${fnote()}`:'<p class="g">Nothing queued yet.</p>'}</div>`;
const pp=()=>`<button class="ib pp" data-a="pp" aria-label="${S.play?'Pause':'Play'}"${cur()?'':' disabled'}>${S.play?ic.z:ic.p}</button>`;
const ctl=()=>`<button class="ib tg${S.shuf?' on':''}" data-a="shufb" aria-pressed="${S.shuf}" aria-label="Shuffle">${ic.sh}</button><button class="ib" data-a="prev" aria-label="Previous"${cur()?'':' disabled'}>${ic.b}</button>${pp()}<button class="ib" data-a="next" aria-label="Next"${cur()?'':' disabled'}>${ic.n}</button><button class="ib tg${S.rep!='off'?' on':''}" data-a="repb" aria-label="Repeat ${S.rep}">${S.rep=='one'?ic.r1:ic.rp}</button>`;
const scrub=()=>`<div class="sc"><span data-cur>0:00</span><div class="bar" role="slider" tabindex="0" aria-label="Seek" aria-valuemin="0"><i></i></div><span data-dur>0:00</span></div>`;
const artistLn=t=>`<a class="m ln" href="#/ar/${encodeURIComponent(t.artist)}">${esc(S.msg||t.artist)}</a>`;
const player=()=>{const t=cur()||{title:'Nothing playing',artist:'Search for a song'},txt=`<span class="txt"><span class="t">${esc(t.title)}</span><span class="m">${esc(S.msg||t.artist)}</span></span>`;
 return `<div class="mini"><i class="pf"></i><button class="mo" data-a="sheet">${art(t)}${txt}</button>${pp()}</div><div class="full"><div class="now">${art(t)}${txt}</div><div class="ctr"><div class="tp">${ctl()}</div>${scrub()}</div><div class="rt">${heart()}<input class="vol" id="vol" type="range" min="0" max="100" value="${S.vol}" aria-label="Volume"><button class="ib" data-a="q" aria-label="Toggle queue">${ic.l}</button></div></div>`};
const sheet=()=>{const t=cur(),x=`<button class="ib" data-a="sheet" aria-label="Close player">${ic.d}</button>`;
 return t?`<div class="sh">${x}${art(t,1)}<div class="tl"><div><h2>${esc(t.title)}</h2>${artistLn(t)}</div>${heart()}</div>${scrub()}<div class="tp">${ctl()}</div><div class="sm"><p class="g">Up next</p><div class="acts">${autoB()}</div>${list(S.queue.slice(S.i+1),'q',0,S.i+1)}${fnote()}</div></div>`:`<div class="sh">${x}</div>`};
let dg=null;
function tick(){const t=cur(),d=S.dur||(t&&t.d)||0,p=d?Math.min(100,S.pos/d*100):0;
 document.querySelectorAll('.bar i,.pf').forEach(e=>e.style.width=p+'%');
 document.querySelectorAll('[data-cur]').forEach(e=>e.textContent=fmt(S.pos));document.querySelectorAll('[data-dur]').forEach(e=>e.textContent=fmt(d));
 document.querySelectorAll('.bar').forEach(e=>{e.setAttribute('aria-valuemax',Math.round(d));e.setAttribute('aria-valuenow',Math.round(S.pos))});
 if('mediaSession' in navigator&&d&&S.ready)try{navigator.mediaSession.setPositionState({duration:d,position:Math.min(S.pos,d),playbackRate:1})}catch{}}
// Rendering: the stage and chrome are patched, never rebuilt, so scroll, focus and images survive.
const view=()=>S.route=='search'?search_():S.route=='library'?libV():S.route=='pl'?plV():S.route=='ar'?arV():home();
function stage(hard){const e=$('#stage'),h=view();hard?(e.innerHTML=h):patch(e,h);watch()}
let sqt;const saveQ2=()=>{if(S.i>=0)sv('aurix.q',{q:S.queue.slice(0,100).map(slim),i:S.i,pos:Math.floor(S.pos),seed:S.seed&&slim(S.seed),ctx:S.ctx})};
function chrome(){patch($('#queue'),queue());patch($('#player'),player());patch($('#sheet'),sheet());const A=$('#app');A.classList.toggle('queue-open',S.open);A.classList.toggle('sheet-open',S.sheet);tick();clearTimeout(sqt);sqt=setTimeout(saveQ2,800)}
const refresh=()=>{stage();chrome()};
function nav(){const r=location.hash.slice(2);S.pid='';
 if(r.startsWith('pl/')){S.route='pl';S.pid=r.slice(3)}else if(r.startsWith('ar/')){S.route='ar';S.an=decodeURIComponent(r.slice(3))}else S.route=r=='search'||r=='library'?r:'home';
 S.sheet=false;S.menu=null;rmenu();const rr=S.route=='pl'?'library':S.route=='ar'?'search':S.route;
 document.querySelectorAll('[data-r]').forEach(a=>a.dataset.r==rr?a.setAttribute('aria-current','page'):a.removeAttribute('aria-current'));
 stage(true);chrome();$('#stage').scrollTo(0,0);if(S.route=='pl')loadRec(S.pid);if(S.route=='ar')loadAr(S.an)}
// Queue, autoplay mix, library actions
const getList=s=>s=='r'?shown():s=='h'?S.hist:s=='q'?S.queue:s=='l'?lib.liked:s.startsWith('rc:')?((S.rec[s.slice(3)]||{}).items||[]):s.startsWith('am:')?((S.ar[s.slice(3)]||{}).more||[]):s.startsWith('a:')?((S.ar[s.slice(2)]||{}).pop||[]):s[0]=='p'?(lib.pl(s.slice(2))||{tracks:[]}).tracks:secItems(s.slice(2));
function start(L,k,ctx){let q=[...L];if(S.shuf&&q.length>1){const f=q[k];q=[f,...shuffle(q.filter((_,i)=>i!=k))];k=0}S.queue=q;S.ctx=ctx||'';S.seed=q[k];S.resume=0;load(k)}
let fp=null;
function fill(){if(!S.auto)return Promise.resolve();if(fp)return fp;
 fp=(async()=>{const t=S.queue[S.queue.length-1];if(!t)return;S.fill='load';chrome();
  try{const avoid=new Set([...S.queue,...S.hist].map(x=>x.id)),avk=new Set([...S.queue,...S.hist.slice(0,20)].map(tkey));
   S.queue.push(...await mix({seed:t,anchor:S.seed,ctx:S.ctx,taste:topArtists(),avoid,avk,bad}))}catch{}})().finally(()=>{fp=null;S.fill='';chrome()});return fp}
let tt;const toast=m=>{const e=$('#toast');e.textContent=m;e.classList.add('show');clearTimeout(tt);tt=setTimeout(()=>e.classList.remove('show'),1800)};
const menuH=()=>{const m=S.menu,t=m.t,head=`<div class="mh">${art(t)}<span class="txt"><span class="t">${esc(t.title)}</span><span class="m">${esc(t.artist)}</span></span><button class="ib" data-a="mx" aria-label="Close">${ic.x}</button></div>`;
 if(m.v=='pl')return head+`<div class="ml"><div class="np"><input id="npn" placeholder="New playlist name" autocomplete="off"><button class="btn solid" data-a="newpl">Create</button></div>${lib.pls.map(p=>`<button class="mi" data-a="addpl" data-id="${p.id}">${esc(p.name)}<span class="m">${p.tracks.length}</span></button>`).join('')}</div>`;
 return head+`<div class="ml"><button class="mi" data-a="like">${lib.isLiked(t.id)?'Remove from liked songs':'Add to liked songs'}</button><button class="mi" data-a="mpl">Add to playlist</button><button class="mi" data-a="pnext">Play next</button>${m.s=='q'?'':'<button class="mi" data-a="qadd">Add to queue</button>'}<button class="mi" data-a="goar">Go to artist</button>${m.s&&m.s[0]=='p'?'<button class="mi" data-a="rmpl">Remove from this playlist</button>':''}${m.s=='q'&&m.k!=S.i?'<button class="mi" data-a="rmq">Remove from queue</button>':''}</div>`};
const rmenu=()=>{const e=$('#menu');e.innerHTML=S.menu?`<div class="mb" data-a="mx"></div><div class="mp" role="dialog" aria-label="Song options">${menuH()}</div>`:'';e.classList.toggle('open',!!S.menu)};
const refreshLib=()=>{if(S.route=='library'||S.route=='pl'||S.route=='home')stage()};
const closeM=()=>{S.menu=null;rmenu()};
function act(a,b){const m=S.menu,t=m&&m.t;
 if(!t&&['like','mpl','addpl','newpl','pnext','qadd','rmpl','goar','rmq'].includes(a))return 1;
 switch(a){
 case 'menu':{const x=getList(b.dataset.s)[+b.dataset.k];if(x){S.menu={t:x,s:b.dataset.s,k:+b.dataset.k,v:'main'};rmenu()}return 1}
 case 'mx':closeM();return 1;
 case 'like':{const on=lib.like(t);closeM();toast(on?'Added to liked songs':'Removed from liked songs');refreshLib();chrome();return 1}
 case 'likecur':{if(!cur())return 1;const on=lib.like(cur());toast(on?'Added to liked songs':'Removed from liked songs');chrome();refreshLib();return 1}
 case 'mpl':m.v='pl';rmenu();return 1;
 case 'addpl':{const p=lib.pl(b.dataset.id),ok=lib.addTo(p.id,t);closeM();toast(ok?'Added to '+p.name:'Already in '+p.name);refreshLib();return 1}
 case 'newpl':{const p=lib.newPl($('#npn').value);lib.addTo(p.id,t);closeM();toast('Added to '+p.name);refreshLib();return 1}
 case 'pnext':if(m.s=='q'&&m.k>S.i)S.queue.splice(m.k,1);S.queue.splice(S.i+1,0,{...t,u:1});closeM();toast('Playing next');chrome();return 1;
 case 'qadd':S.queue.push({...t,u:1});closeM();toast('Added to queue');chrome();return 1;
 case 'rmq':S.queue.splice(m.k,1);closeM();chrome();return 1;
 case 'rmpl':lib.removeFrom(m.s.slice(2),t.id);closeM();stage();return 1;
 case 'goar':closeM();location.hash='#/ar/'+encodeURIComponent(t.artist);return 1;
 case 'qclr':S.queue=S.queue.slice(0,S.i+1);chrome();return 1;
 case 'lt':S.lt=b.dataset.k;S.lq='';stage(true);return 1;
 case 'likedtab':S.lt='liked';return 1;
 case 'ls':S.ls=b.dataset.k;stage();return 1;
 case 'hchip':S.hc=b.dataset.k;sv('aurix.hc',S.hc);stage();return 1;
 case 'herop':if(cur())toggle();else if(S.hist.length)start(S.hist,0,'');return 1;
 case 'playall':case 'shuf':{const Ls=[...getList(b.dataset.s)];if(!Ls.length)return 1;if(a=='shuf')shuffle(Ls);start(Ls,0,'');return 1}
 case 'newpl2':{const i=$('#npn');if(!i.value.trim()){i.focus();return 1}lib.newPl(i.value);stage();return 1}
 case 'ren':{const p=lib.pl(S.pid),n=prompt('Rename playlist',p.name);if(n){lib.rename(p.id,n);stage()}return 1}
 case 'delpl':if(confirm('Delete this playlist?')){lib.delPl(S.pid);location.hash='#/library'}return 1;
 case 'recr':loadRec(S.pid,true);return 1;
 case 'addrec':{const s=b.dataset.s,pid=s.slice(3),x=getList(s)[+b.dataset.k];if(x){lib.addTo(pid,x);S.rec[pid].items=S.rec[pid].items.filter(y=>y.id!=x.id);toast('Added to playlist');stage()}return 1}
 case 'arr':loadAr(S.an,true);return 1;
 case 'rsq':S.q=b.dataset.q;$('#q').value=S.q;run();return 1;
 case 'rsclr':S.rs=[];sv('aurix.rs',[]);stage();return 1;
 case 'shufb':S.shuf=!S.shuf;if(S.shuf&&S.i>=0){const t2=shuffle(S.queue.slice(S.i+1));S.queue=[...S.queue.slice(0,S.i+1),...t2]}chrome();return 1;
 case 'repb':S.rep=S.rep=='off'?'all':S.rep=='all'?'one':'off';chrome();return 1;
 case 'exp':{const u=URL.createObjectURL(new Blob([lib.export()],{type:'application/json'})),x=document.createElement('a');x.href=u;x.download='aurix-backup.json';x.click();setTimeout(()=>URL.revokeObjectURL(u),1e3);return 1}
 case 'auto':S.auto=!S.auto;sv('aurix.auto',S.auto);chrome();if(S.auto)fill();return 1}
 return 0}
document.body.insertAdjacentHTML('beforeend','<div class="menu" id="menu"></div><div class="toast" id="toast" role="status"></div>');
// Playback
function meta(t){if(!('mediaSession' in navigator))return;navigator.mediaSession.metadata=new MediaMetadata({title:t.title,artist:t.artist,artwork:t.art?[{src:big(t.art)}]:[]})}
const tryUrl=u=>new Promise(res=>{let d=0;const fin=v=>{if(d)return;d=1;clearTimeout(tm);au.removeEventListener('loadedmetadata',ok);au.removeEventListener('error',er);res(v)},
 ok=()=>fin(true),er=()=>fin('Audio error '+(au.error?au.error.code:'?')),tm=setTimeout(()=>fin('Audio timeout'),9000);
 au.addEventListener('loadedmetadata',ok);au.addEventListener('error',er);au.src=u;au.load()});
// Public Piped instances are mostly blocked by YouTube for /streams, so we fall back to the YouTube player.
let yt=null,ytP=null,poll=0,lt=0;
const P={play:()=>S.m=='yt'?yt.playVideo():au.play(),pause:()=>S.m=='yt'?yt.pauseVideo():au.pause(),paused:()=>S.m=='yt'?yt.getPlayerState()!=1:au.paused,seek:x=>S.m=='yt'?yt.seekTo(x,true):(au.currentTime=x),time:()=>S.m=='yt'?yt.getCurrentTime():au.currentTime};
const setVol=()=>{au.volume=S.vol/100;au.muted=S.mute;if(yt&&yt.setVolume){yt.setVolume(S.vol);S.mute?yt.mute():yt.unMute()}};
const resumeSeek=()=>{if(S.resume>1)P.seek(S.resume);S.resume=0};
const logPlay=t=>{if(S.lg==t.id)return;S.lg=t.id;S.hist=[t,...S.hist.filter(x=>x.id!==t.id)].slice(0,12);sv('aurix.hist',S.hist);meta(t);stage()};
function ytLoad(){return ytP||(ytP=new Promise((ok,no)=>{const d=document.createElement('div');d.style.cssText='position:fixed;left:-400px;bottom:0;width:200px;height:200px;pointer-events:none';d.innerHTML='<div id="ytp"></div>';document.body.append(d);
 window.onYouTubeIframeAPIReady=()=>{yt=new YT.Player('ytp',{width:200,height:200,playerVars:{playsinline:1,controls:0,disablekb:1,rel:0,origin:location.origin},events:{onReady:()=>{setVol();ok()},onStateChange:ytState,onError:ytErr}})};
 const sc=document.createElement('script');sc.src='https://www.youtube.com/iframe_api';sc.onerror=()=>{ytP=null;no(new Error('YouTube player blocked'))};document.head.append(sc);setTimeout(()=>no(new Error('YouTube player timeout')),10000)}))}
function ytState(e){if(S.m!='yt')return;const x=e.data;clearInterval(poll);
 if(x==1){S.play=true;S.msg='';logPlay(cur());resumeSeek();poll=setInterval(()=>{if(dg)return;S.pos=yt.getCurrentTime();const d=yt.getDuration();if(d>0)S.dur=d;tick()},500);chrome();stage()}
 else if(x==2){S.play=false;chrome();stage()}else if(x==0)onEnd()}
function ytErr(){const t=cur();S.play=false;S.msg='Not playable here. Skipping.';chrome();setTimeout(()=>{if(cur()===t)step(1)},1200)}
async function viaPiped(t,tok){const skip=[];
 for(let n=0;n<2;n++){let x;try{x=await streams(t.id,skip)}catch{return false}
  if(tok!=lt)return false;skip.push(x.base);if(x.d>0)S.dur=x.d;
  for(const u of x.urls){if(tok!=lt)return false;const r=await tryUrl(u);if(tok!=lt)return false;
   if(r===true){S.m='au';S.ready=true;try{await au.play();resumeSeek()}catch(e){if(e.name!='NotAllowedError')return false;S.msg='Tap play to start.';S.play=false}logPlay(t);return true}}}
 return false}
async function load(k){const t=S.queue[k];if(!t)return;let tok=++lt;if(k!=S.i)S.resume=0;S.i=k;S.pos=S.resume||0;S.dur=t.d;S.play=true;S.ready=false;S.msg='';S.lg=0;refresh();if(S.queue.length-1-k<=3)fill();
 try{if(!S.noPiped){const ok=await Promise.race([viaPiped(t,tok),new Promise(r=>setTimeout(()=>r(false),5000))]);if(tok!=lt)return;if(ok){refresh();return}S.noPiped=1}
  tok=++lt;await ytLoad();if(tok!=lt)return;au.pause();S.m='yt';S.ready=true;setVol();yt.loadVideoById(t.id);meta(t)}
 catch(e){if(cur()!==t)return;S.play=false;S.ready=false;S.msg='No sound: '+e.message;refresh()}}
const toggle=()=>{if(!cur())return;if(!S.ready)return load(S.i);P.paused()?Promise.resolve(P.play()).catch(()=>{}):P.pause()};
const step=d=>{if(!cur())return;if(d<0&&S.pos>3&&S.ready){P.seek(0);return}const n=S.i+d;
 if(n>=0&&n<S.queue.length)load(n);
 else if(d>0){if(S.rep=='all'){load(0);return}if(S.auto)fill().then(()=>{if(S.i==n-1&&S.queue.length>n)load(n);else{if(S.ready)P.pause();S.play=false;chrome()}});else{if(S.ready)P.pause();S.pos=0;chrome()}}};
const onEnd=()=>{if(S.rep=='one'){P.seek(0);Promise.resolve(P.play()).catch(()=>{});return}step(1)};
au.addEventListener('timeupdate',()=>{if(S.m!='au'||dg)return;S.pos=au.currentTime;if(isFinite(au.duration))S.dur=au.duration;tick()});
au.addEventListener('ended',()=>{if(S.m=='au')onEnd()});
['play','pause'].forEach(e=>au.addEventListener(e,()=>{if(!S.ready||S.m!='au')return;S.play=!au.paused;chrome();stage()}));
if('mediaSession' in navigator){const m=(a,f)=>{try{navigator.mediaSession.setActionHandler(a,f)}catch{}};m('play',()=>P.play());m('pause',()=>P.pause());m('previoustrack',()=>step(-1));m('nexttrack',()=>step(1));m('seekto',e=>P.seek(e.seekTime))}
// Input: clicks, typing, keyboard, drag-seek and touch gestures
document.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b)return;const a=b.dataset.a;
 if(a=='play'){const s=b.dataset.s,k=+b.dataset.k;if(s=='q')return k==S.i?toggle():load(k);const Lst=getList(s),t=Lst[k];if(!t)return;if(cur()&&cur().id==t.id)return toggle();
  if(s=='r')start([t],0,'');else{const c=s[0]=='s'?S.sq[s.slice(2)]||'':'';start(Lst,k,c.startsWith('dm:')?c.slice(3)+' songs':c)}}
 else if(a=='pp')toggle();else if(a=='next')step(1);else if(a=='prev')step(-1);
 else if(a=='q'){S.open=!S.open;chrome()}else if(a=='sheet'){if(Date.now()-S.sw<400)return;S.sheet=!S.sheet;chrome()}
 else if(a=='all'){S.all=!S.all;stage()}else if(a=='retry')run();else if(act(a,b))return;else if(a=='rs')loadSec(b.dataset.id,b.closest('[data-sec]').dataset.q);
 else if(a=='f'){S.f[b.dataset.k]=!S.f[b.dataset.k];sv('aurix.f',S.f);stage()}});
document.addEventListener('input',e=>{const id=e.target.id;
 if(id=='q'){S.q=e.target.value;clearTimeout(tm);tm=setTimeout(run,350)}else if(id=='lq'){S.lq=e.target.value;stage()}
 else if(id=='vol'){S.vol=+e.target.value;S.mute=false;sv('aurix.vol',S.vol);setVol()}});
document.addEventListener('change',e=>{if(e.target.id!='imp')return;const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{lib.import(r.result);toast('Backup imported');stage()}catch(x){toast(x.message||'Could not import that file')}};r.readAsText(f)});
const seekBy=x=>{if(S.ready)P.seek(Math.max(0,P.time()+x))};
document.addEventListener('keydown',e=>{const g=e.target,typing=/^(INPUT|TEXTAREA)$/.test(g.tagName)&&g.type!='range';
 if(e.key=='Enter'&&g.id=='npn')return void act(S.menu?'newpl':'newpl2',g);
 if(e.key=='Escape'){if(S.menu)closeM();else if(S.sheet){S.sheet=false;chrome()}return}
 if(typing||e.metaKey||e.ctrlKey||e.altKey)return;
 if(e.key==' '&&!/^(BUTTON|A)$/.test(g.tagName)){e.preventDefault();toggle()}
 else if(e.key=='ArrowRight'){e.shiftKey?step(1):seekBy(5)}else if(e.key=='ArrowLeft'){e.shiftKey?step(-1):seekBy(-5)}
 else if(e.key=='m'){S.mute=!S.mute;setVol()}else if(e.key=='l')act('likecur');else if(e.key=='s')act('shufb');else if(e.key=='r')act('repb');
 else if(e.key=='/'){e.preventDefault();if(S.route!='search')location.hash='#/search';setTimeout(()=>{const i=$('#q');i&&i.focus()},50)}});
const bpos=e=>{const r=dg.getBoundingClientRect();S.pos=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width))*(S.dur||0);tick()};
document.addEventListener('pointerdown',e=>{const b=e.target.closest&&e.target.closest('.bar');if(!b||!S.ready)return;dg=b;try{b.setPointerCapture(e.pointerId)}catch{}bpos(e)});
document.addEventListener('pointermove',e=>{if(dg)bpos(e)});
document.addEventListener('pointerup',()=>{if(dg){dg=null;P.seek(S.pos)}});
let tx=0,ty=0,tg='';
document.addEventListener('touchstart',e=>{const t=e.touches[0];tx=t.clientX;ty=t.clientY;tg=e.target.closest('.mo')?'mo':(e.target.closest('.sheet')&&$('#sheet').scrollTop<=0)?'sh':''},{passive:true});
document.addEventListener('touchmove',e=>{if(tg!='sh')return;const dy=e.touches[0].clientY-ty,s=$('#sheet');if(dy>0&&dy>Math.abs(e.touches[0].clientX-tx)){s.style.transition='none';s.style.transform=`translateY(${dy}px)`}},{passive:true});
document.addEventListener('touchend',e=>{const t=e.changedTouches[0],dx=t.clientX-tx,dy=t.clientY-ty;
 if(tg=='mo'&&Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)){S.sw=Date.now();step(dx<0?1:-1)}
 if(tg=='sh'){const s=$('#sheet');s.style.transition='';s.style.transform='';if(dy>110&&dy>Math.abs(dx)){S.sheet=false;chrome()}}tg=''},{passive:true});
addEventListener('pagehide',saveQ2);addEventListener('hashchange',nav);
au.volume=S.vol/100;nav();
