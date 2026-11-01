// Datos del Formulario (Paso 13).
// Las tarjetas se ARMAN con data/figuras.js y data/cuerpos.js: acá no se
// escribe ninguna fórmula de figuras ni de cuerpos redondos. Las mini
// calculadoras usan utils/geometry.js, igual que el resto de la app.
//
// Una tarjeta: { id, grupo, nombre, anios, formulas: [{ nombre, tex }],
//                variables, propiedades, equivalencias? }

import { parseNum } from '../utils/format.js';
import { FIGURAS, PITAGORAS } from './figuras.js';
import { POLIEDROS, REDONDOS, FORMULAS_POLIEDROS, EULER } from './cuerpos.js';
import { EQUIVALENCIAS } from './areasVolumenes.js';
import {
  perimetroTriangulo,
  areaTriangulo,
  perimetroCuadrado,
  areaCuadrado,
  perimetroRectangulo,
  areaRectangulo,
  areaParalelogramo,
  areaRombo,
  areaTrapecio,
  longitudCircunferencia,
  areaCirculo,
  areaPoligonoRegular,
  hipotenusa,
  cateto,
  areaLateralPrisma,
  areaTotalPrisma,
  volumenPrisma,
  areaTotalCubo,
  volumenCubo,
  areaTotalOrtoedro,
  volumenOrtoedro,
  areaTotalPiramide,
  volumenPiramide,
  areaLateralCilindro,
  areaTotalCilindro,
  volumenCilindro,
  generatrizCono,
  areaLateralCono,
  areaTotalCono,
  volumenCono,
  areaEsfera,
  volumenEsfera,
  euler,
} from '../utils/geometry.js';

export const GRUPOS_FORMULARIO = [
  { id: 'plana', titulo: 'Figuras planas', icono: '🔷' },
  { id: 'cuerpos', titulo: 'Cuerpos geométricos', icono: '🧊' },
  { id: 'otras', titulo: 'Otras fórmulas', icono: '🧮' },
];

const F = (nombre, tex) => ({ nombre, tex });
const recuento = (id) => {
  const p = POLIEDROS.find((c) => c.id === id);
  return `${p.C} caras, ${p.A} aristas y ${p.V} vértices (C + V = A + 2).`;
};
const redondo = (id) => REDONDOS.find((c) => c.id === id);

// ---------- Figuras planas (desde data/figuras.js) ----------
const planas = FIGURAS.map((f) => ({
  id: f.id,
  grupo: 'plana',
  nombre: f.nombre,
  anios: f.anios,
  formulas: [F(f.id === 'circulo' ? 'Longitud' : 'Perímetro', f.perimetro), F('Área', f.area)],
  variables: f.variables,
  propiedades: f.propiedades,
}));

const pitagoras = {
  id: PITAGORAS.id,
  grupo: 'plana',
  nombre: PITAGORAS.nombre,
  anios: PITAGORAS.anios,
  formulas: [F('Teorema', PITAGORAS.formula), F('Hipotenusa', PITAGORAS.hipotenusa), F('Cateto', PITAGORAS.cateto)],
  variables: { a: 'cateto', b: 'cateto', c: 'hipotenusa' },
  propiedades: [...PITAGORAS.propiedades, `Ternas pitagóricas: ${PITAGORAS.ternas.map((t) => t.join('-')).join(', ')}.`],
};

