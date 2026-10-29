import { useState } from 'react';
import ModuloLayout from '../../components/ModuloLayout.jsx';
import StepNav from '../../components/StepNav.jsx';
import Slider from '../../components/Slider.jsx';
import Quiz from '../../components/Quiz.jsx';
import NumInput from '../../components/NumInput.jsx';
import Formula from '../../components/Formula.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { areaCirculo } from '../../utils/geometry.js';
import { texNum } from '../../utils/format.js';

// Módulo de prueba del Paso 3: usa todos los componentes base.
// Sirve de molde para los módulos reales (copiar y reemplazar el contenido).

export default function Demo({ onVolver }) {
  const { pi, piEscolar, marcarCompletado } = useApp();
  const [r, setR] = useState(4);
  const [quizOk, setQuizOk] = useState(false);
  const [numOk, setNumOk] = useState(false);

  const area = areaCirculo(r, pi);
  const piTex = piEscolar ? '3{,}14' : '\\pi';
  const igual = piEscolar ? '=' : '\\approx';

  const terminar = () => {
    marcarCompletado('demo');
    onVolver();
  };

  const pasos = [
    {
      titulo: 'Deslizador + fórmula',
      contenido: (
        <>
          <Slider etiqueta="Radio" valor={r} onChange={setR} min={1} max={10} paso={0.5} unidad="cm" decimales={1} />
          <svg viewBox="0 0 200 200" className="mx-auto h-48 w-48" role="img" aria-label={`Círculo de radio ${r} cm`}>
            <circle cx="100" cy="100" r={r * 9} fill="#99f6e4" stroke="#0f766e" strokeWidth="3" />
            <line x1="100" y1="100" x2={100 + r * 9} y2="100" stroke="#0f766e" strokeWidth="3" />
            <text x={100 + r * 4.5} y="92" textAnchor="middle" fontSize="14" fill="#0f172a">r</text>
          </svg>
          <div className="rounded-xl bg-white p-3">
            <Formula block tex={'A = \\pi \\cdot r^2'} />
            <Formula block tex={`A = ${piTex} \\cdot ${texNum(r)}^2`} />
            <Formula block tex={`A ${igual} ${texNum(area)}\\ \\text{cm}^2`} />
          </div>
          <p className="text-sm text-slate-500">
            Probá cambiar «Valor de π» en el menú: la fórmula se adapta.
          </p>
        </>
      ),
    },
    {
      titulo: 'Pregunta de opción múltiple',
      bloqueado: !quizOk,
      contenido: (
        <Quiz
          pregunta="¿Cuántos ejes de simetría tiene un cuadrado?"
          opciones={['2', '4', '8', '1']}
          correcta={1}
          explicacion="Dos pasan por los puntos medios de los lados y dos por las diagonales."
          onResolver={() => setQuizOk(true)}
        />
      ),
    },
    {
      titulo: 'Respuesta numérica',
      bloqueado: !numOk,
      contenido: (
        <NumInput
          etiqueta="¿Cuál es el área de un rectángulo de 6 cm por 4 cm?"
          unidad="cm²"
          correcto={24}
          pista="Área = base · altura."
          onResultado={() => setNumOk(true)}
        />
      ),
    },
    {
      titulo: '¡Todo funciona!',
      contenido: (
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="font-semibold">Probaste los 5 componentes base:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6 text-slate-700">
            <li>Formula (KaTeX)</li>
            <li>Slider</li>
            <li>Quiz</li>
            <li>NumInput (acepta coma y punto)</li>
            <li>StepNav (pasos con «Siguiente»)</li>
          </ul>
        </div>
      ),
    },
  ];

  return (
    <ModuloLayout titulo="Prueba de componentes" icono="🧪" onVolver={onVolver}>
      <StepNav pasos={pasos} onFinish={terminar} textoFinal="Terminar ✓" />
    </ModuloLayout>
  );
}
