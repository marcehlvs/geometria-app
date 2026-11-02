import { useMemo, useState } from 'react';
import ModuloLayout from '../../components/ModuloLayout.jsx';
import Formula from '../../components/Formula.jsx';
import Net3D from '../../components/Net3D.jsx';
import Redondo3D from '../../components/Redondo3D.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { fmt } from '../../utils/format.js';
import { nuevaSemilla } from '../../utils/rand.js';
import { construirDesarrollo } from '../../data/nets.js';
import { crearEvaluacion, corregirEvaluacion, DESCUENTO_UNIDAD } from '../../data/evaluacion.js';

const APROBADO = 0.6; // con el 60 % del puntaje queda marcado el módulo
const colorBoton = (activo) =>
  activo ? 'border-teal-600 bg-teal-600 text-white' : 'border-slate-200 bg-white text-slate-700 active:bg-slate-100';

const textoPuntos = (p) => `${fmt(p)} ${p === 1 ? 'punto' : 'puntos'}`;

// ---------- Figuras de los ejercicios ----------
function PatioL({ largo, ancho, rLargo, rAncho }) {
  const W = 300;
  const H = 190;
  const izq = 44;
  const arriba = 28;
  const k = Math.min((W - izq - 56) / largo, (H - arriba - 34) / ancho);
  const w = largo * k;
  const h = ancho * k;
  const cw = rLargo * k;
  const ch = rAncho * k;
  const puntos = [
    [izq, arriba],
    [izq + w - cw, arriba],
    [izq + w - cw, arriba + ch],
    [izq + w, arriba + ch],
    [izq + w, arriba + h],
    [izq, arriba + h],
  ]
    .map((p) => p.join(','))
    .join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Patio: un rectángulo al que se le quitó un rincón" className="mx-auto my-3 w-full max-w-sm">
      <polygon points={puntos} fill="#ccfbf1" stroke="#0f766e" strokeWidth="2" strokeLinejoin="round" />
      <rect x={izq + w - cw} y={arriba} width={cw} height={ch} fill="none" stroke="#64748b" strokeDasharray="4 3" />
      <g fontSize="13" fontWeight="600" fill="#0f172a">
        <text x={izq + w / 2} y={arriba + h + 18} textAnchor="middle">{largo} m</text>
        <text x={izq - 6} y={arriba + h / 2} textAnchor="end" dominantBaseline="central">{ancho} m</text>
        <text x={izq + w - cw / 2} y={arriba - 8} textAnchor="middle">{rLargo} m</text>
        <text x={izq + w + 6} y={arriba + ch / 2} dominantBaseline="central">{rAncho} m</text>
      </g>
    </svg>
  );
}

function Figura({ figura }) {
  if (!figura) return null;
  if (figura.tipo === 'net') {
    const net = construirDesarrollo(figura.id, figura.medidas);
    return (
      <div className="my-3">
        <Net3D desarrollo={net} t={0} giroVista={0} colorear={false} animar={false} medidas={figura.rotular} etiqueta="Desarrollo plano del cuerpo" />
      </div>
    );
  }
  if (figura.tipo === 'redondo') return <Redondo3D id={figura.id} resalte={null} />;
  if (figura.tipo === 'patio-L') return <PatioL {...figura} />;
  return null;
}

// ---------- Resultado de un paso (después de corregir) ----------
function ResultadoParte({ parte, res }) {
  const respuesta = `${fmt(parte.valor, 4)} ${parte.unidad}`;
  if (res.estado === 'ok') return <p className="mt-2 font-semibold text-green-700">✅ {fmt(res.puntos)} de {fmt(parte.puntos)}</p>;
  if (res.estado === 'unidad')
    return (
      <p className="mt-2 font-semibold text-amber-800">
        ⚠️ {fmt(res.puntos)} de {fmt(parte.puntos)} · el número está bien, pero la unidad falta o está mal (−{fmt(DESCUENTO_UNIDAD)})
      </p>
    );
  return (
    <p className="mt-2 font-semibold text-red-700">
      {res.estado === 'vacio' ? '— Sin responder' : '❌'} · 0 de {fmt(parte.puntos)} · la respuesta era {respuesta}
    </p>
  );
}

