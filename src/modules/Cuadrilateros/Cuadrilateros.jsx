import { useState } from 'react';
import ModuloLayout from '../../components/ModuloLayout.jsx';
import StepNav from '../../components/StepNav.jsx';
import Quiz from '../../components/Quiz.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { CUADRILATEROS_ARBOL } from '../../data/figuras.js';

// Forma dibujada de cada cuadrilátero (viewBox 200 x 120) y sus propiedades.
// `propias` son las que se agregan respecto del padre; las heredadas se
// calculan recorriendo el árbol (CUADRILATEROS_ARBOL), una sola fuente de verdad.
const DETALLE = {
  cuadrilatero: {
    puntos: [[30, 95], [150, 105], [175, 35], [55, 20]],
    propias: ['Tiene 4 lados y 4 ángulos.', 'Sus ángulos interiores suman 360°.', 'Tiene 2 diagonales.'],
  },
  trapecio: {
    puntos: [[20, 100], [180, 100], [140, 25], [60, 25]],
    propias: ['Tiene al menos un par de lados paralelos (las bases).'],
  },
  paralelogramo: {
    puntos: [[20, 100], [135, 100], [180, 25], [65, 25]],
    propias: [
      'Sus dos pares de lados opuestos son paralelos e iguales.',
      'Sus ángulos opuestos son iguales.',
      'Sus diagonales se cortan en el punto medio.',
    ],
  },
  rectangulo: {
    puntos: [[25, 100], [175, 100], [175, 25], [25, 25]],
    propias: ['Tiene 4 ángulos rectos.', 'Sus diagonales son iguales.'],
  },
  rombo: {
    puntos: [[100, 110], [175, 60], [100, 10], [25, 60]],
    propias: [
      'Tiene 4 lados iguales.',
      'Sus diagonales son perpendiculares.',
      'Sus diagonales son bisectrices de los ángulos.',
    ],
  },
  cuadrado: {
    puntos: [[55, 105], [145, 105], [145, 15], [55, 15]],
    propias: ['Tiene 4 lados iguales y 4 ángulos rectos.', 'Sus diagonales son iguales y perpendiculares.'],
  },
};

// Lista de ancestros: cuadrado -> rectángulo -> paralelogramo -> trapecio -> cuadrilátero
const ancestros = (id) => {
  const lista = [];
  let actual = CUADRILATEROS_ARBOL[id]?.padre;
  while (actual) {
    lista.push(actual);
    actual = CUADRILATEROS_ARBOL[actual].padre;
  }
  return lista;
};

// El cuadrado también es rombo: hereda por dos caminos.
const EXTRA_HERENCIA = { cuadrado: ['rombo'] };

const heredadas = (id) => {
  const ids = new Set([...ancestros(id)]);
  (EXTRA_HERENCIA[id] || []).forEach((r) => {
    ids.add(r);
    ancestros(r).forEach((a) => ids.add(a));
  });
  return [...ids];
};

const ACERTIJOS = [
  {
    pistas: [
      'Tengo 4 lados.',
      'Mis dos pares de lados opuestos son paralelos.',
      'Mis 4 ángulos son rectos.',
      'Mis lados vecinos NO son todos iguales.',
    ],
    opciones: ['Rombo', 'Rectángulo', 'Cuadrado', 'Trapecio'],
    correcta: 1,
    explicacion: 'Ángulos rectos y lados vecinos distintos: es un rectángulo (si todos los lados fueran iguales sería un cuadrado).',
  },
  {
    pistas: [
      'Tengo 4 lados iguales.',
      'Mis diagonales se cruzan formando ángulos rectos.',
      'Mis ángulos NO son rectos.',
    ],
    opciones: ['Cuadrado', 'Rectángulo', 'Rombo', 'Paralelogramo'],
    correcta: 2,
    explicacion: 'Cuatro lados iguales y diagonales perpendiculares, sin ángulos rectos: es un rombo.',
  },
  {
    pistas: [
      'Tengo 4 lados.',
      'Tengo un par de lados paralelos.',
      'Mi otro par de lados NO es paralelo.',
    ],
    opciones: ['Paralelogramo', 'Rombo', 'Trapecio', 'Rectángulo'],
    correcta: 2,
    explicacion: 'Un solo par de lados paralelos (las bases): es un trapecio.',
  },
];

