// Modo evaluación (Paso 15): dos ejercicios completos, uno de figuras planas y
// uno de cuerpos, con puntaje por paso y sin pistas.
//
// Igual que los problemas (Paso 14), todo sale de una semilla: la «Evaluación
// N.º 4821» es siempre la misma, así que la hoja del alumno, la versión en
// pantalla y la clave del docente coinciden.
//
//   const ev = crearEvaluacion(4821, anio, { pi, piEscolar });
//   corregirEvaluacion(ev, { '1a': { texto: '52', unidad: 'm' }, ... })
//     -> { partes: { '1a': { estado, puntos }, ... }, total, maximo }
//
// Cada ejercicio: { id, bloque, anios, titulo, usaPi?, generar(r), enunciado(d),
//                   figura?(d), partes(d, ctx) }
// Cada parte:     { id, consigna, puntos, unidad, valor, tex, usaPi?, nota?, distractores? }

import { crearAleatorio } from '../utils/rand.js';
import { casiIgual, parseNum } from '../utils/format.js';
import { opcionesDeUnidad, texNumero as n, r6, piTex } from './problemas.js';

// Se descuenta esto en un punto cuando el número está bien pero la unidad falta o está mal
export const DESCUENTO_UNIDAD = 0.5;

const P = (id, consigna, puntos, unidad, valor, tex, extra = {}) => ({ id, consigna, puntos, unidad, valor: r6(valor), tex, ...extra });

