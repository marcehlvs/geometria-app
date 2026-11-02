import { useState } from 'react';
import ModuloLayout from '../../components/ModuloLayout.jsx';
import Formula from '../../components/Formula.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { fmt } from '../../utils/format.js';
import { nuevaSemilla } from '../../utils/rand.js';
import {
  TEMAS_PROBLEMAS,
  PROBLEMAS,
  temasDisponibles,
  elegirPlantilla,
  crearProblema,
  corregir,
} from '../../data/problemas.js';

const META = 3; // problemas bien resueltos para marcar el módulo como completado

const colorBoton = (activo) =>
  activo ? 'border-teal-600 bg-teal-600 text-white' : 'border-slate-200 bg-white text-slate-700 active:bg-slate-100';

const estiloMensaje = {
  ok: 'border-green-500 bg-green-50 text-green-800',
  unidad: 'border-amber-400 bg-amber-50 text-amber-900',
  numero: 'border-amber-400 bg-amber-50 text-amber-900',
  mal: 'border-red-400 bg-red-50 text-red-800',
  invalido: 'border-red-400 bg-red-50 text-red-800',
  'sin-unidad': 'border-amber-400 bg-amber-50 text-amber-900',
};

export default function Problemas({ onVolver }) {
  const { marcarCompletado, anio, pi, piEscolar } = useApp();
  const ctx = { pi, piEscolar };

  const [filtroAnio, setFiltroAnio] = useState(anio || 0);
  const [tema, setTema] = useState(() => (temasDisponibles(anio || 0)[0] || TEMAS_PROBLEMAS[0]).id);
  const [problema, setProblema] = useState(() => {
    const t = (temasDisponibles(anio || 0)[0] || TEMAS_PROBLEMAS[0]).id;
    const semilla = nuevaSemilla();
    return crearProblema(elegirPlantilla(t, anio || 0, semilla), semilla, ctx);
  });

  const [texto, setTexto] = useState('');
  const [unidad, setUnidad] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const [resuelto, setResuelto] = useState(false);
  const [pistasVistas, setPistasVistas] = useState(0);
  const [verPasos, setVerPasos] = useState(false);
  const [correctos, setCorrectos] = useState(0);

  const cargar = (nuevo) => {
    setProblema(nuevo);
    setTexto('');
    setUnidad(null);
    setMensaje(null);
    setResuelto(false);
    setPistasVistas(0);
    setVerPasos(false);
  };

  // Problema de otra plantilla del tema (o del tema que se acaba de elegir)
  const otroDistinto = (temaId = tema, anioId = filtroAnio) => {
    const semilla = nuevaSemilla();
    const plantilla = elegirPlantilla(temaId, anioId, semilla, temaId === tema ? problema.plantilla : null);
    cargar(crearProblema(plantilla, semilla, ctx));
  };

  // Misma plantilla con otros números
  const otroParecido = () => {
    const plantilla = PROBLEMAS.find((p) => p.id === problema.plantilla);
    cargar(crearProblema(plantilla, nuevaSemilla(), ctx));
  };

  const elegirTema = (id) => {
    setTema(id);
    otroDistinto(id, filtroAnio);
  };

  const elegirAnio = (valor) => {
    setFiltroAnio(valor);
    const disponibles = temasDisponibles(valor);
    const nuevoTema = disponibles.some((t) => t.id === tema) ? tema : disponibles[0].id;
    setTema(nuevoTema);
    otroDistinto(nuevoTema, valor);
  };

  const comprobar = () => {
    if (resuelto) return;
    const res = corregir(problema, texto, unidad);
    setMensaje(res);
    if (res.estado === 'ok') {
      setResuelto(true);
      const total = correctos + 1;
      setCorrectos(total);
      if (total >= META) marcarCompletado('problemas');
    }
  };

  const pistas = problema.pistas;

  return (
    <ModuloLayout titulo="Problemas" icono="🧩" onVolver={onVolver}>
      <div className="space-y-3">
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

        <div className="flex flex-wrap gap-2" role="group" aria-label="Tema">
          {temasDisponibles(filtroAnio).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => elegirTema(t.id)}
              aria-pressed={tema === t.id}
              className={`min-h-11 rounded-xl border-2 px-3 text-sm font-semibold transition ${colorBoton(tema === t.id)}`}
            >
              <span aria-hidden="true">{t.icono} </span>
              {t.titulo}
            </button>
          ))}
        </div>

        <p className="text-sm text-slate-600" aria-live="polite">
          Resueltos: <strong>{correctos}</strong> (con {META} se completa el módulo)
        </p>
      </div>

      <article
        className="mt-4 space-y-4 rounded-2xl border border-slate-200 bg-white p-4"
        aria-labelledby="enunciado-problema"
        data-plantilla={problema.plantilla}
      >
        <p className="text-sm font-semibold text-slate-500">
          {problema.titulo} · <span>Problema #{problema.semilla}</span>
        </p>
        <p id="enunciado-problema" className="text-lg leading-relaxed">
          {problema.enunciado}
        </p>

        <div>
          <label htmlFor="respuesta-problema" className="mb-1 block font-semibold">
            Tu respuesta
          </label>
          <input
            id="respuesta-problema"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={texto}
            disabled={resuelto}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && comprobar()}
            className="h-12 w-full rounded-xl border-2 border-slate-300 bg-white px-3 text-lg outline-none focus:border-teal-500 disabled:bg-slate-100"
          />
        </div>

        <div>
          <p className="mb-1 font-semibold">Unidad de tu respuesta</p>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Unidad de tu respuesta">
            {problema.opciones.map((u) => (
              <button
                key={u}
                type="button"
                disabled={resuelto}
                onClick={() => setUnidad(u)}
                aria-pressed={unidad === u}
                className={`min-h-11 min-w-11 rounded-xl border-2 px-3 font-semibold transition disabled:opacity-60 ${colorBoton(unidad === u)}`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={comprobar}
          disabled={resuelto}
          className="h-12 w-full rounded-xl bg-teal-600 text-lg font-semibold text-white active:bg-teal-700 disabled:opacity-40"
        >
          Comprobar
        </button>

        <div role="status" aria-live="polite">
          {mensaje && (
            <p className={`rounded-xl border-2 p-3 font-semibold ${estiloMensaje[mensaje.estado]}`} data-estado={mensaje.estado}>
              {mensaje.mensaje}
            </p>
          )}
        </div>

        {pistasVistas > 0 && (
          <ol className="list-decimal space-y-1 pl-6 text-slate-700">
            {pistas.slice(0, pistasVistas).map((p) => (
              <li key={p}>💡 {p}</li>
            ))}
          </ol>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setPistasVistas((v) => Math.min(v + 1, pistas.length))}
            disabled={pistasVistas >= pistas.length}
            className="min-h-11 rounded-xl border-2 border-teal-600 px-3 font-semibold text-teal-700 active:bg-teal-50 disabled:opacity-40"
          >
            💡 Ver una pista ({pistasVistas}/{pistas.length})
          </button>
          <button
            type="button"
            onClick={() => setVerPasos((v) => !v)}
            aria-expanded={verPasos}
            className="min-h-11 rounded-xl border-2 border-teal-600 px-3 font-semibold text-teal-700 active:bg-teal-50"
          >
            📋 {verPasos ? 'Ocultar la resolución' : 'Ver la resolución paso a paso'}
          </button>
        </div>

        {verPasos && (
          <ol className="space-y-3" aria-label="Resolución paso a paso">
            {problema.pasos.map((p, i) => (
              <li key={i} className="rounded-xl bg-slate-50 p-3">
                <div className="font-semibold text-slate-700">
                  {i + 1}. {p.texto}
                </div>
                <Formula block tex={p.tex} />
                <div>
                  Resultado:{' '}
                  <strong className="text-teal-700">
                    {fmt(p.valor, 4)} {p.unidad}
                  </strong>
                </div>
              </li>
            ))}
          </ol>
        )}
      </article>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={otroParecido}
          className="h-12 rounded-xl border-2 border-teal-600 font-semibold text-teal-700 active:bg-teal-50"
        >
          🔁 Otro parecido
        </button>
        <button
          type="button"
          onClick={() => otroDistinto()}
          className="h-12 rounded-xl bg-teal-600 font-semibold text-white active:bg-teal-700"
        >
          ➡️ Otro distinto
        </button>
      </div>
    </ModuloLayout>
  );
}
