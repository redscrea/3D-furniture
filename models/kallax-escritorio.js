/* KALLAX 182 × 182 (5 × 5) + INLÄGG + 2 patas OLOV: estantería con escritorio enganchado.
   Basado en los manuales AA-2730792 (KALLAX), AA-2292955 (INLÄGG) y AA-837959 (OLOV).
   Las piezas del KALLAX las pone models/kallax.js; aquí se añade el escritorio. */
import { addKallax, kallaxGeometry, C, DEPTH } from './kallax.js';

const RAIL_ROW = 1, RAIL_COLS = [1, 2];

export default {
  build(ctx) {
    const { addPart, assembly, box, cyl, group, COL } = ctx;
    const { colLeft, rowBottom, cubeCx } = kallaxGeometry(5, 5);
    const D = DEPTH;
    const DESK_X = (cubeCx(1) + cubeCx(2)) / 2;
    const DESK_Y = rowBottom(2);
    const FULL = [235, 175, 370, 0, 88, 60];

    const head = [
      { sec: 'preview', mode: 'final', cam: FULL, hw: [['personas', 'people', 2], ['destornillador', 'screwdriver'], ['allen', 'allen'], ['nivel', 'level'], ['taladro', 'drill'], ['carton', 'cardboard']] },
      { sec: 'before', mode: 'explode', cam: [330, 265, 580, 0, 90, 60], hw: [['panel', 'sides', 2], ['panel', 'topBottom', 2], ['panel', 'longShelves', 4], ['separador', 'dividers', 20], ['espiga', 'dowels'], ['rail', 'rails', 2], ['escuadra', 'zbrackets', 2], ['pata', 'legs', 2]] }
    ];
    const { steps: kSteps } = addKallax(ctx, { cols: 5, rows: 5 }, head.length, { wallKey: 'wallBrackets', wallQ: 2 });
    const s0 = head.length + kSteps.length;           // primer paso del escritorio (12)
    const deskSteps = [
      { sec: 'desk', cam: [190, 175, 345, DESK_X, 15, 180], hw: [['carton', 'blanket'], ['tablero', 'tabletop', 1]] },
      { sec: 'desk', cam: [175, 165, 355, DESK_X, 25, 220], hw: [['placa', 'plates', 2], ['tornillo', 'screws', 10], ['pata', 'legs', 2], ['destornillador', 'screwdriverShort']] },
      { sec: 'desk', cam: [120, 95, 215, DESK_X, 5, 125], hw: [['escuadra', 'zbrackets', 2], ['tornillo', 'screws', 4]] },
      { sec: 'desk', cam: [75, 108, 145, DESK_X, 66, 37], hw: [['rail', 'rails', 2], ['tornillo', 'screws', 4]] },
      { sec: 'desk', cam: [250, 195, 370, DESK_X, 50, 100], hw: [['personas', 'people', 2]] },
      { sec: 'desk', cam: [45, 118, 112, DESK_X, 70, 40], hw: [['tornillo', 'screws', 4], ['arandela', 'washers', 4], ['destornillador', 'screwdriverShort']] },
      { sec: 'desk', reanimate: 'legLower', cam: [205, 140, 300, DESK_X, 40, 110], hw: [['nivel', 'level']] }
    ];
    const [sTop, sLegs, sZ, sRails, sFlip, sScrews] = deskSteps.map((_, i) => s0 + i);
    const steps = [...head, ...kSteps, ...deskSteps, { sec: 'done', mode: 'final', cam: FULL, hw: [] }];

    // Raíles INLÄGG dentro de dos cubos de la 2.ª fila
    for (const [i, j] of RAIL_COLS.entries()) {
      const x0 = colLeft(j), x1 = x0 + C, y = rowBottom(RAIL_ROW) + C;
      const g = group(
        box([x0 + .05, y - 5.65, 35.5], [x1 - .05, y - 3.15, 38.5], COL.metal, { metal: true }),
        cyl(.75, .4, COL.dark, [x0 + .3, y - 4.4, 37], 'x', true),
        cyl(.75, .4, COL.dark, [x1 - .3, y - 4.4, 37], 'x', true)
      );
      addPart({ key: 'rail', obj: g, step: sRails, sub: i * 3, enter: [0, 0, 45], zx: 60 });
    }

    // Escritorio: se monta boca abajo delante del KALLAX y en el paso sFlip se gira y se engancha.
    const desk = assembly({ staged: { p: [DESK_X, 2.5, 118], r: [0, 0, Math.PI] }, final: { p: [DESK_X, DESK_Y, D] }, moveStep: sFlip, arc: 85 });
    const dx = (k, extra) => [0, k === 'tabletop' ? 26 : 10, 70];
    addPart({ key: 'tabletop', obj: box([-30, 0, 0], [30, 2.5, 120], COL.white), parent: desk, step: sTop, enter: [0, -40, 0], explode: dx('tabletop') });
    for (const [i, sx] of [-24, 24].entries()) {
      const scr = []; for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2; scr.push(cyl(.5, .35, COL.dark, [sx + Math.cos(a) * 3.4, -.95, 112 + Math.sin(a) * 3.4], 'y', true)); }
      addPart({ key: 'plate', obj: group(cyl(5, .8, COL.metal, [sx, -.4, 112], 'y', true), ...scr), parent: desk, step: sLegs, sub: i, enter: [0, -16, 0], explode: dx() });
    }
    for (const [i, sx] of [-24, 24].entries()) {
      addPart({ key: 'legUp', obj: cyl(2.4, 39.2, COL.white, [sx, -20.4, 112], 'y', false, true), parent: desk, step: sLegs, sub: 3 + i * 2, enter: [0, -38, 0], explode: dx() });
      addPart({ key: 'legLow', obj: group(cyl(2.0, 35.2, COL.white, [sx, -55.6, 112], 'y', false, true), cyl(2.6, 1, COL.dark, [sx, -73.7, 112])), parent: desk, step: sLegs, sub: 3 + i * 2, enter: [0, -38, 0], tag: 'legLower', reEnter: [0, 6, 0], explode: dx() });
    }
    for (const [i, bx] of [cubeCx(1) - DESK_X, cubeCx(2) - DESK_X].entries()) {
      const g = group(
        box([bx - 3, -.3, .3], [bx + 3, 0, 8.3], COL.metal, { metal: true }),
        box([bx - 3, -4.8, .3], [bx + 3, -.3, .6], COL.metal, { metal: true }),
        box([bx - 3, -4.8, -6], [bx + 3, -4.5, .6], COL.metal, { metal: true }),
        cyl(.6, .35, COL.dark, [bx, -.48, 3], 'y', true),
        cyl(.6, .35, COL.dark, [bx, -.48, 7], 'y', true)
      );
      addPart({ key: 'zbracket', obj: g, parent: desk, step: sZ, sub: i * 2, enter: [0, -22, 0], zx: 30, explode: dx() });
      const s = group(
        cyl(1.15, .15, COL.metal, [bx - 1.8, -4.42, -1.6], 'y', true), cyl(.7, .5, COL.dark, [bx - 1.8, -4.1, -1.6], 'y', true),
        cyl(1.15, .15, COL.metal, [bx + 1.8, -4.42, -1.6], 'y', true), cyl(.7, .5, COL.dark, [bx + 1.8, -4.1, -1.6], 'y', true)
      );
      addPart({ key: 'screwsWasher', obj: s, parent: desk, step: sScrews, sub: i * 2, enter: [0, 12, 0], zx: 40, explode: dx() });
    }

    const texts = {};
    for (const [lang, t] of Object.entries(TEXTS)) texts[lang] = { title: TITLE[lang], ...t };
    return {
      steps, texts,
      bounds: { w: 182, h: 182, d: 160 },
      ai: {
        about: `- KALLAX shelving unit 182×182 cm (5×5 compartments, white-stained oak effect)
- INLÄGG connecting fitting: 2 metal rails screwed inside two neighbouring KALLAX compartments + 2 Z-brackets screwed under the tabletop, plus screws and washers
- 2 OLOV adjustable legs (60–90 cm), each screwed to a mounting plate with 5 screws
- a tabletop bought separately (the model uses 120×60 cm)
Together they form a KALLAX with a desk hooked onto its front, about 76 cm high.`,
        notes: [
          'The KALLAX steps in this guide are a simplified order shown upright; the paper manual builds it lying on its back. If the person’s manual differs, the paper manual is right.',
          'Safety first: the KALLAX must be fixed to the wall; lift and turn heavy parts with two people; don’t overtighten fittings in particleboard.'
        ]
      }
    };
  }
};

