// Catálogo de módulos de la app (lo que se ve en el menú).
// Un módulo está "disponible" cuando su id existe en src/modules/index.js.
// Para sumar uno nuevo: agregarlo acá y registrar su componente allá.

export const GRUPOS = [
  { id: 'plana', titulo: 'Figuras planas', icono: '🔷' },
  { id: 'cuerpos', titulo: 'Cuerpos geométricos', icono: '🧊' },
  { id: 'practica', titulo: 'Práctica y consulta', icono: '🎯' },
];

export const MODULOS = [
  // ----- Figuras planas -----
  { id: 'angulos', grupo: 'plana', icono: '📏', titulo: 'Ángulos', anios: [1],
    descripcion: 'Tipos, pares de ángulos y paralelas.' },
  { id: 'triangulos', grupo: 'plana', icono: '🔺', titulo: 'Triángulos', anios: [1, 2],
    descripcion: 'Clasificación y suma de ángulos.' },
  { id: 'cuadrilateros', grupo: 'plana', icono: '⬛', titulo: 'Cuadriláteros', anios: [1, 2],
    descripcion: 'Clasificación y propiedades.' },
  { id: 'circulo', grupo: 'plana', icono: '⭕', titulo: 'Círculo y polígonos regulares', anios: [1, 2],
    descripcion: 'π, longitud y área.' },
  { id: 'perimetro-area', grupo: 'plana', icono: '📐', titulo: 'Perímetro y área', anios: [1, 2],
    descripcion: 'Cálculo paso a paso.' },
  { id: 'pitagoras', grupo: 'plana', icono: '📎', titulo: 'Teorema de Pitágoras', anios: [2],
    descripcion: 'Demostración visual y problemas.' },

  // ----- Cuerpos -----
  { id: 'cuerpos', grupo: 'cuerpos', icono: '🧊', titulo: 'Cuerpos y sus elementos', anios: [1, 2],
    descripcion: 'Caras, aristas y vértices.' },
  { id: 'desarrollo', grupo: 'cuerpos', icono: '📦', titulo: 'Desarrollo plano interactivo', anios: [1, 2],
    descripcion: 'Plegá y desplegá cuerpos.' },
  { id: 'arma-cubo', grupo: 'cuerpos', icono: '🎲', titulo: '¿Arma un cubo?', anios: [1],
    descripcion: 'Juego: ¿se pliega en un cubo?' },
  { id: 'euler', grupo: 'cuerpos', icono: '🔢', titulo: 'Fórmula de Euler', anios: [2],
    descripcion: 'C + V = A + 2: contá y predecí.' },
  { id: 'areas-volumenes', grupo: 'cuerpos', icono: '🧮', titulo: 'Áreas y volúmenes', anios: [2],
    descripcion: 'Áreas, volumen y unidades.' },

  // ----- Práctica y consulta -----
  { id: 'formulario', grupo: 'practica', icono: '📖', titulo: 'Formulario', anios: [1, 2],
    descripcion: 'Todas las fórmulas, con buscador.' },
  { id: 'problemas', grupo: 'practica', icono: '🧩', titulo: 'Problemas', anios: [1, 2],
    descripcion: 'Con pistas y resolución paso a paso.' },
  { id: 'evaluacion', grupo: 'practica', icono: '📝', titulo: 'Modo evaluación', anios: [1, 2],
    descripcion: 'Dos ejercicios, sin pistas, con puntaje.' },

];

export const modulosPorAnio = (anio) =>
  anio ? MODULOS.filter((m) => m.anios.includes(anio)) : MODULOS;
