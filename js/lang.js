/* Idioma de la interfaz, compartido por el catálogo y la guía.
   Orden: ?lang= en la dirección → elección hecha en esta visita → idioma del navegador → español.
   La elección se guarda solo durante la visita (sessionStorage): es temporal y estrictamente
   necesaria, así que no hace falta banner de cookies. Se borra la copia permanente que
   guardaban versiones anteriores en localStorage. */
export const LANGS = ['es', 'nl', 'fr', 'en'];
const KEY = 'montaje3d-lang';

try { localStorage.removeItem(KEY); } catch (e) {}

export function saveLang(l) {
  try { sessionStorage.setItem(KEY, l); } catch (e) {}
}

export function initialLang() {
  const fromUrl = new URLSearchParams(location.search).get('lang');
  if (LANGS.includes(fromUrl)) { saveLang(fromUrl); return fromUrl; }
  try { const s = sessionStorage.getItem(KEY); if (LANGS.includes(s)) return s; } catch (e) {}
  for (const n of (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || 'es'])) {
    const c = String(n).slice(0, 2).toLowerCase();
    if (LANGS.includes(c)) return c;
  }
  return 'es';
}
