// Barra de progreso: <ProgressBar valor={3} max={10} etiqueta="Tu avance" />
export default function ProgressBar({ valor, max, etiqueta }) {
  const pct = max > 0 ? Math.min(100, Math.round((valor / max) * 100)) : 0;
  return (
    <div>
      {etiqueta && (
        <div className="mb-1 flex justify-between text-sm text-slate-600">
          <span>{etiqueta}</span>
          <span>{valor}/{max}</span>
        </div>
      )}
      <div
        className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200"
        role="progressbar"
        aria-valuenow={valor}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={etiqueta || 'Progreso'}
      >
        <div className="h-full rounded-full bg-teal-600 transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