// ---------- Hoja de la evaluación (pantalla, papel o clave) ----------
function Hoja({ evaluacion, modo, respuestas, onCambio, resultado }) {
  const clave = modo === 'clave';
  const papel = modo === 'papel';
  return (
    <div className="space-y-5">
      {(papel || clave) && (
        <header className="space-y-2 rounded-2xl border border-slate-300 bg-white p-4">
          <h2 className="text-xl font-bold">
            Geometría · Evaluación N.º {evaluacion.semilla}
            {clave && <span className="ml-2 rounded bg-amber-200 px-2 py-0.5 text-sm">CLAVE DEL DOCENTE</span>}
          </h2>
          {papel && (
            <p className="flex flex-wrap items-end gap-x-6 gap-y-3 pt-1">
              <span>
                Nombre y apellido: <span className="inline-block w-56 border-b border-slate-800" />
              </span>
              <span>
                Curso: <span className="inline-block w-20 border-b border-slate-800" />
              </span>
              <span>
                Fecha: <span className="inline-block w-24 border-b border-slate-800" />
              </span>
            </p>
          )}
          <p className="text-sm text-slate-600">
            Total: {textoPuntos(evaluacion.maximo)}. Escribí siempre la unidad: si falta o está mal, se descuentan {fmt(DESCUENTO_UNIDAD)} puntos en ese paso.
          </p>
        </header>
      )}

      {evaluacion.ejercicios.map((e) => (
        <section key={e.numero} aria-labelledby={`ej-${modo}-${e.numero}`} className="ejercicio rounded-2xl border border-slate-200 bg-white p-4">
          <h3 id={`ej-${modo}-${e.numero}`} className="text-lg font-bold">
            Ejercicio {e.numero} · {e.titulo} <span className="text-sm font-normal text-slate-500">({textoPuntos(e.puntos)})</span>
          </h3>
          <p className="mt-2 text-lg leading-relaxed">{e.enunciado}</p>
          <Figura figura={e.figura} />

          <ol className="mt-3 space-y-4">
            {e.partes.map((p) => (
              <li key={p.id} data-parte={p.id}>
                <p>
                  <strong>{p.letra})</strong> {p.consigna} <span className="text-sm text-slate-500">({textoPuntos(p.puntos)})</span>
                </p>

                {modo === 'pantalla' && (
                  <>
                    <div className="mt-2 flex gap-2">
                      <input
                        type="text"
                        inputMode="decimal"
                        autoComplete="off"
                        aria-label={`Respuesta ${p.id}`}
                        value={respuestas[p.id]?.texto ?? ''}
                        disabled={!!resultado}
                        onChange={(ev) => onCambio(p.id, { texto: ev.target.value })}
                        className="h-12 min-w-0 flex-1 rounded-xl border-2 border-slate-300 bg-white px-3 text-lg outline-none focus:border-teal-500 disabled:bg-slate-100"
                      />
                      <select
                        aria-label={`Unidad ${p.id}`}
                        value={respuestas[p.id]?.unidad ?? ''}
                        disabled={!!resultado}
                        onChange={(ev) => onCambio(p.id, { unidad: ev.target.value })}
                        className="h-12 w-28 rounded-xl border-2 border-slate-300 bg-white px-2 text-lg disabled:bg-slate-100"
                      >
                        <option value="">Unidad</option>
                        {p.opciones.map((u) => (
                          <option key={u} value={u}>
                            {u}
                          </option>
                        ))}
                      </select>
                    </div>
                    {resultado && <ResultadoParte parte={p} res={resultado.partes[p.id]} />}
                  </>
                )}

                {papel && (
                  <div className="mt-2 space-y-2">
                    <div className="h-20 rounded-lg border border-dashed border-slate-300" aria-hidden="true" />
                    <p>
                      Respuesta: <span className="inline-block w-44 border-b border-slate-800" />
                    </p>
                  </div>
                )}

                {clave && (
                  <div className="mt-2 rounded-xl bg-amber-50 p-3">
                    <p>
                      Respuesta:{' '}
                      <strong>
                        {fmt(p.valor, 4)} {p.unidad}
                      </strong>
                    </p>
                    <Formula block tex={p.tex} />
                    {p.nota && <p className="text-sm text-slate-600">{p.nota}</p>}
                  </div>
                )}
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}

const SOLAPAS = [
  { id: 'pantalla', texto: 'Resolver en pantalla' },
  { id: 'papel', texto: 'Versión para imprimir' },
  { id: 'clave', texto: 'Clave del docente' },
];

export default function Evaluacion({ onVolver }) {
  const { marcarCompletado, anio, pi, piEscolar } = useApp();

  const [filtroAnio, setFiltroAnio] = useState(anio || 0);
  const [semilla, setSemilla] = useState(() => nuevaSemilla());
  const [entrada, setEntrada] = useState(() => String(semilla));
  const [errorEntrada, setErrorEntrada] = useState(false);
  const [modo, setModo] = useState('pantalla');
  const [respuestas, setRespuestas] = useState({});
  const [resultado, setResultado] = useState(null);

  const evaluacion = useMemo(() => crearEvaluacion(semilla, filtroAnio, { pi, piEscolar }), [semilla, filtroAnio, pi, piEscolar]);

  const reiniciar = () => {
    setRespuestas({});
    setResultado(null);
  };

  const usarSemilla = (nueva) => {
    setSemilla(nueva);
    setEntrada(String(nueva));
    setErrorEntrada(false);
    reiniciar();
  };

  const aplicarEntrada = () => {
    const n = Number(entrada.trim());
    if (!/^\d{1,9}$/.test(entrada.trim()) || n < 1) {
      setErrorEntrada(true);
      return;
    }
    usarSemilla(n);
  };

  const elegirAnio = (valor) => {
    setFiltroAnio(valor);
    reiniciar();
  };

  const cambiarRespuesta = (id, cambio) => setRespuestas((r) => ({ ...r, [id]: { ...r[id], ...cambio } }));

  const corregir = () => {
    const res = corregirEvaluacion(evaluacion, respuestas);
    setResultado(res);
    if (res.total >= APROBADO * res.maximo) marcarCompletado('evaluacion');
  };

  return (
    <ModuloLayout titulo="Modo evaluación" icono="📝" onVolver={onVolver}>
      <div className="no-imprimir space-y-3">
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Año">
          {[
            [0, 'Todos'],
            [1, '1.º año'],
            [2, '2.º año'],
          ].map(([valor, t]) => (
            <button
              key={valor}
              type="button"
              onClick={() => elegirAnio(valor)}
              aria-pressed={filtroAnio === valor}
              className={`min-h-11 rounded-xl border-2 px-3 text-sm font-semibold transition ${colorBoton(filtroAnio === valor)}`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-3">
          <label htmlFor="numero-evaluacion" className="block font-semibold">
            Número de evaluación
          </label>
          <div className="mt-1 flex gap-2">
            <input
              id="numero-evaluacion"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={entrada}
              onChange={(e) => {
                setEntrada(e.target.value);
                setErrorEntrada(false);
              }}
              onKeyDown={(e) => e.key === 'Enter' && aplicarEntrada()}
              aria-invalid={errorEntrada}
              className="h-12 min-w-0 flex-1 rounded-xl border-2 border-slate-300 bg-white px-3 text-lg outline-none focus:border-teal-500"
            />
            <button type="button" onClick={aplicarEntrada} className="min-h-12 rounded-xl border-2 border-teal-600 px-3 font-semibold text-teal-700 active:bg-teal-50">
              Usar
            </button>
            <button
              type="button"
              onClick={() => usarSemilla(nuevaSemilla())}
              className="min-h-12 rounded-xl bg-teal-600 px-3 font-semibold text-white active:bg-teal-700"
            >
              Nueva
            </button>
          </div>
          {errorEntrada ? (
            <p role="alert" className="mt-1 text-sm text-red-700">
              Escribí un número entero positivo (por ejemplo 4821).
            </p>
          ) : (
            <p className="mt-1 text-sm text-slate-500">Con el mismo número se obtiene siempre la misma evaluación y la misma clave.</p>
          )}
        </div>

        <div className="flex rounded-xl bg-slate-200 p-1" role="tablist" aria-label="Versión de la evaluación">
          {SOLAPAS.map((s) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={modo === s.id}
              onClick={() => setModo(s.id)}
              className={`min-h-11 flex-1 rounded-lg px-1 text-sm font-semibold transition ${modo === s.id ? 'bg-white text-teal-700 shadow' : 'text-slate-600'}`}
            >
              {s.texto}
            </button>
          ))}
        </div>

        {modo !== 'pantalla' && (
          <button
            type="button"
            onClick={() => window.print()}
            className="min-h-11 w-full rounded-xl bg-teal-600 px-4 font-semibold text-white active:bg-teal-700"
          >
            🖨️ Imprimir {modo === 'clave' ? 'la clave' : 'la evaluación'}
          </button>
        )}
      </div>

      <div role="tabpanel" aria-label={SOLAPAS.find((s) => s.id === modo).texto} className="mt-4">
        <Hoja evaluacion={evaluacion} modo={modo} respuestas={respuestas} onCambio={cambiarRespuesta} resultado={resultado} />

        {modo === 'pantalla' && (
          <div className="mt-4 space-y-3">
            {resultado ? (
              <>
                <p role="status" data-puntaje={resultado.total} className="rounded-2xl border-2 border-teal-600 bg-teal-50 p-4 text-center text-xl font-bold">
                  Puntaje: {fmt(resultado.total)} de {fmt(resultado.maximo)}
                </p>
                <button type="button" onClick={reiniciar} className="h-12 w-full rounded-xl border-2 border-teal-600 font-semibold text-teal-700 active:bg-teal-50">
                  Volver a intentarlo
                </button>
              </>
            ) : (
              <button type="button" onClick={corregir} className="h-12 w-full rounded-xl bg-teal-600 text-lg font-semibold text-white active:bg-teal-700">
                Corregir evaluación
              </button>
            )}
          </div>
        )}
      </div>
    </ModuloLayout>
  );
}
