// Desarrollos planos de prismas y pirámides, modelados como un ÁRBOL de caras
// unidas por charnelas (bisagras). Todas las coordenadas están en el plano del
// desarrollo (x hacia la derecha, y hacia abajo), en la unidad de las medidas.
//
// Cada cara: { id, grupo, poly, padre, bisagra, giro, area }
//   poly     vértices en el desarrollo plano
//   padre    id de la cara de la que "cuelga" (null = cara fija)
//   bisagra  [[x1,y1],[x2,y2]]: borde compartido con el padre
//   giro     cuántos grados hay que girar la cara, respecto de su padre,
//            para que el cuerpo quede armado
//
// `ejeBisagra` y `plegarVertices` usan la MISMA convención que el dibujo en
// CSS 3D (z positivo = hacia quien mira), así los tests comprueban que los
// desarrollos realmente cierran.

export const DESARROLLABLES = [
  { id: 'cubo', familia: 'prisma', params: ['a'], etiquetas: { a: 'Arista' } },
  { id: 'ortoedro', familia: 'prisma', params: ['a', 'b', 'h'], etiquetas: { a: 'Largo', b: 'Ancho', h: 'Alto' } },
  { id: 'prisma-triangular', familia: 'prisma', n: 3, params: ['a', 'h'], etiquetas: { a: 'Lado de la base', h: 'Altura' } },
  { id: 'prisma-pentagonal', familia: 'prisma', n: 5, params: ['a', 'h'], etiquetas: { a: 'Lado de la base', h: 'Altura' } },
  { id: 'prisma-hexagonal', familia: 'prisma', n: 6, params: ['a', 'h'], etiquetas: { a: 'Lado de la base', h: 'Altura' } },
  { id: 'tetraedro', familia: 'piramide', n: 3, params: ['a', 'h'], etiquetas: { a: 'Lado de la base', h: 'Altura' } },
  { id: 'piramide-cuadrada', familia: 'piramide', n: 4, params: ['a', 'h'], etiquetas: { a: 'Lado de la base', h: 'Altura' } },
  { id: 'piramide-pentagonal', familia: 'piramide', n: 5, params: ['a', 'h'], etiquetas: { a: 'Lado de la base', h: 'Altura' } },
];

export const MEDIDAS_INICIALES = { a: 3, b: 4, h: 4 };

// ---------- Geometría 2D ----------
export function areaPoligono(poly) {
  let s = 0;
  poly.forEach(([x1, y1], k) => {
    const [x2, y2] = poly[(k + 1) % poly.length];
    s += x1 * y2 - x2 * y1;
  });
  return Math.abs(s) / 2;
}

// Polígono regular de lado s con su primer lado sobre y = 0 (de (0,0) a (s,0))
// y el resto hacia abajo (y > 0).
function regularBajoLado(n, s) {
  const R = s / (2 * Math.sin(Math.PI / n));
  const ap = s / (2 * Math.tan(Math.PI / n));
  return Array.from({ length: n }, (_, k) => {
    const t = -Math.PI / 2 - Math.PI / n + (2 * Math.PI * k) / n;
    return [s / 2 + R * Math.cos(t), ap + R * Math.sin(t)];
  });
}

const rectangulo = (w, d) => [[0, 0], [w, 0], [w, d], [0, d]];
const aGrados = (rad) => (rad * 180) / Math.PI;

