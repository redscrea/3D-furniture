/* KALLAX en cualquier tamaño (columnas × filas de cubos).
   Lo usan las entradas kallax-CxF del catálogo y también el escritorio KALLAX + INLÄGG + OLOV.

   Medidas aproximadas: tableros exteriores de 3,9 cm, interiores de 1,65 cm, cubos de 33,5 cm, fondo 39 cm.
   El orden de montaje es una reconstrucción (de pie, fila a fila) y hay que compararlo con el manual en papel:
   ver «Supuestos a revisar» en el README. */

export const TH = 3.9, t = 1.65, C = 33.5, DEPTH = 39;

export function kallaxGeometry(cols, rows) {
  const W = 2 * TH + cols * C + (cols - 1) * t, H = 2 * TH + rows * C + (rows - 1) * t;
  const xL = -W / 2 + TH, xR = W / 2 - TH;
  return {
    W, H, xL, xR,
    rowBottom: r => TH + r * (C + t),
    colLeft: j => xL + j * (C + t),
    cubeCx: j => xL + j * (C + t) + C / 2,
    scale: Math.max(.6, Math.max(W, H) / 182)
  };
}

/**
 * Añade las piezas de un KALLAX y devuelve sus pasos (sin vista previa ni final),
 * numerados a partir de `start`. Cada paso lleva `key` (y `k` si es una fila) para buscar su texto.
 * opts.wallKey / opts.wallQ: nombre y cantidad de la fijación a la pared (cantidad solo si está comprobada).
 */
