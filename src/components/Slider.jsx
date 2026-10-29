import { fmt } from '../utils/format.js';

// Deslizador con botones − y + (en el celular, el botón da más precisión que el dedo).
//   <Slider etiqueta="Radio" valor={r} onChange={setR} min={1} max={10} paso={0.5} unidad="cm" decimales={1} />

// Evita errores de coma flotante: 0.1 + 0.2 -> 0.3
const limpiar = (n) => Number(n.toFixed(10));

export default function Slider({ etiqueta, valor, onChange, min = 0, max = 100, paso = 1, unidad = '', decimales = 0 }) {
  const cambiar = (n) => onChange(limpiar(Math.min(max, Math.max(min, n))));

  const botonClase =
    'h-11 w-11 shrink-0 rounded-full bg-slate-100 text-xl font-bold text-slate-700 active:bg-slate-200 disabled:opacity-40';

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <span className="font-medium text-slate-700">{etiqueta}</span>
        <span className="text-lg font-bold tabular-nums text-teal-700">
          {fmt(valor, decimales)}
          {unidad && `${/^[°%]/.test(unidad) ? '' : ' '}${unidad}`}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <button type="button" className={botonClase} onClick={() => cambiar(valor - paso)} disabled={valor <= min} aria-label={`Disminuir ${etiqueta}`}>
          −
        </button>
        <input
          type="range"
          className="geo-range w-full"
          min={min}
          max={max}
          step={paso}
          value={valor}
          onChange={(e) => cambiar(parseFloat(e.target.value))}
          aria-label={etiqueta}
        />
        <button type="button" className={botonClase} onClick={() => cambiar(valor + paso)} disabled={valor >= max} aria-label={`Aumentar ${etiqueta}`}>
          +
        </button>
      </div>
    </div>
  );
}
