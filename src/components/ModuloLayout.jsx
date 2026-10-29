// Marco común de todos los módulos: barra superior con «← Menú» y el título.
export default function ModuloLayout({ titulo, icono, onVolver, children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-2">
          <button
            type="button"
            onClick={onVolver}
            className="h-11 shrink-0 rounded-lg px-3 font-medium text-teal-700 active:bg-teal-50"
          >
            ← Menú
          </button>
          <h1 className="truncate text-lg font-bold">
            {icono && <span aria-hidden="true">{icono} </span>}
            {titulo}
          </h1>
        </div>
      </header>
      <main className="mx-auto max-w-2xl p-4 pb-16">{children}</main>
    </div>
  );
}