// ---------- Construcción del desarrollo ----------
export function construirDesarrollo(id, medidas) {
  const def = DESARROLLABLES.find((d) => d.id === id);
  if (!def) return null;
  const { a, b, h } = { ...MEDIDAS_INICIALES, ...medidas };
  const caras = [];

  if (def.familia === 'prisma') {
    const esCaja = id === 'cubo' || id === 'ortoedro';
    const alto = id === 'cubo' ? a : h;
    const ancho = id === 'cubo' ? a : b;
    const lados = esCaja ? [a, ancho, a, ancho] : Array(def.n).fill(a);
    const giro = esCaja ? 90 : 360 / def.n;
    const poligonoBase = esCaja ? rectangulo(a, ancho) : regularBajoLado(def.n, a);

    let x = 0;
    lados.forEach((w, k) => {
      const x1 = x + w;
      caras.push({
        id: `lateral-${k}`,
        grupo: `lateral-${w.toFixed(3)}`,
        poly: [[x, 0], [x1, 0], [x1, alto], [x, alto]],
        padre: k === 0 ? null : `lateral-${k - 1}`,
        bisagra: k === 0 ? null : [[x, 0], [x, alto]],
        giro: k === 0 ? 0 : giro,
      });
      x = x1;
    });

    caras.push({
      id: 'base-inferior',
      grupo: 'base',
      poly: poligonoBase.map(([px, py]) => [px, py + alto]),
      padre: 'lateral-0',
      bisagra: [[0, alto], [lados[0], alto]],
      giro: 90,
    });
    caras.push({
      id: 'base-superior',
      grupo: 'base',
      poly: poligonoBase.map(([px, py]) => [px, -py]),
      padre: 'lateral-0',
      bisagra: [[0, 0], [lados[0], 0]],
      giro: 90,
    });
  } else {
    const n = def.n;
    const base = regularBajoLado(n, a);
    const ap = a / (2 * Math.tan(Math.PI / n));
    const centro = [a / 2, ap];
    const apotemaLateral = Math.sqrt(h * h + ap * ap);
    const diedro = aGrados(Math.atan2(h, ap)); // ángulo interior base–cara lateral

    caras.push({ id: 'base', grupo: 'base', poly: base, padre: null, bisagra: null, giro: 0 });
    base.forEach((p, k) => {
      const q = base[(k + 1) % n];
      const medio = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
      let nx = medio[0] - centro[0];
      let ny = medio[1] - centro[1];
      const largo = Math.hypot(nx, ny);
      nx /= largo;
      ny /= largo;
      caras.push({
        id: `lateral-${k}`,
        grupo: 'lateral',
        poly: [p, q, [medio[0] + nx * apotemaLateral, medio[1] + ny * apotemaLateral]],
        padre: 'base',
        bisagra: [p, q],
        giro: 180 - diedro,
      });
    });
  }

  caras.forEach((c) => {
    c.area = areaPoligono(c.poly);
  });
  return { id, caras };
}

// Resumen por grupo de caras iguales: [{ grupo, cantidad, area, subtotal }]
export function resumenAreas(desarrollo) {
  const mapa = new Map();
  desarrollo.caras.forEach((c) => {
    const previo = mapa.get(c.grupo) || { grupo: c.grupo, cantidad: 0, area: c.area, subtotal: 0 };
    previo.cantidad += 1;
    previo.subtotal += c.area;
    mapa.set(c.grupo, previo);
  });
  return [...mapa.values()];
}

export const areaTotalDesarrollo = (desarrollo) => desarrollo.caras.reduce((s, c) => s + c.area, 0);

export function cuadroDelimitador(poly) {
  const xs = poly.map((p) => p[0]);
  const ys = poly.map((p) => p[1]);
  return { minX: Math.min(...xs), minY: Math.min(...ys), maxX: Math.max(...xs), maxY: Math.max(...ys) };
}

// Eje de giro de una cara: punto de la bisagra y dirección unitaria elegida
// para que un giro POSITIVO levante la cara hacia quien mira (z > 0).
export function ejeBisagra(cara) {
  const [[x1, y1], [x2, y2]] = cara.bisagra;
  const largo = Math.hypot(x2 - x1, y2 - y1);
  let dx = (x2 - x1) / largo;
  let dy = (y2 - y1) / largo;
  const cx = cara.poly.reduce((s, p) => s + p[0], 0) / cara.poly.length;
  const cy = cara.poly.reduce((s, p) => s + p[1], 0) / cara.poly.length;
  const rx = cx - x1;
  const ry = cy - y1;
  if (dx * ry - dy * rx < 0) {
    dx = -dx;
    dy = -dy;
  }
  return { origen: [x1, y1], dir: [dx, dy] };
}

function rotarAlrededor(punto, origen, dir, grados) {
  const th = (grados * Math.PI) / 180;
  const c = Math.cos(th);
  const s = Math.sin(th);
  const v = [punto[0] - origen[0], punto[1] - origen[1], punto[2]];
  const d = [dir[0], dir[1], 0];
  const cruz = [d[1] * v[2] - d[2] * v[1], d[2] * v[0] - d[0] * v[2], d[0] * v[1] - d[1] * v[0]];
  const punto_d = d[0] * v[0] + d[1] * v[1] + d[2] * v[2];
  const r = [0, 1, 2].map((i) => v[i] * c + cruz[i] * s + d[i] * punto_d * (1 - c));
  return [origen[0] + r[0], origen[1] + r[1], r[2]];
}

// Posición 3D de cada vértice de cada cara cuando el plegado vale t (0 a 1).
// Devuelve { [idCara]: [[x,y,z], ...] }
export function plegarVertices(desarrollo, t = 1) {
  const porId = Object.fromEntries(desarrollo.caras.map((c) => [c.id, c]));
  const resultado = {};
  desarrollo.caras.forEach((cara) => {
    resultado[cara.id] = cara.poly.map(([x, y]) => {
      let p = [x, y, 0];
      let actual = cara;
      while (actual && actual.bisagra) {
        const { origen, dir } = ejeBisagra(actual);
        p = rotarAlrededor(p, origen, dir, actual.giro * t);
        actual = porId[actual.padre];
      }
      return p;
    });
  });
  return resultado;
}
