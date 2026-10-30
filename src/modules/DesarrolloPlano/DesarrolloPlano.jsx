import { useEffect, useRef, useState } from 'react';
import ModuloLayout from '../../components/ModuloLayout.jsx';
import StepNav from '../../components/StepNav.jsx';
import Slider from '../../components/Slider.jsx';
import Quiz from '../../components/Quiz.jsx';
import NumInput from '../../components/NumInput.jsx';
import Formula from '../../components/Formula.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { POLIEDROS, REDONDOS } from '../../data/cuerpos.js';
import {
  DESARROLLABLES,
  MEDIDAS_INICIALES,
  construirDesarrollo,
  resumenAreas,
  areaTotalDesarrollo,
  cuadroDelimitador,
  ejeBisagra,
} from '../../data/nets.js';
import { fmt } from '../../utils/format.js';

const PALETA = ['#5eead4', '#fcd34d', '#fda4af', '#a5b4fc', '#bef264', '#fdba74'];
const NOMBRES = Object.fromEntries([...POLIEDROS, ...REDONDOS].map((c) => [c.id, c.nombre]));
const CORTO = {
  cubo: 'Cubo',
  ortoedro: 'Ortoedro',
  'prisma-triangular': 'Prisma triangular',
  'prisma-pentagonal': 'Prisma pentagonal',
  'prisma-hexagonal': 'Prisma hexagonal',
  tetraedro: 'Pirámide triangular',
  'piramide-cuadrada': 'Pirámide cuadrada',
  'piramide-pentagonal': 'Pirámide pentagonal',
  cilindro: 'Cilindro',
  cono: 'Cono',
};
const IDS_REDONDOS = ['cilindro', 'cono'];

const colorBoton = (activo) =>
  activo ? 'border-teal-600 bg-teal-600 text-white' : 'border-slate-200 bg-white text-slate-700 active:bg-slate-100';

// ---------- Una cara del desarrollo: <div> 3D anidado dentro de su padre ----------
// La cara se coloca donde le toca en el plano y gira alrededor de su bisagra
// (transform-origin). Como está DENTRO de su padre, hereda el giro del padre.
function CaraNet({ cara, porPadre, origen, k, t, colores, animar }) {
  const bb = cuadroDelimitador(cara.poly);
  const ancho = Math.max((bb.maxX - bb.minX) * k, 1);
  const alto = Math.max((bb.maxY - bb.minY) * k, 1);
  const estilo = {
    position: 'absolute',
    left: (bb.minX - origen[0]) * k,
    top: (bb.minY - origen[1]) * k,
    width: ancho,
    height: alto,
    transformStyle: 'preserve-3d',
    transition: animar ? 'transform 0.9s ease-in-out' : 'none',
  };
  if (cara.bisagra) {
    const { origen: o, dir } = ejeBisagra(cara);
    estilo.transformOrigin = `${(o[0] - bb.minX) * k}px ${(o[1] - bb.minY) * k}px`;
    estilo.transform = `rotate3d(${dir[0]}, ${dir[1]}, 0, ${cara.giro * t}deg)`;
  }
  const puntos = cara.poly.map(([x, y]) => `${(x - bb.minX) * k},${(y - bb.minY) * k}`).join(' ');
  return (
    <div style={estilo} data-cara={cara.id}>
      <svg width={ancho} height={alto} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }} aria-hidden="true">
        <polygon points={puntos} fill={colores[cara.grupo]} fillOpacity="0.92" stroke="#0f766e" strokeWidth="2" strokeLinejoin="round" />
      </svg>
      {(porPadre[cara.id] || []).map((hija) => (
        <CaraNet key={hija.id} cara={hija} porPadre={porPadre} origen={[bb.minX, bb.minY]} k={k} t={t} colores={colores} animar={animar} />
      ))}
    </div>
  );
}