// ---------- Cuerpos (desde data/cuerpos.js) ----------
const cuerpos = [
  {
    id: 'cubo',
    grupo: 'cuerpos',
    nombre: 'Cubo',
    anios: [1, 2],
    formulas: [F('Área lateral', FORMULAS_POLIEDROS.cubo.areaLateral), F('Área total', FORMULAS_POLIEDROS.cubo.areaTotal), F('Volumen', FORMULAS_POLIEDROS.cubo.volumen)],
    variables: { a: 'arista' },
    propiedades: ['Seis caras cuadradas iguales.', recuento('cubo')],
  },
  {
    id: 'ortoedro',
    grupo: 'cuerpos',
    nombre: 'Ortoedro (prisma rectangular)',
    anios: [1, 2],
    formulas: [F('Área lateral', FORMULAS_POLIEDROS.ortoedro.areaLateral), F('Área total', FORMULAS_POLIEDROS.ortoedro.areaTotal), F('Volumen', FORMULAS_POLIEDROS.ortoedro.volumen)],
    variables: { a: 'largo', b: 'ancho', c: 'alto' },
    propiedades: ['Seis caras rectangulares; las caras opuestas son iguales.', recuento('ortoedro')],
  },
  {
    id: 'prisma',
    grupo: 'cuerpos',
    nombre: 'Prisma recto',
    anios: [1, 2],
    formulas: [F('Área lateral', FORMULAS_POLIEDROS.prisma.areaLateral), F('Área total', FORMULAS_POLIEDROS.prisma.areaTotal), F('Volumen', FORMULAS_POLIEDROS.prisma.volumen)],
    variables: { 'P_{base}': 'perímetro de la base', 'A_{base}': 'área de la base', h: 'altura del prisma' },
    propiedades: ['Dos bases iguales y paralelas; en un prisma recto las caras laterales son rectángulos.', 'Se nombra por su base: triangular, pentagonal, hexagonal…'],
  },
  {
    id: 'piramide',
    grupo: 'cuerpos',
    nombre: 'Pirámide',
    anios: [1, 2],
    formulas: [F('Área lateral', FORMULAS_POLIEDROS.piramide.areaLateral), F('Área total', FORMULAS_POLIEDROS.piramide.areaTotal), F('Volumen', FORMULAS_POLIEDROS.piramide.volumen)],
    variables: { 'A_L': 'área lateral', 'A_{base}': 'área de la base', h: 'altura de la pirámide' },
    propiedades: ['Una base y caras laterales triangulares que se juntan en el vértice.', 'Se nombra por su base: triangular, cuadrada, pentagonal…', 'Su volumen es la tercera parte del prisma de igual base y altura.'],
  },
  {
    id: 'cilindro',
    grupo: 'cuerpos',
    nombre: 'Cilindro',
    anios: redondo('cilindro').anios,
    formulas: [F('Área lateral', redondo('cilindro').areaLateral), F('Área total', redondo('cilindro').areaTotal), F('Volumen', redondo('cilindro').volumen)],
    variables: redondo('cilindro').variables,
    propiedades: [redondo('cilindro').detalle + '.', redondo('cilindro').desarrollo],
  },
  {
    id: 'cono',
    grupo: 'cuerpos',
    nombre: 'Cono',
    anios: redondo('cono').anios,
    formulas: [
      F('Generatriz', redondo('cono').generatriz),
      F('Área lateral', redondo('cono').areaLateral),
      F('Área total', redondo('cono').areaTotal),
      F('Volumen', redondo('cono').volumen),
    ],
    variables: redondo('cono').variables,
    propiedades: [redondo('cono').detalle + '.', redondo('cono').desarrollo],
  },
  {
    id: 'esfera',
    grupo: 'cuerpos',
    nombre: 'Esfera',
    anios: redondo('esfera').anios,
    formulas: [F('Área de la superficie', redondo('esfera').areaTotal), F('Volumen', redondo('esfera').volumen)],
    variables: redondo('esfera').variables,
    propiedades: [redondo('esfera').detalle + '.', redondo('esfera').desarrollo],
  },
];

// ---------- Otras ----------
const otras = [
  {
    id: 'euler',
    grupo: 'otras',
    nombre: 'Fórmula de Euler',
    anios: [2],
    formulas: [F('Poliedros', EULER.tex)],
    variables: { C: 'caras', V: 'vértices', A: 'aristas' },
    propiedades: ['Vale para los poliedros sin agujeros.', 'Si el cuerpo tiene un agujero que lo atraviesa, C + V − A da 0 en lugar de 2.'],
  },
  {
    id: 'unidades',
    grupo: 'otras',
    nombre: 'Unidades de área, volumen y capacidad',
    anios: [1, 2],
    formulas: [F('Capacidad', '1\\ \\text{dm}^3 = 1\\ \\text{L}')],
    variables: {},
    propiedades: ['Al pasar de unidad, el área se multiplica por el cuadrado y el volumen por el cubo del factor de longitud.'],
    equivalencias: EQUIVALENCIAS,
  },
];

export const TARJETAS = [...planas, pitagoras, ...cuerpos, ...otras];

export const tarjetasPorAnio = (anio, tarjetas = TARJETAS) => (anio ? tarjetas.filter((t) => t.anios.includes(anio)) : tarjetas);

// ---------- Buscador ----------
// Sin tildes ni mayúsculas: «area» encuentra «Área»
export const normalizar = (texto) =>
  String(texto)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const textoBuscable = (t) =>
  normalizar(
    [
      t.nombre,
      GRUPOS_FORMULARIO.find((g) => g.id === t.grupo).titulo,
      ...t.formulas.map((f) => f.nombre),
      ...Object.values(t.variables),
      ...t.propiedades,
      ...(t.equivalencias || []).flatMap((e) => [e.de, e.a, e.tipo]),
    ].join(' ')
  );