function Forma({ id, diagonales }) {
  const { puntos } = DETALLE[id];
  const pts = puntos.map((p) => p.join(',')).join(' ');
  return (
    <svg viewBox="0 0 200 120" className="mx-auto h-40 w-full max-w-xs" role="img" aria-label={CUADRILATEROS_ARBOL[id].nombre}>
      <polygon points={pts} fill="#99f6e4" fillOpacity="0.6" stroke="#0f766e" strokeWidth="3" strokeLinejoin="round" />
      {diagonales && (
        <>
          <line x1={puntos[0][0]} y1={puntos[0][1]} x2={puntos[2][0]} y2={puntos[2][1]} stroke="#be123c" strokeWidth="2" strokeDasharray="5 4" />
          <line x1={puntos[1][0]} y1={puntos[1][1]} x2={puntos[3][0]} y2={puntos[3][1]} stroke="#be123c" strokeWidth="2" strokeDasharray="5 4" />
        </>
      )}
      {puntos.map(([x, y], k) => (
        <circle key={k} cx={x} cy={y} r="3.5" fill="#0f172a" />
      ))}
    </svg>
  );
}

export default function Cuadrilateros({ onVolver }) {
  const { marcarCompletado } = useApp();

  const [elegido, setElegido] = useState('cuadrado');
  const [diagonales, setDiagonales] = useState(false);
  const [vistoRombo, setVistoRombo] = useState(false);

  const [ronda, setRonda] = useState(0);
  const [pistasVistas, setPistasVistas] = useState(1);
  const [rondaResuelta, setRondaResuelta] = useState(false);

  const [quizHerenciaOk, setQuizHerenciaOk] = useState(false);

  const terminar = () => {
    marcarCompletado('cuadrilateros');
    onVolver();
  };

  const elegir = (id) => {
    setElegido(id);
    if (id === 'rombo' || id === 'cuadrado') setVistoRombo(true);
  };

  const heredaDe = heredadas(elegido);
  const acertijo = ACERTIJOS[ronda];
  const todosResueltos = ronda === ACERTIJOS.length - 1 && rondaResuelta;

  const Nodo = ({ id }) => {
    const activo = elegido === id;
    const esAncestro = heredaDe.includes(id);
    return (
      <button
        type="button"
        onClick={() => elegir(id)}
        aria-pressed={activo}
        className={`min-h-11 rounded-xl border-2 px-3 py-2 text-sm font-semibold transition ${
          activo
            ? 'border-teal-600 bg-teal-600 text-white'
            : esAncestro
              ? 'border-teal-300 bg-teal-50 text-teal-800'
              : 'border-slate-200 bg-white text-slate-700 active:bg-slate-100'
        }`}
      >
        {CUADRILATEROS_ARBOL[id].nombre}
      </button>
    );
  };

  const pasos = [
    {
      titulo: 'Explorá el árbol de cuadriláteros',
      bloqueado: !vistoRombo,
      contenido: (
        <>
          <p className="text-slate-600">
            Cada figura es un caso particular de la de arriba. Tocá una para ver sus propiedades
            (probá con el <strong>rombo</strong> y con el <strong>cuadrado</strong>).
          </p>

          <div className="rounded-2xl border border-slate-200 bg-white p-3">
            <div className="flex flex-col items-center gap-1" aria-label="Árbol de clasificación">
              <Nodo id="cuadrilatero" />
              <span aria-hidden="true" className="text-slate-400">↓</span>
              <Nodo id="trapecio" />
              <span aria-hidden="true" className="text-slate-400">↓</span>
              <Nodo id="paralelogramo" />
              <span aria-hidden="true" className="text-slate-400">↙ ↘</span>
              <div className="flex gap-3">
                <Nodo id="rectangulo" />
                <Nodo id="rombo" />
              </div>
              <span aria-hidden="true" className="text-slate-400">↘ ↙</span>
              <Nodo id="cuadrado" />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <h3 className="text-lg font-bold">{CUADRILATEROS_ARBOL[elegido].nombre}</h3>
            <Forma id={elegido} diagonales={diagonales} />
            <button
              type="button"
              onClick={() => setDiagonales((d) => !d)}
              className="mx-auto mt-1 block h-11 rounded-lg px-3 font-medium text-teal-700 underline"
            >
              {diagonales ? 'Ocultar diagonales' : 'Mostrar diagonales'}
            </button>

            <p className="mt-2 text-sm font-semibold text-slate-500">Propiedades propias</p>
            <ul className="list-disc space-y-1 pl-6 text-slate-800">
              {DETALLE[elegido].propias.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>

            {heredaDe.length > 0 && (
              <p className="mt-3 rounded-lg bg-teal-50 p-2 text-sm text-teal-900">
                Además cumple todo lo de:{' '}
                <strong>{heredaDe.map((a) => CUADRILATEROS_ARBOL[a].nombre).join(', ')}</strong>.
              </p>
            )}
          </div>
        </>
      ),
    },
    {
      titulo: '¿Qué cuadrilátero soy?',
      bloqueado: !todosResueltos,
      contenido: (
        <>
          <p className="text-sm font-medium text-slate-500">
            Acertijo {ronda + 1} de {ACERTIJOS.length}
          </p>
          <ol className="space-y-2">
            {acertijo.pistas.slice(0, pistasVistas).map((p, k) => (
              <li key={p} className="rounded-xl border border-slate-200 bg-white p-3">
                <span className="font-bold text-teal-700">Pista {k + 1}:</span> {p}
              </li>
            ))}
          </ol>
          {pistasVistas < acertijo.pistas.length && !rondaResuelta && (
            <button
              type="button"
              onClick={() => setPistasVistas((v) => v + 1)}
              className="h-11 rounded-xl border-2 border-teal-600 px-4 font-semibold text-teal-700 active:bg-teal-50"
            >
              Dar otra pista
            </button>
          )}

          <Quiz
            key={ronda}
            pregunta="¿Qué cuadrilátero soy?"
            opciones={acertijo.opciones}
            correcta={acertijo.correcta}
            explicacion={acertijo.explicacion}
            onResolver={() => setRondaResuelta(true)}
          />

          {rondaResuelta && ronda < ACERTIJOS.length - 1 && (
            <button
              type="button"
              onClick={() => {
                setRonda((r) => r + 1);
                setPistasVistas(1);
                setRondaResuelta(false);
              }}
              className="h-12 w-full rounded-xl bg-teal-600 font-semibold text-white active:bg-teal-700"
            >
              Siguiente acertijo →
            </button>
          )}
        </>
      ),
    },
    {
      titulo: 'Una duda muy común',
      bloqueado: !quizHerenciaOk,
      contenido: (
        <Quiz
          pregunta="¿Es cierto que «todo cuadrado es también un rectángulo»?"
          opciones={[
            'Sí: el cuadrado cumple todo lo que pide un rectángulo (4 ángulos rectos).',
            'No: el cuadrado y el rectángulo son figuras totalmente distintas.',
            'Solo si el cuadrado es grande.',
          ]}
          correcta={0}
          explicacion="El cuadrado es un rectángulo con los 4 lados iguales. Lo contrario no vale: no todo rectángulo es cuadrado."
          onResolver={() => setQuizHerenciaOk(true)}
        />
      ),
    },
    {
      titulo: '¡Listo!',
      contenido: (
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="font-semibold">Para recordar:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6 text-slate-700">
            <li>Cuadrilátero → trapecio → paralelogramo → rectángulo / rombo → cuadrado.</li>
            <li>Lo que vale para una figura vale para todas las que están debajo.</li>
            <li>El cuadrado es a la vez rectángulo y rombo.</li>
          </ul>
        </div>
      ),
    },
  ];

  return (
    <ModuloLayout titulo="Cuadriláteros" icono="⬛" onVolver={onVolver}>
      <StepNav pasos={pasos} onFinish={terminar} textoFinal="Terminar ✓" />
    </ModuloLayout>
  );
}
