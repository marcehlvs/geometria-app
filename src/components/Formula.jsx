import { useMemo } from 'react';
import katex from 'katex';

// Muestra una fórmula en LaTeX.
//   <Formula tex="A = \\pi \\cdot r^2" />            (en línea, dentro de un texto)
//   <Formula tex="A = \\pi \\cdot r^2" block />      (centrada, en su propio renglón)
// IMPORTANTE: `tex` siempre sale de nuestro código (nunca de lo que escribe el
// estudiante), por eso es seguro inyectar el HTML que genera KaTeX.

export default function Formula({ tex, block = false, className = '' }) {
  const html = useMemo(
    () => katex.renderToString(tex, { throwOnError: false, displayMode: block }),
    [tex, block]
  );
  const Etiqueta = block ? 'div' : 'span';
  return (
    <Etiqueta
      className={`${block ? 'overflow-x-auto py-1 text-center' : ''} ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
