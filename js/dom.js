// Tiny DOM morph: makes `root` match `html` while keeping existing nodes alive (scroll position, focus, loaded images).
export function patch(root,html){const t=document.createElement('template');t.innerHTML=html;sync(root,t.content)}
function sync(a,b){
 const A=[...a.childNodes],B=[...b.childNodes],n=Math.max(A.length,B.length);
 for(let i=0;i<n;i++){const x=A[i],y=B[i];
  if(!y){a.removeChild(x);continue}
  if(!x){a.appendChild(y.cloneNode(true));continue}
  if(x.nodeType!=y.nodeType||x.nodeName!=y.nodeName){a.replaceChild(y.cloneNode(true),x);continue}
  if(x.nodeType==3){if(x.data!=y.data)x.data=y.data;continue}
  if(x.nodeType!=1)continue;
  for(const at of [...x.attributes])if(!y.hasAttribute(at.name))x.removeAttribute(at.name);
  for(const at of y.attributes)if(x.getAttribute(at.name)!==at.value)x.setAttribute(at.name,at.value);
  sync(x,y)}}
