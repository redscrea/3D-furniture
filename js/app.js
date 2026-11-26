import * as THREE from '../vendor/three/three.module.js';
import { OrbitControls } from '../vendor/three/OrbitControls.js';
import { T, LANGS } from './i18n.js';

/* =================== Textos =================== */
let lang=(()=>{ try{ const s=localStorage.getItem('montaje3d-lang'); if(LANGS.includes(s)) return s; }catch(e){} const n=(navigator.language||'es').slice(0,2).toLowerCase(); return LANGS.includes(n)?n:'es'; })();
const L=()=>T[lang];
const fill=(s,o)=>s.replace(/\{(\w+)\}/g,(_,k)=>o[k]);

/* =================== Medidas (cm) =================== */
const W=182, H=182, D=39, TH=3.9, t=1.65, C=33.5;
const rowBottom = r => TH + r*(C+t);
const colLeft  = j => -87.1 + j*(C+t);
const RAIL_ROW = 1, RAIL_COLS=[1,2];
const cubeCx = j => colLeft(j)+C/2;
const DESK_X = (cubeCx(1)+cubeCx(2))/2;
const DESK_Y = rowBottom(2);
const FLIP = 16;
const COL = { wood:'#e9dfcb', white:'#f2f2ef', metal:'#a7adb4', dowel:'#cfa977', dark:'#4a5058', hl:'#ff6a13' };
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* =================== Escena =================== */
const stage = document.getElementById('stage');
const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
stage.prepend(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, 1, 1, 6000);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; controls.dampingFactor = .08;
controls.maxPolarAngle = Math.PI*0.495; controls.minDistance = 50; controls.maxDistance = 1100;
controls.autoRotateSpeed = 0.7;

scene.add(new THREE.HemisphereLight(0xffffff, 0x8a8f99, 1.15));
const sun = new THREE.DirectionalLight(0xffffff, 1.7);
sun.position.set(240, 420, 300); sun.castShadow = true;
sun.shadow.mapSize.set(2048,2048);
Object.assign(sun.shadow.camera,{left:-320,right:320,top:320,bottom:-320,near:50,far:1400});
sun.shadow.normalBias = 0.6;
scene.add(sun);

const floorMat = new THREE.MeshStandardMaterial({roughness:1});
const floor = new THREE.Mesh(new THREE.PlaneGeometry(3000,3000), floorMat);
floor.rotation.x = -Math.PI/2; floor.receiveShadow = true; scene.add(floor);
let grid;
const wallMat = new THREE.MeshStandardMaterial({roughness:1});
const wall = new THREE.Mesh(new THREE.PlaneGeometry(800,330), wallMat);
wall.position.set(0,165,-1.6); wall.receiveShadow = true; scene.add(wall);

function applyTheme(){
  const cs = getComputedStyle(document.documentElement);
  const v = n => cs.getPropertyValue(n).trim();
  scene.background = new THREE.Color(v('--stage'));
  floorMat.color.set(v('--floor'));
  wallMat.color.set(v('--wall'));
  if(grid) scene.remove(grid);
  const dark = cs.colorScheme.includes('dark');
  grid = new THREE.GridHelper(1200, 48, dark?0x39424c:0xc5cac2, dark?0x2c343d:0xcfd3cb);
  grid.position.y = 0.05; scene.add(grid);
}
applyTheme();
new MutationObserver(applyTheme).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);

/* =================== Geometría =================== */
const edgeMat = new THREE.LineBasicMaterial({color:0x26303a, transparent:true, opacity:.42});
function mat(color, metal){ return new THREE.MeshStandardMaterial({color, roughness: metal?.38:.78, metalness: metal?.55:0}); }
function box(min,max,color,opts={}){
  const s=[max[0]-min[0],max[1]-min[1],max[2]-min[2]];
  const g=new THREE.BoxGeometry(...s);
  const m=new THREE.Mesh(g,mat(color,opts.metal));
  m.position.set((min[0]+max[0])/2,(min[1]+max[1])/2,(min[2]+max[2])/2);
  if(opts.edges!==false) m.add(new THREE.LineSegments(new THREE.EdgesGeometry(g),edgeMat));
  return m;
}
function cyl(r,h,color,pos,axis='y',metal=false,edges=false){
  const g=new THREE.CylinderGeometry(r,r,h,24);
  const m=new THREE.Mesh(g,mat(color,metal));
  if(axis==='x') m.rotation.z=Math.PI/2;
  if(axis==='z') m.rotation.x=Math.PI/2;
  m.position.set(...pos);
  if(edges) m.add(new THREE.LineSegments(new THREE.EdgesGeometry(g,30),edgeMat));
  return m;
}
function group(...objs){ const g=new THREE.Group(); objs.forEach(o=>g.add(o)); return g; }

