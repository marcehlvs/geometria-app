import { useId, useState } from 'react';
import { parseNum, casiIgual, fmt } from '../utils/format.js';

// Campo para responder con un número (acepta coma o punto).
//   <NumInput etiqueta="Área del rectángulo" unidad="cm²" correcto={24}
//             tolerancia={0.01} pista="Base por altura."
//             onResultado={({ correcto, intentos, revelado }) => ...} />
// Después de 2 intentos fallidos aparece "Ver resultado".

export default function NumInput({ etiqueta, correcto, unidad = '', tolerancia = 0.01, pista, onResultado }) {
  const id = useId();
  const [texto, setTexto] = useState('');
  const [estado, setEstado] = useState('inicial'); // inicial | ok | mal | invalido | revelado
  const [fallos, setFallos] = useState(0);

  const terminado = estado === 'ok' || estado === 'revelado';

  const comprobar = () => {
    if (terminado) return;
    const n = parseNum(texto);
    if (Number.isNaN(n)) {
      setEstado('invalido');
      return;
    }
    if (casiIgual(n, correcto, tolerancia)) {
      setEstado('ok');
      onResultado?.({ correcto: true, intentos: fallos + 1, revelado: false });
    } else {
      setEstado('mal');
      setFallos((f) => f + 1);
    }
  };

  const revelar = () => {
    setEstado('revelado');
    onResultado?.({ correcto: false, intentos: fallos, revelado: true });
  };

  const estadoCampo = estado === 'ok' ? 'ok' : estado === 'mal' || estado === 'invalido' ? 'error' : undefined;
  const hayError = estadoCampo === 'error';

  return (
    <div className="card p-4">
      <label className="mb-2 block text-lg font-semibold" htmlFor={`${id}-campo`}>{etiqueta}</label>
      <div className="flex items-stretch gap-2">
        <div className="field flex-1" data-estado={estadoCampo}>
          <input
            id={`${id}-campo`}
            type="text"
            inputMode="decimal"
            enterKeyHint="done"
            autoComplete="off"
            value={texto}
            readOnly={terminado}
            aria-invalid={hayError || undefined}
            aria-describedby={`${id}-msg`}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && comprobar()}
            placeholder="Tu respuesta"
          />
          {unidad && <span className="ml-2 shrink-0 text-muted">{unidad}</span>}
        </div>
        <button
          type="button"
          onClick={comprobar}
          disabled={terminado || texto.trim() === ''}
          className="btn btn-primary btn-lg shrink-0"
        >
          Comprobar
        </button>
      </div>

      <div id={`${id}-msg`} aria-live="polite" className="mt-3 min-h-6">
        {estado === 'ok' && <p className="font-medium text-ok-ink">✅ ¡Correcto!</p>}
        {estado === 'invalido' && <p className="font-medium text-bad-ink">Escribí solo un número (podés usar coma: 3,5).</p>}
        {estado === 'mal' && (
          <p className="font-medium text-bad-ink">
            ❌ No coincide. Revisá el cálculo.{pista ? ` Pista: ${pista}` : ''}
          </p>
        )}
        {estado === 'revelado' && (
          <p>
            El resultado era <strong>{fmt(correcto)}{unidad && ` ${unidad}`}</strong>. Repasalo y seguimos.
          </p>
        )}
        {fallos >= 2 && !terminado && (
          <button type="button" onClick={revelar} className="btn btn-ghost mt-2 underline">
            Ver resultado
          </button>
        )}
      </div>
    </div>
  );
}
