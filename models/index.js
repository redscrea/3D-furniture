/* Catálogo de muebles.
   Cada entrada dice qué archivo de models/ dibuja el mueble y cómo aparece en el buscador.
   Para añadir un mueble, mira «Cómo añadir un mueble» en el README.

   Campos:
   - id        identificador para la dirección: montaje.html?m=<id>
   - file      archivo del modelo (relativo a esta carpeta)
   - params    datos que se pasan al modelo (opcional)
   - cats      tipos de mueble: 'shelf' (estantería), 'desk' (escritorio), 'table' (mesa). El primero es el principal.
   - name      nombre o nombres de producto, tal cual (no se traducen)
   - sub       descripción corta en cada idioma
   - size      medidas en cm (ancho w, alto h, fondo d)
   - label     medida que se muestra (opcional; por defecto «ancho × alto cm»)
   - steps     número de pasos (sin contar la vista previa); la prueba test/catalogo.test.js lo comprueba
   - articles  cuántos productos se combinan
   - kw        palabras extra para el buscador (medidas, números de manual, sinónimos…)
   - thumb     miniatura (por defecto img/miniaturas/<id>.webp) */

const kallax = (cols, rows, w, h, kw = []) => ({
  id: `kallax-${cols}x${rows}`,
  file: './kallax.js',
  params: { cols, rows, w, h },
  cats: ['shelf'],
  name: 'KALLAX',
  sub: {
    es: `Estantería de ${cols} × ${rows} cubos`,
    en: `Shelving unit, ${cols} × ${rows} compartments`,
    fr: `Étagère de ${cols} × ${rows} cases`,
    nl: `Open kast met ${cols} × ${rows} vakken`
  },
  size: { w, h, d: 39 },
  steps: cols === 1 ? 8 : rows + 7,
  articles: 1,
  kw: [`${cols}x${rows}`, `${w}x${h}`, `${w}x39x${h}`, ...kw]
});

export const MODELS = [
  {
    id: 'kallax-escritorio',
    file: './kallax-escritorio.js',
    cats: ['desk', 'shelf'],
    name: 'KALLAX + INLÄGG + OLOV',
    sub: {
      es: 'Estantería 5 × 5 con escritorio enganchado',
      en: '5 × 5 shelving unit with a hooked-on desk',
      fr: 'Étagère 5 × 5 avec bureau accroché',
      nl: 'Open kast 5 × 5 met vastgehaakt bureau'
    },
    size: { w: 182, h: 182, d: 39 },
    steps: 19,
    articles: 3,
    kw: ['5x5', '182x182', 'INLÄGG', 'OLOV', 'pata regulable', 'adjustable leg', 'pied réglable', 'verstelbare poot',
         'AA-2730792', 'AA-2292955', 'AA-837959']
  },
  kallax(2, 2, 77, 77),
  kallax(1, 4, 42, 147, ['4x1', '147x42']),
  kallax(2, 4, 77, 147, ['4x2', '147x77']),
  kallax(3, 4, 112, 147, ['4x3', '147x112']),
  kallax(4, 4, 147, 147),
  kallax(5, 5, 182, 182),
  {
    id: 'lack-mesa-auxiliar',
    file: './lack.js',
    cats: ['table'],
    name: 'LACK',
    sub: {
      es: 'Mesa auxiliar, sin herramientas',
      en: 'Side table, no tools needed',
      fr: 'Table d’appoint, sans outils',
      nl: 'Bijzettafel, zonder gereedschap'
    },
    size: { w: 55, h: 45, d: 55 },
    label: '55 × 55 cm',
    steps: 6,
    articles: 1,
    kw: ['55x55', 'sin herramientas', 'no tools', 'sans outils', 'zonder gereedschap', 'mesita de noche', 'bedside', 'nachtkastje']
  }
];

export const CATS = ['shelf', 'desk', 'table'];

export const findModel = id => MODELS.find(m => m.id === id) || null;
export const thumbOf = m => m.thumb || `img/miniaturas/${m.id}.webp`;
export const sizeLabel = m => m.label || `${m.size.w} × ${m.size.h} cm`;
export const modelUrl = m => new URL(m.file, import.meta.url).href;
