/* ANKARUDDEN armario con 2 puertas correderas y 2 cajones, efecto roble, 98 × 60 × 190 cm (artículo 506.262.50).
   Basado en el manual AA-2615997 (52 páginas, 58 pasos). Como en el manual, el armazón se monta tumbado
   boca abajo (con los cantos delanteros contra el suelo), se le pone la trasera y las escuadras, se pone
   de pie y se fija a la pared; después van las guías, las barras, las baldas, las puertas y los cajones.
   La guía agrupa los 58 pasos del manual y en cada paso dice cuáles son.

   Medidas de las piezas aproximadas (tableros de 1,6 cm, zócalo de 5 cm, zona de cajones de unos 25 cm) y
   posición supuesta de travesaños, zócalos y patas: ver «Supuestos a revisar» en el README. */

const W = 98, H = 190, D = 60, T = 1.6;
const FOOT = .6;                 // patas de plástico
const XI = W / 2 - T;            // cara interior de los laterales
const Z_IN = 1.4;                // las piezas de dentro empiezan delante de la trasera
const Y_BOT = 5.6;               // panel inferior, encima del zócalo
const Y_RAIL = 28.4;             // travesaños, debajo de la balda fija
const Y_SHELF = 31.4;            // balda fija (encima de los cajones)
const Y_TOP = H - T;             // panel superior
const Z_PART = 51;               // fondo del separador central y de las baldas (delante van las puertas)
const DOOR = { w: 48.9, h: 154, y: Y_SHELF + T + .7, x: [-22.75, 22.75], z: [53.2, 55.6] };
const TRACK_Z = [[53, 55], [55.4, 57.4]];
const DRW = { w: 46, d: 53.6, y: 7.6, z: 6.4, front: 18.4, lip: 1.8, x: [-24.1, 24.1] };
const RUN_Y = [DRW.y + 1, DRW.y + 2.6];
const SHELVES_Y = [72, 104];     // cara de arriba de las dos baldas (en el compartimento derecho)
const HANG_Y = 178, HANG_Z = 28;
const LIE_Z = 90;                // tumbado: la base de los cajones queda a 90 cm de la pared
const BACK = '#ddd3bf';          // tablero de fibras (trasera y fondos de cajón)

