// Datos y cálculos del módulo «Áreas y volúmenes» (Paso 12).
// Todo número sale de utils/geometry.js y toda fórmula de data/cuerpos.js:
// acá solo se arma el desglose (fórmula → reemplazo → resultado).
//
//   calcularCuerpo('cilindro', { r: 3, h: 5 }, { pi: 3.14, piEscolar: true })
//   -> { previos: [...], resultados: [...] }
//
// Cada ítem: { id, nombre, formula, reemplazo, valor, dim, usaPi }
//   formula    LaTeX de la fórmula (de data/cuerpos.js)
//   reemplazo  LaTeX con los números ya puestos (coma decimal)
//   dim        'lineal' | 'area' | 'volumen' (decide la unidad: cm, cm², cm³)

import { texNum } from '../utils/format.js';
import {
  areaLateralPrisma,
  areaTotalPrisma,
  volumenPrisma,
  areaTotalCubo,
  volumenCubo,
  areaTotalOrtoedro,
  volumenOrtoedro,
  perimetroRectangulo,
  areaTriangulo,
  hipotenusa,
  areaCuadrado,
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
  convertirArea,
  convertirVolumen,
  cm3ALitros,
  dm3ALitros,
  m3ALitros,
} from '../utils/geometry.js';
import { FORMULAS_POLIEDROS, REDONDOS } from './cuerpos.js';

const redondo = (id) => REDONDOS.find((c) => c.id === id);

export const UNIDAD_TEXTO = { lineal: 'cm', area: 'cm²', volumen: 'cm³' };
export const UNIDAD_TEX = { lineal: '\\text{cm}', area: '\\text{cm}^2', volumen: '\\text{cm}^3' };

// ---------- Cuerpos del explorador ----------
// params: lo que el estudiante puede cambiar con deslizadores (todo en cm)
const P = (id, etiqueta, inicial, max = 10) => ({ id, etiqueta, inicial, min: 1, max, paso: 1 });

export const CUERPOS_CALCULO = [
  { id: 'cubo', nombre: 'Cubo', params: [P('a', 'Arista', 3)] },
  { id: 'ortoedro', nombre: 'Ortoedro', params: [P('a', 'Largo', 5), P('b', 'Ancho', 3), P('c', 'Alto', 4)] },
  {
    id: 'prisma-triangular',
    nombre: 'Prisma triangular',
    params: [P('p', 'Cateto 1 de la base', 3), P('q', 'Cateto 2 de la base', 4), P('h', 'Altura del prisma', 6)],
  },
  { id: 'piramide-cuadrada', nombre: 'Pirámide cuadrada', params: [P('a', 'Lado de la base', 6), P('h', 'Altura', 4)] },
  { id: 'cilindro', nombre: 'Cilindro', params: [P('r', 'Radio', 3, 8), P('h', 'Altura', 5)] },
  { id: 'cono', nombre: 'Cono', params: [P('r', 'Radio', 3, 8), P('h', 'Altura', 4)] },
  { id: 'esfera', nombre: 'Esfera', params: [P('r', 'Radio', 3, 8)] },
];

export const medidasIniciales = (id) =>
  Object.fromEntries(CUERPOS_CALCULO.find((c) => c.id === id).params.map((p) => [p.id, p.inicial]));

const n = (x) => texNum(x, 2);