export function addKallax(ctx, { cols, rows }, start, opts = {}) {
  const { addPart, box, cyl, group, COL } = ctx;
  const g = kallaxGeometry(cols, rows);
  const { W, H, xL, xR, rowBottom, colLeft, scale: s } = g;
  const D = DEPTH, nDiv = cols - 1, nShelf = rows - 1;
  const steps = [];
  const push = st => { steps.push({ sec: 'kallax', ...st }); return start + steps.length - 1; };
  const rowCam = r => { const y = rowBottom(r) + 17; return [135 * s, y + 85 * s, 235 * s, 0, y, 20]; };
  const topCam = [150 * s, H + 78 * s, 270 * s, 0, H - 14, 20];
  const sidesCam = [255 * s, H * .9, 340 * s, 0, H / 2, 20];
  const wallHw = [['personas', 'people', 2], ['escuadra', opts.wallKey || 'wallFix', opts.wallQ], ['taladro', 'drillShort'], ['tornillo', 'wallScrews']];
  const dowelRow = (y) => { const d = []; for (let j = 1; j <= nDiv; j++) { const x = colLeft(j) - t / 2; for (const z of [9, 30]) d.push(cyl(.6, 3, COL.dowel, [x, y, z])); } return group(...d); };

  if (cols >= 2) {
    const sBase = push({ key: 'base', cam: [125 * s, 95 * s, 215 * s, 0, 6, 20 * s], hw: [['carton', 'cardboardFloor'], ['panel', 'bottomPanel', 1], ['espiga', 'dowels']] });
    const rowStep = [];
    rowStep[0] = push({ key: 'row1', cam: rowCam(0), hw: [['separador', 'dividers', nDiv], ['espiga', 'dowels']] });
    const sFirstShelf = rows >= 2 ? push({ key: 'firstShelf', cam: rowCam(1), hw: [['panel', 'longShelf', 1]] }) : null;
    for (let r = 1; r < rows; r++) {
      const k = r + 1, last = r === rows - 1;
      const key = last ? 'lastRow' : k === 2 ? 'row2' : k === rows - 1 ? 'rowLastShelf' : 'rowMid';
      rowStep[r] = push({ key, k, cam: rowCam(r), hw: last ? [['separador', 'dividers', nDiv], ['espiga', 'dowels']] : [['separador', 'dividers', nDiv], ['espiga', 'dowels'], ['panel', 'longShelf', 1]] });
    }
    const sTop = push({ key: 'top', cam: topCam, hw: [['panel', 'topPanel', 1]] });
    const sSides = push({ key: 'sides', cam: sidesCam, hw: [['panel', 'sides', 2], ['allen', 'allen']] });
    const sWall = push({ key: 'wall', cam: [170 * s, H + 68 * s, 260 * s, 0, H - 17, 0], hw: wallHw });

    addPart({ key: 'bottom', obj: box([xL, 0, 0], [xR, TH, D], COL.wood), step: sBase, enter: [0, 30, 0] });
    for (let k = 1; k < rows; k++) {
      const y = rowBottom(k);
      addPart({ key: 'shelf', n: k, obj: box([xL, y - t, 0], [xR, y, D], COL.wood), step: k === 1 ? sFirstShelf : rowStep[k - 1], sub: k === 1 ? 0 : cols + 1, enter: [0, 45, 0] });
    }
    for (let r = 0; r < rows; r++) {
      const y0 = rowBottom(r), y1 = y0 + C, subBase = r === 0 ? 0 : 1;
      addPart({ key: 'dowels', obj: dowelRow(y0), step: r === 0 ? sBase : rowStep[r], sub: r === 0 ? 1 : 0, enter: [0, 10, 0], zx: 48 });
      for (let j = 1; j <= nDiv; j++) {
        const x = colLeft(j);
        addPart({ key: 'divider', n: r + 1, obj: box([x - t, y0, 0], [x, y1, D], COL.wood), step: rowStep[r], sub: subBase + j - 1, enter: [0, 34, 0], zx: 24 });
      }
      addPart({ key: 'dowels', obj: dowelRow(y1), step: rowStep[r], sub: subBase + nDiv, enter: [0, 10, 0], zx: 48 });
    }
    addPart({ key: 'top', obj: box([xL, H - TH, 0], [xR, H, D], COL.wood), step: sTop, enter: [0, 40, 0] });
    addPart({ key: 'sideL', obj: box([-W / 2, 0, 0], [xL, H, D], COL.wood), step: sSides, sub: 0, enter: [-50, 0, 0] });
    addPart({ key: 'sideR', obj: box([xR, 0, 0], [W / 2, H, D], COL.wood), step: sSides, sub: 2, enter: [50, 0, 0] });
    addWallBrackets(ctx, [-(W / 2 - 23), W / 2 - 23], H, sWall);
  } else {
    // Una sola columna: no hay separadores, así que las baldas se fijan primero a un lateral.
    const sBase = push({ key: 'base1', cam: [125 * s, 95 * s, 215 * s, 0, 6, 20 * s], hw: [['carton', 'cardboardFloor'], ['panel', 'bottomPanel', 1]] });
    const sSideL = push({ key: 'sideL1', cam: [-150 * s, H * .75, 270 * s, 0, H / 2, 20], hw: [['panel', 'sideL1', 1], ['espiga', 'dowels'], ['allen', 'allen']] });
    const sShelves = push({ key: 'shelves1', cam: [160 * s, H * .8, 290 * s, 0, H / 2, 20], hw: [['panel', 'shelves1', nShelf]] });
    const sTop = push({ key: 'top1', cam: topCam, hw: [['panel', 'topPanel', 1]] });
    const sSideR = push({ key: 'sideR1', cam: sidesCam, hw: [['panel', 'sideR1', 1], ['allen', 'allen']] });
    const sWall = push({ key: 'wall', cam: [170 * s, H + 68 * s, 260 * s, 0, H - 17, 0], hw: wallHw });

    addPart({ key: 'bottom', obj: box([xL, 0, 0], [xR, TH, D], COL.wood), step: sBase, enter: [0, 30, 0] });
    addPart({ key: 'sideL', obj: box([-W / 2, 0, 0], [xL, H, D], COL.wood), step: sSideL, enter: [-45, 0, 0] });
    for (let k = 1; k < rows; k++) {
      const y = rowBottom(k);
      addPart({ key: 'shelf1', n: k, obj: box([xL, y - t, 0], [xR, y, D], COL.wood), step: sShelves, sub: k - 1, enter: [45, 0, 0], zx: 20 });
    }
    addPart({ key: 'top', obj: box([xL, H - TH, 0], [xR, H, D], COL.wood), step: sTop, enter: [0, 40, 0] });
    addPart({ key: 'sideR', obj: box([xR, 0, 0], [W / 2, H, D], COL.wood), step: sSideR, enter: [50, 0, 0] });
    addWallBrackets(ctx, [0], H, sWall);
  }
  return { steps, geo: g };
}