export default {
  build({ addPart, assembly, box, cyl, group, COL }) {
    const metal = { metal: true };
    const FULL = [190, 172, 335, 0, 92, 30];
    const LIE = [250, 215, 430, 0, 18, 180];       // vista general del armazón tumbado
    const steps = [
      { sec: 'preview', mode: 'final', cam: FULL, hw: [['personas', 'people', 2], ['destornillador', 'screwdrivers'], ['allen', 'allen'], ['martillo', 'hammer'], ['taladro', 'drill8'], ['escalera', 'ladder'], ['carton', 'cardboard']] },
      { sec: 'before', mode: 'explode', cam: [345, 285, 600, 0, 92, 85], hw: [['panel', 'sides', 2], ['panel', 'hPanels', 3], ['separador', 'partition', 1], ['separador', 'divider', 1], ['rail', 'strips', 4], ['tablero', 'back', 2], ['panel', 'shelves', 2], ['barra', 'hangRails', 2], ['guia', 'tracks', 4], ['puerta', 'doors', 2], ['cajon', 'drawers', 2]] },
      // Armazón tumbado (pasos 1–29 del manual)
      { sec: 'carcass', cam: [135, 125, 255, 0, 18, 106], hw: [['carton', 'cardboardFloor'], ['panel', 'bottomPanel', 1], ['separador', 'divider', 1], ['rail', 'runners', 2], ['tornillo', 'screws', 6], ['espiga', 'dowels'], ['excentrica', 'cams'], ['allen', 'allen']] },
      { sec: 'carcass', cam: [125, 140, 250, 0, 20, 112], hw: [['rail', 'rails', 2], ['espiga', 'dowels'], ['excentrica', 'cams'], ['allen', 'allen']] },
      { sec: 'carcass', cam: [215, 215, 330, 0, 18, 165], hw: [['panel', 'sideLeft', 1], ['rail', 'runners', 1], ['tornillo', 'screws', 3], ['excentrica', 'cams'], ['destornillador', 'screwdriverShort']] },
      { sec: 'carcass', cam: [115, 125, 35, 0, 14, 98], hw: [['rail', 'plinths', 2], ['espiga', 'dowels'], ['excentrica', 'cams']] },
      { sec: 'carcass', cam: [140, 140, 275, 0, 20, 118], hw: [['panel', 'fixedShelf', 1], ['excentrica', 'cams']] },
      { sec: 'carcass', cam: LIE, hw: [['separador', 'partition', 1], ['panel', 'sideRight', 1], ['rail', 'runners', 1], ['tornillo', 'screws', 3], ['espiga', 'dowels'], ['excentrica', 'cams']] },
      { sec: 'carcass', cam: [95, 100, 25, 0, 12, 96], hw: [['pie', 'feet', 6]] },
      { sec: 'carcass', cam: [150, 165, 440, 0, 22, 268], hw: [['panel', 'topPanel', 1], ['excentrica', 'cams'], ['allen', 'allen']] },
      { sec: 'carcass', cam: [205, 300, 395, 0, 40, 185], hw: [['tablero', 'back', 2], ['clip', 'clips', 14], ['clavija', 'pins', 12]] },
      { sec: 'carcass', cam: [125, 165, 425, 0, 52, 280], hw: [['escuadra', 'brackets', 2], ['tornillo', 'screws', 2], ['arandela', 'washers', 2]] },
      // De pie y a la pared (30–34)
      { sec: 'wall', cam: [255, 215, 440, 0, 88, 120], hw: [['personas', 'people', 2]] },
      { sec: 'wall', cam: [185, 245, 270, 0, 165, 15], hw: [['personas', 'people', 2], ['taladro', 'drill8'], ['tornillo', 'wallKit', 2], ['arandela', 'washers', 2], ['martillo', 'hammer'], ['destornillador', 'screwdriverShort']] },
      // Guías, barras y baldas (35–40)
      { sec: 'inside', cam: [125, 140, 265, 0, 110, 45], hw: [['guia', 'tracks', 4], ['clip', 'caps', 8]] },
      { sec: 'inside', cam: [95, 178, 235, 0, 165, 30], hw: [['soporte', 'holders', 4], ['barra', 'hangRails', 2]] },
      { sec: 'inside', cam: [150, 130, 250, 22, 88, 30], hw: [['soporte', 'shelfPins', 12], ['panel', 'shelves', 2]] },
      // Puertas (41–46)
      { sec: 'doors', cam: [200, 235, 385, 0, 8, 150], hw: [['carton', 'cardboard'], ['puerta', 'doors', 2], ['ruedas', 'rollers', 4], ['ruedas', 'guides', 4]] },
      { sec: 'doors', cam: [205, 170, 385, 0, 100, 60], hw: [['personas', 'people', 2]] },
      { sec: 'doors', cam: [120, 135, 235, 0, 112, 55], hw: [['tirador', 'handles', 2], ['tornillo', 'screws', 4], ['destornillador', 'screwdriverShort']] },
      // Cajones (47–58)
      { sec: 'drawers', cam: [115, 125, 280, 0, 10, 122], hw: [['cajon', 'drawerFronts', 2], ['panel', 'drawerSides', 4], ['tablero', 'drawerBottoms', 2], ['panel', 'drawerBacks', 2], ['excentrica', 'cams']] },
      { sec: 'drawers', cam: [-120, 115, 270, 0, 10, 122], hw: [['rail', 'drawerRunners', 4], ['tornillo', 'screws', 12], ['tirador', 'lips', 2], ['espiga', 'dowels'], ['excentrica', 'cams']] },
      { sec: 'drawers', cam: [150, 120, 285, 0, 28, 70], hw: [] },
      { sec: 'done', mode: 'final', cam: FULL, hw: [] }
    ];
    const S = {
      base: 2, rails: 3, sideL: 4, plinth: 5, fixedShelf: 6, sideR: 7, feet: 8, top: 9, back: 10, brackets: 11,
      up: 12, wall: 13, tracks: 14, hang: 15, shelves: 16, doorPrep: 17, doorHang: 18, handles: 19,
      drawerBuild: 20, drawerRun: 21, drawerIn: 22
    };

    /* ---------- Armazón: se monta tumbado boca abajo y en el paso S.up se pone de pie ----------
       Coordenadas del armario de pie: x de −49 a 49, y de 0 a 190, z de 0 (pared) a 60 (frente).
       Tumbado: girado 90° sobre el eje x, con la parte de abajo a LIE_Z cm de la pared.
       En coordenadas del armario, «desde arriba» (estando tumbado) es z negativa. */
    const frame = assembly({ staged: { p: [0, D + .1, LIE_Z], r: [Math.PI / 2, 0, 0] }, final: { p: [0, 0, 0] }, moveStep: S.up, arc: 28 });
    const F = (key, obj, step, opts = {}) => addPart({ key, obj, step, parent: frame, ...opts });
    const fwd = 35;   // en la vista explotada, el armazón se adelanta y la trasera se queda atrás

    // Base de los cajones (1–9): panel inferior, separador corto y sus dos correderas
    F('bottom', box([-XI, Y_BOT, Z_IN], [XI, Y_BOT + T, D], COL.wood), S.base, { enter: [0, 0, -40], explode: [0, -2, fwd] });
    F('divider', box([-T / 2, Y_BOT + T, Z_IN], [T / 2, Y_RAIL, D], COL.wood), S.base, { sub: 1.2, enter: [0, 0, -45], explode: [0, 6, fwd + 18] });
    for (const [i, x] of [-T / 2 - .6, T / 2].entries()) {
      F('runnerCab', box([x, RUN_Y[0], 6.4], [x + .6, RUN_Y[1], 57.8], COL.metal, metal), S.base, { sub: 1.2, enter: [0, 0, -45], explode: [0, 6, fwd + 18] });
    }
    // Travesaños (10–12)
    F('railF', box([-XI, Y_RAIL, 56.8], [XI, Y_SHELF, 58.4], COL.wood), S.rails, { enter: [0, 0, -38], explode: [0, 4, fwd + 40] });
    F('railB', box([-XI, Y_RAIL, Z_IN], [XI, Y_SHELF, Z_IN + T], COL.wood), S.rails, { sub: 1.5, enter: [0, 0, -38], explode: [0, 4, fwd - 12] });
    // Lateral izquierdo con su corredera (13–17)
    F('sideL', box([-W / 2, FOOT, 0], [-XI, H, D], COL.wood), S.sideL, { enter: [-48, 0, 0], explode: [-34, 0, fwd] });
    F('runnerCab', box([-XI, RUN_Y[0], 6.4], [-XI + .6, RUN_Y[1], 57.8], COL.metal, metal), S.sideL, { enter: [-48, 0, 0], explode: [-34, 0, fwd] });
    // Zócalos (18–20)
    F('plinthF', box([-XI, FOOT, 56.8], [XI, Y_BOT, 58.4], COL.wood), S.plinth, { enter: [0, 0, -30], explode: [0, 0, fwd + 40] });
    F('plinthB', box([-XI, FOOT, Z_IN], [XI, Y_BOT, Z_IN + T], COL.wood), S.plinth, { sub: 1.5, enter: [0, 0, -30], explode: [0, 0, fwd - 12] });
    // Balda fija (21–22)
    F('fixedShelf', box([-XI, Y_SHELF, Z_IN], [XI, Y_SHELF + T, D], COL.wood), S.fixedShelf, { enter: [0, 0, -42], explode: [0, 12, fwd] });
    // Separador central y lateral derecho (24)
    F('partition', box([-T / 2, Y_SHELF + T, Z_IN], [T / 2, Y_TOP, Z_PART], COL.wood), S.sideR, { enter: [0, 0, -45], explode: [0, 22, fwd] });
    F('sideR', box([XI, FOOT, 0], [W / 2, H, D], COL.wood), S.sideR, { sub: 2, enter: [48, 0, 0], explode: [34, 0, fwd] });
    F('runnerCab', box([XI - .6, RUN_Y[0], 6.4], [XI, RUN_Y[1], 57.8], COL.metal, metal), S.sideR, { sub: 2, enter: [48, 0, 0], explode: [34, 0, fwd] });
    // Patas de plástico (23): dos bajo cada lateral y una bajo cada zócalo
    const feet = [
      [[-W / 2, -XI], [3, 8]], [[-W / 2, -XI], [52, 57]], [[XI, W / 2], [3, 8]], [[XI, W / 2], [52, 57]],
      [[-2, 2], [56.8, 58.4]], [[-2, 2], [Z_IN, Z_IN + T]]
    ];
    feet.forEach(([[x0, x1], [z0, z1]], i) => {
      const ex = x0 < -10 ? -34 : x0 > 10 ? 34 : 0;
      F('foot', box([x0, 0, z0], [x1, FOOT, z1], COL.dark, { edges: false }), S.feet, { sub: i * .5, enter: [0, -12, 0], explode: [ex, 3, ex ? fwd : z0 > 50 ? fwd + 40 : fwd - 12] });
    });
    // Panel superior (25)
    F('top', box([-XI, Y_TOP, Z_IN], [XI, H, D], COL.wood), S.top, { enter: [0, 40, 0], explode: [0, 30, fwd] });
    // Trasera en dos partes, clips y clavijas (26–28)
    F('backHalf', box([-48, 6, .9], [0, H - .8, 1.2], BACK), S.back, { n: 1, enter: [0, 0, -45], explode: [-8, 0, 0] });
    F('backHalf', box([0, 6, .9], [48, H - .8, 1.2], BACK), S.back, { n: 2, sub: 1.5, enter: [0, 0, -45], explode: [8, 0, 0] });
    const clips = []; for (let k = 0; k < 14; k++) clips.push(box([-1.4, 12 + k * 12.5, .55], [1.4, 13.6 + k * 12.5, .9], COL.dark, { edges: false }));
    F('clips', group(...clips), S.back, { sub: 3, enter: [0, 0, -12], explode: [0, 0, -.2] });
    const pins = [];
    for (const y of [Y_BOT + T / 2, Y_SHELF + T / 2, H - .8]) for (const x of [-36, -12, 12, 36]) pins.push(cyl(.45, .3, COL.dark, [x, y, .75], 'z', true));
    F('pins', group(...pins), S.back, { sub: 4, enter: [0, 0, -12], explode: [0, 0, -.2] });
    // Escuadras para la pared (29)
    const BX = [-38, 38];
    BX.forEach((x, i) => {
      const g = group(
        box([x - 2.2, H, -1.25], [x + 2.2, H + .35, 7], COL.metal, { metal: true, edges: false }),
        box([x - 2.2, H, -1.25], [x + 2.2, H + 8, -.9], COL.metal, { metal: true, edges: false }),
        cyl(.7, .5, COL.dark, [x, H + .55, 4], 'y', true)
      );
      F('wallBracket', g, S.brackets, { sub: i * 1.5, enter: [0, 0, -16], explode: [0, 34, fwd] });
    });

    /* ---------- De pie: tornillos a la pared (31–34) ---------- */
    BX.forEach((x, i) => addPart({ key: 'wallScrew', obj: cyl(.75, .5, COL.dark, [x, H + 5.2, -.65], 'z', true), step: S.wall, sub: i * 1.5, enter: [0, 0, 14], explode: [0, 34, fwd] }));

    /* ---------- Guías, barras y baldas (35–40) ---------- */
    const tracks = [];
    for (const [y0, y1] of [[Y_SHELF + T, Y_SHELF + T + .5], [Y_TOP - .5, Y_TOP]]) {
      for (const [z0, z1] of TRACK_Z) tracks.push({ y0, y1, z0, z1, top: y0 > 100 });
    }
    tracks.forEach(({ y0, y1, z0, z1, top }, i) => {
      const g = group(
        box([-XI + 1.2, y0, z0], [XI - 1.2, y1, z1], COL.metal, metal),
        box([-XI, y0 - .1, z0], [-XI + 1.2, y1 + .1, z1], COL.dark, { edges: false }),
        box([XI - 1.2, y0 - .1, z0], [XI, y1 + .1, z1], COL.dark, { edges: false })
      );
      addPart({ key: 'track', obj: g, step: S.tracks, sub: i, enter: [0, top ? -22 : 22, 0], explode: [0, top ? 20 : 10, fwd + 45 + (z0 > 55 ? 6 : 0)] });
    });
    const holderX = [[-XI, -XI + 1], [-T / 2 - 1, -T / 2], [T / 2, T / 2 + 1], [XI - 1, XI]];
    holderX.forEach(([x0, x1], i) => addPart({ key: 'holder', obj: box([x0, HANG_Y - 2.2, HANG_Z - 1.6], [x1, HANG_Y + 2.4, HANG_Z + 1.6], COL.dark, { edges: false }), step: S.hang, sub: i * .6, enter: [0, -14, 0], explode: [i < 2 ? -10 : 10, 14, fwd + 20] }));
    [-1, 1].forEach((s, i) => {
      const len = XI - T / 2 - 2, cx = s * (XI + T / 2) / 2;
      addPart({ key: 'hangRail', obj: cyl(1.25, len, COL.metal, [cx, HANG_Y + .2, HANG_Z], 'x', true), step: S.hang, sub: 3 + i, enter: [0, -16, 18], explode: [s * 10, 14, fwd + 20] });
    });
    SHELVES_Y.forEach((y, k) => {
      const yp = y - T - .45, ps = [];
      for (const x of [T / 2 + .55, XI - .55]) for (const z of [8, 26, 44]) ps.push(cyl(.35, 1.1, COL.metal, [x, yp, z], 'x', true));
      addPart({ key: 'shelfPins', obj: group(...ps), step: S.shelves, sub: k * .8, enter: [0, 0, 14], explode: [22, 0, fwd + 25] });
    });
    SHELVES_Y.forEach((y, k) => addPart({ key: 'shelf', n: k + 1, obj: box([T / 2 + .15, y - T, Z_IN + 1], [XI - .15, y, Z_PART], COL.wood), step: S.shelves, sub: 2 + k, enter: [0, 0, 55], explode: [22, 0, fwd + 25] }));

    /* ---------- Puertas (41–46): se preparan tumbadas en el suelo y en S.doorHang se cuelgan ----------
       Coordenadas de cada puerta: x de −24,45 a 24,45, y de 0 (canto de abajo) a 154, z de 0 a 1,6 (cara delantera). */
    DOOR.x.forEach((xf, i) => {
      const door = assembly({ staged: { p: [i ? 27 : -27, T + .1, 75], r: [Math.PI / 2, 0, 0] }, final: { p: [xf, DOOR.y, DOOR.z[i]] }, moveStep: S.doorHang, arc: 45 });
      const ex = [i ? 14 : -14, 0, i ? 125 : 105];
      const P = (key, obj, step, opts = {}) => addPart({ key, obj, step, parent: door, explode: ex, ...opts });
      const hw = DOOR.w / 2;
      P('door', box([-hw, 0, 0], [hw, DOOR.h, T], COL.wood), S.doorPrep, { n: i + 1, sub: i, enter: [0, 0, -30] });
      P('roller', group(...[-17, 17].map(x => box([x - 2, -.8, .3], [x + 2, .6, 1.3], COL.dark, { edges: false }))), S.doorPrep, { sub: 2.5 + i, enter: [0, -10, 0], explode: [ex[0], -6, ex[2]] });
      P('guideTop', group(...[-17, 17].map(x => box([x - 1.5, DOOR.h - .6, .4], [x + 1.5, DOOR.h + .8, 1.2], COL.dark, { edges: false }))), S.doorPrep, { sub: 4.5 + i, enter: [0, 10, 0], explode: [ex[0], 6, ex[2]] });
      const hx = i ? hw - 3.4 : -hw + 3.4;
      P('handle', box([hx - .8, 70, T], [hx + .8, 92, T + .7], COL.dark), S.handles, { sub: i * 1.5, enter: [0, 0, 14] });
    });

    /* ---------- Cajones (47–58): se montan delante del armario y en S.drawerIn se meten ----------
       Coordenadas de cada cajón: x centrada, y desde el canto de abajo del frente, z de 0 (detrás) a 53,6 (frente). */
    DRW.x.forEach((xf, i) => {
      const drawer = assembly({ staged: { p: [xf, .1, 95], r: [0, 0, 0] }, final: { p: [xf, DRW.y, DRW.z] }, moveStep: S.drawerIn, arc: 4.6 });
      const P = (key, obj, step, opts = {}) => addPart({ key, obj, step, parent: drawer, ...opts });
      const d = DRW.d, hw = DRW.w / 2, so = hw - .9, si = so - 1.2, ez = 72, ox = i ? 16 : -16;   // ox: en la vista explotada, cada cajón hacia su lado
      P('drawerFront', box([-hw, 0, d - T], [hw, DRW.front, d], COL.wood), S.drawerBuild, { enter: [0, 0, 22], explode: [ox, 0, ez + 14] });
      for (const [k, s] of [-1, 1].entries()) {
        P('drawerSide', box(s < 0 ? [-so, 1, .5] : [si, 1, .5], s < 0 ? [-si, 16, d - T] : [so, 16, d - T], COL.wood), S.drawerBuild, { sub: 1 + k * .5, enter: [s * 16, 0, 0], explode: [ox + s * 6, 0, ez] });
        // corredera del cajón: por fuera del lateral, pegada a la del armario
        P('drawerRunner', box(s < 0 ? [-so - .6, 1, 1] : [so, 1, 1], s < 0 ? [-so, 2.6, d - 2] : [so + .6, 2.6, d - 2], COL.metal, metal), S.drawerRun, { sub: k, enter: [s * 12, 0, 0], explode: [ox + s * 10, 0, ez] });
      }
      P('drawerBottom', box([-si, 1.3, .5], [si, 1.6, d - T], BACK), S.drawerBuild, { sub: 2.5, enter: [0, 0, -30], explode: [ox, -1, ez] });
      P('drawerBack', box([-si, 1.6, .5], [si, 14.5, 1.7], COL.wood), S.drawerBuild, { sub: 3.5, enter: [0, 0, -24], explode: [ox, 0, ez - 10] });
      P('lip', box([-hw, DRW.front, d - 3], [hw, DRW.front + DRW.lip, d], COL.wood), S.drawerRun, { sub: 2.5, enter: [0, 14, 0], explode: [ox, 6, ez + 14] });
    });

    const texts = {};
    for (const lang of Object.keys(TEXTS)) {
      const t = TEXTS[lang];
      if (t.steps.length !== steps.length) throw new Error(`ankarudden: ${lang} tiene ${t.steps.length} textos para ${steps.length} pasos`);
      texts[lang] = t;
    }
    return {
      steps, texts, wall: true, icons: ICONS,
      thumbCam: [171, 226, 294, 0, 96, 30],
      bounds: { w: W, h: H, d: D },
      ai: {
        about: `- ANKARUDDEN wardrobe with 2 sliding doors and 2 drawers, oak effect, 98×60×190 cm (W×D×H), IKEA 506.262.50, paper manual AA-2615997 (58 steps, 4 boxes; fittings in bag 1 = frame, bag 2 = doors and drawers, plus a wall-fixing bag).
- Inside: a centre partition, a clothes rail on each side and 2 adjustable shelves (both on one side or one on each side).
- Order in the manual and in this guide: the frame is built lying face down, then the back panel (2 parts, 14 clips, 12 plastic pins) and 2 wall brackets; two people stand it up and fix it to the wall (manual steps 30–34); then 4 door tracks, clothes rails, shelves, doors (bottom rollers with Min–Max height adjusters, top guides, door stops, handles) and drawers (the top strip of the front is the handle). Each guide step names the manual steps it covers.
- Tools in the manual: flat, Phillips and Pozidriv screwdrivers, pencil, hammer, step ladder, drill (8 mm bit for solid and hollow walls, 3 mm for solid wood). Allen key included.`,
        notes: [
          'This guide groups the 58 manual steps; panel sizes, the exact position of the cross rails, plinths and plastic feet in the 3D model are approximations, and the door stops (manual step 45) are not drawn. If the person’s paper manual differs, the manual is right.',
          'Runners are labelled in the manual (…CL… / …CR… on the cabinet side, …DL… / …DR… on the drawers); tell the person to match the label with the drawing rather than guessing left and right.',
          'Safety: assemble with two people; before standing it up, check the ceiling height (the diagonal of the wardrobe is about 2 m); always fix it to the wall with the included brackets (the included screws and plugs suit most solid and hollow walls; in solid wood use the screws without plugs; if unsure, ask a professional); heaviest items in the lower drawers and nothing heavy on top; don’t overtighten cam locks in particleboard.'
        ]
      }
    };
  }
};

