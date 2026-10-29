// Fuente única de datos de los cuerpos geométricos.
// Para poliedros: C = caras, V = vértices, A = aristas (cumplen C + V = A + 2).
// `tipo`: 'prisma' | 'piramide' | 'regular' (poliedros regulares) | 'redondo'.

export const POLIEDROS = [
  // ----- Prismas -----
  { id: 'cubo', nombre: 'Cubo', tipo: 'prisma', C: 6, V: 8, A: 12, anios: [1, 2],
    detalle: '6 caras cuadradas iguales', regular: true },
  { id: 'ortoedro', nombre: 'Prisma rectangular (ortoedro)', tipo: 'prisma', C: 6, V: 8, A: 12, anios: [1, 2],
    detalle: '6 caras rectangulares' },
  { id: 'prisma-triangular', nombre: 'Prisma triangular', tipo: 'prisma', C: 5, V: 6, A: 9, anios: [1, 2],
    detalle: '2 bases triangulares y 3 caras laterales rectangulares' },
  { id: 'prisma-pentagonal', nombre: 'Prisma pentagonal', tipo: 'prisma', C: 7, V: 10, A: 15, anios: [1, 2],
    detalle: '2 bases pentagonales y 5 caras laterales rectangulares' },
  { id: 'prisma-hexagonal', nombre: 'Prisma hexagonal', tipo: 'prisma', C: 8, V: 12, A: 18, anios: [1, 2],
    detalle: '2 bases hexagonales y 6 caras laterales rectangulares' },

  // ----- Pirámides -----
  { id: 'tetraedro', nombre: 'Pirámide triangular (tetraedro)', tipo: 'piramide', C: 4, V: 4, A: 6, anios: [1, 2],
    detalle: 'base triangular y 3 caras laterales triangulares', regular: true },
  { id: 'piramide-cuadrada', nombre: 'Pirámide cuadrada', tipo: 'piramide', C: 5, V: 5, A: 8, anios: [1, 2],
    detalle: 'base cuadrada y 4 caras laterales triangulares' },
  { id: 'piramide-pentagonal', nombre: 'Pirámide pentagonal', tipo: 'piramide', C: 6, V: 6, A: 10, anios: [1, 2],
    detalle: 'base pentagonal y 5 caras laterales triangulares' },
  { id: 'piramide-hexagonal', nombre: 'Pirámide hexagonal', tipo: 'piramide', C: 7, V: 7, A: 12, anios: [1, 2],
    detalle: 'base hexagonal y 6 caras laterales triangulares' },

  // ----- Poliedros regulares que no son prisma ni pirámide -----
  { id: 'octaedro', nombre: 'Octaedro', tipo: 'regular', C: 8, V: 6, A: 12, anios: [2],
    detalle: '8 caras triangulares; en cada vértice concurren 4 caras', regular: true },
  { id: 'dodecaedro', nombre: 'Dodecaedro', tipo: 'regular', C: 12, V: 20, A: 30, anios: [2],
    detalle: '12 caras pentagonales; en cada vértice concurren 3 caras', regular: true },
  { id: 'icosaedro', nombre: 'Icosaedro', tipo: 'regular', C: 20, V: 12, A: 30, anios: [2],
    detalle: '20 caras triangulares; en cada vértice concurren 5 caras', regular: true },
];

// Los 5 poliedros regulares (sólidos platónicos)
export const REGULARES = [
  { id: 'tetraedro', nombre: 'Tetraedro', cara: 'triángulo equilátero', porVertice: 3 },
  { id: 'cubo', nombre: 'Cubo (hexaedro)', cara: 'cuadrado', porVertice: 3 },
  { id: 'octaedro', nombre: 'Octaedro', cara: 'triángulo equilátero', porVertice: 4 },
  { id: 'dodecaedro', nombre: 'Dodecaedro', cara: 'pentágono regular', porVertice: 3 },
  { id: 'icosaedro', nombre: 'Icosaedro', cara: 'triángulo equilátero', porVertice: 5 },
].map((r) => ({ ...POLIEDROS.find((p) => p.id === r.id), ...r }));

