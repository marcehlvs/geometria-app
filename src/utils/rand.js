// Generador de números aleatorios con semilla (mulberry32).
// Con la misma semilla siempre devuelve la misma secuencia:
// sirve para que un problema se pueda reproducir ("problema #4821").

export function crearAleatorio(semilla = Date.now()) {
  let a = semilla >>> 0;

  // Devuelve un float en [0, 1)
  const float = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  // Entero entre min y max, ambos incluidos
  const int = (min, max) => Math.floor(float() * (max - min + 1)) + min;

  // Elige un elemento de un array
  const pick = (arr) => arr[int(0, arr.length - 1)];

  // Mezcla un array (devuelve una copia)
  const shuffle = (arr) => {
    const copia = [...arr];
    for (let i = copia.length - 1; i > 0; i--) {
      const j = int(0, i);
      [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia;
  };

  return { float, int, pick, shuffle };
}

// Semilla nueva de 4 dígitos para mostrar como "Problema #1234"
export const nuevaSemilla = () => Math.floor(Math.random() * 9000) + 1000;
