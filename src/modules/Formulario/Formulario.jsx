import { useEffect, useMemo, useState } from 'react';
import ModuloLayout from '../../components/ModuloLayout.jsx';
import Formula from '../../components/Formula.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { fmt } from '../../utils/format.js';
import {
  GRUPOS_FORMULARIO,
  TARJETAS,
  CALCULADORAS,
  tarjetasPorAnio,
  buscarTarjetas,
  calcularTarjeta,
  unidadConDim,
  UNIDADES_LONGITUD,
} from '../../data/formulario.js';

const colorBoton = (activo) =>
  activo ? 'border-teal-600 bg-teal-600 text-white' : 'border-slate-200 bg-white text-slate-700 active:bg-slate-100';

// ---------- Mini calculadora de una tarjeta ----------
function MiniCalculadora({ tarjeta, textos, onCambio, pi, unidad }) {
  const calc = CALCULADORAS[tarjeta.id];
  const [abierta, setAbierta] = useState(false);
  if (!calc) return null;

  const resultados = calcularTarjeta(tarjeta.id, textos, pi);
  const idPanel = `calc-${tarjeta.id}`;

  return (
    <div className="no-imprimir mt-3">
      <button
        type="button"
        onClick={() => setAbierta((a) => !a)}
        aria-expanded={abierta}
        aria-controls={idPanel}
        className="min-h-11 rounded-xl border-2 border-teal-600 px-3 font-semibold text-teal-700 active:bg-teal-50"
      >
        {abierta ? 'Cerrar calculadora' : 'Mini calculadora'}
      </button>

      {abierta && (
        <div id={idPanel} className="mt-3 space-y-3 rounded-xl bg-slate-50 p-3">
          <p className="text-sm text-slate-500">Completá los datos que tengas (en {unidad}). Los resultados aparecen solos.</p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(calc.campos).map(([k, etiqueta]) => (
              <label key={k} className="block text-sm font-medium text-slate-700">
                {etiqueta}
                <input
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  value={textos?.[k] ?? ''}
                  onChange={(e) => onCambio(tarjeta.id, k, e.target.value)}
                  className="mt-1 h-12 w-full rounded-xl border-2 border-slate-300 bg-white px-3 text-base outline-none focus:border-teal-500"
                />
              </label>
            ))}
          </div>
          <div aria-live="polite" className="min-h-6">
            {resultados.length === 0 ? (
              <p className="text-slate-500">Todavía faltan datos para calcular.</p>
            ) : (
              <ul className="space-y-1">
                {resultados.map((r) => (
                  <li key={r.nombre} data-calc-resultado={r.nombre}>
                    {r.nombre}:{' '}
                    <strong className="text-teal-700">
                      {fmt(r.valor)} {unidadConDim(r.dim, unidad)}
                    </strong>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- Una tarjeta del formulario ----------
function Tarjeta({ tarjeta, textos, onCambio, pi, unidad }) {
  const idTitulo = `titulo-${tarjeta.id}`;
  const variables = Object.entries(tarjeta.variables);
  return (
    <article aria-labelledby={idTitulo} className="tarjeta rounded-2xl border border-slate-200 bg-white p-4">
      <h3 id={idTitulo} className="text-lg font-bold text-slate-800">
        {tarjeta.nombre}
      </h3>
      <p className="text-xs text-slate-500">{tarjeta.anios.map((a) => `${a}.º`).join(' y ')} año</p>

      <div className="mt-2 space-y-1">
        {tarjeta.formulas.map((f) => (
          <div key={f.nombre}>
            <div className="text-sm font-semibold text-slate-600">{f.nombre}</div>
            <Formula block tex={f.tex} />
          </div>
        ))}
      </div>

      {variables.length > 0 && (
        <dl className="mt-2 grid grid-cols-[auto_1fr] items-baseline gap-x-3 gap-y-1 text-sm text-slate-700">
          {variables.map(([k, texto]) => (
            <div key={k} className="contents">
              <dt>
                <Formula tex={k} />
              </dt>
              <dd>{texto}</dd>
            </div>
          ))}
        </dl>
      )}

      {tarjeta.equivalencias && (
        <ul className="mt-2 grid grid-cols-1 gap-x-4 text-sm text-slate-700 sm:grid-cols-2">
          {tarjeta.equivalencias.map((e) => (
            <li key={e.id}>
              {e.de} = {fmt(e.valor)} {e.a}
            </li>
          ))}
        </ul>
      )}

      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-600">
        {tarjeta.propiedades.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>

      <MiniCalculadora tarjeta={tarjeta} textos={textos} onCambio={onCambio} pi={pi} unidad={unidad} />
    </article>
  );
}

export default function Formulario({ onVolver }) {
  const { marcarCompletado, anio, pi, piEscolar } = useApp();

  const [consulta, setConsulta] = useState('');
  const [filtroAnio, setFiltroAnio] = useState(anio || 0);
  const [unidad, setUnidad] = useState('cm');
  const [valores, setValores] = useState({}); // { idTarjeta: { campo: 'texto' } }

  // Es un módulo de consulta (no tiene pasos): queda marcado al abrirlo.
  useEffect(() => {
    marcarCompletado('formulario');
  }, [marcarCompletado]);

  const cambiarValor = (id, campo, texto) => setValores((v) => ({ ...v, [id]: { ...v[id], [campo]: texto } }));

  const visibles = useMemo(() => buscarTarjetas(tarjetasPorAnio(filtroAnio, TARJETAS), consulta), [filtroAnio, consulta]);

  return (
    <ModuloLayout titulo="Formulario" icono="📖" onVolver={onVolver}>
      <h2 className="mb-3 hidden text-2xl font-bold print:block">Formulario de Geometría</h2>

      <div className="no-imprimir space-y-3">
        <label className="block">
          <span className="sr-only">Buscar fórmula</span>
          <input
            type="search"
            value={consulta}
            onChange={(e) => setConsulta(e.target.value)}
            placeholder="Buscar: área, volumen, cilindro…"
            autoComplete="off"
            className="h-12 w-full rounded-xl border-2 border-slate-300 bg-white px-3 text-base outline-none focus:border-teal-500"
          />
        </label>

        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Año">
          {[
            [0, 'Todos'],
            [1, '1.º año'],
            [2, '2.º año'],
          ].map(([valor, texto]) => (
            <button
              key={valor}
              type="button"
              onClick={() => setFiltroAnio(valor)}
              aria-pressed={filtroAnio === valor}
              className={`min-h-11 rounded-xl border-2 px-3 text-sm font-semibold transition ${colorBoton(filtroAnio === valor)}`}
            >
              {texto}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Unidad de las calculadoras">
          <span className="text-sm text-slate-600">Unidad de las calculadoras:</span>
          {UNIDADES_LONGITUD.map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => setUnidad(u)}
              aria-pressed={unidad === u}
              className={`min-h-11 min-w-11 rounded-xl border-2 px-3 text-sm font-semibold transition ${colorBoton(unidad === u)}`}
            >
              {u}
            </button>
          ))}
        </div>
        <p className="text-sm text-slate-500">
          {piEscolar ? 'Las calculadoras usan π = 3,14.' : 'Las calculadoras usan el valor exacto de π: los resultados con π son aproximados.'}
        </p>

        <div className="flex items-center justify-between gap-3">
          <p aria-live="polite" className="text-slate-600">
            {visibles.length === 1 ? '1 tarjeta' : `${visibles.length} tarjetas`}
          </p>
          <button
            type="button"
            onClick={() => window.print()}
            className="min-h-11 rounded-xl bg-teal-600 px-4 font-semibold text-white active:bg-teal-700"
          >
            🖨️ Imprimir resumen
          </button>
        </div>
      </div>

      {visibles.length === 0 && (
        <p className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-slate-600">
          No encontramos fórmulas con «{consulta}». Probá con otra palabra, por ejemplo «área» o «volumen».
        </p>
      )}

      {GRUPOS_FORMULARIO.map((g) => {
        const delGrupo = visibles.filter((t) => t.grupo === g.id);
        if (delGrupo.length === 0) return null;
        return (
          <section key={g.id} aria-labelledby={`grupo-formulario-${g.id}`} className="mt-6">
            <h2 id={`grupo-formulario-${g.id}`} className="mb-2 text-lg font-bold text-slate-800">
              {g.icono} {g.titulo}
            </h2>
            <div className="space-y-3">
              {delGrupo.map((t) => (
                <Tarjeta key={t.id} tarjeta={t} textos={valores[t.id]} onCambio={cambiarValor} pi={pi} unidad={unidad} />
              ))}
            </div>
          </section>
        );
      })}
    </ModuloLayout>
  );
}