/* =================== Piezas =================== */
const parts=[]; const pickables=[];
function addPart({key, n, obj, parent=scene, step, sub=0, enter=[0,0,0], tag=null, reEnter=[0,0,0], zx=0}){
  parent.add(obj);
  const p={key,n,obj,step,sub,tag,enter:new THREE.Vector3(...enter),reEnter:new THREE.Vector3(...reEnter),final:obj.position.clone(),explode:new THREE.Vector3(),zx,meshes:[],anim:null,inDesk:parent!==scene};
  obj.traverse(o=>{ if(o.isMesh){ o.castShadow=true; o.receiveShadow=true; o.userData.base=o.material.color.clone(); o.userData.part=p; p.meshes.push(o); pickables.push(o);} });
  parts.push(p); return p;
}
const partName=p=>fill(L().pn[p.key],{n:p.n});

addPart({key:'bottom', obj:box([-87.1,0,0],[87.1,TH,D],COL.wood), step:2, enter:[0,30,0]});
for(let k=1;k<=4;k++){
  const y=rowBottom(k);
  addPart({key:'shelf', n:k, obj:box([-87.1,y-t,0],[87.1,y,D],COL.wood), step: k===1?4:4+k-1, sub: k===1?0:6, enter:[0,45,0]});
}
for(let r=0;r<5;r++){
  const stepRow = r===0?3:4+r;
  const y0=rowBottom(r), y1=y0+C;
  const subBase = r===0?0:1;
  const dw=[];
  for(let j=1;j<=4;j++){ const x=colLeft(j)-t/2; for(const z of [9,30]) dw.push(cyl(.6,3,COL.dowel,[x,y0,z])); }
  addPart({key:'dowels', obj:group(...dw), step: r===0?2:stepRow, sub: r===0?1:0, enter:[0,10,0], zx:48});
  for(let j=1;j<=4;j++){
    const x=colLeft(j);
    addPart({key:'divider', n:r+1, obj:box([x-t,y0,0],[x,y1,D],COL.wood), step:stepRow, sub:subBase+j-1, enter:[0,34,0], zx:24});
  }
  const dt=[];
  for(let j=1;j<=4;j++){ const x=colLeft(j)-t/2; for(const z of [9,30]) dt.push(cyl(.6,3,COL.dowel,[x,y1,z])); }
  addPart({key:'dowels', obj:group(...dt), step:stepRow, sub:subBase+4, enter:[0,10,0], zx:48});
}
addPart({key:'top', obj:box([-87.1,H-TH,0],[87.1,H,D],COL.wood), step:9, enter:[0,40,0]});
addPart({key:'sideL', obj:box([-91,0,0],[-87.1,H,D],COL.wood), step:10, sub:0, enter:[-50,0,0]});
addPart({key:'sideR', obj:box([87.1,0,0],[91,H,D],COL.wood), step:10, sub:2, enter:[50,0,0]});
for(const [i,x] of [-68,68].entries()){
  const g=group(
    box([x-2.2,H,-1.25],[x+2.2,H+.35,7],COL.metal,{metal:true,edges:false}),
    box([x-2.2,H,-1.25],[x+2.2,H+8,-.9],COL.metal,{metal:true,edges:false}),
    cyl(.7,.5,COL.dark,[x,H+5.2,-.7],'z',true),
    cyl(.7,.5,COL.dark,[x,H+.55,4],'y',true)
  );
  addPart({key:'wallBracket', obj:g, step:11, sub:i*2, enter:[0,22,12], zx:12});
}
for(const [i,j] of RAIL_COLS.entries()){
  const x0=colLeft(j), x1=x0+C, y=rowBottom(RAIL_ROW)+C;
  const g=group(
    box([x0+.05,y-5.65,35.5],[x1-.05,y-3.15,38.5],COL.metal,{metal:true}),
    cyl(.75,.4,COL.dark,[x0+.3,y-4.4,37],'x',true),
    cyl(.75,.4,COL.dark,[x1-.3,y-4.4,37],'x',true)
  );
  addPart({key:'rail', obj:g, step:15, sub:i*3, enter:[0,0,45], zx:60});
}
const desk = new THREE.Group(); scene.add(desk);
const DESK_FINAL = { p:new THREE.Vector3(DESK_X, DESK_Y, D), q:new THREE.Quaternion() };
const DESK_STAGED = { p:new THREE.Vector3(DESK_X, 2.5, 118), q:new THREE.Quaternion().setFromEuler(new THREE.Euler(0,0,Math.PI)) };
addPart({key:'tabletop', obj:box([-30,0,0],[30,2.5,120],COL.white), parent:desk, step:12, enter:[0,-40,0]});
for(const [i,sx] of [-24,24].entries()){
  const scr=[]; for(let k=0;k<5;k++){ const a=k/5*Math.PI*2; scr.push(cyl(.5,.35,COL.dark,[sx+Math.cos(a)*3.4,-.95,112+Math.sin(a)*3.4],'y',true)); }
  addPart({key:'plate', obj:group(cyl(5,.8,COL.metal,[sx,-.4,112],'y',true),...scr), parent:desk, step:13, sub:i, enter:[0,-16,0]});
}
for(const [i,sx] of [-24,24].entries()){
  addPart({key:'legUp', obj:cyl(2.4,39.2,COL.white,[sx,-20.4,112],'y',false,true), parent:desk, step:13, sub:3+i*2, enter:[0,-38,0]});
  addPart({key:'legLow', obj:group(cyl(2.0,35.2,COL.white,[sx,-55.6,112],'y',false,true),cyl(2.6,1,COL.dark,[sx,-73.7,112])), parent:desk, step:13, sub:3+i*2, enter:[0,-38,0], tag:'legLower', reEnter:[0,6,0]});
}
for(const [i,bx] of [cubeCx(1)-DESK_X, cubeCx(2)-DESK_X].entries()){
  const g=group(
    box([bx-3,-.3,.3],[bx+3,0,8.3],COL.metal,{metal:true}),
    box([bx-3,-4.8,.3],[bx+3,-.3,.6],COL.metal,{metal:true}),
    box([bx-3,-4.8,-6],[bx+3,-4.5,.6],COL.metal,{metal:true}),
    cyl(.6,.35,COL.dark,[bx,-.48,3],'y',true),
    cyl(.6,.35,COL.dark,[bx,-.48,7],'y',true)
  );
  addPart({key:'zbracket', obj:g, parent:desk, step:14, sub:i*2, enter:[0,-22,0], zx:30});
  const s=group(
    cyl(1.15,.15,COL.metal,[bx-1.8,-4.42,-1.6],'y',true), cyl(.7,.5,COL.dark,[bx-1.8,-4.1,-1.6],'y',true),
    cyl(1.15,.15,COL.metal,[bx+1.8,-4.42,-1.6],'y',true), cyl(.7,.5,COL.dark,[bx+1.8,-4.1,-1.6],'y',true)
  );
  addPart({key:'screwsWasher', obj:s, parent:desk, step:17, sub:i*2, enter:[0,12,0], zx:40});
}
for(const p of parts){
  if(p.inDesk){ p.explode.set(0, p.key==='tabletop'?26:10, 70); continue; }
  const c=new THREE.Box3().setFromObject(p.obj).getCenter(new THREE.Vector3());
  p.explode.set(c.x*.32, (c.y-91)*.48, p.zx);
}