function Net3D({ desarrollo, t, giroVista, colorear, animar }) {
  const todos = desarrollo.caras.flatMap((c) => c.poly);
  const bb = cuadroDelimitador(todos);
  const w = bb.maxX - bb.minX;
  const h = bb.maxY - bb.minY;
  const k = 230 / Math.max(w, h, 1);
  const centro = [(bb.minX + bb.maxX) / 2, (bb.minY + bb.maxY) / 2];

  const grupos = [...new Set(desarrollo.caras.map((c) => c.grupo))];
  const colores = Object.fromEntries(grupos.map((g, i) => [g, colorear ? PALETA[i % PALETA.length] : '#e2e8f0']));

  const porPadre = {};
  desarrollo.caras.forEach((c) => {
    if (c.padre) (porPadre[c.padre] ||= []).push(c);
  });
  const raiz = desarrollo.caras.find((c) => !c.padre);

  return (
    <div
      className="relative mx-auto h-80 w-full max-w-sm overflow-hidden rounded-2xl bg-slate-50"
      style={{ perspective: '1000px' }}
      role="img"
      aria-label={`Desarrollo plano de ${NOMBRES[desarrollo.id]}, plegado al ${Math.round(t * 100)} %`}
    >
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: 0,
          height: 0,
          transformStyle: 'preserve-3d',
          transform: `rotateX(55deg) rotateZ(${giroVista}deg)`,
        }}
      >
        <CaraNet cara={raiz} porPadre={porPadre} origen={centro} k={k} t={t} colores={colores} animar={animar} />
      </div>
    </div>
  );
}

// ---------- Cilindro y cono: la superficie lateral se desenrolla ----------
function DesarrolloRedondo({ id, r, h, t }) {
  const gen = Math.sqrt(r * r + h * h);
  const trazo = { stroke: '#0f766e', strokeWidth: 2, vectorEffect: 'non-scaling-stroke' };
  if (id === 'cilindro') {
    const W = 2 * Math.PI * r;
    const w = W * Math.max(t, 0.02);
    return (
      <svg viewBox={`${-W / 2 - 1} ${-2 * r - 1} ${W + 2} ${h + 4 * r + 2}`} className="mx-auto h-72 w-full max-w-sm" role="img" aria-label="Desarrollo del cilindro">
        <circle cx="0" cy={-r} r={r} fill="#5eead4" fillOpacity="0.9" {...trazo} />
        <circle cx="0" cy={h + r} r={r} fill="#5eead4" fillOpacity="0.9" {...trazo} />
        <rect x={-w / 2} y="0" width={w} height={h} fill="#fcd34d" fillOpacity="0.92" {...trazo} />
      </svg>
    );
  }
  const total = (360 * r) / gen;
  const ang = Math.max(total * t, 4);
  const a1 = ((90 - ang / 2) * Math.PI) / 180;
  const a2 = ((90 + ang / 2) * Math.PI) / 180;
  const p1 = [gen * Math.cos(a1), gen * Math.sin(a1)];
  const p2 = [gen * Math.cos(a2), gen * Math.sin(a2)];
  return (
    <svg viewBox={`${-gen - 1} ${-gen - 1} ${2 * gen + 2} ${2 * gen + 2 * r + 2}`} className="mx-auto h-72 w-full max-w-sm" role="img" aria-label="Desarrollo del cono">
      <circle cx="0" cy={gen + r} r={r} fill="#5eead4" fillOpacity="0.9" {...trazo} />
      <path d={`M0 0 L${p1[0]} ${p1[1]} A${gen} ${gen} 0 ${ang > 180 ? 1 : 0} 1 ${p2[0]} ${p2[1]} Z`} fill="#fcd34d" fillOpacity="0.92" {...trazo} />
    </svg>
  );
}

