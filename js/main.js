/* intro */
const intro=document.getElementById('intro');
addEventListener('load',()=>setTimeout(()=>intro.classList.add('gone'),1500));
setTimeout(()=>intro.classList.add('gone'),3200);

const tabs=[...document.querySelectorAll('.tab')];
const PANELS=['about','officers','handbook','gallery'];
function show(k,push=true){
 if(!PANELS.includes(k))k='about';
 tabs.forEach(t=>{const on=t.id==='t-'+k;t.setAttribute('aria-selected',on);t.tabIndex=on?0:-1;
  document.getElementById(t.getAttribute('aria-controls')).classList.toggle('on',on);});
 observeAll();
 if(push&&location.hash.slice(1)!==k)history.replaceState(null,'','#'+k);
 window.scrollTo({top:0,behavior:'smooth'});}
tabs.forEach(t=>t.addEventListener('click',()=>show(t.id.slice(2))));
tabs.forEach((t,i)=>t.addEventListener('keydown',e=>{
 const d=e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0;
 if(!d)return;e.preventDefault();
 const n=tabs[(i+d+tabs.length)%tabs.length];n.focus();show(n.id.slice(2));}));
addEventListener('hashchange',()=>show(location.hash.slice(1),false));
if(location.hash)show(location.hash.slice(1),false);
document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>show(b.dataset.go)));

/* back to top */
const topBtn=document.getElementById('top');
topBtn.addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));

const bar=document.getElementById('bar');
addEventListener('scroll',()=>{const h=document.body.scrollHeight-innerHeight;
 bar.style.width=(h>0?scrollY/h*100:0)+'%';
 topBtn.classList.toggle('show',scrollY>500);},{passive:true});

const io=new IntersectionObserver(es=>es.forEach((e,k)=>{if(e.isIntersecting){
 e.target.style.transitionDelay=(Math.min(k,6)*55)+'ms';e.target.classList.add('seen');
 io.unobserve(e.target);const n=e.target.querySelector('[data-count]');if(n)count(n);}}),{threshold:.15});
function observeAll(){document.querySelectorAll('[data-reveal]:not(.seen)').forEach(el=>io.observe(el));}
observeAll();
function count(el){const t=+el.dataset.count,s=el.dataset.suffix||'',d=1400,t0=performance.now();
 const step=n=>{const p=Math.min((n-t0)/d,1),e=1-Math.pow(1-p,3);
 el.textContent=Math.round(t*e)+(p===1?s:'');if(p<1)requestAnimationFrame(step);};requestAnimationFrame(step);}

const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* handbook reader */
const docs=[...document.querySelectorAll('.doc')],
      docTabs=[...document.querySelectorAll('.doc-tab')],
      rq=document.getElementById('rq'),rhits=document.getElementById('rhits');

function openSec(num){
 docs.forEach(d=>d.classList.toggle('on',d.dataset.sec===num));
 docTabs.forEach(t=>t.classList.toggle('act',t.dataset.goSec===num));
 const main=document.querySelector('.reader-main');
 if(main&&main.getBoundingClientRect().top<0)main.scrollIntoView({behavior:'smooth',block:'start'});
 if(typeof syncNav==='function')syncNav();
}
docTabs.forEach(t=>t.addEventListener('click',()=>openSec(t.dataset.goSec)));

const SEQ=docTabs.map(t=>t.dataset.goSec);
const dPrev=document.getElementById('docPrev'),dNext=document.getElementById('docNext'),dPos=document.getElementById('docPos');
function syncNav(){
 const i=docTabs.findIndex(t=>t.classList.contains('act'));
 if(dPos)dPos.textContent=String(i+1).padStart(2,'0')+' / '+String(SEQ.length).padStart(2,'0');
 if(dPrev)dPrev.disabled=i<=0;
 if(dNext)dNext.disabled=i>=SEQ.length-1;}
if(dPrev)dPrev.addEventListener('click',()=>{const i=docTabs.findIndex(t=>t.classList.contains('act'));if(i>0)openSec(SEQ[i-1]);});
if(dNext)dNext.addEventListener('click',()=>{const i=docTabs.findIndex(t=>t.classList.contains('act'));if(i<SEQ.length-1)openSec(SEQ[i+1]);});
syncNav();

document.querySelectorAll('.doc-code').forEach(b=>b.addEventListener('click',async()=>{
 try{await navigator.clipboard.writeText(b.dataset.code);}catch(e){}
 const t=b.textContent;b.classList.add('copied');b.textContent='Copied';
 setTimeout(()=>{b.classList.remove('copied');b.textContent=t;},1100);}));

function clearMarks(el){el.querySelectorAll('mark').forEach(m=>m.replaceWith(document.createTextNode(m.textContent)));el.normalize();}
function markText(el,v){
 const w=document.createTreeWalker(el,NodeFilter.SHOW_TEXT),hits=[];
 while(w.nextNode()){const n=w.currentNode;
  if(n.parentElement.closest('.doc-code'))continue;
  const i=n.nodeValue.toLowerCase().indexOf(v);if(i>-1)hits.push([n,i]);}
 hits.forEach(([n,i])=>{const r=document.createRange();r.setStart(n,i);r.setEnd(n,i+v.length);
  const m=document.createElement('mark');try{r.surroundContents(m);}catch(e){}});
}
if(rq)rq.addEventListener('input',()=>{
 const v=rq.value.trim().toLowerCase();let total=0,firstHit=null;
 docs.forEach(d=>{
  clearMarks(d);
  const rules=[...d.querySelectorAll('.doc-rule')];
  const titleHit=v&&d.querySelector('.doc-top').textContent.toLowerCase().includes(v);
  let any=titleHit;
  rules.forEach(r=>{
   const hit=!v||titleHit||r.textContent.toLowerCase().includes(v);
   r.classList.toggle('hide',!hit);
   if(hit&&v){total++;any=true;}
  });
  if(!rules.length&&v&&d.textContent.toLowerCase().includes(v)){any=true;total++;}
  const tab=docTabs.find(t=>t.dataset.goSec===d.dataset.sec);
  if(tab)tab.classList.toggle('hide',!!v&&!any);
  if(v&&any){markText(d,v);if(!firstHit)firstHit=d.dataset.sec;}
 });
 rhits.textContent=v?(total?total+' match'+(total===1?'':'es'):'no matches'):'';
 if(v&&firstHit)openSec(firstHit);
});

