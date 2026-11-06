import { useCallback, useEffect, useRef, useState } from 'react';
import { normalizarGrado } from '../utils/solidos3d.js';

// Marco interactivo para las figuras 3D: dentro se dibuja el cuerpo y el visor se
// ocupa de moverlo.
//
//   <Visor etiqueta="Cubo" yaw={giro} onYaw={setGiro} yawInicial={30} pitchInicial={25}>
//     {({ yaw, pitch }) => <figura girada yaw pitch />}
//   </Visor>
//
//   · Arrastrar (mouse o dedo): gira el cuerpo (horizontal = giro, vertical = inclinación).
//   · Dos dedos: pellizcar acerca o aleja, y arrastrar mueve la figura.
//   · Mouse: Ctrl + rueda (o pellizcar en el trackpad) hace zoom; Mayús + arrastrar mueve la figura.
//   · Teclado (con el foco en la figura): flechas giran, + y − acercan y alejan, 0 restablece.
//   · Botones: ▶ Girar (gira solo), − + (zoom) y ⟲ (restablecer).
//
// `yaw` + `onYaw` lo hacen controlado (para que un deslizador del módulo y el arrastre
// muevan lo mismo). Sin `onYaw`, `yaw` es solo el valor inicial y el visor lleva la cuenta.

const ZOOM_MIN = 0.6;
const ZOOM_MAX = 4;
const limitar = (v, a, b) => Math.min(b, Math.max(a, v));
const GRADOS_POR_PIXEL = 0.6;
const GRADOS_POR_SEGUNDO = 36; // girar solo: una vuelta cada 10 s

