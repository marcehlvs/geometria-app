import { Component, useEffect, useRef } from 'react';

// Piezas de interfaz compartidas por toda la app (los estilos viven en styles/components.css).

const ICONOS = { ok: '✅', bad: '⚠️', warn: '💡', info: 'ℹ️' };

// Aviso: tono = ok | bad | warn | info. Los errores se anuncian con role="alert";
// el resto con role="status" (el lector de pantalla lo dice sin interrumpir).
export function Alert({ tono = 'info', titulo, children, onCerrar, className = '' }) {
  return (
    <div role={tono === 'bad' ? 'alert' : 'status'} className={`alert alert-${tono} ${className}`}>
      <span aria-hidden="true">{ICONOS[tono]}</span>
      <div className="min-w-0 flex-1">
        {titulo && <p className="font-semibold">{titulo}</p>}
        {children}
      </div>
      {onCerrar && (
        <button type="button" className="btn btn-ghost -my-1 -mr-2" aria-label="Cerrar aviso" onClick={onCerrar}>
          <span aria-hidden="true">✕</span>
        </button>
      )}
    </div>
  );
}

// Estado vacío: cuando no hay nada para mostrar (búsqueda sin resultados, filtro sin módulos…)
export function EmptyState({ icono = '🔍', titulo, children, accion }) {
  return (
    <div className="rounded-card border-2 border-dashed border-line bg-surface p-8 text-center">
      <p className="text-4xl" aria-hidden="true">{icono}</p>
      <h3 className="mt-2 text-lg font-bold">{titulo}</h3>
      {children && <p className="mx-auto mt-1 max-w-md text-muted">{children}</p>}
      {accion && <div className="mt-4">{accion}</div>}
    </div>
  );
}

// Estado de carga (esqueleto): reserva el lugar para que la pantalla no «salte»
export function Cargando({ texto = 'Cargando…' }) {
  return (
    <div role="status" aria-live="polite" className="page-wrap max-w-3xl space-y-4 py-8">
      <span className="sr-only">{texto}</span>
      <div className="skeleton h-8 w-2/3" />
      <div className="skeleton h-4 w-full" />
      <div className="skeleton h-4 w-5/6" />
      <div className="skeleton h-56 w-full" />
      <div className="skeleton h-12 w-full" />
    </div>
  );
}

// Ventana modal accesible: foco adentro, Tab no se escapa, Esc cierra, devuelve el foco al cerrar.
export function Modal({ abierto, titulo, onCerrar, children }) {
  const caja = useRef(null);

  useEffect(() => {
    if (!abierto) return undefined;
    const previo = document.activeElement;
    const enfocables = () =>
      [...(caja.current?.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])') ?? [])].filter(
        (el) => !el.disabled
      );
    // foco inicial: el elemento marcado con data-autofocus (la opción segura), o el primero
    (caja.current?.querySelector('[data-autofocus]') ?? enfocables()[0] ?? caja.current)?.focus();
    const alTeclear = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCerrar();
      } else if (e.key === 'Tab') {
        const lista = enfocables();
        if (lista.length === 0) return;
        const primero = lista[0];
        const ultimo = lista[lista.length - 1];
        if (e.shiftKey && document.activeElement === primero) {
          e.preventDefault();
          ultimo.focus();
        } else if (!e.shiftKey && document.activeElement === ultimo) {
          e.preventDefault();
          primero.focus();
        }
      }
    };
    document.addEventListener('keydown', alTeclear);
    return () => {
      document.removeEventListener('keydown', alTeclear);
      previo?.focus?.();
    };
  }, [abierto, onCerrar]);

  if (!abierto) return null;
  return (
    <div className="modal-fondo no-imprimir" onMouseDown={(e) => e.target === e.currentTarget && onCerrar()}>
      <div ref={caja} role="dialog" aria-modal="true" aria-labelledby="modal-titulo" tabIndex={-1} className="modal">
        <h2 id="modal-titulo" className="text-title font-bold">{titulo}</h2>
        <div className="mt-2 text-muted">{children}</div>
      </div>
    </div>
  );
}

// Error al cargar un módulo (por ejemplo, sin internet): mensaje claro y salida a mano.
export class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidUpdate(previas) {
    if (previas.resetKey !== this.props.resetKey && this.state.error) this.setState({ error: null });
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="page-wrap max-w-xl py-12">
        <Alert tono="bad" titulo="No se pudo cargar esta pantalla">
          <p className="mt-1">Puede ser un problema de conexión. Revisá internet y probá de nuevo.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>Reintentar</button>
            {this.props.onVolver && (
              <button type="button" className="btn btn-secondary" onClick={this.props.onVolver}>Volver al menú</button>
            )}
          </div>
        </Alert>
      </div>
    );
  }
}