/* gallery filters */
const filts=[...document.querySelectorAll('.filt')];
filts.forEach(b=>b.addEventListener('click',()=>{
 filts.forEach(o=>o.setAttribute('aria-pressed',o===b));
 const f=b.dataset.f;
 document.querySelectorAll('.frame').forEach(fr=>{
  const vis=f==='all'||fr.dataset.tag===f;
  fr.classList.toggle('hide',!vis);
  if(fr.parentElement)fr.parentElement.classList.toggle('d-none',!vis);
  if(vis){fr.classList.remove('seen');requestAnimationFrame(()=>fr.classList.add('seen'));}});
 const shown=document.querySelectorAll('.frame:not(.hide)').length;
 const gc=document.getElementById('gcount');
 if(gc)gc.textContent=f==='all'?('Showing all '+shown+' photos'):('Showing '+shown+' photo'+(shown===1?'':'s')+' — '+b.textContent.toLowerCase());
 buildStrip();}));

/* ID tilt */
if(!reduce)document.querySelectorAll('[data-tilt]').forEach(c=>{
 c.addEventListener('pointermove',e=>{const r=c.getBoundingClientRect();
  const x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
  c.style.transform=`translateY(-8px) rotateY(${x*7}deg) rotateX(${-y*7}deg)`;});
 c.addEventListener('pointerleave',()=>c.style.transform='');});

/* embers */
const cv=document.getElementById('embers'),ctx=cv.getContext('2d');
let ps=[],W,H;
function size(){W=cv.width=innerWidth;H=cv.height=innerHeight;}
size();addEventListener('resize',size);
for(let i=0;i<34;i++)ps.push({x:Math.random()*innerWidth,y:Math.random()*innerHeight,
 r:Math.random()*1.6+.5,s:Math.random()*.28+.08,a:Math.random()*.5+.15,d:Math.random()*6.28});
function draw(){ctx.clearRect(0,0,W,H);
 ps.forEach(p=>{p.y-=p.s;p.d+=.012;p.x+=Math.sin(p.d)*.22;if(p.y<-8){p.y=H+8;p.x=Math.random()*W;}
  ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,6.3);ctx.fillStyle=`rgba(232,199,132,${p.a})`;ctx.fill();});
 requestAnimationFrame(draw);}
if(!reduce)draw();

/* lightbox with prev/next */
let frames=[...document.querySelectorAll('.frame')];
const lb=document.getElementById('lb'),lbImg=document.getElementById('lbImg'),
 lbT=document.getElementById('lbT'),lbP=document.getElementById('lbP'),lbC=document.getElementById('lbC'),
 strip=document.getElementById('lbStrip');
let cur=0;
function visible(){return [...document.querySelectorAll('.frame:not(.hide)')];}
function buildStrip(){const vis=visible();strip.innerHTML='';
 vis.forEach((f,i)=>{const im=document.createElement('img');im.src=f.querySelector('img').src;
  im.alt='';im.addEventListener('click',e=>{e.stopPropagation();render(i);});strip.appendChild(im);});}
function render(i){frames=visible();cur=(i+frames.length)%frames.length;const f=frames[cur];
 lbImg.src=f.querySelector('img').src;lbImg.alt=f.dataset.title;
 lbT.textContent=f.dataset.title;lbP.textContent=f.dataset.sub;
 lbC.textContent=String(cur+1).padStart(2,'0')+' / '+String(frames.length).padStart(2,'0');
 [...strip.children].forEach((t,i)=>t.classList.toggle('act',i===cur));
 const act=strip.children[cur];if(act)act.scrollIntoView({block:'nearest',inline:'center',behavior:'smooth'});}
function open(f){buildStrip();render(visible().indexOf(f));lb.classList.add('open');}
frames.forEach(f=>{f.addEventListener('click',()=>open(f));
 f.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open(f);}});});
buildStrip();
const cl=()=>{lb.classList.remove('open');lbImg.src='';};
document.getElementById('lbX').addEventListener('click',cl);
document.getElementById('lbPrev').addEventListener('click',e=>{e.stopPropagation();render(cur-1);});
document.getElementById('lbNext').addEventListener('click',e=>{e.stopPropagation();render(cur+1);});
lb.addEventListener('click',e=>{if(e.target===lb)cl();});
let tx=0;
lb.addEventListener('touchstart',e=>{tx=e.changedTouches[0].clientX;},{passive:true});
lb.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-tx;
 if(Math.abs(dx)>55)render(cur+(dx<0?1:-1));},{passive:true});
addEventListener('keydown',e=>{if(!lb.classList.contains('open'))return;
 if(e.key==='Escape')cl();if(e.key==='ArrowLeft')render(cur-1);if(e.key==='ArrowRight')render(cur+1);});