/* =================== Pasos (estructura; los textos están en T) =================== */
const rowCam = r => { const y=rowBottom(r)+17; return [135, y+85, 235, 0, y, 20]; };
const FULL=[235,175,370, 0,88,60];
const STEPS=[
 {sec:'preview', mode:'final', cam:FULL, hw:[['personas','people',2],['destornillador','screwdriver'],['allen','allen'],['nivel','level'],['taladro','drill'],['carton','cardboard']]},
 {sec:'before', mode:'explode', cam:[330,265,580, 0,90,60], hw:[['panel','sides',2],['panel','topBottom',2],['panel','longShelves',4],['separador','dividers',20],['espiga','dowels'],['rail','rails',2],['escuadra','zbrackets',2],['pata','legs',2]]},
 {sec:'kallax', cam:[125,95,215, 0,6,20], hw:[['carton','cardboardFloor'],['panel','bottomPanel',1],['espiga','dowels']]},
 {sec:'kallax', cam:rowCam(0), hw:[['separador','dividers',4],['espiga','dowels']]},
 {sec:'kallax', cam:rowCam(1), hw:[['panel','longShelf',1]]},
 {sec:'kallax', cam:rowCam(1), hw:[['separador','dividers',4],['espiga','dowels'],['panel','longShelf',1]]},
 {sec:'kallax', cam:rowCam(2), hw:[['separador','dividers',4],['espiga','dowels'],['panel','longShelf',1]]},
 {sec:'kallax', cam:rowCam(3), hw:[['separador','dividers',4],['espiga','dowels'],['panel','longShelf',1]]},
 {sec:'kallax', cam:rowCam(4), hw:[['separador','dividers',4],['espiga','dowels']]},
 {sec:'kallax', cam:[150,260,270, 0,168,20], hw:[['panel','topPanel',1]]},
 {sec:'kallax', cam:[255,165,340, 0,90,20], hw:[['panel','sides',2],['allen','allen']]},
 {sec:'kallax', cam:[170,250,260, 0,165,0], hw:[['personas','people',2],['escuadra','wallBrackets',2],['taladro','drillShort'],['tornillo','wallScrews']]},
 {sec:'desk', cam:[190,175,345, DESK_X,15,180], hw:[['carton','blanket'],['tablero','tabletop',1]]},
 {sec:'desk', cam:[175,165,355, DESK_X,25,220], hw:[['placa','plates',2],['tornillo','screws',10],['pata','legs',2],['destornillador','screwdriverShort']]},
 {sec:'desk', cam:[120,95,215, DESK_X,5,125], hw:[['escuadra','zbrackets',2],['tornillo','screws',4]]},
 {sec:'desk', cam:[75,108,145, DESK_X,66,37], hw:[['rail','rails',2],['tornillo','screws',4]]},
 {sec:'desk', cam:[250,195,370, DESK_X,50,100], hw:[['personas','people',2]]},
 {sec:'desk', cam:[45,118,112, DESK_X,70,40], hw:[['tornillo','screws',4],['arandela','washers',4],['destornillador','screwdriverShort']]},
 {sec:'desk', reanimate:'legLower', cam:[205,140,300, DESK_X,40,110], hw:[['nivel','level']]},
 {sec:'done', mode:'final', cam:FULL, hw:[]}
];
const LAST=STEPS.length-1;
const stepText=i=>{ const [title,text,tip,warn]=L().steps[i]; return {title,text,tip,warn}; };

