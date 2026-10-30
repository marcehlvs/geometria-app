import { useState } from 'react';
import ModuloLayout from '../../components/ModuloLayout.jsx';
import StepNav from '../../components/StepNav.jsx';
import Slider from '../../components/Slider.jsx';
import Quiz from '../../components/Quiz.jsx';
import NumInput from '../../components/NumInput.jsx';
import Formula from '../../components/Formula.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { hipotenusa, esTrianguloRectangulo } from '../../utils/geometry.js';
import { fmt, texNum } from '../../utils/format.js';

// Ternas para explorar (la última NO es pitagórica, a propósito).
const TERNAS = [
  [3, 4, 5],
  [5, 12, 13],
  [8, 15, 17],
  [4, 5, 6],
];

// Triángulo rectángulo con un cuadrado sobre cada lado.
// Coordenadas en «unidades» (1 unidad = 1 cm): ángulo recto en (0,0),
// cateto a hacia la derecha y cateto b hacia arriba (y crece hacia abajo en SVG).
function Cuadrados({ a, b }) {
  const c = hipotenusa(a, b);
  const pts = (arr) => arr.map((p) => p.join(',')).join(' ');
  const cuadA = [[0, 0], [a, 0], [a, a], [0, a]];
  const cuadB = [[0, 0], [0, -b], [-b, -b], [-b, 0]];
  // Normal exterior de la hipotenusa: (b, -a)
  const cuadC = [[a, 0], [0, -b], [b, -b - a], [a + b, -a]];
  const tri = [[0, 0], [a, 0], [0, -b]];

  const pad = 1;
  const x0 = -b - pad;
  const y0 = -(a + b) - pad;
  const ancho = a + 2 * b + 2 * pad;
  const alto = 2 * a + b + 2 * pad;
  const fs = Math.max(ancho, alto) / 16;

  const etiqueta = (x, y, texto) => (
    <text x={x} y={y} fontSize={fs} textAnchor="middle" dominantBaseline="middle" fill="#0f172a" fontWeight="700">
      {texto}
    </text>
  );

  return (
    <svg
      viewBox={`${x0} ${y0} ${ancho} ${alto}`}
      className="mx-auto h-72 w-full max-w-sm"
      role="img"
      aria-label={`Triángulo rectángulo de catetos ${a} y ${b} con un cuadrado sobre cada lado`}
    >
      <polygon points={pts(cuadA)} fill="#99f6e4" fillOpacity="0.7" stroke="#0f766e" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      <polygon points={pts(cuadB)} fill="#fde68a" fillOpacity="0.7" stroke="#b45309" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      <polygon points={pts(cuadC)} fill="#fecdd3" fillOpacity="0.7" stroke="#be123c" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      <polygon points={pts(tri)} fill="#e2e8f0" stroke="#0f172a" strokeWidth="2.5" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      {etiqueta(a / 2, a / 2, `a² = ${fmt(a * a)}`)}
      {etiqueta(-b / 2, -b / 2, `b² = ${fmt(b * b)}`)}
      {etiqueta((a + b) / 2, -(a + b) / 2, `c² = ${fmt(c * c)}`)}
    </svg>
  );
}

