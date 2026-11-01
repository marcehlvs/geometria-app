import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import katex from 'katex';

import { AppProvider } from '../context/AppContext.jsx';
import App from '../App.jsx';
import AreasVolumenes from '../modules/AreasVolumenes/AreasVolumenes.jsx';
import { COMPONENTES } from '../modules/index.js';
import { REDONDOS } from '../data/cuerpos.js';
import { IDS_DIBUJABLES } from '../utils/solidos3d.js';
import {
  CUERPOS_CALCULO,
  medidasIniciales,
  calcularCuerpo,
  EQUIVALENCIAS,
  EJEMPLOS_CAPACIDAD,
  capacidadEjemplo,
  DEMO_PIRAMIDES,
} from '../data/areasVolumenes.js';

beforeEach(() => {
  window.scrollTo = vi.fn();
  window.localStorage.clear();
  window.location.hash = '';
});
afterEach(cleanup);

const ESCOLAR = { pi: 3.14, piEscolar: true };
const valores = (id, medidas, opciones = ESCOLAR) =>
  Object.fromEntries(
    [...calcularCuerpo(id, medidas, opciones).previos, ...calcularCuerpo(id, medidas, opciones).resultados].map((r) => [r.id, r.valor])
  );

describe('Cálculos de áreas y volúmenes (data/areasVolumenes.js)', () => {
  it('cubo de arista 3 cm', () => {
    expect(valores('cubo', { a: 3 })).toMatchObject({ areaLateral: 36, areaTotal: 54, volumen: 27 });
  });

  it('ortoedro de 5 × 3 × 4 cm', () => {
    expect(valores('ortoedro', { a: 5, b: 3, c: 4 })).toMatchObject({ areaLateral: 64, areaTotal: 94, volumen: 60 });
  });

  it('prisma triangular de base 3-4-5 y altura 6 cm', () => {
    expect(valores('prisma-triangular', { p: 3, q: 4, h: 6 })).toMatchObject({
      hipotenusa: 5,
      perimetroBase: 12,
      areaBase: 6,
      areaLateral: 72,
      areaTotal: 84,
      volumen: 36,
    });
  });

  it('pirámide cuadrada de lado 6 y altura 4 cm (apotema 5)', () => {
    expect(valores('piramide-cuadrada', { a: 6, h: 4 })).toMatchObject({
      apotema: 5,
      areaBase: 36,
      areaLateral: 60,
      areaTotal: 96,
      volumen: 48,
    });
  });

  it('cilindro, cono y esfera con π = 3,14', () => {
    const cil = valores('cilindro', { r: 3, h: 5 });
    expect(cil.areaLateral).toBeCloseTo(94.2);
    expect(cil.areaTotal).toBeCloseTo(150.72);
    expect(cil.volumen).toBeCloseTo(141.3);

    const cono = valores('cono', { r: 3, h: 4 });
    expect(cono.generatriz).toBe(5);
    expect(cono.areaLateral).toBeCloseTo(47.1);
    expect(cono.areaTotal).toBeCloseTo(75.36);
    expect(cono.volumen).toBeCloseTo(37.68);

    const esf = valores('esfera', { r: 3 });
    expect(esf.areaTotal).toBeCloseTo(113.04);
    expect(esf.volumen).toBeCloseTo(113.04);
  });

  it('con π exacto usa Math.PI en el valor y el símbolo π en el reemplazo', () => {
    const { resultados } = calcularCuerpo('cilindro', { r: 3, h: 5 }, { pi: Math.PI, piEscolar: false });
    const vol = resultados.find((r) => r.id === 'volumen');
    expect(vol.valor).toBeCloseTo(Math.PI * 9 * 5);
    expect(vol.reemplazo).toContain('\\pi');
    expect(vol.usaPi).toBe(true);
    const escolar = calcularCuerpo('cilindro', { r: 3, h: 5 }, ESCOLAR).resultados.find((r) => r.id === 'volumen');
    expect(escolar.reemplazo).toContain('3{,}14');
  });

  it('el cono ocupa la tercera parte del cilindro de igual base y altura', () => {
    const cil = valores('cilindro', { r: 4, h: 6 }).volumen;
    const cono = valores('cono', { r: 4, h: 6 }).volumen;
    expect(cono * 3).toBeCloseTo(cil);
  });

  it('todos los cuerpos tienen dibujo y todas las fórmulas y reemplazos se renderizan en KaTeX', () => {
    CUERPOS_CALCULO.forEach((c) => {
      expect(IDS_DIBUJABLES.includes(c.id) || REDONDOS.some((r) => r.id === c.id)).toBe(true);
      [ESCOLAR, { pi: Math.PI, piEscolar: false }].forEach((op) => {
        const { previos, resultados } = calcularCuerpo(c.id, medidasIniciales(c.id), op);
        [...previos, ...resultados].forEach((it) => {
          expect(() => katex.renderToString(it.formula, { throwOnError: true })).not.toThrow();
          expect(() => katex.renderToString(`= ${it.reemplazo}`, { throwOnError: true })).not.toThrow();
          expect(Number.isFinite(it.valor)).toBe(true);
        });
      });
    });
  });
});

