// Desarrollo plano del cilindro y del cono, que se pliega hasta formar el cuerpo.
//
//   const { poligonos, lineas } = desarrolloRedondo('cilindro', { r: 2, h: 4 }, 0.5)
//
// t = 0: desarrollo plano apoyado en el piso (plano y = 0); t = 1: cuerpo armado.
// Eje x a la derecha, y hacia arriba, z hacia quien mira (el «piso» es el plano xz).
// Los puntos están en las mismas unidades que r y h (cm).
//
// Cilindro (se arma recostado, con el eje a lo largo de z):
//   · etapa 1 (t de 0 a 0,7): el rectángulo de 2πr × h se enrolla alrededor de un eje
//     paralelo a z, en un arco de radio R = L / α (α crece de 0 a 2π; en α = 2π es el cilindro);
//   · etapa 2 (t de 0,7 a 1): los dos círculos giran 90° sobre su punto de unión y tapan los extremos.
// Cono (apoya sobre su base, con el vértice hacia arriba):
//   · etapa 1: el sector circular se curva: la semiapertura ε baja de 90° (plano) a asin(r/g);
//     el borde queda en el piso y el vértice sube hasta la altura del cono;
//   · etapa 2: el círculo de la base gira 180° sobre su punto de unión y se apoya adentro del borde.
// En todo momento la superficie lateral conserva su área (es desarrollable: no se estira).

const LADOS_TIRA = 72;
const LADOS_CIRCULO = 48;
export const CORTE = 0.7; // t en el que termina el enrollado y empiezan a girar las tapas

const limitar = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const etapas = (t) => ({ u: limitar(t / CORTE), v: limitar((t - CORTE) / (1 - CORTE)) });

// sen(a)/a y (1 - cos a)/a sin dividir por cero cuando a ≈ 0
const sinc = (a) => (Math.abs(a) < 1e-4 ? 1 - (a * a) / 6 : Math.sin(a) / a);
const unoMenosCosSobre = (a) => (Math.abs(a) < 1e-4 ? a / 2 : (1 - Math.cos(a)) / a);

// Circunferencia plana de radio r centrada en (cx, 0, cz): puntos [x, 0, z]
const circuloPlano = (r, cx, cz) =>
  Array.from({ length: LADOS_CIRCULO }, (_, k) => {
    const a = (2 * Math.PI * k) / LADOS_CIRCULO;
    return [cx + r * Math.cos(a), 0, cz + r * Math.sin(a)];
  });

// Gira un punto alrededor de un eje paralelo a x que pasa por (y0, z0) en el plano yz
function girarSobreX([x, y, z], y0, z0, ang) {
  const dy = y - y0;
  const dz = z - z0;
  return [x, y0 + dy * Math.cos(ang) - dz * Math.sin(ang), z0 + dy * Math.sin(ang) + dz * Math.cos(ang)];
}

