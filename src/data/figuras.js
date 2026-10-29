// Fuente única de datos de las figuras planas.
// De acá salen: el Formulario, las tarjetas, las calculadoras y los problemas.
// `anios`: en qué años se muestra (1 = primer año, 2 = segundo año).
// Las fórmulas están en LaTeX (para KaTeX). La barra invertida se escribe doble en JS.

export const FIGURAS = [
  {
    id: 'triangulo',
    nombre: 'Triángulo',
    anios: [1, 2],
    perimetro: 'P = a + b + c',
    area: 'A = \\dfrac{b \\cdot h}{2}',
    variables: { b: 'base', h: 'altura' },
    propiedades: [
      'La suma de los ángulos interiores es 180°.',
      'Cada lado es menor que la suma de los otros dos (desigualdad triangular).',
      'Al mayor lado se opone el mayor ángulo.',
      'Isósceles: dos lados y dos ángulos iguales. Equilátero: tres lados y tres ángulos de 60°.',
    ],
  },
  {
    id: 'cuadrado',
    nombre: 'Cuadrado',
    anios: [1, 2],
    perimetro: 'P = 4 \\cdot l',
    area: 'A = l^2',
    variables: { l: 'lado' },
    propiedades: [
      'Cuatro lados iguales y cuatro ángulos rectos.',
      'Las diagonales son iguales, perpendiculares y se cortan en su punto medio.',
      'Tiene 4 ejes de simetría.',
    ],
  },
  {
    id: 'rectangulo',
    nombre: 'Rectángulo',
    anios: [1, 2],
    perimetro: 'P = 2 \\cdot (b + h)',
    area: 'A = b \\cdot h',
    variables: { b: 'base', h: 'altura' },
    propiedades: [
      'Lados opuestos iguales y cuatro ángulos rectos.',
      'Las diagonales son iguales y se cortan en su punto medio.',
      'Tiene 2 ejes de simetría.',
    ],
  },
  {
    id: 'paralelogramo',
    nombre: 'Paralelogramo',
    anios: [1, 2],
    perimetro: 'P = 2 \\cdot (a + b)',
    area: 'A = b \\cdot h',
    variables: { b: 'base', h: 'altura (perpendicular a la base)' },
    propiedades: [
      'Lados opuestos paralelos e iguales.',
      'Ángulos opuestos iguales y ángulos consecutivos suplementarios (suman 180°).',
      'Las diagonales se cortan en su punto medio.',
    ],
  },
  {
    id: 'rombo',
    nombre: 'Rombo',
    anios: [1, 2],
    perimetro: 'P = 4 \\cdot l',
    area: 'A = \\dfrac{D \\cdot d}{2}',
    variables: { l: 'lado', D: 'diagonal mayor', d: 'diagonal menor' },
    propiedades: [
      'Cuatro lados iguales.',
      'Las diagonales son perpendiculares y se cortan en su punto medio.',
      'Las diagonales son bisectrices de los ángulos.',
    ],
  },
  {
    id: 'trapecio',
    nombre: 'Trapecio',
    anios: [1, 2],
    perimetro: 'P = B + b + c + d',
    area: 'A = \\dfrac{(B + b) \\cdot h}{2}',
    variables: { B: 'base mayor', b: 'base menor', h: 'altura' },
    propiedades: [
      'Tiene un par de lados paralelos (las bases).',
      'Isósceles: lados no paralelos iguales. Rectángulo: tiene dos ángulos rectos.',
      'Los ángulos que apoyan sobre un mismo lado no paralelo son suplementarios.',
    ],
  },
  {
    id: 'circulo',
    nombre: 'Círculo',
    anios: [1, 2],
    perimetro: 'L = 2 \\cdot \\pi \\cdot r',
    area: 'A = \\pi \\cdot r^2',
    variables: { r: 'radio' },
    propiedades: [
      'El diámetro mide el doble del radio: d = 2 · r.',
      'La longitud dividida por el diámetro da siempre π ≈ 3,14.',
      'Todo diámetro es un eje de simetría.',
    ],
  },
  {
    id: 'poligono-regular',
    nombre: 'Polígono regular',
    anios: [1, 2],
    perimetro: 'P = n \\cdot l',
    area: 'A = \\dfrac{P \\cdot a_p}{2}',
    variables: { n: 'cantidad de lados', l: 'lado', a_p: 'apotema' },
    propiedades: [
      'Todos los lados y todos los ángulos son iguales.',
      'Ángulo interior: (n − 2) · 180° / n.   Ángulo central: 360° / n.',
      'Cantidad de diagonales: n · (n − 3) / 2.',
      'Tiene n ejes de simetría.',
    ],
  },
];

// Teorema de Pitágoras (se muestra solo en 2.º año)
export const PITAGORAS = {
  id: 'pitagoras',
  nombre: 'Teorema de Pitágoras',
  anios: [2],
  formula: 'a^2 + b^2 = c^2',
  hipotenusa: 'c = \\sqrt{a^2 + b^2}',
  cateto: 'a = \\sqrt{c^2 - b^2}',
  ternas: [
    [3, 4, 5],
    [5, 12, 13],
    [8, 15, 17],
    [7, 24, 25],
    [6, 8, 10],
  ],
  propiedades: [
    'Vale solo en triángulos rectángulos.',
    'La hipotenusa es el lado opuesto al ángulo recto y es el mayor.',
    'Si a² + b² = c², el triángulo es rectángulo (recíproco).',
  ],
};

// Jerarquía de cuadriláteros: cada uno "es un caso particular de" su padre.
export const CUADRILATEROS_ARBOL = {
  cuadrilatero: { nombre: 'Cuadrilátero', padre: null },
  trapecio: { nombre: 'Trapecio', padre: 'cuadrilatero' },
  paralelogramo: { nombre: 'Paralelogramo', padre: 'trapecio' },
  rectangulo: { nombre: 'Rectángulo', padre: 'paralelogramo' },
  rombo: { nombre: 'Rombo', padre: 'paralelogramo' },
  cuadrado: { nombre: 'Cuadrado', padre: 'rectangulo' }, // también es rombo
};

export const figurasPorAnio = (anio) =>
  anio ? FIGURAS.filter((f) => f.anios.includes(anio)) : FIGURAS;
