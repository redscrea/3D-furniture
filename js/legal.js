/* Página legal: muestra el idioma elegido en la web (?lang=, la visita actual o el navegador)
   y lleva a la sección pedida (#legal, #privacy, #cookies, #terms). */
import { T } from './i18n.js';
import { initialLang, saveLang } from './lang.js';

const SECTIONS = ['legal', 'privacy', 'cookies', 'terms'];

function show(lang, scroll) {
  let active = null;
  document.querySelectorAll('article[data-lang]').forEach(a => {
    const on = a.dataset.lang === lang;
    a.hidden = !on;
    if (on) active = a;
  });
  const l = T[lang];
  document.documentElement.lang = lang;
  document.querySelectorAll('#langs button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
  const home = './?lang=' + lang;
  const brand = document.getElementById('brand');
  brand.innerHTML = l.brand;
  brand.href = home;
  const back = document.getElementById('back');
  back.textContent = l.back;
  back.href = home;
  if (active) document.title = active.dataset.title || document.title;
  if (scroll && active) {
    const sec = location.hash.replace('#', '').replace(/-(es|nl|fr|en)$/, '');
    if (SECTIONS.includes(sec)) {
      const el = active.querySelector(`[data-sec="${sec}"]`);
      // Espera a las fuentes para que la posición no se mueva después del salto.
      if (el) document.fonts.ready.then(() => el.scrollIntoView({ behavior: 'instant', block: 'start' }));
    }
  }
}

document.getElementById('langs').addEventListener('click', e => {
  const b = e.target.closest('button[data-lang]');
  if (!b) return;
  saveLang(b.dataset.lang);
  const url = new URL(location.href);
  url.searchParams.set('lang', b.dataset.lang);
  history.replaceState(null, '', url);
  show(b.dataset.lang, true);
});

show(initialLang(), true);
