import {TRACKS} from './data.js';
const $=s=>document.querySelector(s),by=Object.fromEntries(TRACKS.map(t=>[t.id,t]));
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=s=>Math.floor(s/60)+':'+String(s%60).padStart(2,'0');
const S={route:'home',q:'',all:false,pos:0,play:false,i:0,open:innerWidth>=1280,f:{remix:1,live:1,cover:1,podcast:1,slowed:1},queue:[1,2,4,5,7,8,9,11,12]};
const FL={remix:'Hide remixes',live:'Hide live versions',cover:'Hide covers',podcast:'Hide podcasts',slowed:'Hide slowed and sped up'};
const KL={remix:'Remix',live:'Live',cover:'Cover',podcast:'Podcast',slowed:'Slowed'};
const sv=(d,x)=>`<svg viewBox="0 0 24 24"${x||''}>${d}</svg>`,L=' fill="none" stroke="currentColor" stroke-width="1.75"';
const ic={p:sv('<path d="M7 4.5v15L19 12z" fill="currentColor"/>'),z:sv('<path d="M6 5h4v14H6zM14 5h4v14h-4z" fill="currentColor"/>'),
n:sv('<path d="M6 5v14l10-7zM17 5h2v14h-2z" fill="currentColor"/>'),b:sv('<path d="M18 5v14L8 12zM5 5h2v14H5z" fill="currentColor"/>'),
l:sv('<path d="M4 6h16M4 12h16M4 18h9"/>',L),x:sv('<path d="M5 5l14 14M19 5L5 19"/>',L)};
// Cover art: generated from the album name. Real thumbnails replace this in phase 2.
const H=s=>[...s].reduce((h,c)=>Math.imul(h^c.charCodeAt(0),16777619)>>>0,2166136261);
const R=a=>()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t^=t+Math.imul(t^t>>>7,61|t);return((t^t>>>14)>>>0)/4294967296};
const P='var(--paper)',K='var(--ink)',G='var(--stone)';
function art(t,alt){const r=R(H(t.album)),[bg,fg,ac]=[[P,K,G],[G,K,P],[K,P,G]][Math.floor(r()*3)],k=Math.floor(r()*3);let s='';
 if(k==0)for(let y=0;y<100;){const h=4+r()*16;if(r()>.3)s+=`<rect y="${y}" width="${40+r()*60}" height="${h}" fill="${r()>.7?ac:fg}"/>`;y+=h+2+r()*7}
 else if(k==1)s=`<rect x="${10+r()*20}" y="${10+r()*20}" width="${45+r()*30}" height="${45+r()*30}" fill="${fg}"/><rect y="${50+r()*40}" width="100" height="2" fill="${ac}"/>`;
 else for(let i=0;i<7;i++){const h=15+r()*75;s+=`<rect x="${i*14.3+2}" y="${100-h}" width="10" height="${h}" fill="${r()>.6?ac:fg}"/>`}
 return `<span class="art"${alt?` role="img" aria-label="Cover of ${esc(t.album)}"`:' aria-hidden="true"'}><svg viewBox="0 0 100 100" preserveAspectRatio="none" shape-rendering="crispEdges"><rect width="100" height="100" fill="${bg}"/>${s}</svg></span>`}
const cur=()=>by[S.queue[S.i]];
const row=(t,n,tag)=>{const c=cur().id===t.id;return `<li><button class="tr" data-a="play" data-id="${t.id}"${c?' aria-current="true"':''}><span class="n">${c?'':n}</span>${art(t)}<span><span class="t">${esc(t.title)}</span><span class="m">${esc(t.artist)}</span></span><span class="d">${tag&&KL[t.kind]?KL[t.kind]+', ':''}${fmt(t.d)}</span></button></li>`};
const list=(ids,tag)=>`<ol class="ls">${ids.map((id,i)=>row(by[id],i+1,tag)).join('')}</ol>`;
const home=()=>{const f=by[1];return `<h1 class="sr">Home</h1><section class="hero">${art(f,1)}<div><h2>${esc(f.title)}</h2><p>${esc(f.artist)}</p><button class="btn solid" data-a="play" data-id="1">${S.play&&cur().id==1?'Pause':'Play'}</button></div></section>
<section class="sec"><h2>Recently played</h2><div class="grid">${[5,3,7,2,10,6].map(id=>{const t=by[id];return `<button class="card" data-a="play" data-id="${id}">${art(t)}<span class="t">${esc(t.title)}</span><span class="m">${esc(t.artist)}</span></button>`}).join('')}</div></section>
<section class="sec"><h2>More like ${esc(f.title)}</h2>${list([2,4,8,9,11,12])}</section>`};
function results(){const q=S.q.trim();
 if(!q)return `<div class="empty"><h2>Find a song.</h2><p>Search by song or artist. Podcasts, remixes and live versions stay out unless you turn the filters off.</p></div>`;
 const m=TRACKS.filter(t=>(t.title+' '+t.artist+' '+t.album).toLowerCase().includes(q.toLowerCase()));
 if(!m.length)return `<div class="empty"><h2>No songs found for “${esc(q)}”.</h2><p>Check the spelling or try the artist name.</p></div>`;
 const hid=m.filter(t=>S.f[t.kind]),ok=S.all?m:m.filter(t=>!S.f[t.kind]);
 return (hid.length?`<p class="hint">${S.all?'Showing everything.':hid.length+' hidden by your filters.'} <button class="link" data-a="all">${S.all?'Hide filtered results':'Show them'}</button></p>`:'')+(ok.length?list(ok.map(t=>t.id),S.all):'')}
