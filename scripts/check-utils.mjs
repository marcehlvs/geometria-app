// Verifica las fórmulas y los datos sin abrir el navegador:  npm run test:utils
import assert from 'node:assert/strict';
import katex from 'katex';
import * as g from '../src/utils/geometry.js';
import * as f from '../src/utils/format.js';
import { crearAleatorio } from '../src/utils/rand.js';
import { POLIEDROS, REGULARES, REDONDOS, FORMULAS_POLIEDROS, EULER, CONTRAEJEMPLO_EULER } from '../src/data/cuerpos.js';
import { FIGURAS, PITAGORAS } from '../src/data/figuras.js';

let ok = 0;
const t = (nombre, fn) => { fn(); ok++; console.log('  ✓', nombre); };
const cerca = (a, b, e = 1e-9) => assert.ok(Math.abs(a - b) < e, `${a} ≠ ${b}`);

console.log('geometry.js');
t('complemento y suplemento', () => { assert.equal(g.complemento(30), 60); assert.equal(g.suplemento(30), 150); });
t('clasificar ángulos', () => {
  assert.equal(g.clasificarAngulo(45), 'agudo'); assert.equal(g.clasificarAngulo(90), 'recto');
  assert.equal(g.clasificarAngulo(120), 'obtuso'); assert.equal(g.clasificarAngulo(180), 'llano');
});
t('polígonos regulares', () => {
  assert.equal(g.sumaAngulosInteriores(5), 540); assert.equal(g.anguloInteriorRegular(6), 120);
  assert.equal(g.anguloCentralRegular(8), 45); assert.equal(g.cantidadDiagonales(6), 9);
});
t('desigualdad triangular', () => {
  assert.equal(g.existeTriangulo(3, 4, 5), true); assert.equal(g.existeTriangulo(3, 4, 9), false);
  assert.equal(g.existeTriangulo(1, 2, 3), false);
});
t('clasificar triángulos', () => {
  assert.equal(g.clasificarTrianguloPorLados(3, 3, 3), 'equilátero');
  assert.equal(g.clasificarTrianguloPorLados(3, 3, 4), 'isósceles');
  assert.equal(g.clasificarTrianguloPorLados(3, 4, 5), 'escaleno');
  assert.equal(g.clasificarTrianguloPorAngulos(90, 45, 45), 'rectángulo');
  assert.equal(g.clasificarTrianguloPorAngulos(100, 40, 40), 'obtusángulo');
  assert.equal(g.clasificarTrianguloPorAngulos(60, 60, 60), 'acutángulo');
});
t('Pitágoras', () => {
  assert.equal(g.hipotenusa(3, 4), 5); assert.equal(g.cateto(5, 3), 4);
  assert.equal(g.esTrianguloRectangulo(5, 3, 4), true); assert.equal(g.esTrianguloRectangulo(4, 5, 6), false);
  PITAGORAS.ternas.forEach(([a, b, c]) => assert.equal(g.esTernaPitagorica(a, b, c), true));
});
t('áreas planas', () => {
  assert.equal(g.areaTriangulo(6, 4), 12); assert.equal(g.areaRombo(10, 6), 30);
  assert.equal(g.areaTrapecio(8, 4, 5), 30); assert.equal(g.perimetroRectangulo(7, 3), 20);
});
t('círculo (π exacto y π = 3,14)', () => {
  cerca(g.areaCirculo(1), Math.PI); cerca(g.areaCirculo(10, 3.14), 314);
  cerca(g.longitudCircunferencia(5, 3.14), 31.4);
});
t('cuerpos: volúmenes y áreas', () => {
  assert.equal(g.volumenCubo(3), 27); assert.equal(g.areaTotalCubo(3), 54);
  assert.equal(g.volumenOrtoedro(2, 3, 4), 24); assert.equal(g.areaTotalOrtoedro(2, 3, 4), 52);
  assert.equal(g.volumenPiramide(9, 4), 12); assert.equal(g.volumenPrisma(9, 4), 36);
  cerca(g.volumenCilindro(2, 5, 3.14), 62.8); cerca(g.areaTotalCilindro(1, 1, 3.14), 12.56);
  assert.equal(g.generatrizCono(3, 4), 5); cerca(g.volumenCono(3, 4, 3.14), 37.68);
  cerca(g.areaLateralCono(3, 5, 3.14), 47.1); cerca(g.areaEsfera(1, 3.14), 12.56);
  cerca(g.volumenEsfera(3), 36 * Math.PI);
  assert.equal(g.anguloSectorCono(3, 5), 216);
});
t('Euler: hallar lo que falta', () => {
  assert.equal(g.euler.aristas(6, 8), 12); assert.equal(g.euler.caras(12, 8), 6);
  assert.equal(g.euler.vertices(6, 12), 8); assert.equal(g.euler.cumple(5, 5, 8), true);
  assert.equal(g.euler.cumple(5, 8, 6), false);
});
t('conversión de unidades', () => {
  assert.equal(g.convertirLongitud(250, 'cm', 'm'), 2.5);
  assert.equal(g.convertirArea(1, 'm', 'cm'), 10000);
  assert.equal(g.convertirVolumen(1, 'm', 'dm'), 1000);
  assert.equal(g.cm3ALitros(2500), 2.5); assert.equal(g.m3ALitros(2), 2000);
  assert.equal(g.convertirArea(50000, 'cm', 'm'), 5); assert.equal(g.convertirVolumen(3000, 'cm', 'dm'), 3);
  assert.equal(g.convertirLongitud(2, 'km', 'm'), 2000);
});

