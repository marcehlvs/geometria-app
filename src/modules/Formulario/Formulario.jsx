import { useEffect, useMemo, useState } from 'react';
import ModuloLayout from '../../components/ModuloLayout.jsx';
import Formula from '../../components/Formula.jsx';
import { EmptyState } from '../../components/ui.jsx';
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

const colorBoton = (activo) => (activo ? 'chip chip-on' : 'chip');

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
        className="btn btn-secondary"
      >
        {abierta ? 'Cerrar calculadora' : 'Mini calculadora'}
      </button>

      {abierta && (
        <div id={idPanel} className="mt-3 space-y-3 rounded-xl bg-slate-50 p-3">
          <p className="text-sm text-muted">Completá los datos que tengas (en {unidad}). Los resultados aparecen solos.</p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(calc.campos).map(([k, etiqueta]) => (
              <label key={k} className="block text-sm font-medium text-ink">
                {etiqueta}
                <input
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  value={textos?.[k] ?? ''}
                  onChange={(e) => onCambio(tarjeta.id, k, e.target.value)}
                  className="input mt-1 w-full"
                />
              </label>
            ))}
          </div>
          <div aria-live="polite" className="min-h-6">
            {resultados.length === 0 ? (
              <p className="text-muted">Todavía faltan datos para calcular.</p>
            ) : (
              <ul className="space-y-1">
                {resultados.map((r) => (
                  <li key={r.nombre} data-calc-resultado={r.nombre}>
                    {r.nombre}:{' '}
                    <strong className="text-brand-ink">
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
    <article aria-labelledby={idTitulo} className="card tarjeta p-4">
      <h3 id={idTitulo} className="text-lg font-bold text-ink">
        {tarjeta.nombre}
      </h3>
      <p className="text-sm text-muted">{tarjeta.anios.map((a) => `${a}.º`).join(' y ')} año</p>

      <div className="mt-2 space-y-1">
        {tarjeta.formulas.map((f) => (
          <div key={f.nombre}>
            <div className="text-sm font-semibold text-muted">{f.nombre}</div>
            <Formula block tex={f.tex} />
          </div>
        ))}
      </div>

      {variables.length > 0 && (
        <dl className="mt-2 grid grid-cols-[auto_1fr] items-baseline gap-x-3 gap-y-1 text-sm text-ink">
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
        <ul className="mt-2 grid grid-cols-1 gap-x-4 text-sm text-ink sm:grid-cols-2">
          {tarjeta.equivalencias.map((e) => (
            <li key={e.id}>
              {e.de} = {fmt(e.valor)} {e.a}
            </li>
          ))}
        </ul>
      )}

      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted">
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
            className="input w-full"
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
              className={`${colorBoton(filtroAnio === valor)}`}
            >
              {texto}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Unidad de las calculadoras">
          <span className="text-sm text-muted">Unidad de las calculadoras:</span>
          {UNIDADES_LONGITUD.map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => setUnidad(u)}
              aria-pressed={unidad === u}
              className={`${colorBoton(unidad === u)}`}
            >
              {u}
            </button>
          ))}
        </div>
        <p className="text-sm text-muted">
          {piEscolar ? 'Las calculadoras usan π = 3,14.' : 'Las calculadoras usan el valor exacto de π: los resultados con π son aproximados.'}
        </p>

        <div className="flex items-center justify-between gap-3">
          <p aria-live="polite" className="text-muted">
            {visibles.length === 1 ? '1 tarjeta' : `${visibles.length} tarjetas`}
          </p>
          <button
            type="button"
            onClick={() => window.print()}
            className="btn btn-primary"
          >
            🖨️ Imprimir resumen
          </button>
        </div>
      </div>

      {visibles.length === 0 && (
        <div className="mt-6">
          <EmptyState
            titulo="Sin resultados"
            accion={<button type="button" className="btn btn-secondary" onClick={() => setConsulta('')}>Borrar búsqueda</button>}
          >
            No encontramos fórmulas con «{consulta}». Probá con otra palabra, por ejemplo «área» o «volumen».
          </EmptyState>
        </div>
      )}

      {GRUPOS_FORMULARIO.map((g) => {
        const delGrupo = visibles.filter((t) => t.grupo === g.id);
        if (delGrupo.length === 0) return null;
        return (
          <section key={g.id} aria-labelledby={`grupo-formulario-${g.id}`} className="mt-6">
            <h2 id={`grupo-formulario-${g.id}`} className="mb-2 text-lg font-bold text-ink">
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