export default function Visor({
  etiqueta,
  children,
  yaw: yawProp,
  onYaw,
  yawInicial = 30,
  pitchInicial = 25,
  pitchMin = -85,
  pitchMax = 85,
  interactivo = true,
  controles = true,
  className = '',
}) {
  const controlado = yawProp !== undefined && onYaw !== undefined;
  const [yawInterno, setYawInterno] = useState(yawProp ?? yawInicial);
  const [pitch, setPitch] = useState(pitchInicial);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [auto, setAuto] = useState(false);
  const [moviendo, setMoviendo] = useState(false);

  const yaw = controlado ? yawProp : yawInterno;
  const yawRef = useRef(yaw);
  yawRef.current = yaw;
  const onYawRef = useRef(onYaw);
  onYawRef.current = onYaw;

  // si el módulo cambia `yaw` (por ejemplo con un deslizador) sin ser controlado, seguimos ese valor
  useEffect(() => {
    if (yawProp !== undefined) setYawInterno(yawProp);
  }, [yawProp]);

  const cambiarYaw = useCallback((valor) => {
    const v = normalizarGrado(valor);
    yawRef.current = v;
    if (onYawRef.current) onYawRef.current(v);
    else setYawInterno(v);
  }, []);

  // ---------- girar solo ----------
  useEffect(() => {
    if (!auto) return undefined;
    let id;
    let previo = null;
    const paso = (ahora) => {
      if (previo !== null) cambiarYaw(yawRef.current + ((ahora - previo) * GRADOS_POR_SEGUNDO) / 1000);
      previo = ahora;
      id = requestAnimationFrame(paso);
    };
    id = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(id);
  }, [auto, cambiarYaw]);

  // ---------- gestos ----------
  const escenario = useRef(null);
  const punteros = useRef(new Map());
  const pinza = useRef(null); // { distancia, centro } del gesto de dos dedos

  const acercar = useCallback((factor) => setZoom((z) => limitar(z * factor, ZOOM_MIN, ZOOM_MAX)), []);
  const restablecer = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setPitch(pitchInicial);
    setAuto(false);
    cambiarYaw(yawInicial);
  }, [cambiarYaw, pitchInicial, yawInicial]);

  const moverPan = (dx, dy) => setPan((p) => ({ x: limitar(p.x + dx, -400, 400), y: limitar(p.y + dy, -400, 400) }));

  const alBajar = (e) => {
    if (!interactivo) return;
    setAuto(false);
    escenario.current?.setPointerCapture?.(e.pointerId);
    punteros.current.set(e.pointerId, { x: e.clientX, y: e.clientY, mover: e.shiftKey || e.button === 1 || e.button === 2 });
    setMoviendo(true);
    if (punteros.current.size === 2) {
      const [a, b] = [...punteros.current.values()];
      pinza.current = { distancia: Math.hypot(a.x - b.x, a.y - b.y) || 1, centro: [(a.x + b.x) / 2, (a.y + b.y) / 2] };
    }
  };

  const alMover = (e) => {
    const p = punteros.current.get(e.pointerId);
    if (!p) return;
    const dx = e.clientX - p.x;
    const dy = e.clientY - p.y;
    p.x = e.clientX;
    p.y = e.clientY;

    if (punteros.current.size >= 2 && pinza.current) {
      const [a, b] = [...punteros.current.values()];
      const distancia = Math.hypot(a.x - b.x, a.y - b.y) || 1;
      const centro = [(a.x + b.x) / 2, (a.y + b.y) / 2];
      acercar(distancia / pinza.current.distancia);
      moverPan(centro[0] - pinza.current.centro[0], centro[1] - pinza.current.centro[1]);
      pinza.current = { distancia, centro };
    } else if (p.mover) {
      moverPan(dx, dy);
    } else {
      cambiarYaw(yawRef.current + dx * GRADOS_POR_PIXEL);
      setPitch((v) => limitar(v + dy * GRADOS_POR_PIXEL, pitchMin, pitchMax));
    }
  };

  const alSoltar = (e) => {
    punteros.current.delete(e.pointerId);
    pinza.current = null;
    if (punteros.current.size === 0) setMoviendo(false);
  };

  // Ctrl + rueda (y el pellizco del trackpad, que llega como Ctrl + rueda) hace zoom.
  // Sin Ctrl la rueda sigue desplazando la página.
  useEffect(() => {
    const el = escenario.current;
    if (!el || !interactivo) return undefined;
    const alRueda = (e) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      acercar(Math.exp(-e.deltaY * 0.003));
    };
    el.addEventListener('wheel', alRueda, { passive: false });
    return () => el.removeEventListener('wheel', alRueda);
  }, [acercar, interactivo]);

  const alTeclear = (e) => {
    if (!interactivo || e.target !== e.currentTarget) return;
    const paso = 10;
    const acciones = {
      ArrowLeft: () => cambiarYaw(yawRef.current - paso),
      ArrowRight: () => cambiarYaw(yawRef.current + paso),
      ArrowUp: () => setPitch((v) => limitar(v - paso, pitchMin, pitchMax)),
      ArrowDown: () => setPitch((v) => limitar(v + paso, pitchMin, pitchMax)),
      '+': () => acercar(1.25),
      '=': () => acercar(1.25),
      '-': () => acercar(0.8),
      0: restablecer,
    };
    const accion = acciones[e.key];
    if (accion) {
      e.preventDefault();
      accion();
    }
  };

  const vista = { yaw, pitch, zoom };

  return (
    <div className={`mx-auto w-full max-w-sm ${className}`}>
      <div
        ref={escenario}
        role="group"
        aria-label={interactivo ? `${etiqueta}. Arrastrá para girarlo. Con el teclado: flechas para girar, más y menos para acercar, cero para restablecer.` : etiqueta}
        tabIndex={interactivo ? 0 : undefined}
        onPointerDown={alBajar}
        onPointerMove={alMover}
        onPointerUp={alSoltar}
        onPointerCancel={alSoltar}
        onKeyDown={alTeclear}
        onContextMenu={interactivo ? (e) => e.preventDefault() : undefined}
        data-visor
        data-zoom={zoom.toFixed(2)}
        className={`relative overflow-hidden rounded-card border border-line bg-surface-2 select-none ${
          interactivo ? `touch-none ${moviendo ? 'cursor-grabbing' : 'cursor-grab'}` : ''
        }`}
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '50% 50%',
            transition: moviendo || auto ? 'none' : 'transform 0.15s ease-out',
          }}
        >
          {typeof children === 'function' ? children(vista) : children}
        </div>
      </div>

      {interactivo && controles && (
        <div className="no-imprimir mt-2 space-y-1">
          <div className="flex items-center gap-2">
            <button type="button" className="btn btn-secondary flex-1" aria-pressed={auto} onClick={() => setAuto((a) => !a)}>
              <span aria-hidden="true">{auto ? '⏸' : '▶'}</span> {auto ? 'Detener' : 'Girar'}
            </button>
            <button type="button" className="btn btn-secondary w-11 px-0" aria-label="Alejar" onClick={() => acercar(0.8)} disabled={zoom <= ZOOM_MIN}>
              <span aria-hidden="true">−</span>
            </button>
            <button type="button" className="btn btn-secondary w-11 px-0" aria-label="Acercar" onClick={() => acercar(1.25)} disabled={zoom >= ZOOM_MAX}>
              <span aria-hidden="true">+</span>
            </button>
            <button type="button" className="btn btn-secondary w-11 px-0" aria-label="Restablecer la vista" onClick={restablecer}>
              <span aria-hidden="true">⟲</span>
            </button>
          </div>
          <p className="text-center text-sm text-muted">Arrastrá para girar · pellizcá o usá + y − para acercar</p>
        </div>
      )}
    </div>
  );
}
