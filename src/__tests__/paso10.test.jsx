import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';

import { AppProvider } from '../context/AppContext.jsx';
import ArmaUnCubo from '../modules/ArmaUnCubo/ArmaUnCubo.jsx';
import {
  HEXAMINOS,
  VALIDOS,
  INVALIDOS,
  CRUZ,
  generarPoliominos,
  analizarPlegado,
  armarDesarrollo,
  elegirRonda,
  transformar,
} from '../data/cuboNets.js';
import { plegarVertices } from '../data/nets.js';

beforeEach(() => {
  window.scrollTo = vi.fn();
  window.localStorage.clear();
  window.location.hash = '';
});
afterEach(cleanup);

describe('Desarrollos del cubo (data/cuboNets.js)', () => {
  it('hay 35 hexaminós distintos y exactamente 11 arman un cubo', () => {
    expect(generarPoliominos(6)).toHaveLength(35);
    expect(HEXAMINOS).toHaveLength(35);
    expect(VALIDOS).toHaveLength(11);
    expect(INVALIDOS).toHaveLength(24);
  });

  it('los poliominós conocidos: 1, 1, 2, 5, 12, 35 figuras de 1 a 6 cuadrados', () => {
    expect([1, 2, 3, 4, 5, 6].map((n) => generarPoliominos(n).length)).toEqual([1, 1, 2, 5, 12, 35]);
  });

  it('las 11 válidas se reparten en las familias 1-4-1 (6), 2-3-1 (3), 2-2-2 (1) y 3-3 (1)', () => {
    const cuenta = {};
    VALIDOS.forEach((v) => (cuenta[v.familia] = (cuenta[v.familia] || 0) + 1));
    expect(cuenta).toEqual({ '1-4-1': 6, '2-3-1': 3, '2-2-2': 1, '3-3': 1 });
  });

  it('la cruz arma un cubo; una fila de 6 y un bloque de 2×2 no', () => {
    expect(CRUZ.valido).toBe(true);
    expect(analizarPlegado([[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0]]).valido).toBe(false);
    const bloque = analizarPlegado([[0, 0], [1, 0], [0, 1], [1, 1], [2, 0], [3, 0]]);
    expect(bloque.valido).toBe(false);
    expect(bloque.repetidas.length).toBeGreaterThan(0);
  });

  it('el resultado no depende de girar o espejar la figura', () => {
    HEXAMINOS.forEach((h) => {
      for (let k = 0; k < 8; k++) {
        expect(analizarPlegado(transformar(h.celdas, k)).valido).toBe(h.valido);
      }
    });
  });

  it('coincide con el plegado 3D real: caras distintas tras plegar = 6 − faltan', () => {
    HEXAMINOS.forEach((h) => {
      const fig = armarDesarrollo(h.celdas);
      const plegado = plegarVertices(fig.desarrollo, 1);
      const centros = Object.values(plegado).map((vs) => {
        const c = [0, 1, 2].map((i) => vs.reduce((s, v) => s + v[i], 0) / vs.length);
        return c.map((n) => n.toFixed(4)).join(',');
      });
      expect(new Set(centros).size).toBe(6 - fig.faltan);
      if (fig.valido) {
        // 6 caras distintas y 8 vértices en total
        const vertices = new Set(Object.values(plegado).flat().map((v) => v.map((n) => n.toFixed(4)).join(',')));
        expect(vertices.size).toBe(8);
      }
    });
  });

  it('una ronda tiene 6 figuras, mitad válidas, y es reproducible con la semilla', () => {
    const r1 = elegirRonda(1234, 6);
    const r2 = elegirRonda(1234, 6);
    expect(r1).toHaveLength(6);
    expect(r1.filter((f) => f.valido)).toHaveLength(3);
    expect(r1.map((f) => f.id)).toEqual(r2.map((f) => f.id));
    expect(r1.map((f) => f.celdas)).toEqual(r2.map((f) => f.celdas));
  });
});

describe('¿Arma un cubo? (módulo)', () => {
  it('recorre los pasos, juega las 6 rondas y guarda el progreso', async () => {
    const user = userEvent.setup();
    const semilla = 777;
    const ronda = elegirRonda(semilla, 6);
    render(
      <AppProvider>
        <ArmaUnCubo onVolver={() => {}} semilla={semilla} />
      </AppProvider>
    );

    // Paso 1: bloqueado hasta plegar la cruz
    expect(screen.getByRole('button', { name: /Siguiente/ })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Plegar solo' }));
    await user.click(screen.getByRole('button', { name: /Siguiente/ }));

    // Paso 2: bloqueado hasta terminar las 6 rondas
    expect(screen.getByRole('button', { name: 'Siguiente →' })).toBeDisabled();
    for (let i = 0; i < ronda.length; i++) {
      expect(screen.getByText(`Desarrollo ${i + 1} de 6`)).toBeInTheDocument();
      const boton = ronda[i].valido ? /Sí, arma un cubo/ : /No, no arma un cubo/;
      await user.click(screen.getByRole('button', { name: boton }));
      expect(screen.getByText(/¡Bien!/)).toBeInTheDocument();
      if (i < ronda.length - 1) await user.click(screen.getByRole('button', { name: /Siguiente desarrollo/ }));
    }
    expect(screen.getByText('Terminaste: 6 de 6')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Siguiente →' }));

    // Paso 3: las 11 figuras y la pregunta
    expect(screen.getAllByRole('img', { name: /Desarrollo del cubo, familia/ })).toHaveLength(11);
    await user.click(screen.getByRole('button', { name: '11' }));
    await user.click(screen.getByRole('button', { name: 'Siguiente →' }));

    // Paso 4
    await user.click(screen.getByRole('button', { name: /Terminar/ }));
    expect(JSON.parse(window.localStorage.getItem('geo:completados'))).toEqual(['arma-cubo']);
  });

  it('si se equivoca, explica qué cuadrados se superponen', async () => {
    const user = userEvent.setup();
    const semilla = 4321;
    const ronda = elegirRonda(semilla, 6);
    render(
      <AppProvider>
        <ArmaUnCubo onVolver={() => {}} semilla={semilla} />
      </AppProvider>
    );
    await user.click(screen.getByRole('button', { name: 'Plegar solo' }));
    await user.click(screen.getByRole('button', { name: /Siguiente/ }));

    // responder al revés a propósito
    const boton = ronda[0].valido ? /No, no arma un cubo/ : /Sí, arma un cubo/;
    await user.click(screen.getByRole('button', { name: boton }));
    expect(screen.getByText(/No era así/)).toBeInTheDocument();
    expect(
      screen.getByText(ronda[0].valido ? /Sí arma un cubo/ : /caen sobre la misma cara/)
    ).toBeInTheDocument();
  });
});
