import { useState } from 'react';
import ModuloLayout from '../../components/ModuloLayout.jsx';
import StepNav from '../../components/StepNav.jsx';
import Slider from '../../components/Slider.jsx';
import Quiz from '../../components/Quiz.jsx';
import NumInput from '../../components/NumInput.jsx';
import Formula from '../../components/Formula.jsx';
import { useApp } from '../../context/AppContext.jsx';
import {
  perimetroRectangulo,
  areaRectangulo,
  areaTriangulo,
  areaParalelogramo,
  areaTrapecio,
  areaRombo,
  longitudCircunferencia,
  areaCirculo,
} from '../../utils/geometry.js';
import { texNum } from '../../utils/format.js';

// ---------- Datos de cada figura: parámetros (deslizadores) ----------
const FIGURAS_UI = {
  rectangulo: { nombre: 'Rectángulo', params: [
    { k: 'b', etiqueta: 'Base', min: 1, max: 12, def: 8 },
    { k: 'h', etiqueta: 'Altura', min: 1, max: 8, def: 5 },
  ] },
  triangulo: { nombre: 'Triángulo', params: [
    { k: 'b', etiqueta: 'Base', min: 1, max: 12, def: 8 },
    { k: 'h', etiqueta: 'Altura', min: 1, max: 8, def: 6 },
  ] },
  paralelogramo: { nombre: 'Paralelogramo', params: [
    { k: 'b', etiqueta: 'Base', min: 1, max: 10, def: 7 },
    { k: 'h', etiqueta: 'Altura', min: 1, max: 8, def: 4 },
    { k: 'x', etiqueta: 'Inclinación (corrimiento)', min: 0, max: 4, def: 2 },
  ] },
  trapecio: { nombre: 'Trapecio', params: [
    { k: 'B', etiqueta: 'Base mayor', min: 3, max: 12, def: 10 },
    { k: 'b', etiqueta: 'Base menor', min: 1, max: 11, def: 5 },
    { k: 'h', etiqueta: 'Altura', min: 1, max: 8, def: 4 },
  ] },
  rombo: { nombre: 'Rombo', params: [
    { k: 'D', etiqueta: 'Diagonal mayor', min: 2, max: 12, def: 10 },
    { k: 'd', etiqueta: 'Diagonal menor', min: 2, max: 8, def: 6 },
  ] },
  circulo: { nombre: 'Círculo', params: [
    { k: 'r', etiqueta: 'Radio', min: 1, max: 6, def: 4 },
  ] },
};

const ORDEN = ['rectangulo', 'triangulo', 'paralelogramo', 'trapecio', 'rombo', 'circulo'];
const S = 15; // píxeles por cm en los dibujos
const hip = (a, b) => Math.sqrt(a * a + b * b);
// "=" si el resultado tiene a lo sumo 2 decimales exactos; "≈" si fue redondeado
const ig = (v) => (Math.abs(v * 100 - Math.round(v * 100)) < 1e-7 ? '=' : '\\approx');

// Valores efectivos: el trapecio no puede tener base menor ≥ base mayor
const efectivos = (id, v) => (id === 'trapecio' ? { ...v, b: Math.min(v.b, v.B - 1) } : v);

