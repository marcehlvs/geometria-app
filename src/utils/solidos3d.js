// Geometría 3D mínima para dibujar poliedros en SVG (sin librerías).
// Los vértices, caras y aristas se GENERAN acá, y los tests comprueban que
// coincidan con los números de data/cuerpos.js (C, V y A).

// Prismas y pirámides: n = cantidad de lados de la base.
const CONFIG = {
  cubo: { tipo: 'prisma', n: 4, alto: Math.SQRT2 },
  ortoedro: { tipo: 'prisma', n: 4, alto: 1, ancho: 1.5 },
  'prisma-triangular': { tipo: 'prisma', n: 3, alto: 1.6 },
  'prisma-pentagonal': { tipo: 'prisma', n: 5, alto: 1.6 },
  'prisma-hexagonal': { tipo: 'prisma', n: 6, alto: 1.6 },
  tetraedro: { tipo: 'piramide', n: 3, alto: 1.8 },
  'piramide-cuadrada': { tipo: 'piramide', n: 4, alto: 1.8 },
  'piramide-pentagonal': { tipo: 'piramide', n: 5, alto: 1.8 },
  'piramide-hexagonal': { tipo: 'piramide', n: 6, alto: 1.8 },
};

export const IDS_DIBUJABLES = Object.keys(CONFIG);

// Devuelve { vertices: [[x,y,z]], caras: [{ idx: [..], rol: 'base' | 'lateral' }], aristas: [[i, j]] }
export function construirPoliedro(id) {
  const cfg = CONFIG[id];
  if (!cfg) return null;
  const { n, alto, ancho = 1 } = cfg;
  const desfase = n === 4 ? Math.PI / 4 : Math.PI / 2;
  const anillo = (y) =>
    Array.from({ length: n }, (_, k) => {
      const t = desfase + (2 * Math.PI * k) / n;
      return [Math.cos(t) * ancho, y, Math.sin(t)];
    });

  const vertices = [...anillo(-alto / 2)];
  const caras = [{ idx: Array.from({ length: n }, (_, k) => k), rol: 'base' }];

  if (cfg.tipo === 'prisma') {
    vertices.push(...anillo(alto / 2));
    caras.push({ idx: Array.from({ length: n }, (_, k) => k + n), rol: 'base' });
    for (let k = 0; k < n; k++) {
      const s = (k + 1) % n;
      caras.push({ idx: [k, s, s + n, k + n], rol: 'lateral' });
    }
  } else {
    vertices.push([0, alto / 2, 0]);
    for (let k = 0; k < n; k++) caras.push({ idx: [k, (k + 1) % n, n], rol: 'lateral' });
  }

  const vistas = new Set();
  const aristas = [];
  caras.forEach(({ idx }) =>
    idx.forEach((a, k) => {
      const b = idx[(k + 1) % idx.length];
      const clave = a < b ? `${a}-${b}` : `${b}-${a}`;
      if (!vistas.has(clave)) {
        vistas.add(clave);
        aristas.push([Math.min(a, b), Math.max(a, b)]);
      }
    })
  );

  return { vertices, caras, aristas };
}

// Gira (alrededor del eje vertical) e inclina la vista hacia arriba.
// Devuelve los puntos con z positivo hacia quien mira.
export function rotar(vertices, giroGrados, inclinacionGrados = 25) {
  const g = (giroGrados * Math.PI) / 180;
  const p = (inclinacionGrados * Math.PI) / 180;
  return vertices.map(([x, y, z]) => {
    const x1 = x * Math.cos(g) + z * Math.sin(g);
    const z1 = -x * Math.sin(g) + z * Math.cos(g);
    return [x1, y * Math.cos(p) - z1 * Math.sin(p), y * Math.sin(p) + z1 * Math.cos(p)];
  });
}

// ¿La cara mira hacia quien observa? (el cuerpo está centrado en el origen)
export function caraVisible(puntos) {
  const [a, b, c] = puntos;
  const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
  const n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
  const centro = puntos.reduce((s, q) => [s[0] + q[0], s[1] + q[1], s[2] + q[2]], [0, 0, 0]).map((s) => s / puntos.length);
  const haciaAfuera = n[0] * centro[0] + n[1] * centro[1] + n[2] * centro[2] >= 0 ? 1 : -1;
  return n[2] * haciaAfuera > 0;
}