export function calcularCuerpo(id, m, { pi = Math.PI, piEscolar = true } = {}) {
  const piTex = piEscolar ? n(pi) : '\\pi';
  const it = (clave, nombre, formula, reemplazo, valor, dim, usaPi = false) => ({
    id: clave,
    nombre,
    formula,
    reemplazo,
    valor,
    dim,
    usaPi,
  });

  if (id === 'cubo') {
    const { a } = m;
    const f = FORMULAS_POLIEDROS.cubo;
    return {
      previos: [],
      resultados: [
        it('areaLateral', 'Área lateral', f.areaLateral, `4 \\cdot ${n(a)}^2`, areaLateralPrisma(4 * a, a), 'area'),
        it('areaTotal', 'Área total', f.areaTotal, `6 \\cdot ${n(a)}^2`, areaTotalCubo(a), 'area'),
        it('volumen', 'Volumen', f.volumen, `${n(a)}^3`, volumenCubo(a), 'volumen'),
      ],
    };
  }

  if (id === 'ortoedro') {
    const { a, b, c } = m;
    const f = FORMULAS_POLIEDROS.ortoedro;
    return {
      previos: [],
      resultados: [
        it('areaLateral', 'Área lateral', f.areaLateral, `2 \\cdot (${n(a)} + ${n(b)}) \\cdot ${n(c)}`, areaLateralPrisma(perimetroRectangulo(a, b), c), 'area'),
        it(
          'areaTotal',
          'Área total',
          f.areaTotal,
          `2 \\cdot (${n(a)} \\cdot ${n(b)} + ${n(a)} \\cdot ${n(c)} + ${n(b)} \\cdot ${n(c)})`,
          areaTotalOrtoedro(a, b, c),
          'area'
        ),
        it('volumen', 'Volumen', f.volumen, `${n(a)} \\cdot ${n(b)} \\cdot ${n(c)}`, volumenOrtoedro(a, b, c), 'volumen'),
      ],
    };
  }

  if (id === 'prisma-triangular') {
    // Base: triángulo rectángulo de catetos p y q (así la hipotenusa sale por Pitágoras)
    const { p, q, h } = m;
    const f = FORMULAS_POLIEDROS.prisma;
    const hip = hipotenusa(p, q);
    const perimetro = p + q + hip;
    const areaBase = areaTriangulo(p, q);
    const aLateral = areaLateralPrisma(perimetro, h);
    return {
      previos: [
        it('hipotenusa', 'Hipotenusa de la base', 'c = \\sqrt{p^2 + q^2}', `\\sqrt{${n(p)}^2 + ${n(q)}^2}`, hip, 'lineal'),
        it('perimetroBase', 'Perímetro de la base', 'P_{base} = p + q + c', `${n(p)} + ${n(q)} + ${n(hip)}`, perimetro, 'lineal'),
        it('areaBase', 'Área de la base', 'A_{base} = \\dfrac{p \\cdot q}{2}', `\\dfrac{${n(p)} \\cdot ${n(q)}}{2}`, areaBase, 'area'),
      ],
      resultados: [
        it('areaLateral', 'Área lateral', f.areaLateral, `${n(perimetro)} \\cdot ${n(h)}`, aLateral, 'area'),
        it('areaTotal', 'Área total', f.areaTotal, `${n(aLateral)} + 2 \\cdot ${n(areaBase)}`, areaTotalPrisma(aLateral, areaBase), 'area'),
        it('volumen', 'Volumen', f.volumen, `${n(areaBase)} \\cdot ${n(h)}`, volumenPrisma(areaBase, h), 'volumen'),
      ],
    };
  }

  if (id === 'piramide-cuadrada') {
    const { a, h } = m;
    const f = FORMULAS_POLIEDROS.piramide;
    // apotema de la pirámide: altura de cada cara lateral (triángulo)
    const ap = Math.sqrt(h * h + (a / 2) ** 2);
    const areaBase = areaCuadrado(a);
    const aLateral = 4 * areaTriangulo(a, ap);
    return {
      previos: [
        it('apotema', 'Altura de cada cara lateral', 'a_p = \\sqrt{h^2 + \\left(\\dfrac{a}{2}\\right)^2}', `\\sqrt{${n(h)}^2 + \\left(\\dfrac{${n(a)}}{2}\\right)^2}`, ap, 'lineal'),
        it('areaBase', 'Área de la base', 'A_{base} = a^2', `${n(a)}^2`, areaBase, 'area'),
      ],
      resultados: [
        it('areaLateral', 'Área lateral', f.areaLateral, `4 \\cdot \\dfrac{${n(a)} \\cdot ${n(ap)}}{2}`, aLateral, 'area'),
        it('areaTotal', 'Área total', f.areaTotal, `${n(aLateral)} + ${n(areaBase)}`, areaTotalPiramide(aLateral, areaBase), 'area'),
        it('volumen', 'Volumen', f.volumen, `\\dfrac{${n(areaBase)} \\cdot ${n(h)}}{3}`, volumenPiramide(areaBase, h), 'volumen'),
      ],
    };
  }

  if (id === 'cilindro') {
    const { r, h } = m;
    const c = redondo('cilindro');
    return {
      previos: [],
      resultados: [
        it('areaLateral', 'Área lateral', c.areaLateral, `2 \\cdot ${piTex} \\cdot ${n(r)} \\cdot ${n(h)}`, areaLateralCilindro(r, h, pi), 'area', true),
        it('areaTotal', 'Área total', c.areaTotal, `2 \\cdot ${piTex} \\cdot ${n(r)} \\cdot (${n(r)} + ${n(h)})`, areaTotalCilindro(r, h, pi), 'area', true),
        it('volumen', 'Volumen', c.volumen, `${piTex} \\cdot ${n(r)}^2 \\cdot ${n(h)}`, volumenCilindro(r, h, pi), 'volumen', true),
      ],
    };
  }

  if (id === 'cono') {
    const { r, h } = m;
    const c = redondo('cono');
    const g = generatrizCono(r, h);
    return {
      previos: [it('generatriz', 'Generatriz', c.generatriz, `\\sqrt{${n(r)}^2 + ${n(h)}^2}`, g, 'lineal')],
      resultados: [
        it('areaLateral', 'Área lateral', c.areaLateral, `${piTex} \\cdot ${n(r)} \\cdot ${n(g)}`, areaLateralCono(r, g, pi), 'area', true),
        it('areaTotal', 'Área total', c.areaTotal, `${piTex} \\cdot ${n(r)} \\cdot (${n(r)} + ${n(g)})`, areaTotalCono(r, g, pi), 'area', true),
        it('volumen', 'Volumen', c.volumen, `\\dfrac{${piTex} \\cdot ${n(r)}^2 \\cdot ${n(h)}}{3}`, volumenCono(r, h, pi), 'volumen', true),
      ],
    };
  }

  if (id === 'esfera') {
    const { r } = m;
    const c = redondo('esfera');
    return {
      previos: [],
      resultados: [
        it('areaTotal', 'Área de la superficie', c.areaTotal, `4 \\cdot ${piTex} \\cdot ${n(r)}^2`, areaEsfera(r, pi), 'area', true),
        it('volumen', 'Volumen', c.volumen, `\\dfrac{4}{3} \\cdot ${piTex} \\cdot ${n(r)}^3`, volumenEsfera(r, pi), 'volumen', true),
      ],
    };
  }

  throw new Error(`Cuerpo desconocido: ${id}`);
}

