import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import katex from 'katex';

import { AppProvider } from '../context/AppContext.jsx';
import App from '../App.jsx';
import Formulario from '../modules/Formulario/Formulario.jsx';
import { COMPONENTES } from '../modules/index.js';
import { FIGURAS } from '../data/figuras.js';
import {
  TARJETAS,
  CALCULADORAS,
  tarjetasPorAnio,
  buscarTarjetas,
  calcularTarjeta,
  unidadConDim,
  normalizar,
} from '../data/formulario.js';

beforeEach(() => {
  window.scrollTo = vi.fn();
  window.localStorage.clear();
  window.location.hash = '';
});
afterEach(cleanup);

const ids = (tarjetas) => tarjetas.map((t) => t.id);
const por = (id, textos, pi = 3.14) => Object.fromEntries(calcularTarjeta(id, textos, pi).map((r) => [r.nombre, r.valor]));

describe('Datos del formulario (data/formulario.js)', () => {
  it('hay una tarjeta por cada figura y los ids no se repiten', () => {
    FIGURAS.forEach((f) => expect(ids(TARJETAS)).toContain(f.id));
    expect(new Set(ids(TARJETAS)).size).toBe(TARJETAS.length);
  });

  it('todas las fórmulas y variables se renderizan en KaTeX', () => {
    TARJETAS.forEach((t) => {
      expect(t.formulas.length).toBeGreaterThan(0);
      t.formulas.forEach((f) => expect(() => katex.renderToString(f.tex, { throwOnError: true })).not.toThrow());
      Object.keys(t.variables).forEach((k) => expect(() => katex.renderToString(k, { throwOnError: true })).not.toThrow());
    });
  });

  it('cada calculadora pertenece a una tarjeta y todas las tarjetas (menos unidades) tienen la suya', () => {
    Object.keys(CALCULADORAS).forEach((id) => expect(ids(TARJETAS)).toContain(id));
    TARJETAS.filter((t) => t.id !== 'unidades').forEach((t) => expect(CALCULADORAS[t.id]).toBeDefined());
  });

  it('filtra por año', () => {
    expect(ids(tarjetasPorAnio(0))).toHaveLength(TARJETAS.length);
    expect(ids(tarjetasPorAnio(1))).not.toContain('esfera');
    expect(ids(tarjetasPorAnio(1))).not.toContain('pitagoras');
    expect(ids(tarjetasPorAnio(2))).toEqual(expect.arrayContaining(['esfera', 'pitagoras', 'euler']));
  });
});

describe('Buscador', () => {
  it('ignora tildes y mayúsculas', () => {
    expect(normalizar('  ÁREA Lateral ')).toBe('area lateral');
    expect(ids(buscarTarjetas(TARJETAS, 'AREA'))).toContain('triangulo');
    expect(ids(buscarTarjetas(TARJETAS, 'pitagoras'))).toEqual(['pitagoras']);
  });

  it('todas las palabras tienen que aparecer', () => {
    expect(ids(buscarTarjetas(TARJETAS, 'cilindro'))).toEqual(['cilindro']);
    expect(ids(buscarTarjetas(TARJETAS, 'volumen cilindro'))).toEqual(['cilindro']);
    expect(ids(buscarTarjetas(TARJETAS, 'volumen'))).toEqual(expect.arrayContaining(['cubo', 'cono', 'esfera', 'unidades']));
    expect(buscarTarjetas(TARJETAS, 'zzzz')).toEqual([]);
    expect(buscarTarjetas(TARJETAS, '   ')).toHaveLength(TARJETAS.length);
  });
});