export const EJERCICIOS = [
  // ====================== FIGURAS PLANAS ======================
  {
    id: 'terreno-pileta',
    bloque: 'figuras',
    anios: [1, 2],
    usaPi: true,
    titulo: 'El terreno con pileta',
    generar: (r) => ({ largo: r.int(12, 20), ancho: r.int(8, 12), radio: r.int(2, 4) }),
    enunciado: ({ largo, ancho, radio }) =>
      `Un terreno rectangular mide ${largo} m de largo y ${ancho} m de ancho. En su interior hay una pileta circular de ${radio} m de radio.`,
    partes: ({ largo, ancho, radio }, ctx) => {
      const pileta = ctx.pi * radio * radio;
      return [
        P('a', 'Calculá el perímetro del terreno.', 1, 'm', 2 * (largo + ancho), `P = 2 \\cdot (${n(largo)} + ${n(ancho)})`),
        P('b', 'Calculá el área del terreno.', 1, 'm²', largo * ancho, `A = ${n(largo)} \\cdot ${n(ancho)}`),
        P('c', 'Calculá el área de la pileta.', 2, 'm²', pileta, `A = ${piTex(ctx)} \\cdot ${n(radio)}^2`, { usaPi: true }),
        P('d', 'Calculá el área del terreno que queda libre (sin la pileta).', 2, 'm²', largo * ancho - pileta, `A = ${n(largo * ancho)} - ${n(r6(pileta))}`, { usaPi: true }),
      ];
    },
  },
  {
    id: 'cartel-casita',
    bloque: 'figuras',
    anios: [2],
    titulo: 'El cartel en forma de casita',
    generar: (r) => {
      const [semi, techo, lado] = r.pick([[3, 4, 5], [6, 8, 10]]).map((x) => x * 10);
      return { base: 2 * semi, semi, techo, lado, pared: r.int(40, 80) };
    },
    enunciado: ({ base, pared, techo }) =>
      `Un cartel tiene forma de casita: abajo, un rectángulo de ${base} cm de base y ${pared} cm de alto; arriba, un triángulo isósceles con la misma base y ${techo} cm de altura.`,
    partes: ({ base, semi, techo, lado, pared }) => [
      P('a', 'Calculá cuánto mide cada lado inclinado del techo.', 2, 'cm', lado, `l = \\sqrt{${n(semi)}^2 + ${n(techo)}^2}`, {
        nota: 'La altura del triángulo divide a la base en dos partes iguales: queda un triángulo rectángulo.',
      }),
      P('b', 'Calculá el área total del cartel.', 2, 'cm²', base * pared + (base * techo) / 2, `A = ${n(base)} \\cdot ${n(pared)} + \\dfrac{${n(base)} \\cdot ${n(techo)}}{2}`),
      P('c', 'Calculá el perímetro del cartel.', 2, 'cm', base + 2 * pared + 2 * lado, `P = ${n(base)} + 2 \\cdot ${n(pared)} + 2 \\cdot ${n(lado)}`),
    ],
  },
  {
    id: 'patio-con-rincon',
    bloque: 'figuras',
    anios: [1, 2],
    titulo: 'El patio con rincón',
    generar: (r) => ({ largo: r.int(10, 14), ancho: r.int(8, 10), rLargo: r.int(3, 5), rAncho: r.int(2, 4) }),
    enunciado: ({ largo, ancho, rLargo, rAncho }) =>
      `El patio de una casa se hizo a partir de un rectángulo de ${largo} m por ${ancho} m, al que se le quitó un rincón rectangular de ${rLargo} m por ${rAncho} m (como muestra la figura).`,
    figura: (datos) => ({ tipo: 'patio-L', ...datos }),
    partes: ({ largo, ancho, rLargo, rAncho }) => [
      P('a', 'Calculá el área del rectángulo completo.', 1, 'm²', largo * ancho, `A = ${n(largo)} \\cdot ${n(ancho)}`),
      P('b', 'Calculá el área del rincón que se quitó.', 1, 'm²', rLargo * rAncho, `A = ${n(rLargo)} \\cdot ${n(rAncho)}`),
      P('c', 'Calculá el área del patio.', 2, 'm²', largo * ancho - rLargo * rAncho, `A = ${n(largo * ancho)} - ${n(rLargo * rAncho)}`),
      P('d', 'Calculá el perímetro del patio.', 2, 'm', 2 * (largo + ancho), `P = 2 \\cdot (${n(largo)} + ${n(ancho)})`, {
        nota: 'Quitar un rincón rectangular no cambia el perímetro: es el mismo que el del rectángulo completo.',
      }),
    ],
  },

  // ====================== CUERPOS ======================
  {
    id: 'caja-desarrollo',
    bloque: 'cuerpos',
    anios: [1, 2],
    titulo: 'La caja y su desarrollo plano',
    generar: (r) => ({ largo: r.int(12, 20), ancho: r.int(8, 12), alto: r.int(5, 10) }),
    enunciado: ({ largo, ancho, alto }) =>
      `La figura muestra el desarrollo plano de una caja (medidas en cm). La caja mide ${largo} cm de largo, ${ancho} cm de ancho y ${alto} cm de alto.`,
    figura: ({ largo, ancho, alto }) => ({ tipo: 'net', id: 'ortoedro', medidas: { a: largo, b: ancho, h: alto }, rotular: true }),
    partes: ({ largo, ancho, alto }) => [
      P('a', 'Calculá el área lateral (las 4 caras que no son tapa ni fondo).', 1, 'cm²', 2 * (largo + ancho) * alto, `A_L = 2 \\cdot (${n(largo)} + ${n(ancho)}) \\cdot ${n(alto)}`),
      P(
        'b',
        'Calculá el área total (la suma de todas las caras del desarrollo).',
        2,
        'cm²',
        2 * (largo * ancho + largo * alto + ancho * alto),
        `A_T = 2 \\cdot (${n(largo * ancho)} + ${n(largo * alto)} + ${n(ancho * alto)})`
      ),
      P('c', 'Calculá el volumen de la caja.', 2, 'cm³', largo * ancho * alto, `V = ${n(largo)} \\cdot ${n(ancho)} \\cdot ${n(alto)}`),
      P('d', 'Calculá cuántos litros entran en la caja.', 1, 'L', (largo * ancho * alto) / 1000, `${n(largo * ancho * alto)} : 1000`, {
        distractores: ['cm³', 'm³', 'cm²'],
      }),
    ],
  },
  {
    id: 'cubo-desarrollo',
    bloque: 'cuerpos',
    anios: [1, 2],
    titulo: 'El cubo y su desarrollo plano',
    generar: (r) => ({ arista: r.int(4, 10) }),
    enunciado: ({ arista }) => `La figura muestra el desarrollo plano de un cubo de ${arista} cm de arista.`,
    figura: ({ arista }) => ({ tipo: 'net', id: 'cubo', medidas: { a: arista }, rotular: true }),
    partes: ({ arista }) => [
      P('a', 'Calculá el área de una cara.', 1, 'cm²', arista * arista, `A = ${n(arista)}^2`),
      P('b', 'Calculá el área total del cubo.', 2, 'cm²', 6 * arista * arista, `A_T = 6 \\cdot ${n(arista)}^2`),
      P('c', 'Calculá el volumen del cubo.', 2, 'cm³', arista ** 3, `V = ${n(arista)}^3`),
      P('d', 'Calculá la suma de las longitudes de todas las aristas.', 1, 'cm', 12 * arista, `12 \\cdot ${n(arista)}`, {
        nota: 'El cubo tiene 12 aristas iguales.',
      }),
    ],
  },
  {
    id: 'piramide-desarrollo',
    bloque: 'cuerpos',
    anios: [2],
    titulo: 'La pirámide y su desarrollo plano',
    generar: (r) => {
      const [semi, altura, apotema] = r.pick([[3, 4, 5], [6, 8, 10], [5, 12, 13]]);
      return { lado: 2 * semi, semi, altura, apotema };
    },
    enunciado: ({ lado, altura }) =>
      `La figura muestra el desarrollo plano de una pirámide de base cuadrada de ${lado} cm de lado y ${altura} cm de altura.`,
    figura: ({ lado, altura }) => ({ tipo: 'net', id: 'piramide-cuadrada', medidas: { a: lado, h: altura }, rotular: false }),
    partes: ({ lado, semi, altura, apotema }) => [
      P('a', 'Calculá la altura de cada cara lateral (la apotema de la pirámide).', 2, 'cm', apotema, `a_p = \\sqrt{${n(altura)}^2 + ${n(semi)}^2}`, {
        nota: 'La altura de la pirámide, la mitad del lado de la base y la apotema forman un triángulo rectángulo.',
      }),
      P('b', 'Calculá el área lateral (las 4 caras triangulares).', 2, 'cm²', 4 * ((lado * apotema) / 2), `A_L = 4 \\cdot \\dfrac{${n(lado)} \\cdot ${n(apotema)}}{2}`),
      P('c', 'Calculá el volumen de la pirámide.', 2, 'cm³', (lado * lado * altura) / 3, `V = \\dfrac{${n(lado)}^2 \\cdot ${n(altura)}}{3}`),
    ],
  },
  {
    id: 'cilindro-desarrollo',
    bloque: 'cuerpos',
    anios: [1, 2],
    usaPi: true,
    titulo: 'El cilindro y su desarrollo plano',
    generar: (r) => ({ radio: r.int(3, 6), altura: r.int(8, 15) }),
    enunciado: ({ radio, altura }) =>
      `Un cilindro tiene ${radio} cm de radio y ${altura} cm de altura. Su desarrollo plano tiene un rectángulo (la superficie lateral) y dos círculos (las bases).`,
    figura: () => ({ tipo: 'redondo', id: 'cilindro' }),
    partes: ({ radio, altura }, ctx) => {
      const largo = 2 * ctx.pi * radio;
      const lateral = largo * altura;
      return [
        P('a', 'Calculá cuánto mide el lado largo del rectángulo del desarrollo (la circunferencia de la base).', 1, 'cm', largo, `L = 2 \\cdot ${piTex(ctx)} \\cdot ${n(radio)}`, { usaPi: true }),
        P('b', 'Calculá el área lateral.', 1, 'cm²', lateral, `A_L = ${n(r6(largo))} \\cdot ${n(altura)}`, { usaPi: true }),
        P('c', 'Calculá el área total.', 2, 'cm²', lateral + 2 * ctx.pi * radio * radio, `A_T = ${n(r6(lateral))} + 2 \\cdot ${piTex(ctx)} \\cdot ${n(radio)}^2`, { usaPi: true }),
        P('d', 'Calculá el volumen del cilindro.', 2, 'cm³', ctx.pi * radio * radio * altura, `V = ${piTex(ctx)} \\cdot ${n(radio)}^2 \\cdot ${n(altura)}`, { usaPi: true }),
      ];
    },
  },
];

