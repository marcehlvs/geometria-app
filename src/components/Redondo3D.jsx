import { REDONDOS } from '../data/cuerpos.js';

// Cuerpos redondos dibujados con SVG. Lo usan «Cuerpos y sus elementos» (Paso 8)
// y «Áreas y volúmenes» (Paso 12).
//   <Redondo3D id="cilindro" resalte="bases" | "curva" | "vertice" | null />

export default function Redondo3D({ id, resalte }) {
  const baseC = resalte === 'bases' ? 'var(--c-teal-300)' : 'var(--c-teal-100)';
  const curvaC = resalte === 'curva' ? 'var(--c-amber-300)' : 'var(--c-slate-200)';
  const trazo = 'var(--c-teal-700)';
  return (
    <svg viewBox="0 0 240 250" className="mx-auto h-64 w-full max-w-xs" role="img" aria-label={`Dibujo: ${REDONDOS.find((c) => c.id === id).nombre}`}>
      {id === 'cilindro' && (
        <>
          <path d="M60 70 V180 A60 20 0 0 0 180 180 V70 Z" fill={curvaC} stroke={trazo} strokeWidth="3" />
          <ellipse cx="120" cy="70" rx="60" ry="20" fill={baseC} stroke={trazo} strokeWidth="3" />
          {resalte === 'bases' && <ellipse cx="120" cy="180" rx="60" ry="20" fill="none" stroke="var(--c-teal-600)" strokeWidth="4" />}
        </>
      )}
      {id === 'cono' && (
        <>
          <path d="M120 35 L60 180 A60 20 0 0 0 180 180 Z" fill={curvaC} stroke={trazo} strokeWidth="3" />
          <path d="M60 180 A60 20 0 0 1 180 180" fill="none" stroke={trazo} strokeWidth="2" strokeDasharray="5 4" />
          {resalte === 'bases' && <ellipse cx="120" cy="180" rx="60" ry="20" fill="none" stroke="var(--c-teal-600)" strokeWidth="4" />}
          <circle cx="120" cy="35" r={resalte === 'vertice' ? 9 : 4} fill={resalte === 'vertice' ? 'var(--c-rose-700)' : 'var(--c-slate-900)'} />
        </>
      )}
      {id === 'esfera' && (
        <>
          <circle cx="120" cy="125" r="75" fill="var(--c-teal-100)" stroke={trazo} strokeWidth="3" />
          <ellipse cx="120" cy="125" rx="75" ry="22" fill="none" stroke={trazo} strokeWidth="2" strokeDasharray="5 4" />
          <circle cx="120" cy="125" r="3.5" fill="var(--c-slate-900)" />
          <line x1="120" y1="125" x2="195" y2="125" stroke="var(--c-rose-700)" strokeWidth="3" />
          <text x="158" y="118" fontSize="14" fill="var(--c-rose-700)" fontWeight="700" textAnchor="middle">r</text>
        </>
      )}
    </svg>
  );
}
