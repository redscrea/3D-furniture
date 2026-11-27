/* Guía de montaje en 3D: motor común para todos los muebles.
   El mueble se elige con montaje.html?m=<id> (ver models/index.js).
   Cada mueble vive en su propio archivo de models/ y aporta piezas, pasos y textos;
   aquí están la escena, las animaciones, el panel de pasos y el chat de ayuda. */
import * as THREE from '../vendor/three/three.module.js';
import { OrbitControls } from '../vendor/three/OrbitControls.js';
import { T } from './i18n.js';
import { initialLang, saveLang } from './lang.js';
import { findModel, modelUrl } from '../models/index.js';

const $ = id => document.getElementById(id);
const qs = new URLSearchParams(location.search);
const SHOT = qs.has('miniatura');          // modo para hacer la miniatura del catálogo
let lang = initialLang();
const L = () => T[lang];
const fill = (s, o) => s.replace(/\{(\w+)\}/g, (_, k) => o[k]);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const stop = () => new Promise(() => {});  // detiene el resto del módulo

/* =================== Qué mueble =================== */
const entry = findModel(qs.get('m'));
if (!entry) {
  // Mueble desconocido: volvemos al catálogo buscando lo que pedía la dirección.
  const q = (qs.get('m') || '').replace(/[-_]+/g, ' ').trim();
  location.replace('./' + (q ? '?q=' + encodeURIComponent(q) : ''));
  await stop();
}
let model;
try { model = (await import(modelUrl(entry))).default; }
catch (err) {
  console.error(err);
  $('title').textContent = L().loadError;
  $('back').href = './';
  await stop();
}