const ICONS = {
  martillo: '<path d="M4 7.5L9 3l3.5 3.5L7.5 11z"/><path d="M10 9l10 10"/>',
  escalera: '<path d="M7 3L4 21M17 3l3 18"/><path d="M6.3 8h11.4M5.5 13h13M4.7 18h14.6"/>',
  excentrica: '<circle cx="12" cy="12" r="7"/><path d="M8.5 12h7"/>',
  guia: '<path d="M2 9h20v6H2z"/><path d="M5 12h14"/>',
  barra: '<path d="M3 7h18"/><path d="M12 7v3l-6 6h12l-6-6"/>',
  soporte: '<path d="M6 12h10"/><circle cx="17.5" cy="12" r="2"/><path d="M4 7v10"/>',
  puerta: '<rect x="6" y="2" width="12" height="20" rx="1"/><path d="M15 10v4"/>',
  ruedas: '<path d="M4 7h16"/><circle cx="8" cy="15" r="3"/><circle cx="16" cy="15" r="3"/>',
  tirador: '<rect x="10" y="4" width="4" height="16" rx="1.5"/>',
  cajon: '<rect x="3" y="7" width="18" height="11" rx="1"/><path d="M9 10.5h6"/>',
  clip: '<rect x="8" y="6" width="8" height="12" rx="1"/><path d="M12 6v12"/>',
  clavija: '<circle cx="12" cy="6" r="3"/><path d="M12 9v12M10 13l4 1.5M10 16.5l4 1.5"/>',
  pie: '<path d="M5 13h14v3H5z"/><path d="M9 13V8M15 13V8"/>'
};