function addWallBrackets({ addPart, box, cyl, group, COL }, xs, H, step) {
  xs.forEach((x, i) => {
    const g = group(
      box([x - 2.2, H, -1.25], [x + 2.2, H + .35, 7], COL.metal, { metal: true, edges: false }),
      box([x - 2.2, H, -1.25], [x + 2.2, H + 8, -.9], COL.metal, { metal: true, edges: false }),
      cyl(.7, .5, COL.dark, [x, H + 5.2, -.7], 'z', true),
      cyl(.7, .5, COL.dark, [x, H + .55, 4], 'y', true)
    );
    addPart({ key: 'wallBracket', obj: g, step, sub: i * 2, enter: [0, 22, 12], zx: 12 });
  });
}

/* =================== Textos =================== */
const n1 = (n, one, many) => n === 1 ? one : many.replace('{n}', n);

/** Textos de los pasos de KALLAX por idioma. p = { cols, rows, w, h }; cada función recibe el paso (con k). */
export function kallaxStepTexts(lang, { cols, rows }) {
  const D = cols - 1, S = rows - 1, R = rows;
  const X = {
    es: () => {
      const dv = n1(D, 'el separador', '{n} separadores');
      const manual = 'El manual monta el KALLAX tumbado sobre su espalda. Aquí lo ves de pie para que se entienda mejor; si tu manual sigue otro orden, haz caso al manual.';
      const tight = 'Aprieta lo justo: si fuerzas los herrajes, el tablero se puede agrietar.';
      return {
        base: ['Base y espigas', 'Pon cartón en el suelo. Coloca el panel inferior y mete las espigas de madera en los agujeros de arriba, hasta la mitad.', manual],
        row1: ['Fila 1: separadores', (D === 1 ? 'Encaja el separador corto sobre las espigas. Después pon espigas en su parte de arriba.' : `Encaja los ${D} separadores cortos sobre las espigas, uno en cada línea de agujeros. Después pon espigas en la parte de arriba de cada separador.`) + (R === 1 ? ' Esta fila la cierra el panel superior.' : '')],
        firstShelf: ['Primera balda larga', 'Baja la balda larga encima de los separadores, alineando sus agujeros con las espigas.', 'Presiona a lo largo de toda la balda para que entre igual en todas las espigas.'],
        row2: () => ['Fila 2', `Repite lo mismo: espigas en la balda, ${dv}, espigas arriba y la siguiente balda larga.`],
        rowMid: s => [`Fila ${s.k}`, `Otra fila igual: espigas, ${dv}, espigas y balda larga.`],
        rowLastShelf: s => [`Fila ${s.k}`, 'Una fila más, con la última balda larga.'],
        lastRow: s => [`Fila ${s.k}: últimos separadores`, D === 1 ? 'Coloca el último separador y pon espigas en su parte de arriba. Esta fila no lleva balda: la cierra el panel superior.' : `Coloca los ${D} últimos separadores y pon espigas en su parte de arriba. Esta fila no lleva balda: la cierra el panel superior.`],
        top: ['Panel superior', 'Baja el panel superior sobre las espigas de la última fila y presiónalo por igual.'],
        sides: ['Laterales', `Coloca un lateral a cada lado, encajado en ${S ? 'las baldas y en ' : ''}los paneles de arriba y abajo. Fíjalos con los herrajes y la llave Allen.`, tight],
        base1: ['Panel inferior', 'Pon cartón en el suelo y coloca el panel inferior.', manual],
        sideL1: ['Lateral izquierdo', 'Mete las espigas en el lateral izquierdo y encájalo en el panel inferior. Fíjalo con los herrajes y la llave Allen.', tight],
        shelves1: ['Baldas', S === 1 ? 'Encaja la balda en el lateral izquierdo y fíjala con los herrajes.' : `Encaja las ${S} baldas en el lateral izquierdo, de abajo arriba, y fíjalas con los herrajes.`],
        top1: ['Panel superior', 'Encaja el panel superior en el lateral izquierdo y fíjalo con los herrajes.'],
        sideR1: ['Lateral derecho', 'Cierra con el lateral derecho, encajado en las baldas y en los paneles de arriba y abajo. Fíjalo con los herrajes y la llave Allen.', tight],
        wall: ['Ponlo de pie y fíjalo a la pared', 'Entre dos personas, levanta el mueble y apóyalo contra la pared. Atornilla la fijación al panel superior y a la pared.', null, 'Un mueble así puede volcar y aplastar a alguien. Fíjalo siempre a la pared. Elige tornillos y tacos según el tipo de pared.']
      };
    },
    en: () => {
      const dv = n1(D, 'the divider', '{n} dividers');
      const manual = 'The manual assembles KALLAX lying on its back. Here it’s shown upright so it’s easier to follow; if your manual uses a different order, follow the manual.';
      const tight = 'Tighten just enough: forcing the fittings can crack the board.';
      return {
        base: ['Base and dowels', 'Lay cardboard on the floor. Place the bottom panel and push wooden dowels halfway into the holes on top.', manual],
        row1: ['Row 1: dividers', (D === 1 ? 'Fit the short divider onto the dowels. Then put dowels in its top.' : `Fit the ${D} short dividers onto the dowels, one on each line of holes. Then put dowels in the top of each divider.`) + (R === 1 ? ' The top panel closes this row.' : '')],
        firstShelf: ['First long shelf', 'Lower the long shelf onto the dividers, lining up its holes with the dowels.', 'Press along the whole length of the shelf so it goes onto all the dowels evenly.'],
        row2: () => ['Row 2', `Repeat the same: dowels in the shelf, ${dv}, dowels on top and the next long shelf.`],
        rowMid: s => [`Row ${s.k}`, `Another identical row: dowels, ${dv}, dowels and a long shelf.`],
        rowLastShelf: s => [`Row ${s.k}`, 'One more row, with the last long shelf.'],
        lastRow: s => [`Row ${s.k}: last dividers`, D === 1 ? 'Fit the last divider and put dowels in its top. This row has no shelf: the top panel closes it.' : `Fit the last ${D} dividers and put dowels in their tops. This row has no shelf: the top panel closes it.`],
        top: ['Top panel', 'Lower the top panel onto the dowels of the last row and press it down evenly.'],
        sides: ['Side panels', `Fit a side panel on each side, onto ${S ? 'the shelves and ' : ''}the top and bottom panels. Fix them with the fittings and the Allen key.`, tight],
        base1: ['Bottom panel', 'Lay cardboard on the floor and place the bottom panel.', manual],
        sideL1: ['Left side panel', 'Put dowels in the left side panel and fit it onto the bottom panel. Fix it with the fittings and the Allen key.', tight],
        shelves1: ['Shelves', S === 1 ? 'Fit the shelf into the left side panel and fix it with the fittings.' : `Fit the ${S} shelves into the left side panel, from the bottom up, and fix them with the fittings.`],
        top1: ['Top panel', 'Fit the top panel onto the left side panel and fix it with the fittings.'],
        sideR1: ['Right side panel', 'Close it with the right side panel, fitted onto the shelves and the top and bottom panels. Fix it with the fittings and the Allen key.', tight],
        wall: ['Stand it up and fix it to the wall', 'With two people, lift the unit and stand it against the wall. Screw the wall fixing to the top panel and to the wall.', null, 'A unit like this can tip over and crush someone. Always fix it to the wall. Choose screws and plugs that suit your type of wall.']
      };
    },
    fr: () => {
      const dv = n1(D, 'la séparation', '{n} séparations');
      const manual = 'La notice monte le KALLAX couché sur le dos. Ici, il est montré debout pour mieux comprendre ; si votre notice suit un autre ordre, suivez la notice.';
      const tight = 'Serrez juste ce qu’il faut : en forçant sur les ferrures, le panneau peut se fendre.';
      return {
        base: ['Base et chevilles', 'Posez du carton au sol. Placez le panneau inférieur et enfoncez les chevilles en bois à moitié dans les trous du dessus.', manual],
        row1: ['Rangée 1 : séparations', (D === 1 ? 'Emboîtez la séparation courte sur les chevilles. Mettez ensuite des chevilles sur son dessus.' : `Emboîtez les ${D} séparations courtes sur les chevilles, une par ligne de trous. Mettez ensuite des chevilles sur le dessus de chaque séparation.`) + (R === 1 ? ' C’est le panneau supérieur qui ferme cette rangée.' : '')],
        firstShelf: ['Première tablette longue', 'Posez la tablette longue sur les séparations en alignant ses trous avec les chevilles.', 'Appuyez sur toute la longueur de la tablette pour qu’elle s’enfonce de façon égale sur toutes les chevilles.'],
        row2: () => ['Rangée 2', `Recommencez : chevilles dans la tablette, ${dv}, chevilles sur le dessus et la tablette longue suivante.`],
        rowMid: s => [`Rangée ${s.k}`, `Encore une rangée identique : chevilles, ${dv}, chevilles et tablette longue.`],
        rowLastShelf: s => [`Rangée ${s.k}`, 'Une rangée de plus, avec la dernière tablette longue.'],
        lastRow: s => [`Rangée ${s.k} : dernières séparations`, D === 1 ? 'Placez la dernière séparation et mettez des chevilles sur son dessus. Cette rangée n’a pas de tablette : c’est le panneau supérieur qui la ferme.' : `Placez les ${D} dernières séparations et mettez des chevilles sur leur dessus. Cette rangée n’a pas de tablette : c’est le panneau supérieur qui la ferme.`],
        top: ['Panneau supérieur', 'Posez le panneau supérieur sur les chevilles de la dernière rangée et appuyez de façon égale.'],
        sides: ['Côtés', `Placez un côté de chaque part, emboîté sur ${S ? 'les tablettes et ' : ''}les panneaux haut et bas. Fixez-les avec les ferrures et la clé Allen.`, tight],
        base1: ['Panneau inférieur', 'Posez du carton au sol et placez le panneau inférieur.', manual],
        sideL1: ['Côté gauche', 'Mettez les chevilles dans le côté gauche et emboîtez-le sur le panneau inférieur. Fixez-le avec les ferrures et la clé Allen.', tight],
        shelves1: ['Tablettes', S === 1 ? 'Emboîtez la tablette dans le côté gauche et fixez-la avec les ferrures.' : `Emboîtez les ${S} tablettes dans le côté gauche, de bas en haut, et fixez-les avec les ferrures.`],
        top1: ['Panneau supérieur', 'Emboîtez le panneau supérieur dans le côté gauche et fixez-le avec les ferrures.'],
        sideR1: ['Côté droit', 'Fermez avec le côté droit, emboîté sur les tablettes et les panneaux haut et bas. Fixez-le avec les ferrures et la clé Allen.', tight],
        wall: ['Redressez-le et fixez-le au mur', 'À deux, soulevez le meuble et placez-le contre le mur. Vissez la fixation murale sur le panneau supérieur et au mur.', null, 'Un meuble comme celui-ci peut basculer et écraser quelqu’un. Fixez-le toujours au mur. Choisissez des vis et des chevilles adaptées à votre mur.']
      };
    },
    nl: () => {
      const dv = n1(D, 'de tussenwand', '{n} tussenwanden');
      const manual = 'In de handleiding wordt KALLAX liggend op de rug gemonteerd. Hier zie je hem rechtop zodat het makkelijker te volgen is; volgt jouw handleiding een andere volgorde, volg dan de handleiding.';
      const tight = 'Draai niet te hard aan: als je het beslag forceert, kan het paneel scheuren.';
      return {
        base: ['Basis en deuvels', 'Leg karton op de vloer. Plaats het onderpaneel en duw de houten deuvels tot de helft in de gaten aan de bovenkant.', manual],
        row1: ['Rij 1: tussenwanden', (D === 1 ? 'Zet de korte tussenwand op de deuvels. Steek daarna deuvels in de bovenkant.' : `Zet de ${D} korte tussenwanden op de deuvels, één op elke rij gaten. Steek daarna deuvels in de bovenkant van elke tussenwand.`) + (R === 1 ? ' Het bovenpaneel sluit deze rij af.' : '')],
        firstShelf: ['Eerste lange plank', 'Laat de lange plank op de tussenwanden zakken en lijn de gaten uit met de deuvels.', 'Druk over de hele lengte van de plank zodat hij gelijkmatig over alle deuvels gaat.'],
        row2: () => ['Rij 2', `Herhaal hetzelfde: deuvels in de plank, ${dv}, deuvels erbovenop en de volgende lange plank.`],
        rowMid: s => [`Rij ${s.k}`, `Nog een rij hetzelfde: deuvels, ${dv}, deuvels en een lange plank.`],
        rowLastShelf: s => [`Rij ${s.k}`, 'Nog één rij, met de laatste lange plank.'],
        lastRow: s => [`Rij ${s.k}: laatste tussenwanden`, D === 1 ? 'Plaats de laatste tussenwand en steek deuvels in de bovenkant. Deze rij heeft geen plank: het bovenpaneel sluit hem af.' : `Plaats de laatste ${D} tussenwanden en steek deuvels in de bovenkant. Deze rij heeft geen plank: het bovenpaneel sluit hem af.`],
        top: ['Bovenpaneel', 'Laat het bovenpaneel op de deuvels van de laatste rij zakken en druk het gelijkmatig aan.'],
        sides: ['Zijpanelen', `Plaats aan elke kant een zijpaneel over ${S ? 'de planken en ' : ''}het boven- en onderpaneel. Zet ze vast met het beslag en de inbussleutel.`, tight],
        base1: ['Onderpaneel', 'Leg karton op de vloer en plaats het onderpaneel.', manual],
        sideL1: ['Linker zijpaneel', 'Steek deuvels in het linker zijpaneel en zet het op het onderpaneel. Zet het vast met het beslag en de inbussleutel.', tight],
        shelves1: ['Planken', S === 1 ? 'Zet de plank in het linker zijpaneel en zet hem vast met het beslag.' : `Zet de ${S} planken in het linker zijpaneel, van onder naar boven, en zet ze vast met het beslag.`],
        top1: ['Bovenpaneel', 'Zet het bovenpaneel op het linker zijpaneel en zet het vast met het beslag.'],
        sideR1: ['Rechter zijpaneel', 'Sluit af met het rechter zijpaneel, over de planken en het boven- en onderpaneel. Zet het vast met het beslag en de inbussleutel.', tight],
        wall: ['Zet hem rechtop en bevestig hem aan de muur', 'Til de kast met z’n tweeën op en zet hem tegen de muur. Schroef de muurbevestiging vast aan het bovenpaneel en aan de muur.', null, 'Een kast als deze kan omvallen en iemand verpletteren. Bevestig hem altijd aan de muur. Kies schroeven en pluggen die bij je muur passen.']
      };
    }
  };
  const table = X[lang]();
  return step => { const v = table[step.key]; return typeof v === 'function' ? v(step) : v; };
}

