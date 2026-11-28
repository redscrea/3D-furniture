/* Portada: catálogo de muebles con buscador. */
import { T } from './i18n.js';
import { initialLang, saveLang } from './lang.js';
import { MODELS, CATS, thumbOf, sizeLabel } from '../models/index.js';
import { catalogIndex, search } from './search.js';

const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fill = (s, o) => s.replace(/\{(\w+)\}/g, (_, k) => o[k]);

let lang = initialLang();
const L = () => T[lang];
const url = new URL(location.href);
let query = url.searchParams.get('q') || '';
let cat = CATS.includes(url.searchParams.get('cat')) ? url.searchParams.get('cat') : '';

const index = catalogIndex(MODELS);

const ICON_PLACEHOLDER = {
  shelf: '<rect x="4" y="3" width="16" height="18" rx="1"/><path d="M4 9h16M4 15h16M12 3v18"/>',
  desk: '<path d="M3 9h18M5 9v11M19 9v11M13 9v6h6"/>',
  table: '<path d="M3 9h18M6 9v11M18 9v11"/>',
  wardrobe: '<rect x="5" y="2" width="14" height="20" rx="1"/><path d="M5 16h14M12 2v14M10 8v3M14 8v3M10 19h4"/>'
};
const placeholder = c => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON_PLACEHOLDER[c] || ICON_PLACEHOLDER.shelf}</svg>`;

function card(m) {
  const l = L();
  const href = `montaje.html?m=${encodeURIComponent(m.id)}&lang=${lang}`;
  const meta = [fill(l.cat.steps, { n: m.steps })];
  if (m.articles > 1) meta.push(fill(l.cat.articles, { n: m.articles }));
  const tag = m.articles > 1 ? `<span class="tag">${esc(l.cat.combo)}</span>` : `<span class="tag soft">${esc(l.catOne[m.cats[0]])}</span>`;
  return `<li><a class="mcard" href="${href}" data-id="${esc(m.id)}">
    <div class="thumb" data-cat="${m.cats[0]}"><img alt="" width="720" height="540" loading="lazy" decoding="async" data-src="${esc(thumbOf(m))}">${tag}</div>
    <div class="info">
      <h2>${esc(m.name)}</h2>
      <p class="sub">${esc(m.sub[lang])}</p>
      <p class="meta"><span class="size">${esc(sizeLabel(m))}</span>${meta.map(x => `<span>${esc(x)}</span>`).join('')}</p>
    </div>
    <span class="go" aria-hidden="true">${esc(l.cat.open)}</span>
  </a></li>`;
}

function render() {
  const l = L();
  const { results, partial } = search(index, query);
  const list = results.filter(m => !cat || m.cats.includes(cat));
  const grid = $('grid');
  grid.innerHTML = list.map(card).join('');
  // Miniaturas: si falta la imagen, se ve un dibujo sencillo del tipo de mueble.
  grid.querySelectorAll('img[data-src]').forEach(img => {
    img.addEventListener('error', () => { const box = img.parentElement; img.remove(); box.insertAdjacentHTML('afterbegin', placeholder(box.dataset.cat)); }, { once: true });
    img.src = img.dataset.src;
  });
  const q = query.trim();
  $('count').textContent = !list.length ? '' : partial ? fill(l.cat.partial, { q })
    : q ? fill(list.length === 1 ? l.cat.found1 : l.cat.found, { n: list.length, q })
    : fill(list.length === 1 ? l.cat.count1 : l.cat.count, { n: list.length });
  $('empty').hidden = list.length > 0;
  if (!list.length) {
    $('emptyTitle').textContent = fill(l.cat.noneTitle, { q });
    $('emptyText').textContent = l.cat.noneText;
  }
  // Filtros con el número de muebles de cada tipo (según la búsqueda actual).
  const counts = Object.fromEntries(CATS.map(c => [c, results.filter(m => m.cats.includes(c)).length]));
  $('cats').innerHTML = [['', l.cat.all, results.length], ...CATS.map(c => [c, l.cats[c], counts[c]])]
    .map(([c, label, n]) => `<button type="button" data-cat="${c}" aria-pressed="${c === cat}"${n || c === cat ? '' : ' disabled'}>${esc(label)} <span class="n">${n}</span></button>`).join('');
  syncUrl();
}

function syncUrl() {
  const u = new URL(location.href);
  query.trim() ? u.searchParams.set('q', query.trim()) : u.searchParams.delete('q');
  cat ? u.searchParams.set('cat', cat) : u.searchParams.delete('cat');
  if (u.searchParams.has('lang')) u.searchParams.set('lang', lang);
  if (u.href !== location.href) history.replaceState(null, '', u);
}

function applyLang() {
  const l = L();
  document.documentElement.lang = lang;
  document.title = l.cat.title;
  $('brand').innerHTML = l.brand;
  $('h1').textContent = l.cat.h1;
  $('lead').textContent = l.cat.lead;
  $('qLabel').textContent = l.cat.label;
  $('q').placeholder = l.cat.ph;
  $('q').title = l.cat.slash;
  $('cats').setAttribute('aria-label', l.cat.filters);
  $('showAll').textContent = l.cat.showAll;
  $('soon').textContent = l.cat.soon;
  $('foot').textContent = l.cat.footer;
  $('langs').setAttribute('aria-label', l.langLabel);
  document.querySelectorAll('#langs button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
  render();
}

/* =================== Eventos =================== */
const input = $('q');
input.value = query;
let timer = null;
input.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(() => { query = input.value; render(); }, 80); });
$('searchForm').addEventListener('submit', e => {
  e.preventDefault();
  query = input.value; render();
  const first = $('grid').querySelector('a.mcard');
  if (first && query.trim()) location.href = first.href;   // Intro abre el primer resultado
});
input.addEventListener('keydown', e => { if (e.key === 'Escape' && input.value) { e.preventDefault(); input.value = ''; query = ''; render(); } });
addEventListener('keydown', e => {
  if (e.key === '/' && !e.target.closest('input,textarea,[contenteditable]')) { e.preventDefault(); input.focus(); input.select(); }
});
$('cats').addEventListener('click', e => {
  const b = e.target.closest('button[data-cat]'); if (!b || b.disabled) return;
  cat = b.dataset.cat === cat ? '' : b.dataset.cat; render();
});
$('showAll').addEventListener('click', () => { query = ''; cat = ''; input.value = ''; render(); input.focus(); });
$('langs').addEventListener('click', e => {
  const b = e.target.closest('button[data-lang]'); if (!b) return;
  lang = b.dataset.lang; saveLang(lang); applyLang();
});

applyLang();
if (!matchMedia('(pointer:coarse)').matches && !query) input.focus({ preventScroll: true });
