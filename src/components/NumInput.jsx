import { useState } from 'react';
import { parseNum, casiIgual, fmt } from '../utils/format.js';

// Campo para responder con un número (acepta coma o punto).
//   <NumInput etiqueta="Área del rectángulo" unidad="cm²" correcto={24}
//             tolerancia={0.01} pista="Base por altura."
//             onResultado={({ correcto, intentos, revelado }) => ...} />
// Después de 2 intentos fallidos aparece "Ver resultado".

export default function NumInput({ etiqueta, correcto, unidad = '', tolerancia = 0.01, pista, onResultado }) {
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

  const colorBorde =
    estado === 'ok' ? 'border-green-500 bg-green-50'
    : estado === 'mal' || estado === 'invalido' ? 'border-red-400 bg-red-50'
    : 'border-slate-300 bg-white';

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <label className="mb-2 block text-lg font-semibold" htmlFor="numinput-campo">{etiqueta}</label>
      <div className="flex items-stretch gap-2">
        <div className={`flex flex-1 items-center rounded-xl border-2 px-3 ${colorBorde}`}>
          <input
            id="numinput-campo"
            type="text"
            inputMode="decimal"
            enterKeyHint="done"
            autoComplete="off"
            value={texto}
            readOnly={terminado}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && comprobar()}
            placeholder="Tu respuesta"
            className="h-12 w-full bg-transparent text-lg outline-none"
          />
          {unidad && <span className="ml-2 shrink-0 text-slate-500">{unidad}</span>}
        </div>
        <button
          type="button"
          onClick={comprobar}
          disabled={terminado || texto.trim() === ''}
          className="h-12 shrink-0 rounded-xl bg-teal-600 px-4 font-semibold text-white active:bg-teal-700 disabled:opacity-40"
        >
          Comprobar
        </button>
      </div>

      <div aria-live="polite" className="mt-3 min-h-6">
        {estado === 'ok' && <p className="text-green-700">✅ ¡Correcto!</p>}
        {estado === 'invalido' && <p className="text-red-600">Escribí solo un número (podés usar coma: 3,5).</p>}
        {estado === 'mal' && (
          <p className="text-red-600">
            ❌ No coincide. Revisá el cálculo.{pista ? ` Pista: ${pista}` : ''}
          </p>
        )}
        {estado === 'revelado' && (
          <p className="text-slate-700">
            El resultado era <strong>{fmt(correcto)}{unidad && ` ${unidad}`}</strong>. Repasalo y seguimos.
          </p>
        )}
        {fallos >= 2 && !terminado && (
          <button type="button" onClick={revelar} className="mt-2 h-11 rounded-lg px-3 font-medium text-teal-700 underline">
            Ver resultado
          </button>
        )}
      </div>
    </div>
  );
}
