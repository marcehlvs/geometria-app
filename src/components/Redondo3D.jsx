import { REDONDOS } from '../data/cuerpos.js';
import { construirRedondo, rotar, caraVisible, aristasDeContorno } from '../utils/solidos3d.js';
import Visor from './Visor.jsx';

// Cuerpos redondos (cilindro, cono y esfera) en 3D, dibujados con SVG. Lo usan
// «Cuerpos y sus elementos» (Paso 8), «Áreas y volúmenes» (Paso 12) y «Modo evaluación».
//   <Redondo3D id="cilindro" resalte="bases" | "curva" | "vertice" | null />
//
// Se puede girar arrastrando, hacer zoom y mover (ver Visor). `interactivo={false}`
// lo deja como dibujo fijo (por ejemplo, para imprimir).

const MALLAS = Object.fromEntries(['cilindro', 'cono', 'esfera'].map((id) => [id, construirRedondo(id)]));
const E = 60; // escala
const proy = ([x, y]) => [120 + x * E, 125 - y * E];
const LUZ = (() => {
  const v = [-0.4, 0.7, 0.6];
  const n = Math.hypot(...v);
  return v.map((c) => c / n);
})();

function Dibujo({ id, yaw, pitch, resalte }) {
  const { vertices, caras, aristas, apice, radio } = MALLAS[id];
  const puntos = rotar(vertices, yaw, pitch);

  const baseC = resalte === 'bases' ? 'var(--c-teal-300)' : 'var(--c-teal-100)';
  const curvaC = resalte === 'curva' ? 'var(--c-amber-300)' : 'var(--c-slate-200)';
  const trazo = 'var(--c-teal-700)';

  const info = caras.map((c) => {
    const pts = c.idx.map((i) => puntos[i]);
    return { ...c, pts, visible: caraVisible(pts) };
  });
  const visibles = info.map((f) => f.visible);

  // Un poco de sombra (según hacia dónde mira cada cara) para que se note el volumen
  const sombra = ({ pts }) => {
    const [a, b, c] = pts;
    const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
    const w = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    let n = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]];
    const largo = Math.hypot(...n) || 1;
    n = n.map((x) => x / largo);
    if (n[2] < 0) n = n.map((x) => -x); // la cara visible mira hacia quien observa
    const lambert = Math.max(0, n[0] * LUZ[0] + n[1] * LUZ[1] + n[2] * LUZ[2]);
    return Math.round((1 - lambert) * 26);
  };

  const contorno = aristasDeContorno(caras, visibles);
  const claveArista = ([a, b]) => `${Math.min(a, b)}-${Math.max(a, b)}`;
  const enContorno = new Set(contorno.map(claveArista));
  const linea = ([a, b], k, estilo) => {
    const [x1, y1] = proy(puntos[a]);
    const [x2, y2] = proy(puntos[b]);
    return <line key={k} x1={x1} y1={y1} x2={x2} y2={y2} strokeLinecap="round" {...estilo} />;
  };

  const centro = proy(puntos[0].map(() => 0));
  const ptoRadio = radio && { a: proy(rotar([radio.desde], yaw, pitch)[0]), b: proy(rotar([radio.hasta], yaw, pitch)[0]) };

  return (
    <svg viewBox="0 0 240 250" className="mx-auto h-64 w-full max-w-xs" role="img" aria-label={`Dibujo en 3D: ${REDONDOS.find((c) => c.id === id).nombre}`}>
      {info
        .filter((f) => f.visible)
        .map((f, k) => {
          const base = f.rol === 'base' ? baseC : curvaC;
          const relleno = `color-mix(in srgb, black ${sombra(f)}%, ${base})`;
          return (
            <polygon
              key={k}
              points={f.pts.map((q) => proy(q).join(',')).join(' ')}
              style={{ fill: relleno, stroke: relleno }}
              strokeWidth="0.6"
              strokeLinejoin="round"
            />
          );
        })}

      {/* bordes de verdad (circunferencias de las bases, ecuador): lo oculto va con línea cortada */}
      {aristas.map((par, k) => {
        if (enContorno.has(claveArista(par))) return null; // ya se dibuja como contorno
        const [a, b] = par;
        const visible = info.some((f) => f.visible && f.idx.includes(a) && f.idx.includes(b));
        const resaltada = resalte === 'bases' && id !== 'esfera';
        return linea(par, `a${k}`, {
          stroke: resaltada ? 'var(--c-teal-600)' : trazo,
          strokeWidth: resaltada ? 4 : 2,
          strokeDasharray: visible ? undefined : '5 4',
          opacity: visible ? 1 : 0.6,
        });
      })}

      {/* contorno: lo que separa el cuerpo del fondo */}
      {contorno.map((par, k) => linea(par, `c${k}`, { stroke: trazo, strokeWidth: 3 }))}

      {id === 'cono' && (
        <circle
          cx={proy(puntos[apice])[0]}
          cy={proy(puntos[apice])[1]}
          r={resalte === 'vertice' ? 9 : 4}
          fill={resalte === 'vertice' ? 'var(--c-rose-700)' : 'var(--c-slate-900)'}
        />
      )}

      {id === 'esfera' && ptoRadio && (
        <>
          <circle cx={centro[0]} cy={centro[1]} r="3.5" fill="var(--c-slate-900)" />
          <line x1={ptoRadio.a[0]} y1={ptoRadio.a[1]} x2={ptoRadio.b[0]} y2={ptoRadio.b[1]} stroke="var(--c-rose-700)" strokeWidth="3" strokeLinecap="round" />
          <text
            x={(ptoRadio.a[0] + ptoRadio.b[0]) / 2}
            y={(ptoRadio.a[1] + ptoRadio.b[1]) / 2 - 8}
            fontSize="14"
            fill="var(--c-rose-700)"
            fontWeight="700"
            textAnchor="middle"
            stroke="var(--c-white)"
            strokeWidth="3"
            paintOrder="stroke"
          >
            r
          </text>
        </>
      )}
    </svg>
  );
}

export default function Redondo3D({ id, resalte, interactivo = true }) {
  const nombre = REDONDOS.find((c) => c.id === id).nombre;
  return (
    <Visor key={id} etiqueta={`${nombre} en 3D`} yawInicial={30} pitchInicial={22} interactivo={interactivo}>
      {({ yaw, pitch }) => <Dibujo id={id} yaw={yaw} pitch={pitch} resalte={resalte} />}
    </Visor>
  );
}
