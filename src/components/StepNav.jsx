import { useEffect, useRef, useState } from 'react';

// Navegación por pasos con «Anterior / Siguiente».
// Cada paso: { titulo, contenido, bloqueado }.  Si `bloqueado` es true, el botón
// «Siguiente» queda deshabilitado hasta resolver la actividad del paso.
//
//   <StepNav pasos={[{ titulo: 'Explorá', contenido: <.../>, bloqueado: !hecho }, ...]}
//            onFinish={() => ...} textoFinal="Terminar ✓" />

export default function StepNav({ pasos, onFinish, textoFinal = 'Terminar ✓' }) {
  const [i, setI] = useState(0);
  const [maxVisto, setMaxVisto] = useState(0);
  const tope = useRef(null);
  const primera = useRef(true);

  const indice = Math.min(i, pasos.length - 1);
  const actual = pasos[indice];
  const esUltimo = indice === pasos.length - 1;

  // Al cambiar de paso, volver al comienzo (importante en el celular)
  useEffect(() => {
    if (primera.current) {
      primera.current = false;
      return;
    }
    tope.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
  }, [indice]);

  const ir = (n) => {
    setI(n);
    setMaxVisto((m) => Math.max(m, n));
  };

  return (
    <div ref={tope} className="scroll-mt-20">
      <div className="mb-3 flex items-center gap-1.5" aria-label="Pasos">
        {pasos.map((p, k) => (
          <button
            key={k}
            type="button"
            disabled={k > maxVisto}
            onClick={() => setI(k)}
            aria-label={`Ir al paso ${k + 1}: ${p.titulo}`}
            aria-current={k === indice ? 'step' : undefined}
            className="flex h-11 flex-1 items-center"
          >
            <span
              className={`block h-2.5 w-full rounded-full transition ${
                k === indice ? 'bg-brand' : k <= maxVisto ? 'bg-brand/40' : 'bg-line'
              }`}
            />
          </button>
        ))}
      </div>

      <p className="text-sm font-medium text-muted">
        Paso {indice + 1} de {pasos.length}
      </p>
      <h2 className="mb-3 text-title font-bold">{actual.titulo}</h2>

      <div key={indice} className="space-y-4">{actual.contenido}</div>

      <div className="mt-6 flex items-center gap-3 lg:mt-8">
        <button
          type="button"
          onClick={() => setI(indice - 1)}
          disabled={indice === 0}
          className="btn btn-secondary btn-lg"
        >
          ← Anterior
        </button>
        {esUltimo ? (
          <button
            type="button"
            onClick={onFinish}
            className="btn btn-primary btn-lg flex-1"
          >
            {textoFinal}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => ir(indice + 1)}
            disabled={actual.bloqueado}
            aria-describedby={actual.bloqueado ? 'paso-ayuda' : undefined}
            className="btn btn-primary btn-lg flex-1"
          >
            Siguiente →
          </button>
        )}
      </div>
      {actual.bloqueado && !esUltimo && (
        <p id="paso-ayuda" className="mt-2 text-sm text-muted">Resolvé la actividad para continuar.</p>
      )}
    </div>
  );
}
