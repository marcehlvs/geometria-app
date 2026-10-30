import { POLIEDROS } from '../data/cuerpos.js';
import { construirPoliedro, rotar, caraVisible } from '../utils/solidos3d.js';

// Poliedro en 3D dibujado con SVG (sin librerías). Lo usan «Cuerpos y sus
// elementos» (Paso 8) y «Fórmula de Euler» (Paso 11).
//   <Poliedro3D id="cubo" giro={30} resalte="caras" | "aristas" | "vertices" | null />

const CARA_COLOR = { base: '#5eead4', lateral: '#fcd34d' };

// ---------------- Poliedro en 3D (SVG) ----------------
export default function Poliedro3D({ id, giro, resalte }) {
  const { vertices, caras, aristas } = construirPoliedro(id);
  const puntos = rotar(vertices, giro);
  const E = 62; // escala
  const proy = ([x, y]) => [120 + x * E, 125 - y * E];

  const info = caras.map((c) => {
    const pts = c.idx.map((i) => puntos[i]);
    return { ...c, pts, visible: caraVisible(pts), z: pts.reduce((s, q) => s + q[2], 0) / pts.length };
  });
  const ordenadas = [...info].sort((a, b) => a.z - b.z);

  // Una arista se ve si alguna de sus caras vecinas mira hacia nosotros.
  const aristaVisible = ([a, b]) => info.some((f) => f.visible && f.idx.includes(a) && f.idx.includes(b));

  return (
    <svg viewBox="0 0 240 250" className="mx-auto h-64 w-full max-w-xs" role="img" aria-label={`Modelo 3D: ${POLIEDROS.find((c) => c.id === id).nombre}`}>
      {ordenadas.map((f, k) => (
        <polygon
          key={k}
          points={f.pts.map((q) => proy(q).join(',')).join(' ')}
          fill={resalte === 'caras' ? CARA_COLOR[f.rol] : '#ccfbf1'}
          fillOpacity={f.visible ? 0.85 : 0.25}
          stroke="none"
        />
      ))}
      {aristas.map(([a, b], k) => {
        const [x1, y1] = proy(puntos[a]);
        const [x2, y2] = proy(puntos[b]);
        const visible = aristaVisible([a, b]);
        const resaltada = resalte === 'aristas';
        return (
          <line
            key={k}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={resaltada ? '#be123c' : '#0f766e'}
            strokeWidth={resaltada ? 4 : 2.5}
            strokeLinecap="round"
            strokeDasharray={visible ? undefined : '4 4'}
            opacity={visible ? 1 : 0.55}
          />
        );
      })}
      {resalte === 'vertices' &&
        puntos.map((p, k) => {
          const [x, y] = proy(p);
          return (
            <g key={k}>
              <circle cx={x} cy={y} r="9" fill="#0f172a" />
              <text x={x} y={y} fontSize="11" fill="#fff" textAnchor="middle" dominantBaseline="central" fontWeight="700">
                {k + 1}
              </text>
            </g>
          );
        })}
    </svg>
  );
}
