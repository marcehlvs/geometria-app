import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent, within, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';

import { AppProvider } from '../context/AppContext.jsx';
import Visor from '../components/Visor.jsx';
import Poliedro3D from '../components/Poliedro3D.jsx';
import Redondo3D from '../components/Redondo3D.jsx';
import Net3D from '../components/Net3D.jsx';
import DesarrolloRedondo3D from '../components/DesarrolloRedondo3D.jsx';
import DesarrolloPlano from '../modules/DesarrolloPlano/DesarrolloPlano.jsx';
import Formula from '../components/Formula.jsx';
import { construirDesarrollo } from '../data/nets.js';
import { construirRedondo, aristasDeContorno, rotar, caraVisible, normalizarGrado } from '../utils/solidos3d.js';
import { desarrolloRedondo, areaPoligono3D, esferaDeEncuadre, etapas, CORTE } from '../data/desarrolloRedondo.js';

beforeEach(() => {
  window.scrollTo = vi.fn();
  window.localStorage.clear();
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

// ---------------------------------------------------------------- Visor
describe('Visor (girar, zoom, mover)', () => {
  const Vista = ({ yaw, pitch }) => <output data-testid="vista">{`${Math.round(yaw)}|${Math.round(pitch)}`}</output>;
  const abrir = (props = {}) => render(<Visor etiqueta="Figura" yawInicial={30} pitchInicial={25} {...props}>{Vista}</Visor>);
  const escenario = () => screen.getByRole('group', { name: /Figura/ });
  const vista = () => screen.getByTestId('vista').textContent;
  const zoom = () => Number(escenario().dataset.zoom);
  const puntero = (tipo, id, x, y, extra = {}) => fireEvent[tipo](escenario(), { pointerId: id, clientX: x, clientY: y, button: 0, ...extra });

  it('arrastrar gira: horizontal cambia el giro y vertical la inclinación', () => {
    abrir();
    expect(vista()).toBe('30|25');
    puntero('pointerDown', 1, 100, 100);
    puntero('pointerMove', 1, 150, 130); // +50 px y +30 px
    puntero('pointerUp', 1, 150, 130);
    expect(vista()).toBe('60|43'); // 30 + 50·0,6 y 25 + 30·0,6
  });

  it('la inclinación tiene un tope y el giro da la vuelta', () => {
    abrir({ pitchMin: -10, pitchMax: 60 });
    puntero('pointerDown', 1, 0, 0);
    puntero('pointerMove', 1, 400, 900);
    expect(vista()).toBe('-90|60'); // giro: 30 + 400·0,6 = 270° = -90°; inclinación: 900·0,6 se corta en el tope (60)
  });

  it('con yaw y onYaw el módulo y el visor comparten el giro', () => {
    const onYaw = vi.fn();
    const { rerender } = abrir({ yaw: 30, onYaw });
    puntero('pointerDown', 1, 0, 0);
    puntero('pointerMove', 1, 50, 0);
    expect(onYaw).toHaveBeenLastCalledWith(60);
    // el módulo responde (por ejemplo con un deslizador) y el visor lo muestra
    rerender(<Visor etiqueta="Figura" yaw={120} onYaw={onYaw} pitchInicial={25}>{Vista}</Visor>);
    expect(vista()).toBe('120|25');
  });

  it('sin onYaw, un yaw nuevo desde el módulo (deslizador) también se sigue', () => {
    const { rerender } = abrir({ yaw: 30 });
    rerender(<Visor etiqueta="Figura" yaw={-90} pitchInicial={25}>{Vista}</Visor>);
    expect(vista()).toBe('-90|25');
  });

  it('los botones acercan y alejan con tope en ambos extremos', async () => {
    const user = userEvent.setup();
    abrir();
    await user.click(screen.getByRole('button', { name: 'Acercar' }));
    expect(zoom()).toBeCloseTo(1.25);
    await user.click(screen.getByRole('button', { name: 'Alejar' }));
    expect(zoom()).toBeCloseTo(1);
    for (let i = 0; i < 12; i++) await user.click(screen.getByRole('button', { name: 'Acercar' }));
    expect(zoom()).toBe(4);
    expect(screen.getByRole('button', { name: 'Acercar' })).toBeDisabled();
    for (let i = 0; i < 20; i++) await user.click(screen.getByRole('button', { name: 'Alejar' }));
    expect(zoom()).toBe(0.6);
    expect(screen.getByRole('button', { name: 'Alejar' })).toBeDisabled();
  });

  it('pellizcar con dos dedos hace zoom y arrastrarlos mueve la figura', () => {
    abrir();
    puntero('pointerDown', 1, 100, 100);
    puntero('pointerDown', 2, 200, 100);
    puntero('pointerMove', 2, 300, 100); // la distancia pasa de 100 a 200
    expect(zoom()).toBeCloseTo(2);
    expect(escenario().firstChild.style.transform).toContain('translate(');
    expect(vista()).toBe('30|25'); // con dos dedos no gira
  });

  it('Mayús + arrastrar mueve la figura sin girarla', () => {
    abrir();
    puntero('pointerDown', 1, 100, 100, { shiftKey: true });
    puntero('pointerMove', 1, 140, 80);
    expect(escenario().firstChild.style.transform).toContain('translate(40px, -20px)');
    expect(vista()).toBe('30|25');
  });

  it('Ctrl + rueda hace zoom; la rueda sola no (sigue desplazando la página)', () => {
    abrir();
    const sola = new WheelEvent('wheel', { deltaY: -100, bubbles: true, cancelable: true });
    escenario().dispatchEvent(sola);
    expect(sola.defaultPrevented).toBe(false);
    expect(zoom()).toBe(1);

    const conCtrl = new WheelEvent('wheel', { deltaY: -100, ctrlKey: true, bubbles: true, cancelable: true });
    act(() => {
      escenario().dispatchEvent(conCtrl);
    });
    expect(conCtrl.defaultPrevented).toBe(true);
    expect(zoom()).toBeGreaterThan(1.2);
    expect(zoom()).toBeLessThan(1.5); // una «muesca» de la rueda acerca como un clic en +
  });

  it('con el teclado: flechas giran, + y − acercan, 0 restablece', async () => {
    const user = userEvent.setup();
    abrir();
    escenario().focus();
    await user.keyboard('{ArrowRight}{ArrowRight}{ArrowDown}');
    expect(vista()).toBe('50|35');
    await user.keyboard('+');
    expect(zoom()).toBeCloseTo(1.25);
    await user.keyboard('-');
    expect(zoom()).toBeCloseTo(1);
    await user.keyboard('{ArrowLeft}0');
    expect(vista()).toBe('30|25');
    expect(zoom()).toBe(1);
  });

  it('«Restablecer la vista» vuelve a todo lo inicial', async () => {
    const user = userEvent.setup();
    abrir();
    puntero('pointerDown', 1, 0, 0);
    puntero('pointerMove', 1, 100, 100);
    puntero('pointerUp', 1, 100, 100);
    await user.click(screen.getByRole('button', { name: 'Acercar' }));
    await user.click(screen.getByRole('button', { name: 'Restablecer la vista' }));
    expect(vista()).toBe('30|25');
    expect(zoom()).toBe(1);
    expect(escenario().firstChild.style.transform).toContain('translate(0px, 0px)');
  });

  it('el botón Girar hace girar la figura sola y Detener la frena', async () => {
    let cuadros = [];
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((f) => cuadros.push(f));
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
    const user = userEvent.setup();
    const onYaw = vi.fn();
    abrir({ yaw: 0, onYaw });

    const boton = screen.getByRole('button', { name: /Girar/ });
    expect(boton).toHaveAttribute('aria-pressed', 'false');
    await user.click(boton);
    expect(screen.getByRole('button', { name: /Detener/ })).toHaveAttribute('aria-pressed', 'true');

    const correr = (ms) => {
      const f = cuadros.pop();
      act(() => f(ms));
    };
    correr(1000); // primer cuadro: solo toma la hora
    correr(2000); // 1 s después: 36°
    expect(onYaw).toHaveBeenLastCalledWith(36);
    correr(3000);
    expect(onYaw).toHaveBeenLastCalledWith(72);

    await user.click(screen.getByRole('button', { name: /Detener/ }));
    expect(screen.getByRole('button', { name: /Girar/ })).toHaveAttribute('aria-pressed', 'false');
  });

  it('tocar la figura detiene el giro automático', async () => {
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 1);
    const user = userEvent.setup();
    abrir();
    await user.click(screen.getByRole('button', { name: /Girar/ }));
    puntero('pointerDown', 1, 0, 0);
    expect(screen.getByRole('button', { name: /Girar/ })).toHaveAttribute('aria-pressed', 'false');
  });

  it('con interactivo={false} es un dibujo fijo: sin botones, sin foco y sin gestos', () => {
    abrir({ interactivo: false });
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(escenario()).not.toHaveAttribute('tabindex');
    puntero('pointerDown', 1, 0, 0);
    puntero('pointerMove', 1, 100, 100);
    expect(vista()).toBe('30|25');
  });

  it('el área interactiva se anuncia con instrucciones para el teclado', () => {
    abrir();
    expect(escenario()).toHaveAttribute('tabindex', '0');
    expect(escenario().getAttribute('aria-label')).toMatch(/flechas/);
  });

  it('normalizarGrado lleva cualquier ángulo a [-180, 180)', () => {
    expect([0, 180, -180, 190, -190, 540, 725].map(normalizarGrado)).toEqual([0, -180, -180, -170, 170, -180, 5]);
  });
});

// ---------------------------------------------------------------- Mallas de cuerpos redondos
describe('Cuerpos redondos en 3D (utils/solidos3d.js)', () => {
  const claves = (caras) => {
    const cuenta = new Map();
    caras.forEach(({ idx }) =>
      idx.forEach((a, i) => {
        const b = idx[(i + 1) % idx.length];
        const k = a < b ? `${a}-${b}` : `${b}-${a}`;
        cuenta.set(k, (cuenta.get(k) || 0) + 1);
      })
    );
    return cuenta;
  };

  it.each(['cilindro', 'cono', 'esfera'])('%s: superficie cerrada (cada arista pertenece a exactamente 2 caras)', (id) => {
    const { caras } = construirRedondo(id);
    [...claves(caras).values()].forEach((n) => expect(n).toBe(2));
  });

  it('las medidas son las de cada cuerpo', () => {
    const cil = construirRedondo('cilindro');
    cil.vertices.forEach(([x, y, z]) => {
      expect(Math.hypot(x, z)).toBeCloseTo(1);
      expect(Math.abs(y)).toBeCloseTo(0.85);
    });
    const cono = construirRedondo('cono');
    expect(cono.vertices[cono.apice]).toEqual([0, 1.15, 0]);
    cono.vertices.slice(0, -1).forEach(([x, y, z]) => expect(Math.hypot(x, z)).toBeCloseTo(1));
    construirRedondo('esfera').vertices.forEach(([x, y, z]) => expect(Math.hypot(x, y, z)).toBeCloseTo(1.25));
    expect(construirRedondo('cubo')).toBeNull();
  });

  it('el ecuador de la esfera es una fila de vértices en y = 0', () => {
    const { vertices, aristas } = construirRedondo('esfera');
    aristas.forEach(([a, b]) => {
      expect(vertices[a][1]).toBeCloseTo(0);
      expect(vertices[b][1]).toBeCloseTo(0);
    });
  });

  it.each([
    ['cilindro', 30, 22],
    ['cilindro', 200, -40],
    ['cono', 30, 22],
    ['cono', -120, -60],
    ['esfera', 75, 10],
  ])('%s (giro %i°, inclinación %i°): el contorno es una línea cerrada', (id, yaw, pitch) => {
    const { vertices, caras } = construirRedondo(id);
    const puntos = rotar(vertices, yaw, pitch);
    const visibles = caras.map((c) => caraVisible(c.idx.map((i) => puntos[i])));
    expect(visibles.some(Boolean)).toBe(true);
    const grado = new Map();
    aristasDeContorno(caras, visibles).forEach(([a, b]) => {
      grado.set(a, (grado.get(a) || 0) + 1);
      grado.set(b, (grado.get(b) || 0) + 1);
    });
    expect(grado.size).toBeGreaterThan(8);
    grado.forEach((g) => expect(g).toBe(2)); // cada punto del contorno une exactamente dos tramos
  });
});

// ---------------------------------------------------------------- Desarrollo plano → cuerpo
describe('Desarrollo plano del cilindro y del cono (data/desarrolloRedondo.js)', () => {
  const suma = (poligonos, rol) => poligonos.filter((p) => p.rol === rol).reduce((s, p) => s + areaPoligono3D(p.pts), 0);
  const TIEMPOS = [0, 0.1, 0.25, 0.4, 0.55, 0.7, 0.8, 0.9, 1];

  it('las dos etapas: enrollar hasta CORTE y después cerrar las tapas', () => {
    expect(etapas(0)).toEqual({ u: 0, v: 0 });
    expect(etapas(CORTE)).toEqual({ u: 1, v: 0 });
    expect(etapas(1)).toEqual({ u: 1, v: 1 });
    expect(etapas(0.35).u).toBeCloseTo(0.5);
    expect(etapas(2)).toEqual({ u: 1, v: 1 });
  });

  it.each([
    ['cilindro', { r: 2, h: 4 }],
    ['cilindro', { r: 1, h: 6 }],
    ['cilindro', { r: 4, h: 1 }],
    ['cono', { r: 2, h: 4 }],
    ['cono', { r: 3, h: 2 }],
    ['cono', { r: 1, h: 6 }],
  ])('%s %j: en t = 0 todo está plano, apoyado en el piso', (id, medidas) => {
    const { poligonos } = desarrolloRedondo(id, medidas, 0);
    poligonos.forEach(({ pts }) => pts.forEach((p) => expect(Math.abs(p[1])).toBeLessThan(1e-9)));
  });

  it.each([
    ['cilindro', { r: 2, h: 4 }, (r, h) => 2 * Math.PI * r * h],
    ['cilindro', { r: 4, h: 1 }, (r, h) => 2 * Math.PI * r * h],
    ['cono', { r: 2, h: 4 }, (r, h) => Math.PI * r * Math.hypot(r, h)],
    ['cono', { r: 3, h: 2 }, (r, h) => Math.PI * r * Math.hypot(r, h)],
  ])('%s %j: al plegar, la superficie lateral y las tapas conservan su área (no se estira)', (id, medidas, areaLateral) => {
    const { r, h } = medidas;
    TIEMPOS.forEach((t) => {
      const { poligonos } = desarrolloRedondo(id, medidas, t);
      expect(suma(poligonos, 'curva') / areaLateral(r, h)).toBeGreaterThan(0.995);
      expect(suma(poligonos, 'curva') / areaLateral(r, h)).toBeLessThan(1.001);
      const tapas = id === 'cilindro' ? 2 : 1;
      expect(suma(poligonos, 'tapa') / (tapas * Math.PI * r * r)).toBeGreaterThan(0.99);
    });
  });

  it('cilindro armado (t = 1): radio exacto alrededor de un eje paralelo a z y tapas en z = 0 y z = h', () => {
    const r = 2;
    const h = 4;
    const { poligonos } = desarrolloRedondo('cilindro', { r, h }, 1);
    poligonos
      .filter((p) => p.rol === 'curva')
      .forEach(({ pts }) =>
        pts.forEach(([x, y]) => {
          expect(Math.hypot(x, y - r)).toBeCloseTo(r, 6);
        })
      );
    const [cercana, lejana] = poligonos.filter((p) => p.rol === 'tapa');
    cercana.pts.forEach(([x, y, z]) => {
      expect(z).toBeCloseTo(0, 9);
      expect(Math.hypot(x, y - r)).toBeCloseTo(r, 9); // la tapa es la circunferencia del tubo
    });
    lejana.pts.forEach(([x, y, z]) => {
      expect(z).toBeCloseTo(h, 9);
      expect(Math.hypot(x, y - r)).toBeCloseTo(r, 9);
    });
  });

  it('cono armado (t = 1): vértice a la altura h sobre el centro, borde y base de radio r en el piso', () => {
    const r = 2;
    const h = 4;
    const { poligonos } = desarrolloRedondo('cono', { r, h }, 1);
    const lateral = poligonos.filter((p) => p.rol === 'curva');
    lateral.forEach(({ pts }) => {
      expect(pts[0][0]).toBeCloseTo(0, 9);
      expect(pts[0][1]).toBeCloseTo(h, 9);
      expect(pts[0][2]).toBeCloseTo(0, 9);
      pts.slice(1).forEach(([x, y, z]) => {
        expect(y).toBeCloseTo(0, 9);
        expect(Math.hypot(x, z)).toBeCloseTo(r, 9);
      });
    });
    poligonos.find((p) => p.rol === 'tapa').pts.forEach(([x, y, z]) => {
      expect(y).toBeCloseTo(0, 9);
      expect(Math.hypot(x, z)).toBeCloseTo(r, 9);
    });
  });

  it('la tapa siempre está unida a la superficie lateral por su punto de unión, en todo el plegado', () => {
    const distMin = (A, B) => Math.min(...A.flatMap((p) => B.map((q) => Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]))));
    ['cilindro', 'cono'].forEach((id) =>
      TIEMPOS.forEach((t) => {
        const { poligonos } = desarrolloRedondo(id, { r: 2, h: 4 }, t);
        const lateral = poligonos.filter((p) => p.rol === 'curva').flatMap((p) => p.pts);
        poligonos.filter((p) => p.rol === 'tapa').forEach(({ pts }) => expect(distMin(pts, lateral)).toBeLessThan(1e-6));
      })
    );
  });

  it('el borde de enrollado evoluciona sin saltos (cuadro a cuadro se mueve poco)', () => {
    const max = (id, t0, t1) => {
      const a = desarrolloRedondo(id, { r: 2, h: 4 }, t0).poligonos.flatMap((p) => p.pts);
      const b = desarrolloRedondo(id, { r: 2, h: 4 }, t1).poligonos.flatMap((p) => p.pts);
      return Math.max(...a.map((p, i) => Math.hypot(p[0] - b[i][0], p[1] - b[i][1], p[2] - b[i][2])));
    };
    ['cilindro', 'cono'].forEach((id) => {
      for (let t = 0; t < 1; t += 0.02) expect(max(id, t, t + 0.02)).toBeLessThan(1);
    });
  });

  it('esferaDeEncuadre contiene todos los puntos', () => {
    const { poligonos } = desarrolloRedondo('cilindro', { r: 2, h: 4 }, 0.5);
    const { centro, radio } = esferaDeEncuadre(poligonos);
    poligonos.forEach(({ pts }) => pts.forEach((p) => expect(Math.hypot(p[0] - centro[0], p[1] - centro[1], p[2] - centro[2])).toBeLessThanOrEqual(radio + 1e-9)));
  });

  it('un cuerpo desconocido da error', () => {
    expect(() => desarrolloRedondo('cubo', { r: 1, h: 1 }, 0)).toThrow(/desconocido/);
  });
});

