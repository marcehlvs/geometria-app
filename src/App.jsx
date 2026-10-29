import { Suspense, useEffect, useState } from 'react';
import { AppProvider, useApp } from './context/AppContext.jsx';
import BarraAjustes from './components/BarraAjustes.jsx';
import ProgressBar from './components/ProgressBar.jsx';
import { GRUPOS, MODULOS, modulosPorAnio } from './data/modulos.js';
import { COMPONENTES } from './modules/index.js';

// Navegación simple por "hash": geometria-app.com/#triangulos abre ese módulo.
// Así el botón «atrás» del celular vuelve al menú, sin librerías de rutas.
const leerHash = () => (typeof window === 'undefined' ? '' : window.location.hash.replace(/^#\/?/, ''));

function Menu({ abrir }) {
  const { anio, completados, reiniciarProgreso } = useApp();

  const visibles = modulosPorAnio(anio);
  const disponibles = visibles.filter((m) => COMPONENTES[m.id] && m.id !== 'demo');
  const hechos = disponibles.filter((m) => completados.includes(m.id)).length;

  const reiniciar = () => {
    if (window.confirm('¿Borrar todo tu progreso?')) reiniciarProgreso();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-gradient-to-br from-teal-700 to-teal-500 px-4 pb-6 pt-8 text-white">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-3xl font-extrabold">📐 Geometría en acción</h1>
          <p className="mt-1 text-teal-50">Figuras planas y cuerpos · 1.º y 2.º año</p>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-6 px-4 py-5 pb-16">
        <BarraAjustes />

        {disponibles.length > 0 && (
          <ProgressBar valor={hechos} max={disponibles.length} etiqueta="Tu avance" />
        )}

        {GRUPOS.map((g) => {
          const delGrupo = visibles.filter((m) => m.grupo === g.id);
          if (delGrupo.length === 0) return null;
          return (
            <section key={g.id} aria-labelledby={`grupo-${g.id}`}>
              <h2 id={`grupo-${g.id}`} className="mb-2 text-lg font-bold text-slate-800">
                {g.icono} {g.titulo}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {delGrupo.map((m) => {
                  const listo = Boolean(COMPONENTES[m.id]);
                  const hecho = completados.includes(m.id);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      disabled={!listo}
                      onClick={() => abrir(m.id)}
                      className={`flex min-h-20 items-start gap-3 rounded-2xl border-2 p-3 text-left transition ${
                        listo
                          ? 'border-slate-200 bg-white active:border-teal-500 active:bg-teal-50'
                          : 'border-dashed border-slate-300 bg-slate-100 text-slate-400'
                      }`}
                    >
                      <span className="text-3xl" aria-hidden="true">{m.icono}</span>
                      <span className="flex-1">
                        <span className="flex items-center gap-2 font-semibold">
                          {m.titulo}
                          {hecho && <span className="text-green-600" aria-label="completado">✓</span>}
                          {!listo && (
                            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-500">
                              Próximamente
                            </span>
                          )}
                        </span>
                        <span className="mt-0.5 block text-sm text-slate-500">{m.descripcion}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}

        {completados.length > 0 && (
          <div className="text-center">
            <button type="button" onClick={reiniciar} className="h-11 px-3 text-sm text-slate-500 underline">
              Reiniciar progreso
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

function Cargando() {
  return <div className="p-8 text-center text-slate-500">Cargando…</div>;
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
  if (Modulo && MODULOS.some((m) => m.id === ruta)) {
    return (
      <Suspense fallback={<Cargando />}>
        <Modulo onVolver={volver} />
      </Suspense>
    );
  }
  return <Menu abrir={abrir} />;
}

export default function App() {
  return (
    <AppProvider>
      <Raiz />
    </AppProvider>
  );
}