/** Nombres de piezas y herrajes de KALLAX por idioma. */
export const KALLAX_WORDS = {
  es: {
    pn: { bottom: 'Panel inferior', shelf: 'Balda larga {n}', shelf1: 'Balda {n}', dowels: 'Espigas de madera', divider: 'Separador corto (fila {n})', top: 'Panel superior', sideL: 'Lateral izquierdo', sideR: 'Lateral derecho', wallBracket: 'Fijación a la pared' },
    hw: { sides: 'Laterales', topBottom: 'Paneles arriba y abajo', longShelves: 'Baldas largas', longShelf: 'Balda larga', shelves1: 'Baldas', dividers: 'Separadores cortos', dowels: 'Espigas de madera', bottomPanel: 'Panel inferior', topPanel: 'Panel superior', sideL1: 'Lateral izquierdo', sideR1: 'Lateral derecho', wallFix: 'Fijación a la pared (incluida)', fittings: 'Herrajes' },
    sec: 'Estantería KALLAX', unit: 'estantería'
  },
  en: {
    pn: { bottom: 'Bottom panel', shelf: 'Long shelf {n}', shelf1: 'Shelf {n}', dowels: 'Wooden dowels', divider: 'Short divider (row {n})', top: 'Top panel', sideL: 'Left side panel', sideR: 'Right side panel', wallBracket: 'Wall fixing' },
    hw: { sides: 'Side panels', topBottom: 'Top and bottom panels', longShelves: 'Long shelves', longShelf: 'Long shelf', shelves1: 'Shelves', dividers: 'Short dividers', dowels: 'Wooden dowels', bottomPanel: 'Bottom panel', topPanel: 'Top panel', sideL1: 'Left side panel', sideR1: 'Right side panel', wallFix: 'Wall fixing (included)', fittings: 'Fittings' },
    sec: 'KALLAX shelving unit', unit: 'shelving unit'
  },
  fr: {
    pn: { bottom: 'Panneau inférieur', shelf: 'Tablette longue {n}', shelf1: 'Tablette {n}', dowels: 'Chevilles en bois', divider: 'Séparation courte (rangée {n})', top: 'Panneau supérieur', sideL: 'Côté gauche', sideR: 'Côté droit', wallBracket: 'Fixation murale' },
    hw: { sides: 'Côtés', topBottom: 'Panneaux haut et bas', longShelves: 'Tablettes longues', longShelf: 'Tablette longue', shelves1: 'Tablettes', dividers: 'Séparations courtes', dowels: 'Chevilles en bois', bottomPanel: 'Panneau inférieur', topPanel: 'Panneau supérieur', sideL1: 'Côté gauche', sideR1: 'Côté droit', wallFix: 'Fixation murale (incluse)', fittings: 'Ferrures' },
    sec: 'Étagère KALLAX', unit: 'étagère'
  },
  nl: {
    pn: { bottom: 'Onderpaneel', shelf: 'Lange plank {n}', shelf1: 'Plank {n}', dowels: 'Houten deuvels', divider: 'Korte tussenwand (rij {n})', top: 'Bovenpaneel', sideL: 'Linker zijpaneel', sideR: 'Rechter zijpaneel', wallBracket: 'Muurbevestiging' },
    hw: { sides: 'Zijpanelen', topBottom: 'Boven- en onderpaneel', longShelves: 'Lange planken', longShelf: 'Lange plank', shelves1: 'Planken', dividers: 'Korte tussenwanden', dowels: 'Houten deuvels', bottomPanel: 'Onderpaneel', topPanel: 'Bovenpaneel', sideL1: 'Linker zijpaneel', sideR1: 'Rechter zijpaneel', wallFix: 'Muurbevestiging (meegeleverd)', fittings: 'Beslag' },
    sec: 'KALLAX open kast', unit: 'open kast'
  }
};

