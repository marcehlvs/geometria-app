import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import katex from 'katex';

import { AppProvider } from '../context/AppContext.jsx';
import App from '../App.jsx';
import Evaluacion from '../modules/Evaluacion/Evaluacion.jsx';
import { COMPONENTES } from '../modules/index.js';
import { construirDesarrollo, areaTotalDesarrollo } from '../data/nets.js';
import { fmt } from '../utils/format.js';
import {
  EJERCICIOS,
  DESCUENTO_UNIDAD,
  ejerciciosDe,
  crearEvaluacion,
  corregirParte,
  corregirEvaluacion,
} from '../data/evaluacion.js';

beforeEach(() => {
  window.scrollTo = vi.fn();
  window.localStorage.clear();
  window.location.hash = '';
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const ESCOLAR = { pi: 3.14, piEscolar: true };
const EXACTO = { pi: Math.PI, piEscolar: false };
const semillas = Array.from({ length: 60 }, (_, i) => 1000 + i * 137);
const partesDe = (ev) => ev.ejercicios.flatMap((e) => e.partes);
const correctas = (ev) => Object.fromEntries(partesDe(ev).map((p) => [p.id, { texto: String(p.valor), unidad: p.unidad }]));

describe('Evaluación (data/evaluacion.js)', () => {
  it('hay ejercicios de figuras y de cuerpos para cada año', () => {
    expect(new Set(EJERCICIOS.map((e) => e.id)).size).toBe(EJERCICIOS.length);
    [0, 1, 2].forEach((anio) => {
      expect(ejerciciosDe('figuras', anio).length).toBeGreaterThanOrEqual(2);
      expect(ejerciciosDe('cuerpos', anio).length).toBeGreaterThanOrEqual(2);
    });
    expect(ejerciciosDe('figuras', 1).map((e) => e.id)).not.toContain('cartel-casita'); // usa Pitágoras
    expect(ejerciciosDe('cuerpos', 1).map((e) => e.id)).not.toContain('piramide-desarrollo');
  });

  it('cada evaluación tiene un ejercicio de figuras y uno de cuerpos, de 6 puntos cada uno', () => {
    [0, 1, 2].forEach((anio) =>
      semillas.forEach((s) => {
        const ev = crearEvaluacion(s, anio, ESCOLAR);
        expect(ev.ejercicios.map((e) => e.bloque)).toEqual(['figuras', 'cuerpos']);
        ev.ejercicios.forEach((e) => {
          expect(e.puntos).toBe(6);
          expect(EJERCICIOS.find((x) => x.id === e.id).anios).toContain(anio || EJERCICIOS.find((x) => x.id === e.id).anios[0]);
        });
        expect(ev.maximo).toBe(12);
      })
    );
  });

  it('todos los pasos son válidos con π escolar y exacto (números, unidades, KaTeX y opciones)', () => {
    [ESCOLAR, EXACTO].forEach((ctx) =>
      semillas.forEach((s) => {
        const ev = crearEvaluacion(s, 0, ctx);
        const ids = partesDe(ev).map((p) => p.id);
        expect(new Set(ids).size).toBe(ids.length);
        ev.ejercicios.forEach((e) => {
          expect(e.enunciado).not.toMatch(/undefined|NaN|\[object/);
          expect(e.enunciado.length).toBeGreaterThan(30);
        });
        partesDe(ev).forEach((p) => {
          expect(Number.isFinite(p.valor) && p.valor > 0).toBe(true);
          expect(p.puntos).toBeGreaterThan(0);
          expect(() => katex.renderToString(p.tex, { throwOnError: true })).not.toThrow();
          expect(p.opciones).toContain(p.unidad);
          expect(new Set(p.opciones).size).toBe(4);
        });
      })
    );
  });

  it('es repetible por número y distinta con otro número', () => {
    expect(crearEvaluacion(4821, 0, ESCOLAR)).toEqual(crearEvaluacion(4821, 0, ESCOLAR));
    const distintas = new Set(semillas.map((s) => crearEvaluacion(s, 0, ESCOLAR).ejercicios.map((e) => e.enunciado).join('|')));
    expect(distintas.size).toBeGreaterThan(40);
    const ids = new Set(semillas.flatMap((s) => crearEvaluacion(s, 0, ESCOLAR).ejercicios.map((e) => e.id)));
    expect(ids.size).toBe(EJERCICIOS.length); // con 60 semillas salen todos los ejercicios
  });

  it('con π se aceptan 3,14 y la tecla π (diferencia menor al 1 %)', () => {
    semillas.forEach((s) => {
      const a = partesDe(crearEvaluacion(s, 0, ESCOLAR));
      const b = partesDe(crearEvaluacion(s, 0, EXACTO));
      a.forEach((p, i) => {
        if (p.usaPi) {
          expect(Math.abs(p.valor - b[i].valor) / b[i].valor).toBeLessThan(0.01);
          expect(corregirParte(p, String(b[i].valor), p.unidad).estado).toBe('ok');
        } else {
          expect(p.valor).toBe(b[i].valor);
        }
      });
    });
  });

  it('los resultados son coherentes con el enunciado', () => {
    const ev = (id) => {
      const s = semillas.find((x) => crearEvaluacion(x, 2, ESCOLAR).ejercicios.some((e) => e.id === id));
      const e = crearEvaluacion(s, 2, ESCOLAR).ejercicios.find((x) => x.id === id);
      return Object.fromEntries(e.partes.map((p) => [p.letra, p.valor]));
    };
    let v = ev('terreno-pileta');
    expect(v.d).toBeCloseTo(v.b - v.c);
    expect(v.a).toBeGreaterThan(0);
    v = ev('patio-con-rincon');
    expect(v.c).toBe(v.a - v.b);
    v = ev('cartel-casita');
    expect(v.a === 50 || v.a === 100).toBe(true); // lado inclinado de la terna 3-4-5 o 6-8-10 (por 10)
    v = ev('cilindro-desarrollo');
    expect(v.c).toBeCloseTo(v.b + 2 * 3.14 * (v.a / (2 * 3.14)) ** 2, 6); // A_T = A_L + 2·π·r²
    v = ev('cubo-desarrollo');
    expect(v.b).toBe(6 * v.a);
    expect(v.d).toBe(12 * Math.sqrt(v.a));
    v = ev('caja-desarrollo');
    expect(v.d).toBeCloseTo(v.c / 1000, 9);
  });

  it('el área total sale igual calculada con la fórmula y con las caras del desarrollo plano', () => {
    let vistas = 0;
    semillas.forEach((s) => {
      crearEvaluacion(s, 2, ESCOLAR).ejercicios.forEach((e) => {
        if (e.figura?.tipo !== 'net') return;
        const net = construirDesarrollo(e.figura.id, e.figura.medidas);
        const total = areaTotalDesarrollo(net);
        if (e.id === 'caja-desarrollo' || e.id === 'cubo-desarrollo') {
          expect(e.partes.find((p) => p.letra === 'b').valor).toBeCloseTo(total, 6);
        } else {
          // pirámide: el área lateral es el total del desarrollo menos la base
          const lado = e.figura.medidas.a;
          expect(e.partes.find((p) => p.letra === 'b').valor).toBeCloseTo(total - lado * lado, 6);
        }
        vistas++;
      });
    });
    expect(vistas).toBeGreaterThan(20);
  });
});

describe('Corrección del puntaje por paso', () => {
  const ev = crearEvaluacion(4821, 0, ESCOLAR);
  const p = ev.ejercicios[0].partes[0];

  it('número y unidad bien: puntaje completo', () => {
    expect(corregirParte(p, String(p.valor), p.unidad)).toEqual({ estado: 'ok', puntos: p.puntos });
  });

  it('número bien con unidad mal o sin elegir: descuenta 0,5', () => {
    const otra = p.opciones.find((u) => u !== p.unidad);
    expect(corregirParte(p, String(p.valor), otra)).toEqual({ estado: 'unidad', puntos: p.puntos - DESCUENTO_UNIDAD });
    expect(corregirParte(p, String(p.valor), '').estado).toBe('unidad');
    expect(corregirParte({ ...p, puntos: 0.5 }, String(p.valor), '').puntos).toBe(0);
  });

  it('número mal o vacío: cero', () => {
    expect(corregirParte(p, String(p.valor * 3), p.unidad)).toEqual({ estado: 'mal', puntos: 0 });
    expect(corregirParte(p, '', p.unidad)).toEqual({ estado: 'vacio', puntos: 0 });
    expect(corregirParte(p, 'abc', p.unidad).estado).toBe('vacio');
  });

  it('acepta coma decimal', () => {
    const conDecimales = partesDe(crearEvaluacion(4821, 0, ESCOLAR)).find((x) => !Number.isInteger(x.valor));
    expect(corregirParte(conDecimales, String(conDecimales.valor).replace('.', ','), conDecimales.unidad).estado).toBe('ok');
  });

  it('evaluación completa: todo bien = 12, sin unidades descuenta por paso, en blanco = 0', () => {
    const n = partesDe(ev).length;
    expect(corregirEvaluacion(ev, correctas(ev)).total).toBe(12);
    const sinUnidad = Object.fromEntries(Object.entries(correctas(ev)).map(([id, r]) => [id, { texto: r.texto }]));
    expect(corregirEvaluacion(ev, sinUnidad).total).toBe(12 - DESCUENTO_UNIDAD * n);
    expect(corregirEvaluacion(ev, {}).total).toBe(0);
    expect(corregirEvaluacion(ev, {}).maximo).toBe(12);
  });
});

describe('Modo evaluación (módulo)', () => {
  const abrir = () =>
    render(
      <AppProvider>
        <Evaluacion onVolver={() => {}} />
      </AppProvider>
    );
  const fijar = (...valores) => {
    const spy = vi.spyOn(Math, 'random');
    valores.forEach((v) => spy.mockReturnValueOnce(v));
    spy.mockReturnValue(0.5);
  };
  const completar = async (user, ev) => {
    for (const p of partesDe(ev)) {
      await user.type(screen.getByLabelText(`Respuesta ${p.id}`), String(p.valor));
      await user.selectOptions(screen.getByLabelText(`Unidad ${p.id}`), p.unidad);
    }
  };

  it('está registrado y se abre desde el menú', async () => {
    expect(COMPONENTES.evaluacion).toBeDefined();
    const user = userEvent.setup();
    render(
      <AppProvider>
        <App />
      </AppProvider>
    );
    await user.click(await screen.findByRole('button', { name: /Modo evaluación/ }));
    expect(await screen.findByRole('tablist')).toBeInTheDocument();
  });

  it('muestra los dos ejercicios con un campo de respuesta y de unidad por paso, sin pistas', () => {
    fijar(0.5); // evaluación N.º 5500
    abrir();
    const ev = crearEvaluacion(5500, 0, ESCOLAR);
    expect(screen.getByLabelText('Número de evaluación')).toHaveValue('5500');
    ev.ejercicios.forEach((e) => {
      expect(screen.getByRole('heading', { name: new RegExp(`Ejercicio ${e.numero} · ${e.titulo}`) })).toBeInTheDocument();
      expect(screen.getByText(e.enunciado)).toBeInTheDocument();
    });
    partesDe(ev).forEach((p) => {
      expect(screen.getByLabelText(`Respuesta ${p.id}`)).toBeInTheDocument();
      expect(screen.getByLabelText(`Unidad ${p.id}`)).toBeInTheDocument();
    });
    expect(screen.queryByText(/pista/i)).not.toBeInTheDocument();
  });

  it('resolver todo bien da 12 de 12, bloquea los campos y marca el módulo como completado', async () => {
    fijar(0.5);
    const user = userEvent.setup();
    abrir();
    const ev = crearEvaluacion(5500, 0, ESCOLAR);
    await completar(user, ev);
    await user.click(screen.getByRole('button', { name: 'Corregir evaluación' }));
    expect(screen.getByRole('status')).toHaveTextContent('Puntaje: 12 de 12');
    expect(screen.getByLabelText(`Respuesta ${partesDe(ev)[0].id}`)).toBeDisabled();
    await waitFor(() => expect(JSON.parse(window.localStorage.getItem('geo:completados'))).toContain('evaluacion'));
  });

  it('en blanco da 0, muestra las respuestas correctas y se puede volver a intentar', async () => {
    fijar(0.5);
    const user = userEvent.setup();
    abrir();
    const ev = crearEvaluacion(5500, 0, ESCOLAR);
    await user.click(screen.getByRole('button', { name: 'Corregir evaluación' }));
    expect(screen.getByRole('status')).toHaveTextContent('Puntaje: 0 de 12');
    expect(screen.getAllByText(/la respuesta era/)).toHaveLength(partesDe(ev).length);
    expect(JSON.parse(window.localStorage.getItem('geo:completados') ?? '[]')).not.toContain('evaluacion');

    await user.click(screen.getByRole('button', { name: 'Volver a intentarlo' }));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByLabelText(`Respuesta ${partesDe(ev)[0].id}`)).toBeEnabled();
  });

  it('número bien sin unidad descuenta 0,5 y lo explica', async () => {
    fijar(0.5);
    const user = userEvent.setup();
    abrir();
    const p = partesDe(crearEvaluacion(5500, 0, ESCOLAR))[0];
    await user.type(screen.getByLabelText(`Respuesta ${p.id}`), String(p.valor));
    await user.click(screen.getByRole('button', { name: 'Corregir evaluación' }));
    expect(screen.getByRole('status')).toHaveTextContent(`Puntaje: ${fmt(p.puntos - DESCUENTO_UNIDAD)} de 12`);
    expect(screen.getByText(/la unidad falta o está mal/)).toBeInTheDocument();
  });

  it('la versión para imprimir tiene encabezado con el número, sin campos ni respuestas, y abre la impresión', async () => {
    fijar(0.5);
    window.print = vi.fn();
    const user = userEvent.setup();
    abrir();
    const ev = crearEvaluacion(5500, 0, ESCOLAR);
    await user.click(screen.getByRole('tab', { name: 'Versión para imprimir' }));
    expect(screen.getByRole('heading', { name: /Evaluación N\.º 5500/ })).toBeInTheDocument();
    expect(screen.getByText(/Nombre y apellido/)).toBeInTheDocument();
    expect(screen.queryByLabelText(/^Respuesta /)).not.toBeInTheDocument();
    expect(screen.queryByText('CLAVE DEL DOCENTE')).not.toBeInTheDocument();
    const panel = within(screen.getByRole('tabpanel'));
    partesDe(ev).forEach((p) => expect(panel.queryByText(`${fmt(p.valor, 4)} ${p.unidad}`)).not.toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: /Imprimir la evaluación/ }));
    expect(window.print).toHaveBeenCalledTimes(1);
  });

  it('la clave del docente muestra la respuesta y el cálculo de cada paso, con el mismo número', async () => {
    fijar(0.5);
    window.print = vi.fn();
    const user = userEvent.setup();
    abrir();
    const ev = crearEvaluacion(5500, 0, ESCOLAR);
    await user.click(screen.getByRole('tab', { name: 'Clave del docente' }));
    expect(screen.getByText('CLAVE DEL DOCENTE')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Evaluación N\.º 5500/ })).toBeInTheDocument();
    const panel = within(screen.getByRole('tabpanel'));
    partesDe(ev).forEach((p) => expect(panel.getAllByText(`${fmt(p.valor, 4)} ${p.unidad}`).length).toBeGreaterThan(0));
    expect(panel.getAllByText(/Respuesta:/)).toHaveLength(partesDe(ev).length);
    await user.click(screen.getByRole('button', { name: /Imprimir la clave/ }));
    expect(window.print).toHaveBeenCalled();
  });

  it('con un número se obtiene siempre la misma evaluación, y un número inválido avisa', async () => {
    const user = userEvent.setup();
    abrir();
    const campo = screen.getByLabelText('Número de evaluación');

    await user.clear(campo);
    await user.type(campo, '4821');
    await user.click(screen.getByRole('button', { name: 'Usar' }));
    const ev = crearEvaluacion(4821, 0, ESCOLAR);
    ev.ejercicios.forEach((e) => expect(screen.getByText(e.enunciado)).toBeInTheDocument());

    await user.clear(campo);
    await user.type(campo, 'abc');
    await user.click(screen.getByRole('button', { name: 'Usar' }));
    expect(screen.getByRole('alert')).toHaveTextContent(/número entero positivo/);
    ev.ejercicios.forEach((e) => expect(screen.getByText(e.enunciado)).toBeInTheDocument()); // no cambió

    fijar(0.9); // «Nueva» -> 9100
    await user.click(screen.getByRole('button', { name: 'Nueva' }));
    expect(campo).toHaveValue('9100');
  });

  it('cambiar de número borra lo respondido', async () => {
    fijar(0.5);
    const user = userEvent.setup();
    abrir();
    const p = partesDe(crearEvaluacion(5500, 0, ESCOLAR))[0];
    await user.type(screen.getByLabelText(`Respuesta ${p.id}`), '99');
    fijar(0.2);
    await user.click(screen.getByRole('button', { name: 'Nueva' }));
    expect(screen.getByLabelText(`Respuesta ${p.id}`)).toHaveValue('');
  });

  it('los ejercicios con desarrollo plano rotulan las medidas en el dibujo', async () => {
    const semilla = semillas.find((s) => ['caja-desarrollo', 'cubo-desarrollo'].includes(crearEvaluacion(s, 0, ESCOLAR).ejercicios[1].id));
    const user = userEvent.setup();
    const { container } = abrir();
    const campo = screen.getByLabelText('Número de evaluación');
    await user.clear(campo);
    await user.type(campo, String(semilla));
    await user.click(screen.getByRole('button', { name: 'Usar' }));
    expect(container.querySelectorAll('[data-medida]').length).toBeGreaterThan(0);
  });
});