/* =================== Textos =================== */
const TEXTS = {
  es: {
    title: 'ANKARUDDEN armario · Montaje 3D',
    chips: [['ANKARUDDEN', 'armario 98 × 60 × 190 cm']],
    footer: 'Prototipo independiente, sin relación con IKEA. Los pasos resumen el manual AA-2615997 y las medidas del modelo son aproximadas: sigue siempre el manual en papel ante cualquier duda.',
    sec: { preview: 'Vista previa', before: 'Antes de empezar', carcass: 'Armazón (tumbado)', wall: 'De pie y a la pared', inside: 'Guías, barras y baldas', doors: 'Puertas', drawers: 'Cajones', done: 'Terminado' },
    pn: {
      bottom: 'Panel inferior', divider: 'Separador de los cajones', runnerCab: 'Corredera (lado del armario)', railF: 'Travesaño delantero', railB: 'Travesaño trasero',
      sideL: 'Lateral izquierdo', sideR: 'Lateral derecho', plinthF: 'Zócalo delantero', plinthB: 'Zócalo trasero', fixedShelf: 'Balda fija', partition: 'Separador central',
      foot: 'Pata de plástico', top: 'Panel superior', backHalf: 'Trasera (parte {n} de 2)', clips: 'Clips de la trasera', pins: 'Clavijas de plástico',
      wallBracket: 'Escuadra para la pared', wallScrew: 'Tornillo a la pared', track: 'Guía de las puertas', holder: 'Soporte de barra', hangRail: 'Barra de colgar',
      shelfPins: 'Soportes de balda', shelf: 'Balda {n}', door: 'Puerta {n}', roller: 'Ruedas de abajo', guideTop: 'Guías de arriba', handle: 'Tirador',
      drawerFront: 'Frente del cajón', drawerSide: 'Lateral del cajón', drawerBottom: 'Fondo del cajón', drawerBack: 'Trasera del cajón', drawerRunner: 'Corredera (lado del cajón)', lip: 'Remate del frente (tirador)'
    },
    hw: {
      screwdrivers: 'Destornilladores plano y de estrella', hammer: 'Martillo', ladder: 'Escalera de mano', drill8: 'Taladro (broca de 8 mm, o de 3 mm en madera)',
      sides: 'Laterales', hPanels: 'Panel superior, inferior y balda fija', partition: 'Separador central', divider: 'Separador de los cajones', strips: 'Travesaños y zócalos',
      back: 'Trasera (2 partes)', shelves: 'Baldas', hangRails: 'Barras de colgar', tracks: 'Guías de las puertas', doors: 'Puertas correderas', drawers: 'Cajones (por piezas)',
      bottomPanel: 'Panel inferior', runners: 'Correderas', screws: 'Tornillos', dowels: 'Espigas de madera', cams: 'Pernos y excéntricas', rails: 'Travesaños',
      sideLeft: 'Lateral izquierdo', sideRight: 'Lateral derecho', plinths: 'Zócalos', fixedShelf: 'Balda fija', feet: 'Patas de plástico', topPanel: 'Panel superior',
      clips: 'Clips', pins: 'Clavijas de plástico', brackets: 'Escuadras para la pared', washers: 'Arandelas', wallKit: 'Tornillos y tacos de pared (incluidos)',
      caps: 'Tapas de las guías', holders: 'Soportes de barra', shelfPins: 'Soportes de balda', rollers: 'Ruedas de abajo', guides: 'Guías de arriba', handles: 'Tiradores',
      drawerFronts: 'Frentes de cajón', drawerSides: 'Laterales de cajón', drawerBottoms: 'Fondos de cajón', drawerBacks: 'Traseras de cajón', drawerRunners: 'Correderas de los cajones', lips: 'Remates de los frentes'
    },
    steps: [
      ['Así quedará', 'Un armario ANKARUDDEN de 98 × 60 × 190 cm con dos puertas correderas, dos barras de colgar, dos baldas y dos cajones abajo. Gira la vista y pulsa «Empezar el montaje» cuando quieras.', 'Toca cualquier pieza del modelo para ver su nombre. Si algo no queda claro, pregunta a la IA.'],
      ['Revisa las piezas y haz sitio', 'Saca todo de las 4 cajas y comprueba que no falta nada. Deja libre un trozo de suelo de unos 2 × 1 m: el armazón se monta tumbado.', 'Los herrajes vienen en bolsas: la 1 es para el armazón y la 2 para puertas y cajones. Las escuadras y los tornillos de pared van en una bolsa aparte.', 'Montadlo entre dos personas: las piezas grandes pesan y son difíciles de manejar solo.'],
      ['Base de los cajones', 'Pon cartón en el suelo y coloca el panel inferior de canto, con el borde delantero hacia abajo. Atornilla una corredera a cada cara del separador corto (3 tornillos cada una) y únelo al panel inferior con espigas y excéntricas.', 'Pasos 1–9 del manual. Cada corredera lleva una etiqueta (…CL… o …CR…): ponla en la cara que muestra el dibujo.'],
      ['Travesaños', 'Mete espigas en los dos travesaños estrechos y colócalos delante y detrás, a la altura de la parte de arriba del separador. Sujétalos con los pernos y la llave Allen.', 'Pasos 10–12 del manual.'],
      ['Lateral izquierdo', 'Atornilla la corredera en la cara de dentro del lateral (3 tornillos) y enrosca los pernos de unión. Después encaja el lateral en la base de los cajones y aprieta las excéntricas.', 'Pasos 13–17 del manual. El manual prepara los dos laterales a la vez; aquí ves primero el izquierdo.'],
      ['Zócalos', 'Mete espigas en los dos zócalos y colócalos delante y detrás, debajo del panel inferior. Aprieta las excéntricas.', 'Pasos 18–20 del manual.'],
      ['Balda fija', 'Coloca la balda fija encima de la base de los cajones y aprieta las excéntricas. Es la balda que separa los cajones de la zona de las puertas.', 'Pasos 21–22 del manual.'],
      ['Separador central y lateral derecho', 'Mete espigas en el separador central y colócalo de canto sobre la balda fija, en el centro. Después encaja el lateral derecho, con su corredera ya atornillada, y aprieta todas las excéntricas.', 'Paso 24 del manual.'],
      ['Patas de plástico', 'Encaja las 6 patas de plástico en los cantos de abajo del armario.', 'Paso 23 del manual. Protegen el suelo. Mira en el dibujo del manual dónde va cada una: aquí su posición es aproximada.'],
      ['Panel superior', 'Enrosca los pernos en el panel superior, encájalo en los laterales y en el separador central, y aprieta las excéntricas.', 'Paso 25 del manual. Antes de seguir, comprueba que el armazón está bien cuadrado.'],
      ['Trasera', 'Coloca las dos partes de la trasera en las ranuras de los laterales, únelas con los 14 clips y fíjalas con las 12 clavijas de plástico.', 'Pasos 26–28 del manual. La trasera es la que mantiene el armario recto: no te saltes ninguna clavija.'],
      ['Escuadras para la pared', 'Atornilla las dos escuadras en el panel superior, cada una con su tornillo y su arandela.', 'Paso 29 del manual. Las escuadras están en la bolsa aparte, con los tornillos y tacos de pared.'],
      ['Ponlo de pie', 'Entre dos personas, levanta el armario con cuidado hasta dejarlo de pie.', 'Paso 30 del manual. Al girarlo, en diagonal mide casi 2 m: comprueba antes que no choca con el techo ni con una lámpara.', 'No lo levantes solo: pesa mucho y puede volcar.'],
      ['Fíjalo a la pared', 'Acércalo a la pared, marca con un lápiz los agujeros de las escuadras, taladra, mete los tacos y atornilla las escuadras a la pared.', 'Pasos 31–34 del manual. Los tornillos y tacos incluidos valen para la mayoría de paredes macizas y huecas (broca de 8 mm). En madera maciza, usa solo los tornillos, sin tacos (broca de 3 mm). Si dudas, pide consejo en una ferretería.', 'Un armario así puede volcar y aplastar a alguien. Fíjalo siempre a la pared.'],
      ['Guías de las puertas', 'Pon una tapa en cada extremo de las 4 guías. Encaja dos guías en las ranuras de debajo del panel superior y dos en las de encima de la balda fija, presionando con la mano a lo largo de toda la guía.', 'Pasos 35–37 del manual. Las guías se doblan un poco para entrar: no las golpees.'],
      ['Barras de colgar', 'Encaja los 4 soportes arriba, en los laterales y en el separador central, y apoya en ellos las dos barras.', 'Paso 38 del manual.'],
      ['Baldas', 'Mete los 12 soportes de balda en los agujeros y coloca las dos baldas encima.', 'Pasos 39–40 del manual. Puedes poner las dos baldas en el mismo lado (un lado para ropa larga y otro para ropa corta) o una en cada lado.'],
      ['Prepara las puertas', 'Pon las dos puertas sobre cartón. Encaja en cada una 2 ruedas en el canto de abajo y 2 guías en el de arriba, hasta que queden bien metidas.', 'Pasos 41–42 del manual (bolsa 2). Hay dos tipos de pieza y cada una va en un canto: fíjate en el dibujo.'],
      ['Cuelga las puertas', 'Mete primero la parte de arriba de la puerta en su guía superior y después baja la parte de abajo en la guía inferior hasta oír clic. Cada puerta va en una guía.', 'Pasos 43–44 del manual. Si una puerta no queda recta, ajústala con las ruedecillas de abajo (Min–Max) hasta que la separación sea igual en todo el borde.'],
      ['Topes y tiradores', 'Coloca los topes de las puertas como indica el manual. Después atornilla un tirador en cada puerta, con 2 tornillos.', 'Pasos 45–46 del manual.'],
      ['Monta los cajones', 'Para cada cajón: enrosca los pernos en el frente, coloca los dos laterales y aprieta las excéntricas. Desliza el fondo por las ranuras y cierra con la trasera del cajón.', 'Pasos 47–52 del manual. Se hace dos veces, una por cajón.'],
      ['Correderas y remate', 'Atornilla una corredera a cada lado del cajón (3 tornillos por lado). Después coloca encima del frente el remate que hace de tirador, con sus espigas y pernos, y aprieta las excéntricas.', 'Pasos 53–57 del manual. Las correderas del cajón llevan una etiqueta (…DL… o …DR…): ponlas en el lado que muestra el dibujo.'],
      ['Mete los cajones', 'Apoya las correderas del cajón sobre las del armario, inclínalo un poco y empújalo hasta el fondo.', 'Paso 58 del manual.'],
      ['¡Listo!', 'Tu armario ANKARUDDEN está montado. Gíralo para verlo desde todos los lados.', 'Guarda lo más pesado en los cajones y no pongas cosas pesadas encima del armario. Revisa de vez en cuando que las excéntricas sigan apretadas.']
    ]
  },
  en: {
    title: 'ANKARUDDEN wardrobe · Assembly 3D',
    chips: [['ANKARUDDEN', 'wardrobe 98 × 60 × 190 cm']],
    footer: 'Independent prototype, not affiliated with IKEA. The steps summarise manual AA-2615997 and the model’s measurements are approximate: if in doubt, always follow the paper manual.',
    sec: { preview: 'Preview', before: 'Before you start', carcass: 'Frame (lying down)', wall: 'Upright and on the wall', inside: 'Door tracks, rails and shelves', doors: 'Doors', drawers: 'Drawers', done: 'Finished' },
    pn: {
      bottom: 'Bottom panel', divider: 'Drawer divider', runnerCab: 'Runner (cabinet side)', railF: 'Front cross rail', railB: 'Back cross rail',
      sideL: 'Left side panel', sideR: 'Right side panel', plinthF: 'Front plinth', plinthB: 'Back plinth', fixedShelf: 'Fixed shelf', partition: 'Centre partition',
      foot: 'Plastic foot', top: 'Top panel', backHalf: 'Back panel (part {n} of 2)', clips: 'Back panel clips', pins: 'Plastic pins',
      wallBracket: 'Wall bracket', wallScrew: 'Wall screw', track: 'Door track', holder: 'Rail holder', hangRail: 'Clothes rail',
      shelfPins: 'Shelf supports', shelf: 'Shelf {n}', door: 'Door {n}', roller: 'Bottom rollers', guideTop: 'Top guides', handle: 'Handle',
      drawerFront: 'Drawer front', drawerSide: 'Drawer side', drawerBottom: 'Drawer bottom', drawerBack: 'Drawer back', drawerRunner: 'Runner (drawer side)', lip: 'Top strip of the front (handle)'
    },
    hw: {
      screwdrivers: 'Flat and Phillips screwdrivers', hammer: 'Hammer', ladder: 'Step ladder', drill8: 'Drill (8 mm bit, or 3 mm in wood)',
      sides: 'Side panels', hPanels: 'Top, bottom and fixed shelf', partition: 'Centre partition', divider: 'Drawer divider', strips: 'Cross rails and plinths',
      back: 'Back panel (2 parts)', shelves: 'Shelves', hangRails: 'Clothes rails', tracks: 'Door tracks', doors: 'Sliding doors', drawers: 'Drawers (in parts)',
      bottomPanel: 'Bottom panel', runners: 'Runners', screws: 'Screws', dowels: 'Wooden dowels', cams: 'Cam bolts and cam locks', rails: 'Cross rails',
      sideLeft: 'Left side panel', sideRight: 'Right side panel', plinths: 'Plinths', fixedShelf: 'Fixed shelf', feet: 'Plastic feet', topPanel: 'Top panel',
      clips: 'Clips', pins: 'Plastic pins', brackets: 'Wall brackets', washers: 'Washers', wallKit: 'Wall screws and plugs (included)',
      caps: 'Track end caps', holders: 'Rail holders', shelfPins: 'Shelf supports', rollers: 'Bottom rollers', guides: 'Top guides', handles: 'Handles',
      drawerFronts: 'Drawer fronts', drawerSides: 'Drawer sides', drawerBottoms: 'Drawer bottoms', drawerBacks: 'Drawer backs', drawerRunners: 'Drawer runners', lips: 'Front top strips'
    },
    steps: [
      ['Here’s the result', 'An ANKARUDDEN wardrobe, 98 × 60 × 190 cm, with two sliding doors, two clothes rails, two shelves and two drawers at the bottom. Rotate the view and press “Start assembly” when you’re ready.', 'Tap any part of the model to see its name. If something isn’t clear, ask the AI.'],
      ['Check the parts and make room', 'Unpack all 4 boxes and check that nothing is missing. Clear a patch of floor of about 2 × 1 m: the frame is assembled lying down.', 'The fittings come in bags: bag 1 is for the frame and bag 2 for the doors and drawers. The wall brackets and wall screws are in a separate bag.', 'Do it with two people: the large parts are heavy and awkward to handle alone.'],
      ['Drawer base', 'Lay cardboard on the floor and stand the bottom panel on its edge, front edge down. Screw a runner to each face of the short divider (3 screws each) and join it to the bottom panel with dowels and cam locks.', 'Manual steps 1–9. Each runner has a label (…CL… or …CR…): fit it on the face shown in the drawing.'],
      ['Cross rails', 'Put dowels in the two narrow cross rails and fit them at the front and back, level with the top of the divider. Fix them with the bolts and the Allen key.', 'Manual steps 10–12.'],
      ['Left side panel', 'Screw the runner to the inside of the side panel (3 screws) and screw in the connecting bolts. Then fit the side panel onto the drawer base and tighten the cam locks.', 'Manual steps 13–17. The manual prepares both side panels at once; here you see the left one first.'],
      ['Plinths', 'Put dowels in the two plinths and fit them at the front and back, under the bottom panel. Tighten the cam locks.', 'Manual steps 18–20.'],
      ['Fixed shelf', 'Fit the fixed shelf on top of the drawer base and tighten the cam locks. This shelf separates the drawers from the door section.', 'Manual steps 21–22.'],
      ['Centre partition and right side', 'Put dowels in the centre partition and stand it on its edge on the fixed shelf, in the middle. Then fit the right side panel, with its runner already screwed on, and tighten all the cam locks.', 'Manual step 24.'],
      ['Plastic feet', 'Push the 6 plastic feet into the bottom edges of the wardrobe.', 'Manual step 23. They protect the floor. Check the drawing in the manual for where each one goes: their position here is approximate.'],
      ['Top panel', 'Screw the bolts into the top panel, fit it onto the side panels and the centre partition, and tighten the cam locks.', 'Manual step 25. Before going on, check that the frame is square.'],
      ['Back panel', 'Fit the two parts of the back panel into the grooves in the side panels, join them with the 14 clips and fix them with the 12 plastic pins.', 'Manual steps 26–28. The back panel is what keeps the wardrobe straight: don’t skip any pins.'],
      ['Wall brackets', 'Screw the two brackets to the top panel, each with its screw and washer.', 'Manual step 29. The brackets are in the separate bag, with the wall screws and plugs.'],
      ['Stand it up', 'With two people, carefully lift the wardrobe until it is standing upright.', 'Manual step 30. While you turn it, the diagonal is almost 2 m: check first that it won’t hit the ceiling or a light.', 'Don’t lift it alone: it’s heavy and can tip over.'],
      ['Fix it to the wall', 'Move it against the wall, mark the bracket holes with a pencil, drill, insert the plugs and screw the brackets to the wall.', 'Manual steps 31–34. The included screws and plugs suit most solid and hollow walls (8 mm bit). In solid wood, use the screws only, without plugs (3 mm bit). If unsure, ask at a hardware store.', 'A wardrobe like this can tip over and crush someone. Always fix it to the wall.'],
      ['Door tracks', 'Put an end cap on each end of the 4 tracks. Press two tracks into the grooves under the top panel and two into the grooves on top of the fixed shelf, pressing by hand along the whole length.', 'Manual steps 35–37. The tracks bend a little to go in: don’t hit them.'],
      ['Clothes rails', 'Fit the 4 holders at the top, on the side panels and the centre partition, and rest the two rails on them.', 'Manual step 38.'],
      ['Shelves', 'Push the 12 shelf supports into the holes and place the two shelves on them.', 'Manual steps 39–40. You can put both shelves on the same side (one side for long clothes and one for short) or one on each side.'],
      ['Prepare the doors', 'Lay both doors on cardboard. On each one, fit 2 rollers in the bottom edge and 2 guides in the top edge until they’re fully in.', 'Manual steps 41–42 (bag 2). There are two kinds of part and each goes on one edge: check the drawing.'],
      ['Hang the doors', 'First put the top of the door into its upper track, then lower the bottom into the lower track until it clicks. Each door goes in its own track.', 'Manual steps 43–44. If a door isn’t straight, adjust it with the bottom adjusters (Min–Max) until the gap is even all along the edge.'],
      ['Door stops and handles', 'Fit the door stops as shown in the manual. Then screw a handle onto each door, with 2 screws.', 'Manual steps 45–46.'],
      ['Assemble the drawers', 'For each drawer: screw the bolts into the front, fit the two sides and tighten the cam locks. Slide the bottom into the grooves and close it with the drawer back.', 'Manual steps 47–52. Do this twice, once for each drawer.'],
      ['Runners and top strip', 'Screw a runner to each side of the drawer (3 screws per side). Then fit the strip that works as the handle on top of the front, with its dowels and bolts, and tighten the cam locks.', 'Manual steps 53–57. The drawer runners have a label (…DL… or …DR…): fit them on the side shown in the drawing.'],
      ['Put the drawers in', 'Rest the drawer runners on the cabinet runners, tilt the drawer slightly and push it all the way in.', 'Manual step 58.'],
      ['Done!', 'Your ANKARUDDEN wardrobe is assembled. Rotate it to see it from every side.', 'Keep the heaviest things in the drawers and don’t put heavy things on top of the wardrobe. Check now and then that the cam locks are still tight.']
    ]
  },
  fr: {
    title: 'ANKARUDDEN armoire · Montage 3D',
    chips: [['ANKARUDDEN', 'armoire 98 × 60 × 190 cm']],
    footer: 'Prototype indépendant, sans lien avec IKEA. Les étapes résument la notice AA-2615997 et les mesures du modèle sont approximatives : en cas de doute, suivez toujours la notice papier.',
    sec: { preview: 'Aperçu', before: 'Avant de commencer', carcass: 'Structure (couchée)', wall: 'Debout et fixée au mur', inside: 'Rails, tringles et tablettes', doors: 'Portes', drawers: 'Tiroirs', done: 'Terminé' },
    pn: {
      bottom: 'Panneau inférieur', divider: 'Séparation des tiroirs', runnerCab: 'Coulisse (côté armoire)', railF: 'Traverse avant', railB: 'Traverse arrière',
      sideL: 'Côté gauche', sideR: 'Côté droit', plinthF: 'Socle avant', plinthB: 'Socle arrière', fixedShelf: 'Tablette fixe', partition: 'Séparation centrale',
      foot: 'Patin en plastique', top: 'Panneau supérieur', backHalf: 'Fond (partie {n} sur 2)', clips: 'Clips du fond', pins: 'Chevilles en plastique',
      wallBracket: 'Équerre murale', wallScrew: 'Vis murale', track: 'Rail de porte', holder: 'Support de tringle', hangRail: 'Tringle',
      shelfPins: 'Taquets', shelf: 'Tablette {n}', door: 'Porte {n}', roller: 'Roulettes du bas', guideTop: 'Guides du haut', handle: 'Poignée',
      drawerFront: 'Façade du tiroir', drawerSide: 'Côté du tiroir', drawerBottom: 'Fond du tiroir', drawerBack: 'Arrière du tiroir', drawerRunner: 'Coulisse (côté tiroir)', lip: 'Bandeau de la façade (poignée)'
    },
    hw: {
      screwdrivers: 'Tournevis plat et cruciforme', hammer: 'Marteau', ladder: 'Escabeau', drill8: 'Perceuse (foret de 8 mm, ou 3 mm dans le bois)',
      sides: 'Côtés', hPanels: 'Panneaux supérieur, inférieur et tablette fixe', partition: 'Séparation centrale', divider: 'Séparation des tiroirs', strips: 'Traverses et socles',
      back: 'Fond (2 parties)', shelves: 'Tablettes', hangRails: 'Tringles', tracks: 'Rails des portes', doors: 'Portes coulissantes', drawers: 'Tiroirs (en pièces)',
      bottomPanel: 'Panneau inférieur', runners: 'Coulisses', screws: 'Vis', dowels: 'Chevilles en bois', cams: 'Vis d’assemblage et excentriques', rails: 'Traverses',
      sideLeft: 'Côté gauche', sideRight: 'Côté droit', plinths: 'Socles', fixedShelf: 'Tablette fixe', feet: 'Patins en plastique', topPanel: 'Panneau supérieur',
      clips: 'Clips', pins: 'Chevilles en plastique', brackets: 'Équerres murales', washers: 'Rondelles', wallKit: 'Vis et chevilles murales (incluses)',
      caps: 'Embouts des rails', holders: 'Supports de tringle', shelfPins: 'Taquets', rollers: 'Roulettes du bas', guides: 'Guides du haut', handles: 'Poignées',
      drawerFronts: 'Façades de tiroir', drawerSides: 'Côtés de tiroir', drawerBottoms: 'Fonds de tiroir', drawerBacks: 'Arrières de tiroir', drawerRunners: 'Coulisses des tiroirs', lips: 'Bandeaux des façades'
    },
    steps: [
      ['Voici le résultat', 'Une armoire ANKARUDDEN de 98 × 60 × 190 cm avec deux portes coulissantes, deux tringles, deux tablettes et deux tiroirs en bas. Faites tourner la vue et appuyez sur « Commencer le montage » quand vous êtes prêt.', 'Touchez une pièce du modèle pour voir son nom. Si quelque chose n’est pas clair, demandez à l’IA.'],
      ['Vérifiez les pièces et faites de la place', 'Déballez les 4 cartons et vérifiez qu’il ne manque rien. Libérez environ 2 × 1 m de sol : la structure se monte couchée.', 'La quincaillerie est en sachets : le 1 pour la structure et le 2 pour les portes et les tiroirs. Les équerres et les vis murales sont dans un sachet à part.', 'Montez-la à deux : les grandes pièces sont lourdes et difficiles à manier seul.'],
      ['Base des tiroirs', 'Posez du carton au sol et mettez le panneau inférieur sur la tranche, bord avant vers le bas. Vissez une coulisse sur chaque face de la séparation courte (3 vis chacune) et assemblez-la au panneau inférieur avec les chevilles et les excentriques.', 'Étapes 1 à 9 de la notice. Chaque coulisse porte une étiquette (…CL… ou …CR…) : placez-la sur la face indiquée par le dessin.'],
      ['Traverses', 'Mettez des chevilles dans les deux traverses étroites et placez-les devant et derrière, à hauteur du haut de la séparation. Fixez-les avec les vis d’assemblage et la clé Allen.', 'Étapes 10 à 12 de la notice.'],
      ['Côté gauche', 'Vissez la coulisse sur la face intérieure du côté (3 vis) et vissez les vis d’assemblage. Emboîtez ensuite le côté sur la base des tiroirs et serrez les excentriques.', 'Étapes 13 à 17 de la notice. La notice prépare les deux côtés en même temps ; ici, vous voyez d’abord le gauche.'],
      ['Socles', 'Mettez des chevilles dans les deux socles et placez-les devant et derrière, sous le panneau inférieur. Serrez les excentriques.', 'Étapes 18 à 20 de la notice.'],
      ['Tablette fixe', 'Posez la tablette fixe sur la base des tiroirs, puis serrez les excentriques. C’est elle qui sépare les tiroirs de la partie à portes.', 'Étapes 21 et 22 de la notice.'],
      ['Séparation centrale et côté droit', 'Mettez des chevilles dans la séparation centrale et posez-la sur chant, au milieu de la tablette fixe. Emboîtez ensuite le côté droit, avec sa coulisse déjà vissée, et serrez toutes les excentriques.', 'Étape 24 de la notice.'],
      ['Patins en plastique', 'Enfoncez les 6 patins en plastique dans les chants du bas de l’armoire.', 'Étape 23 de la notice. Ils protègent le sol. Regardez sur le dessin de la notice où va chacun : ici, leur position est approximative.'],
      ['Panneau supérieur', 'Vissez les vis d’assemblage dans le panneau supérieur, emboîtez-le sur les côtés et la séparation centrale, puis serrez les excentriques.', 'Étape 25 de la notice. Avant de continuer, vérifiez que la structure est bien d’équerre.'],
      ['Fond', 'Glissez les deux parties du fond dans les rainures des côtés, assemblez-les avec les 14 clips et fixez-les avec les 12 chevilles en plastique.', 'Étapes 26 à 28 de la notice. C’est le fond qui garde l’armoire droite : ne sautez aucune cheville.'],
      ['Équerres murales', 'Vissez les deux équerres sur le panneau supérieur, chacune avec sa vis et sa rondelle.', 'Étape 29 de la notice. Les équerres sont dans le sachet à part, avec les vis et chevilles murales.'],
      ['Redressez-la', 'À deux, soulevez l’armoire avec précaution jusqu’à ce qu’elle soit debout.', 'Étape 30 de la notice. En la tournant, sa diagonale fait presque 2 m : vérifiez d’abord qu’elle ne touchera ni le plafond ni un luminaire.', 'Ne la soulevez pas seul : elle est lourde et peut basculer.'],
      ['Fixez-la au mur', 'Placez-la contre le mur, marquez au crayon les trous des équerres, percez, mettez les chevilles et vissez les équerres au mur.', 'Étapes 31 à 34 de la notice. Les vis et chevilles fournies conviennent à la plupart des murs pleins et creux (foret de 8 mm). Dans le bois massif, utilisez seulement les vis, sans chevilles (foret de 3 mm). En cas de doute, demandez conseil en magasin de bricolage.', 'Une armoire comme celle-ci peut basculer et écraser quelqu’un. Fixez-la toujours au mur.'],
      ['Rails des portes', 'Mettez un embout à chaque bout des 4 rails. Enfoncez deux rails dans les rainures sous le panneau supérieur et deux dans celles du dessus de la tablette fixe, en appuyant à la main sur toute la longueur.', 'Étapes 35 à 37 de la notice. Les rails se courbent un peu pour entrer : ne tapez pas dessus.'],
      ['Tringles', 'Fixez les 4 supports en haut, sur les côtés et la séparation centrale, et posez les deux tringles dessus.', 'Étape 38 de la notice.'],
      ['Tablettes', 'Enfoncez les 12 taquets dans les trous et posez les deux tablettes dessus.', 'Étapes 39 et 40 de la notice. Vous pouvez mettre les deux tablettes du même côté (un côté pour les vêtements longs, l’autre pour les courts) ou une de chaque côté.'],
      ['Préparez les portes', 'Posez les deux portes sur du carton. Sur chacune, enfoncez 2 roulettes dans le chant du bas et 2 guides dans celui du haut, jusqu’au bout.', 'Étapes 41 et 42 de la notice (sachet 2). Il y a deux sortes de pièces et chacune va sur un chant : regardez le dessin.'],
      ['Posez les portes', 'Engagez d’abord le haut de la porte dans son rail supérieur, puis descendez le bas dans le rail inférieur jusqu’au clic. Chaque porte va dans son propre rail.', 'Étapes 43 et 44 de la notice. Si une porte n’est pas droite, réglez-la avec les molettes du bas (Min–Max) jusqu’à ce que l’écart soit régulier sur tout le bord.'],
      ['Butées et poignées', 'Posez les butées des portes comme indiqué dans la notice. Vissez ensuite une poignée sur chaque porte, avec 2 vis.', 'Étapes 45 et 46 de la notice.'],
      ['Montez les tiroirs', 'Pour chaque tiroir : vissez les vis d’assemblage dans la façade, placez les deux côtés et serrez les excentriques. Glissez le fond dans les rainures et fermez avec l’arrière du tiroir.', 'Étapes 47 à 52 de la notice. À faire deux fois, une par tiroir.'],
      ['Coulisses et bandeau', 'Vissez une coulisse de chaque côté du tiroir (3 vis par côté). Posez ensuite sur la façade le bandeau qui sert de poignée, avec ses chevilles et ses vis d’assemblage, et serrez les excentriques.', 'Étapes 53 à 57 de la notice. Les coulisses du tiroir portent une étiquette (…DL… ou …DR…) : placez-les du côté indiqué par le dessin.'],
      ['Mettez les tiroirs', 'Posez les coulisses du tiroir sur celles de l’armoire, inclinez-le un peu et poussez-le jusqu’au fond.', 'Étape 58 de la notice.'],
      ['C’est fini !', 'Votre armoire ANKARUDDEN est montée. Faites-la tourner pour la voir sous tous les angles.', 'Rangez le plus lourd dans les tiroirs et ne posez rien de lourd sur l’armoire. Vérifiez de temps en temps que les excentriques sont toujours serrées.']
    ]
  },
  nl: {
    title: 'ANKARUDDEN kledingkast · Montage 3D',
    chips: [['ANKARUDDEN', 'kledingkast 98 × 60 × 190 cm']],
    footer: 'Onafhankelijk prototype, niet verbonden aan IKEA. De stappen vatten handleiding AA-2615997 samen en de maten van het model zijn bij benadering: volg bij twijfel altijd de papieren handleiding.',
    sec: { preview: 'Voorbeeld', before: 'Voordat je begint', carcass: 'Kast (liggend)', wall: 'Rechtop en aan de muur', inside: 'Rails, roedes en planken', doors: 'Deuren', drawers: 'Lades', done: 'Klaar' },
    pn: {
      bottom: 'Onderpaneel', divider: 'Tussenwand van de lades', runnerCab: 'Ladegeleider (kastkant)', railF: 'Voorste regel', railB: 'Achterste regel',
      sideL: 'Linker zijpaneel', sideR: 'Rechter zijpaneel', plinthF: 'Voorste plint', plinthB: 'Achterste plint', fixedShelf: 'Vaste plank', partition: 'Middenwand',
      foot: 'Kunststof voetje', top: 'Bovenpaneel', backHalf: 'Achterwand (deel {n} van 2)', clips: 'Clips van de achterwand', pins: 'Kunststof pennen',
      wallBracket: 'Muurbeugel', wallScrew: 'Muurschroef', track: 'Deurrail', holder: 'Roedehouder', hangRail: 'Kledingroede',
      shelfPins: 'Plankdragers', shelf: 'Plank {n}', door: 'Deur {n}', roller: 'Onderste wieltjes', guideTop: 'Bovenste geleiders', handle: 'Handgreep',
      drawerFront: 'Ladefront', drawerSide: 'Zijkant van de lade', drawerBottom: 'Ladebodem', drawerBack: 'Achterkant van de lade', drawerRunner: 'Ladegeleider (ladekant)', lip: 'Bovenlijst van het front (greep)'
    },
    hw: {
      screwdrivers: 'Platte- en kruiskopschroevendraaiers', hammer: 'Hamer', ladder: 'Trapladder', drill8: 'Boormachine (boor van 8 mm, of 3 mm in hout)',
      sides: 'Zijpanelen', hPanels: 'Boven-, onderpaneel en vaste plank', partition: 'Middenwand', divider: 'Tussenwand van de lades', strips: 'Regels en plinten',
      back: 'Achterwand (2 delen)', shelves: 'Planken', hangRails: 'Kledingroedes', tracks: 'Deurrails', doors: 'Schuifdeuren', drawers: 'Lades (in onderdelen)',
      bottomPanel: 'Onderpaneel', runners: 'Ladegeleiders', screws: 'Schroeven', dowels: 'Houten deuvels', cams: 'Verbindingsbouten en excenters', rails: 'Regels',
      sideLeft: 'Linker zijpaneel', sideRight: 'Rechter zijpaneel', plinths: 'Plinten', fixedShelf: 'Vaste plank', feet: 'Kunststof voetjes', topPanel: 'Bovenpaneel',
      clips: 'Clips', pins: 'Kunststof pennen', brackets: 'Muurbeugels', washers: 'Ringen', wallKit: 'Muurschroeven en pluggen (meegeleverd)',
      caps: 'Eindkappen van de rails', holders: 'Roedehouders', shelfPins: 'Plankdragers', rollers: 'Onderste wieltjes', guides: 'Bovenste geleiders', handles: 'Handgrepen',
      drawerFronts: 'Ladefronten', drawerSides: 'Zijkanten van de lades', drawerBottoms: 'Ladebodems', drawerBacks: 'Achterkanten van de lades', drawerRunners: 'Ladegeleiders', lips: 'Bovenlijsten van de fronten'
    },
    steps: [
      ['Zo ziet het eruit', 'Een ANKARUDDEN kledingkast van 98 × 60 × 190 cm met twee schuifdeuren, twee kledingroedes, twee planken en onderaan twee lades. Draai het beeld en druk op ‘Begin met monteren’ als je klaar bent.', 'Tik op een onderdeel van het model om de naam te zien. Is iets niet duidelijk? Vraag het de AI.'],
      ['Controleer de onderdelen en maak plaats', 'Pak alle 4 dozen uit en controleer of er niets ontbreekt. Maak ongeveer 2 × 1 m vloer vrij: de kast wordt liggend gemonteerd.', 'Het beslag zit in zakjes: zakje 1 is voor de kast en zakje 2 voor de deuren en lades. De muurbeugels en muurschroeven zitten in een apart zakje.', 'Doe het met z’n tweeën: de grote onderdelen zijn zwaar en lastig om alleen te hanteren.'],
      ['Basis voor de lades', 'Leg karton op de vloer en zet het onderpaneel op zijn kant, met de voorkant naar beneden. Schroef op elke kant van de korte tussenwand een ladegeleider (3 schroeven elk) en zet hem met deuvels en excenters vast op het onderpaneel.', 'Stap 1–9 van de handleiding. Elke geleider heeft een label (…CL… of …CR…): zet hem op de kant die de tekening aangeeft.'],
      ['Regels', 'Steek deuvels in de twee smalle regels en zet ze voor en achter, ter hoogte van de bovenkant van de tussenwand. Zet ze vast met de bouten en de inbussleutel.', 'Stap 10–12 van de handleiding.'],
      ['Linker zijpaneel', 'Schroef de ladegeleider aan de binnenkant van het zijpaneel (3 schroeven) en draai de verbindingsbouten erin. Zet het zijpaneel daarna op de basis voor de lades en draai de excenters vast.', 'Stap 13–17 van de handleiding. In de handleiding worden beide zijpanelen tegelijk voorbereid; hier zie je eerst het linker.'],
      ['Plinten', 'Steek deuvels in de twee plinten en zet ze voor en achter, onder het onderpaneel. Draai de excenters vast.', 'Stap 18–20 van de handleiding.'],
      ['Vaste plank', 'Leg de vaste plank op de basis voor de lades en draai de excenters vast. Deze plank scheidt de lades van het deel met de deuren.', 'Stap 21–22 van de handleiding.'],
      ['Middenwand en rechter zijpaneel', 'Steek deuvels in de middenwand en zet hem op zijn kant op de vaste plank, in het midden. Zet daarna het rechter zijpaneel erop, met de ladegeleider al vastgeschroefd, en draai alle excenters vast.', 'Stap 24 van de handleiding.'],
      ['Kunststof voetjes', 'Druk de 6 kunststof voetjes in de onderste randen van de kast.', 'Stap 23 van de handleiding. Ze beschermen de vloer. Kijk op de tekening in de handleiding waar elk voetje komt: hier is hun plaats bij benadering.'],
      ['Bovenpaneel', 'Draai de bouten in het bovenpaneel, zet het op de zijpanelen en de middenwand en draai de excenters vast.', 'Stap 25 van de handleiding. Controleer voordat je verdergaat of de kast haaks staat.'],
      ['Achterwand', 'Schuif de twee delen van de achterwand in de groeven van de zijpanelen, verbind ze met de 14 clips en zet ze vast met de 12 kunststof pennen.', 'Stap 26–28 van de handleiding. De achterwand houdt de kast recht: sla geen enkele pen over.'],
      ['Muurbeugels', 'Schroef de twee muurbeugels op het bovenpaneel, elk met een schroef en een ring.', 'Stap 29 van de handleiding. De beugels zitten in het aparte zakje, met de muurschroeven en pluggen.'],
      ['Zet hem rechtop', 'Til de kast met z’n tweeën voorzichtig op tot hij rechtop staat.', 'Stap 30 van de handleiding. Tijdens het draaien is de diagonaal bijna 2 m: controleer eerst of hij niet tegen het plafond of een lamp komt.', 'Til hem niet alleen op: hij is zwaar en kan omvallen.'],
      ['Bevestig hem aan de muur', 'Zet de kast tegen de muur, teken de gaten van de beugels af met een potlood, boor, steek de pluggen erin en schroef de beugels aan de muur.', 'Stap 31–34 van de handleiding. De meegeleverde schroeven en pluggen zijn geschikt voor de meeste massieve en holle muren (boor van 8 mm). In massief hout gebruik je alleen de schroeven, zonder pluggen (boor van 3 mm). Twijfel je, vraag dan advies in een bouwmarkt.', 'Een kast als deze kan omvallen en iemand verpletteren. Bevestig hem altijd aan de muur.'],
      ['Deurrails', 'Zet een eindkap op elk uiteinde van de 4 rails. Druk twee rails in de groeven onder het bovenpaneel en twee in de groeven op de vaste plank, met de hand over de hele lengte.', 'Stap 35–37 van de handleiding. De rails buigen een beetje om erin te gaan: sla er niet op.'],
      ['Kledingroedes', 'Zet de 4 roedehouders bovenaan op de zijpanelen en de middenwand en leg de twee roedes erop.', 'Stap 38 van de handleiding.'],
      ['Planken', 'Druk de 12 plankdragers in de gaten en leg de twee planken erop.', 'Stap 39–40 van de handleiding. Je kunt beide planken aan dezelfde kant leggen (één kant voor lange en één voor korte kleding) of aan elke kant één.'],
      ['Bereid de deuren voor', 'Leg beide deuren op karton. Druk in elke deur 2 wieltjes in de onderrand en 2 geleiders in de bovenrand, tot ze helemaal vastzitten.', 'Stap 41–42 van de handleiding (zakje 2). Er zijn twee soorten onderdelen en elk gaat in een andere rand: kijk goed naar de tekening.'],
      ['Hang de deuren op', 'Steek eerst de bovenkant van de deur in de bovenste rail en laat daarna de onderkant in de onderste rail zakken tot je een klik hoort. Elke deur loopt in zijn eigen rail.', 'Stap 43–44 van de handleiding. Hangt een deur scheef, stel hem dan bij met de stelwieltjes onderaan (Min–Max) tot de kier overal gelijk is.'],
      ['Deurstoppers en handgrepen', 'Plaats de deurstoppers zoals in de handleiding staat. Schroef daarna op elke deur een handgreep, met 2 schroeven.', 'Stap 45–46 van de handleiding.'],
      ['Monteer de lades', 'Voor elke lade: draai de bouten in het front, zet de twee zijkanten erop en draai de excenters vast. Schuif de bodem in de groeven en sluit af met de achterkant van de lade.', 'Stap 47–52 van de handleiding. Dit doe je twee keer, één keer per lade.'],
      ['Geleiders en bovenlijst', 'Schroef aan elke kant van de lade een geleider (3 schroeven per kant). Zet daarna de lijst die als greep dient bovenop het front, met de deuvels en bouten, en draai de excenters vast.', 'Stap 53–57 van de handleiding. De geleiders van de lade hebben een label (…DL… of …DR…): zet ze aan de kant die de tekening aangeeft.'],
      ['Schuif de lades erin', 'Zet de geleiders van de lade op die van de kast, kantel de lade een beetje en duw hem helemaal naar binnen.', 'Stap 58 van de handleiding.'],
      ['Klaar!', 'Je ANKARUDDEN kledingkast is gemonteerd. Draai hem rond om hem van alle kanten te bekijken.', 'Leg het zwaarste in de lades en zet niets zwaars bovenop de kast. Controleer af en toe of de excenters nog vastzitten.']
    ]
  }
};