/* =================== KALLAX solo =================== */
const INTRO = {
  es: { pre: 'Así quedará', preText: (c, r, w, h) => `Una estantería KALLAX de ${c} × ${r} cubos (${w} × ${h} cm). Gira la vista y pulsa «Empezar el montaje» cuando quieras.`, preTip: 'Toca cualquier pieza del modelo para ver su nombre. Si algo no queda claro, pregunta a la IA.',
        parts: 'Revisa las piezas', partsText: 'Saca todo de la caja y comprueba que no falta nada. Abajo tienes la lista de piezas grandes; los herrajes y las espigas vienen en bolsas.',
        done: '¡Listo!', doneText: (c, r) => `Tu KALLAX de ${c} × ${r} está montado. Gíralo para verlo desde todos los lados.`, doneTip: 'Revisa que los herrajes sigan apretados un par de veces al año.',
        sec: { preview: 'Vista previa', before: 'Antes de empezar', done: 'Terminado' },
        footer: 'Prototipo independiente, sin relación con IKEA. Los pasos son una reconstrucción a partir del diseño del mueble: sigue siempre el manual en papel ante cualquier duda.' },
  en: { pre: 'Here’s the result', preText: (c, r, w, h) => `A KALLAX shelving unit with ${c} × ${r} compartments (${w} × ${h} cm). Rotate the view and press “Start assembly” when you’re ready.`, preTip: 'Tap any part of the model to see its name. If something isn’t clear, ask the AI.',
        parts: 'Check the parts', partsText: 'Unpack everything and check that nothing is missing. The large parts are listed below; the fittings and dowels come in bags.',
        done: 'Done!', doneText: (c, r) => `Your ${c} × ${r} KALLAX is assembled. Rotate it to see it from every side.`, doneTip: 'Check that the fittings are still tight a couple of times a year.',
        sec: { preview: 'Preview', before: 'Before you start', done: 'Finished' },
        footer: 'Independent prototype, not affiliated with IKEA. The steps are reconstructed from the design of the furniture: if in doubt, always follow the paper manual.' },
  fr: { pre: 'Voici le résultat', preText: (c, r, w, h) => `Une étagère KALLAX de ${c} × ${r} cases (${w} × ${h} cm). Faites tourner la vue et appuyez sur « Commencer le montage » quand vous êtes prêt.`, preTip: 'Touchez une pièce du modèle pour voir son nom. Si quelque chose n’est pas clair, demandez à l’IA.',
        parts: 'Vérifiez les pièces', partsText: 'Déballez tout et vérifiez qu’il ne manque rien. Les grandes pièces sont listées ci-dessous ; les ferrures et les chevilles sont dans des sachets.',
        done: 'C’est fini !', doneText: (c, r) => `Votre KALLAX ${c} × ${r} est monté. Faites-le tourner pour le voir sous tous les angles.`, doneTip: 'Vérifiez que les ferrures sont bien serrées une ou deux fois par an.',
        sec: { preview: 'Aperçu', before: 'Avant de commencer', done: 'Terminé' },
        footer: 'Prototype indépendant, sans lien avec IKEA. Les étapes sont reconstituées à partir de la conception du meuble : en cas de doute, suivez toujours la notice papier.' },
  nl: { pre: 'Zo ziet het eruit', preText: (c, r, w, h) => `Een KALLAX open kast met ${c} × ${r} vakken (${w} × ${h} cm). Draai het beeld en druk op ‘Begin met monteren’ als je klaar bent.`, preTip: 'Tik op een onderdeel van het model om de naam te zien. Is iets niet duidelijk? Vraag het de AI.',
        parts: 'Controleer de onderdelen', partsText: 'Pak alles uit en controleer of er niets ontbreekt. De grote onderdelen staan hieronder; het beslag en de deuvels zitten in zakjes.',
        done: 'Klaar!', doneText: (c, r) => `Je KALLAX ${c} × ${r} is gemonteerd. Draai hem rond om hem van alle kanten te bekijken.`, doneTip: 'Controleer een paar keer per jaar of het beslag nog vastzit.',
        sec: { preview: 'Voorbeeld', before: 'Voordat je begint', done: 'Klaar' },
        footer: 'Onafhankelijk prototype, niet verbonden aan IKEA. De stappen zijn gereconstrueerd op basis van het ontwerp van het meubel: volg bij twijfel altijd de papieren handleiding.' }
};