describe('Unidades y capacidad', () => {
  it('la tabla de equivalencias sale de las funciones de conversión', () => {
    const valor = (id) => EQUIVALENCIAS.find((e) => e.id === id).valor;
    expect(valor('m2-cm2')).toBe(10000);
    expect(valor('m2-dm2')).toBe(100);
    expect(valor('dm2-cm2')).toBe(100);
    expect(valor('m3-dm3')).toBe(1000);
    expect(valor('dm3-cm3')).toBe(1000);
    expect(valor('m3-cm3')).toBe(1000000);
    expect(valor('dm3-l')).toBe(1);
  });

  it('la caja, el tanque y la pileta pasan de volumen a litros', () => {
    const litros = (id) => capacidadEjemplo(EJEMPLOS_CAPACIDAD.find((e) => e.id === id));
    expect(litros('caja')).toEqual({ volumen: 7200, litros: 7.2, enDm3: 7.2 });
    expect(litros('tanque')).toEqual({ volumen: 1.5, litros: 1500, enDm3: 1500 });
    expect(litros('pileta')).toEqual({ volumen: 9.6, litros: 9600, enDm3: 9600 });
  });

  it('3 pirámides de igual base y altura llenan 1 prisma', () => {
    expect(DEMO_PIRAMIDES.volumenPrisma).toBe(324);
    expect(DEMO_PIRAMIDES.volumenPiramide).toBe(108);
    expect(DEMO_PIRAMIDES.volumenPiramide * 3).toBe(DEMO_PIRAMIDES.volumenPrisma);
  });
});

describe('Áreas y volúmenes (módulo)', () => {
  it('está registrado y se abre desde el menú', async () => {
    expect(COMPONENTES['areas-volumenes']).toBeDefined();
    const user = userEvent.setup();
    render(
      <AppProvider>
        <App />
      </AppProvider>
    );
    await user.click(await screen.findByRole('button', { name: /Áreas y volúmenes/ }));
    expect(await screen.findByText('Calculá áreas y volúmenes')).toBeInTheDocument();
  });

  it('muestra el desglose, se actualiza al cambiar las medidas y respeta el valor de π', async () => {
    const user = userEvent.setup();
    render(
      <AppProvider>
        <AreasVolumenes onVolver={() => {}} />
      </AppProvider>
    );
    expect(screen.getByRole('button', { name: /Siguiente/ })).toBeDisabled();
    expect(screen.getByText('54 cm²')).toBeInTheDocument();
    expect(screen.getByText('27 cm³')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Aumentar Arista' }));
    expect(screen.getByText('96 cm²')).toBeInTheDocument();
    expect(screen.getByText('64 cm³')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Siguiente/ })).toBeEnabled();

    await user.click(screen.getByRole('button', { name: 'Cilindro' }));
    expect(screen.getByText('150,72 cm²')).toBeInTheDocument();
    expect(screen.getByText('141,3 cm³')).toBeInTheDocument();
    expect(screen.getByText(/π = 3,14/)).toBeInTheDocument();
  });

  it('con π exacto los resultados con π se marcan como aproximados', async () => {
    window.localStorage.setItem('geo:piEscolar', 'false');
    const user = userEvent.setup();
    render(
      <AppProvider>
        <AreasVolumenes onVolver={() => {}} />
      </AppProvider>
    );
    await user.click(screen.getByRole('button', { name: 'Esfera' }));
    expect(screen.getByText('≈ 113,1 cm³')).toBeInTheDocument();
    expect(screen.getByText(/valor exacto de π/)).toBeInTheDocument();
  });

  it('recorre el módulo completo, bloquea cada paso y guarda el progreso', async () => {
    const user = userEvent.setup();
    const onVolver = vi.fn();
    render(
      <AppProvider>
        <AreasVolumenes onVolver={onVolver} />
      </AppProvider>
    );
    const siguiente = () => screen.getByRole('button', { name: /Siguiente/ });

    // Paso 1: bloqueado hasta cambiar alguna medida
    expect(siguiente()).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Aumentar Arista' }));
    await user.click(siguiente());

    // Paso 2: 1 m² = 10 000 cm²
    expect(siguiente()).toBeDisabled();
    expect(screen.getByText('10.000 cm²')).toBeInTheDocument();
    await user.type(screen.getByRole('textbox'), '10000');
    await user.click(screen.getByRole('button', { name: 'Comprobar' }));
    await user.click(siguiente());

    // Paso 3: ejemplos y caja de 20 × 30 × 50 cm = 30 litros
    expect(siguiente()).toBeDisabled();
    expect(screen.getByText('7,2 litros')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Pileta/ }));
    expect(screen.getByText('9.600 litros')).toBeInTheDocument();
    await user.type(screen.getByRole('textbox'), '30');
    await user.click(screen.getByRole('button', { name: 'Comprobar' }));
    await user.click(siguiente());

    // Paso 4: verter las 3 pirámides
    expect(siguiente()).toBeDisabled();
    const verter = screen.getByRole('button', { name: 'Verter una pirámide' });
    await user.click(verter);
    expect(screen.getByText('108 cm³', { exact: false })).toBeInTheDocument();
    await user.click(verter);
    expect(siguiente()).toBeDisabled();
    await user.click(verter);
    expect(verter).toBeDisabled();
    expect(screen.getByText(/Se llenó justo/)).toBeInTheDocument();
    await user.click(siguiente());

    // Paso 5: cono y cilindro
    expect(siguiente()).toBeDisabled();
    await user.click(screen.getByRole('button', { name: '30 cm³' }));
    await user.click(siguiente());

    // Paso 6
    await user.click(screen.getByRole('button', { name: /Terminar/ }));
    expect(JSON.parse(window.localStorage.getItem('geo:completados'))).toEqual(['areas-volumenes']);
    expect(onVolver).toHaveBeenCalled();
  });
});
