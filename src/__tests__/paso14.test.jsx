import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import katex from 'katex';

import { AppProvider } from '../context/AppContext.jsx';
import App from '../App.jsx';
import Problemas from '../modules/Problemas/Problemas.jsx';
import { COMPONENTES } from '../modules/index.js';
import {
  TEMAS_PROBLEMAS,
  PROBLEMAS,
  plantillasDe,
  temasDisponibles,
  elegirPlantilla,
  crearProblema,
  corregir,
  opcionesDeUnidad,
} from '../data/problemas.js';
import { crearAleatorio } from '../utils/rand.js';

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
const plantilla = (id) => PROBLEMAS.find((p) => p.id === id);
const semillas = Array.from({ length: 40 }, (_, i) => 1000 + i * 223);

describe('Plantillas de problemas (data/problemas.js)', () => {
  it('hay al menos 3 plantillas por tema, con ids únicos', () => {
    TEMAS_PROBLEMAS.forEach((t) => expect(plantillasDe(t.id).length).toBeGreaterThanOrEqual(3));
    expect(new Set(PROBLEMAS.map((p) => p.id)).size).toBe(PROBLEMAS.length);
    PROBLEMAS.forEach((p) => {
      expect(TEMAS_PROBLEMAS.map((t) => t.id)).toContain(p.tema);
      expect(p.pistas.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('con año filtrado: en 1.º no hay Pitágoras ni Euler; en 2.º están todos los temas', () => {
    expect(temasDisponibles(1).map((t) => t.id)).toEqual(['figuras-planas', 'cuerpos', 'unidades']);
    expect(temasDisponibles(2)).toHaveLength(TEMAS_PROBLEMAS.length);
    expect(temasDisponibles(0)).toHaveLength(TEMAS_PROBLEMAS.length);
    expect(plantillasDe('pitagoras', 1)).toEqual([]);
  });

  it.each(PROBLEMAS.map((p) => [p.id, p]))('%s: da problemas válidos con 40 semillas, con π escolar y exacto', (_id, pl) => {
    [ESCOLAR, EXACTO].forEach((ctx) => {
      semillas.forEach((semilla) => {
        const p = crearProblema(pl, semilla, ctx);
        // enunciado completo, sin restos de plantilla
        expect(p.enunciado.length).toBeGreaterThan(30);
        expect(p.enunciado).not.toMatch(/undefined|NaN|\[object/);
        // todos los pasos tienen número positivo y unidad, y su fórmula se renderiza
        expect(p.pasos.length).toBeGreaterThan(0);
        p.pasos.forEach((paso) => {
          expect(Number.isFinite(paso.valor)).toBe(true);
          expect(paso.valor).toBeGreaterThan(0);
          expect(paso.unidad).toBeTruthy();
          expect(() => katex.renderToString(paso.tex, { throwOnError: true })).not.toThrow();
        });
        // la respuesta es el último paso y su unidad está entre las 4 opciones, sin repetidas
        expect(p.respuesta).toEqual({ valor: p.pasos.at(-1).valor, unidad: p.pasos.at(-1).unidad });
        expect(p.opciones).toContain(p.respuesta.unidad);
        expect(p.opciones.length).toBe(4);
        expect(new Set(p.opciones).size).toBe(4);
      });
    });
  });

  it('la misma semilla da el mismo problema y otra semilla da otros números', () => {
    const pl = plantilla('patio-baldosas');
    expect(crearProblema(pl, 4821)).toEqual(crearProblema(pl, 4821));
    const enunciados = new Set(semillas.map((s) => crearProblema(pl, s).enunciado));
    expect(enunciados.size).toBeGreaterThan(10);
  });

  it('los problemas sin π tienen respuestas exactas y los de π aceptan 3,14 y la tecla π', () => {
    PROBLEMAS.forEach((pl) => {
      semillas.slice(0, 10).forEach((semilla) => {
        const a = crearProblema(pl, semilla, ESCOLAR);
        const b = crearProblema(pl, semilla, EXACTO);
        if (pl.usaPi) {
          expect(Math.abs(a.respuesta.valor - b.respuesta.valor) / b.respuesta.valor).toBeLessThan(0.01);
          expect(a.tolerancia).toBeGreaterThan(0);
        } else {
          expect(a.respuesta.valor).toBe(b.respuesta.valor);
        }
        // lo que da el problema con cada valor de π se corrige como bien
        expect(corregir(a, String(b.respuesta.valor), a.respuesta.unidad).estado).toBe('ok');
      });
    });
  });

  it('los problemas con π avisan qué valor usar', () => {
    expect(crearProblema(plantilla('pileta-lona'), 1234, ESCOLAR).enunciado).toContain('π = 3,14');
    expect(crearProblema(plantilla('pileta-lona'), 1234, EXACTO).enunciado).toContain('tecla π');
    expect(crearProblema(plantilla('caja-zapatillas'), 1234, ESCOLAR).enunciado).not.toContain('π');
  });

  it('resultados conocidos de varias plantillas', () => {
    const val = (id, semilla = 777, ctx = ESCOLAR) => {
      const p = crearProblema(plantilla(id), semilla, ctx);
      return { p, d: p.datos, v: p.respuesta.valor };
    };
    let x = val('patio-baldosas');
    expect(x.v).toBe((x.d.largo * x.d.ancho * 10000) / (x.d.ladoCm * x.d.ladoCm));
    x = val('cancha-vueltas');
    expect(x.v).toBe(2 * (x.d.largo + x.d.ancho) * x.d.vueltas);
    x = val('escalera-pared');
    expect(x.v ** 2 + x.d.distancia ** 2).toBe(x.d.largo ** 2);
    x = val('galpon-diagonal');
    expect(x.v ** 2).toBe(x.d.ancho ** 2 + x.d.alto ** 2);
    x = val('caja-forrar');
    expect(x.v).toBe(2 * (x.d.largo * x.d.ancho + x.d.largo * x.d.alto + x.d.ancho * x.d.alto));
    x = val('pileta-litros');
    expect(x.v).toBeCloseTo(x.d.largo * x.d.ancho * x.d.prof * 1000, 6);
    x = val('tanque-cilindrico');
    expect(x.v).toBeCloseTo(3.14 * x.d.radio ** 2 * x.d.altura, 6);
    x = val('carpa-piramide');
    expect(x.v).toBe((x.d.lado ** 2 * x.d.altura) / 3);
    x = val('euler-prisma');
    expect(x.v).toBe(3 * x.d.lados);
    x = val('cartel-cm2-m2');
    expect(x.v).toBe((x.d.base * x.d.altura) / 10000);
    // Euler: C + V = A + 2 se cumple en los tres problemas de despeje
    ['euler-aristas', 'euler-caras', 'euler-vertices'].forEach((id) => {
      const { d } = val(id);
      expect(d.C + d.V).toBe(d.A + 2);
    });
  });

  it('elegirPlantilla es repetible, respeta tema y año y evita la anterior', () => {
    expect(elegirPlantilla('cuerpos', 0, 5500).id).toBe(elegirPlantilla('cuerpos', 0, 5500).id);
    semillas.forEach((s) => {
      const pl = elegirPlantilla('pitagoras', 2, s, 'escalera-pared');
      expect(pl.tema).toBe('pitagoras');
      expect(pl.id).not.toBe('escalera-pared');
      expect(elegirPlantilla('unidades', 1, s).anios).toContain(1);
    });
  });

  it('opciones de unidad: la correcta con otras de distinta dimensión o escala', () => {
    const r = () => crearAleatorio(1);
    expect([...opcionesDeUnidad('m²', undefined, r())].sort()).toEqual(['cm²', 'm', 'm²', 'm³']);
    expect([...opcionesDeUnidad('cm', undefined, r())].sort()).toEqual(['cm', 'cm²', 'cm³', 'm']);
    expect(opcionesDeUnidad('L', ['m³', 'm²', 'cm²'], r())).toContain('L');
    expect(opcionesDeUnidad('L', ['m³', 'm²', 'cm²'], r())).not.toContain('dm³'); // equivale a L: confundiría
  });
});

describe('Corrección', () => {
  const p = crearProblema(plantilla('cancha-vueltas'), 100); // respuesta entera, en m
  const { valor } = p.respuesta;

  it('número y unidad bien', () => {
    expect(corregir(p, String(valor), 'm').estado).toBe('ok');
  });

  it('número bien con unidad equivocada', () => {
    const c = corregir(p, String(valor), 'm²');
    expect(c.estado).toBe('unidad');
    expect(c.mensaje).toMatch(/unidad/);
  });

  it('unidad bien con número equivocado, y todo mal', () => {
    expect(corregir(p, String(valor + 10), 'm').estado).toBe('numero');
    expect(corregir(p, String(valor + 10), 'm²').estado).toBe('mal');
  });

  it('pide número válido y unidad antes de corregir; acepta coma decimal', () => {
    expect(corregir(p, '', 'm').estado).toBe('invalido');
    expect(corregir(p, 'abc', 'm').estado).toBe('invalido');
    expect(corregir(p, String(valor), null).estado).toBe('sin-unidad');
    const lona = crearProblema(plantilla('pileta-lona'), 100, ESCOLAR);
    const conComa = String(lona.respuesta.valor).replace('.', ',');
    expect(corregir(lona, conComa, 'm²').estado).toBe('ok');
  });

  it('un entero tiene que ser exacto y un decimal admite 1 %', () => {
    expect(p.tolerancia).toBe(0);
    expect(corregir(p, String(valor + 1), 'm').estado).toBe('numero');
    const lona = crearProblema(plantilla('pileta-lona'), 100, ESCOLAR);
    expect(corregir(lona, String(lona.respuesta.valor * 1.005), 'm²').estado).toBe('ok');
    expect(corregir(lona, String(lona.respuesta.valor * 1.05), 'm²').estado).toBe('numero');
  });
});

describe('Problemas (módulo)', () => {
  const abrir = () =>
    render(
      <AppProvider>
        <Problemas onVolver={() => {}} />
      </AppProvider>
    );

  // Lee de la pantalla qué problema es (plantilla + semilla) y lo recalcula con las funciones de datos
  const problemaActual = () => {
    const articulo = screen.getByRole('article');
    const semilla = Number(/Problema #(\d+)/.exec(articulo.textContent)[1]);
    return crearProblema(plantilla(articulo.dataset.plantilla), semilla, ESCOLAR);
  };
  const responder = async (user, texto, unidad) => {
    const campo = screen.getByLabelText('Tu respuesta');
    await user.clear(campo);
    await user.type(campo, texto);
    const grupo = within(screen.getByRole('group', { name: 'Unidad de tu respuesta' }));
    await user.click(grupo.getByRole('button', { name: unidad }));
    await user.click(screen.getByRole('button', { name: 'Comprobar' }));
  };
  const fijarSemillas = (...valores) => {
    const spy = vi.spyOn(Math, 'random');
    valores.forEach((v) => spy.mockReturnValueOnce(v));
    spy.mockReturnValue(0.5);
  };

  it('está registrado y se abre desde el menú', async () => {
    expect(COMPONENTES.problemas).toBeDefined();
    const user = userEvent.setup();
    render(
      <AppProvider>
        <App />
      </AppProvider>
    );
    await user.click(await screen.findByRole('button', { name: /Problemas/ }));
    expect(await screen.findByRole('article')).toBeInTheDocument();
  });

  it('muestra el enunciado del problema y su número', () => {
    fijarSemillas(0.5); // semilla 5500
    abrir();
    const p = problemaActual();
    expect(p.semilla).toBe(5500);
    expect(screen.getByText(p.enunciado)).toBeInTheDocument();
    expect(screen.getByText(/Problema #5500/)).toBeInTheDocument();
  });

  it('corrige número y unidad por separado', async () => {
    const user = userEvent.setup();
    abrir();
    const { respuesta } = problemaActual();
    const otraUnidad = problemaActual().opciones.find((u) => u !== respuesta.unidad);

    await user.click(screen.getByRole('button', { name: 'Comprobar' }));
    expect(screen.getByText(/Escribí un número/)).toBeInTheDocument();

    await user.type(screen.getByLabelText('Tu respuesta'), String(respuesta.valor));
    await user.click(screen.getByRole('button', { name: 'Comprobar' }));
    expect(screen.getByText(/Elegí la unidad/)).toBeInTheDocument();

    await responder(user, String(respuesta.valor), otraUnidad);
    expect(screen.getByText(/número está bien, pero revisá la unidad/)).toBeInTheDocument();

    await responder(user, String(respuesta.valor * 3), respuesta.unidad);
    expect(screen.getByText(/unidad está bien, pero el número no coincide/)).toBeInTheDocument();

    await responder(user, String(respuesta.valor), respuesta.unidad);
    expect(screen.getByText(/¡Correcto!/)).toBeInTheDocument();
    expect(screen.getByText(/Resueltos:/)).toHaveTextContent('Resueltos: 1');
    expect(screen.getByRole('button', { name: 'Comprobar' })).toBeDisabled();
  });

  it('las pistas aparecen de a una y la resolución se puede mostrar y ocultar', async () => {
    const user = userEvent.setup();
    abrir();
    const p = problemaActual();
    expect(screen.queryByText(p.pistas[0], { exact: false })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Ver una pista \(0\/2\)/ }));
    expect(screen.getByText(p.pistas[0], { exact: false })).toBeInTheDocument();
    expect(screen.queryByText(p.pistas[1], { exact: false })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Ver una pista \(1\/2\)/ }));
    expect(screen.getByText(p.pistas[1], { exact: false })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ver una pista \(2\/2\)/ })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: /Ver la resolución paso a paso/ }));
    const lista = within(screen.getByRole('list', { name: 'Resolución paso a paso' }));
    expect(lista.getAllByRole('listitem')).toHaveLength(p.pasos.length);
    p.pasos.forEach((paso) => expect(lista.getByText(paso.texto, { exact: false })).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: /Ocultar la resolución/ }));
    expect(screen.queryByRole('list', { name: 'Resolución paso a paso' })).not.toBeInTheDocument();
  });

  it('«Otro parecido» mantiene la plantilla con otros números y «Otro distinto» cambia de plantilla', async () => {
    fijarSemillas(0.5, 0.9, 0.2);
    const user = userEvent.setup();
    abrir();
    const antes = problemaActual();
    expect(antes.semilla).toBe(5500);

    await user.click(screen.getByRole('button', { name: /Otro parecido/ }));
    const parecido = problemaActual();
    expect(parecido.plantilla).toBe(antes.plantilla);
    expect(parecido.semilla).toBe(9100);
    expect(screen.getByLabelText('Tu respuesta')).toHaveValue('');

    await user.click(screen.getByRole('button', { name: /Otro distinto/ }));
    expect(problemaActual().plantilla).not.toBe(antes.plantilla);
  });

  it('el filtro por año y el tema cambian los problemas', async () => {
    const user = userEvent.setup();
    abrir();
    await user.click(screen.getByRole('button', { name: '1.º año' }));
    const temas = within(screen.getByRole('group', { name: 'Tema' }));
    expect(temas.queryByRole('button', { name: /Pitágoras/ })).not.toBeInTheDocument();
    expect(temas.getByRole('button', { name: /Unidades/ })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '2.º año' }));
    await user.click(within(screen.getByRole('group', { name: 'Tema' })).getByRole('button', { name: /Pitágoras/ }));
    expect(plantillasDe('pitagoras').map((p) => p.id)).toContain(screen.getByRole('article').dataset.plantilla);
  });

  it('con 3 problemas bien resueltos queda completado el módulo', async () => {
    fijarSemillas(0.1, 0.3, 0.7);
    const user = userEvent.setup();
    abrir();
    for (let i = 0; i < 3; i++) {
      const { respuesta } = problemaActual();
      await responder(user, String(respuesta.valor), respuesta.unidad);
      expect(screen.getByText(/¡Correcto!/)).toBeInTheDocument();
      if (i < 2) await user.click(screen.getByRole('button', { name: /Otro parecido/ }));
    }
    await waitFor(() => expect(JSON.parse(window.localStorage.getItem('geo:completados'))).toContain('problemas'));
  });

  it('con π exacto el enunciado indica usar la tecla π y se acepta ese resultado', async () => {
    window.localStorage.setItem('geo:piEscolar', 'false');
    const user = userEvent.setup();
    abrir();
    await user.click(screen.getByRole('button', { name: /Figuras planas/ }));
    // hasta encontrar un problema con π (hay 2 de 6 plantillas): se pide otro parecido a uno que lo use
    for (let i = 0; i < 40 && !/tecla π/.test(screen.getByRole('article').textContent); i++) {
      await user.click(screen.getByRole('button', { name: /Otro distinto/ }));
    }
    const articulo = screen.getByRole('article');
    expect(articulo.textContent).toMatch(/tecla π/);
    const p = crearProblema(plantilla(articulo.dataset.plantilla), Number(/Problema #(\d+)/.exec(articulo.textContent)[1]), EXACTO);
    await responder(user, String(p.respuesta.valor).replace('.', ','), p.respuesta.unidad);
    expect(screen.getByText(/¡Correcto!/)).toBeInTheDocument();
  });
});
