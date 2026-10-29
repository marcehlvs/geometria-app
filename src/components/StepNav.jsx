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
            className={`h-2.5 flex-1 rounded-full transition ${
              k === indice ? 'bg-teal-600' : k <= maxVisto ? 'bg-teal-300' : 'bg-slate-200'
            }`}
          />
        ))}
      </div>

      <p className="text-sm font-medium text-slate-500">
        Paso {indice + 1} de {pasos.length}
      </p>
      <h2 className="mb-3 text-xl font-bold">{actual.titulo}</h2>

      <div key={indice} className="space-y-4">{actual.contenido}</div>

      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setI(indice - 1)}
          disabled={indice === 0}
          className="h-12 rounded-xl border-2 border-slate-300 bg-white px-5 font-semibold text-slate-700 active:bg-slate-100 disabled:opacity-40"
        >
          ← Anterior
        </button>
        {esUltimo ? (
          <button
            type="button"
            onClick={onFinish}
            className="h-12 flex-1 rounded-xl bg-teal-600 px-5 font-semibold text-white active:bg-teal-700"
          >
            {textoFinal}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => ir(indice + 1)}
            disabled={actual.bloqueado}
            className="h-12 flex-1 rounded-xl bg-teal-600 px-5 font-semibold text-white active:bg-teal-700 disabled:opacity-40"
          >
            Siguiente →
          </button>
        )}
      </div>
      {actual.bloqueado && !esUltimo && (
        <p className="mt-2 text-sm text-slate-500">Resolvé la actividad para continuar.</p>
      )}
    </div>
  );
}
