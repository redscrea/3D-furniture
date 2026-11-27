/* LACK mesa auxiliar 55 × 55 cm, 45 cm de alto. Sin herramientas: las patas se enroscan a mano
   con tornillos de doble rosca.
   Medidas aproximadas (tablero de 5 cm, patas de 5 × 5 cm en las esquinas) y orden reconstruido:
   hay que compararlo con el manual en papel (ver «Supuestos a revisar» en el README). */

const W = 55, TOP = 5, H = 45, LEG = 5, Z0 = 42;   // Z0: distancia del centro de la mesa a la pared

export default {
  build({ addPart, assembly, box, cyl, at, COL }) {
    const FULL = [100, 82, 165, 0, 22, Z0];
    const steps = [
      { sec: 'preview', mode: 'final', cam: FULL, hw: [['carton', 'blanket']] },
      { sec: 'before', mode: 'explode', cam: [125, 105, 205, 0, 28, Z0], hw: [['tablero', 'top', 1], ['pata', 'legs', 4], ['tornilloDoble', 'dscrews', 4]] },
      { sec: 'table', cam: [80, 95, 150, 0, 5, Z0], hw: [['carton', 'blanket'], ['tablero', 'top', 1]] },
      { sec: 'table', cam: [62, 70, 120, 0, 8, Z0], hw: [['tornilloDoble', 'dscrews', 4]] },
      { sec: 'table', cam: [88, 105, 165, 0, 22, Z0], hw: [['pata', 'legs', 4]] },
      { sec: 'table', cam: [110, 90, 185, 0, 25, Z0], hw: [] },
      { sec: 'done', mode: 'final', cam: FULL, hw: [] }
    ];

    // Toda la mesa es un subconjunto: se monta boca abajo y en el paso 5 se le da la vuelta.
    // Coordenadas locales: cara de arriba del tablero en y = 0, patas hacia y negativa.
    const table = assembly({ staged: { p: [0, 0, Z0], r: [0, 0, Math.PI] }, final: { p: [0, H, Z0] }, moveStep: 5, arc: 40 });
    const h = W / 2, c = h - LEG / 2;
    addPart({ key: 'top', obj: box([-h, -TOP, -h], [h, 0, h], COL.wood), parent: table, step: 2, enter: [0, -25, 0], explode: [0, 22, 0] });
    const corners = [[-c, -c], [c, -c], [c, c], [-c, c]];
    corners.forEach(([x, z], i) => {
      addPart({ key: 'screw', obj: at([x, -TOP, z], cyl(.4, 7, COL.metal, [0, 0, 0], 'y', true)), parent: table, step: 3, sub: i, enter: [0, -10, 0], spin: 3, explode: [x * .15, 10, z * .15] });
    });
    corners.forEach(([x, z], i) => {
      const legH = H - TOP;
      addPart({ key: 'leg', n: i + 1, obj: at([x, -TOP - legH / 2, z], box([-LEG / 2, -legH / 2, -LEG / 2], [LEG / 2, legH / 2, LEG / 2], COL.wood)), parent: table, step: 4, sub: i * 1.4, enter: [0, -28, 0], spin: 2, explode: [x * .55, 0, z * .55] });
    });

    return {
      steps, texts: TEXTS, wall: true,
      bounds: { w: W, h: H, d: W },
      ai: {
        about: `- LACK side table: 55×55 cm top, 45 cm high.
- Parts: the tabletop (light board with honeycomb paper filling, about 5 cm thick), 4 legs and 4 double-ended screws.
- No tools needed: each leg is screwed by hand into a pre-drilled hole in a corner of the underside of the tabletop, using a double-ended screw.`,
        notes: [
          'The order in this guide is a simplified reconstruction. Depending on the box, the double-ended screws may already be in the legs. If the person’s paper manual differs, the manual is right.',
          'Safety and care: don’t overtighten the legs (the thread in the board can strip); check from time to time that the legs are still tight.'
        ]
      }
    };
  }
};