// Geometría de cada figura (en cm, con y hacia arriba) + líneas auxiliares y rótulos
function geometria(id, v) {
  switch (id) {
    case 'rectangulo':
      return {
        pts: [[0, 0], [v.b, 0], [v.b, v.h], [0, v.h]],
        aux: [],
        rot: [{ x: v.b / 2, y: 0, dy: 16, t: `b = ${texNum(v.b).replace('{,}', ',')}` }, { x: v.b, y: v.h / 2, dx: 8, t: `h = ${texNum(v.h).replace('{,}', ',')}` }],
      };
    case 'triangulo':
      return {
        pts: [[0, 0], [v.b, 0], [v.b / 2, v.h]],
        aux: [[[v.b / 2, 0], [v.b / 2, v.h]]],
        rot: [{ x: v.b / 2, y: 0, dy: 16, t: 'b' }, { x: v.b / 2, y: v.h / 2, dx: 6, t: 'h' }],
      };
    case 'paralelogramo':
      return {
        pts: [[0, 0], [v.b, 0], [v.b + v.x, v.h], [v.x, v.h]],
        aux: [[[v.x, 0], [v.x, v.h]]],
        rot: [{ x: v.b / 2, y: 0, dy: 16, t: 'b' }, { x: v.x, y: v.h / 2, dx: 6, t: 'h' }],
      };
    case 'trapecio': {
      const o = (v.B - v.b) / 2;
      return {
        pts: [[0, 0], [v.B, 0], [v.B - o, v.h], [o, v.h]],
        aux: [[[o, 0], [o, v.h]]],
        rot: [
          { x: v.B / 2, y: 0, dy: 16, t: 'B' },
          { x: v.B / 2, y: v.h, dy: -8, t: 'b' },
          { x: o, y: v.h / 2, dx: 6, t: 'h' },
        ],
      };
    }
    case 'rombo':
      return {
        pts: [[0, v.d / 2], [v.D / 2, 0], [v.D, v.d / 2], [v.D / 2, v.d]],
        aux: [[[0, v.d / 2], [v.D, v.d / 2]], [[v.D / 2, 0], [v.D / 2, v.d]]],
        rot: [{ x: v.D * 0.75, y: v.d / 2, dy: -6, t: 'D' }, { x: v.D / 2, y: v.d * 0.75, dx: 6, t: 'd' }],
      };
    default:
      return { pts: [], aux: [], rot: [] };
  }
}

// Cálculo paso a paso: cada línea es LaTeX. Devuelve { lineasP, lineasA, P, A }
function calculo(id, vRaw, pi, piTex) {
  const v = efectivos(id, vRaw);
  const n = texNum;
  switch (id) {
    case 'rectangulo': {
      const P = perimetroRectangulo(v.b, v.h);
      const A = areaRectangulo(v.b, v.h);
      return {
        P, A,
        lineasP: ['P = 2 \\cdot (b + h)', `P = 2 \\cdot (${n(v.b)} + ${n(v.h)})`, `P = ${n(P)}\\ \\text{cm}`],
        lineasA: ['A = b \\cdot h', `A = ${n(v.b)} \\cdot ${n(v.h)}`, `A = ${n(A)}\\ \\text{cm}^2`],
      };
    }
    case 'triangulo': {
      const l = hip(v.b / 2, v.h);
      const P = v.b + 2 * l;
      const A = areaTriangulo(v.b, v.h);
      return {
        P, A,
        lineasP: [
          `\\text{Lado igual: } l = \\sqrt{(b/2)^2 + h^2} ${ig(l)} ${n(l)}\\ \\text{cm}`,
          'P = b + 2 \\cdot l',
          `P = ${n(v.b)} + 2 \\cdot ${n(l)}`,
          `P ${ig(P)} ${n(P)}\\ \\text{cm}`,
        ],
        lineasA: ['A = \\dfrac{b \\cdot h}{2}', `A = \\dfrac{${n(v.b)} \\cdot ${n(v.h)}}{2}`, `A = ${n(A)}\\ \\text{cm}^2`],
      };
    }
    case 'paralelogramo': {
      const l = hip(v.x, v.h);
      const P = 2 * (v.b + l);
      const A = areaParalelogramo(v.b, v.h);
      return {
        P, A,
        lineasP: [
          `\\text{Lado inclinado: } l = \\sqrt{x^2 + h^2} ${ig(l)} ${n(l)}\\ \\text{cm}`,
          'P = 2 \\cdot (b + l)',
          `P = 2 \\cdot (${n(v.b)} + ${n(l)})`,
          `P ${ig(P)} ${n(P)}\\ \\text{cm}`,
        ],
        lineasA: ['A = b \\cdot h', `A = ${n(v.b)} \\cdot ${n(v.h)}`, `A = ${n(A)}\\ \\text{cm}^2`],
      };
    }
    case 'trapecio': {
      const l = hip((v.B - v.b) / 2, v.h);
      const P = v.B + v.b + 2 * l;
      const A = areaTrapecio(v.B, v.b, v.h);
      return {
        P, A,
        lineasP: [
          `\\text{Lado no paralelo (trapecio isósceles): } l ${ig(l)} ${n(l)}\\ \\text{cm}`,
          'P = B + b + 2 \\cdot l',
          `P = ${n(v.B)} + ${n(v.b)} + 2 \\cdot ${n(l)}`,
          `P ${ig(P)} ${n(P)}\\ \\text{cm}`,
        ],
        lineasA: [
          'A = \\dfrac{(B + b) \\cdot h}{2}',
          `A = \\dfrac{(${n(v.B)} + ${n(v.b)}) \\cdot ${n(v.h)}}{2}`,
          `A = ${n(A)}\\ \\text{cm}^2`,
        ],
      };
    }
    case 'rombo': {
      const l = hip(v.D / 2, v.d / 2);
      const P = 4 * l;
      const A = areaRombo(v.D, v.d);
      return {
        P, A,
        lineasP: [
          `\\text{Lado: } l = \\sqrt{(D/2)^2 + (d/2)^2} ${ig(l)} ${n(l)}\\ \\text{cm}`,
          'P = 4 \\cdot l',
          `P ${ig(P)} 4 \\cdot ${n(l)} ${ig(P)} ${n(P)}\\ \\text{cm}`,
        ],
        lineasA: ['A = \\dfrac{D \\cdot d}{2}', `A = \\dfrac{${n(v.D)} \\cdot ${n(v.d)}}{2}`, `A = ${n(A)}\\ \\text{cm}^2`],
      };
    }
    default: {
      const P = longitudCircunferencia(v.r, pi);
      const A = areaCirculo(v.r, pi);
      const eq = piTex === '\\pi' ? '\\approx' : '=';
      return {
        P, A,
        lineasP: ['L = 2 \\cdot \\pi \\cdot r', `L = 2 \\cdot ${piTex} \\cdot ${n(v.r)}`, `L ${eq} ${n(P)}\\ \\text{cm}`],
        lineasA: ['A = \\pi \\cdot r^2', `A = ${piTex} \\cdot ${n(v.r)}^2`, `A ${eq} ${n(A)}\\ \\text{cm}^2`],
      };
    }
  }
}