/* =================== Medidas y colores =================== */
const COL = { wood: '#e9dfcb', white: '#f2f2ef', metal: '#a7adb4', dowel: '#cfa977', dark: '#4a5058', hl: '#ff6a13' };
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* =================== Escena =================== */
const stage = $('stage');
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: SHOT, preserveDrawingBuffer: SHOT });
renderer.setPixelRatio(SHOT ? 1 : Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
stage.prepend(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, 1, 1, 6000);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; controls.dampingFactor = .08;
controls.maxPolarAngle = Math.PI * 0.495;
controls.autoRotateSpeed = 0.7;

scene.add(new THREE.HemisphereLight(0xffffff, 0x8a8f99, 1.15));
const sun = new THREE.DirectionalLight(0xffffff, 1.7);
sun.position.set(240, 420, 300); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.normalBias = 0.6;
scene.add(sun);

const floorMat = SHOT ? new THREE.ShadowMaterial({ opacity: .16 }) : new THREE.MeshStandardMaterial({ roughness: 1 });
const floor = new THREE.Mesh(new THREE.PlaneGeometry(3000, 3000), floorMat);
floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
let grid;
const wallMat = new THREE.MeshStandardMaterial({ roughness: 1 });
const wall = new THREE.Mesh(new THREE.PlaneGeometry(800, 330), wallMat);
wall.position.set(0, 165, -1.6); wall.receiveShadow = true; scene.add(wall);

function applyTheme() {
  if (SHOT) { scene.background = null; return; }
  const cs = getComputedStyle(document.documentElement);
  const v = n => cs.getPropertyValue(n).trim();
  scene.background = new THREE.Color(v('--stage'));
  floorMat.color.set(v('--floor'));
  wallMat.color.set(v('--wall'));
  if (grid) scene.remove(grid);
  const dark = cs.colorScheme.includes('dark');
  grid = new THREE.GridHelper(1200, 48, dark ? 0x39424c : 0xc5cac2, dark ? 0x2c343d : 0xcfd3cb);
  grid.position.y = 0.05; scene.add(grid);
}
applyTheme();
new MutationObserver(applyTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);

/* =================== Geometría (herramientas para los modelos) =================== */
const edgeMat = new THREE.LineBasicMaterial({ color: 0x26303a, transparent: true, opacity: .42 });
function mat(color, metal) { return new THREE.MeshStandardMaterial({ color, roughness: metal ? .38 : .78, metalness: metal ? .55 : 0 }); }
/** Caja entre dos esquinas [x,y,z] (cm). */
function box(min, max, color, opts = {}) {
  const s = [max[0] - min[0], max[1] - min[1], max[2] - min[2]];
  const g = new THREE.BoxGeometry(...s);
  const m = new THREE.Mesh(g, mat(color, opts.metal));
  m.position.set((min[0] + max[0]) / 2, (min[1] + max[1]) / 2, (min[2] + max[2]) / 2);
  if (opts.edges !== false) m.add(new THREE.LineSegments(new THREE.EdgesGeometry(g), edgeMat));
  return m;
}
/** Cilindro de radio r y largo h, centrado en pos, a lo largo del eje indicado. */
function cyl(r, h, color, pos, axis = 'y', metal = false, edges = false) {
  const g = new THREE.CylinderGeometry(r, r, h, 24);
  const m = new THREE.Mesh(g, mat(color, metal));
  if (axis === 'x') m.rotation.z = Math.PI / 2;
  if (axis === 'z') m.rotation.x = Math.PI / 2;
  m.position.set(...pos);
  if (edges) m.add(new THREE.LineSegments(new THREE.EdgesGeometry(g, 30), edgeMat));
  return m;
}
function group(...objs) { const g = new THREE.Group(); objs.forEach(o => g.add(o)); return g; }
/** Grupo colocado en pos; sus piezas se dibujan con coordenadas relativas a ese punto (útil para piezas que giran). */
function at(pos, ...objs) { const g = group(...objs); g.position.set(...pos); return g; }

/* =================== Piezas y subconjuntos =================== */
const parts = []; const pickables = []; const assemblies = [];
/**
 * Añade una pieza al montaje.
 *  key/n   nombre de la pieza (texto pn[key] del modelo; {n} se sustituye por n)
 *  step    paso en el que aparece; sub = orden dentro del paso (las piezas entran escalonadas)
 *  enter   desde dónde entra (desplazamiento en cm)
 *  parent  un subconjunto creado con assembly(), si la pieza va dentro de él
 *  tag/reEnter  para volver a animar la pieza en un paso posterior (paso con reanimate: tag)
 *  zx      cuánto se separa hacia delante en la vista explotada; explode = desplazamiento exacto (opcional)
 *  spin    vueltas que da sobre su eje al entrar (tornillos, patas que se enroscan)
 */
function addPart({ key, n, obj, parent = scene, step, sub = 0, enter = [0, 0, 0], tag = null, reEnter = [0, 0, 0], zx = 0, explode = null, spin = 0 }) {
  const asm = assemblies.find(a => a.group === parent) || null;
  parent.add(obj);
  const p = { key, n, obj, step, sub, tag, asm, spin, rot0: obj.rotation.y,
    enter: new THREE.Vector3(...enter), reEnter: new THREE.Vector3(...reEnter), final: obj.position.clone(),
    explode: explode ? new THREE.Vector3(...explode) : null, zx, meshes: [], anim: null };
  obj.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; o.userData.base = o.material.color.clone(); o.userData.part = p; p.meshes.push(o); pickables.push(o); } });
  parts.push(p); return p;
}
/**
 * Subconjunto que se monta aparte y luego se mueve a su sitio (por ejemplo, un tablero
 * boca abajo que se gira). Antes de moveStep está en «staged»; en moveStep viaja con una
 * animación (arc = cuánto sube por el camino); después queda en «final».
 * Poses: { p:[x,y,z], r:[giroX,giroY,giroZ] } en radianes.
 */
function assembly({ staged, final, moveStep, arc = 60 }) {
  const pose = o => ({ p: new THREE.Vector3(...o.p), q: new THREE.Quaternion().setFromEuler(new THREE.Euler(...(o.r || [0, 0, 0]))) });
  const a = { group: new THREE.Group(), staged: pose(staged), final: pose(final), moveStep, arc, tween: null };
  scene.add(a.group); assemblies.push(a);
  return a.group;
}

const built = model.build({ THREE, COL, box, cyl, group, at, addPart, assembly }, entry.params || {});
const STEPS = built.steps;
const LAST = STEPS.length - 1;
const ICON_EXTRA = built.icons || {};

/* Tamaño del mueble: ajusta cámara, sombras y vista explotada. */
const B = Object.assign({ w: 100, h: 100, d: 50, cx: 0 }, built.bounds);
const maxDim = Math.max(B.w, B.h, B.d);
controls.minDistance = Math.max(30, maxDim * .27);
controls.maxDistance = Math.max(500, maxDim * 6);
const sh = Math.max(320, maxDim * 1.75);
Object.assign(sun.shadow.camera, { left: -sh, right: sh, top: sh, bottom: -sh, near: 50, far: 1400 });
wall.visible = !SHOT && built.wall !== false;