const TITLE = { es: 'KALLAX con escritorio · Montaje 3D', en: 'KALLAX with desk · Assembly 3D', fr: 'KALLAX avec bureau · Montage 3D', nl: 'KALLAX met bureau · Montage 3D' };

/* Textos de los 20 pasos en ES / EN / FR / NL (los de KALLAX están escritos a mano para este mueble). */
const TEXTS = {
es: {
  chips: [['KALLAX', "estantería 182 × 182 cm"], ['INLÄGG', "pieza de unión"], ['OLOV', "2 patas regulables"]],
  footer: "Prototipo independiente, sin relación con IKEA. Basado en las instrucciones AA-2730792 (KALLAX), AA-2292955 (INLÄGG) y AA-837959 (OLOV). Sigue siempre el manual en papel ante cualquier duda.",
  sec: {"preview":"Vista previa","before":"Antes de empezar","kallax":"Estantería KALLAX","desk":"Escritorio","done":"Terminado"},
  pn: {"bottom":"Panel inferior","shelf":"Balda larga {n}","dowels":"Espigas de madera","divider":"Separador corto (fila {n})","top":"Panel superior","sideL":"Lateral izquierdo","sideR":"Lateral derecho","wallBracket":"Escuadra de fijación a la pared","rail":"Raíl INLÄGG","tabletop":"Tablero (se compra aparte)","plate":"Placa de fijación OLOV","legUp":"Pata OLOV (parte de arriba)","legLow":"Pata OLOV (parte regulable)","zbracket":"Escuadra en Z INLÄGG","screwsWasher":"Tornillos con arandela"},
  hw: {"people":"Personas","screwdriver":"Destornillador de estrella","screwdriverShort":"Destornillador","allen":"Llave Allen (incluida)","level":"Nivel","drill":"Taladro para la pared","drillShort":"Taladro","cardboard":"Cartón o manta","cardboardFloor":"Cartón en el suelo","sides":"Laterales","topBottom":"Paneles arriba y abajo","longShelves":"Baldas largas","longShelf":"Balda larga","dividers":"Separadores cortos","dowels":"Espigas de madera","rails":"Raíles INLÄGG","zbrackets":"Escuadras en Z","legs":"Patas OLOV","bottomPanel":"Panel inferior","topPanel":"Panel superior","wallBrackets":"Escuadras de pared","wallScrews":"Tornillos y tacos de pared (no incluidos)","tabletop":"Tablero (aparte)","plates":"Placas de fijación","screws":"Tornillos","washers":"Arandelas","blanket":"Manta o cartón"},
  steps: [
    ["Así quedará","Una estantería KALLAX de 5 × 5 cubos con un escritorio enganchado delante. Gira la vista y pulsa «Empezar el montaje» cuando quieras.","Toca cualquier pieza del modelo para ver su nombre. Si algo no queda claro, pregunta a la IA."],
    ["Revisa las piezas","Saca todo de las cajas y comprueba que no falta nada. Las piezas de madera son del KALLAX; las metálicas, del INLÄGG; las patas, del OLOV.",null,"El tablero no viene con estos tres artículos. Necesitas uno aparte; el del modelo mide 120 × 60 cm."],
    ["Base y espigas","Pon cartón en el suelo. Coloca el panel inferior y mete las espigas de madera en los agujeros de arriba, hasta la mitad.","El manual monta el KALLAX tumbado sobre su espalda. Aquí lo ves de pie para que se entienda mejor; el orden de las piezas es el mismo."],
    ["Fila 1: separadores","Encaja los 4 separadores cortos sobre las espigas, uno en cada línea de agujeros. Después pon espigas en la parte de arriba de cada separador."],
    ["Primera balda larga","Baja la balda larga encima de los separadores, alineando sus agujeros con las espigas.","Presiona a lo largo de toda la balda para que entre igual en todas las espigas."],
    ["Fila 2","Repite lo mismo: espigas en la balda, 4 separadores, espigas arriba y la siguiente balda larga."],
    ["Fila 3","Otra fila igual: espigas, 4 separadores, espigas y balda larga."],
    ["Fila 4","Una fila más con la última balda larga."],
    ["Fila 5: últimos separadores","Coloca los 4 últimos separadores y pon espigas en su parte de arriba. Esta fila no lleva balda: la cierra el panel superior."],
    ["Panel superior","Baja el panel superior sobre las espigas de la última fila y presiónalo por igual."],
    ["Laterales","Coloca un lateral a cada lado, encajado en las baldas y en los paneles de arriba y abajo. Fíjalos con los herrajes y la llave Allen.","Aprieta lo justo: si fuerzas los herrajes, el tablero se puede agrietar."],
    ["Ponlo de pie y fíjalo a la pared","Entre dos personas, levanta el mueble y apóyalo contra la pared. Atornilla las 2 escuadras al panel superior y a la pared.",null,"Un mueble así de alto puede volcar y aplastar a alguien. Fíjalo siempre a la pared. Elige tornillos y tacos según el tipo de pared."],
    ["Tablero boca abajo","Coloca el tablero boca abajo sobre una superficie blanda. Las patas irán en un extremo y las escuadras en el otro.","Así no rayas la cara de arriba mientras trabajas."],
    ["Placas y patas OLOV","En las dos esquinas del extremo lejano, atornilla cada placa con 5 tornillos. Después enrosca cada pata en su placa.","Las patas OLOV se regulan de 60 a 90 cm de altura."],
    ["Escuadras INLÄGG","En el otro extremo, atornilla las 2 escuadras en Z con 2 tornillos cada una. La parte doblada debe sobresalir del borde del tablero."],
    ["Raíles dentro del KALLAX","Elige dos cubos vecinos de la segunda fila desde abajo. Pon un raíl en cada uno, arriba y en la parte delantera, y atorníllalo a las paredes del cubo.","Con los raíles en esta fila, el escritorio queda a unos 76 cm del suelo."],
    ["Gira el tablero y engánchalo","Entre dos personas, da la vuelta al tablero para que las patas queden abajo. Mete la parte baja de las escuadras en los cubos, apoyada sobre los raíles, y baja el tablero."],
    ["Atornilla las escuadras","Dentro de cada cubo, fija la escuadra al raíl con 2 tornillos y sus arandelas."],
    ["Nivela el escritorio","Pon un nivel sobre el tablero. Gira la parte baja de cada pata hasta que quede recto.","Vuelve a apretar los tornillos unas dos semanas después del montaje."],
    ["¡Listo!","Tu KALLAX con escritorio está montado. Gíralo para verlo desde todos los lados.","Revisa que los tornillos sigan apretados un par de veces al año."]
  ]
},
en: {
  chips: [['KALLAX', "shelving unit 182 × 182 cm"], ['INLÄGG', "connecting fitting"], ['OLOV', "2 adjustable legs"]],
  footer: "Independent prototype, not affiliated with IKEA. Based on assembly instructions AA-2730792 (KALLAX), AA-2292955 (INLÄGG) and AA-837959 (OLOV). If in doubt, always follow the paper manual.",
  sec: {"preview":"Preview","before":"Before you start","kallax":"KALLAX shelving unit","desk":"Desk","done":"Finished"},
  pn: {"bottom":"Bottom panel","shelf":"Long shelf {n}","dowels":"Wooden dowels","divider":"Short divider (row {n})","top":"Top panel","sideL":"Left side panel","sideR":"Right side panel","wallBracket":"Wall-fixing bracket","rail":"INLÄGG rail","tabletop":"Tabletop (sold separately)","plate":"OLOV mounting plate","legUp":"OLOV leg (upper part)","legLow":"OLOV leg (adjustable part)","zbracket":"INLÄGG Z-bracket","screwsWasher":"Screws with washers"},
  hw: {"people":"People","screwdriver":"Phillips screwdriver","screwdriverShort":"Screwdriver","allen":"Allen key (included)","level":"Spirit level","drill":"Drill for the wall","drillShort":"Drill","cardboard":"Cardboard or blanket","cardboardFloor":"Cardboard on the floor","sides":"Side panels","topBottom":"Top and bottom panels","longShelves":"Long shelves","longShelf":"Long shelf","dividers":"Short dividers","dowels":"Wooden dowels","rails":"INLÄGG rails","zbrackets":"Z-brackets","legs":"OLOV legs","bottomPanel":"Bottom panel","topPanel":"Top panel","wallBrackets":"Wall brackets","wallScrews":"Wall screws and plugs (not included)","tabletop":"Tabletop (separate)","plates":"Mounting plates","screws":"Screws","washers":"Washers","blanket":"Blanket or cardboard"},
  steps: [
    ["Here’s the result","A 5 × 5 KALLAX shelving unit with a desk hooked onto the front. Rotate the view and press “Start assembly” when you’re ready.","Tap any part of the model to see its name. If something isn’t clear, ask the AI."],
    ["Check the parts","Unpack everything and check that nothing is missing. The wooden parts belong to KALLAX, the metal ones to INLÄGG and the legs to OLOV.",null,"The tabletop doesn’t come with these three products. You need to buy one separately; the one in the model is 120 × 60 cm."],
    ["Base and dowels","Lay cardboard on the floor. Place the bottom panel and push wooden dowels halfway into the holes on top.","The manual assembles KALLAX lying on its back. Here it’s shown upright so it’s easier to follow; the order of the parts is the same."],
    ["Row 1: dividers","Fit the 4 short dividers onto the dowels, one on each line of holes. Then put dowels in the top of each divider."],
    ["First long shelf","Lower the long shelf onto the dividers, lining up its holes with the dowels.","Press along the whole length of the shelf so it goes onto all the dowels evenly."],
    ["Row 2","Repeat the same: dowels in the shelf, 4 dividers, dowels on top and the next long shelf."],
    ["Row 3","Another identical row: dowels, 4 dividers, dowels and a long shelf."],
    ["Row 4","One more row, with the last long shelf."],
    ["Row 5: last dividers","Fit the last 4 dividers and put dowels in their tops. This row has no shelf: the top panel closes it."],
    ["Top panel","Lower the top panel onto the dowels of the last row and press it down evenly."],
    ["Side panels","Fit a side panel on each side, onto the shelves and the top and bottom panels. Fix them with the fittings and the Allen key.","Tighten just enough: forcing the fittings can crack the board."],
    ["Stand it up and fix it to the wall","With two people, lift the unit and stand it against the wall. Screw the 2 brackets to the top panel and to the wall.",null,"A unit this tall can tip over and crush someone. Always fix it to the wall. Choose screws and plugs that suit your type of wall."],
    ["Tabletop face down","Place the tabletop face down on a soft surface. The legs go at one end and the brackets at the other.","That way you won’t scratch the top surface while you work."],
    ["OLOV plates and legs","In the two corners at the far end, screw on each plate with 5 screws. Then screw each leg into its plate.","OLOV legs adjust from 60 to 90 cm in height."],
    ["INLÄGG brackets","At the other end, screw on the 2 Z-brackets with 2 screws each. The bent part must stick out past the edge of the tabletop."],
    ["Rails inside the KALLAX","Pick two neighbouring compartments in the second row from the bottom. Put a rail in each one, at the top and towards the front, and screw it to the sides of the compartment.","With the rails in this row, the desk ends up about 76 cm off the floor."],
    ["Turn the tabletop over and hook it on","With two people, turn the tabletop over so the legs are underneath. Slide the lower part of the brackets into the compartments, resting on the rails, and lower the tabletop."],
    ["Screw the brackets in place","Inside each compartment, fix the bracket to the rail with 2 screws and their washers."],
    ["Level the desk","Put a spirit level on the tabletop. Turn the lower part of each leg until it’s straight.","Retighten the screws about two weeks after assembly."],
    ["Done!","Your KALLAX with desk is assembled. Rotate it to see it from every side.","Check that the screws are still tight a couple of times a year."]
  ]
},
fr: {
  chips: [['KALLAX', "étagère 182 × 182 cm"], ['INLÄGG', "pièce de raccordement"], ['OLOV', "2 pieds réglables"]],
  footer: "Prototype indépendant, sans lien avec IKEA. Basé sur les notices AA-2730792 (KALLAX), AA-2292955 (INLÄGG) et AA-837959 (OLOV). En cas de doute, suivez toujours la notice papier.",
  sec: {"preview":"Aperçu","before":"Avant de commencer","kallax":"Étagère KALLAX","desk":"Bureau","done":"Terminé"},
  pn: {"bottom":"Panneau inférieur","shelf":"Tablette longue {n}","dowels":"Chevilles en bois","divider":"Séparation courte (rangée {n})","top":"Panneau supérieur","sideL":"Côté gauche","sideR":"Côté droit","wallBracket":"Équerre de fixation murale","rail":"Rail INLÄGG","tabletop":"Plateau (vendu séparément)","plate":"Plaque de fixation OLOV","legUp":"Pied OLOV (partie haute)","legLow":"Pied OLOV (partie réglable)","zbracket":"Équerre en Z INLÄGG","screwsWasher":"Vis avec rondelles"},
  hw: {"people":"Personnes","screwdriver":"Tournevis cruciforme","screwdriverShort":"Tournevis","allen":"Clé Allen (incluse)","level":"Niveau à bulle","drill":"Perceuse pour le mur","drillShort":"Perceuse","cardboard":"Carton ou couverture","cardboardFloor":"Carton au sol","sides":"Côtés","topBottom":"Panneaux haut et bas","longShelves":"Tablettes longues","longShelf":"Tablette longue","dividers":"Séparations courtes","dowels":"Chevilles en bois","rails":"Rails INLÄGG","zbrackets":"Équerres en Z","legs":"Pieds OLOV","bottomPanel":"Panneau inférieur","topPanel":"Panneau supérieur","wallBrackets":"Équerres murales","wallScrews":"Vis et chevilles murales (non incluses)","tabletop":"Plateau (à part)","plates":"Plaques de fixation","screws":"Vis","washers":"Rondelles","blanket":"Couverture ou carton"},
  steps: [
    ["Voici le résultat","Une étagère KALLAX de 5 × 5 cases avec un bureau accroché à l’avant. Faites tourner la vue et appuyez sur « Commencer le montage » quand vous êtes prêt.","Touchez une pièce du modèle pour voir son nom. Si quelque chose n’est pas clair, demandez à l’IA."],
    ["Vérifiez les pièces","Déballez tout et vérifiez qu’il ne manque rien. Les pièces en bois sont celles du KALLAX, les pièces métalliques celles d’INLÄGG et les pieds ceux d’OLOV.",null,"Le plateau n’est pas fourni avec ces trois articles. Il faut en acheter un à part ; celui du modèle mesure 120 × 60 cm."],
    ["Base et chevilles","Posez du carton au sol. Placez le panneau inférieur et enfoncez les chevilles en bois à moitié dans les trous du dessus.","La notice monte le KALLAX couché sur le dos. Ici, il est montré debout pour mieux comprendre ; l’ordre des pièces est le même."],
    ["Rangée 1 : séparations","Emboîtez les 4 séparations courtes sur les chevilles, une par ligne de trous. Mettez ensuite des chevilles sur le dessus de chaque séparation."],
    ["Première tablette longue","Posez la tablette longue sur les séparations en alignant ses trous avec les chevilles.","Appuyez sur toute la longueur de la tablette pour qu’elle s’enfonce de façon égale sur toutes les chevilles."],
    ["Rangée 2","Recommencez : chevilles dans la tablette, 4 séparations, chevilles sur le dessus et la tablette longue suivante."],
    ["Rangée 3","Encore une rangée identique : chevilles, 4 séparations, chevilles et tablette longue."],
    ["Rangée 4","Une rangée de plus, avec la dernière tablette longue."],
    ["Rangée 5 : dernières séparations","Placez les 4 dernières séparations et mettez des chevilles sur leur dessus. Cette rangée n’a pas de tablette : c’est le panneau supérieur qui la ferme."],
    ["Panneau supérieur","Posez le panneau supérieur sur les chevilles de la dernière rangée et appuyez de façon égale."],
    ["Côtés","Placez un côté de chaque part, emboîté sur les tablettes et les panneaux haut et bas. Fixez-les avec les ferrures et la clé Allen.","Serrez juste ce qu’il faut : en forçant sur les ferrures, le panneau peut se fendre."],
    ["Redressez-le et fixez-le au mur","À deux, soulevez le meuble et placez-le contre le mur. Vissez les 2 équerres sur le panneau supérieur et au mur.",null,"Un meuble aussi haut peut basculer et écraser quelqu’un. Fixez-le toujours au mur. Choisissez des vis et des chevilles adaptées à votre mur."],
    ["Plateau à l’envers","Posez le plateau à l’envers sur une surface douce. Les pieds vont à une extrémité et les équerres à l’autre.","Ainsi, vous ne rayez pas le dessus pendant le travail."],
    ["Plaques et pieds OLOV","Dans les deux coins de l’extrémité éloignée, vissez chaque plaque avec 5 vis. Vissez ensuite chaque pied dans sa plaque.","Les pieds OLOV se règlent de 60 à 90 cm de hauteur."],
    ["Équerres INLÄGG","À l’autre extrémité, vissez les 2 équerres en Z avec 2 vis chacune. La partie pliée doit dépasser du bord du plateau."],
    ["Rails dans le KALLAX","Choisissez deux cases voisines dans la deuxième rangée en partant du bas. Placez un rail dans chacune, en haut et vers l’avant, et vissez-le aux parois de la case.","Avec les rails dans cette rangée, le bureau se trouve à environ 76 cm du sol."],
    ["Retournez le plateau et accrochez-le","À deux, retournez le plateau pour que les pieds soient en bas. Glissez la partie basse des équerres dans les cases, posée sur les rails, puis abaissez le plateau."],
    ["Vissez les équerres","Dans chaque case, fixez l’équerre au rail avec 2 vis et leurs rondelles."],
    ["Mettez le bureau à niveau","Posez un niveau à bulle sur le plateau. Tournez la partie basse de chaque pied jusqu’à ce qu’il soit droit.","Resserrez les vis environ deux semaines après le montage."],
    ["C’est fini !","Votre KALLAX avec bureau est monté. Faites-le tourner pour le voir sous tous les angles.","Vérifiez que les vis sont bien serrées une ou deux fois par an."]
  ]
},
nl: {
  chips: [['KALLAX', "open kast 182 × 182 cm"], ['INLÄGG', "verbindingsbeslag"], ['OLOV', "2 verstelbare poten"]],
  footer: "Onafhankelijk prototype, niet verbonden aan IKEA. Gebaseerd op de montagehandleidingen AA-2730792 (KALLAX), AA-2292955 (INLÄGG) en AA-837959 (OLOV). Volg bij twijfel altijd de papieren handleiding.",
  sec: {"preview":"Voorbeeld","before":"Voordat je begint","kallax":"KALLAX open kast","desk":"Bureau","done":"Klaar"},
  pn: {"bottom":"Onderpaneel","shelf":"Lange plank {n}","dowels":"Houten deuvels","divider":"Korte tussenwand (rij {n})","top":"Bovenpaneel","sideL":"Linker zijpaneel","sideR":"Rechter zijpaneel","wallBracket":"Muurbevestigingshoek","rail":"INLÄGG-rail","tabletop":"Tafelblad (apart verkrijgbaar)","plate":"OLOV-montageplaat","legUp":"OLOV-poot (bovenste deel)","legLow":"OLOV-poot (verstelbaar deel)","zbracket":"INLÄGG Z-beugel","screwsWasher":"Schroeven met sluitringen"},
  hw: {"people":"Personen","screwdriver":"Kruiskopschroevendraaier","screwdriverShort":"Schroevendraaier","allen":"Inbussleutel (meegeleverd)","level":"Waterpas","drill":"Boormachine voor de muur","drillShort":"Boormachine","cardboard":"Karton of deken","cardboardFloor":"Karton op de vloer","sides":"Zijpanelen","topBottom":"Boven- en onderpaneel","longShelves":"Lange planken","longShelf":"Lange plank","dividers":"Korte tussenwanden","dowels":"Houten deuvels","rails":"INLÄGG-rails","zbrackets":"Z-beugels","legs":"OLOV-poten","bottomPanel":"Onderpaneel","topPanel":"Bovenpaneel","wallBrackets":"Muurhoeken","wallScrews":"Muurschroeven en pluggen (niet meegeleverd)","tabletop":"Tafelblad (apart)","plates":"Montageplaten","screws":"Schroeven","washers":"Sluitringen","blanket":"Deken of karton"},
  steps: [
    ["Zo ziet het eruit","Een KALLAX open kast van 5 × 5 vakken met een bureau dat aan de voorkant vastgehaakt is. Draai het beeld en druk op ‘Begin met monteren’ als je klaar bent.","Tik op een onderdeel van het model om de naam te zien. Is iets niet duidelijk? Vraag het de AI."],
    ["Controleer de onderdelen","Pak alles uit en controleer of er niets ontbreekt. De houten delen horen bij KALLAX, de metalen bij INLÄGG en de poten bij OLOV.",null,"Het tafelblad zit niet bij deze drie artikelen. Je moet er apart een kopen; het blad in het model is 120 × 60 cm."],
    ["Basis en deuvels","Leg karton op de vloer. Plaats het onderpaneel en duw de houten deuvels tot de helft in de gaten aan de bovenkant.","In de handleiding wordt KALLAX liggend op de rug gemonteerd. Hier zie je hem rechtop zodat het makkelijker te volgen is; de volgorde van de onderdelen is dezelfde."],
    ["Rij 1: tussenwanden","Zet de 4 korte tussenwanden op de deuvels, één op elke rij gaten. Steek daarna deuvels in de bovenkant van elke tussenwand."],
    ["Eerste lange plank","Laat de lange plank op de tussenwanden zakken en lijn de gaten uit met de deuvels.","Druk over de hele lengte van de plank zodat hij gelijkmatig over alle deuvels gaat."],
    ["Rij 2","Herhaal hetzelfde: deuvels in de plank, 4 tussenwanden, deuvels erbovenop en de volgende lange plank."],
    ["Rij 3","Nog een rij hetzelfde: deuvels, 4 tussenwanden, deuvels en een lange plank."],
    ["Rij 4","Nog één rij, met de laatste lange plank."],
    ["Rij 5: laatste tussenwanden","Plaats de laatste 4 tussenwanden en steek deuvels in de bovenkant. Deze rij heeft geen plank: het bovenpaneel sluit hem af."],
    ["Bovenpaneel","Laat het bovenpaneel op de deuvels van de laatste rij zakken en druk het gelijkmatig aan."],
    ["Zijpanelen","Plaats aan elke kant een zijpaneel over de planken en het boven- en onderpaneel. Zet ze vast met het beslag en de inbussleutel.","Draai niet te hard aan: als je het beslag forceert, kan het paneel scheuren."],
    ["Zet hem rechtop en bevestig hem aan de muur","Til de kast met z’n tweeën op en zet hem tegen de muur. Schroef de 2 hoeken vast aan het bovenpaneel en aan de muur.",null,"Een kast die zo hoog is kan omvallen en iemand verpletteren. Bevestig hem altijd aan de muur. Kies schroeven en pluggen die bij je muur passen."],
    ["Tafelblad ondersteboven","Leg het tafelblad ondersteboven op een zachte ondergrond. De poten komen aan het ene uiteinde, de beugels aan het andere.","Zo kras je de bovenkant niet terwijl je werkt."],
    ["OLOV-platen en -poten","Schroef in de twee hoeken aan het verre uiteinde elke plaat vast met 5 schroeven. Draai daarna elke poot in zijn plaat.","OLOV-poten zijn verstelbaar van 60 tot 90 cm hoogte."],
    ["INLÄGG-beugels","Schroef aan het andere uiteinde de 2 Z-beugels vast met elk 2 schroeven. Het gebogen deel moet over de rand van het tafelblad uitsteken."],
    ["Rails in de KALLAX","Kies twee naast elkaar liggende vakken in de tweede rij van onderen. Plaats in elk vak een rail, bovenaan en naar voren, en schroef hem vast aan de wanden van het vak.","Met de rails in deze rij komt het bureau op ongeveer 76 cm van de vloer."],
    ["Draai het blad om en haak het vast","Draai het tafelblad met z’n tweeën om zodat de poten onderaan staan. Schuif het onderste deel van de beugels in de vakken, rustend op de rails, en laat het blad zakken."],
    ["Schroef de beugels vast","Zet in elk vak de beugel vast aan de rail met 2 schroeven en sluitringen."],
    ["Zet het bureau waterpas","Leg een waterpas op het tafelblad. Draai aan het onderste deel van elke poot tot het blad recht ligt.","Draai de schroeven ongeveer twee weken na de montage opnieuw aan."],
    ["Klaar!","Je KALLAX met bureau is gemonteerd. Draai hem rond om hem van alle kanten te bekijken.","Controleer een paar keer per jaar of de schroeven nog vastzitten."]
  ]
},
};