function Dibujo({ id, v }) {
  const W = 240, H = 200;
  if (id === 'circulo') {
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto h-52 w-full max-w-xs" role="img" aria-label={`Círculo de radio ${v.r} cm`}>
        <circle cx={W / 2} cy={H / 2} r={v.r * S} fill="#99f6e4" fillOpacity="0.6" stroke="#0f766e" strokeWidth="3" />
        <line x1={W / 2} y1={H / 2} x2={W / 2 + v.r * S} y2={H / 2} stroke="#be123c" strokeWidth="3" />
        <circle cx={W / 2} cy={H / 2} r="3.5" fill="#0f172a" />
        <text x={W / 2 + (v.r * S) / 2} y={H / 2 - 7} textAnchor="middle" fontSize="14" fill="#be123c">r</text>
      </svg>
    );
  }
  const g = geometria(id, v);
  const xs = g.pts.map((p) => p[0]), ys = g.pts.map((p) => p[1]);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  const ox = (W - (maxX - minX) * S) / 2 - minX * S;
  const oy = (H + (maxY - minY) * S) / 2 + minY * S;
  const X = (x) => ox + x * S;
  const Y = (y) => oy - y * S;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto h-52 w-full max-w-xs" role="img" aria-label={`${FIGURAS_UI[id].nombre} dibujado a escala`}>
      <polygon points={g.pts.map(([x, y]) => `${X(x)},${Y(y)}`).join(' ')} fill="#99f6e4" fillOpacity="0.6" stroke="#0f766e" strokeWidth="3" strokeLinejoin="round" />
      {g.aux.map(([a, b], k) => (
        <line key={k} x1={X(a[0])} y1={Y(a[1])} x2={X(b[0])} y2={Y(b[1])} stroke="#be123c" strokeWidth="2" strokeDasharray="5 4" />
      ))}
      {g.rot.map((r, k) => (
        <text key={k} x={X(r.x) + (r.dx || 0)} y={Y(r.y) + (r.dy || 0)} textAnchor={r.dx ? 'start' : 'middle'} fontSize="13" fill="#0f172a">
          {r.t}
        </text>
      ))}
    </svg>
  );
}

