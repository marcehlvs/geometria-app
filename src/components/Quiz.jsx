import { useState } from 'react';
import { crearAleatorio } from '../utils/rand.js';

// Pregunta de opción múltiple. Si el estudiante se equivoca, esa opción se
// tacha y puede probar con otra; al acertar se muestra la explicación.
//
//   <Quiz key={id}                      // usar `key` para reiniciarlo con otra pregunta
//         pregunta="¿Cuántos ejes de simetría tiene un cuadrado?"
//         opciones={['2', '4', '8']}
//         correcta={1}                   // posición de la opción correcta
//         explicacion="Dos por los puntos medios y dos por las diagonales."
//         barajar                        // (opcional) mezcla el orden
//         onResolver={({ intentos }) => ...} />

export default function Quiz({ pregunta, opciones, correcta, explicacion, barajar = false, onResolver }) {
  const [orden] = useState(() => {
    const posiciones = opciones.map((_, k) => k);
    return barajar ? crearAleatorio().shuffle(posiciones) : posiciones;
  });
  const [descartadas, setDescartadas] = useState([]);
  const [resuelta, setResuelta] = useState(false);

  const elegir = (k) => {
    if (resuelta || descartadas.includes(k)) return;
    if (k === correcta) {
      setResuelta(true);
      onResolver?.({ intentos: descartadas.length + 1 });
    } else {
      setDescartadas((d) => [...d, k]);
    }
  };

  const claseOpcion = (k) => {
    const base = 'flex min-h-11 w-full items-center gap-2 rounded-control border-2 px-3 py-2 text-left text-base transition';
    if (resuelta && k === correcta) return `${base} border-ok-line bg-ok-soft font-semibold text-ok-ink`;
    if (descartadas.includes(k)) return `${base} border-bad-line bg-bad-soft text-bad-ink line-through`;
    if (resuelta) return `${base} border-line bg-surface text-muted`;
    return `${base} border-line bg-surface text-ink active:border-brand active:bg-brand-soft`;
  };

  return (
    <div className="card p-4">
      <div className="mb-3 text-lg font-semibold">{pregunta}</div>
      <div className="flex flex-col gap-2">
        {orden.map((k) => (
          <button
            key={k}
            type="button"
            className={claseOpcion(k)}
            onClick={() => elegir(k)}
            disabled={resuelta || descartadas.includes(k)}
          >
            {/* el estado no depende solo del color: también hay un símbolo */}
            {resuelta && k === correcta && <span aria-hidden="true">✓</span>}
            {descartadas.includes(k) && <span aria-hidden="true">✗</span>}
            <span>{opciones[k]}</span>
          </button>
        ))}
      </div>
      <div aria-live="polite" className="mt-3 min-h-6 text-base">
        {resuelta ? (
          <p className="font-medium text-ok-ink">✅ ¡Correcto! {explicacion}</p>
        ) : descartadas.length > 0 ? (
          <p className="font-medium text-bad-ink">Esa no es. Probá con otra.</p>
        ) : null}
      </div>
    </div>
  );
}
