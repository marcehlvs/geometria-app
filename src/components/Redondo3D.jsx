import { REDONDOS } from '../data/cuerpos.js';

// Cuerpos redondos dibujados con SVG. Lo usan «Cuerpos y sus elementos» (Paso 8)
// y «Áreas y volúmenes» (Paso 12).
//   <Redondo3D id="cilindro" resalte="bases" | "curva" | "vertice" | null />

export default function Redondo3D({ id, resalte }) {
  const baseC = resalte === 'bases' ? '#5eead4' : '#ccfbf1';
  const curvaC = resalte === 'curva' ? '#fcd34d' : '#e2e8f0';
  const trazo = '#0f766e';
  return (
    <svg viewBox="0 0 240 250" className="mx-auto h-64 w-full max-w-xs" role="img" aria-label={`Dibujo: ${REDONDOS.find((c) => c.id === id).nombre}`}>
      {id === 'cilindro' && (
        <>
          <path d="M60 70 V180 A60 20 0 0 0 180 180 V70 Z" fill={curvaC} stroke={trazo} strokeWidth="3" />
          <ellipse cx="120" cy="70" rx="60" ry="20" fill={baseC} stroke={trazo} strokeWidth="3" />
          {resalte === 'bases' && <ellipse cx="120" cy="180" rx="60" ry="20" fill="none" stroke="#0d9488" strokeWidth="4" />}
        </>
      )}
      {id === 'cono' && (
        <>
          <path d="M120 35 L60 180 A60 20 0 0 0 180 180 Z" fill={curvaC} stroke={trazo} strokeWidth="3" />
          <path d="M60 180 A60 20 0 0 1 180 180" fill="none" stroke={trazo} strokeWidth="2" strokeDasharray="5 4" />
          {resalte === 'bases' && <ellipse cx="120" cy="180" rx="60" ry="20" fill="none" stroke="#0d9488" strokeWidth="4" />}
          <circle cx="120" cy="35" r={resalte === 'vertice' ? 9 : 4} fill={resalte === 'vertice' ? '#be123c' : '#0f172a'} />
        </>
      )}
      {id === 'esfera' && (
        <>
          <circle cx="120" cy="125" r="75" fill="#ccfbf1" stroke={trazo} strokeWidth="3" />
          <ellipse cx="120" cy="125" rx="75" ry="22" fill="none" stroke={trazo} strokeWidth="2" strokeDasharray="5 4" />
          <circle cx="120" cy="125" r="3.5" fill="#0f172a" />
          <line x1="120" y1="125" x2="195" y2="125" stroke="#be123c" strokeWidth="3" />
          <text x="158" y="118" fontSize="14" fill="#be123c" fontWeight="700" textAnchor="middle">r</text>
        </>
      )}
    </svg>
  );
}
