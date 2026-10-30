// Desarrollos del cubo (Paso 10): todas las figuras de 6 cuadrados unidos por
// un lado (hexaminós) y cuáles de ellas se pliegan en un cubo.
//
// En vez de copiar a mano «los 11 desarrollos», la app:
//   1. genera los 35 hexaminós distintos (sin contar giros ni espejos),
//   2. decide si arman un cubo «rodando» un cubo sobre la figura: si cada
//      cuadrado toca una cara distinta, se pliega; si dos cuadrados tocan la
//      misma cara, se superponen y falta una cara,
//   3. y los tests verifican que den exactamente 11.
//
// Una celda es [columna, fila]; la fila crece hacia abajo (igual que el SVG).

import { crearAleatorio } from '../utils/rand.js';

// ---------- Geometría de celdas ----------
export function normalizar(celdas) {
  const minX = Math.min(...celdas.map((c) => c[0]));
  const minY = Math.min(...celdas.map((c) => c[1]));
  return celdas.map(([x, y]) => [x - minX, y - minY]).sort((a, b) => a[1] - b[1] || a[0] - b[0]);
}

const clave = (celdas) => normalizar(celdas).map((c) => c.join(',')).join(';');

// Las 8 simetrías del cuadrado: k = 0..3 giros de 90°, k = 4..7 lo mismo con espejo.
export function transformar(celdas, k) {
  return normalizar(
    celdas.map(([x, y]) => {
      let a = k >= 4 ? -x : x;
      let b = y;
      for (let i = 0; i < k % 4; i++) [a, b] = [-b, a];
      return [a, b];
    })
  );
}

const canonica = (celdas) =>
  Array.from({ length: 8 }, (_, k) => clave(transformar(celdas, k)))
    .sort()[0];

const VECINOS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

// Todos los poliominós de n cuadrados, sin repetir por giros ni espejos.
export function generarPoliominos(n) {
  let actuales = new Map([[canonica([[0, 0]]), [[0, 0]]]]);
  for (let tam = 1; tam < n; tam++) {
    const siguientes = new Map();
    actuales.forEach((celdas) => {
      const ocupadas = new Set(celdas.map((c) => c.join(',')));
      celdas.forEach(([x, y]) => {
        VECINOS.forEach(([dx, dy]) => {
          const nueva = [x + dx, y + dy];
          if (ocupadas.has(nueva.join(','))) return;
          const mas = normalizar([...celdas, nueva]);
          const k = canonica(mas);
          if (!siguientes.has(k)) siguientes.set(k, mas);
        });
      });
    });
    actuales = siguientes;
  }
  return [...actuales.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1)).map(([, celdas]) => celdas);
}

// ---------- Recorrido de la figura (árbol de cuadrados vecinos) ----------
// Parte de la celda 0 y va a los vecinos. `padre[i]` es la celda de la que se
// llega a la celda i y `dir[i]` la dirección en que se llega ('E','O','S','N').
const DIRECCIONES = { E: [1, 0], O: [-1, 0], S: [0, 1], N: [0, -1] };

function recorrer(celdas) {
  const indice = new Map(celdas.map((c, i) => [c.join(','), i]));
  const padre = Array(celdas.length).fill(null);
  const dir = Array(celdas.length).fill(null);
  const visto = new Set([0]);
  const cola = [0];
  while (cola.length) {
    const i = cola.shift();
    Object.entries(DIRECCIONES).forEach(([d, [dx, dy]]) => {
      const j = indice.get(`${celdas[i][0] + dx},${celdas[i][1] + dy}`);
      if (j === undefined || visto.has(j)) return;
      visto.add(j);
      padre[j] = i;
      dir[j] = d;
      cola.push(j);
    });
  }
  return { padre, dir };
}

// ---------- ¿Arma un cubo? (rodar un cubo sobre la figura) ----------
// Estado del cubo: qué cara (0 a 5) está arriba U, abajo D, norte N, sur S,
// este E y oeste O. La cara que queda abajo es la que «pisa» la celda.
const RODAR = {
  E: (c) => ({ ...c, D: c.E, E: c.U, U: c.O, O: c.D }),
  O: (c) => ({ ...c, D: c.O, O: c.U, U: c.E, E: c.D }),
  S: (c) => ({ ...c, D: c.S, S: c.U, U: c.N, N: c.D }),
  N: (c) => ({ ...c, D: c.N, N: c.U, U: c.S, S: c.D }),
};