export default function DesarrolloPlano({ onVolver }) {
  const { marcarCompletado, pi } = useApp();

  const [id, setId] = useState('cubo');
  const [medidas, setMedidas] = useState(MEDIDAS_INICIALES);
  const [r, setR] = useState(2);
  const [hRedondo, setHRedondo] = useState(4);
  const [t, setT] = useState(0);
  const [giroVista, setGiroVista] = useState(-20);
  const [colorear, setColorear] = useState(true);
  const [animar, setAnimar] = useState(false);
  const [plegoTodo, setPlegoTodo] = useState(false);

  const [areaOk, setAreaOk] = useState(false);
  const [largoOk, setLargoOk] = useState(false);
  const [quizOk, setQuizOk] = useState(false);
  const [tRedondo, setTRedondo] = useState(0);

  const temporizador = useRef(null);
  useEffect(() => () => clearTimeout(temporizador.current), []);

  const terminar = () => {
    marcarCompletado('desarrollo');
    onVolver();
  };

  const esRedondo = IDS_REDONDOS.includes(id);
  const def = DESARROLLABLES.find((d) => d.id === id);
  const desarrollo = esRedondo ? null : construirDesarrollo(id, medidas);

  const elegir = (nuevo) => {
    setId(nuevo);
    setT(0);
    setTRedondo(0);
    setAnimar(false);
  };

  const cambiarT = (valor) => {
    setAnimar(false);
    setT(valor);
    if (valor >= 1) setPlegoTodo(true);
  };

  const animarA = (destino) => {
    setAnimar(true);
    setT(destino);
    clearTimeout(temporizador.current);
    if (destino >= 1) setPlegoTodo(true);
    temporizador.current = setTimeout(() => setAnimar(false), 1000);
  };

  const resumen = desarrollo ? resumenAreas(desarrollo) : [];
  const nombreGrupo = (g) => (g === 'base' ? 'Base' : g === 'lateral' ? 'Cara lateral' : 'Cara lateral');

  const gen = Math.sqrt(r * r + hRedondo * hRedondo);
  const areaLateralCil = 2 * pi * r * hRedondo;
  const areaBaseCir = pi * r * r;

  const pasos = [
    {
      titulo: 'Plegá el desarrollo',
      bloqueado: !plegoTodo,
      contenido: (
        <>
          <p className="text-slate-600">
            Elegí un cuerpo y llevá el deslizador hasta <strong>100 %</strong> para armarlo.
          </p>

          <div className="flex flex-wrap gap-2" role="group" aria-label="Cuerpo">
            {[...DESARROLLABLES.map((d) => d.id), ...IDS_REDONDOS].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => elegir(c)}
                aria-pressed={id === c}
                className={`min-h-11 rounded-xl border-2 px-3 text-sm font-semibold transition ${colorBoton(id === c)}`}
              >
                {CORTO[c]}
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <h3 className="text-lg font-bold">{NOMBRES[id]}</h3>

            {!esRedondo && (
              <>
                <Net3D desarrollo={desarrollo} t={t} giroVista={giroVista} colorear={colorear} animar={animar} />
                <div className="mt-3 space-y-2">
                  <Slider etiqueta="Plegar" valor={Math.round(t * 100)} onChange={(v) => cambiarT(v / 100)} min={0} max={100} paso={5} unidad="%" />
                  <div className="flex gap-2">
                    <button type="button" onClick={() => animarA(1)} className="h-11 flex-1 rounded-xl bg-teal-600 font-semibold text-white active:bg-teal-700">
                      Plegar
                    </button>
                    <button type="button" onClick={() => animarA(0)} className="h-11 flex-1 rounded-xl border-2 border-teal-600 font-semibold text-teal-700 active:bg-teal-50">
                      Desplegar
                    </button>
                  </div>
                  <Slider etiqueta="Girar la vista" valor={giroVista} onChange={setGiroVista} min={-180} max={180} paso={10} unidad="°" />
                  <button
                    type="button"
                    onClick={() => setColorear((c) => !c)}
                    aria-pressed={colorear}
                    className={`min-h-11 w-full rounded-xl border-2 px-3 font-semibold transition ${colorBoton(colorear)}`}
                  >
                    Colorear caras iguales
                  </button>
                </div>

                <div className="mt-3 space-y-2">
                  {def.params.map((p) => (
                    <Slider
                      key={p}
                      etiqueta={def.etiquetas[p]}
                      valor={medidas[p]}
                      onChange={(v) => setMedidas((m) => ({ ...m, [p]: v }))}
                      min={1}
                      max={p === 'h' ? 8 : 6}
                      paso={1}
                      unidad="cm"
                    />
                  ))}
                </div>
              </>
            )}

            {esRedondo && (
              <>
                <DesarrolloRedondo id={id} r={r} h={hRedondo} t={Math.max(tRedondo, 0.02)} />
                <div className="mt-3 space-y-2">
                  <Slider
                    etiqueta="Desenrollar"
                    valor={Math.round(tRedondo * 100)}
                    onChange={(v) => {
                      setTRedondo(v / 100);
                      if (v >= 100) setPlegoTodo(true);
                    }}
                    min={0}
                    max={100}
                    paso={5}
                    unidad="%"
                  />
                  <Slider etiqueta="Radio" valor={r} onChange={setR} min={1} max={4} paso={0.5} unidad="cm" decimales={1} />
                  <Slider etiqueta="Altura" valor={hRedondo} onChange={setHRedondo} min={1} max={6} paso={0.5} unidad="cm" decimales={1} />
                </div>
                <p className="mt-3 rounded-lg bg-amber-50 p-2 text-amber-900">
                  {id === 'cilindro' ? (
                    <>
                      La superficie lateral se desenrolla en un <strong>rectángulo</strong> de largo{' '}
                      <Formula tex="2 \cdot \pi \cdot r" /> = <strong>{fmt(2 * pi * r)} cm</strong> y alto {fmt(hRedondo, 1)} cm.
                    </>
                  ) : (
                    <>
                      La superficie lateral se desenrolla en un <strong>sector circular</strong> de radio g = {fmt(gen)} cm y ángulo{' '}
                      <strong>{fmt((360 * r) / gen, 1)}°</strong>.
                    </>
                  )}
                </p>
              </>
            )}
          </div>
        </>
      ),
    },
    {
      titulo: 'Área total = suma de las caras',
      bloqueado: !areaOk,
      contenido: (
        <>
          <p className="text-slate-600">
            El área total es la suma de las áreas de <strong>todas las caras del desarrollo</strong>. Mirá con el cubo de arista 3 cm.
          </p>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            {(() => {
              const cubo = construirDesarrollo('cubo', { a: 3 });
              return (
                <>
                  <Net3D desarrollo={cubo} t={0} giroVista={0} colorear animar={false} />
                  <p className="mt-3 text-slate-700">
                    {resumenAreas(cubo).map((g) => (
                      <span key={g.grupo}>
                        {g.cantidad} cuadrados de {fmt(g.area)} cm² cada uno.
                      </span>
                    ))}
                  </p>
                  <Formula block tex="A_T = 6 \cdot a^2" />
                </>
              );
            })()}
          </div>
          <NumInput
            etiqueta="Área total del cubo de arista 3 cm"
            unidad="cm²"
            correcto={54}
            pista="Cada cara tiene 3 · 3 = 9 cm² y hay 6 caras."
            onResultado={() => setAreaOk(true)}
          />
        </>
      ),
    },
    {
      titulo: 'Superficies curvas',
      bloqueado: !largoOk,
      contenido: (
        <>
          <p className="text-slate-600">
            Elegí el cilindro en la galería del paso 1 para desenrollarlo, o calculá directamente: un cilindro de radio 2 cm y altura 4 cm.
            Su superficie lateral se desenrolla en un rectángulo.
          </p>
          <div className="rounded-2xl border border-slate-200 bg-white p-3">
            <DesarrolloRedondo id="cilindro" r={2} h={4} t={1} />
            <Formula block tex="\text{largo del rectángulo} = 2 \cdot \pi \cdot r" />
            <p className="text-sm text-slate-500">
              Área de cada círculo: {fmt(areaBaseCir)} cm² · Área lateral con r = {fmt(r, 1)} y h = {fmt(hRedondo, 1)}: {fmt(areaLateralCil)} cm².
            </p>
          </div>
          <NumInput
            etiqueta="Largo del rectángulo lateral (r = 2 cm)"
            unidad="cm"
            correcto={2 * pi * 2}
            pista="2 · π · 2. Recordá el valor de π que elegiste arriba."
            onResultado={() => setLargoOk(true)}
          />
        </>
      ),
    },
    {
      titulo: '¿Qué forma tiene?',
      bloqueado: !quizOk,
      contenido: (
        <Quiz
          pregunta="El desarrollo de una pirámide cuadrada está formado por…"
          opciones={['1 cuadrado y 4 triángulos', '5 cuadrados', '2 cuadrados y 4 rectángulos']}
          correcta={0}
          explicacion="La base es un cuadrado y cada una de las 4 caras laterales es un triángulo que se une a un lado de la base."
          onResolver={() => setQuizOk(true)}
        />
      ),
    },
    {
      titulo: '¡Listo!',
      contenido: (
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="font-semibold">Para recordar:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6 text-slate-700">
            <li>El desarrollo plano es el cuerpo «abierto y aplastado»: se pliega por las aristas.</li>
            <li>Área total = suma de las áreas de todas las caras del desarrollo.</li>
            <li>El cilindro y el cono tienen superficie curva: se desenrolla en un rectángulo y en un sector circular.</li>
          </ul>
        </div>
      ),
    },
  ];

  return (
    <ModuloLayout titulo="Desarrollo plano interactivo" icono="📦" onVolver={onVolver}>
      <StepNav pasos={pasos} onFinish={terminar} textoFinal="Terminar ✓" />
      {/* Desglose del área del cuerpo elegido (siempre disponible bajo los pasos) */}
      {desarrollo && resumen.length > 0 && (
        <p className="sr-only">
          {resumen.map((g) => `${g.cantidad} × ${nombreGrupo(g.grupo)} ${fmt(g.area)} cm²`).join('; ')}. Total {fmt(areaTotalDesarrollo(desarrollo))} cm².
        </p>
      )}
    </ModuloLayout>
  );
}
