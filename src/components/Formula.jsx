import { useEffect, useMemo, useRef, useState } from 'react';
import katex from 'katex';

// Muestra una fórmula en LaTeX.
//   <Formula tex="A = \\pi \\cdot r^2" />            (en línea, dentro de un texto)
//   <Formula tex="A = \\pi \\cdot r^2" block />      (centrada, en su propio renglón)
// IMPORTANTE: `tex` siempre sale de nuestro código (nunca de lo que escribe el
// estudiante), por eso es seguro inyectar el HTML que genera KaTeX.
//
// Las fórmulas en bloque que no entran en pantallas angostas se desplazan de costado;
// en ese caso (y solo en ese) se pueden enfocar con el teclado para poder recorrerlas.

export default function Formula({ tex, block = false, className = '' }) {
  const html = useMemo(
    () => katex.renderToString(tex, { throwOnError: false, displayMode: block }),
    [tex, block]
  );
  const ref = useRef(null);
  const [desborda, setDesborda] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!block || !el) return undefined;
    const medir = () => setDesborda(el.scrollWidth > el.clientWidth + 1);
    medir();
    document.fonts?.ready?.then(medir); // las tipografías de KaTeX cambian el ancho al cargar
    if (typeof ResizeObserver === 'undefined') return undefined;
    const observador = new ResizeObserver(medir);
    observador.observe(el);
    return () => observador.disconnect();
  }, [html, block]);

  if (!block) {
    return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
  }
  return (
    <div
      ref={ref}
      className={`overflow-x-auto py-1 text-center ${className}`}
      {...(desborda ? { tabIndex: 0, role: 'group', 'aria-label': 'Fórmula (se puede desplazar de costado)' } : {})}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
