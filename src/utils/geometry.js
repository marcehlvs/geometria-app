// Fórmulas de geometría: funciones PURAS (reciben números, devuelven números).
// Toda la app usa estas funciones; si una fórmula está mal, se corrige acá y listo.
// Las que usan π reciben `pi` como parámetro (por defecto Math.PI) para poder
// alternar entre 3,14 y π exacto desde la app.

export const PI_ESCOLAR = 3.14;

// ---------- Ángulos ----------
export const complemento = (a) => 90 - a;
export const suplemento = (a) => 180 - a;

export function clasificarAngulo(a) {
  if (a <= 0 || a >= 360) return 'nulo o completo';
  if (a < 90) return 'agudo';
  if (a === 90) return 'recto';
  if (a < 180) return 'obtuso';
  if (a === 180) return 'llano';
  return 'cóncavo';
}

// ---------- Polígonos ----------
export const sumaAngulosInteriores = (n) => (n - 2) * 180;
export const anguloInteriorRegular = (n) => ((n - 2) * 180) / n;
export const anguloCentralRegular = (n) => 360 / n;
export const anguloExteriorRegular = (n) => 360 / n;
export const cantidadDiagonales = (n) => (n * (n - 3)) / 2;
// Un polígono regular se puede descomponer en n triángulos iguales
export const areaPoligonoRegular = (perimetro, apotema) => (perimetro * apotema) / 2;

// ---------- Triángulos ----------
export const sumaAngulosTriangulo = 180;
export const areaTriangulo = (base, altura) => (base * altura) / 2;
export const perimetroTriangulo = (a, b, c) => a + b + c;

// Desigualdad triangular: cada lado debe ser menor que la suma de los otros dos
export function existeTriangulo(a, b, c) {
  return a > 0 && b > 0 && c > 0 && a < b + c && b < a + c && c < a + b;
}

export function clasificarTrianguloPorLados(a, b, c, tol = 1e-9) {
  const ab = Math.abs(a - b) < tol;
  const bc = Math.abs(b - c) < tol;
  const ac = Math.abs(a - c) < tol;
  if (ab && bc) return 'equilátero';
  if (ab || bc || ac) return 'isósceles';
  return 'escaleno';
}

// Recibe los tres ángulos en grados
export function clasificarTrianguloPorAngulos(x, y, z, tol = 1e-9) {
  const mayor = Math.max(x, y, z);
  if (Math.abs(mayor - 90) < tol) return 'rectángulo';
  return mayor > 90 ? 'obtusángulo' : 'acutángulo';
}

// ---------- Pitágoras ----------
export const hipotenusa = (a, b) => Math.sqrt(a * a + b * b);
// Cateto que falta, dados la hipotenusa y el otro cateto
export const cateto = (hipo, otro) => Math.sqrt(hipo * hipo - otro * otro);
export const esTernaPitagorica = (a, b, c) => a * a + b * b === c * c;
// ¿Un triángulo de lados a, b, c es rectángulo? (el lado mayor es la hipotenusa)
export function esTrianguloRectangulo(a, b, c) {
  const [x, y, z] = [a, b, c].sort((m, n) => m - n);
  return Math.abs(x * x + y * y - z * z) < 1e-9;
}

// ---------- Cuadriláteros ----------
export const perimetroRectangulo = (largo, ancho) => 2 * (largo + ancho);
export const areaRectangulo = (largo, ancho) => largo * ancho;
export const perimetroCuadrado = (lado) => 4 * lado;
export const areaCuadrado = (lado) => lado * lado;
export const areaParalelogramo = (base, altura) => base * altura;
export const areaRombo = (diagonalMayor, diagonalMenor) => (diagonalMayor * diagonalMenor) / 2;
export const areaTrapecio = (baseMayor, baseMenor, altura) => ((baseMayor + baseMenor) * altura) / 2;