for (const p of parts) {
  if (p.explode) continue;
  if (p.asm) { p.explode = new THREE.Vector3(0, 10, p.zx || 40); continue; }
  const c = new THREE.Box3().setFromObject(p.obj).getCenter(new THREE.Vector3());
  p.explode = new THREE.Vector3((c.x - B.cx) * .32, (c.y - B.h / 2) * .48, p.zx);
}

const M = () => built.texts[lang] || built.texts.es;
const hwName = k => (M().hw && M().hw[k]) || L().hw[k] || k;
const partName = p => fill(M().pn[p.key] || p.key, { n: p.n });
const stepText = i => { const [title, text, tip, warn] = M().steps[i]; return { title, text, tip, warn }; };

/* =================== Iconos =================== */
const ICON = {
 espiga: '<rect x="9" y="3" width="6" height="18" rx="3"/><path d="M9 8h6M9 12h6M9 16h6"/>',
 tornillo: '<path d="M7 4h10l-2 3H9z"/><path d="M12 7v14"/><path d="M10 10l4 1.5M10 13.5l4 1.5M10 17l4 1.5"/>',
 tornilloDoble: '<path d="M12 2v20"/><path d="M10 4l4 1.5M10 7l4 1.5M10 15.5l4 1.5M10 18.5l4 1.5"/>',
 allen: '<path d="M7 3v13a3 3 0 0 0 3 3h10" stroke-width="2.6"/>',
 escuadra: '<path d="M6 4v14h14v-3.5H9.5V4z"/>',
 destornillador: '<path d="M14 3l7 7-3.5 3.5-7-7z"/><path d="M10.5 10.5L4 17v3h3l6.5-6.5"/>',
 nivel: '<rect x="2" y="8" width="20" height="8" rx="2"/><rect x="9" y="10" width="6" height="4" rx="2"/>',
 taladro: '<path d="M3 6h12v6H3z"/><path d="M15 8h6"/><path d="M7 12l-1 8h4l1-8"/>',
 personas: '<circle cx="8" cy="7" r="3"/><circle cx="16" cy="7" r="3"/><path d="M3 20c0-4 2-6 5-6s5 2 5 6M11 20c0-4 2-6 5-6s5 2 5 6"/>',
 carton: '<path d="M3 8l9-4 9 4-9 4z"/><path d="M3 8v8l9 4 9-4V8"/>',
 tablero: '<path d="M2 11l6-4h14l-6 4z"/><path d="M2 11v3h14v-3M16 14l6-4V7"/>',
 pata: '<ellipse cx="12" cy="5" rx="6" ry="2"/><path d="M10 6v14h4V6"/>',
 rail: '<path d="M3 10h18v4H3z"/><path d="M3 7v10M21 7v10"/>',
 arandela: '<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2.5"/>',
 panel: '<rect x="3" y="9" width="18" height="6" rx="1"/>',
 separador: '<rect x="9" y="4" width="6" height="16" rx="1"/>',
 placa: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="6.5" r=".9"/><circle cx="17" cy="14.5" r=".9"/><circle cx="7" cy="14.5" r=".9"/>',
 ...ICON_EXTRA
};
const svg = k => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[k] || ''}</svg>`;
const ICO_TIP = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/></svg>';
const ICO_WARN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.5"/></svg>';

/* =================== Panel e idioma =================== */
const stepsNav = $('steps');
stepsNav.addEventListener('click', e => { const b = e.target.closest('button[data-step]'); if (b) { stopPlay(); go(+b.dataset.step); } });
function buildList() {
  let html = '', last = '';
  STEPS.forEach((s, i) => {
    if (s.sec !== last) { if (last) html += '</ol>'; html += `<h2>${esc(M().sec[s.sec])}</h2><ol>`; last = s.sec; }
    html += `<li><button type="button" data-step="${i}"><span class="n">${String(i).padStart(2, '0')}</span><span>${esc(stepText(i).title)}</span></button></li>`;
  });
  stepsNav.innerHTML = html + '</ol>';
  stepsNav.setAttribute('aria-label', L().stepsNav);
}
function applyLang() {
  const l = L(), m = M();
  document.documentElement.lang = lang;
  document.title = m.title;
  $('brand').innerHTML = l.brand;
  document.querySelectorAll('[data-i]').forEach(el => { const k = el.dataset.i; if (typeof l[k] === 'string') el.textContent = l[k]; });
  document.querySelectorAll('#langs button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
  $('langs').setAttribute('aria-label', l.langLabel);
  $('chips').innerHTML = m.chips.map(([b, t]) => `<span class="chip"><b>${esc(b)}</b> <span>${esc(t)}</span></span>`).join('');
  $('footer').textContent = m.footer;
  $('back').href = './?lang=' + lang;
  $('brand').href = './?lang=' + lang;
  stage.setAttribute('aria-label', l.stage);
  $('prev').textContent = l.prev; $('prev').setAttribute('aria-label', l.prevAria);
  $('chatClose').setAttribute('aria-label', l.close);
  $('q').placeholder = l.placeholder;
  $('photoTxt').textContent = l.photo; $('photoLbl').title = l.photo;
  $('of').textContent = '/ ' + LAST;
  setPlayLabel();
  buildList(); renderPanel(); renderChat();
}
$('langs').addEventListener('click', e => {
  const b = e.target.closest('button[data-lang]'); if (!b) return;
  lang = b.dataset.lang; saveLang(lang);
  const u = new URL(location.href); if (u.searchParams.has('lang')) { u.searchParams.set('lang', lang); history.replaceState(null, '', u); }
  applyLang();
});
// «Todos los muebles»: si venimos del buscador, volvemos atrás para conservar la búsqueda.
$('back').addEventListener('click', e => {
  try {
    const r = new URL(document.referrer);
    if (r.origin === location.origin && !/montaje\.html$/.test(r.pathname) && history.length > 1) { e.preventDefault(); history.back(); }
  } catch (err) {}
});

function renderPanel() {
  const s = STEPS[cur], x = stepText(cur), l = L(), m = M();
  $('sec').textContent = m.sec[s.sec];
  $('num').textContent = String(cur).padStart(2, '0');
  $('title').textContent = x.title;
  $('text').textContent = x.text;
  $('need').hidden = !s.hw.length;
  $('hw').innerHTML = s.hw.map(([ic, k, q]) => `<li>${svg(ic)}<span>${esc(hwName(k))}</span>${q ? `<span class="q">×${q}</span>` : ''}</li>`).join('');
  let c = '';
  if (x.warn) c += `<div class="callout warn">${ICO_WARN}<span>${esc(x.warn)}</span></div>`;
  if (x.tip) c += `<div class="callout tip">${ICO_TIP}<span>${esc(x.tip)}</span></div>`;
  $('callouts').innerHTML = c;
  $('prev').disabled = cur === 0;
  $('next').textContent = cur === 0 ? l.start : cur === LAST ? l.restart : l.next;
  $('bar').style.width = (cur / LAST * 100) + '%';
  stepsNav.querySelectorAll('button[data-step]').forEach(b => { const i = +b.dataset.step; b.removeAttribute('aria-current'); if (i === cur) b.setAttribute('aria-current', 'step'); b.classList.toggle('done', i < cur); });
  const curBtn = stepsNav.querySelector('[aria-current="step"]'); if (curBtn && matchMedia('(min-width:861px)').matches) curBtn.scrollIntoView({ block: 'nearest' });
  $('chatStep').textContent = `${l.step} ${cur} · ${x.title}`;
}

/* =================== Animación =================== */
const DUR = reduced ? 0 : .85, STAG = reduced ? 0 : .17;
const ease = u => 1 - Math.pow(1 - u, 3);
const easeIO = u => u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
let cur = 0, camTween = null;
const HL = new THREE.Color(COL.hl), EM = new THREE.Color('#4a1600'), BLACK = new THREE.Color(0);
function setHL(p, on) { for (const m of p.meshes) { m.material.color.copy(on ? HL : m.userData.base); m.material.emissive.copy(on ? EM : BLACK); } }
function setPose(a, pose) { a.group.position.copy(pose.p); a.group.quaternion.copy(pose.q); }

function go(i, animate = true) {
  cur = Math.max(0, Math.min(LAST, i));
  const s = STEPS[cur], mode = s.mode, now = performance.now() / 1000;
  for (const p of parts) {
    const target = p.final.clone(); let from = null, delay = 0, hl = false, vis;
    if (mode) { vis = true; if (mode === 'explode') target.add(p.explode); if (animate) from = p.obj.visible ? p.obj.position.clone() : target.clone(); }
    else {
      vis = p.step <= cur;
      if (p.step === cur) { hl = true; if (animate) { from = p.final.clone().add(p.enter); delay = p.sub * STAG; } }
      if (s.reanimate && p.tag === s.reanimate) { hl = true; if (animate) { from = p.final.clone().add(p.reEnter); delay = p.sub * STAG * .5; } }
      if (p.asm && cur === p.asm.moveStep) hl = true;
    }
    p.obj.visible = vis;
    p.obj.rotation.y = p.rot0;
    if (from && DUR > 0) { p.obj.position.copy(from); p.anim = { from, to: target, t0: now + delay, dur: DUR, spin: mode ? 0 : p.spin }; }
    else { p.obj.position.copy(target); p.anim = null; }
    setHL(p, hl);
  }
  for (const a of assemblies) {
    a.tween = null;
    if (!mode && cur === a.moveStep && animate && DUR > 0) { setPose(a, a.staged); a.tween = { t0: now + .2, dur: 1.9 }; }
    else setPose(a, mode || cur >= a.moveStep ? a.final : a.staged);
  }
  controls.autoRotate = mode === 'final' && !reduced && !SHOT;
  tweenCam(s.cam, animate);
  renderPanel();
  if (!$('chat').hidden) renderIntro();
}
function tweenCam(c, animate = true) {
  const toP = new THREE.Vector3(c[0], c[1], c[2]), toT = new THREE.Vector3(c[3], c[4], c[5]);
  if (!animate || reduced) { camera.position.copy(toP); controls.target.copy(toT); camTween = null; return; }
  camTween = { fromP: camera.position.clone(), fromT: controls.target.clone(), toP, toT, t0: performance.now() / 1000, dur: 1.25 };
}
controls.addEventListener('start', () => { camTween = null; controls.autoRotate = false; });

function resize() { const r = stage.getBoundingClientRect(); renderer.setSize(r.width, r.height, false); camera.aspect = r.width / Math.max(1, r.height); camera.updateProjectionMatrix(); }
new ResizeObserver(resize).observe(stage); resize();

function tick() {
  const now = performance.now() / 1000;
  for (const p of parts) {
    if (!p.anim) continue;
    const u = Math.min(1, Math.max(0, (now - p.anim.t0) / p.anim.dur)), e = ease(u);
    p.obj.position.lerpVectors(p.anim.from, p.anim.to, e);
    if (p.anim.spin) p.obj.rotation.y = p.rot0 + (1 - e) * p.anim.spin * Math.PI * 2;
    if (u >= 1) { p.anim = null; p.obj.rotation.y = p.rot0; }
  }
  for (const a of assemblies) {
    if (!a.tween) continue;
    const u = Math.min(1, Math.max(0, (now - a.tween.t0) / a.tween.dur)), e = easeIO(u);
    a.group.position.lerpVectors(a.staged.p, a.final.p, e); a.group.position.y += Math.sin(Math.PI * e) * a.arc;
    a.group.quaternion.slerpQuaternions(a.staged.q, a.final.q, e);
    if (u >= 1) a.tween = null;
  }
  if (camTween) {
    const u = Math.min(1, (now - camTween.t0) / camTween.dur), e = easeIO(u);
    camera.position.lerpVectors(camTween.fromP, camTween.toP, e);
    controls.target.lerpVectors(camTween.fromT, camTween.toT, e);
    if (u >= 1) camTween = null;
  }
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}

/* =================== Nombre de la pieza =================== */
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), tipEl = $('tip');
let downAt = null, tipTimer = null;
function pick(ev) {
  const r = renderer.domElement.getBoundingClientRect();
  ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  const hit = ray.intersectObjects(pickables.filter(m => m.userData.part.obj.visible), false)[0];
  return hit ? { p: hit.object.userData.part, x: ev.clientX - r.left, y: ev.clientY - r.top } : null;
}
function showTip(h) { if (!h) { tipEl.style.opacity = 0; return; } tipEl.textContent = partName(h.p); tipEl.style.left = h.x + 'px'; tipEl.style.top = h.y + 'px'; tipEl.style.opacity = 1; }
renderer.domElement.addEventListener('pointermove', ev => { if (ev.pointerType === 'mouse' && !ev.buttons) showTip(pick(ev)); });
renderer.domElement.addEventListener('pointerleave', () => showTip(null));
renderer.domElement.addEventListener('pointerdown', ev => { downAt = [ev.clientX, ev.clientY]; });
renderer.domElement.addEventListener('pointerup', ev => {
  if (!downAt || Math.hypot(ev.clientX - downAt[0], ev.clientY - downAt[1]) > 6) return;
  const h = pick(ev); showTip(h); clearTimeout(tipTimer); if (ev.pointerType !== 'mouse') tipTimer = setTimeout(() => showTip(null), 2200);
});

/* =================== Controles =================== */
let playTimer = null;
function setPlayLabel() { const on = !!playTimer; $('play').textContent = on ? '❚❚' : '▶'; $('play').setAttribute('aria-pressed', String(on)); $('play').title = on ? L().pause : L().play; $('play').setAttribute('aria-label', $('play').title); }
function stopPlay() { clearInterval(playTimer); playTimer = null; setPlayLabel(); }
$('play').addEventListener('click', () => {
  if (playTimer) { stopPlay(); return; }
  if (cur === LAST) go(0);
  playTimer = setInterval(() => { if (cur >= LAST) { stopPlay(); return; } go(cur + 1); }, 5200);
  setPlayLabel();
});
$('next').addEventListener('click', () => { stopPlay(); go(cur === LAST ? 0 : cur + 1); });
$('prev').addEventListener('click', () => { stopPlay(); go(cur - 1); });
$('replay').addEventListener('click', () => go(cur));
$('recenter').addEventListener('click', () => tweenCam(STEPS[cur].cam));
addEventListener('keydown', e => {
  if (e.target.closest('input,textarea,[contenteditable]')) return;
  if (e.key === 'Escape' && !$('chat').hidden) { closeChat(); return; }
  if (e.key === 'ArrowRight') { stopPlay(); if (cur < LAST) go(cur + 1); }
  if (e.key === 'ArrowLeft') { stopPlay(); if (cur > 0) go(cur - 1); }
});

/* =================== Ayuda con IA =================== */
let ai = null, canImages = false, busy = false, ctrl = null, photoBlob = null, photoURL = null;
const chat = []; // {role:'user'|'assistant'|'error', content, step, photo}
const log = $('log');

function guideContext() {
  const l = L(), m = M();
  const lines = STEPS.map((s, i) => { const x = stepText(i); return `${i}. [${m.sec[s.sec]}] ${x.title}: ${x.text}${x.tip ? ' (Tip: ' + x.tip + ')' : ''}${x.warn ? ' (Warning: ' + x.warn + ')' : ''}${s.hw.length ? ' — Needs: ' + s.hw.map(([, k, q]) => (q ? q + '× ' : '') + hwName(k)).join(', ') : ''}`; }).join('\n');
  const notes = (built.ai.notes || []).map(n => '- ' + n).join('\n');
  return `You are the assembly helper inside a 3D step-by-step assembly guide (a web app). The person is assembling:
