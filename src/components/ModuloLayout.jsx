import ThemeToggle from './ThemeToggle.jsx';

// Marco común de todos los módulos: barra superior (← Menú, título, tema) y el contenido.
// Ancho: se lee cómodo en celular (375), tablet (768) y escritorio (1280+).
const irAlContenido = () => document.getElementById('contenido')?.focus();

export default function ModuloLayout({ titulo, icono, onVolver, children }) {
  return (
    <div className="min-h-screen bg-page">
      <button type="button" className="skip-link no-imprimir" onClick={irAlContenido}>Saltar al contenido</button>
      <header className="no-imprimir sticky top-0 z-10 border-b border-line bg-surface/90 backdrop-blur">
        <div className="page-wrap flex max-w-3xl items-center gap-1 py-1.5 lg:max-w-4xl">
          <button type="button" onClick={onVolver} className="btn btn-ghost shrink-0 !px-3">
            ← Menú
          </button>
          <h1 className="min-w-0 flex-1 text-base font-bold leading-tight sm:text-lg">
            {icono && <span aria-hidden="true">{icono} </span>}
            {titulo}
          </h1>
          <ThemeToggle />
        </div>
      </header>
      <main id="contenido" tabIndex={-1} className="page-wrap max-w-3xl py-4 pb-16 outline-none md:py-6 lg:max-w-4xl lg:py-8">
        {children}
      </main>
    </div>
  );
}