// ---------- Unidades ----------
// Tabla de equivalencias: se calcula con las funciones de conversión (no a mano)
const redondear = (x) => Math.round(x * 1e6) / 1e6;

export const EQUIVALENCIAS = [
  { id: 'm2-cm2', tipo: 'área', de: '1 m²', a: 'cm²', valor: convertirArea(1, 'm', 'cm') },
  { id: 'm2-dm2', tipo: 'área', de: '1 m²', a: 'dm²', valor: convertirArea(1, 'm', 'dm') },
  { id: 'dm2-cm2', tipo: 'área', de: '1 dm²', a: 'cm²', valor: convertirArea(1, 'dm', 'cm') },
  { id: 'm3-dm3', tipo: 'volumen', de: '1 m³', a: 'dm³', valor: convertirVolumen(1, 'm', 'dm') },
  { id: 'dm3-cm3', tipo: 'volumen', de: '1 dm³', a: 'cm³', valor: convertirVolumen(1, 'dm', 'cm') },
  { id: 'm3-cm3', tipo: 'volumen', de: '1 m³', a: 'cm³', valor: convertirVolumen(1, 'm', 'cm') },
  { id: 'dm3-l', tipo: 'capacidad', de: '1 dm³', a: 'litro', valor: dm3ALitros(1) },
];

// Cosas de la vida real para pasar de volumen a litros
export const EJEMPLOS_CAPACIDAD = [
  { id: 'caja', nombre: 'Caja de zapatillas', icono: '👟', dims: [30, 20, 12], unidad: 'cm' },
  { id: 'tanque', nombre: 'Tanque de agua', icono: '🚰', dims: [1, 1, 1.5], unidad: 'm' },
  { id: 'pileta', nombre: 'Pileta', icono: '🏊', dims: [4, 2, 1.2], unidad: 'm' },
];

export function capacidadEjemplo(ejemplo) {
  const [a, b, c] = ejemplo.dims;
  const volumen = redondear(volumenOrtoedro(a, b, c)); // en unidad³
  const litros =
    ejemplo.unidad === 'cm' ? cm3ALitros(volumen) : ejemplo.unidad === 'dm' ? dm3ALitros(volumen) : m3ALitros(volumen);
  return { volumen, litros: redondear(litros), enDm3: redondear(convertirVolumen(volumen, ejemplo.unidad, 'dm')) };
}

// ---------- 3 pirámides = 1 prisma ----------
// Misma base (cuadrada de lado 6 cm) y misma altura (9 cm)
export const DEMO_PIRAMIDES = (() => {
  const lado = 6;
  const altura = 9;
  const areaBase = areaCuadrado(lado);
  return {
    lado,
    altura,
    areaBase,
    volumenPrisma: volumenPrisma(areaBase, altura),
    volumenPiramide: volumenPiramide(areaBase, altura),
  };
})();