describe('Mini calculadoras', () => {
  it('figuras planas (acepta coma decimal)', () => {
    expect(por('rectangulo', { b: '6', h: '4,5' })).toEqual({ Perímetro: 21, Área: 27 });
    expect(por('cuadrado', { l: '5' })).toEqual({ Perímetro: 20, Área: 25 });
    expect(por('triangulo', { b: '6', h: '4' })).toEqual({ Área: 12 });
    expect(por('triangulo', { a: '3', b: '4', c: '5', h: '3' })).toEqual({ Perímetro: 12, Área: 6 });
    expect(por('trapecio', { B: '8', b: '4', h: '5' })).toEqual({ Área: 30 });
    expect(por('rombo', { l: '5', D: '10', d: '6' })).toEqual({ Perímetro: 20, Área: 30 });
    expect(por('poligono-regular', { n: '6', l: '4', a_p: '3,46' }).Perímetro).toBe(24);
  });

  it('círculo con π = 3,14 y con π exacto', () => {
    expect(por('circulo', { r: '5' }).Longitud).toBeCloseTo(31.4);
    expect(por('circulo', { r: '5' }).Área).toBeCloseTo(78.5);
    expect(por('circulo', { r: '1' }, Math.PI).Área).toBeCloseTo(Math.PI);
  });

  it('Pitágoras: hipotenusa y cateto, y no muestra un cateto imposible', () => {
    expect(por('pitagoras', { a: '3', b: '4' })['Hipotenusa c']).toBe(5);
    expect(por('pitagoras', { b: '3', c: '5' })['Cateto a (con b y c)']).toBe(4);
    expect(por('pitagoras', { b: '5', c: '3' })).toEqual({});
  });

  it('cuerpos', () => {
    expect(por('cubo', { a: '3' })).toEqual({ 'Área lateral': 36, 'Área total': 54, Volumen: 27 });
    expect(por('ortoedro', { a: '5', b: '3', c: '4' })).toEqual({ 'Área lateral': 64, 'Área total': 94, Volumen: 60 });
    expect(por('prisma', { Pb: '12', Ab: '6', h: '6' })).toEqual({ 'Área lateral': 72, 'Área total': 84, Volumen: 36 });
    expect(por('piramide', { AL: '60', Ab: '36', h: '4' })).toEqual({ 'Área total': 96, Volumen: 48 });
    expect(por('cilindro', { r: '2', h: '5' }).Volumen).toBeCloseTo(62.8);
    const cono = por('cono', { r: '3', h: '4' });
    expect(cono.Generatriz).toBe(5);
    expect(cono.Volumen).toBeCloseTo(37.68);
    expect(por('esfera', { r: '3' })['Área de la superficie']).toBeCloseTo(113.04);
  });

  it('Euler: halla lo que falta', () => {
    expect(por('euler', { C: '6', V: '8' })).toEqual({ Aristas: 12 });
    expect(por('euler', { A: '12', V: '8' })).toEqual({ Caras: 6 });
    expect(por('euler', { C: '6', A: '12' })).toEqual({ Vértices: 8 });
  });

  it('ignora campos vacíos, con letras, cero o negativos', () => {
    expect(calcularTarjeta('rectangulo', {})).toEqual([]);
    expect(calcularTarjeta('rectangulo', { b: 'abc', h: '4' })).toEqual([]);
    expect(calcularTarjeta('rectangulo', { b: '0', h: '4' })).toEqual([]);
    expect(calcularTarjeta('rectangulo', { b: '-2', h: '4' })).toEqual([]);
    expect(calcularTarjeta('no-existe', { a: '1' })).toEqual([]);
  });

  it('unidad según la dimensión', () => {
    expect(unidadConDim('lineal', 'cm')).toBe('cm');
    expect(unidadConDim('area', 'm')).toBe('m²');
    expect(unidadConDim('volumen', 'dm')).toBe('dm³');
    expect(unidadConDim('cantidad', 'cm')).toBe('');
  });
});

