// Formato de números para mostrar en pantalla (coma decimal, es-AR)
// y lectura de lo que escribe el estudiante (acepta coma o punto).

// 3.14159 -> "3,14"   |  1234.5 -> "1.234,5"
export function fmt(n, decimales = 2) {
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  return Number(n).toLocaleString('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimales,
  });
}

// Número con unidad: fmtU(12.5, 'cm²') -> "12,5 cm²"
export function fmtU(n, unidad, decimales = 2) {
  return `${fmt(n, decimales)} ${unidad}`;
}

// Igual que fmt pero con un número fijo de decimales: fmtFijo(3, 2) -> "3,00"
export function fmtFijo(n, decimales = 2) {
  return Number(n).toLocaleString('es-AR', {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  });
}

// Para KaTeX: el número con coma decimal y sin separador de miles.
// texNum(3.5) -> "3{,}5"   (las llaves evitan el espacio que KaTeX pone tras la coma)
export function texNum(n, decimales = 2) {
  const s = Number(n).toLocaleString('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimales,
    useGrouping: false,
  });
  return s.replace(',', '{,}');
}

// "3,5" -> 3.5   |  "3.5" -> 3.5   |  "abc" -> NaN
// Si hay punto Y coma ("1.234,5") se interpreta el punto como separador de miles.
export function parseNum(texto) {
  if (typeof texto === 'number') return texto;
  let s = String(texto).trim().replace(/\s/g, '');
  if (s.includes(',') && s.includes('.')) s = s.replace(/\./g, '');
  s = s.replace(',', '.');
  if (s === '' || !/^-?\d*\.?\d+$/.test(s)) return NaN;
  return parseFloat(s);
}

// ¿La respuesta está dentro de la tolerancia? (por defecto 1 % o 0,01)
export function casiIgual(respuesta, correcto, tolerancia = 0.01) {
  if (Number.isNaN(respuesta) || Number.isNaN(correcto)) return false;
  const margen = Math.max(Math.abs(correcto) * tolerancia, 0.01);
  return Math.abs(respuesta - correcto) <= margen;
}