/* =================== Iconos =================== */
const ICON={
 espiga:'<rect x="9" y="3" width="6" height="18" rx="3"/><path d="M9 8h6M9 12h6M9 16h6"/>',
 tornillo:'<path d="M7 4h10l-2 3H9z"/><path d="M12 7v14"/><path d="M10 10l4 1.5M10 13.5l4 1.5M10 17l4 1.5"/>',
 allen:'<path d="M7 3v13a3 3 0 0 0 3 3h10" stroke-width="2.6"/>',
 escuadra:'<path d="M6 4v14h14v-3.5H9.5V4z"/>',
 destornillador:'<path d="M14 3l7 7-3.5 3.5-7-7z"/><path d="M10.5 10.5L4 17v3h3l6.5-6.5"/>',
 nivel:'<rect x="2" y="8" width="20" height="8" rx="2"/><rect x="9" y="10" width="6" height="4" rx="2"/>',
 taladro:'<path d="M3 6h12v6H3z"/><path d="M15 8h6"/><path d="M7 12l-1 8h4l1-8"/>',
 personas:'<circle cx="8" cy="7" r="3"/><circle cx="16" cy="7" r="3"/><path d="M3 20c0-4 2-6 5-6s5 2 5 6M11 20c0-4 2-6 5-6s5 2 5 6"/>',
 carton:'<path d="M3 8l9-4 9 4-9 4z"/><path d="M3 8v8l9 4 9-4V8"/>',
 tablero:'<path d="M2 11l6-4h14l-6 4z"/><path d="M2 11v3h14v-3M16 14l6-4V7"/>',
 pata:'<ellipse cx="12" cy="5" rx="6" ry="2"/><path d="M10 6v14h4V6"/>',
 rail:'<path d="M3 10h18v4H3z"/><path d="M3 7v10M21 7v10"/>',
 arandela:'<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2.5"/>',
 panel:'<rect x="3" y="9" width="18" height="6" rx="1"/>',
 separador:'<rect x="9" y="4" width="6" height="16" rx="1"/>',
 placa:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="6.5" r=".9"/><circle cx="17" cy="14.5" r=".9"/><circle cx="7" cy="14.5" r=".9"/>'
};
const svg=k=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[k]||''}</svg>`;
const ICO_TIP='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/></svg>';
const ICO_WARN='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.5"/></svg>';
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* =================== Panel e idioma =================== */
const $=id=>document.getElementById(id);
const stepsNav=$('steps');
stepsNav.addEventListener('click',e=>{ const b=e.target.closest('button[data-step]'); if(b){ stopPlay(); go(+b.dataset.step); } });
function buildList(){
  let html='', last='';
  STEPS.forEach((s,i)=>{
    if(s.sec!==last){ if(last) html+='</ol>'; html+=`<h2>${esc(L().sec[s.sec])}</h2><ol>`; last=s.sec; }
    html+=`<li><button type="button" data-step="${i}"><span class="n">${String(i).padStart(2,'0')}</span><span>${esc(stepText(i).title)}</span></button></li>`;
  });
  stepsNav.innerHTML=html+'</ol>';
  stepsNav.setAttribute('aria-label',L().stepsNav);
}
function applyLang(){
  const l=L();
  document.documentElement.lang=lang;
  $('brand').innerHTML=l.brand;
  document.querySelectorAll('[data-i]').forEach(el=>{ const k=el.dataset.i; if(typeof l[k]==='string') el.textContent=l[k]; });
  document.querySelectorAll('#langs button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.lang===lang)));
  $('langs').setAttribute('aria-label',l.langLabel);
  stage.setAttribute('aria-label',l.stage);
  $('prev').textContent=l.prev; $('prev').setAttribute('aria-label',l.prevAria);
  $('chatClose').setAttribute('aria-label',l.close);
  $('q').placeholder=l.placeholder;
  $('photoTxt').textContent=l.photo; $('photoLbl').title=l.photo;
  $('of').textContent='/ '+LAST;
  setPlayLabel();
  buildList(); renderPanel(); renderChat();
}
$('langs').addEventListener('click',e=>{ const b=e.target.closest('button[data-lang]'); if(!b) return; lang=b.dataset.lang; try{ localStorage.setItem('montaje3d-lang',lang); }catch(err){} applyLang(); });

function renderPanel(){
  const s=STEPS[cur], x=stepText(cur), l=L();
  $('sec').textContent=l.sec[s.sec];
  $('num').textContent=String(cur).padStart(2,'0');
  $('title').textContent=x.title;
  $('text').textContent=x.text;
  $('need').style.display=s.hw.length?'':'none';
  $('hw').innerHTML=s.hw.map(([ic,k,q])=>`<li>${svg(ic)}<span>${esc(l.hw[k])}</span>${q?`<span class="q">×${q}</span>`:''}</li>`).join('');
  let c='';
  if(x.warn) c+=`<div class="callout warn">${ICO_WARN}<span>${esc(x.warn)}</span></div>`;
  if(x.tip) c+=`<div class="callout tip">${ICO_TIP}<span>${esc(x.tip)}</span></div>`;
  $('callouts').innerHTML=c;
  $('prev').disabled=cur===0;
  $('next').textContent= cur===0?l.start : cur===LAST?l.restart : l.next;
  $('bar').style.width=(cur/LAST*100)+'%';
  stepsNav.querySelectorAll('button[data-step]').forEach(b=>{ const i=+b.dataset.step; b.removeAttribute('aria-current'); if(i===cur) b.setAttribute('aria-current','step'); b.classList.toggle('done',i<cur); });
  const curBtn=stepsNav.querySelector('[aria-current="step"]'); if(curBtn && matchMedia('(min-width:861px)').matches) curBtn.scrollIntoView({block:'nearest'});
  $('chatStep').textContent=`${l.step} ${cur} · ${x.title}`;
}

/* =================== Animación =================== */
const DUR=reduced?0:.85, STAG=reduced?0:.17;
const ease=u=>1-Math.pow(1-u,3);
const easeIO=u=>u<.5?4*u*u*u:1-Math.pow(-2*u+2,3)/2;
let cur=0, camTween=null, deskTween=null;
const HL=new THREE.Color(COL.hl), EM=new THREE.Color('#4a1600'), BLACK=new THREE.Color(0);
function setHL(p,on){ for(const m of p.meshes){ m.material.color.copy(on?HL:m.userData.base); m.material.emissive.copy(on?EM:BLACK); } }
function setDeskPose(pose){ desk.position.copy(pose.p); desk.quaternion.copy(pose.q); }

function go(i, animate=true){
  cur=Math.max(0,Math.min(LAST,i));
  const s=STEPS[cur], mode=s.mode, now=performance.now()/1000;
  for(const p of parts){
    const target=p.final.clone(); let from=null, delay=0, hl=false, vis;
    if(mode){ vis=true; if(mode==='explode') target.add(p.explode); if(animate) from=p.obj.visible?p.obj.position.clone():target.clone(); }
    else{
      vis=p.step<=cur;
      if(p.step===cur){ hl=true; if(animate){ from=p.final.clone().add(p.enter); delay=p.sub*STAG; } }
      if(s.reanimate && p.tag===s.reanimate){ hl=true; if(animate){ from=p.final.clone().add(p.reEnter); delay=p.sub*STAG*.5; } }
      if(cur===FLIP && p.inDesk) hl=true;
    }
    p.obj.visible=vis;
    if(from && DUR>0){ p.obj.position.copy(from); p.anim={from,to:target,t0:now+delay,dur:DUR}; }
    else{ p.obj.position.copy(target); p.anim=null; }
    setHL(p,hl);
  }
  deskTween=null;
  if(!mode && cur===FLIP && animate && DUR>0){ setDeskPose(DESK_STAGED); deskTween={t0:now+.2,dur:1.9}; }
  else setDeskPose(mode || cur>=FLIP ? DESK_FINAL : DESK_STAGED);
  controls.autoRotate = mode==='final' && !reduced;
  tweenCam(s.cam, animate);
  renderPanel();
  if(!$('chat').hidden) renderIntro();
}
function tweenCam(c, animate=true){
  const toP=new THREE.Vector3(c[0],c[1],c[2]), toT=new THREE.Vector3(c[3],c[4],c[5]);
  if(!animate||reduced){ camera.position.copy(toP); controls.target.copy(toT); camTween=null; return; }
  camTween={fromP:camera.position.clone(),fromT:controls.target.clone(),toP,toT,t0:performance.now()/1000,dur:1.25};
}
controls.addEventListener('start',()=>{ camTween=null; controls.autoRotate=false; });

function resize(){ const r=stage.getBoundingClientRect(); renderer.setSize(r.width,r.height,false); camera.aspect=r.width/Math.max(1,r.height); camera.updateProjectionMatrix(); }
new ResizeObserver(resize).observe(stage); resize();

function tick(){
  const now=performance.now()/1000;
  for(const p of parts){
    if(!p.anim) continue;
    const u=Math.min(1,Math.max(0,(now-p.anim.t0)/p.anim.dur));
    p.obj.position.lerpVectors(p.anim.from,p.anim.to,ease(u));
    if(u>=1) p.anim=null;
  }
  if(deskTween){
    const u=Math.min(1,Math.max(0,(now-deskTween.t0)/deskTween.dur)), e=easeIO(u);
    desk.position.lerpVectors(DESK_STAGED.p,DESK_FINAL.p,e); desk.position.y+=Math.sin(Math.PI*e)*85;
    desk.quaternion.slerpQuaternions(DESK_STAGED.q,DESK_FINAL.q,e);
    if(u>=1) deskTween=null;
  }
  if(camTween){
    const u=Math.min(1,(now-camTween.t0)/camTween.dur), e=easeIO(u);
    camera.position.lerpVectors(camTween.fromP,camTween.toP,e);
    controls.target.lerpVectors(camTween.fromT,camTween.toT,e);
    if(u>=1) camTween=null;
  }
  controls.update();
  renderer.render(scene,camera);
  requestAnimationFrame(tick);
}

/* =================== Nombre de la pieza =================== */
const ray=new THREE.Raycaster(), ndc=new THREE.Vector2(), tipEl=$('tip');
let downAt=null, tipTimer=null;
function pick(ev){
  const r=renderer.domElement.getBoundingClientRect();
  ndc.set(((ev.clientX-r.left)/r.width)*2-1, -((ev.clientY-r.top)/r.height)*2+1);
  ray.setFromCamera(ndc,camera);
  const hit=ray.intersectObjects(pickables.filter(m=>m.userData.part.obj.visible),false)[0];
  return hit? {p:hit.object.userData.part, x:ev.clientX-r.left, y:ev.clientY-r.top} : null;
}
function showTip(h){ if(!h){ tipEl.style.opacity=0; return; } tipEl.textContent=partName(h.p); tipEl.style.left=h.x+'px'; tipEl.style.top=h.y+'px'; tipEl.style.opacity=1; }
renderer.domElement.addEventListener('pointermove',ev=>{ if(ev.pointerType==='mouse' && !ev.buttons) showTip(pick(ev)); });
renderer.domElement.addEventListener('pointerleave',()=>showTip(null));
renderer.domElement.addEventListener('pointerdown',ev=>{ downAt=[ev.clientX,ev.clientY]; });
renderer.domElement.addEventListener('pointerup',ev=>{
  if(!downAt||Math.hypot(ev.clientX-downAt[0],ev.clientY-downAt[1])>6) return;
  const h=pick(ev); showTip(h); clearTimeout(tipTimer); if(ev.pointerType!=='mouse') tipTimer=setTimeout(()=>showTip(null),2200);
});

/* =================== Controles =================== */
let playTimer=null;
function setPlayLabel(){ const on=!!playTimer; $('play').textContent=on?'❚❚':'▶'; $('play').setAttribute('aria-pressed',String(on)); $('play').title=on?L().pause:L().play; $('play').setAttribute('aria-label',$('play').title); }
function stopPlay(){ clearInterval(playTimer); playTimer=null; setPlayLabel(); }
$('play').addEventListener('click',()=>{
  if(playTimer){ stopPlay(); return; }
  if(cur===LAST) go(0);
  playTimer=setInterval(()=>{ if(cur>=LAST){ stopPlay(); return; } go(cur+1); }, 5200);
  setPlayLabel();
});
$('next').addEventListener('click',()=>{ stopPlay(); go(cur===LAST?0:cur+1); });
$('prev').addEventListener('click',()=>{ stopPlay(); go(cur-1); });
$('replay').addEventListener('click',()=>go(cur));
$('recenter').addEventListener('click',()=>tweenCam(STEPS[cur].cam));
addEventListener('keydown',e=>{
  if(e.target.closest('input,textarea,[contenteditable]')) return;
  if(e.key==='Escape' && !$('chat').hidden){ closeChat(); return; }
  if(e.key==='ArrowRight'){ stopPlay(); if(cur<LAST) go(cur+1); }
  if(e.key==='ArrowLeft'){ stopPlay(); if(cur>0) go(cur-1); }
});

/* =================== Ayuda con IA =================== */
let ai=null, canImages=false, busy=false, ctrl=null, photoBlob=null, photoURL=null;
const chat=[]; // {role:'user'|'assistant'|'error', content, step, photo}
const log=$('log');

function guideContext(){
  const l=L();
  const lines=STEPS.map((s,i)=>{ const x=stepText(i); return `${i}. [${l.sec[s.sec]}] ${x.title}: ${x.text}${x.tip?' (Tip: '+x.tip+')':''}${x.warn?' (Warning: '+x.warn+')':''}${s.hw.length?' — Needs: '+s.hw.map(([,k,q])=>(q?q+'× ':'')+l.hw[k]).join(', '):''}`; }).join('\n');
  return `You are the assembly helper inside a 3D step-by-step assembly guide (a web app). The person is assembling:
- KALLAX shelving unit 182×182 cm (5×5 compartments, white-stained oak effect)
- INLÄGG connecting fitting: 2 metal rails screwed inside two neighbouring KALLAX compartments + 2 Z-brackets screwed under the tabletop, plus screws and washers
- 2 OLOV adjustable legs (60–90 cm), each screwed to a mounting plate with 5 screws
- a tabletop bought separately (the model uses 120×60 cm)
Together they form a KALLAX with a desk hooked onto its front, about 76 cm high.

The guide's steps (in the person's language):
${lines}

Rules:
- Answer in ${l.langName}, unless the person writes in another language; then answer in theirs.
- Be short and concrete: 2–6 sentences or a short list. Refer to the step numbers of this guide when useful.
- The KALLAX steps in this guide are a simplified order shown upright; the paper manual builds it lying on its back. If the person's manual differs, the paper manual is right.
- If you are not sure (exact part numbers, hardware counts, anything not covered above), say so plainly and suggest checking the paper manual or IKEA customer service. Never invent part numbers or quantities.
- Safety first: the KALLAX must be fixed to the wall; lift and turn heavy parts with two people; don't overtighten fittings in particleboard.
- If a photo is attached, say briefly what you see that matters and help from there. If the photo is unclear, ask for a closer one.
- If the question is unrelated to assembling this furniture, answer in one sentence and steer back to the assembly.
- Plain text. You may use short "- " bullet lines and **bold** for key words. No headings.`;
}
function fmt(text){
  const lines=esc(text).replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').split(/\n/);
  let html='', inList=false, para=[];
  const flush=()=>{ if(para.length){ html+=`<p>${para.join('<br>')}</p>`; para=[]; } };
  for(const ln of lines){
    const m=ln.match(/^\s*(?:[-•*]|\d+[.)])\s+(.*)$/);
    if(m){ flush(); if(!inList){ html+='<ul>'; inList=true; } html+=`<li>${m[1]}</li>`; }
    else{ if(inList){ html+='</ul>'; inList=false; } if(ln.trim()==='') flush(); else para.push(ln); }
  }
  flush(); if(inList) html+='</ul>';
  return html||'<p></p>';
}
function renderIntro(){
  const l=L(); const intro=log.querySelector('.intro');
  if(intro) intro.textContent=fill(canImages?l.intro:l.introNoPhoto,{n:cur});
}
function renderChat(){
  const l=L();
  let html=`<p class="intro"></p>`;
  if(!chat.length) html+=`<div class="sugs">${l.sugs.map(s=>`<button type="button">${esc(s)}</button>`).join('')}</div>`;
  for(const m of chat){
    if(m.role==='user') html+=`<div class="msg user">${fmt(m.content)}${m.photo?`<span class="ph">${esc(l.photoSent)}</span>`:''}</div>`;
    else if(m.role==='assistant') html+=`<div class="msg ai${m.pending?' pending':''}">${m.pending&&!m.content?`<p>${esc(l.thinking)}</p>`:fmt(m.content)}</div>`;
    else html+=`<div class="msg err"><p>${esc(l[m.content]||m.content)}</p></div>`;
  }
  log.innerHTML=html;
  renderIntro();
  log.scrollTop=log.scrollHeight;
}
log.addEventListener('click',e=>{ const b=e.target.closest('.sugs button'); if(b) ask(b.textContent); });

function openChat(){ $('chat').hidden=false; renderPanel(); renderChat(); setTimeout(()=>$('q').focus(),30); }
function closeChat(){ $('chat').hidden=true; $('askAi').focus(); }
$('askAi').addEventListener('click',openChat);
$('chatClose').addEventListener('click',closeChat);
$('chat').addEventListener('keydown',e=>{ if(e.key==='Escape'){ e.preventDefault(); closeChat(); } });

const q=$('q');
q.addEventListener('input',()=>{ q.style.height='auto'; q.style.height=Math.min(130,q.scrollHeight)+'px'; });
q.addEventListener('keydown',e=>{ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); $('chatForm').requestSubmit(); } });
$('chatForm').addEventListener('submit',e=>{ e.preventDefault(); ask(q.value); });

async function shrink(file){
  try{
    const bmp=await createImageBitmap(file);
    const sc=Math.min(1,1280/Math.max(bmp.width,bmp.height));
    const cv=document.createElement('canvas'); cv.width=Math.round(bmp.width*sc); cv.height=Math.round(bmp.height*sc);
    cv.getContext('2d').drawImage(bmp,0,0,cv.width,cv.height);
    return await new Promise(r=>cv.toBlob(b=>r(b||file),'image/jpeg',.85));
  }catch(e){ return file; }
}
$('photo').addEventListener('change',async e=>{
  const f=e.target.files[0]; e.target.value='';
  if(!f) return;
  photoBlob=await shrink(f);
  if(photoURL) URL.revokeObjectURL(photoURL);
  photoURL=URL.createObjectURL(photoBlob);
  $('pimg').src=photoURL; $('pchip').hidden=false;
});
function clearPhoto(){ photoBlob=null; if(photoURL) URL.revokeObjectURL(photoURL); photoURL=null; $('pchip').hidden=true; }
$('pdel').addEventListener('click',clearPhoto);

async function ask(text){
  text=(text||'').trim();
  if(!ai || busy || (!text && !photoBlob)) return;
  if(!text) text='(photo)';
  busy=true; $('send').disabled=true;
  const img=photoBlob; clearPhoto();
  q.value=''; q.style.height='auto';
  chat.push({role:'user',content:text,step:cur,photo:!!img});
  const reply={role:'assistant',content:'',pending:true}; chat.push(reply);
  renderChat();
  const l=L();
  const msgs=chat.filter(m=>m.role!=='error' && !(m.role==='assistant' && m.pending)).map(m=> m.role==='user'
    ? {role:'user',content:`[${l.step} ${m.step}: ${stepText(m.step).title}] ${m.content}`}
    : {role:'assistant',content:m.content});
  for(let k=msgs.length-1;k>0;k--){ if(msgs[k].role===msgs[k-1].role){ msgs[k-1].content+='\n\n'+msgs[k].content; msgs.splice(k,1); } }
  if(msgs.length>19) msgs.splice(0,msgs.length-19); // el servidor acepta como máximo ~10 preguntas de historial
  msgs[0]={role:'user',content:guideContext()+'\n\n---\n\n'+msgs[0].content};
  ctrl=new AbortController();
  try{
    const opts={cache:false, signal:ctrl.signal, modelTier:'default', onText:({text:tx})=>{ reply.content=tx; renderChat(); }};
    if(img && canImages) opts.images=[img];
    const res=await ai.ask(msgs,opts);
    reply.content=res.text||reply.content; reply.pending=false;
  }catch(err){
    reply.pending=false;
    if(err && err.text){ reply.content=err.text; }
    else chat.splice(chat.indexOf(reply),1);
    if(err && err.name==='AbortError'){}
    else if(err && err.code==='not_granted'){ chat.push({role:'error',content:'errDenied'}); }
    else if(err && err.code==='rate_limited'){ chat.push({role:'error',content:'errRate'}); }
    else chat.push({role:'error',content:'errGen'});
  }
  busy=false; $('send').disabled=false; ctrl=null;
  renderChat();
}

/* Dónde vive la IA:
   1) Dentro de claude.ai (artifact): se usa la capacidad "sample" de Claude.
   2) En la web pública: se llama a nuestro propio servidor (/api/ask), que guarda la clave de Anthropic.
   Si no hay ninguna de las dos, el botón de ayuda no aparece y el resto funciona igual. */
const API_URL=document.querySelector('meta[name="ai-endpoint"]')?.content || '/api/ask';

function blobToBase64(blob){
  return new Promise((ok,ko)=>{ const r=new FileReader(); r.onload=()=>ok(String(r.result).split(',')[1]); r.onerror=ko; r.readAsDataURL(blob); });
}
async function apiAsk(msgs,{images,onText,signal}={}){
  const image = images && images[0] ? await blobToBase64(images[0]) : null;
  const r=await fetch(API_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:msgs,image}),signal});
  if(!r.ok || !r.body){
    const e=new Error('HTTP '+r.status);
    e.code = r.status===429 ? 'rate_limited' : (r.status===403||r.status===503) ? 'not_granted' : 'error';
    throw e;
  }
  const reader=r.body.getReader(), dec=new TextDecoder(); let text='';
  try{
    for(;;){ const {done,value}=await reader.read(); if(done) break; text+=dec.decode(value,{stream:true}); onText && onText({text}); }
  }catch(err){ err.text=text; throw err; }
  text+=dec.decode();
  if(!text.trim()){ const e=new Error('empty'); e.code='error'; throw e; }
  return {text};
}

(async()=>{
  try{
    if(window.claude && typeof window.claude.use==='function'){
      const s=await window.claude.use('sample');
      if(s){ let im=false; try{ im=!!(await s.limits())?.images; }catch(e){} ai={ask:(m,o)=>s(m,o), images:im}; }
    }
    if(!ai && location.protocol.startsWith('http')){
      const r=await fetch(API_URL,{method:'GET'});
      if(r.ok){ const j=await r.json(); if(j && j.ok) ai={ask:apiAsk, images:!!j.images}; }
    }
  }catch(e){}
  if(!ai) return;
  canImages=ai.images;
  $('photoLbl').hidden=!canImages;
  $('help').hidden=false;
  renderIntro();
})();

/* =================== Inicio =================== */
go(0,false);
applyLang();
tick();
