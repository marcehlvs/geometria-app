import { useState, useRef } from 'react';
import ModuloLayout from '../../components/ModuloLayout.jsx';
import StepNav from '../../components/StepNav.jsx';
import Slider from '../../components/Slider.jsx';
import Quiz from '../../components/Quiz.jsx';
import NumInput from '../../components/NumInput.jsx';
import Formula from '../../components/Formula.jsx';
import { useApp } from '../../context/AppContext.jsx';
import {
  clasificarTrianguloPorLados,
  clasificarTrianguloPorAngulos,
  existeTriangulo,
} from '../../utils/geometry.js';
import { fmt } from '../../utils/format.js';

const PRESETS = [
  ['equilatero', 'Equilátero'],
  ['rectangulo', 'Rectángulo'],
  ['isosceles', 'Isósceles'],
  ['obtusangulo', 'Obtusángulo'],
];

const VERTICES_PRESET = {
  equilatero: { A: { x: 80, y: 185 }, B: { x: 240, y: 185 }, C: { x: 160, y: 46 } },
  rectangulo: { A: { x: 70, y: 180 }, B: { x: 250, y: 180 }, C: { x: 70, y: 60 } },
  isosceles: { A: { x: 70, y: 180 }, B: { x: 250, y: 180 }, C: { x: 160, y: 45 } },
  obtusangulo: { A: { x: 70, y: 180 }, B: { x: 250, y: 180 }, C: { x: 40, y: 90 } },
};

const dist = (p1, p2) => Math.hypot(p2.x - p1.x, p2.y - p1.y);
const dobleArea = (a, b, c) => Math.abs((b.x - a.x) * (c.y - a.y) - (c.x - a.x) * (b.y - a.y));

// Pie de la perpendicular desde P a la recta QR. `t` indica dónde cae: 0 = en Q, 1 = en R.
const pie = (P, Q, R) => {
  const dx = R.x - Q.x, dy = R.y - Q.y;
  const t = ((P.x - Q.x) * dx + (P.y - Q.y) * dy) / (dx * dx + dy * dy);
  return { x: Q.x + t * dx, y: Q.y + t * dy, t };
};