describe('Formulario (módulo)', () => {
  const abrir = () =>
    render(
      <AppProvider>
        <Formulario onVolver={() => {}} />
      </AppProvider>
    );
  const tarjeta = (nombre) => screen.getByRole('article', { name: nombre });

  it('está registrado, se abre desde el menú y queda marcado como visto', async () => {
    expect(COMPONENTES.formulario).toBeDefined();
    const user = userEvent.setup();
    render(
      <AppProvider>
        <App />
      </AppProvider>
    );
    await user.click(await screen.findByRole('button', { name: /Formulario/ }));
    expect(await screen.findByRole('searchbox')).toBeInTheDocument();
    await waitFor(() => expect(JSON.parse(window.localStorage.getItem('geo:completados'))).toContain('formulario'));
  });

  it('muestra todas las tarjetas agrupadas y cuenta cuántas hay', () => {
    abrir();
    expect(screen.getAllByRole('article')).toHaveLength(TARJETAS.length);
    expect(screen.getByRole('heading', { name: /Figuras planas/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Cuerpos geométricos/ })).toBeInTheDocument();
    expect(screen.getByText(`${TARJETAS.length} tarjetas`)).toBeInTheDocument();
  });

  it('el buscador filtra, cuenta y avisa si no encuentra nada', async () => {
    const user = userEvent.setup();
    abrir();
    await user.type(screen.getByRole('searchbox'), 'cilindro');
    expect(screen.getAllByRole('article')).toHaveLength(1);
    expect(tarjeta('Cilindro')).toBeInTheDocument();
    expect(screen.getByText('1 tarjeta')).toBeInTheDocument();

    await user.clear(screen.getByRole('searchbox'));
    await user.type(screen.getByRole('searchbox'), 'zzzz');
    expect(screen.queryAllByRole('article')).toHaveLength(0);
    expect(screen.getByText(/No encontramos fórmulas con «zzzz»/)).toBeInTheDocument();
  });

  it('el filtro por año oculta lo que no corresponde', async () => {
    const user = userEvent.setup();
    abrir();
    expect(tarjeta('Esfera')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '1.º año' }));
    expect(screen.queryByRole('article', { name: 'Esfera' })).not.toBeInTheDocument();
    expect(tarjeta('Cubo')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '2.º año' }));
    expect(tarjeta('Esfera')).toBeInTheDocument();
  });

  it('la mini calculadora calcula con coma decimal y cambia de unidad', async () => {
    const user = userEvent.setup();
    abrir();
    const rect = within(tarjeta('Rectángulo'));
    expect(rect.queryByLabelText('Base b')).not.toBeInTheDocument();
    await user.click(rect.getByRole('button', { name: 'Mini calculadora' }));
    expect(rect.getByText(/Todavía faltan datos/)).toBeInTheDocument();

    await user.type(rect.getByLabelText('Base b'), '6');
    await user.type(rect.getByLabelText('Altura h'), '4,5');
    expect(rect.getByText('21 cm')).toBeInTheDocument();
    expect(rect.getByText('27 cm²')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'm' }));
    expect(rect.getByText('27 m²')).toBeInTheDocument();
  });

  it('el estado de cada calculadora se conserva al buscar y volver', async () => {
    const user = userEvent.setup();
    abrir();
    const cubo = within(tarjeta('Cubo'));
    await user.click(cubo.getByRole('button', { name: 'Mini calculadora' }));
    await user.type(cubo.getByLabelText('Arista a'), '3');
    expect(cubo.getByText('27 cm³')).toBeInTheDocument();

    await user.type(screen.getByRole('searchbox'), 'esfera');
    expect(screen.queryByRole('article', { name: 'Cubo' })).not.toBeInTheDocument();
    await user.clear(screen.getByRole('searchbox'));

    const de_nuevo = within(tarjeta('Cubo'));
    await user.click(de_nuevo.getByRole('button', { name: 'Mini calculadora' }));
    expect(de_nuevo.getByLabelText('Arista a')).toHaveValue('3');
  });

  it('con π exacto avisa que los resultados son aproximados', () => {
    window.localStorage.setItem('geo:piEscolar', 'false');
    abrir();
    expect(screen.getByText(/valor exacto de π/)).toBeInTheDocument();
  });

  it('«Imprimir resumen» abre la impresión', async () => {
    const user = userEvent.setup();
    window.print = vi.fn();
    abrir();
    await user.click(screen.getByRole('button', { name: /Imprimir resumen/ }));
    expect(window.print).toHaveBeenCalledTimes(1);
  });
});