export default {
  build(ctx, { cols = 2, rows = 2, w, h } = {}) {
    const g = kallaxGeometry(cols, rows);
    w = w || Math.round(g.W); h = h || Math.round(g.H);
    const { W, H, scale: s } = g;
    const FULL = [235 * s, H * .96, 370 * s, 0, H * .48, 60 * s];
    const nDiv = (cols - 1) * rows, nShelf = rows - 1;
    const partsHw = [['panel', 'sides', 2], ['panel', 'topBottom', 2]];
    if (nShelf) partsHw.push(['panel', cols > 1 ? 'longShelves' : 'shelves1', nShelf]);
    if (nDiv) partsHw.push(['separador', 'dividers', nDiv]);
    partsHw.push(['espiga', 'dowels'], ['tornillo', 'fittings']);

    const head = [
      { sec: 'preview', mode: 'final', cam: FULL, hw: [['personas', 'people', 2], ['allen', 'allen'], ['taladro', 'drill'], ['carton', 'cardboard']] },
      { sec: 'before', mode: 'explode', cam: [330 * s, H / 2 + 175 * s, 580 * s, 0, H / 2, 60 * s], hw: partsHw }
    ];
    const { steps: kSteps } = addKallax(ctx, { cols, rows }, head.length);
    const steps = [...head, ...kSteps, { sec: 'done', mode: 'final', cam: FULL, hw: [] }];

    const texts = {};
    for (const lang of ['es', 'en', 'fr', 'nl']) {
      const I = INTRO[lang], W_ = KALLAX_WORDS[lang], st = kallaxStepTexts(lang, { cols, rows });
      texts[lang] = {
        title: `KALLAX ${w} × ${h} · Montaje 3D`,
        chips: [['KALLAX', `${W_.unit} ${w} × ${h} cm`]],
        footer: I.footer,
        sec: { ...I.sec, kallax: W_.sec },
        pn: W_.pn, hw: W_.hw,
        steps: [
          [I.pre, I.preText(cols, rows, w, h), I.preTip],
          [I.parts, I.partsText],
          ...kSteps.map(st),
          [I.done, I.doneText(cols, rows), I.doneTip]
        ]
      };
    }
    return {
      steps, texts,
      bounds: { w: W, h: H, d: DEPTH },
      ai: {
        about: `- KALLAX shelving unit ${w}×${h} cm: ${cols} compartment${cols > 1 ? 's' : ''} wide × ${rows} high, 39 cm deep.\n- Parts shown in the guide: 2 side panels, top and bottom panels, ${nShelf} ${cols > 1 ? 'long ' : ''}shel${nShelf === 1 ? 'f' : 'ves'}${nDiv ? `, ${nDiv} short dividers` : ''}, wooden dowels, fittings and a wall fixing.`,
        notes: [
          'The steps in this guide are a simplified reconstruction shown upright; the paper manual builds KALLAX lying on its back. If the person’s manual differs, the paper manual is right.',
          'Safety first: the KALLAX must be fixed to the wall with the included wall fixing; lift and turn heavy parts with two people; don’t overtighten fittings in particleboard.'
        ]
      }
    };
  }
};