// ---------- «Cortar y mover» ----------
function CortarYMover({ cual, t }) {
  const W = 260, H = 150, s = 15, ox = 20, oy = 125;
  const X = (x) => ox + x * s;
  const Y = (y) => oy - y * s;
  const poly = (pts, props) => <polygon points={pts.map(([x, y]) => `${X(x)},${Y(y)}`).join(' ')} {...props} />;

  if (cual === 'paralelogramo') {
    const b = 8, h = 5, x = 3; // trozo triangular de la izquierda se corre b·t hacia la derecha
    const dx = b * t;
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-sm" role="img" aria-label="Paralelogramo que se transforma en rectángulo">
        {poly([[x, 0], [b, 0], [b + x, h], [x, h]], { fill: '#99f6e4', stroke: '#0f766e', strokeWidth: 2.5, strokeLinejoin: 'round' })}
        {poly([[0 + dx, 0], [x + dx, 0], [x + dx, h]], { fill: '#fbbf24', fillOpacity: 0.85, stroke: '#b45309', strokeWidth: 2.5, strokeLinejoin: 'round' })}
        <line x1={X(x)} y1={Y(0)} x2={X(x)} y2={Y(h)} stroke="#be123c" strokeWidth="1.5" strokeDasharray="4 3" />
        <text x={X(b / 2 + x / 2)} y={Y(0) + 16} textAnchor="middle" fontSize="12" fill="#334155">base</text>
        <text x={X(b + x) + 6} y={Y(h / 2)} fontSize="12" fill="#334155">altura</text>
      </svg>
    );
  }
  // Triángulo: una copia girada 180° alrededor del punto medio de un lado forma un paralelogramo
  const b = 8, h = 5, p = 3;
  const mx = (b + p) / 2, my = h / 2;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-sm" role="img" aria-label="Dos triángulos iguales forman un paralelogramo">
      {poly([[0, 0], [b, 0], [p, h]], { fill: '#99f6e4', stroke: '#0f766e', strokeWidth: 2.5, strokeLinejoin: 'round' })}
      <g transform={`rotate(${-180 * t} ${X(mx)} ${Y(my)})`}>
        {poly([[0, 0], [b, 0], [p, h]], { fill: '#fbbf24', fillOpacity: 0.8, stroke: '#b45309', strokeWidth: 2.5, strokeLinejoin: 'round' })}
      </g>
      <circle cx={X(mx)} cy={Y(my)} r="3.5" fill="#0f172a" />
    </svg>
  );
}

// Rectángulos de área 24 cm² (base × altura)
const PARES_24 = [[24, 1], [12, 2], [8, 3], [6, 4]];