const TEXTS = {
  es: {
    title: 'LACK mesa auxiliar · Montaje 3D',
    chips: [['LACK', 'mesa auxiliar 55 × 55 cm']],
    footer: 'Prototipo independiente, sin relación con IKEA. Los pasos son una reconstrucción a partir del diseño del mueble: sigue siempre el manual en papel ante cualquier duda.',
    sec: { preview: 'Vista previa', before: 'Antes de empezar', table: 'Mesa LACK', done: 'Terminado' },
    pn: { top: 'Tablero', leg: 'Pata {n}', screw: 'Tornillo de doble rosca' },
    hw: { top: 'Tablero', legs: 'Patas', dscrews: 'Tornillos de doble rosca' },
    steps: [
      ['Así quedará', 'Una mesa auxiliar LACK de 55 × 55 cm y 45 cm de alto. No necesitas herramientas: las patas se enroscan a mano.', 'Toca cualquier pieza del modelo para ver su nombre. Si algo no queda claro, pregunta a la IA.'],
      ['Revisa las piezas', 'Saca todo de la caja y comprueba que tienes el tablero, las 4 patas y los 4 tornillos de doble rosca.'],
      ['Tablero boca abajo', 'Pon el tablero boca abajo sobre una manta o un cartón. En cada esquina verás un agujero para una pata.', 'Así no rayas la cara de arriba mientras trabajas.'],
      ['Tornillos en las esquinas', 'Enrosca a mano un tornillo de doble rosca hasta la mitad en el agujero de cada esquina.', 'En algunas cajas los tornillos ya vienen puestos en las patas. Si es tu caso, sáltate este paso.'],
      ['Enrosca las patas', 'Coloca cada pata sobre el tornillo de una esquina y gírala a mano hasta que quede firme contra el tablero.', 'Ve recto y no fuerces al final: si aprietas demasiado, la rosca del tablero se puede estropear.'],
      ['Dale la vuelta', 'Gira la mesa y ponla de pie. Comprueba que no cojea; si cojea, revisa que todas las patas estén enroscadas hasta el fondo.'],
      ['¡Listo!', 'Tu mesa LACK está montada. Gírala para verla desde todos los lados.', 'Revisa de vez en cuando que las patas sigan bien apretadas.']
    ]
  },
  en: {
    title: 'LACK side table · Assembly 3D',
    chips: [['LACK', 'side table 55 × 55 cm']],
    footer: 'Independent prototype, not affiliated with IKEA. The steps are reconstructed from the design of the furniture: if in doubt, always follow the paper manual.',
    sec: { preview: 'Preview', before: 'Before you start', table: 'LACK table', done: 'Finished' },
    pn: { top: 'Tabletop', leg: 'Leg {n}', screw: 'Double-ended screw' },
    hw: { top: 'Tabletop', legs: 'Legs', dscrews: 'Double-ended screws' },
    steps: [
      ['Here’s the result', 'A LACK side table, 55 × 55 cm and 45 cm high. You don’t need any tools: the legs screw in by hand.', 'Tap any part of the model to see its name. If something isn’t clear, ask the AI.'],
      ['Check the parts', 'Unpack everything and check that you have the tabletop, the 4 legs and the 4 double-ended screws.'],
      ['Tabletop face down', 'Place the tabletop face down on a blanket or a piece of cardboard. There’s a hole for a leg in each corner.', 'That way you won’t scratch the top surface while you work.'],
      ['Screws in the corners', 'By hand, screw a double-ended screw halfway into the hole in each corner.', 'In some boxes the screws are already fitted in the legs. If so, skip this step.'],
      ['Screw on the legs', 'Put each leg on the screw in a corner and turn it by hand until it sits firmly against the tabletop.', 'Keep it straight and don’t force it at the end: overtightening can damage the thread in the tabletop.'],
      ['Turn it over', 'Turn the table over and stand it on its legs. Check that it doesn’t wobble; if it does, make sure every leg is screwed all the way in.'],
      ['Done!', 'Your LACK table is assembled. Rotate it to see it from every side.', 'Check now and then that the legs are still tight.']
    ]
  },
  fr: {
    title: 'LACK table d’appoint · Montage 3D',
    chips: [['LACK', 'table d’appoint 55 × 55 cm']],
    footer: 'Prototype indépendant, sans lien avec IKEA. Les étapes sont reconstituées à partir de la conception du meuble : en cas de doute, suivez toujours la notice papier.',
    sec: { preview: 'Aperçu', before: 'Avant de commencer', table: 'Table LACK', done: 'Terminé' },
    pn: { top: 'Plateau', leg: 'Pied {n}', screw: 'Vis à double filetage' },
    hw: { top: 'Plateau', legs: 'Pieds', dscrews: 'Vis à double filetage' },
    steps: [
      ['Voici le résultat', 'Une table d’appoint LACK de 55 × 55 cm et 45 cm de haut. Aucun outil n’est nécessaire : les pieds se vissent à la main.', 'Touchez une pièce du modèle pour voir son nom. Si quelque chose n’est pas clair, demandez à l’IA.'],
      ['Vérifiez les pièces', 'Déballez tout et vérifiez que vous avez le plateau, les 4 pieds et les 4 vis à double filetage.'],
      ['Plateau à l’envers', 'Posez le plateau à l’envers sur une couverture ou un carton. Chaque coin a un trou pour un pied.', 'Ainsi, vous ne rayez pas le dessus pendant le travail.'],
      ['Vis dans les coins', 'À la main, vissez une vis à double filetage jusqu’à la moitié dans le trou de chaque coin.', 'Dans certaines boîtes, les vis sont déjà montées sur les pieds. Dans ce cas, passez cette étape.'],
      ['Vissez les pieds', 'Placez chaque pied sur la vis d’un coin et tournez-le à la main jusqu’à ce qu’il soit bien appuyé contre le plateau.', 'Restez bien droit et ne forcez pas à la fin : en serrant trop, le filetage du plateau peut s’abîmer.'],
      ['Retournez-la', 'Retournez la table et posez-la sur ses pieds. Vérifiez qu’elle ne bouge pas ; si elle bouge, vérifiez que chaque pied est vissé à fond.'],
      ['C’est fini !', 'Votre table LACK est montée. Faites-la tourner pour la voir sous tous les angles.', 'Vérifiez de temps en temps que les pieds sont toujours bien serrés.']
    ]
  },
  nl: {
    title: 'LACK bijzettafel · Montage 3D',
    chips: [['LACK', 'bijzettafel 55 × 55 cm']],
    footer: 'Onafhankelijk prototype, niet verbonden aan IKEA. De stappen zijn gereconstrueerd op basis van het ontwerp van het meubel: volg bij twijfel altijd de papieren handleiding.',
    sec: { preview: 'Voorbeeld', before: 'Voordat je begint', table: 'LACK-tafel', done: 'Klaar' },
    pn: { top: 'Tafelblad', leg: 'Poot {n}', screw: 'Dubbele draadbout' },
    hw: { top: 'Tafelblad', legs: 'Poten', dscrews: 'Dubbele draadbouten' },
    steps: [
      ['Zo ziet het eruit', 'Een LACK bijzettafel van 55 × 55 cm en 45 cm hoog. Je hebt geen gereedschap nodig: de poten draai je met de hand vast.', 'Tik op een onderdeel van het model om de naam te zien. Is iets niet duidelijk? Vraag het de AI.'],
      ['Controleer de onderdelen', 'Pak alles uit en controleer of je het tafelblad, de 4 poten en de 4 dubbele draadbouten hebt.'],
      ['Tafelblad ondersteboven', 'Leg het tafelblad ondersteboven op een deken of een stuk karton. In elke hoek zit een gat voor een poot.', 'Zo kras je de bovenkant niet terwijl je werkt.'],
      ['Draadbouten in de hoeken', 'Draai met de hand in elke hoek een dubbele draadbout tot de helft in het gat.', 'In sommige dozen zitten de draadbouten al in de poten. Is dat bij jou zo, sla deze stap dan over.'],
      ['Poten vastdraaien', 'Zet elke poot op de draadbout in een hoek en draai hem met de hand vast tot hij stevig tegen het tafelblad zit.', 'Houd hem recht en forceer niets op het einde: als je te hard aandraait, kan de schroefdraad in het blad beschadigen.'],
      ['Draai hem om', 'Draai de tafel om en zet hem op zijn poten. Controleer of hij niet wiebelt; wiebelt hij wel, kijk dan of alle poten helemaal vastgedraaid zijn.'],
      ['Klaar!', 'Je LACK-tafel is gemonteerd. Draai hem rond om hem van alle kanten te bekijken.', 'Controleer af en toe of de poten nog goed vastzitten.']
    ]
  }
};
