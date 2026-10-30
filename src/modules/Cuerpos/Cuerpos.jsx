import { useState } from 'react';
import ModuloLayout from '../../components/ModuloLayout.jsx';
import StepNav from '../../components/StepNav.jsx';
import Slider from '../../components/Slider.jsx';
import Quiz from '../../components/Quiz.jsx';
import NumInput from '../../components/NumInput.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { POLIEDROS, REDONDOS, cuerposPorAnio } from '../../data/cuerpos.js';
import Poliedro3D from '../../components/Poliedro3D.jsx';
import { construirPoliedro, IDS_DIBUJABLES } from '../../utils/solidos3d.js';

// Cuerpos de la galería, agrupados.
const GRUPOS_GALERIA = [
  { titulo: 'Prismas', ids: ['cubo', 'ortoedro', 'prisma-triangular', 'prisma-pentagonal', 'prisma-hexagonal'] },
  { titulo: 'Pirámides', ids: ['tetraedro', 'piramide-cuadrada', 'piramide-pentagonal', 'piramide-hexagonal'] },
  { titulo: 'Cuerpos redondos', ids: ['cilindro', 'cono', 'esfera'] },
];

const NOMBRE_CORTO = {
  cubo: 'Cubo',
  ortoedro: 'Ortoedro',
  'prisma-triangular': 'Triangular',
  'prisma-pentagonal': 'Pentagonal',
  'prisma-hexagonal': 'Hexagonal',
  tetraedro: 'Triangular',
  'piramide-cuadrada': 'Cuadrada',
  'piramide-pentagonal': 'Pentagonal',
  'piramide-hexagonal': 'Hexagonal',
  cilindro: 'Cilindro',
  cono: 'Cono',
  esfera: 'Esfera',
};

const buscar = (id) => [...POLIEDROS, ...REDONDOS].find((c) => c.id === id);

const MODOS_POLIEDRO = [
  { id: 'caras', texto: 'Caras', color: 'amber' },
  { id: 'aristas', texto: 'Aristas', color: 'rose' },
  { id: 'vertices', texto: 'Vértices', color: 'slate' },
];

// ---------------- Cuerpos redondos (SVG) ----------------
function Redondo({ id, resalte }) {
  const baseC = resalte === 'bases' ? '#5eead4' : '#ccfbf1';
  const curvaC = resalte === 'curva' ? '#fcd34d' : '#e2e8f0';
  const trazo = '#0f766e';
  return (
    <svg viewBox="0 0 240 250" className="mx-auto h-64 w-full max-w-xs" role="img" aria-label={`Dibujo: ${buscar(id).nombre}`}>
      {id === 'cilindro' && (
        <>
          <path d="M60 70 V180 A60 20 0 0 0 180 180 V70 Z" fill={curvaC} stroke={trazo} strokeWidth="3" />
          <ellipse cx="120" cy="70" rx="60" ry="20" fill={baseC} stroke={trazo} strokeWidth="3" />
          {resalte === 'bases' && <ellipse cx="120" cy="180" rx="60" ry="20" fill="none" stroke="#0d9488" strokeWidth="4" />}
        </>
      )}
      {id === 'cono' && (
        <>
          <path d="M120 35 L60 180 A60 20 0 0 0 180 180 Z" fill={curvaC} stroke={trazo} strokeWidth="3" />
          <path d="M60 180 A60 20 0 0 1 180 180" fill="none" stroke={trazo} strokeWidth="2" strokeDasharray="5 4" />
          {resalte === 'bases' && <ellipse cx="120" cy="180" rx="60" ry="20" fill="none" stroke="#0d9488" strokeWidth="4" />}
          <circle cx="120" cy="35" r={resalte === 'vertice' ? 9 : 4} fill={resalte === 'vertice' ? '#be123c' : '#0f172a'} />
        </>
      )}
      {id === 'esfera' && (
        <>
          <circle cx="120" cy="125" r="75" fill="#ccfbf1" stroke={trazo} strokeWidth="3" />
          <ellipse cx="120" cy="125" rx="75" ry="22" fill="none" stroke={trazo} strokeWidth="2" strokeDasharray="5 4" />
          <circle cx="120" cy="125" r="3.5" fill="#0f172a" />
          <line x1="120" y1="125" x2="195" y2="125" stroke="#be123c" strokeWidth="3" />
          <text x="158" y="118" fontSize="14" fill="#be123c" fontWeight="700" textAnchor="middle">r</text>
        </>
      )}
    </svg>
  );
}