export default function Triangulos({ onVolver }) {
  const { marcarCompletado } = useApp();

  // Pasos 1, 2 y 4 comparten los vértices A, B, C (viewBox de 320 x 220)
  const [vertices, setVertices] = useState(VERTICES_PRESET.isosceles);
  const [arrastrando, setArrastrando] = useState(null);
  const [quiz1Ok, setQuiz1Ok] = useState(false);
  const [num2Ok, setNum2Ok] = useState(false);
  const [mostrarJuntos, setMostrarJuntos] = useState(false);

  // Paso 3: desigualdad triangular
  const [ladoA, setLadoA] = useState(5);
  const [ladoB, setLadoB] = useState(4);
  const [ladoC, setLadoC] = useState(6);
  const [quiz3Ok, setQuiz3Ok] = useState(false);

  // Paso 4: puntos notables
  const [puntoNotable, setPuntoNotable] = useState('baricentro');

  const svgRef = useRef(null);

  const terminar = () => {
    marcarCompletado('triangulos');
    onVolver();
  };

  // ----- Arrastre de vértices -----
  const moverVertice = (e) => {
    if (!arrastrando || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = Math.round(Math.max(25, Math.min(295, ((e.clientX - rect.left) / rect.width) * 320)));
    const y = Math.round(Math.max(25, Math.min(195, ((e.clientY - rect.top) / rect.height) * 220)));
    setVertices((prev) => {
      const nuevo = { ...prev, [arrastrando]: { x, y } };
      // Si los tres vértices casi quedan alineados, no es un triángulo: se ignora el movimiento
      return dobleArea(nuevo.A, nuevo.B, nuevo.C) < 600 ? prev : nuevo;
    });
  };

  const aplicarPreset = (tipo) => setVertices(VERTICES_PRESET[tipo]);

  // ----- Medidas de los vértices A, B, C -----
  const { A, B, C } = vertices;
  const pxA = dist(B, C); // lado opuesto a A
  const pxB = dist(A, C); // lado opuesto a B
  const pxC = dist(A, B); // lado opuesto a C

  // Escala: 20 px = 1 cm
  const aCm = pxA / 20;
  const bCm = pxB / 20;
  const cCm = pxC / 20;

  // Ángulos interiores por el teorema del coseno
  const calcAng = (opuesto, ady1, ady2) => {
    const cos = (ady1 * ady1 + ady2 * ady2 - opuesto * opuesto) / (2 * ady1 * ady2);
    return (Math.acos(Math.max(-1, Math.min(1, cos))) * 180) / Math.PI;
  };
  // Enteros que siempre suman 180°
  const angA = Math.max(1, Math.round(calcAng(pxA, pxB, pxC)));
  const angB = Math.max(1, Math.round(calcAng(pxB, pxA, pxC)));
  const angC = 180 - angA - angB;

  const clasifLados = clasificarTrianguloPorLados(aCm, bCm, cCm, 0.35);
  const clasifAng = clasificarTrianguloPorAngulos(angA, angB, angC, 2);

  // Un número «hacia adentro» del triángulo, a `d` píxeles del vértice (para rotular ángulos)
  const bariX = (A.x + B.x + C.x) / 3;
  const bariY = (A.y + B.y + C.y) / 3;
  const haciaCentro = (P, d = 32) => {
    const dx = bariX - P.x, dy = bariY - P.y, h = Math.hypot(dx, dy) || 1;
    return { x: P.x + (dx / h) * d, y: P.y + (dy / h) * d };
  };

  // ----- Paso 3: desigualdad triangular -----
  // Se ordenan los lados: la condición es que los dos menores sumen más que el mayor.
  const [s1, s2, mayor] = [ladoA, ladoB, ladoC].sort((p, q) => p - q);
  const sePuedeArmar = existeTriangulo(ladoA, ladoB, ladoC);
  const ESC = 11; // píxeles por cm
  const X0 = 50;
  const Y_TRI = 150;
  const mayorPx = mayor * ESC;
  const s1Px = s1 * ESC;
  const s2Px = s2 * ESC;
  let xV = X0, yV = Y_TRI;
  if (sePuedeArmar) {
    // Vértice libre: intersección de las circunferencias de radio s1 (desde la izquierda) y s2 (desde la derecha)
    const xRel = (mayorPx * mayorPx + s1Px * s1Px - s2Px * s2Px) / (2 * mayorPx);
    xV = X0 + xRel;
    yV = Y_TRI - Math.sqrt(Math.max(0, s1Px * s1Px - xRel * xRel));
  }
  const sumaMenores = s1 + s2;

  // ----- Paso 4: puntos notables -----
  const mAB = { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 };
  const mBC = { x: (B.x + C.x) / 2, y: (B.y + C.y) / 2 };
  const mAC = { x: (A.x + C.x) / 2, y: (A.y + C.y) / 2 };

  // Circuncentro O: intersección de las mediatrices
  const dCirc = 2 * (A.x * (B.y - C.y) + B.x * (C.y - A.y) + C.x * (A.y - B.y));
  const sq = (P) => P.x * P.x + P.y * P.y;
  const circunX = (sq(A) * (B.y - C.y) + sq(B) * (C.y - A.y) + sq(C) * (A.y - B.y)) / dCirc;
  const circunY = (sq(A) * (C.x - B.x) + sq(B) * (A.x - C.x) + sq(C) * (B.x - A.x)) / dCirc;
  const radioCircun = dist({ x: circunX, y: circunY }, A);

  // Ortocentro H (recta de Euler: H = A + B + C − 2·O)
  const ortoX = A.x + B.x + C.x - 2 * circunX;
  const ortoY = A.y + B.y + C.y - 2 * circunY;
  const alturas = [
    { v: A, p: pie(A, B, C), lado: [B, C] },
    { v: B, p: pie(B, A, C), lado: [A, C] },
    { v: C, p: pie(C, A, B), lado: [A, B] },
  ];

  // Incentro I: ponderado por los lados; radio de la circunferencia inscripta = área / semiperímetro
  const perimPx = pxA + pxB + pxC;
  const incentroX = (pxA * A.x + pxB * B.x + pxC * C.x) / perimPx;
  const incentroY = (pxA * A.y + pxB * B.y + pxC * C.y) / perimPx;
  const radioIn = dobleArea(A, B, C) / 2 / (perimPx / 2);
  // Bisectrices: cada una llega al lado opuesto dividiéndolo en la razón de los lados que salen del vértice
  const bisectrices = [
    { v: A, p: { x: (pxB * B.x + pxC * C.x) / (pxB + pxC), y: (pxB * B.y + pxC * C.y) / (pxB + pxC) } },
    { v: B, p: { x: (pxA * A.x + pxC * C.x) / (pxA + pxC), y: (pxA * A.y + pxC * C.y) / (pxA + pxC) } },
    { v: C, p: { x: (pxA * A.x + pxB * B.x) / (pxA + pxB), y: (pxA * A.y + pxB * B.y) / (pxA + pxB) } },
  ];

  const punto =
    puntoNotable === 'baricentro' ? { x: bariX, y: bariY }
    : puntoNotable === 'ortocentro' ? { x: ortoX, y: ortoY }
    : puntoNotable === 'circuncentro' ? { x: circunX, y: circunY }
    : { x: incentroX, y: incentroY };

  // El ortocentro y el circuncentro de un obtusángulo caen fuera del triángulo (y a veces del
  // cuadro): el cuadro se agranda lo necesario para que el punto siempre se vea.
  const vbX0 = Math.min(0, punto.x - 26);
  const vbY0 = Math.min(0, punto.y - 26);
  const vbX1 = Math.max(320, punto.x + 26);
  const vbY1 = Math.max(220, punto.y + 26);

  const signo = (p, q, r) => (p.x - r.x) * (q.y - r.y) - (q.x - r.x) * (p.y - r.y);
  const d1 = signo(punto, A, B), d2 = signo(punto, B, C), d3 = signo(punto, C, A);
  const puntoDentro = !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0));

  const rotuloAngulo = (P, texto, color) => {
    const q = haciaCentro(P);
    return (
      <>
        <circle cx={P.x} cy={P.y} r="14" fill={color.fondo} />
        <text x={q.x} y={q.y + 4} textAnchor="middle" fontSize="11" fontWeight="bold" fill={color.texto}>
          {texto}
        </text>
      </>
    );
  };

  const pasos = [
    {
      titulo: '1. Arrastrá los vértices y clasificalo',
      bloqueado: !quiz1Ok,
      contenido: (
        <>
          <p className="text-slate-600">
            Mové cualquiera de los vértices <strong>A, B o C</strong> arrastrándolos con el dedo o el mouse.
            Observá cómo se clasifica automáticamente por sus <strong>lados</strong> y por sus <strong>ángulos</strong>:
          </p>

          <div className="flex flex-wrap gap-2">
            {PRESETS.map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => aplicarPreset(id)}
                className="min-h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 active:bg-slate-100"
              >
                {label}
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm select-none">
            <svg
              ref={svgRef}
              viewBox="0 0 320 220"
              className="mx-auto w-full max-w-sm touch-none"
              onPointerMove={moverVertice}
              onPointerUp={() => setArrastrando(null)}
              onPointerLeave={() => setArrastrando(null)}
              role="img"
              aria-label="Triángulo interactivo con vértices arrastrables"
            >
              <polygon
                points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`}
                fill="rgba(15, 118, 110, 0.12)"
                stroke="#0f766e"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />

              <text x={mAB.x} y={mAB.y + 16} textAnchor="middle" fontSize="11" fill="#475569" className="font-mono">
                c = {fmt(cCm, 1)} cm
              </text>
              <text x={mBC.x + 8} y={mBC.y} textAnchor="start" fontSize="11" fill="#475569" className="font-mono">
                a = {fmt(aCm, 1)} cm
              </text>
              <text x={mAC.x - 8} y={mAC.y} textAnchor="end" fontSize="11" fill="#475569" className="font-mono">
                b = {fmt(bCm, 1)} cm
              </text>

              {[
                { id: 'A', pt: A, color: '#0d9488' },
                { id: 'B', pt: B, color: '#0284c7' },
                { id: 'C', pt: C, color: '#e11d48' },
              ].map(({ id, pt, color }) => (
                <g
                  key={id}
                  className="cursor-grab active:cursor-grabbing"
                  onPointerDown={(e) => {
                    e.currentTarget.setPointerCapture(e.pointerId);
                    setArrastrando(id);
                  }}
                >
                  <circle cx={pt.x} cy={pt.y} r="18" fill="transparent" />
                  <circle cx={pt.x} cy={pt.y} r="8" fill={color} stroke="#ffffff" strokeWidth="2" />
                  <text x={pt.x} y={pt.y - 12} textAnchor="middle" fontSize="13" fontWeight="bold" fill="#0f172a">
                    {id}
                  </text>
                </g>
              ))}
            </svg>

            <div className="mt-2 grid grid-cols-2 gap-2 text-center">
              <div className="rounded-xl border border-teal-200 bg-teal-50 p-2">
                <span className="text-xs font-bold uppercase tracking-wide text-teal-700">Por sus lados</span>
                <p className="text-base font-extrabold capitalize text-teal-900">{clasifLados}</p>
                <p className="text-xs text-teal-700">
                  {clasifLados === 'equilátero' ? '3 lados iguales' : clasifLados === 'isósceles' ? '2 lados iguales' : '3 lados distintos'}
                </p>
              </div>

              <div className="rounded-xl border border-sky-200 bg-sky-50 p-2">
                <span className="text-xs font-bold uppercase tracking-wide text-sky-700">Por sus ángulos</span>
                <p className="text-base font-extrabold capitalize text-sky-900">{clasifAng}</p>
                <p className="text-xs text-sky-700">
                  {clasifAng === 'rectángulo' ? '1 ángulo recto (90°)' : clasifAng === 'obtusángulo' ? '1 ángulo obtuso (> 90°)' : '3 ángulos agudos (< 90°)'}
                </p>
              </div>
            </div>
          </div>

          <Quiz
            pregunta="¿Es posible construir un triángulo que sea a la vez equilátero y rectángulo?"
            opciones={[
              'No, porque en un equilátero los 3 ángulos siempre son de 60°',
              'Sí, si uno de los lados es la hipotenusa',
              'Solo si se dibuja muy grande',
            ]}
            correcta={0}
            explicacion="En un triángulo equilátero, los tres lados y los tres ángulos son iguales (180° ÷ 3 = 60°). Ninguno puede ser recto (90°)."
            onResolver={() => setQuiz1Ok(true)}
          />
        </>
      ),
    },
    {
      titulo: '2. Suma de ángulos interiores = 180°',
      bloqueado: !num2Ok,
      contenido: (
        <>
          <p className="text-slate-600">
            Sin importar la forma del triángulo, la <strong>suma de los tres ángulos interiores es siempre 180°</strong>:
          </p>

          <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm select-none">
            {!mostrarJuntos ? (
              <svg viewBox="0 0 320 220" className="mx-auto w-full max-w-sm" role="img" aria-label="Ángulos interiores del triángulo">
                <polygon
                  points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`}
                  fill="#f8fafc"
                  stroke="#334155"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                {rotuloAngulo(A, `α = ${angA}°`, { fondo: 'rgba(13, 148, 136, 0.3)', texto: '#0f766e' })}
                {rotuloAngulo(B, `β = ${angB}°`, { fondo: 'rgba(217, 119, 6, 0.3)', texto: '#b45309' })}
                {rotuloAngulo(C, `γ = ${angC}°`, { fondo: 'rgba(79, 70, 229, 0.3)', texto: '#4338ca' })}
              </svg>
            ) : (
              /* Demostración: los 3 sectores unidos en una recta forman 180° */
              <svg viewBox="0 0 320 140" className="mx-auto w-full max-w-sm" role="img" aria-label="Demostración visual de 180 grados">
                <line x1="40" y1="110" x2="280" y2="110" stroke="#0f172a" strokeWidth="2.5" />
                {(() => {
                  const cx = 160, cy = 110, r = 70;
                  const radA = (angA * Math.PI) / 180;
                  const radB = (angB * Math.PI) / 180;
                  const pt = (rad) => [cx + r * Math.cos(-rad), cy + r * Math.sin(-rad)];
                  const [xA, yA] = pt(radA);
                  const [xAB, yAB] = pt(radA + radB);
                  return (
                    <>
                      <path d={`M ${cx + r} ${cy} A ${r} ${r} 0 0 0 ${xA} ${yA} L ${cx} ${cy} Z`} fill="rgba(13, 148, 136, 0.45)" stroke="#0f766e" />
                      <path d={`M ${xA} ${yA} A ${r} ${r} 0 0 0 ${xAB} ${yAB} L ${cx} ${cy} Z`} fill="rgba(217, 119, 6, 0.45)" stroke="#b45309" />
                      <path d={`M ${xAB} ${yAB} A ${r} ${r} 0 0 0 ${cx - r} ${cy} L ${cx} ${cy} Z`} fill="rgba(79, 70, 229, 0.45)" stroke="#4338ca" />
                    </>
                  );
                })()}
                <circle cx="160" cy="110" r="4" fill="#0f172a" />
                <text x="160" y="130" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#0f172a">
                  Ángulo llano completo = 180°
                </text>
              </svg>
            )}

            <div className="mt-2 flex justify-center">
              <button
                type="button"
                onClick={() => setMostrarJuntos((m) => !m)}
                className="min-h-11 rounded-xl border border-teal-300 bg-teal-50 px-3 text-sm font-bold text-teal-800 active:bg-teal-100"
              >
                {mostrarJuntos ? '← Ver triángulo' : '✨ Juntar los 3 ángulos en una recta'}
              </button>
            </div>

            <div className="mt-3 rounded-xl bg-slate-50 p-3 text-center">
              <Formula block tex={'\\alpha + \\beta + \\gamma = 180^\\circ'} />
              <Formula block tex={`${angA}^\\circ + ${angB}^\\circ + ${angC}^\\circ = 180^\\circ`} />
            </div>
          </div>

          <NumInput
            etiqueta="En un triángulo, un ángulo mide 65° y otro 45°. ¿Cuánto mide el tercer ángulo?"
            unidad="°"
            correcto={70}
            pista="Restale a 180° la suma de los otros dos: 180° − (65° + 45°)."
            onResultado={({ correcto }) => correcto && setNum2Ok(true)}
          />
        </>
      ),
    },
    {
      titulo: '3. Desigualdad triangular («¿Se puede armar?»)',
      bloqueado: !quiz3Ok,
      contenido: (
        <>
          <p className="text-slate-600">
            ¿Se puede armar un triángulo con tres medidas cualesquiera? <strong>No siempre:</strong>{' '}
            los dos lados menores, juntos, tienen que ser más largos que el mayor.
          </p>

          <div className="space-y-2">
            <Slider etiqueta="Lado a" valor={ladoA} onChange={setLadoA} min={1} max={10} unidad="cm" />
            <Slider etiqueta="Lado b" valor={ladoB} onChange={setLadoB} min={1} max={10} unidad="cm" />
            <Slider etiqueta="Lado c" valor={ladoC} onChange={setLadoC} min={2} max={12} unidad="cm" />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm select-none">
            <svg viewBox="0 0 320 240" className="mx-auto w-full max-w-sm" role="img" aria-label="Comprobación visual de la desigualdad triangular">
              {/* Arriba: el triángulo, si se puede armar */}
              <line x1={X0} y1={Y_TRI} x2={X0 + mayorPx} y2={Y_TRI} stroke="#0f172a" strokeWidth="3.5" />
              {sePuedeArmar ? (
                <>
                  <polygon
                    points={`${X0},${Y_TRI} ${X0 + mayorPx},${Y_TRI} ${xV},${yV}`}
                    fill="rgba(16, 185, 129, 0.15)"
                    stroke="#10b981"
                    strokeWidth="3"
                    strokeLinejoin="round"
                  />
                  <text x={(X0 + xV) / 2 - 6} y={(Y_TRI + yV) / 2} textAnchor="end" fontSize="11" fontWeight="bold" fill="#047857">
                    {s1} cm
                  </text>
                  <text x={(X0 + mayorPx + xV) / 2 + 6} y={(Y_TRI + yV) / 2} textAnchor="start" fontSize="11" fontWeight="bold" fill="#047857">
                    {s2} cm
                  </text>
                </>
              ) : (
                <>
                  {/* Las dos varillas, apoyadas en los extremos de la base: no alcanzan a cerrarse */}
                  <line x1={X0} y1={Y_TRI - 8} x2={X0 + s1Px} y2={Y_TRI - 8} stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
                  <line x1={X0 + mayorPx - s2Px} y1={Y_TRI - 8} x2={X0 + mayorPx} y2={Y_TRI - 8} stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
                  <text x="160" y="70" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#dc2626">
                    No se puede cerrar el triángulo
                  </text>
                </>
              )}
              <text x={X0 + mayorPx / 2} y={Y_TRI + 16} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#0f172a">
                {mayor} cm
              </text>

              {/* Abajo: la comparación «los dos menores, uno a continuación del otro, contra el mayor» */}
              <text x={X0} y="184" fontSize="11" fill="#475569">Lado mayor: {mayor} cm</text>
              <line x1={X0} y1="192" x2={X0 + mayorPx} y2="192" stroke="#0f172a" strokeWidth="6" strokeLinecap="round" />
              <text x={X0} y="212" fontSize="11" fill="#475569">Los otros dos, juntos: {s1} + {s2} = {sumaMenores} cm</text>
              <line x1={X0} y1="220" x2={X0 + s1Px} y2="220" stroke="#0d9488" strokeWidth="6" />
              <line x1={X0 + s1Px} y1="220" x2={X0 + s1Px + s2Px} y2="220" stroke="#d97706" strokeWidth="6" />
              <line
                x1={X0 + mayorPx}
                y1="180"
                x2={X0 + mayorPx}
                y2="228"
                stroke={sePuedeArmar ? '#16a34a' : '#dc2626'}
                strokeWidth="2"
                strokeDasharray="4 3"
              />
            </svg>

            <div className={`mt-2 rounded-xl p-3 text-center ${sePuedeArmar ? 'border border-green-200 bg-green-50 text-green-900' : 'border border-red-200 bg-red-50 text-red-900'}`}>
              <p className="font-bold">
                {sePuedeArmar ? '✅ ¡Sí se puede formar el triángulo!' : '❌ No se puede formar el triángulo'}
              </p>
              <p className="mt-1 text-sm">
                {s1} + {s2} = {sumaMenores} cm{' '}
                {sumaMenores > mayor
                  ? `> ${mayor} cm: los lados menores pasan al mayor.`
                  : sumaMenores === mayor
                    ? `= ${mayor} cm: justo llegan, pero quedan alineados (no hay triángulo).`
                    : `< ${mayor} cm: no llegan al mayor.`}
              </p>
            </div>
          </div>

          <Quiz
            pregunta="¿Se puede construir un triángulo con lados que midan 3 cm, 4 cm y 9 cm?"
            opciones={[
              'No, porque 3 + 4 = 7, que es menor que 9',
              'Sí, porque el lado mayor es de 9 cm',
              'Sí, cualquier combinación de medidas se puede armar',
            ]}
            correcta={0}
            explicacion="Por la desigualdad triangular, los dos lados menores deben sumar más que el mayor: 3 + 4 = 7 < 9, las varillas nunca se tocan."
            onResolver={() => setQuiz3Ok(true)}
          />
        </>
      ),
    },
    {
      titulo: '4. Puntos notables del triángulo',
      contenido: (
        <div className="space-y-4">
          <p className="text-slate-600">
            Las líneas especiales de un triángulo (medianas, alturas, mediatrices y bisectrices) se cortan, de a tres, en un único punto:
          </p>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              ['baricentro', 'Baricentro'],
              ['ortocentro', 'Ortocentro'],
              ['circuncentro', 'Circuncentro'],
              ['incentro', 'Incentro'],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                aria-pressed={puntoNotable === id}
                onClick={() => setPuntoNotable(id)}
                className={`min-h-11 rounded-xl p-2 text-center text-sm transition ${
                  puntoNotable === id
                    ? 'bg-teal-600 font-bold text-white shadow-sm'
                    : 'border border-slate-200 bg-white font-medium text-slate-700 active:bg-slate-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-slate-500">Probá con otro triángulo:</span>
            {PRESETS.map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => aplicarPreset(id)}
                className="min-h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 active:bg-slate-100"
              >
                {label}
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm select-none">
            <svg
              viewBox={`${vbX0} ${vbY0} ${vbX1 - vbX0} ${vbY1 - vbY0}`}
              className="mx-auto w-full max-w-sm"
              role="img"
              aria-label="Visualización de puntos notables"
            >
              <polygon points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`} fill="#f8fafc" stroke="#334155" strokeWidth="2" strokeLinejoin="round" />

              {/* Baricentro: las 3 medianas (de cada vértice al punto medio del lado opuesto) */}
              {puntoNotable === 'baricentro' && (
                <>
                  {[[A, mBC], [B, mAC], [C, mAB]].map(([v, m], k) => (
                    <line key={k} x1={v.x} y1={v.y} x2={m.x} y2={m.y} stroke="#0d9488" strokeWidth="1.5" strokeDasharray="4 3" />
                  ))}
                  <circle cx={bariX} cy={bariY} r="6" fill="#0f766e" />
                  <text x={bariX} y={bariY - 10} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#0f766e">G</text>
                </>
              )}

              {/* Ortocentro: las 3 alturas (si el pie cae afuera, el lado se prolonga con puntos) */}
              {puntoNotable === 'ortocentro' && (
                <>
                  {alturas.map(({ v, p, lado }, k) => (
                    <g key={k}>
                      {(p.t < 0 || p.t > 1) && (
                        <line
                          x1={(p.t < 0 ? lado[0] : lado[1]).x}
                          y1={(p.t < 0 ? lado[0] : lado[1]).y}
                          x2={p.x}
                          y2={p.y}
                          stroke="#94a3b8"
                          strokeWidth="1.5"
                          strokeDasharray="2 3"
                        />
                      )}
                      <line x1={v.x} y1={v.y} x2={p.x} y2={p.y} stroke="#e11d48" strokeWidth="1.5" strokeDasharray="4 3" />
                    </g>
                  ))}
                  <circle cx={ortoX} cy={ortoY} r="6" fill="#be123c" />
                  <text x={ortoX} y={ortoY - 10} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#be123c">H</text>
                </>
              )}

              {/* Circuncentro: las 3 mediatrices (perpendiculares por los puntos medios) y la circunferencia */}
              {puntoNotable === 'circuncentro' && (
                <>
                  {radioCircun < 1500 && (
                    <circle cx={circunX} cy={circunY} r={radioCircun} fill="none" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="5 4" />
                  )}
                  {[mAB, mBC, mAC].map((m, k) => (
                    <line key={k} x1={m.x} y1={m.y} x2={circunX} y2={circunY} stroke="#0284c7" strokeWidth="1.5" strokeDasharray="4 3" />
                  ))}
                  <circle cx={circunX} cy={circunY} r="6" fill="#0284c7" />
                  <text x={circunX} y={circunY - 10} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#0284c7">O</text>
                </>
              )}

              {/* Incentro: las 3 bisectrices y la circunferencia inscripta */}
              {puntoNotable === 'incentro' && (
                <>
                  <circle cx={incentroX} cy={incentroY} r={radioIn} fill="none" stroke="#7c3aed" strokeWidth="1.5" />
                  {bisectrices.map(({ v, p }, k) => (
                    <line key={k} x1={v.x} y1={v.y} x2={p.x} y2={p.y} stroke="#7c3aed" strokeWidth="1.5" strokeDasharray="4 3" />
                  ))}
                  <circle cx={incentroX} cy={incentroY} r="6" fill="#6d28d9" />
                  <text x={incentroX} y={incentroY - 10} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#6d28d9">I</text>
                </>
              )}

              {[A, B, C].map((P, k) => (
                <circle key={k} cx={P.x} cy={P.y} r="4" fill="#0f172a" />
              ))}
            </svg>

            <div className="mt-2 space-y-1 text-center text-sm text-slate-700">
              {puntoNotable === 'baricentro' && <p><strong>Baricentro (G):</strong> corte de las 3 medianas. Es el centro de gravedad del triángulo.</p>}
              {puntoNotable === 'ortocentro' && <p><strong>Ortocentro (H):</strong> corte de las 3 alturas (perpendiculares a cada lado).</p>}
              {puntoNotable === 'circuncentro' && <p><strong>Circuncentro (O):</strong> corte de las 3 mediatrices. Es el centro de la circunferencia que pasa por los tres vértices.</p>}
              {puntoNotable === 'incentro' && <p><strong>Incentro (I):</strong> corte de las 3 bisectrices. Es el centro de la circunferencia inscripta, tangente a los tres lados.</p>}
              {!puntoDentro && (
                <p className="rounded-lg bg-amber-50 p-2 text-amber-900">
                  Fijate: acá el punto quedó <strong>fuera del triángulo</strong>. Les pasa al ortocentro y al circuncentro de los obtusángulos.
                </p>
              )}
            </div>
          </div>

          <p className="text-sm text-slate-500">
            Para mover los vértices a mano, volvé al paso 1. Tocá el botón para guardar tu progreso y volver al menú principal.
          </p>
        </div>
      ),
    },
  ];

  return (
    <ModuloLayout titulo="Triángulos" icono="🔺" onVolver={onVolver}>
      <StepNav pasos={pasos} onFinish={terminar} textoFinal="Terminar módulo ✓" />
    </ModuloLayout>
  );
}