export function desarrolloRedondo(id, { r, h }, t) {
  const { u, v } = etapas(t);

  if (id === 'cilindro') {
    const L = 2 * Math.PI * r;
    const alfa = 2 * Math.PI * u; // ángulo total que abarca el rectángulo enrollado
    // posición del punto del borde que está a «s» del centro del rectángulo
    const punto = (s, z) => {
      const a = alfa === 0 ? 0 : (alfa * s) / L;
      return [s * sinc(a), s * unoMenosCosSobre(a), z];
    };
    const poligonos = [];
    for (let i = 0; i < LADOS_TIRA; i++) {
      const s0 = -L / 2 + (L * i) / LADOS_TIRA;
      const s1 = -L / 2 + (L * (i + 1)) / LADOS_TIRA;
      poligonos.push({ pts: [punto(s0, 0), punto(s1, 0), punto(s1, h), punto(s0, h)], rol: 'curva' });
    }
    // tapas: círculos planos que giran sobre el punto (0, 0, 0) y (0, 0, h)
    const beta = (Math.PI / 2) * v;
    const cercana = circuloPlano(r, 0, -r).map((p) => girarSobreX(p, 0, 0, beta));
    const lejana = circuloPlano(r, 0, h + r).map((p) => girarSobreX(p, 0, h, -beta));
    poligonos.push({ pts: cercana, rol: 'tapa' }, { pts: lejana, rol: 'tapa' });

    // bordes del rectángulo (para dibujar el contorno)
    const borde = (z) => Array.from({ length: LADOS_TIRA + 1 }, (_, i) => punto(-L / 2 + (L * i) / LADOS_TIRA, z));
    const lineas = [
      { pts: borde(0), rol: 'contorno' },
      { pts: borde(h), rol: 'contorno' },
      { pts: [punto(-L / 2, 0), punto(-L / 2, h)], rol: 'contorno' },
      { pts: [punto(L / 2, 0), punto(L / 2, h)], rol: 'contorno' },
    ];
    return { poligonos, lineas };
  }

  if (id === 'cono') {
    const g = Math.hypot(r, h);
    const sector = (2 * Math.PI * r) / g; // ángulo del sector en el desarrollo plano
    const epsFinal = Math.asin(r / g);
    const eps = Math.PI / 2 + (epsFinal - Math.PI / 2) * u; // semiapertura
    const seno = Math.sin(eps);
    // punto del borde con ángulo plano s medido desde +z (hacia quien mira)
    const borde = (s) => {
      const fi = s / seno;
      return [g * seno * Math.sin(fi), 0, g * seno * Math.cos(fi)];
    };
    const apice = [0, g * Math.cos(eps), 0];
    const poligonos = [];
    for (let i = 0; i < LADOS_TIRA; i++) {
      const s0 = -sector / 2 + (sector * i) / LADOS_TIRA;
      const s1 = -sector / 2 + (sector * (i + 1)) / LADOS_TIRA;
      poligonos.push({ pts: [apice, borde(s0), borde(s1)], rol: 'curva' });
    }
    // base: círculo tangente al sector; después gira 180° sobre el punto de unión (por debajo del piso)
    const union = [0, 0, g * seno];
    const base = circuloPlano(r, 0, g * seno + r).map((p) => girarSobreX(p, 0, union[2], Math.PI * v));
    poligonos.push({ pts: base, rol: 'tapa' });

    const arco = Array.from({ length: LADOS_TIRA + 1 }, (_, i) => borde(-sector / 2 + (sector * i) / LADOS_TIRA));
    const lineas = [
      { pts: arco, rol: 'contorno' },
      { pts: [apice, borde(-sector / 2)], rol: 'contorno' },
      { pts: [apice, borde(sector / 2)], rol: 'contorno' },
    ];
    return { poligonos, lineas };
  }

  throw new Error(`Cuerpo redondo desconocido: ${id}`);
}

// Esfera que encierra todos los puntos: { centro, radio }. Sirve para encuadrar la figura
// (no depende de cómo se gire la vista, así que el dibujo no «salta» al rotarlo).
export function esferaDeEncuadre(poligonos) {
  const pts = poligonos.flatMap((p) => p.pts);
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  pts.forEach((p) =>
    p.forEach((c, i) => {
      min[i] = Math.min(min[i], c);
      max[i] = Math.max(max[i], c);
    })
  );
  const centro = min.map((m, i) => (m + max[i]) / 2);
  const radio = Math.max(...pts.map((p) => Math.hypot(p[0] - centro[0], p[1] - centro[1], p[2] - centro[2])), 1e-6);
  return { centro, radio };
}

// Área de un polígono 3D plano (para comprobar que el plegado no estira la superficie)
export function areaPoligono3D(pts) {
  let sx = 0;
  let sy = 0;
  let sz = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1, z1] = pts[i];
    const [x2, y2, z2] = pts[(i + 1) % pts.length];
    sx += y1 * z2 - z1 * y2;
    sy += z1 * x2 - x1 * z2;
    sz += x1 * y2 - y1 * x2;
  }
  return Math.hypot(sx, sy, sz) / 2;
}