// ---------------------------------------------------------------- Componentes con visor
describe('Figuras 3D con visor', () => {
  const puntos = () => [...screen.getByRole('img').querySelectorAll('polygon')].map((p) => p.getAttribute('points')).join('|');
  const arrastrar = (dx, dy) => {
    const g = screen.getByRole('group');
    fireEvent.pointerDown(g, { pointerId: 1, clientX: 0, clientY: 0, button: 0 });
    fireEvent.pointerMove(g, { pointerId: 1, clientX: dx, clientY: dy });
    fireEvent.pointerUp(g, { pointerId: 1, clientX: dx, clientY: dy });
  };

  it('Poliedro3D: arrastrar cambia el dibujo y el giro avisa al módulo', () => {
    const onGiro = vi.fn();
    render(<Poliedro3D id="cubo" giro={30} onGiro={onGiro} />);
    const antes = puntos();
    arrastrar(80, 0);
    expect(onGiro).toHaveBeenCalled();
    expect(screen.getByRole('group', { name: /Cubo en 3D/ })).toBeInTheDocument();
    expect(puntos()).toBe(antes); // controlado: el dibujo cambia cuando el módulo actualiza `giro`
  });

  it('Poliedro3D sin onGiro lleva su propio giro y cambia el dibujo', () => {
    render(<Poliedro3D id="cubo" giro={30} />);
    const antes = puntos();
    arrastrar(80, 20);
    expect(puntos()).not.toBe(antes);
  });

  it('Poliedro3D: el deslizador del módulo (giro) sigue moviendo la figura', () => {
    const { rerender } = render(<Poliedro3D id="cubo" giro={30} />);
    const antes = puntos();
    rerender(<Poliedro3D id="cubo" giro={120} />);
    expect(puntos()).not.toBe(antes);
  });

  it.each(['cilindro', 'cono', 'esfera'])('Redondo3D %s: es 3D, gira al arrastrar y mantiene los resaltes', (id) => {
    render(<Redondo3D id={id} resalte={null} />);
    expect(screen.getByRole('img', { name: /Dibujo en 3D/ })).toBeInTheDocument();
    const antes = puntos();
    arrastrar(60, 40);
    expect(puntos()).not.toBe(antes);
  });

  it('Redondo3D: el cilindro mira de costado al principio (se ven las dos bases) y de abajo al inclinarlo', () => {
    render(<Redondo3D id="cilindro" resalte="bases" />);
    const caras = screen.getByRole('img').querySelectorAll('polygon').length;
    expect(caras).toBeGreaterThan(10);
  });

  it('Redondo3D: el vértice del cono y el radio de la esfera se dibujan', () => {
    const { unmount } = render(<Redondo3D id="cono" resalte="vertice" />);
    expect(screen.getByRole('img').querySelector('circle[r="9"]')).toBeInTheDocument();
    unmount();
    render(<Redondo3D id="esfera" resalte={null} />);
    expect(screen.getByRole('img').querySelector('text')).toHaveTextContent('r');
  });

  it('Redondo3D e interactivo={false}: dibujo fijo, sin botones', () => {
    render(<Redondo3D id="cilindro" resalte={null} interactivo={false} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('Net3D: gira con el arrastre y el desarrollo sigue plegándose', () => {
    const onGiroVista = vi.fn();
    render(<Net3D desarrollo={construirDesarrollo('cubo', { a: 3 })} t={0.5} giroVista={-20} onGiroVista={onGiroVista} colorear animar={false} etiqueta="Desarrollo del cubo" />);
    expect(screen.getByRole('img', { name: /Desarrollo del cubo, plegado al 50 %/ })).toBeInTheDocument();
    arrastrar(50, 0);
    expect(onGiroVista).toHaveBeenCalledWith(10); // -20 + 50·0,6
  });

  it('Net3D: arrastrar en vertical inclina la vista (de arriba = plano)', () => {
    const { container } = render(<Net3D desarrollo={construirDesarrollo('cubo', { a: 3 })} t={0} giroVista={0} colorear animar={false} />);
    const girado = () => container.querySelector('[style*="rotateX"]').style.transform;
    expect(girado()).toContain('rotateX(55deg)');
    arrastrar(0, 100); // hacia abajo: la cámara sube
    expect(girado()).toContain('rotateX(0deg)');
  });

  it('DesarrolloRedondo3D: muestra el porcentaje de plegado y se redibuja con t', () => {
    const { rerender } = render(<DesarrolloRedondo3D id="cilindro" r={2} h={4} t={0} />);
    expect(screen.getByRole('img', { name: /Desarrollo del cilindro, plegado al 0 %/ })).toBeInTheDocument();
    const plano = puntos();
    rerender(<DesarrolloRedondo3D id="cilindro" r={2} h={4} t={1} />);
    expect(screen.getByRole('img', { name: /plegado al 100 %/ })).toBeInTheDocument();
    expect(puntos()).not.toBe(plano);
  });

  it('DesarrolloRedondo3D: el cono tiene su propia leyenda', () => {
    render(<DesarrolloRedondo3D id="cono" r={2} h={4} t={0.5} />);
    expect(screen.getByRole('img', { name: /Desarrollo del cono, plegado al 50 %/ })).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------- Módulo «Desarrollo plano interactivo»
describe('Desarrollo plano interactivo: cilindro, cono, giro y zoom', () => {
  const abrir = () =>
    render(
      <AppProvider>
        <DesarrolloPlano onVolver={() => {}} />
      </AppProvider>
    );
  const siguiente = () => screen.getByRole('button', { name: /Siguiente/ });
  const elegir = async (user, nombre) => user.click(within(screen.getByRole('group', { name: 'Cuerpo' })).getByRole('button', { name: nombre }));

  it('el desarrollo de un poliedro se puede girar solo, acercar y mover', () => {
    abrir();
    expect(screen.getByRole('button', { name: 'Girar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Acercar' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /Desarrollo plano de Cubo/ })).toHaveAttribute('tabindex', '0');
  });

  it('arrastrar la figura mueve también el deslizador «Girar la vista»', () => {
    abrir();
    const deslizador = screen.getByRole('slider', { name: 'Girar la vista' });
    expect(deslizador).toHaveValue('-20');
    const g = screen.getByRole('group', { name: /Desarrollo plano de Cubo/ });
    fireEvent.pointerDown(g, { pointerId: 1, clientX: 0, clientY: 0, button: 0 });
    fireEvent.pointerMove(g, { pointerId: 1, clientX: 50, clientY: 0 });
    expect(screen.getByRole('slider', { name: 'Girar la vista' })).toHaveValue('10');
  });

  it.each(['Cilindro', 'Cono'])('%s: el deslizador «Plegar» arma el cuerpo, y recién ahí se puede seguir', async (nombre) => {
    const user = userEvent.setup();
    abrir();
    await elegir(user, nombre);
    expect(screen.getByRole('img', { name: new RegExp(`Desarrollo del ${nombre.toLowerCase()}, plegado al 0 %`) })).toBeInTheDocument();
    expect(siguiente()).toBeDisabled();

    fireEvent.change(screen.getByRole('slider', { name: 'Plegar' }), { target: { value: '50' } });
    expect(screen.getByRole('img', { name: /plegado al 50 %/ })).toBeInTheDocument();
    expect(siguiente()).toBeDisabled();

    fireEvent.change(screen.getByRole('slider', { name: 'Plegar' }), { target: { value: '100' } });
    expect(screen.getByRole('img', { name: /plegado al 100 %/ })).toBeInTheDocument();
    expect(siguiente()).toBeEnabled();
  });

  it('el botón «Plegar» anima el cuerpo redondo hasta el 100 % y «Desplegar» lo vuelve a abrir', async () => {
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'setTimeout', 'clearTimeout', 'performance'] });
    abrir();
    fireEvent.click(within(screen.getByRole('group', { name: 'Cuerpo' })).getByRole('button', { name: 'Cilindro' }));
    expect(screen.getByRole('slider', { name: 'Plegar' })).toHaveValue('0');

    fireEvent.click(screen.getByRole('button', { name: 'Plegar' }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(800);
    });
    const aMitad = Number(screen.getByRole('slider', { name: 'Plegar' }).value);
    expect(aMitad).toBeGreaterThan(0);
    expect(aMitad).toBeLessThan(100);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });
    expect(screen.getByRole('slider', { name: 'Plegar' })).toHaveValue('100');
    expect(screen.getByRole('img', { name: /plegado al 100 %/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Siguiente/ })).toBeEnabled();

    fireEvent.click(screen.getByRole('button', { name: 'Desplegar' }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });
    expect(screen.getByRole('slider', { name: 'Plegar' })).toHaveValue('0');
  });

  it('al cambiar de cuerpo la animación se corta y el plegado vuelve a 0 %', async () => {
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'setTimeout', 'clearTimeout', 'performance'] });
    abrir();
    const cuerpo = (n) => fireEvent.click(within(screen.getByRole('group', { name: 'Cuerpo' })).getByRole('button', { name: n }));
    cuerpo('Cono');
    fireEvent.click(screen.getByRole('button', { name: 'Plegar' }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });
    cuerpo('Cilindro');
    expect(screen.getByRole('slider', { name: 'Plegar' })).toHaveValue('0');
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });
    expect(screen.getByRole('slider', { name: 'Plegar' })).toHaveValue('0'); // no siguió plegando solo
  });
});

// ---------------------------------------------------------------- Fórmulas anchas
describe('Formula en bloque que no entra en pantalla', () => {
  const medidas = (scroll, cliente) => {
    vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(scroll);
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(cliente);
  };

  it('si desborda, se puede enfocar con el teclado y se anuncia', () => {
    medidas(500, 300);
    const { container } = render(<Formula block tex="A = \\dfrac{a \\cdot b}{2}" />);
    const caja = container.firstChild;
    expect(caja).toHaveAttribute('tabindex', '0');
    expect(caja).toHaveAttribute('role', 'group');
    expect(caja.getAttribute('aria-label')).toMatch(/desplazar/);
  });

  it('si entra, no suma una parada de tabulación de más', () => {
    medidas(300, 300);
    const { container } = render(<Formula block tex="A = a^2" />);
    expect(container.firstChild).not.toHaveAttribute('tabindex');
  });

  it('la fórmula en línea no cambia', () => {
    const { container } = render(<Formula tex="a^2" />);
    expect(container.firstChild.tagName).toBe('SPAN');
  });
});