${built.ai.about}

The guide's steps (in the person's language):
${lines}

Rules:
- Answer in ${l.langName}, unless the person writes in another language; then answer in theirs.
- Be short and concrete: 2–6 sentences or a short list. Refer to the step numbers of this guide when useful.
${notes}
- If you are not sure (exact part numbers, hardware counts, anything not covered above), say so plainly and suggest checking the paper manual or IKEA customer service. Never invent part numbers or quantities.
- If a photo is attached, say briefly what you see that matters and help from there. If the photo is unclear, ask for a closer one.
- If the question is unrelated to assembling this furniture, answer in one sentence and steer back to the assembly.
- Plain text. You may use short "- " bullet lines and **bold** for key words. No headings.`;
}
function fmt(text) {
  const lines = esc(text).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').split(/\n/);
  let html = '', inList = false, para = [];
  const flush = () => { if (para.length) { html += `<p>${para.join('<br>')}</p>`; para = []; } };
  for (const ln of lines) {
    const m = ln.match(/^\s*(?:[-•*]|\d+[.)])\s+(.*)$/);
    if (m) { flush(); if (!inList) { html += '<ul>'; inList = true; } html += `<li>${m[1]}</li>`; }
    else { if (inList) { html += '</ul>'; inList = false; } if (ln.trim() === '') flush(); else para.push(ln); }
  }
  flush(); if (inList) html += '</ul>';
  return html || '<p></p>';
}
function renderIntro() {
  const l = L(); const intro = log.querySelector('.intro');
  if (intro) intro.textContent = fill(canImages ? l.intro : l.introNoPhoto, { n: cur });
}
function renderChat() {
  const l = L();
  let html = `<p class="intro"></p>`;
  if (!chat.length) html += `<div class="sugs">${l.sugs.map(s => `<button type="button">${esc(s)}</button>`).join('')}</div>`;
  for (const m of chat) {
    if (m.role === 'user') html += `<div class="msg user">${fmt(m.content)}${m.photo ? `<span class="ph">${esc(l.photoSent)}</span>` : ''}</div>`;
    else if (m.role === 'assistant') html += `<div class="msg ai${m.pending ? ' pending' : ''}">${m.pending && !m.content ? `<p>${esc(l.thinking)}</p>` : fmt(m.content)}</div>`;
    else html += `<div class="msg err"><p>${esc(l[m.content] || m.content)}</p></div>`;
  }
  log.innerHTML = html;
  renderIntro();
  log.scrollTop = log.scrollHeight;
}
log.addEventListener('click', e => { const b = e.target.closest('.sugs button'); if (b) ask(b.textContent); });

function openChat() { $('chat').hidden = false; renderPanel(); renderChat(); setTimeout(() => $('q').focus(), 30); }
function closeChat() { $('chat').hidden = true; $('askAi').focus(); }
$('askAi').addEventListener('click', openChat);
$('chatClose').addEventListener('click', closeChat);
$('chat').addEventListener('keydown', e => { if (e.key === 'Escape') { e.preventDefault(); closeChat(); } });

const q = $('q');
q.addEventListener('input', () => { q.style.height = 'auto'; q.style.height = Math.min(130, q.scrollHeight) + 'px'; });
q.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); $('chatForm').requestSubmit(); } });
$('chatForm').addEventListener('submit', e => { e.preventDefault(); ask(q.value); });

async function shrink(file) {
  try {
    const bmp = await createImageBitmap(file);
    const sc = Math.min(1, 1280 / Math.max(bmp.width, bmp.height));
    const cv = document.createElement('canvas'); cv.width = Math.round(bmp.width * sc); cv.height = Math.round(bmp.height * sc);
    cv.getContext('2d').drawImage(bmp, 0, 0, cv.width, cv.height);
    return await new Promise(r => cv.toBlob(b => r(b || file), 'image/jpeg', .85));
  } catch (e) { return file; }
}
$('photo').addEventListener('change', async e => {
  const f = e.target.files[0]; e.target.value = '';
  if (!f) return;
  photoBlob = await shrink(f);
  if (photoURL) URL.revokeObjectURL(photoURL);
  photoURL = URL.createObjectURL(photoBlob);
  $('pimg').src = photoURL; $('pchip').hidden = false;
});
function clearPhoto() { photoBlob = null; if (photoURL) URL.revokeObjectURL(photoURL); photoURL = null; $('pchip').hidden = true; }
$('pdel').addEventListener('click', clearPhoto);

async function ask(text) {
  text = (text || '').trim();
  if (!ai || busy || (!text && !photoBlob)) return;
  if (!text) text = '(photo)';
  busy = true; $('send').disabled = true;
  const img = photoBlob; clearPhoto();
  q.value = ''; q.style.height = 'auto';
  chat.push({ role: 'user', content: text, step: cur, photo: !!img });
  const reply = { role: 'assistant', content: '', pending: true }; chat.push(reply);
  renderChat();
  const l = L();
  const msgs = chat.filter(m => m.role !== 'error' && !(m.role === 'assistant' && m.pending)).map(m => m.role === 'user'
    ? { role: 'user', content: `[${l.step} ${m.step}: ${stepText(m.step).title}] ${m.content}` }
    : { role: 'assistant', content: m.content });
  for (let k = msgs.length - 1; k > 0; k--) { if (msgs[k].role === msgs[k - 1].role) { msgs[k - 1].content += '\n\n' + msgs[k].content; msgs.splice(k, 1); } }
  if (msgs.length > 19) msgs.splice(0, msgs.length - 19); // el servidor acepta como máximo ~10 preguntas de historial
  msgs[0] = { role: 'user', content: guideContext() + '\n\n---\n\n' + msgs[0].content };
  ctrl = new AbortController();
  try {
    const opts = { cache: false, signal: ctrl.signal, modelTier: 'default', onText: ({ text: tx }) => { reply.content = tx; renderChat(); } };
    if (img && canImages) opts.images = [img];
    const res = await ai.ask(msgs, opts);
    reply.content = res.text || reply.content; reply.pending = false;
  } catch (err) {
    reply.pending = false;
    if (err && err.text) { reply.content = err.text; }
    else chat.splice(chat.indexOf(reply), 1);
    if (err && err.name === 'AbortError') {}
    else if (err && err.code === 'not_granted') { chat.push({ role: 'error', content: 'errDenied' }); }
    else if (err && err.code === 'rate_limited') { chat.push({ role: 'error', content: 'errRate' }); }
    else chat.push({ role: 'error', content: 'errGen' });
  }
  busy = false; $('send').disabled = false; ctrl = null;
  renderChat();
}

/* Dónde vive la IA:
   1) Dentro de claude.ai (artifact): se usa la capacidad "sample" de Claude.
   2) En la web pública: se llama a nuestro propio servidor (/api/ask), que guarda la clave de Anthropic.
   Si no hay ninguna de las dos, el botón de ayuda no aparece y el resto funciona igual. */
const API_URL = document.querySelector('meta[name="ai-endpoint"]')?.content || '/api/ask';

function blobToBase64(blob) {
  return new Promise((ok, ko) => { const r = new FileReader(); r.onload = () => ok(String(r.result).split(',')[1]); r.onerror = ko; r.readAsDataURL(blob); });
}
async function apiAsk(msgs, { images, onText, signal } = {}) {
  const image = images && images[0] ? await blobToBase64(images[0]) : null;
  const r = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: msgs, image }), signal });
  if (!r.ok || !r.body) {
    const e = new Error('HTTP ' + r.status);
    e.code = r.status === 429 ? 'rate_limited' : (r.status === 403 || r.status === 503) ? 'not_granted' : 'error';
    throw e;
  }
  const reader = r.body.getReader(), dec = new TextDecoder(); let text = '';
  try {
    for (;;) { const { done, value } = await reader.read(); if (done) break; text += dec.decode(value, { stream: true }); onText && onText({ text }); }
  } catch (err) { err.text = text; throw err; }
  text += dec.decode();
  if (!text.trim()) { const e = new Error('empty'); e.code = 'error'; throw e; }
  return { text };
}

if (!SHOT) (async () => {
  try {
    if (window.claude && typeof window.claude.use === 'function') {
      const s = await window.claude.use('sample');
      if (s) { let im = false; try { im = !!(await s.limits())?.images; } catch (e) {} ai = { ask: (m, o) => s(m, o), images: im }; }
    }
    if (!ai && location.protocol.startsWith('http')) {
      const r = await fetch(API_URL, { method: 'GET' });
      if (r.ok) { const j = await r.json(); if (j && j.ok) ai = { ask: apiAsk, images: !!j.images }; }
    }
  } catch (e) {}
  if (!ai) return;
  canImages = ai.images;
  $('photoLbl').hidden = !canImages;
  $('help').hidden = false;
  renderIntro();
})();

/* =================== Miniatura para el catálogo =================== */
/* montaje.html?m=<id>&miniatura=1 muestra el mueble terminado sin fondo y un botón para
   descargar la imagen. Guárdala como img/miniaturas/<id>.webp (ver README). */
function snapshot(type = 'image/webp', quality = .86) {
  renderer.render(scene, camera);
  return renderer.domElement.toDataURL(type, quality);
}
if (SHOT) {
  document.body.classList.add('shot');
  $('shotSave').hidden = false;
  $('shotSave').addEventListener('click', () => {
    const url = snapshot();
    const ext = url.startsWith('data:image/webp') ? 'webp' : 'png';
    const a = document.createElement('a'); a.href = url; a.download = `${entry.id}.${ext}`; a.click();
  });
  window.__miniatura = snapshot;
}

/** Encuadre automático del mueble terminado (para la miniatura). */
function fitCam(dir = [.55, .42, .85], margin = .98) {
  scene.updateMatrixWorld(true);
  const box = new THREE.Box3(); for (const p of parts) if (p.obj.visible) box.expandByObject(p.obj);
  const sphere = box.getBoundingSphere(new THREE.Sphere());
  const vf = camera.fov * Math.PI / 180, hf = 2 * Math.atan(Math.tan(vf / 2) * camera.aspect);
  const d = new THREE.Vector3(...dir).normalize().multiplyScalar(sphere.radius / Math.sin(Math.min(vf, hf) / 2) * margin);
  const c = sphere.center;
  return [c.x + d.x, c.y + d.y, c.z + d.z, c.x, c.y, c.z];
}

/* =================== Inicio =================== */
document.body.dataset.model = entry.id;
go(0, false);
if (SHOT) { resize(); tweenCam(built.thumbCam || fitCam(), false); }
applyLang();
tick();
