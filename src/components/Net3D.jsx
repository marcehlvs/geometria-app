import { cuadroDelimitador, ejeBisagra } from '../data/nets.js';

// Dibuja un desarrollo plano (árbol de caras unidas por bisagras) con CSS 3D.
// Lo usan «Desarrollo plano interactivo» (Paso 9) y «¿Arma un cubo?» (Paso 10).
//
//   <Net3D desarrollo={net} t={0.5} giroVista={-20} colorear animar={false}
//          etiqueta="Desarrollo plano del cubo" />
//
//   t         plegado de 0 (plano) a 1 (cuerpo armado)
//   colorear  true: cada `grupo` de caras con su color; false: todas grises

export const PALETA = ['#5eead4', '#fcd34d', '#fda4af', '#a5b4fc', '#bef264', '#fdba74'];

// Una cara: <div> 3D anidado dentro de su padre. Se coloca donde le toca en el
// plano y gira alrededor de su bisagra (transform-origin). Como está DENTRO de
// su padre, hereda el giro del padre.
function CaraNet({ cara, porPadre, origen, k, t, colores, animar }) {
  const bb = cuadroDelimitador(cara.poly);
  const ancho = Math.max((bb.maxX - bb.minX) * k, 1);
  const alto = Math.max((bb.maxY - bb.minY) * k, 1);
  const estilo = {
    position: 'absolute',
    left: (bb.minX - origen[0]) * k,
    top: (bb.minY - origen[1]) * k,
    width: ancho,
    height: alto,
    transformStyle: 'preserve-3d',
    transition: animar ? 'transform 0.9s ease-in-out' : 'none',
  };
  if (cara.bisagra) {
    const { origen: o, dir } = ejeBisagra(cara);
    estilo.transformOrigin = `${(o[0] - bb.minX) * k}px ${(o[1] - bb.minY) * k}px`;
    estilo.transform = `rotate3d(${dir[0]}, ${dir[1]}, 0, ${cara.giro * t}deg)`;
  }
  const puntos = cara.poly.map(([x, y]) => `${(x - bb.minX) * k},${(y - bb.minY) * k}`).join(' ');
  return (
    <div style={estilo} data-cara={cara.id}>
      <svg width={ancho} height={alto} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }} aria-hidden="true">
        <polygon points={puntos} fill={colores[cara.grupo]} fillOpacity="0.92" stroke="#0f766e" strokeWidth="2" strokeLinejoin="round" />
      </svg>
      {(porPadre[cara.id] || []).map((hija) => (
        <CaraNet key={hija.id} cara={hija} porPadre={porPadre} origen={[bb.minX, bb.minY]} k={k} t={t} colores={colores} animar={animar} />
      ))}
    </div>
  );
}

export default function Net3D({ desarrollo, t, giroVista, colorear, animar, etiqueta = 'Desarrollo plano' }) {
  const todos = desarrollo.caras.flatMap((c) => c.poly);
  const bb = cuadroDelimitador(todos);
  const w = bb.maxX - bb.minX;
  const h = bb.maxY - bb.minY;
  const k = 230 / Math.max(w, h, 1);
  const centro = [(bb.minX + bb.maxX) / 2, (bb.minY + bb.maxY) / 2];

  const grupos = [...new Set(desarrollo.caras.map((c) => c.grupo))];
  const colores = Object.fromEntries(grupos.map((g, i) => [g, colorear ? PALETA[i % PALETA.length] : '#e2e8f0']));

  const porPadre = {};
  desarrollo.caras.forEach((c) => {
    if (c.padre) (porPadre[c.padre] ||= []).push(c);
  });
  const raiz = desarrollo.caras.find((c) => !c.padre);

  return (
    <div
      className="relative mx-auto h-80 w-full max-w-sm overflow-hidden rounded-2xl bg-slate-50"
      style={{ perspective: '1000px' }}
      role="img"
      aria-label={`${etiqueta}, plegado al ${Math.round(t * 100)} %`}
    >
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: 0,
          height: 0,
          transformStyle: 'preserve-3d',
          transform: `rotateX(55deg) rotateZ(${giroVista}deg)`,
        }}
      >
        <CaraNet cara={raiz} porPadre={porPadre} origen={centro} k={k} t={t} colores={colores} animar={animar} />
      </div>
    </div>
  );
}
