import { useApp } from '../context/AppContext.jsx';

// Control segmentado: varias opciones, una seleccionada.
function Segmentado({ etiqueta, opciones, valor, onChange }) {
  return (
    <div role="group" aria-label={etiqueta}>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{etiqueta}</p>
      <div className="flex rounded-xl bg-slate-200 p-1">
        {opciones.map((o) => (
          <button
            key={String(o.v)}
            type="button"
            onClick={() => onChange(o.v)}
            aria-pressed={valor === o.v}
            className={`h-10 flex-1 rounded-lg px-2 text-sm font-semibold transition ${
              valor === o.v ? 'bg-white text-teal-700 shadow' : 'text-slate-600'
            }`}
          >
            {o.t}
          </button>
        ))}
      </div>
    </div>
  );
}

// Selectores globales: año y valor de π
export default function BarraAjustes() {
  const { anio, setAnio, piEscolar, setPiEscolar } = useApp();
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <Segmentado
        etiqueta="Año"
        valor={anio}
        onChange={setAnio}
        opciones={[{ v: 0, t: 'Todos' }, { v: 1, t: '1.º año' }, { v: 2, t: '2.º año' }]}
      />
      <Segmentado
        etiqueta="Valor de π"
        valor={piEscolar}
        onChange={setPiEscolar}
        opciones={[{ v: true, t: 'π = 3,14' }, { v: false, t: 'π exacto' }]}
      />
    </div>
  );
}