// ---------- Círculo ----------
export const longitudCircunferencia = (r, pi = Math.PI) => 2 * pi * r;
export const areaCirculo = (r, pi = Math.PI) => pi * r * r;
export const diametro = (r) => 2 * r;
export const radio = (d) => d / 2;
// Sector circular (lo usa el desarrollo plano del cono)
export const anguloSectorCono = (r, g) => (360 * r) / g;

// ---------- Cuerpos: prismas ----------
export const areaLateralPrisma = (perimetroBase, altura) => perimetroBase * altura;
export const areaTotalPrisma = (areaLateral, areaBase) => areaLateral + 2 * areaBase;
export const volumenPrisma = (areaBase, altura) => areaBase * altura;

// Caso particular: ortoedro (caja)
export const areaTotalOrtoedro = (a, b, c) => 2 * (a * b + a * c + b * c);
export const volumenOrtoedro = (a, b, c) => a * b * c;
// Cubo
export const areaTotalCubo = (arista) => 6 * arista * arista;
export const volumenCubo = (arista) => arista ** 3;

// ---------- Cuerpos: pirámides ----------
export const areaTotalPiramide = (areaLateral, areaBase) => areaLateral + areaBase;
export const volumenPiramide = (areaBase, altura) => (areaBase * altura) / 3;

// ---------- Cuerpos redondos ----------
export const areaLateralCilindro = (r, h, pi = Math.PI) => 2 * pi * r * h;
export const areaTotalCilindro = (r, h, pi = Math.PI) => 2 * pi * r * (r + h);
export const volumenCilindro = (r, h, pi = Math.PI) => pi * r * r * h;

export const generatrizCono = (r, h) => Math.sqrt(r * r + h * h);
export const areaLateralCono = (r, g, pi = Math.PI) => pi * r * g;
export const areaTotalCono = (r, g, pi = Math.PI) => pi * r * (r + g);
export const volumenCono = (r, h, pi = Math.PI) => (pi * r * r * h) / 3;

export const areaEsfera = (r, pi = Math.PI) => 4 * pi * r * r;
export const volumenEsfera = (r, pi = Math.PI) => (4 / 3) * pi * r ** 3;

// ---------- Fórmula de Euler:  C + V = A + 2 ----------
export const euler = {
  // Dadas dos magnitudes, hallar la que falta
  aristas: (caras, vertices) => caras + vertices - 2,
  caras: (aristas, vertices) => aristas + 2 - vertices,
  vertices: (caras, aristas) => aristas + 2 - caras,
  cumple: (caras, vertices, aristas) => caras + vertices === aristas + 2,
};

// ---------- Unidades ----------
// Cada unidad de longitud es una potencia de 10 respecto del metro.
// Usamos exponentes ENTEROS (en vez de 0,1 · 0,01…) para evitar errores de
// redondeo: 0,1³ da 0,0010000000000000002 en la computadora, 10³ da 1000 exacto.
const EXP_LONGITUD = { km: 3, m: 0, dm: -1, cm: -2, mm: -3 };

// Multiplica por 10^n (si n es negativo, divide por 10^-n: más exacto)
const por10 = (valor, n) => (n >= 0 ? valor * 10 ** n : valor / 10 ** -n);

// Convierte longitudes: convertirLongitud(250, 'cm', 'm') -> 2.5
export const convertirLongitud = (valor, de, a) => por10(valor, EXP_LONGITUD[de] - EXP_LONGITUD[a]);
// Áreas: el exponente se duplica.  convertirArea(1, 'm', 'cm') -> 10000
export const convertirArea = (valor, de, a) => por10(valor, 2 * (EXP_LONGITUD[de] - EXP_LONGITUD[a]));
// Volúmenes: el exponente se triplica.  convertirVolumen(1, 'm', 'dm') -> 1000
export const convertirVolumen = (valor, de, a) => por10(valor, 3 * (EXP_LONGITUD[de] - EXP_LONGITUD[a]));
// 1 dm³ = 1 litro
export const dm3ALitros = (dm3) => dm3;
export const cm3ALitros = (cm3) => cm3 / 1000;
export const m3ALitros = (m3) => m3 * 1000;