// ---------------------------------------------------------------------------
// Cuerpos redondos (cilindro, cono y esfera) como mallas de caras planas.
// Tienen el mismo formato que construirPoliedro: { vertices, caras, aristas }.
// `aristas` son solo los bordes «de verdad» (las circunferencias de las bases
// y el ecuador de la esfera); el contorno que se ve al girar se calcula al
// dibujar (una arista es contorno si una sola de sus caras mira hacia adelante).
// ---------------------------------------------------------------------------
const LADOS = 48; // lados de las circunferencias
export const IDS_REDONDOS_3D = ['cilindro', 'cono', 'esfera'];

const anillo = (y, radio = 1) =>
  Array.from({ length: LADOS }, (_, k) => {
    const t = (2 * Math.PI * k) / LADOS;
    return [Math.cos(t) * radio, y, Math.sin(t) * radio];
  });
const indices = (desde, cantidad = LADOS) => Array.from({ length: cantidad }, (_, k) => desde + k);
const paresDelAnillo = (desde, cantidad = LADOS) => indices(desde, cantidad).map((a, k) => [a, desde + ((k + 1) % cantidad)]);

export function construirRedondo(id) {
  if (id === 'cilindro') {
    const m = 0.85; // mitad de la altura
    const vertices = [...anillo(-m), ...anillo(m)];
    const caras = [{ idx: indices(0), rol: 'base' }, { idx: indices(LADOS), rol: 'base' }];
    for (let k = 0; k < LADOS; k++) {
      const s = (k + 1) % LADOS;
      caras.push({ idx: [k, s, LADOS + s, LADOS + k], rol: 'curva' });
    }
    return { vertices, caras, aristas: [...paresDelAnillo(0), ...paresDelAnillo(LADOS)], apice: null, radio: null };
  }

  if (id === 'cono') {
    const m = 1.15;
    const vertices = [...anillo(-m), [0, m, 0]];
    const caras = [{ idx: indices(0), rol: 'base' }];
    for (let k = 0; k < LADOS; k++) caras.push({ idx: [k, (k + 1) % LADOS, LADOS], rol: 'curva' });
    return { vertices, caras, aristas: paresDelAnillo(0), apice: LADOS, radio: null };
  }

  if (id === 'esfera') {
    const R = 1.25;
    const franjas = 12; // paralelos (par: así el ecuador cae justo sobre una fila de vértices)
    const vertices = [[0, R, 0]];
    for (let i = 1; i < franjas; i++) {
      const lat = Math.PI / 2 - (Math.PI * i) / franjas;
      vertices.push(...anillo(R * Math.sin(lat), R * Math.cos(lat)));
    }
    vertices.push([0, -R, 0]);
    const fila = (i) => 1 + (i - 1) * LADOS; // primer vértice de la fila i (1..franjas-1)
    const caras = [];
    for (let k = 0; k < LADOS; k++) caras.push({ idx: [0, fila(1) + ((k + 1) % LADOS), fila(1) + k], rol: 'curva' });
    for (let i = 1; i < franjas - 1; i++) {
      for (let k = 0; k < LADOS; k++) {
        const s = (k + 1) % LADOS;
        caras.push({ idx: [fila(i) + k, fila(i) + s, fila(i + 1) + s, fila(i + 1) + k], rol: 'curva' });
      }
    }
    const polo = vertices.length - 1;
    for (let k = 0; k < LADOS; k++) caras.push({ idx: [polo, fila(franjas - 1) + k, fila(franjas - 1) + ((k + 1) % LADOS)], rol: 'curva' });
    const ecuador = fila(franjas / 2);
    return { vertices, caras, aristas: paresDelAnillo(ecuador), apice: null, radio: { desde: [0, 0, 0], hasta: [R, 0, 0] } };
  }

  return null;
}

// Aristas de contorno: las que tienen exactamente UNA cara mirando hacia adelante.
// `visibles[k]` dice si la cara k se ve. Devuelve pares [a, b] de índices de vértices.
export function aristasDeContorno(caras, visibles) {
  const cuenta = new Map();
  caras.forEach(({ idx }, k) =>
    idx.forEach((a, i) => {
      const b = idx[(i + 1) % idx.length];
      const clave = a < b ? `${a}-${b}` : `${b}-${a}`;
      const e = cuenta.get(clave) || { par: [Math.min(a, b), Math.max(a, b)], visibles: 0, total: 0 };
      e.total++;
      if (visibles[k]) e.visibles++;
      cuenta.set(clave, e);
    })
  );
  return [...cuenta.values()].filter((e) => e.visibles === 1 && e.total >= 2).map((e) => e.par);
}

// Lleva un ángulo a [-180, 180)
export const normalizarGrado = (g) => ((((g + 180) % 360) + 360) % 360) - 180;