export default function PerimetroArea({ onVolver }) {
  const { pi, piEscolar, marcarCompletado } = useApp();
  const piTex = piEscolar ? '3{,}14' : '\\pi';

  const [fig, setFig] = useState('rectangulo');
  const [vals, setVals] = useState(() =>
    Object.fromEntries(ORDEN.map((id) => [id, Object.fromEntries(FIGURAS_UI[id].params.map((p) => [p.k, p.def]))]))
  );
  const [numOk, setNumOk] = useState(false);

  const [cual, setCual] = useState('paralelogramo');
  const [t, setT] = useState(0);
  const [quizCortarOk, setQuizCortarOk] = useState(false);

  const [par, setPar] = useState(1);
  const [quizPerimetroOk, setQuizPerimetroOk] = useState(false);

  const terminar = () => {
    marcarCompletado('perimetro-area');
    onVolver();
  };

  const cambiar = (k, valor) => setVals((p) => ({ ...p, [fig]: { ...p[fig], [k]: valor } }));
  const vRaw = vals[fig];
  const v = efectivos(fig, vRaw);
  const { lineasP, lineasA } = calculo(fig, vRaw, pi, piTex);

  const [pb, ph] = PARES_24[par];
  const CELDA = 9;

  const pasos = [
    {
      titulo: 'Perímetro y área de cada figura',
      bloqueado: !numOk,
      contenido: (
        <>
          <div className="grid grid-cols-3 gap-2" role="group" aria-label="Elegí una figura">
            {ORDEN.map((id) => (
              <button
                key={id}
                type="button"
                aria-pressed={fig === id}
                onClick={() => setFig(id)}
                className={`min-h-11 rounded-xl border-2 px-2 text-sm font-semibold transition ${
                  fig === id ? 'border-teal-600 bg-teal-600 text-white' : 'border-slate-200 bg-white text-slate-700 active:bg-slate-100'
                }`}
              >
                {FIGURAS_UI[id].nombre}
              </button>
            ))}
          </div>

          <Dibujo id={fig} v={v} />

          <div className="space-y-2">
            {FIGURAS_UI[fig].params.map((p) => (
              <Slider
                key={p.k}
                etiqueta={p.etiqueta}
                valor={fig === 'trapecio' && p.k === 'b' ? v.b : vRaw[p.k]}
                onChange={(x) => cambiar(p.k, x)}
                min={p.min}
                max={fig === 'trapecio' && p.k === 'b' ? Math.max(p.min, v.B - 1) : p.max}
                paso={fig === 'circulo' ? 0.5 : 1}
                unidad="cm"
                decimales={fig === 'circulo' ? 1 : 0}
              />
            ))}
          </div>

          <div className="rounded-xl bg-white p-3">
            <p className="text-sm font-semibold text-slate-500">{fig === 'circulo' ? 'Longitud (perímetro)' : 'Perímetro'}</p>
            {lineasP.map((l, k) => <Formula key={k} block tex={l} />)}
            <p className="mt-2 text-sm font-semibold text-slate-500">Área</p>
            {lineasA.map((l, k) => <Formula key={k} block tex={l} />)}
          </div>

          <NumInput
            etiqueta="Un triángulo tiene base 6 cm y altura 4 cm. ¿Cuál es su área?"
            unidad="cm²"
            correcto={areaTriangulo(6, 4)}
            pista="Base por altura, dividido 2."
            onResultado={() => setNumOk(true)}
          />
        </>
      ),
    },
    {
      titulo: 'De dónde salen las fórmulas',
      bloqueado: !quizCortarOk,
      contenido: (
        <>
          <div className="grid grid-cols-2 gap-2" role="group" aria-label="Elegí una animación">
            {[['paralelogramo', 'Paralelogramo'], ['triangulo', 'Triángulo']].map(([id, nombre]) => (
              <button
                key={id}
                type="button"
                aria-pressed={cual === id}
                onClick={() => { setCual(id); setT(0); }}
                className={`min-h-11 rounded-xl border-2 px-2 font-semibold ${
                  cual === id ? 'border-teal-600 bg-teal-600 text-white' : 'border-slate-200 bg-white text-slate-700'
                }`}
              >
                {nombre}
              </button>
            ))}
          </div>

          <p className="text-slate-600">
            {cual === 'paralelogramo'
              ? 'Cortá el trozo triangular y movelo hacia la derecha con el deslizador.'
              : 'Girá una copia del triángulo con el deslizador: juntos forman un paralelogramo.'}
          </p>

          <CortarYMover cual={cual} t={t} />
          <Slider
            etiqueta={cual === 'paralelogramo' ? 'Mover el trozo' : 'Girar la copia'}
            valor={Math.round(t * 100)}
            onChange={(x) => setT(x / 100)}
            min={0}
            max={100}
            paso={5}
            unidad="%"
          />

          {t === 1 && (
            <div className="rounded-xl border border-teal-200 bg-teal-50 p-3 text-teal-900">
              {cual === 'paralelogramo' ? (
                <>
                  <p>¡Se formó un <strong>rectángulo</strong> con la misma base y la misma altura!</p>
                  <Formula tex={'A_{\\text{paralelogramo}} = A_{\\text{rectángulo}} = b \\cdot h'} block />
                </>
              ) : (
                <>
                  <p>Dos triángulos iguales forman un <strong>paralelogramo</strong> de área b · h.</p>
                  <Formula tex={'A_{\\text{triángulo}} = \\dfrac{b \\cdot h}{2}'} block />
                </>
              )}
            </div>
          )}

          <Quiz
            pregunta="Un paralelogramo tiene base 8 cm y altura 5 cm, pero su lado inclinado mide 6 cm. ¿Cuál es su área?"
            opciones={['40 cm²', '48 cm²', '30 cm²']}
            correcta={0}
            explicacion="El área usa la altura (perpendicular a la base), no el lado inclinado: 8 · 5 = 40 cm²."
            onResolver={() => setQuizCortarOk(true)}
          />
        </>
      ),
    },
    {
      titulo: 'Misma área, distinto perímetro',
      bloqueado: !quizPerimetroOk,
      contenido: (
        <>
          <p className="text-slate-600">
            Todos estos rectángulos tienen <strong>24 cuadraditos</strong> de área. Elegí uno y mirá su perímetro.
          </p>
          <div className="grid grid-cols-4 gap-2" role="group" aria-label="Elegí un rectángulo">
            {PARES_24.map(([b, h], k) => (
              <button
                key={k}
                type="button"
                aria-pressed={par === k}
                onClick={() => setPar(k)}
                className={`min-h-11 rounded-xl border-2 text-sm font-semibold ${
                  par === k ? 'border-teal-600 bg-teal-600 text-white' : 'border-slate-200 bg-white text-slate-700'
                }`}
              >
                {b} × {h}
              </button>
            ))}
          </div>

          <svg viewBox="0 0 240 60" className="mx-auto w-full max-w-sm" role="img" aria-label={`Rectángulo de ${pb} por ${ph} cuadraditos`}>
            {Array.from({ length: ph }).flatMap((_, fila) =>
              Array.from({ length: pb }).map((__, col) => (
                <rect
                  key={`${fila}-${col}`}
                  x={12 + col * CELDA}
                  y={8 + fila * CELDA}
                  width={CELDA}
                  height={CELDA}
                  fill="#99f6e4"
                  stroke="#0f766e"
                  strokeWidth="0.8"
                />
              ))
            )}
          </svg>

          <div className="rounded-xl bg-white p-3">
            <Formula block tex={`A = ${pb} \\cdot ${ph} = ${pb * ph}\\ \\text{cm}^2`} />
            <Formula block tex={`P = 2 \\cdot (${pb} + ${ph}) = ${perimetroRectangulo(pb, ph)}\\ \\text{cm}`} />
          </div>

          <table className="w-full text-center text-sm">
            <thead>
              <tr className="text-slate-500"><th>Rectángulo</th><th>Área</th><th>Perímetro</th></tr>
            </thead>
            <tbody>
              {PARES_24.map(([b, h], k) => (
                <tr key={k} className={k === par ? 'bg-teal-50 font-bold' : ''}>
                  <td>{b} × {h}</td>
                  <td>{b * h} cm²</td>
                  <td>{perimetroRectangulo(b, h)} cm</td>
                </tr>
              ))}
            </tbody>
          </table>

          <Quiz
            pregunta="Con la misma área (24 cm²), ¿qué rectángulo tiene el MENOR perímetro?"
            opciones={['24 × 1', '12 × 2', '8 × 3', '6 × 4']}
            correcta={3}
            explicacion="Cuanto más se parece a un cuadrado, menor es el perímetro: 6 × 4 tiene 20 cm."
            onResolver={() => setQuizPerimetroOk(true)}
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
            <li>El perímetro se mide en cm; el área, en cm².</li>
            <li>La altura es perpendicular a la base: no es el lado inclinado.</li>
            <li>Triángulo = la mitad de un paralelogramo.</li>
            <li>Dos figuras con la misma área pueden tener distinto perímetro.</li>
          </ul>
        </div>
      ),
    },
  ];

  return (
    <ModuloLayout titulo="Perímetro y área" icono="📐" onVolver={onVolver}>
      <StepNav pasos={pasos} onFinish={terminar} textoFinal="Terminar ✓" />
    </ModuloLayout>
  );
}
