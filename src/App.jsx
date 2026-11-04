import { Suspense, useEffect, useState } from 'react';
import { AppProvider, useApp } from './context/AppContext.jsx';
import BarraAjustes from './components/BarraAjustes.jsx';
import ProgressBar from './components/ProgressBar.jsx';
import ThemeToggle from './components/ThemeToggle.jsx';
import { Alert, Cargando, EmptyState, ErrorBoundary, Modal } from './components/ui.jsx';
import { GRUPOS, MODULOS, modulosPorAnio } from './data/modulos.js';
import { COMPONENTES } from './modules/index.js';

// Navegación simple por "hash": geometria-app.com/#triangulos abre ese módulo.
// Así el botón «atrás» del celular vuelve al menú, sin librerías de rutas.
const leerHash = () => (typeof window === 'undefined' ? '' : window.location.hash.replace(/^#\/?/, ''));

const irAlContenido = () => document.getElementById('contenido')?.focus();

export function Menu({ abrir }) {
  const { anio, setAnio, completados, reiniciarProgreso, ultimoCompletado, limpiarAviso } = useApp();
  const [confirmando, setConfirmando] = useState(false);

  const visibles = modulosPorAnio(anio);
  const disponibles = visibles.filter((m) => COMPONENTES[m.id]);
  const hechos = disponibles.filter((m) => completados.includes(m.id)).length;
  const siguiente = disponibles.find((m) => !completados.includes(m.id));
  const terminoTodo = disponibles.length > 0 && !siguiente;
  const recien = MODULOS.find((m) => m.id === ultimoCompletado);

  const reiniciar = () => {
    reiniciarProgreso();
    setConfirmando(false);
  };

  return (
    <div className="min-h-screen bg-page">
      <button type="button" className="skip-link" onClick={irAlContenido}>Saltar al contenido</button>

      {/* Portada: una sola acción principal */}
      <header className="border-b border-line bg-brand-soft">
        <div className="page-wrap">
          <div className="flex justify-end pt-2"><ThemeToggle /></div>
          <div className="grid items-center gap-6 pb-8 pt-2 md:grid-cols-[1fr_20rem] md:pb-10 lg:gap-12">
            <div>
              <h1 className="text-display font-extrabold text-ink">📐 Geometría en acción</h1>
              <p className="mt-2 text-lg text-muted">Figuras y cuerpos · 1.º y 2.º año</p>
              {siguiente && (
                <button type="button" className="btn btn-primary btn-lg mt-5 w-full sm:w-auto" onClick={() => abrir(siguiente.id)}>
                  {`${hechos === 0 ? 'Empezar' : 'Continuar'}: ${siguiente.titulo} →`}
                </button>
              )}
              {terminoTodo && (
                <Alert tono="ok" titulo="¡Terminaste todos los módulos!" className="mt-5">
                  Podés repasar cuando quieras.
                </Alert>
              )}
            </div>
            {disponibles.length > 0 && (
              <div className="card p-4 md:p-5">
                <p className="text-sm font-semibold text-muted">Tu avance</p>
                <p className="my-1 text-4xl font-extrabold tabular-nums">
                  {hechos}<span className="text-xl font-bold text-muted"> de {disponibles.length}</span>
                </p>
                <ProgressBar valor={hechos} max={disponibles.length} etiqueta="" />
              </div>
            )}
          </div>
        </div>
      </header>

      <main id="contenido" tabIndex={-1} className="page-wrap space-y-8 py-6 pb-16 outline-none md:py-8">
        {recien && (
          <Alert tono="ok" titulo="¡Módulo completado!" onCerrar={limpiarAviso}>
            Terminaste «{recien.titulo}».
          </Alert>
        )}

        <BarraAjustes />

        {visibles.length === 0 && (
          <EmptyState
            titulo="No hay módulos para este año"
            accion={<button type="button" className="btn btn-primary" onClick={() => setAnio(0)}>Ver todos</button>}
          >
            Elegí «Todos» para ver el contenido completo.
          </EmptyState>
        )}

        {GRUPOS.map((g) => {
          const delGrupo = visibles.filter((m) => m.grupo === g.id);
          if (delGrupo.length === 0) return null;
          const hechosGrupo = delGrupo.filter((m) => completados.includes(m.id)).length;
          return (
            <section key={g.id} aria-labelledby={`grupo-${g.id}`}>
              <h2 id={`grupo-${g.id}`} className="mb-3 flex items-center gap-2 text-title font-bold">
                {g.icono} {g.titulo}
                <span className="badge" aria-label={`${hechosGrupo} de ${delGrupo.length} completados`}>{hechosGrupo}/{delGrupo.length}</span>
              </h2>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {delGrupo.map((m) => {
                  const listo = Boolean(COMPONENTES[m.id]);
                  const hecho = completados.includes(m.id);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      disabled={!listo}
                      onClick={() => abrir(m.id)}
                      className="card card-link min-h-20 items-center gap-3 p-3"
                    >
                      <span className="grid size-12 shrink-0 place-items-center rounded-control bg-surface-2 text-2xl" aria-hidden="true">
                        {m.icono}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-x-2 gap-y-1 font-semibold">
                          {m.titulo}
                          {hecho && <span role="img" aria-label="completado" className="badge badge-ok">✓ Hecho</span>}
                          {!listo && <span className="badge">Próximamente</span>}
                        </span>
                        <span className="mt-0.5 block text-sm text-muted">{m.descripcion}</span>
                      </span>
                      <span className="text-2xl text-muted" aria-hidden="true">›</span>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}

        {completados.length > 0 && (
          <div className="text-center">
            <button type="button" onClick={() => setConfirmando(true)} className="btn btn-ghost">
              Reiniciar progreso
            </button>
          </div>
        )}
      </main>

      <Modal abierto={confirmando} titulo="¿Borrar tu progreso?" onCerrar={() => setConfirmando(false)}>
        <p>Se van a borrar los módulos que marcaste como hechos. No se puede deshacer.</p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" className="btn btn-secondary" data-autofocus onClick={() => setConfirmando(false)}>Cancelar</button>
          <button type="button" className="btn btn-danger" onClick={reiniciar}>Sí, borrar</button>
        </div>
      </Modal>
    </div>
  );
}

function Raiz() {
  const [ruta, setRuta] = useState(leerHash);

  useEffect(() => {
    const alCambiar = () => setRuta(leerHash());
    window.addEventListener('hashchange', alCambiar);
    return () => window.removeEventListener('hashchange', alCambiar);
  }, []);

  const volver = () => {
    window.location.hash = '';
  };
  const abrir = (id) => {
    window.location.hash = id;
    window.scrollTo?.(0, 0);
  };

  const Modulo = COMPONENTES[ruta];
  const esModulo = Boolean(Modulo) && MODULOS.some((m) => m.id === ruta);
  return (
    <ErrorBoundary resetKey={ruta} onVolver={volver}>
      {esModulo ? (
        <Suspense fallback={<Cargando />}>
          <Modulo onVolver={volver} />
        </Suspense>
      ) : (
        <Menu abrir={abrir} />
      )}
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Raiz />
    </AppProvider>
  );
}
