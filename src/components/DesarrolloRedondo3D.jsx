import { useMemo } from 'react';
import { REDONDOS } from '../data/cuerpos.js';
import { desarrolloRedondo, esferaDeEncuadre, CORTE } from '../data/desarrolloRedondo.js';
import { rotar } from '../utils/solidos3d.js';
import Visor from './Visor.jsx';

// Desarrollo plano del cilindro y del cono que se pliega hasta armar el cuerpo (en 3D).
// Lo usa «Desarrollo plano interactivo» (Paso 9). La geometría está en data/desarrolloRedondo.js.
//
//   <DesarrolloRedondo3D id="cilindro" r={2} h={4} t={0.5} />
//
//   t  0 = desarrollo plano, 1 = cuerpo armado
//   interactivo={false}: dibujo fijo, sin arrastrar ni zoom

const NOMBRES = Object.fromEntries(REDONDOS.map((c) => [c.id, c.nombre.toLowerCase()]));
// [cara que se ve de frente, cara que se ve de dorso]: así se nota el «adentro» de la hoja
const COLOR = {
  curva: ['var(--c-amber-300)', 'var(--c-amber-200)'],
  tapa: ['var(--c-teal-300)', 'var(--c-teal-200)'],
};
const TRAZO = 'var(--c-teal-700)';

function Dibujo({ id, r, h, t, yaw, pitch }) {
  const { poligonos, lineas } = useMemo(() => desarrolloRedondo(id, { r, h }, t), [id, r, h, t]);
  // la figura se encuadra según su tamaño de cada momento (plano, enrollándose o armada)
  const { centro, radio: R } = useMemo(() => esferaDeEncuadre(poligonos), [poligonos]);

  // mientras se arma, la cámara gira y baja un poco: el cilindro queda recostado (de frente se vería como
  // un círculo) y el cono se ve mejor de costado que desde arriba. Se suma a lo que el usuario mueva.
  const avance = Math.min(1, t / CORTE);
  const giroExtra = 40 * avance;
  const bajada = 25 * avance;
  const k = 132 / R;
  const aPantalla = (pts) => rotar(pts.map(([x, y, z]) => [x - centro[0], y - centro[1], z - centro[2]]), yaw + giroExtra, Math.max(5, pitch - bajada));
  const proy = ([x, y]) => `${(150 + x * k).toFixed(2)},${(150 - y * k).toFixed(2)}`;

  const dibujables = [];
  poligonos.forEach(({ pts, rol }, i) => {
    const q = aPantalla(pts);
    const [a, b, c] = q;
    const nz = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]); // cara de frente o de dorso
    const color = COLOR[rol][nz >= 0 ? 0 : 1];
    dibujables.push({
      z: q.reduce((s, p) => s + p[2], 0) / q.length,
      nodo: (
        <polygon
          key={`p${i}`}
          points={q.map(proy).join(' ')}
          style={{ fill: color, stroke: rol === 'tapa' ? TRAZO : color }}
          strokeWidth={rol === 'tapa' ? 1.5 : 0.6}
          strokeLinejoin="round"
        />
      ),
    });
  });
  // los contornos son tramos chicos que entran en el mismo orden de dibujo (así los tapa lo que está adelante)
  lineas.forEach(({ pts }, li) => {
    const q = aPantalla(pts);
    for (let i = 0; i < q.length - 1; i++) {
      dibujables.push({
        z: (q[i][2] + q[i + 1][2]) / 2 + 0.03 * R,
        nodo: <line key={`l${li}-${i}`} x1={150 + q[i][0] * k} y1={150 - q[i][1] * k} x2={150 + q[i + 1][0] * k} y2={150 - q[i + 1][1] * k} stroke={TRAZO} strokeWidth="2" strokeLinecap="round" />,
      });
    }
  });
  dibujables.sort((a, b) => a.z - b.z);

  return (
    <svg viewBox="0 0 300 300" className="mx-auto h-72 w-full max-w-sm" role="img" aria-label={`Desarrollo del ${NOMBRES[id]}, plegado al ${Math.round(t * 100)} %`}>
      {dibujables.map((d) => d.nodo)}
    </svg>
  );
}

export default function DesarrolloRedondo3D({ id, r, h, t, interactivo = true }) {
  return (
    <Visor key={id} etiqueta={`Desarrollo del ${NOMBRES[id]} en 3D`} yawInicial={0} pitchInicial={55} pitchMin={5} pitchMax={90} interactivo={interactivo}>
      {({ yaw, pitch }) => <Dibujo id={id} r={r} h={h} t={t} yaw={yaw} pitch={pitch} />}
    </Visor>
  );
}