// Qué se puede resaltar en cada cuerpo redondo
const MODOS_REDONDO = {
  cilindro: [{ id: 'bases', texto: 'Bases' }, { id: 'curva', texto: 'Superficie curva' }],
  cono: [{ id: 'bases', texto: 'Base' }, { id: 'curva', texto: 'Superficie curva' }, { id: 'vertice', texto: 'Vértice' }],
  esfera: [],
};

const colorBoton = (activo) =>
  activo
    ? 'border-teal-600 bg-teal-600 text-white'
    : 'border-slate-200 bg-white text-slate-700 active:bg-slate-100';

export default function Cuerpos({ onVolver }) {
  const { marcarCompletado, anio } = useApp();

  const [elegido, setElegido] = useState('cubo');
  const [vistos, setVistos] = useState(() => new Set(['cubo']));
  const [giro, setGiro] = useState(30);
  const [resalte, setResalte] = useState(null);

  const [aristasOk, setAristasOk] = useState(false);
  const [quizRedondoOk, setQuizRedondoOk] = useState(false);
  const [quizCilindroOk, setQuizCilindroOk] = useState(false);

  const terminar = () => {
    marcarCompletado('cuerpos');
    onVolver();
  };

  const elegir = (id) => {
    setElegido(id);
    setResalte(null);
    setVistos((v) => new Set(v).add(id));
  };

  const cuerpo = buscar(elegido);
  const esPoliedro = IDS_DIBUJABLES.includes(elegido);
  const geo = esPoliedro ? construirPoliedro(elegido) : null;
  const modosRedondo = MODOS_REDONDO[elegido] || [];

  const cuentas = geo
    ? { caras: geo.caras.length, aristas: geo.aristas.length, vertices: geo.vertices.length }
    : null;

  const filasTabla = cuerposPorAnio(anio);

  const pasos = [
    {
      titulo: 'Galería de cuerpos',
      bloqueado: vistos.size < 3,
      contenido: (
        <>
          <p className="text-slate-600">
            Elegí un cuerpo, girálo y tocá qué querés resaltar. Mirá al menos <strong>3 cuerpos distintos</strong> para seguir
            ({Math.min(vistos.size, 3)} de 3).
          </p>

          {GRUPOS_GALERIA.map((g) => (
            <div key={g.titulo}>
              <p className="mb-1 text-sm font-semibold text-slate-500">{g.titulo}</p>
              <div className="flex flex-wrap gap-2">
                {g.ids.map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => elegir(id)}
                    aria-pressed={elegido === id}
                    aria-label={buscar(id).nombre}
                    className={`min-h-11 rounded-xl border-2 px-3 text-sm font-semibold transition ${colorBoton(elegido === id)}`}
                  >
                    {NOMBRE_CORTO[id]}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <h3 className="text-lg font-bold">{cuerpo.nombre}</h3>
            <p className="text-sm text-slate-600">{cuerpo.detalle}</p>

            {esPoliedro ? (
              <>
                <Poliedro3D id={elegido} giro={giro} resalte={resalte} />
                <Slider etiqueta="Girar" valor={giro} onChange={setGiro} min={0} max={360} paso={10} unidad="°" />
                <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Resaltar">
                  {MODOS_POLIEDRO.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setResalte((r) => (r === m.id ? null : m.id))}
                      aria-pressed={resalte === m.id}
                      className={`min-h-11 flex-1 rounded-xl border-2 px-3 font-semibold transition ${colorBoton(resalte === m.id)}`}
                    >
                      {m.texto}
                    </button>
                  ))}
                </div>
                {resalte && (
                  <p className="mt-3 rounded-lg bg-amber-50 p-2 text-amber-900" aria-live="polite">
                    {resalte === 'caras' && (
                      <>
                        Tiene <strong>{cuentas.caras} caras</strong>: las de color verde son las <em>bases</em> y las amarillas las{' '}
                        <em>caras laterales</em>.
                      </>
                    )}
                    {resalte === 'aristas' && (
                      <>
                        Tiene <strong>{cuentas.aristas} aristas</strong>. Las punteadas están del otro lado.
                      </>
                    )}
                    {resalte === 'vertices' && (
                      <>
                        Tiene <strong>{cuentas.vertices} vértices</strong> (están numerados para contarlos).
                      </>
                    )}
                  </p>
                )}
              </>
            ) : (
              <>
                <Redondo id={elegido} resalte={resalte} />
                {modosRedondo.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Resaltar">
                    {modosRedondo.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setResalte((r) => (r === m.id ? null : m.id))}
                        aria-pressed={resalte === m.id}
                        className={`min-h-11 flex-1 rounded-xl border-2 px-3 font-semibold transition ${colorBoton(resalte === m.id)}`}
                      >
                        {m.texto}
                      </button>
                    ))}
                  </div>
                )}
                <p className="mt-3 rounded-lg bg-amber-50 p-2 text-amber-900">
                  Es un <strong>cuerpo redondo</strong>: tiene alguna superficie curva, por eso no tiene aristas ni caras como un poliedro.
                </p>
              </>
            )}
          </div>
        </>
      ),
    },
    {
      titulo: 'Contá los elementos',
      bloqueado: !aristasOk,
      contenido: (
        <>
          <p className="text-slate-600">
            Un prisma pentagonal tiene 2 bases pentagonales. Pensá: 5 aristas en cada base y 5 aristas que las unen.
          </p>
          <NumInput
            etiqueta="¿Cuántas aristas tiene un prisma pentagonal?"
            correcto={buscar('prisma-pentagonal').A}
            pista="5 de abajo + 5 de arriba + 5 verticales."
            onResultado={() => setAristasOk(true)}
          />
        </>
      ),
    },
    {
      titulo: 'Poliedros o cuerpos redondos',
      bloqueado: !(quizRedondoOk && quizCilindroOk),
      contenido: (
        <>
          <Quiz
            pregunta="¿Cuál de estos cuerpos es un cuerpo redondo?"
            opciones={['Cubo', 'Pirámide cuadrada', 'Cono']}
            correcta={2}
            explicacion="El cono tiene una superficie lateral curva. Los otros dos tienen todas sus caras planas: son poliedros."
            onResolver={() => setQuizRedondoOk(true)}
          />
          <Quiz
            pregunta="¿Un cilindro tiene vértices?"
            opciones={['Sí, 2', 'Sí, 1', 'No, no tiene vértices']}
            correcta={2}
            explicacion="Sus bases son círculos y su lateral es curvo: no hay puntas. El cono, en cambio, tiene 1 vértice."
            onResolver={() => setQuizCilindroOk(true)}
          />
        </>
      ),
    },
    {
      titulo: 'Tabla comparativa',
      contenido: (
        <>
          <p className="text-slate-600">
            Fijate en las pirámides: el número de <strong>caras es igual al de vértices</strong>. En los prismas, los vértices son
            el doble de los lados de la base.
          </p>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th scope="col" className="p-2">Cuerpo</th>
                  <th scope="col" className="p-2 text-center">Caras</th>
                  <th scope="col" className="p-2 text-center">Vértices</th>
                  <th scope="col" className="p-2 text-center">Aristas</th>
                </tr>
              </thead>
              <tbody>
                {filasTabla.map((c) => (
                  <tr key={c.id} className="border-t border-slate-100">
                    <th scope="row" className="p-2 font-semibold">{c.nombre}</th>
                    {c.tipo === 'redondo' ? (
                      <td colSpan={3} className="p-2 text-center text-slate-400">cuerpo redondo</td>
                    ) : (
                      <>
                        <td className="p-2 text-center tabular-nums">{c.C}</td>
                        <td className="p-2 text-center tabular-nums">{c.V}</td>
                        <td className="p-2 text-center tabular-nums">{c.A}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ),
    },
    {
      titulo: '¡Listo!',
      contenido: (
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="font-semibold">Para recordar:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6 text-slate-700">
            <li>Poliedros: todas las caras son planas (prismas y pirámides).</li>
            <li>Cuerpos redondos: tienen superficie curva (cilindro, cono, esfera).</li>
            <li>Cara, arista y vértice: la superficie, el borde donde se juntan dos caras y la punta.</li>
          </ul>
        </div>
      ),
    },
  ];

  return (
    <ModuloLayout titulo="Cuerpos y sus elementos" icono="🧊" onVolver={onVolver}>
      <StepNav pasos={pasos} onFinish={terminar} textoFinal="Terminar ✓" />
    </ModuloLayout>
  );
}