console.log('format.js');
t('parseNum acepta coma y punto', () => {
  assert.equal(f.parseNum('3,5'), 3.5); assert.equal(f.parseNum('3.5'), 3.5);
  assert.equal(f.parseNum('1.234,5'), 1234.5); assert.ok(Number.isNaN(f.parseNum('abc')));
  assert.ok(Number.isNaN(f.parseNum('')));
});
t('fmt usa coma decimal', () => {
  assert.equal(f.fmt(3.5), '3,5'); assert.equal(f.fmtU(12.5, 'cm²'), '12,5 cm²');
  assert.equal(f.fmtFijo(3, 2), '3,00'); assert.equal(f.texNum(3.5), '3{,}5');
});
t('casiIgual con tolerancia', () => {
  assert.equal(f.casiIgual(31.4, 31.42), true); assert.equal(f.casiIgual(35, 31.4), false);
});

console.log('rand.js');
t('misma semilla, misma secuencia', () => {
  const a = crearAleatorio(1234), b = crearAleatorio(1234);
  for (let i = 0; i < 5; i++) assert.equal(a.int(1, 100), b.int(1, 100));
});
t('int respeta el rango', () => {
  const r = crearAleatorio(7);
  for (let i = 0; i < 500; i++) { const n = r.int(3, 6); assert.ok(n >= 3 && n <= 6); }
});

console.log('datos');
t('todos los poliedros cumplen Euler', () => {
  POLIEDROS.forEach((p) => assert.equal(g.euler.cumple(p.C, p.V, p.A), true, p.nombre));
});
t('el contraejemplo NO cumple Euler (da 0)', () => {
  const c = CONTRAEJEMPLO_EULER; assert.equal(c.C + c.V - c.A, 0);
});
t('5 poliedros regulares', () => assert.equal(REGULARES.length, 5));
t('figuras con perímetro y área', () => FIGURAS.forEach((x) => assert.ok(x.perimetro && x.area, x.id)));
t('ids únicos', () => {
  const ids = POLIEDROS.map((p) => p.id); assert.equal(new Set(ids).size, ids.length);
});

t('todas las fórmulas LaTeX se renderizan en KaTeX', () => {
  const tex = [];
  FIGURAS.forEach((x) => tex.push(x.perimetro, x.area));
  tex.push(PITAGORAS.formula, PITAGORAS.hipotenusa, PITAGORAS.cateto, EULER.tex);
  REDONDOS.forEach((c) => ['generatriz', 'areaLateral', 'areaTotal', 'volumen'].forEach((k) => c[k] && tex.push(c[k])));
  Object.values(FORMULAS_POLIEDROS).forEach((fam) => Object.values(fam).forEach((x) => tex.push(x)));
  tex.forEach((s) => katex.renderToString(s, { throwOnError: true }));
  console.log(`    (${tex.length} fórmulas revisadas)`);
});

console.log(`\n${ok} pruebas OK ✅`);
