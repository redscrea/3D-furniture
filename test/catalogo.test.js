// Comprueba el catálogo, cada mueble y el buscador, sin navegador.
// Ejecutar con: npm run test:catalogo
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { MODELS, CATS, modelUrl, thumbOf } from '../models/index.js';
import { T, LANGS } from '../js/i18n.js';
import { catalogIndex, search, norm } from '../js/search.js';

let fails = 0;
const check = (name, fn) => { try { fn(); console.log('✓', name); } catch (e) { fails++; console.log('✗', name, '\n   ', e.message); } };

/* Un «ctx» de mentira: los modelos solo necesitan crear piezas, no dibujarlas. */
function fakeCtx() {
  const parts = [], assemblies = [];
  const obj = () => ({ add() {}, position: { set() {} }, rotation: {} });
  return {
    parts, assemblies,
    ctx: {
      COL: new Proxy({}, { get: () => '#000' }),
      box: obj, cyl: obj, group: obj, at: obj,
      addPart: p => { parts.push(p); return p; },
      assembly: a => { assemblies.push(a); const g = obj(); g.isAssembly = true; return g; }
    }
  };
}

check('cada mueble tiene un id único', () => {
  const ids = MODELS.map(m => m.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const id of ids) assert.match(id, /^[a-z0-9-]+$/, `id no válido: ${id}`);
});

for (const m of MODELS) {
  const { default: model } = await import(modelUrl(m));
  check(`${m.id}: datos del catálogo`, () => {
    assert.ok(m.cats.length && m.cats.every(c => CATS.includes(c)), 'cats');
    for (const l of LANGS) assert.ok(m.sub[l], `falta sub.${l}`);
    assert.ok(m.size && m.size.w && m.size.h, 'size');
  });
  check(`${m.id}: pasos, textos y piezas`, () => {
    const { ctx, parts, assemblies } = fakeCtx();
    const b = model.build(ctx, m.params || {});
    assert.equal(b.steps.length - 1, m.steps, `el catálogo dice ${m.steps} pasos y el modelo tiene ${b.steps.length - 1}: corrige «steps» en models/index.js`);
    assert.ok(b.ai && b.ai.about, 'falta ai.about');
    for (const l of LANGS) {
      const t = b.texts[l];
      assert.ok(t, `faltan los textos en ${l}`);
      assert.equal(t.steps.length, b.steps.length, `${l}: hay ${t.steps.length} textos para ${b.steps.length} pasos`);
      t.steps.forEach((s, i) => assert.ok(s && s[0] && s[1], `${l}: el paso ${i} no tiene título o texto`));
      assert.ok(t.title && t.footer && t.chips && t.chips.length, `${l}: title, footer o chips`);
      for (const s of b.steps) {
        assert.ok(t.sec[s.sec], `${l}: falta sec.${s.sec}`);
        for (const [, k] of s.hw) assert.ok((t.hw && t.hw[k]) || T[l].hw[k], `${l}: falta el texto del herraje «${k}»`);
        assert.ok(Array.isArray(s.cam) && s.cam.length === 6 && s.cam.every(Number.isFinite), 'cámara no válida');
      }
      for (const p of parts) assert.ok(t.pn[p.key], `${l}: falta el nombre de la pieza «${p.key}»`);
    }
    assert.ok(parts.length > 0, 'no hay piezas');
    for (const p of parts) assert.ok(p.step >= 0 && p.step < b.steps.length && !b.steps[p.step].mode, `la pieza ${p.key} aparece en un paso que no existe o no es de montaje (${p.step})`);
    for (const a of assemblies) assert.ok(a.moveStep > 0 && a.moveStep < b.steps.length, 'moveStep fuera de rango');
    if (!fs.existsSync(new URL('../' + thumbOf(m), import.meta.url))) console.log(`   (aviso: falta la miniatura ${thumbOf(m)}; el catálogo mostrará un dibujo genérico)`);
  });
}

const index = catalogIndex(MODELS);
const ids = q => search(index, q).results.map(m => m.id);
check('buscador: normaliza acentos, mayúsculas y medidas', () => {
  assert.equal(norm('INLÄGG'), 'inlagg');
  assert.equal(norm('77 × 147'), '77x147');
  assert.equal(norm('Étagère'), 'etagere');
});
check('buscador: por nombre, con errata', () => {
  assert.ok(ids('kallax').length >= 6);
  assert.deepEqual(ids('kalax'), ids('kallax'));
  assert.ok(ids('lack').includes('lack-mesa-auxiliar'));
});
check('buscador: por medida', () => {
  assert.equal(ids('77x147')[0], 'kallax-2x4');
  assert.equal(ids('147 x 77')[0], 'kallax-2x4');
  assert.equal(ids('kallax 2x2')[0], 'kallax-2x2');
});
check('buscador: por tipo de mueble en cualquier idioma', () => {
  for (const q of ['estantería', 'étagère', 'bookcase', 'boekenkast']) assert.ok(ids(q).includes('kallax-4x4'), q);
  for (const q of ['escritorio', 'desk', 'bureau']) assert.equal(ids(q)[0], 'kallax-escritorio', q);
  for (const q of ['mesa', 'side table', 'bijzettafel']) assert.equal(ids(q)[0], 'lack-mesa-auxiliar', q);
});
check('buscador: armarios', () => {
  for (const q of ['armario', 'ropero', 'wardrobe', 'armoire', 'kledingkast', 'ankarudden', 'ankarrudden', 'puertas correderas', '98x190', '98 x 60 x 190', '506.262.50'])
    assert.equal(ids(q)[0], 'ankarudden-armario', q);
  assert.ok(!ids('armario').some(id => id.startsWith('kallax')), 'armario no debe sacar estanterías');
  assert.ok(ids('kast').includes('kallax-4x4') && ids('kast').includes('ankarudden-armario'), 'kast');
});
check('buscador: sin resultados', () => {
  assert.deepEqual(ids('billy'), []);
  assert.equal(ids('').length, MODELS.length);
});

/* Información legal: textos de los enlaces y página legal.html en los 4 idiomas. */
const legal = fs.readFileSync(new URL('../legal.html', import.meta.url), 'utf8');
const articles = Object.fromEntries(legal.split('<article data-lang="').slice(1).map(a => [a.slice(0, 2), a]));
check('legal: textos de los enlaces en los 4 idiomas', () => {
  for (const l of LANGS) for (const k of ['disc', 'discMore', 'legalNav', 'lnLegal', 'lnPrivacy', 'lnCookies', 'lnTerms', 'back']) assert.ok(T[l][k], `${l}: falta ${k}`);
});
check('legal: cada idioma tiene aviso legal, privacidad, cookies y condiciones', () => {
  for (const l of LANGS) {
    assert.ok(articles[l], `legal.html: falta el idioma ${l}`);
    for (const s of ['legal', 'privacy', 'cookies', 'terms']) assert.ok(articles[l].includes(`data-sec="${s}"`), `legal.html (${l}): falta la sección ${s}`);
  }
});
check('legal: los nombres de producto del catálogo aparecen en la frase de marcas', () => {
  const names = [...new Set(MODELS.flatMap(m => m.name.split('+').map(n => n.trim())))];
  for (const l of LANGS) for (const n of names) assert.ok(articles[l].includes(n), `legal.html (${l}): añade «${n}» a la lista de marcas`);
});
if (legal.includes('{{EMAIL}}')) console.log('   (aviso: legal.html todavía tiene {{EMAIL}}; pon el email de contacto antes de publicar)');

if (fails) { console.log(`\n${fails} comprobación(es) fallida(s)`); process.exit(1); }
console.log('\nTodo bien.');