const search=()=>`<h1 class="sr">Search</h1><label class="sf"><span class="sr">Search songs and artists</span><input id="q" type="search" placeholder="Search songs and artists" value="${esc(S.q)}" autocomplete="off"></label><div class="chips">${Object.keys(FL).map(k=>`<button class="chip" data-a="f" data-k="${k}" aria-pressed="${!!S.f[k]}">${FL[k]}</button>`).join('')}</div><div id="res">${results()}</div>`;
const lib=()=>`<h1 class="pt">Library</h1><div class="empty"><h2>Nothing saved yet.</h2><p>Songs you save and playlists you make will appear here.</p><a class="btn solid" href="#/search">Find songs</a></div>`;
const queue=()=>`<div class="qh"><h2>Up next</h2><button class="ib" data-a="q" aria-label="Close queue">${ic.x}</button></div><div class="qs"><p class="g">Now playing</p><div class="sm">${list([S.queue[S.i]])}</div><p class="g">Next</p><div class="sm">${list(S.queue.slice(S.i+1))}</div></div>`;
const player=()=>{const t=cur(),txt=`<span class="txt"><span class="t">${esc(t.title)}</span><span class="m">${esc(t.artist)}</span></span>`,pp=`<button class="ib pp" data-a="pp" aria-label="${S.play?'Pause':'Play'}">${S.play?ic.z:ic.p}</button>`;
 return `<div class="mini"><i class="pf"></i>${art(t)}${txt}${pp}</div><div class="full"><div class="now">${art(t)}${txt}</div><div class="ctr"><div class="tp"><button class="ib" data-a="prev" aria-label="Previous">${ic.b}</button>${pp}<button class="ib" data-a="next" aria-label="Next">${ic.n}</button></div><div class="sc"><span data-cur>0:00</span><div class="bar" role="slider" tabindex="0" aria-label="Seek" aria-valuemin="0" data-a="seek"><i></i></div><span>${fmt(t.d)}</span></div></div><div class="rt"><button class="ib" data-a="q" aria-label="Toggle queue">${ic.l}</button></div></div>`};
function tick(){const t=cur(),p=S.pos/t.d*100;document.querySelectorAll('.bar i,.pf').forEach(e=>e.style.width=p+'%');document.querySelectorAll('[data-cur]').forEach(e=>e.textContent=fmt(S.pos));document.querySelectorAll('.bar').forEach(e=>{e.setAttribute('aria-valuemax',t.d);e.setAttribute('aria-valuenow',S.pos)})}
const stage=()=>$('#stage').innerHTML=S.route=='search'?search():S.route=='library'?lib():home();
function chrome(){$('#queue').innerHTML=queue();$('#player').innerHTML=player();$('#app').classList.toggle('queue-open',S.open);tick()}
function refresh(){S.route=='search'?$('#res').innerHTML=results():stage();chrome()}
function nav(){const r=location.hash.slice(2);S.route=r=='search'||r=='library'?r:'home';document.querySelectorAll('[data-r]').forEach(a=>a.dataset.r==S.route?a.setAttribute('aria-current','page'):a.removeAttribute('aria-current'));stage();$('#stage').scrollTo(0,0)}
const go=id=>{if(cur().id==id)S.play=!S.play;else{if(!S.queue.includes(id))S.queue.unshift(id);S.i=S.queue.indexOf(id);S.pos=0;S.play=true}refresh()};
const step=d=>{S.i=(S.i+d+S.queue.length)%S.queue.length;S.pos=0;refresh()};
document.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b)return;const a=b.dataset.a;
 if(a=='play')go(+b.dataset.id);else if(a=='pp'){S.play=!S.play;refresh()}else if(a=='next')step(1);else if(a=='prev')step(-1);
 else if(a=='q'){S.open=!S.open;chrome()}else if(a=='all'){S.all=!S.all;refresh()}
 else if(a=='f'){S.f[b.dataset.k]=!S.f[b.dataset.k];b.setAttribute('aria-pressed',!!S.f[b.dataset.k]);refresh()}
 else if(a=='seek'){const r=b.getBoundingClientRect();S.pos=Math.round((e.clientX-r.left)/r.width*cur().d);tick()}});
document.addEventListener('input',e=>{if(e.target.id=='q'){S.q=e.target.value;$('#res').innerHTML=results()}});
document.addEventListener('keydown',e=>{if(e.target.matches&&e.target.matches('.bar')&&(e.key=='ArrowRight'||e.key=='ArrowLeft')){S.pos=Math.max(0,Math.min(cur().d,S.pos+(e.key=='ArrowRight'?5:-5)));tick()}});
// Phase 1 fake clock so the progress bar moves. Phase 3 replaces it with real audio.
setInterval(()=>{if(!S.play)return;S.pos++;S.pos>=cur().d?step(1):tick()},1000);
addEventListener('hashchange',nav);nav();chrome();