export default function Pitagoras({ onVolver }) {
  const { marcarCompletado } = useApp();

  const [a, setA] = useState(3);
  const [b, setB] = useState(4);
  const [movido, setMovido] = useState(false);

  const [hipoOk, setHipoOk] = useState(false);
  const [catetoOk, setCatetoOk] = useState(false);
  const [ternaElegida, setTernaElegida] = useState(0);
  const [quizOk, setQuizOk] = useState(false);

  const terminar = () => {
    marcarCompletado('pitagoras');
    onVolver();
  };

  const c = hipotenusa(a, b);
  const esTerna = Number.isInteger(c);

  const [ta, tb, tc] = TERNAS[ternaElegida];
  const ternaCumple = esTrianguloRectangulo(ta, tb, tc);

  const mover = (setter) => (valor) => {
    setter(valor);
    setMovido(true);
  };

  const pasos = [
    {
      titulo: 'Cuadrados sobre los lados',
      bloqueado: !movido,
      contenido: (
        <>
          <p className="text-slate-600">
            Movés los catetos y mirás las áreas de los tres cuadrados. ¿Qué pasa con la suma de los dos chicos?
          </p>
          <Cuadrados a={a} b={b} />
          <Slider etiqueta="Cateto a" valor={a} onChange={mover(setA)} min={1} max={12} paso={1} unidad="cm" />
          <Slider etiqueta="Cateto b" valor={b} onChange={mover(setB)} min={1} max={12} paso={1} unidad="cm" />
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <Formula block tex={`${texNum(a * a)} + ${texNum(b * b)} = ${texNum(a * a + b * b)} = c^2`} />
            <p className="mt-2 text-slate-700">
              Hipotenusa: <strong>c = {fmt(c)} cm</strong>
            </p>
            {esTerna && (
              <p className="mt-2 rounded-lg bg-teal-50 p-2 text-sm text-teal-900">
                ¡Los tres lados son enteros ({a}, {b} y {fmt(c)})! Es una <strong>terna pitagórica</strong>.
              </p>
            )}
          </div>
          <p className="rounded-lg bg-amber-50 p-2 text-sm text-amber-900">
            El área del cuadrado de la hipotenusa es siempre la suma de las áreas de los otros dos:{' '}
            <Formula tex="a^2 + b^2 = c^2" />.
          </p>
        </>
      ),
    },
    {
      titulo: 'Hallar la hipotenusa',
      bloqueado: !hipoOk,
      contenido: (
        <>
          <p className="text-slate-600">
            Un triángulo rectángulo tiene catetos de 6 cm y 8 cm. Calculá la hipotenusa.
          </p>
          <div className="rounded-2xl border border-slate-200 bg-white p-3">
            <Formula block tex="c = \sqrt{a^2 + b^2}" />
          </div>
          <NumInput
            etiqueta="Hipotenusa c"
            unidad="cm"
            correcto={10}
            pista="6² + 8² = 36 + 64; después, la raíz cuadrada."
            onResultado={() => setHipoOk(true)}
          />
        </>
      ),
    },
    {
      titulo: 'Hallar un cateto',
      bloqueado: !catetoOk,
      contenido: (
        <>
          <p className="text-slate-600">
            La hipotenusa mide 13 cm y un cateto mide 5 cm. Ahora hay que <strong>restar</strong>: la hipotenusa siempre es el lado más largo.
          </p>
          <div className="rounded-2xl border border-slate-200 bg-white p-3">
            <Formula block tex="b = \sqrt{c^2 - a^2}" />
          </div>
          <NumInput
            etiqueta="Cateto que falta"
            unidad="cm"
            correcto={12}
            pista="13² − 5² = 169 − 25; después, la raíz cuadrada."
            onResultado={() => setCatetoOk(true)}
          />
        </>
      ),
    },
    {
      titulo: '¿Es rectángulo?',
      bloqueado: !quizOk,
      contenido: (
        <>
          <p className="text-slate-600">
            Si <Formula tex="a^2 + b^2 = c^2" /> con c el lado mayor, el triángulo es rectángulo. Probá con estas ternas:
          </p>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Ternas para probar">
            {TERNAS.map((t, k) => (
              <button
                key={t.join('-')}
                type="button"
                onClick={() => setTernaElegida(k)}
                aria-pressed={ternaElegida === k}
                className={`min-h-11 rounded-xl border-2 px-3 font-semibold transition ${
                  ternaElegida === k
                    ? 'border-teal-600 bg-teal-600 text-white'
                    : 'border-slate-200 bg-white text-slate-700 active:bg-slate-100'
                }`}
              >
                {t.join(' · ')}
              </button>
            ))}
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <Formula block tex={`${ta}^2 + ${tb}^2 = ${texNum(ta * ta + tb * tb)} \\qquad ${tc}^2 = ${texNum(tc * tc)}`} />
            <p className={`mt-2 font-semibold ${ternaCumple ? 'text-green-700' : 'text-red-600'}`}>
              {ternaCumple ? '✅ Coinciden: es un triángulo rectángulo.' : '❌ No coinciden: no es rectángulo.'}
            </p>
          </div>
          <Quiz
            pregunta="¿Un triángulo de lados 7 cm, 24 cm y 25 cm es rectángulo?"
            opciones={[
              'Sí: 7² + 24² = 25²',
              'No: 7² + 24² no es igual a 25²',
              'No se puede saber sin medir los ángulos',
            ]}
            correcta={0}
            explicacion="49 + 576 = 625 y 25² = 625: coinciden, así que es rectángulo."
            onResolver={() => setQuizOk(true)}
          />
        </>
      ),
    },
    {
      titulo: '¡Listo!',
      contenido: (
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="font-semibold">Para recordar:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6 text-slate-700">
            <li>
              En un triángulo rectángulo: <Formula tex="a^2 + b^2 = c^2" /> (c es la hipotenusa, el lado opuesto al ángulo recto).
            </li>
            <li>Para la hipotenusa se suma; para un cateto se resta.</li>
            <li>Ternas pitagóricas: 3-4-5, 5-12-13, 8-15-17.</li>
          </ul>
        </div>
      ),
    },
  ];

  return (
    <ModuloLayout titulo="Teorema de Pitágoras" icono="📎" onVolver={onVolver}>
      <StepNav pasos={pasos} onFinish={terminar} textoFinal="Terminar ✓" />
    </ModuloLayout>
  );
}
