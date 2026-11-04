import { useApp } from '../context/AppContext.jsx';

// Control segmentado: varias opciones, una seleccionada.
function Segmentado({ etiqueta, opciones, valor, onChange }) {
  return (
    <div role="group" aria-label={etiqueta}>
      <p className="mb-1 text-sm font-semibold text-muted">{etiqueta}</p>
      <div className="flex gap-1 rounded-control bg-surface-2 p-1">
        {opciones.map((o) => (
          <button
            key={String(o.v)}
            type="button"
            onClick={() => onChange(o.v)}
            aria-pressed={valor === o.v}
            className={`min-h-11 flex-1 rounded-lg px-2 text-sm font-semibold transition ${
              valor === o.v ? 'bg-surface text-brand-ink shadow-card' : 'text-muted active:bg-line'
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
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-6 lg:max-w-2xl">
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
