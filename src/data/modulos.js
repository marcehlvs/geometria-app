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
    descripcion: 'Tipos, complementarios, suplementarios y paralelas cortadas por una transversal.' },
  { id: 'triangulos', grupo: 'plana', icono: '🔺', titulo: 'Triángulos', anios: [1, 2],
    descripcion: 'Clasificación, suma de ángulos y desigualdad triangular.' },
  { id: 'cuadrilateros', grupo: 'plana', icono: '⬛', titulo: 'Cuadriláteros', anios: [1, 2],
    descripcion: 'Árbol de clasificación y propiedades.' },
  { id: 'circulo', grupo: 'plana', icono: '⭕', titulo: 'Círculo y polígonos regulares', anios: [1, 2],
    descripcion: 'π, longitud, área, ángulos y diagonales.' },
  { id: 'perimetro-area', grupo: 'plana', icono: '📐', titulo: 'Perímetro y área', anios: [1, 2],
    descripcion: 'Deslizadores y cálculo paso a paso.' },
  { id: 'pitagoras', grupo: 'plana', icono: '📎', titulo: 'Teorema de Pitágoras', anios: [2],
    descripcion: 'Demostración visual y problemas con triángulos rectángulos.' },

  // ----- Cuerpos -----
  { id: 'cuerpos', grupo: 'cuerpos', icono: '🧊', titulo: 'Cuerpos y sus elementos', anios: [1, 2],
    descripcion: 'Poliedros y cuerpos redondos: caras, aristas y vértices.' },
  { id: 'desarrollo', grupo: 'cuerpos', icono: '📦', titulo: 'Desarrollo plano interactivo', anios: [1, 2],
    descripcion: 'Plegá y desplegá cuerpos con un deslizador.' },
  { id: 'arma-cubo', grupo: 'cuerpos', icono: '🎲', titulo: '¿Arma un cubo?', anios: [1],
    descripcion: 'Juego: ¿este desarrollo se pliega en un cubo?' },
  { id: 'euler', grupo: 'cuerpos', icono: '🔢', titulo: 'Fórmula de Euler', anios: [2],
    descripcion: 'C + V = A + 2: contá, comprobá y predecí.' },
  { id: 'areas-volumenes', grupo: 'cuerpos', icono: '🧮', titulo: 'Áreas y volúmenes', anios: [2],
    descripcion: 'Área lateral, total, volumen y unidades.' },

  // ----- Práctica y consulta -----
  { id: 'formulario', grupo: 'practica', icono: '📖', titulo: 'Formulario', anios: [1, 2],
    descripcion: 'Todas las fórmulas, con buscador y mini calculadora.' },
  { id: 'problemas', grupo: 'practica', icono: '🧩', titulo: 'Problemas', anios: [1, 2],
    descripcion: 'Problemas con valores al azar, pistas y resolución paso a paso.' },
  { id: 'evaluacion', grupo: 'practica', icono: '📝', titulo: 'Modo evaluación', anios: [1, 2],
    descripcion: 'Dos ejercicios completos, sin pistas, con puntaje.' },

  // ----- Prueba de componentes (se quita en el Paso 16) -----
  { id: 'demo', grupo: 'practica', icono: '🧪', titulo: 'Prueba de componentes', anios: [1, 2],
    descripcion: 'Paso 3: Slider, Quiz, NumInput, StepNav y fórmulas en acción.' },
];

export const modulosPorAnio = (anio) =>
  anio ? MODULOS.filter((m) => m.anios.includes(anio)) : MODULOS;
