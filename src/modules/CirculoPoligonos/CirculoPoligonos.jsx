import { useState } from 'react';
import ModuloLayout from '../../components/ModuloLayout.jsx';
import StepNav from '../../components/StepNav.jsx';
import Slider from '../../components/Slider.jsx';
import Quiz from '../../components/Quiz.jsx';
import NumInput from '../../components/NumInput.jsx';
import Formula from '../../components/Formula.jsx';
import { useApp } from '../../context/AppContext.jsx';
import {
  longitudCircunferencia,
  areaCirculo,
  anguloInteriorRegular,
  anguloCentralRegular,
  cantidadDiagonales,
  areaPoligonoRegular,
} from '../../utils/geometry.js';
import { fmt, texNum } from '../../utils/format.js';

// Vértices de un polígono regular de n lados, con radio R en un viewBox de 200x200
const vertices = (n, R, cx = 100, cy = 100) =>
  Array.from({ length: n }, (_, i) => {
    const t = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    return [cx + R * Math.cos(t), cy + R * Math.sin(t)];
  });

const NOMBRES = {
  3: 'triángulo', 4: 'cuadrado', 5: 'pentágono', 6: 'hexágono', 7: 'heptágono',
  8: 'octógono', 9: 'eneágono', 10: 'decágono', 11: 'endecágono', 12: 'dodecágono',
};