// Todas las palabras de la consulta tienen que aparecer en la tarjeta
export function buscarTarjetas(tarjetas, consulta) {
  const palabras = normalizar(consulta).split(/\s+/).filter(Boolean);
  if (palabras.length === 0) return tarjetas;
  return tarjetas.filter((t) => {
    const texto = textoBuscable(t);
    return palabras.every((p) => texto.includes(p));
  });
}

// ---------- Mini calculadoras ----------
// campos: lo que se escribe. resultados: cada uno se calcula solo si están
// escritos (y son válidos) todos los campos que `requiere`.
// dim: 'lineal' | 'area' | 'volumen' | 'cantidad' (decide la unidad que se muestra)
const R = (nombre, requiere, dim, calc) => ({ nombre, requiere, dim, calc });

export const CALCULADORAS = {
  triangulo: {
    campos: { a: 'Lado a', b: 'Base b', c: 'Lado c', h: 'Altura h' },
    resultados: [
      R('Perímetro', ['a', 'b', 'c'], 'lineal', (v) => perimetroTriangulo(v.a, v.b, v.c)),
      R('Área', ['b', 'h'], 'area', (v) => areaTriangulo(v.b, v.h)),
    ],
  },
  cuadrado: {
    campos: { l: 'Lado l' },
    resultados: [R('Perímetro', ['l'], 'lineal', (v) => perimetroCuadrado(v.l)), R('Área', ['l'], 'area', (v) => areaCuadrado(v.l))],
  },
  rectangulo: {
    campos: { b: 'Base b', h: 'Altura h' },
    resultados: [R('Perímetro', ['b', 'h'], 'lineal', (v) => perimetroRectangulo(v.b, v.h)), R('Área', ['b', 'h'], 'area', (v) => areaRectangulo(v.b, v.h))],
  },
  paralelogramo: {
    campos: { a: 'Lado a', b: 'Base b', h: 'Altura h' },
    resultados: [R('Perímetro', ['a', 'b'], 'lineal', (v) => perimetroRectangulo(v.a, v.b)), R('Área', ['b', 'h'], 'area', (v) => areaParalelogramo(v.b, v.h))],
  },
  rombo: {
    campos: { l: 'Lado l', D: 'Diagonal mayor D', d: 'Diagonal menor d' },
    resultados: [R('Perímetro', ['l'], 'lineal', (v) => perimetroCuadrado(v.l)), R('Área', ['D', 'd'], 'area', (v) => areaRombo(v.D, v.d))],
  },
  trapecio: {
    campos: { B: 'Base mayor B', b: 'Base menor b', c: 'Lado c', d: 'Lado d', h: 'Altura h' },
    resultados: [
      R('Perímetro', ['B', 'b', 'c', 'd'], 'lineal', (v) => v.B + v.b + v.c + v.d),
      R('Área', ['B', 'b', 'h'], 'area', (v) => areaTrapecio(v.B, v.b, v.h)),
    ],
  },
  circulo: {
    campos: { r: 'Radio r' },
    resultados: [
      R('Longitud', ['r'], 'lineal', (v, pi) => longitudCircunferencia(v.r, pi)),
      R('Área', ['r'], 'area', (v, pi) => areaCirculo(v.r, pi)),
    ],
  },
  'poligono-regular': {
    campos: { n: 'Cantidad de lados n', l: 'Lado l', a_p: 'Apotema a_p' },
    resultados: [
      R('Perímetro', ['n', 'l'], 'lineal', (v) => v.n * v.l),
      R('Área', ['n', 'l', 'a_p'], 'area', (v) => areaPoligonoRegular(v.n * v.l, v.a_p)),
    ],
  },
  pitagoras: {
    campos: { a: 'Cateto a', b: 'Cateto b', c: 'Hipotenusa c' },
    resultados: [
      R('Hipotenusa c', ['a', 'b'], 'lineal', (v) => hipotenusa(v.a, v.b)),
      R('Cateto a (con b y c)', ['b', 'c'], 'lineal', (v) => cateto(v.c, v.b)),
    ],
  },
  cubo: {
    campos: { a: 'Arista a' },
    resultados: [
      R('Área lateral', ['a'], 'area', (v) => areaLateralPrisma(4 * v.a, v.a)),
      R('Área total', ['a'], 'area', (v) => areaTotalCubo(v.a)),
      R('Volumen', ['a'], 'volumen', (v) => volumenCubo(v.a)),
    ],
  },
  ortoedro: {
    campos: { a: 'Largo a', b: 'Ancho b', c: 'Alto c' },
    resultados: [
      R('Área lateral', ['a', 'b', 'c'], 'area', (v) => areaLateralPrisma(perimetroRectangulo(v.a, v.b), v.c)),
      R('Área total', ['a', 'b', 'c'], 'area', (v) => areaTotalOrtoedro(v.a, v.b, v.c)),
      R('Volumen', ['a', 'b', 'c'], 'volumen', (v) => volumenOrtoedro(v.a, v.b, v.c)),
    ],
  },
  prisma: {
    campos: { Pb: 'Perímetro de la base', Ab: 'Área de la base', h: 'Altura h' },
    resultados: [
      R('Área lateral', ['Pb', 'h'], 'area', (v) => areaLateralPrisma(v.Pb, v.h)),
      R('Área total', ['Pb', 'Ab', 'h'], 'area', (v) => areaTotalPrisma(areaLateralPrisma(v.Pb, v.h), v.Ab)),
      R('Volumen', ['Ab', 'h'], 'volumen', (v) => volumenPrisma(v.Ab, v.h)),
    ],
  },
  piramide: {
    campos: { AL: 'Área lateral', Ab: 'Área de la base', h: 'Altura h' },
    resultados: [
      R('Área total', ['AL', 'Ab'], 'area', (v) => areaTotalPiramide(v.AL, v.Ab)),
      R('Volumen', ['Ab', 'h'], 'volumen', (v) => volumenPiramide(v.Ab, v.h)),
    ],
  },
  cilindro: {
    campos: { r: 'Radio r', h: 'Altura h' },
    resultados: [
      R('Área lateral', ['r', 'h'], 'area', (v, pi) => areaLateralCilindro(v.r, v.h, pi)),
      R('Área total', ['r', 'h'], 'area', (v, pi) => areaTotalCilindro(v.r, v.h, pi)),
      R('Volumen', ['r', 'h'], 'volumen', (v, pi) => volumenCilindro(v.r, v.h, pi)),
    ],
  },
  cono: {
    campos: { r: 'Radio r', h: 'Altura h' },
    resultados: [
      R('Generatriz', ['r', 'h'], 'lineal', (v) => generatrizCono(v.r, v.h)),
      R('Área lateral', ['r', 'h'], 'area', (v, pi) => areaLateralCono(v.r, generatrizCono(v.r, v.h), pi)),
      R('Área total', ['r', 'h'], 'area', (v, pi) => areaTotalCono(v.r, generatrizCono(v.r, v.h), pi)),
      R('Volumen', ['r', 'h'], 'volumen', (v, pi) => volumenCono(v.r, v.h, pi)),
    ],
  },
  esfera: {
    campos: { r: 'Radio r' },
    resultados: [
      R('Área de la superficie', ['r'], 'area', (v, pi) => areaEsfera(v.r, pi)),
      R('Volumen', ['r'], 'volumen', (v, pi) => volumenEsfera(v.r, pi)),
    ],
  },
  euler: {
    campos: { C: 'Caras C', V: 'Vértices V', A: 'Aristas A' },
    resultados: [
      R('Aristas', ['C', 'V'], 'cantidad', (v) => euler.aristas(v.C, v.V)),
      R('Caras', ['A', 'V'], 'cantidad', (v) => euler.caras(v.A, v.V)),
      R('Vértices', ['C', 'A'], 'cantidad', (v) => euler.vertices(v.C, v.A)),
    ],
  },
};

