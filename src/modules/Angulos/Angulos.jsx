import { useState } from 'react';
import ModuloLayout from '../../components/ModuloLayout.jsx';
import StepNav from '../../components/StepNav.jsx';
import Slider from '../../components/Slider.jsx';
import Quiz from '../../components/Quiz.jsx';
import NumInput from '../../components/NumInput.jsx';
import Formula from '../../components/Formula.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { clasificarAngulo, complemento, suplemento } from '../../utils/geometry.js';
import { fmt, texNum } from '../../utils/format.js';

export default function Angulos({ onVolver }) {
  const { marcarCompletado } = useApp();

  // Paso 1: Transportador
  const [angulo1, setAngulo1] = useState(60);
  const [quiz1Ok, setQuiz1Ok] = useState(false);

  // Paso 2: Complementarios / Suplementarios
  const [tipoPares, setTipoPares] = useState('complementarios'); // 'complementarios' | 'suplementarios'
  const [anguloAlfa, setAnguloAlfa] = useState(35);
  const [num2Ok, setNum2Ok] = useState(false);

  // Paso 3: Paralelas cortadas por transversal
  const [inclinacion, setInclinacion] = useState(55);
  const [relacionSeleccionada, setRelacionSeleccionada] = useState('alternos-internos');
  const [quiz3Ok, setQuiz3Ok] = useState(false);

  const terminar = () => {
    marcarCompletado('angulos');
    onVolver();
  };

  // ----- Cálculos Paso 1 -----
  const tipoAngulo1 = clasificarAngulo(angulo1);
  const rad1 = (angulo1 * Math.PI) / 180;
  // Centro del transportador en (160, 160), radio 120. El ángulo se mide desde el lado fijo
  // (a la derecha) en sentido antihorario, igual que la escala de grados.
  const cx1 = 160;
  const cy1 = 160;
  const dArco1 = `M ${cx1 + 45} ${cy1} A 45 45 0 0 0 ${cx1 + 45 * Math.cos(-rad1)} ${cy1 + 45 * Math.sin(-rad1)}`;

  const badgeColor1 =
    tipoAngulo1 === 'agudo' ? 'bg-sky-100 text-sky-800 border-sky-300'
    : tipoAngulo1 === 'recto' ? 'bg-emerald-100 text-emerald-800 border-emerald-400'
    : tipoAngulo1 === 'obtuso' ? 'bg-amber-100 text-amber-800 border-amber-300'
    : tipoAngulo1 === 'llano' ? 'bg-purple-100 text-purple-800 border-purple-300'
    : 'bg-slate-100 text-slate-800 border-slate-300';

  const definicion1 =
    tipoAngulo1 === 'agudo' ? 'Mide más de 0° y menos de 90°.'
    : tipoAngulo1 === 'recto' ? 'Mide exactamente 90°. Sus lados son perpendiculares.'
    : tipoAngulo1 === 'obtuso' ? 'Mide más de 90° y menos de 180°.'
    : tipoAngulo1 === 'llano' ? 'Mide exactamente 180°. Sus lados forman una recta.'
    : 'Ángulo especial.';

  // ----- Cálculos Paso 2 -----
  const esComp = tipoPares === 'complementarios';
  const anguloBeta = esComp ? complemento(anguloAlfa) : suplemento(anguloAlfa);
  const totalPares = esComp ? 90 : 180;
  const radAlfa = (anguloAlfa * Math.PI) / 180;
  const radTotal = (totalPares * Math.PI) / 180;

  // Dibujo adyacente en (160, 160)
  const rPares = 110;
  const xAlfa = 160 + rPares * Math.cos(-radAlfa);
  const yAlfa = 160 + rPares * Math.sin(-radAlfa);
  const xTotal = 160 + rPares * Math.cos(-radTotal);
  const yTotal = 160 + rPares * Math.sin(-radTotal);

  // Arcos
  const dArcoAlfa = `M ${160 + 50} 160 A 50 50 0 0 0 ${160 + 50 * Math.cos(-radAlfa)} ${160 + 50 * Math.sin(-radAlfa)} L 160 160 Z`;
  const dArcoBeta = `M ${160 + 55 * Math.cos(-radAlfa)} ${160 + 55 * Math.sin(-radAlfa)} A 55 55 0 ${esComp ? 0 : anguloBeta > 180 ? 1 : 0} 0 ${160 + 55 * Math.cos(-radTotal)} ${160 + 55 * Math.sin(-radTotal)} L 160 160 Z`;

  // ----- Cálculos Paso 3 -----
  // Los ángulos 1 al 8 se numeran así: los impares son agudos (miden `inclinacion`)
  // y los pares son obtusos (miden 180° − `inclinacion`).
  const medida = (n) => (n % 2 === 1 ? inclinacion : 180 - inclinacion);

  // Destacar pares según relación
  const paresRelacion = {
    'opuestos': { pares: [[1, 3], [2, 4], [5, 7], [6, 8]], texto: 'Los ángulos opuestos por el vértice son iguales.', iguales: true },
    'correspondientes': { pares: [[1, 5], [2, 6], [3, 7], [4, 8]], texto: 'Están en la misma posición relativa respecto al cruce: son iguales.', iguales: true },
    'alternos-internos': { pares: [[3, 5], [4, 6]], texto: 'Entre las paralelas, a lados opuestos de la transversal: son iguales.', iguales: true },
    'alternos-externos': { pares: [[1, 7], [2, 8]], texto: 'Fuera de las paralelas, a lados opuestos de la transversal: son iguales.', iguales: true },
    'conjugados-internos': { pares: [[3, 6], [4, 5]], texto: 'Del mismo lado entre las paralelas: son suplementarios (suman 180°).', iguales: false },
  };

  const relActual = paresRelacion[relacionSeleccionada];
  const angulosResaltados = relActual.pares.flat();

  const pasos = [
    {
      titulo: '1. Transportador y clasificación',
      bloqueado: !quiz1Ok,
      contenido: (
        <>
          <p className="text-slate-600">
            Un <strong>ángulo</strong> es la abertura entre dos semirrectas con un origen común (el vértice).
            Mové el deslizador para ver cómo cambia y cómo se llama:
          </p>

          <Slider
            etiqueta="Abertura del ángulo"
            valor={angulo1}
            onChange={setAngulo1}
            min={5}
            max={180}
            paso={5}
            unidad="°"
          />

          <div className="relative rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <svg viewBox="0 0 320 200" className="mx-auto w-full max-w-sm" role="img" aria-label={`Transportador mostrando ángulo de ${angulo1}°`}>
              {/* Transportador de fondo */}
              <path
                d="M 40 160 A 120 120 0 0 1 280 160 Z"
                fill="#f8fafc"
                stroke="#cbd5e1"
                strokeWidth="2"
              />
              {/* Marcas de grados */}
              {[0, 30, 45, 60, 90, 120, 135, 150, 180].map((g) => {
                // La escala crece en sentido antihorario desde la derecha, igual que la aguja
                const rad = (g * Math.PI) / 180;
                const x1 = 160 + 120 * Math.cos(rad);
                const y1 = 160 - 120 * Math.sin(rad);
                const x2 = 160 + 108 * Math.cos(rad);
                const y2 = 160 - 108 * Math.sin(rad);
                const xText = 160 + 95 * Math.cos(rad);
                const yText = 160 - 95 * Math.sin(rad);
                return (
                  <g key={g}>
                    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#94a3b8" strokeWidth={g % 90 === 0 ? '2' : '1'} />
                    <text x={xText} y={yText + 3} textAnchor="middle" fontSize="9" fill="#64748b" className="font-mono">
                      {g}°
                    </text>
                  </g>
                );
              })}

              {/* Lado inicial (fijo en horizontal a la derecha) */}
              <line x1="160" y1="160" x2="280" y2="160" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />

              {/* Sector sombreado del ángulo */}
              {angulo1 > 0 && (
                <path
                  d={`M 160 160 L 280 160 A 120 120 0 0 0 ${160 + 120 * Math.cos(-rad1)} ${160 + 120 * Math.sin(-rad1)} Z`}
                  fill={angulo1 === 90 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(13, 148, 136, 0.18)'}
                />
              )}

              {/* Lado terminal (móvil) */}
              <line
                x1="160"
                y1="160"
                x2={160 + 120 * Math.cos(-rad1)}
                y2={160 + 120 * Math.sin(-rad1)}
                stroke="#0f766e"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Indicador de ángulo recto (cuadrado) */}
              {angulo1 === 90 ? (
                <path d="M 180 160 L 180 140 L 160 140" fill="none" stroke="#059669" strokeWidth="2.5" />
              ) : (
                <path d={dArco1} fill="none" stroke="#0d9488" strokeWidth="2" strokeDasharray="3,3" />
              )}

              {/* Vértice central */}
              <circle cx="160" cy="160" r="5" fill="#0f766e" />
              <text x="160" y="180" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#0f172a">
                Vértice
              </text>
            </svg>

            {/* Clasificación en vivo */}
            <div className="mt-2 flex flex-col items-center justify-center text-center">
              <span className={`inline-block rounded-full border px-4 py-1 text-base font-bold uppercase tracking-wide ${badgeColor1}`}>
                Ángulo {tipoAngulo1} ({angulo1}°)
              </span>
              <p className="mt-1 text-sm text-slate-600">{definicion1}</p>
            </div>
          </div>

          <Quiz
            pregunta="¿Cómo se clasifica un ángulo que mide exactamente 90°?"
            opciones={['Agudo', 'Recto', 'Obtuso', 'Llano']}
            correcta={1}
            explicacion="El ángulo recto mide exactamente 90° y sus lados son perpendiculares."
            onResolver={() => setQuiz1Ok(true)}
          />
        </>
      ),
    },
    {
      titulo: '2. Complementarios y suplementarios',
      bloqueado: !num2Ok,
      contenido: (
        <>
          <p className="text-slate-600">
            Dos ángulos son <strong>adyacentes</strong> cuando comparten el vértice y un lado común:
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setTipoPares('complementarios');
                setAnguloAlfa(35);
              }}
              className={`h-11 flex-1 rounded-xl font-semibold transition ${
                esComp ? 'bg-teal-600 text-white shadow-sm' : 'border border-slate-200 bg-white text-slate-700'
              }`}
            >
              Complementarios (suman 90°)
            </button>
            <button
              type="button"
              onClick={() => {
                setTipoPares('suplementarios');
                setAnguloAlfa(70);
              }}
              className={`h-11 flex-1 rounded-xl font-semibold transition ${
                !esComp ? 'bg-teal-600 text-white shadow-sm' : 'border border-slate-200 bg-white text-slate-700'
              }`}
            >
              Suplementarios (suman 180°)
            </button>
          </div>

          <Slider
            etiqueta="Ángulo α"
            valor={anguloAlfa}
            onChange={setAnguloAlfa}
            min={5}
            max={esComp ? 85 : 175}
            paso={5}
            unidad="°"
          />

          <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <svg viewBox="0 0 320 200" className="mx-auto w-full max-w-sm" role="img" aria-label={`Ángulos ${tipoPares}`}>
              {/* Lado base (horizontal) */}
              <line x1="160" y1="160" x2={160 + rPares} y2="160" stroke="#334155" strokeWidth="2.5" />
              {/* Lado extremo (vertical si complementario, horizontal izq si suplementario) */}
              <line x1="160" y1="160" x2={xTotal} y2={yTotal} stroke="#334155" strokeWidth="2.5" strokeDasharray="4,4" />
              {/* Lado compartido móvil */}
              <line x1="160" y1="160" x2={xAlfa} y2={yAlfa} stroke="#0f766e" strokeWidth="3" />

              {/* Sectores coloreados */}
              <path d={dArcoAlfa} fill="rgba(20, 184, 166, 0.25)" stroke="#0d9488" strokeWidth="1.5" />
              <path d={dArcoBeta} fill="rgba(245, 158, 11, 0.25)" stroke="#d97706" strokeWidth="1.5" />

              {/* Etiquetas */}
              <text x={160 + 35 * Math.cos(-radAlfa / 2)} y={160 + 35 * Math.sin(-radAlfa / 2) + 4} textAnchor="middle" fontSize="13" fontWeight="bold" fill="#0f766e">
                α ({anguloAlfa}°)
              </text>
              <text
                x={160 + 40 * Math.cos(-(radAlfa + radTotal) / 2)}
                y={160 + 40 * Math.sin(-(radAlfa + radTotal) / 2) + 4}
                textAnchor="middle"
                fontSize="13"
                fontWeight="bold"
                fill="#b45309"
              >
                β ({anguloBeta}°)
              </text>

              <circle cx="160" cy="160" r="4" fill="#0f172a" />
            </svg>

            <div className="rounded-xl bg-slate-50 p-3 text-center">
              <Formula block tex={`\\alpha + \\beta = ${totalPares}^\\circ`} />
              <Formula block tex={`${texNum(anguloAlfa)}^\\circ + ${texNum(anguloBeta)}^\\circ = ${totalPares}^\\circ`} />
              <p className="mt-1 text-sm text-slate-600">
                El {esComp ? 'complemento' : 'suplemento'} de {anguloAlfa}° es <strong>{anguloBeta}°</strong>.
              </p>
            </div>
          </div>

          <NumInput
            key={tipoPares}
            etiqueta={
              esComp
                ? 'Si un ángulo mide 35°, ¿cuánto mide su ángulo complementario?'
                : 'Si un ángulo mide 70°, ¿cuánto mide su ángulo suplementario?'
            }
            unidad="°"
            correcto={esComp ? 55 : 110}
            pista={esComp ? 'Restá: 90° − 35°.' : 'Restá: 180° − 70°.'}
            onResultado={({ correcto }) => correcto && setNum2Ok(true)}
          />
        </>
      ),
    },
    {
      titulo: '3. Paralelas cortadas por una transversal',
      bloqueado: !quiz3Ok,
      contenido: (
        <>
          <p className="text-slate-600">
            Al cortar dos rectas paralelas con una recta transversal se forman <strong>8 ángulos</strong>,
            pero ¡solo hay <strong>dos medidas posibles</strong>!
          </p>

          <Slider
            etiqueta="Inclinación transversal"
            valor={inclinacion}
            onChange={setInclinacion}
            min={40}
            max={75}
            paso={5}
            unidad="°"
          />

          <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <svg viewBox="0 0 320 230" className="mx-auto w-full max-w-sm" role="img" aria-label="Paralelas cortadas por transversal con 8 ángulos">
              {/* Rectas paralelas L1 y L2 */}
              <line x1="20" y1="75" x2="300" y2="75" stroke="#475569" strokeWidth="2.5" />
              <text x="305" y="79" fontSize="12" fontWeight="bold" fill="#475569">L₁</text>
              <line x1="20" y1="165" x2="300" y2="165" stroke="#475569" strokeWidth="2.5" />
              <text x="305" y="169" fontSize="12" fontWeight="bold" fill="#475569">L₂</text>

              {/* Transversal T */}
              {/* Transversal T («/»): pasa por (160, 120) y forma `inclinacion` con las paralelas */}
              {(() => {
                const phi = inclinacion; // ángulo agudo que forma T con las paralelas
                const rad = (phi * Math.PI) / 180;
                const cot = 1 / Math.tan(rad);
                // T sube hacia la derecha («/»): x = 160 + (120 − y) · cot   (y crece hacia abajo)
                const xEn = (y) => 160 + (120 - y) * cot;
                const xArriba = xEn(15);
                const xAbajo = xEn(225);

                // En cada cruce hay 4 ángulos. Se miden en sentido antihorario desde la derecha:
                //   sup-der [0°, φ] agudo · sup-izq [φ, 180°] obtuso
                //   inf-izq [180°, 180°+φ] agudo · inf-der [180°+φ, 360°] obtuso
                // Arriba (cruce con L₁) van el 1 al 4 y abajo (cruce con L₂) el 5 al 8.
                // Cada número se dibuja sobre la bisectriz de su sector.
                const sectores = [
                  { k: 0, ini: 0, fin: phi, agudo: true },
                  { k: 1, ini: phi, fin: 180, agudo: false },
                  { k: 2, ini: 180, fin: 180 + phi, agudo: true },
                  { k: 3, ini: 180 + phi, fin: 360, agudo: false },
                ];
                const angulosData = [
                  { x: xEn(75), y: 75, base: 1 },
                  { x: xEn(165), y: 165, base: 5 },
                ].flatMap(({ x, y, base }) =>
                  sectores.map(({ k, ini, fin, agudo }) => {
                    const mitad = (((ini + fin) / 2) * Math.PI) / 180;
                    return { num: base + k, x: x + 36 * Math.cos(mitad), y: y - 36 * Math.sin(mitad), agudo };
                  })
                );

                return (
                  <>
                    <line x1={xArriba} y1="15" x2={xAbajo} y2="225" stroke="#0f766e" strokeWidth="3" />
                    <text x={xArriba + 8} y="22" fontSize="12" fontWeight="bold" fill="#0f766e">T</text>

                    {angulosData.map(({ num, x, y, agudo }) => {
                      const destacado = angulosResaltados.includes(num);
                      const bg = agudo ? '#0d9488' : '#d97706';
                      return (
                        <g key={num}>
                          {destacado && (
                            <circle cx={x} cy={y} r="14" fill="none" stroke="#2563eb" strokeWidth="3" strokeDasharray="3,3" />
                          )}
                          <circle cx={x} cy={y} r="11" fill={bg} />
                          <text x={x} y={y + 4} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#ffffff">
                            {num}
                          </text>
                        </g>
                      );
                    })}
                  </>
                );
              })()}
            </svg>

            {/* Clasificación de relaciones */}
            <div className="mt-3 space-y-2">
              <span className="text-xs font-semibold uppercase text-slate-500">Tocá una relación para explorar:</span>
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                {[
                  ['alternos-internos', 'Alternos internos'],
                  ['correspondientes', 'Correspondientes'],
                  ['opuestos', 'Opuestos por el vértice'],
                  ['alternos-externos', 'Alternos externos'],
                  ['conjugados-internos', 'Conjugados internos'],
                ].map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setRelacionSeleccionada(id)}
                    className={`rounded-lg px-2 py-1.5 text-xs font-semibold transition ${
                      relacionSeleccionada === id
                        ? 'bg-blue-600 text-white'
                        : 'border border-slate-200 bg-slate-50 text-slate-700 active:bg-slate-100'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3 text-sm text-blue-900">
                <p className="font-semibold">{relActual.texto}</p>
                <p className="mt-1">
                  {relActual.pares
                    .map(([a, b]) =>
                      relActual.iguales
                        ? `${a} y ${b}: ${medida(a)}° y ${medida(b)}°`
                        : `${a} y ${b}: ${medida(a)}° + ${medida(b)}° = 180°`
                    )
                    .join(' · ')}
                </p>
              </div>
            </div>
          </div>

          <Quiz
            pregunta="Si dos rectas paralelas están cortadas por una transversal, ¿cómo son los ángulos alternos internos?"
            opciones={['Son iguales', 'Suman 90°', 'Uno es el doble del otro', 'No tienen ninguna relación']}
            correcta={0}
            explicacion="Los ángulos alternos internos tienen la misma amplitud porque las rectas son paralelas."
            onResolver={() => setQuiz3Ok(true)}
          />
        </>
      ),
    },
    {
      titulo: '4. ¡Resumen de ángulos!',
      contenido: (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <h3 className="text-lg font-bold text-teal-800">Lo que aprendiste en este módulo:</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-700">
              <li>
                <strong>Clasificación:</strong> Agudo (&lt; 90°), Recto (= 90°), Obtuso (&gt; 90° y &lt; 180°) y Llano (= 180°).
              </li>
              <li>
                <strong>Pares de ángulos:</strong>
                <ul className="list-circle pl-4 pt-1 text-sm text-slate-600">
                  <li><strong>Complementarios:</strong> suman 90° (α + β = 90°).</li>
                  <li><strong>Suplementarios:</strong> suman 180° (α + β = 180°).</li>
                </ul>
              </li>
              <li>
                <strong>Paralelas y transversal:</strong> los 8 ángulos se reducen a solo 2 medidas (agudos iguales entre sí, obtusos iguales entre sí).
              </li>
            </ul>
          </div>
          <p className="text-sm text-slate-500">
            Tocá el botón para guardar tu progreso y volver al menú principal.
          </p>
        </div>
      ),
    },
  ];

  return (
    <ModuloLayout titulo="Ángulos" icono="📏" onVolver={onVolver}>
      <StepNav pasos={pasos} onFinish={terminar} textoFinal="Terminar módulo ✓" />
    </ModuloLayout>
  );
}
