/* Buscador del catálogo. Sin dependencias, también se usa en las pruebas (test/catalogo.test.js).
   - No distingue mayúsculas ni acentos (INLÄGG = inlagg, étagère = etagere).
   - Entiende medidas: «77 x 147», «77×147» y «77x147» son lo mismo.
   - Tolera erratas pequeñas (kalax → KALLAX, estanteira → estantería).
   - Busca en todos los idiomas a la vez. */
import { T, CAT_KEYWORDS, LANGS } from './i18n.js';
import { sizeLabel } from '../models/index.js';

export function norm(s) {
  return String(s ?? '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[’']/g, ' ')
    .replace(/[×*]/g, 'x')
    .replace(/(\d)\s*x\s*(?=\d)/g, '$1x')
    .replace(/(\d)\s*x\s*$/, '$1x')
    .replace(/[^a-z0-9x]+/g, ' ')
    .trim();
}

const STOP = new Set(['de', 'del', 'la', 'el', 'los', 'las', 'para', 'con', 'y', 'un', 'una',
  'the', 'a', 'an', 'for', 'with', 'and', 'of',
  'le', 'les', 'des', 'du', 'pour', 'avec', 'et', 'une',
  'het', 'een', 'voor', 'met', 'en', 'van']);

export function tokens(q) {
  const all = norm(q).split(' ').filter(Boolean);
  const useful = all.filter(w => !STOP.has(w));
  return useful.length ? useful : all;
}

function lev(a, b, max) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const row = [i]; let best = i;
    for (let j = 1; j <= b.length; j++) {
      row[j] = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (row[j] < best) best = row[j];
    }
    if (best > max) return max + 1;
    prev = row;
  }
  return prev[b.length];
}

/** Prepara un índice: cada documento es { item, fields: [[texto, peso], …] }. */
export function buildIndex(docs) {
  return docs.map(({ item, fields }) => {
    const words = new Map();
    for (const [text, weight] of fields) {
      for (const w of norm(text).split(' ')) if (w && (words.get(w) || 0) < weight) words.set(w, weight);
    }
    return { item, words: [...words] };
  });
}

function tokenScore(tok, words) {
  let best = 0;
  const maxTypos = tok.length >= 7 ? 2 : tok.length >= 4 ? 1 : 0;
  for (const [w, weight] of words) {
    let s = 0;
    if (w === tok) s = 3;
    else if (w.startsWith(tok)) s = 2;
    else if (tok.length >= 3 && w.includes(tok)) s = 1;
    else if (maxTypos) {
      // errata en la palabra entera o en su comienzo (para quien aún está escribiendo)
      if (lev(tok, w, maxTypos) <= maxTypos || (w.length > tok.length && lev(tok, w.slice(0, tok.length), maxTypos) <= maxTypos)) s = .8;
    }
    if (s * weight > best) best = s * weight;
  }
  return best;
}

/**
 * Busca en el índice. Devuelve { results: [item…], partial: bool }.
 * Primero exige que coincidan todas las palabras; si no sale nada, muestra lo que coincide con alguna (partial).
 */
export function search(index, query) {
  const toks = tokens(query);
  if (!toks.length) return { results: index.map(d => d.item), partial: false };
  const scored = index.map((d, i) => {
    const per = toks.map(t => tokenScore(t, d.words));
    return { item: d.item, i, all: per.every(s => s > 0), any: per.filter(s => s > 0).length, score: per.reduce((a, b) => a + b, 0) };
  });
  const order = (a, b) => b.score - a.score || a.i - b.i;
  const full = scored.filter(s => s.all).sort(order);
  if (full.length || toks.length === 1) return { results: full.map(s => s.item), partial: false };
  const some = scored.filter(s => s.any).sort((a, b) => b.any - a.any || order(a, b));
  return { results: some.map(s => s.item), partial: some.length > 0 };
}

/** Índice del catálogo: nombre de producto, medidas, descripción y tipo de mueble en los 4 idiomas. */
export function catalogIndex(models) {
  return buildIndex(models.map(m => ({
    item: m,
    fields: [
      [m.name, 5],
      [sizeLabel(m), 4],
      [(m.kw || []).join(' '), 3],
      ...LANGS.map(l => [m.sub[l] || '', 3]),
      ...m.cats.flatMap(c => [...LANGS.map(l => [T[l].cats[c] + ' ' + T[l].catOne[c], 2]), [CAT_KEYWORDS[c].join(' '), 2]])
    ]
  })));
}