// Cuerpos redondos (no tienen vértices ni aristas "de poliedro": no vale Euler)
export const REDONDOS = [
  { id: 'cilindro', nombre: 'Cilindro', tipo: 'redondo', anios: [1, 2],
    detalle: '2 bases circulares y 1 superficie lateral curva',
    variables: { r: 'radio de la base', h: 'altura' },
    areaLateral: 'A_L = 2 \\cdot \\pi \\cdot r \\cdot h',
    areaTotal: 'A_T = 2 \\cdot \\pi \\cdot r \\cdot (r + h)',
    volumen: 'V = \\pi \\cdot r^2 \\cdot h',
    desarrollo: 'Un rectángulo (de largo 2·π·r y alto h) y dos círculos de radio r.' },
  { id: 'cono', nombre: 'Cono', tipo: 'redondo', anios: [1, 2],
    detalle: '1 base circular, 1 vértice y 1 superficie lateral curva',
    variables: { r: 'radio de la base', h: 'altura', g: 'generatriz' },
    generatriz: 'g = \\sqrt{r^2 + h^2}',
    areaLateral: 'A_L = \\pi \\cdot r \\cdot g',
    areaTotal: 'A_T = \\pi \\cdot r \\cdot (r + g)',
    volumen: 'V = \\dfrac{\\pi \\cdot r^2 \\cdot h}{3}',
    desarrollo: 'Un sector circular de radio g y un círculo de radio r.' },
  { id: 'esfera', nombre: 'Esfera', tipo: 'redondo', anios: [2],
    detalle: 'todos sus puntos están a la misma distancia (r) del centro',
    variables: { r: 'radio' },
    areaTotal: 'A = 4 \\cdot \\pi \\cdot r^2',
    volumen: 'V = \\dfrac{4}{3} \\cdot \\pi \\cdot r^3',
    desarrollo: 'No tiene desarrollo plano exacto (no se puede aplanar sin deformar).' },
];

// Fórmulas por familia de poliedros (en LaTeX)
export const FORMULAS_POLIEDROS = {
  prisma: {
    areaLateral: 'A_L = P_{base} \\cdot h',
    areaTotal: 'A_T = A_L + 2 \\cdot A_{base}',
    volumen: 'V = A_{base} \\cdot h',
  },
  piramide: {
    areaLateral: 'A_L = \\text{suma de las áreas de las caras laterales}',
    areaTotal: 'A_T = A_L + A_{base}',
    volumen: 'V = \\dfrac{A_{base} \\cdot h}{3}',
  },
  cubo: {
    areaTotal: 'A_T = 6 \\cdot a^2',
    volumen: 'V = a^3',
  },
  ortoedro: {
    areaTotal: 'A_T = 2 \\cdot (a \\cdot b + a \\cdot c + b \\cdot c)',
    volumen: 'V = a \\cdot b \\cdot c',
  },
};

// Fórmula de Euler
export const EULER = {
  tex: 'C + V = A + 2',
  nombres: { C: 'caras', V: 'vértices', A: 'aristas' },
};

// Curiosidad: un cuerpo con un agujero (toroide) NO cumple C + V = A + 2.
// Para esos cuerpos C + V − A = 0 (en vez de 2). Ejemplo clásico: "marco" de cuadro.
export const CONTRAEJEMPLO_EULER = {
  nombre: 'Marco con un agujero (toroide poliédrico)',
  C: 16, V: 16, A: 32, // 16 + 16 − 32 = 0
  detalle: 'Tiene un agujero que lo atraviesa, por eso no cumple Euler: C + V − A = 0.',
};

// Todos los cuerpos juntos (para galerías y tablas)
export const CUERPOS = [...POLIEDROS, ...REDONDOS];
export const cuerposPorAnio = (anio) =>
  anio ? CUERPOS.filter((c) => c.anios.includes(anio)) : CUERPOS;
