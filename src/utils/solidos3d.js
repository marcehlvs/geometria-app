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