// textos: lo que escribió el estudiante, por campo: { b: '6', h: '4,5' }.
// Devuelve los resultados que se pueden calcular: [{ nombre, valor, dim }].
// Un campo vacío, con letras, cero o negativo no se usa; un resultado que no
// es un número positivo (por ejemplo un cateto con c < b) no se muestra.
export function calcularTarjeta(id, textos, pi = Math.PI) {
  const calc = CALCULADORAS[id];
  if (!calc) return [];
  const v = {};
  Object.keys(calc.campos).forEach((k) => {
    const n = parseNum(textos?.[k] ?? '');
    if (Number.isFinite(n) && n > 0) v[k] = n;
  });
  return calc.resultados
    .filter((r) => r.requiere.every((k) => k in v))
    .map((r) => ({ nombre: r.nombre, valor: r.calc(v, pi), dim: r.dim }))
    .filter((r) => Number.isFinite(r.valor) && r.valor > 0);
}

// Unidad que se muestra junto al resultado: 'cm', 'cm²', 'cm³' o nada
export const unidadConDim = (dim, unidad) =>
  dim === 'lineal' ? unidad : dim === 'area' ? `${unidad}²` : dim === 'volumen' ? `${unidad}³` : '';

export const UNIDADES_LONGITUD = ['mm', 'cm', 'dm', 'm'];
