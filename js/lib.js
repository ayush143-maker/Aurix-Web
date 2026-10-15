// Library store: liked songs and playlists, saved in this browser.
const K='aurix.lib';let D={liked:[],pls:[]};
try{D={...D,...JSON.parse(localStorage.getItem(K))}}catch{}
const save=()=>{try{localStorage.setItem(K,JSON.stringify(D))}catch{}};
const slim=t=>({id:t.id,title:t.title,artist:t.artist,art:t.art,d:t.d});
export const lib={
 get liked(){return D.liked},get pls(){return D.pls},
 isLiked:id=>D.liked.some(t=>t.id==id),
 like(t){const on=!D.liked.some(x=>x.id==t.id);D.liked=on?[slim(t),...D.liked]:D.liked.filter(x=>x.id!=t.id);save();return on},
 newPl(n){const p={id:Date.now().toString(36)+Math.random().toString(36).slice(2,5),name:(n||'').trim()||'New playlist',tracks:[]};D.pls.unshift(p);save();return p},
 pl:id=>D.pls.find(p=>p.id==id),
 addTo(id,t){const p=lib.pl(id);if(!p||p.tracks.some(x=>x.id==t.id))return false;p.tracks.push(slim(t));save();return true},
 removeFrom(id,tid){const p=lib.pl(id);if(p){p.tracks=p.tracks.filter(x=>x.id!=tid);save()}},
 delPl(id){D.pls=D.pls.filter(p=>p.id!=id);save()},
 rename(id,n){const p=lib.pl(id);if(p&&n.trim()){p.name=n.trim();save()}},
 export:()=>JSON.stringify({app:'aurix',v:1,liked:D.liked,pls:D.pls},null,1),
 import(txt){const j=JSON.parse(txt);if(!j||!Array.isArray(j.liked)||!Array.isArray(j.pls))throw new Error('This is not an Aurix backup');
  j.liked.forEach(t=>{if(t&&t.id&&!lib.isLiked(t.id))D.liked.push(slim(t))});
  j.pls.forEach(p=>{if(p&&p.id&&Array.isArray(p.tracks)&&!lib.pl(p.id))D.pls.push({id:p.id,name:String(p.name||'Playlist'),tracks:p.tracks.filter(t=>t&&t.id).map(slim)})});save()}};