export default function CirculoPoligonos({ onVolver }) {
  const { pi, piEscolar, marcarCompletado } = useApp();

  const [r, setR] = useState(5);
  const [numCirculoOk, setNumCirculoOk] = useState(false);

  const [n, setN] = useState(6);
  const [verDiagonales, setVerDiagonales] = useState(false);
  const [numDiagOk, setNumDiagOk] = useState(false);

  const [lado, setLado] = useState(4);
  const [quizAreaOk, setQuizAreaOk] = useState(false);

  const terminar = () => {
    marcarCompletado('circulo');
    onVolver();
  };

  // ----- Círculo -----
  const d = 2 * r;
  const L = longitudCircunferencia(r, pi);
  const A = areaCirculo(r, pi);
  const piTex = piEscolar ? '3{,}14' : '\\pi';
  const igual = piEscolar ? '=' : '\\approx';
  const rPx = r * 9;

  // ----- Polígono -----
  const Rpx = 80;
  const pts = vertices(n, Rpx);
  const interior = anguloInteriorRegular(n);
  const central = anguloCentralRegular(n);
  const diagonales = cantidadDiagonales(n);

  // Arco del ángulo interior en el vértice 0
  const [v0, v1, vN] = [pts[0], pts[1], pts[n - 1]];
  const unit = (a, b) => {
    const dx = b[0] - a[0], dy = b[1] - a[1], h = Math.hypot(dx, dy);
    return [dx / h, dy / h];
  };
  const u1 = unit(v0, v1), u2 = unit(v0, vN);
  const rArco = 22;
  const p1 = [v0[0] + rArco * u1[0], v0[1] + rArco * u1[1]];
  const p2 = [v0[0] + rArco * u2[0], v0[1] + rArco * u2[1]];
  const cruz = u1[0] * u2[1] - u1[1] * u2[0];
  const barrido = cruz > 0 ? 1 : 0;

  // Todas las diagonales (pares de vértices no vecinos)
  const lineasDiag = [];
  for (let i = 0; i < n; i++) {
    for (let j = i + 2; j < n; j++) {
      if (i === 0 && j === n - 1) continue;
      lineasDiag.push([pts[i], pts[j]]);
    }
  }

  // ----- Área del polígono regular (con apotema) -----
  const apotema = lado / (2 * Math.tan(Math.PI / n));
  const perimetro = n * lado;
  const areaPol = areaPoligonoRegular(perimetro, apotema);

  const pasos = [
    {
      titulo: 'Círculo: longitud y área',
      bloqueado: !numCirculoOk,
      contenido: (
        <>
          <Slider etiqueta="Radio" valor={r} onChange={setR} min={1} max={10} paso={0.5} unidad="cm" decimales={1} />
          <svg viewBox="0 0 200 200" className="mx-auto h-48 w-48" role="img" aria-label={`Círculo de radio ${r} cm`}>
            <circle cx="100" cy="100" r={rPx} fill="#99f6e4" fillOpacity="0.6" stroke="#0f766e" strokeWidth="3" />
            <line x1={100 - rPx} y1="100" x2={100 + rPx} y2="100" stroke="#be123c" strokeWidth="2" />
            <line x1="100" y1="100" x2={100 + rPx} y2="100" stroke="#0f766e" strokeWidth="4" />
            <circle cx="100" cy="100" r="3.5" fill="#0f172a" />
            <text x={100 + rPx / 2} y="92" textAnchor="middle" fontSize="14" fill="#0f172a">r</text>
            <text x={100 - rPx / 2} y="118" textAnchor="middle" fontSize="14" fill="#be123c">d</text>
          </svg>

          <div className="rounded-xl bg-white p-3">
            <p className="text-sm font-semibold text-slate-500">Longitud de la circunferencia</p>
            <Formula block tex={'L = 2 \\cdot \\pi \\cdot r'} />
            <Formula block tex={`L = 2 \\cdot ${piTex} \\cdot ${texNum(r)}`} />
            <Formula block tex={`L ${igual} ${texNum(L)}\\ \\text{cm}`} />
            <p className="mt-2 text-sm font-semibold text-slate-500">Área del círculo</p>
            <Formula block tex={'A = \\pi \\cdot r^2'} />
            <Formula block tex={`A = ${piTex} \\cdot ${texNum(r)}^2`} />
            <Formula block tex={`A ${igual} ${texNum(A)}\\ \\text{cm}^2`} />
          </div>

          <div className="rounded-xl border border-teal-200 bg-teal-50 p-3 text-teal-900">
            <p className="font-semibold">¿Qué pasa si dividimos L entre d?</p>
            <p className="mt-1">
              {fmt(L, 2)} cm ÷ {fmt(d, 1)} cm = <strong>{fmt(L / d, 2)}</strong>
            </p>
            <p className="text-sm">Cambiá el radio: el resultado no cambia. Ese número es π.</p>
          </div>

          <NumInput
            etiqueta="Un círculo tiene radio 5 cm. ¿Cuánto mide su circunferencia?"
            unidad="cm"
            correcto={longitudCircunferencia(5, pi)}
            pista="L = 2 · π · r"
            onResultado={() => setNumCirculoOk(true)}
          />
        </>
      ),
    },
    {
      titulo: 'Polígonos regulares: ángulos y diagonales',
      bloqueado: !numDiagOk,
      contenido: (
        <>
          <Slider etiqueta="Cantidad de lados (n)" valor={n} onChange={setN} min={3} max={12} paso={1} />
          <p className="text-center font-semibold capitalize text-teal-800">
            {NOMBRES[n]} regular
          </p>
          <svg viewBox="0 0 200 200" className="mx-auto h-56 w-56" role="img" aria-label={`Polígono regular de ${n} lados`}>
            <polygon
              points={pts.map((p) => p.join(',')).join(' ')}
              fill="#99f6e4"
              fillOpacity="0.5"
              stroke="#0f766e"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            {verDiagonales &&
              lineasDiag.map(([a, b], k) => (
                <line key={k} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#be123c" strokeWidth="1.2" />
              ))}
            {/* ángulo central */}
            <path d={`M 100 100 L ${pts[0][0]} ${pts[0][1]} L ${pts[1][0]} ${pts[1][1]} Z`} fill="#fbbf24" fillOpacity="0.6" stroke="#b45309" strokeWidth="1.5" />
            {/* ángulo interior */}
            <path
              d={`M ${v0[0]} ${v0[1]} L ${p1[0]} ${p1[1]} A ${rArco} ${rArco} 0 0 ${barrido} ${p2[0]} ${p2[1]} Z`}
              fill="#6366f1"
              fillOpacity="0.55"
            />
            <circle cx="100" cy="100" r="3" fill="#0f172a" />
          </svg>
          <p className="text-center text-sm text-slate-500">
            <span className="font-semibold text-amber-700">Naranja:</span> ángulo central ·{' '}
            <span className="font-semibold text-indigo-700">Violeta:</span> ángulo interior
          </p>

          <button
            type="button"
            onClick={() => setVerDiagonales((v) => !v)}
            className="mx-auto block h-11 rounded-lg px-3 font-medium text-teal-700 underline"
          >
            {verDiagonales ? 'Ocultar diagonales' : 'Mostrar diagonales'}
          </button>

          <div className="rounded-xl bg-white p-3">
            <Formula block tex={`\\text{Ángulo central} = \\dfrac{360^\\circ}{${n}} = ${texNum(central)}^\\circ`} />
            <Formula block tex={`\\text{Ángulo interior} = \\dfrac{(${n} - 2) \\cdot 180^\\circ}{${n}} = ${texNum(interior)}^\\circ`} />
            <Formula block tex={`\\text{Diagonales} = \\dfrac{${n} \\cdot (${n} - 3)}{2} = ${diagonales}`} />
          </div>

          <NumInput
            etiqueta="¿Cuántas diagonales tiene un octógono (8 lados)?"
            correcto={cantidadDiagonales(8)}
            pista="n · (n − 3) / 2"
            onResultado={() => setNumDiagOk(true)}
          />
        </>
      ),
    },
    {
      titulo: 'Área de un polígono regular',
      bloqueado: !quizAreaOk,
      contenido: (
        <>
          <p className="text-slate-600">
            Un polígono regular de {n} lados se parte en <strong>{n} triángulos iguales</strong>. Cada uno tiene
            base = lado y altura = apotema.
          </p>
          <Slider etiqueta="Lado" valor={lado} onChange={setLado} min={1} max={10} paso={0.5} unidad="cm" decimales={1} />
          <Slider etiqueta="Cantidad de lados (n)" valor={n} onChange={setN} min={3} max={12} paso={1} />

          <svg viewBox="0 0 200 200" className="mx-auto h-48 w-48" role="img" aria-label="Polígono dividido en triángulos">
            <polygon points={pts.map((p) => p.join(',')).join(' ')} fill="#e0f2fe" stroke="#0f766e" strokeWidth="2.5" strokeLinejoin="round" />
            {pts.map((p, k) => (
              <line key={k} x1="100" y1="100" x2={p[0]} y2={p[1]} stroke="#0f766e" strokeWidth="1.2" />
            ))}
          </svg>

          <div className="rounded-xl bg-white p-3">
            <Formula block tex={`a_p = \\dfrac{l}{2 \\cdot \\tan(180^\\circ / n)} \\approx ${texNum(apotema)}\\ \\text{cm}`} />
            <Formula block tex={'A = \\dfrac{P \\cdot a_p}{2}'} />
            <Formula block tex={`A = \\dfrac{${texNum(perimetro)} \\cdot ${texNum(apotema)}}{2} \\approx ${texNum(areaPol)}\\ \\text{cm}^2`} />
          </div>

          <Quiz
            pregunta="Si se parte un polígono regular en triángulos desde el centro, ¿cuántos triángulos iguales se forman?"
            opciones={['Siempre 4', 'Tantos como lados tiene el polígono', 'Tantos como diagonales tiene']}
            correcta={1}
            explicacion="Cada lado forma un triángulo con el centro: n lados, n triángulos."
            onResolver={() => setQuizAreaOk(true)}
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
            <li>L ÷ d = π en cualquier círculo.</li>
            <li>Ángulo central = 360° ÷ n. Ángulo interior = (n − 2) · 180° ÷ n.</li>
            <li>Diagonales = n · (n − 3) ÷ 2.</li>
            <li>Área = perímetro · apotema ÷ 2.</li>
          </ul>
        </div>
      ),
    },
  ];

  return (
    <ModuloLayout titulo="Círculo y polígonos regulares" icono="⭕" onVolver={onVolver}>
      <StepNav pasos={pasos} onFinish={terminar} textoFinal="Terminar ✓" />
    </ModuloLayout>
  );
}