// Devuelve { valido, caraPorCelda, repetidas, faltan }
//   caraPorCelda[i]  cara del cubo (0 a 5) sobre la que cae la celda i
//   repetidas        grupos de celdas que caen sobre la MISMA cara (se superponen)
//   faltan           caras del cubo que ningún cuadrado cubre
export function analizarPlegado(celdas) {
  const { padre, dir } = recorrer(celdas);
  const estado = Array(celdas.length).fill(null);
  estado[0] = { U: 0, D: 1, N: 2, S: 3, E: 4, O: 5 };
  // el recorrido es en anchura: cada celda se procesa después de su padre
  const orden = [0];
  for (let h = 0; h < orden.length; h++) {
    celdas.forEach((_, j) => {
      if (padre[j] === orden[h]) {
        estado[j] = RODAR[dir[j]](estado[orden[h]]);
        orden.push(j);
      }
    });
  }
  const caraPorCelda = estado.map((e) => e.D);
  const grupos = {};
  caraPorCelda.forEach((f, i) => (grupos[f] ||= []).push(i));
  const repetidas = Object.values(grupos).filter((g) => g.length > 1);
  const faltan = 6 - Object.keys(grupos).length;
  return { valido: faltan === 0, caraPorCelda, repetidas, faltan };
}

// ---------- Desarrollo para dibujar con Net3D ----------
// Cada cuadrado es una cara de lado 1 que cuelga de su vecino y gira 90° al plegar.
// El `grupo` es la cara del cubo donde cae: los cuadrados que se superponen
// quedan del mismo color cuando se colorea.
export function desarrolloDeCeldas(celdas, caraPorCelda = analizarPlegado(celdas).caraPorCelda) {
  const { padre } = recorrer(celdas);
  const caras = celdas.map(([x, y], i) => {
    const poly = [
      [x, y],
      [x + 1, y],
      [x + 1, y + 1],
      [x, y + 1],
    ];
    let bisagra = null;
    if (padre[i] !== null) {
      const [px, py] = celdas[padre[i]];
      if (px === x - 1) bisagra = [[x, y], [x, y + 1]];
      else if (px === x + 1) bisagra = [[x + 1, y], [x + 1, y + 1]];
      else if (py === y - 1) bisagra = [[x, y], [x + 1, y]];
      else bisagra = [[x, y + 1], [x + 1, y + 1]];
    }
    return {
      id: `c${i}`,
      grupo: `cara-${caraPorCelda[i]}`,
      poly,
      padre: padre[i] === null ? null : `c${padre[i]}`,
      bisagra,
      giro: padre[i] === null ? 0 : 90,
      area: 1,
    };
  });
  return { id: 'cubo', caras };
}

// Figura lista para usar: celdas + análisis + desarrollo
export function armarDesarrollo(celdas) {
  const analisis = analizarPlegado(celdas);
  return { celdas, ...analisis, desarrollo: desarrolloDeCeldas(celdas, analisis.caraPorCelda) };
}

// ---------- Catálogo ----------
// Familias de los 11 desarrollos, según cuántos cuadrados hay por fila.
function familia(celdas) {
  const cuentas = (idx) => {
    const m = {};
    celdas.forEach((c) => (m[c[idx]] = (m[c[idx]] || 0) + 1));
    return Object.keys(m)
      .sort((a, b) => a - b)
      .map((k) => m[k])
      .join('-');
  };
  for (const s of [cuentas(1), cuentas(0)]) {
    if (s === '1-4-1') return '1-4-1';
    if (s === '2-3-1' || s === '1-3-2') return '2-3-1';
    if (s === '2-2-2') return '2-2-2';
    if (s === '3-3') return '3-3';
  }
  return null;
}

export const FAMILIAS = [
  { id: '1-4-1', titulo: 'Fila de 4 con uno arriba y uno abajo' },
  { id: '2-3-1', titulo: 'Filas de 2, 3 y 1' },
  { id: '2-2-2', titulo: 'Escalera de 2, 2 y 2' },
  { id: '3-3', titulo: 'Dos filas de 3 desplazadas' },
];

export const HEXAMINOS = generarPoliominos(6).map((celdas, k) => ({
  id: `h${k + 1}`,
  celdas,
  ...analizarPlegado(celdas),
}));
export const VALIDOS = HEXAMINOS.filter((h) => h.valido).map((h) => ({ ...h, familia: familia(h.celdas) }));
export const INVALIDOS = HEXAMINOS.filter((h) => !h.valido);

// La cruz clásica (el ejemplo del primer paso)
export const CRUZ = armarDesarrollo(normalizar([[1, 0], [0, 1], [1, 1], [2, 1], [3, 1], [1, 2]]));

// Ronda de juego: `cantidad` figuras, mitad válidas y mitad no, mezcladas y con
// giro/espejo al azar. Con la misma semilla sale siempre la misma ronda.
export function elegirRonda(semilla, cantidad = 6) {
  const azar = crearAleatorio(semilla);
  const mitad = Math.floor(cantidad / 2);
  const elegidas = [
    ...azar.shuffle(VALIDOS).slice(0, cantidad - mitad),
    ...azar.shuffle(INVALIDOS).slice(0, mitad),
  ];
  return azar.shuffle(elegidas).map((h) => ({
    id: h.id,
    ...armarDesarrollo(transformar(h.celdas, azar.int(0, 7))),
  }));
}