export const ejerciciosDe = (bloque, anio = 0) => EJERCICIOS.filter((e) => e.bloque === bloque && (!anio || e.anios.includes(anio)));

// ---------- Armado ----------
export function crearEvaluacion(semilla, anio = 0, ctx = { pi: 3.14, piEscolar: true }) {
  const elegidos = [
    crearAleatorio((semilla + 101) >>> 0).pick(ejerciciosDe('figuras', anio)),
    crearAleatorio((semilla + 202) >>> 0).pick(ejerciciosDe('cuerpos', anio)),
  ];

  const ejercicios = elegidos.map((ej, i) => {
    const r = crearAleatorio((semilla + 31 * (i + 1)) >>> 0);
    const datos = ej.generar(r);
    const nota = ej.usaPi ? (ctx.piEscolar ? ' Usá π = 3,14.' : ' Usá la tecla π de la calculadora.') : '';
    const partes = ej.partes(datos, ctx).map((p) => ({
      ...p,
      id: `${i + 1}${p.id}`,
      letra: p.id,
      opciones: opcionesDeUnidad(p.unidad, p.distractores, r),
      // Con π o con decimales, 1 % de margen; un entero tiene que ser exacto
      tolerancia: p.usaPi || !Number.isInteger(p.valor) ? 0.01 : 0,
    }));
    return {
      numero: i + 1,
      id: ej.id,
      bloque: ej.bloque,
      titulo: ej.titulo,
      enunciado: ej.enunciado(datos) + nota,
      figura: ej.figura ? ej.figura(datos) : null,
      partes,
      puntos: partes.reduce((s, p) => s + p.puntos, 0),
    };
  });

  return { semilla, anio, ejercicios, maximo: ejercicios.reduce((s, e) => s + e.puntos, 0) };
}

// ---------- Corrección ----------
// estado: 'ok' | 'unidad' (número bien, unidad mal o sin elegir: descuenta 0,5) | 'mal' | 'vacio'
export function corregirParte(parte, texto, unidad) {
  const valor = parseNum(texto ?? '');
  if (Number.isNaN(valor)) return { estado: 'vacio', puntos: 0 };
  if (!casiIgual(valor, parte.valor, parte.tolerancia)) return { estado: 'mal', puntos: 0 };
  if (unidad === parte.unidad) return { estado: 'ok', puntos: parte.puntos };
  return { estado: 'unidad', puntos: Math.max(0, parte.puntos - DESCUENTO_UNIDAD) };
}

export function corregirEvaluacion(evaluacion, respuestas) {
  const partes = {};
  let total = 0;
  evaluacion.ejercicios.forEach((e) =>
    e.partes.forEach((p) => {
      const r = corregirParte(p, respuestas[p.id]?.texto, respuestas[p.id]?.unidad);
      partes[p.id] = r;
      total += r.puntos;
    })
  );
  return { partes, total, maximo: evaluacion.maximo };
}
