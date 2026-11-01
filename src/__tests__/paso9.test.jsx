import { describe, it, expect } from 'vitest';
import { POLIEDROS } from '../data/cuerpos.js';
import {
  DESARROLLABLES,
  construirDesarrollo,
  areaTotalDesarrollo,
  plegarVertices,
  medidasDeCara,
  carasRepresentativas,
} from '../data/nets.js';
import { areaTotalCubo, areaTotalOrtoedro } from '../utils/geometry.js';

const cerca = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]) < 1e-6;

describe('Desarrollos planos (data/nets.js)', () => {
  it.each(DESARROLLABLES.map((d) => d.id))('%s: cantidad de caras = C y las bisagras son bordes compartidos', (id) => {
    const net = construirDesarrollo(id, { a: 2, b: 3, h: 5 });
    expect(net.caras.length).toBe(POLIEDROS.find((p) => p.id === id).C);

    const porId = Object.fromEntries(net.caras.map((c) => [c.id, c]));
    net.caras
      .filter((c) => c.padre)
      .forEach((c) => {
        const padre = porId[c.padre];
        c.bisagra.forEach((punto) => {
          expect(c.poly.some((q) => cerca(q, punto))).toBe(true);
          expect(padre.poly.some((q) => cerca(q, punto))).toBe(true);
        });
      });
    // una sola cara fija
    expect(net.caras.filter((c) => !c.padre).length).toBe(1);
  });

  it.each(DESARROLLABLES.map((d) => d.id))('%s: al plegar del todo, los vértices coinciden (V del cuerpo)', (id) => {
    const net = construirDesarrollo(id, { a: 2, b: 3, h: 5 });
    const plegado = plegarVertices(net, 1);
    const unicos = [];
    Object.values(plegado)
      .flat()
      .forEach((p) => {
        if (!unicos.some((q) => Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]) < 1e-6)) unicos.push(p);
      });
    expect(unicos.length).toBe(POLIEDROS.find((p) => p.id === id).V);
  });

  it('con t = 0 todo queda en el plano (z = 0)', () => {
    const net = construirDesarrollo('prisma-hexagonal', { a: 2, h: 3 });
    Object.values(plegarVertices(net, 0))
      .flat()
      .forEach((p) => expect(Math.abs(p[2])).toBeLessThan(1e-9));
  });

  it('el área total del desarrollo coincide con las fórmulas', () => {
    expect(areaTotalDesarrollo(construirDesarrollo('cubo', { a: 3 }))).toBeCloseTo(areaTotalCubo(3), 9);
    expect(areaTotalDesarrollo(construirDesarrollo('ortoedro', { a: 1, b: 2, h: 3 }))).toBeCloseTo(areaTotalOrtoedro(1, 2, 3), 9);
    // prisma triangular: 3 rectángulos a·h + 2 triángulos equiláteros
    expect(areaTotalDesarrollo(construirDesarrollo('prisma-triangular', { a: 2, h: 3 }))).toBeCloseTo(18 + 2 * Math.sqrt(3), 9);
    // pirámide cuadrada: base a² + 4 triángulos de base a y altura √(h² + (a/2)²)
    const l = Math.sqrt(25 + 1);
    expect(areaTotalDesarrollo(construirDesarrollo('piramide-cuadrada', { a: 2, h: 5 }))).toBeCloseTo(4 + 4 * l, 9);
  });
});

describe('Medidas para rotular el desarrollo', () => {
  it('un cuadrado da un solo lado y un rectángulo da dos', () => {
    const cubo = construirDesarrollo('cubo', { a: 3 });
    expect(medidasDeCara(cubo.caras[0]).map((m) => m.largo)).toEqual([3]);
    const caja = construirDesarrollo('ortoedro', { a: 2, b: 3, h: 5 });
    const lateral = caja.caras.find((c) => c.id === 'lateral-0');
    expect(medidasDeCara(lateral).map((m) => m.largo).sort()).toEqual([2, 5]);
  });

  it('el triángulo lateral de una pirámide cuadrada da base y lado oblicuo', () => {
    const net = construirDesarrollo('piramide-cuadrada', { a: 4, h: 3 });
    const lateral = net.caras.find((c) => c.id === 'lateral-0');
    const largos = medidasDeCara(lateral).map((m) => m.largo);
    expect(largos).toHaveLength(2);
    expect(largos[0]).toBeCloseTo(4);
    // arista lateral: √(h² + (a/√2)²) = √(9 + 8)
    expect(largos[1]).toBeCloseTo(Math.sqrt(17));
  });

  it('hay una cara representativa por cada grupo de caras iguales', () => {
    const cubo = construirDesarrollo('cubo', { a: 3 });
    expect(carasRepresentativas(cubo)).toHaveLength(2); // laterales y bases
    const caja = construirDesarrollo('ortoedro', { a: 2, b: 3, h: 5 });
    expect(carasRepresentativas(caja)).toHaveLength(3); // 2 tipos de lateral + base
    const piramide = construirDesarrollo('piramide-cuadrada', { a: 4, h: 3 });
    expect(carasRepresentativas(piramide)).toHaveLength(2); // base y laterales
  });
});
