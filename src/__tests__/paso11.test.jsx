import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';

import { AppProvider } from '../context/AppContext.jsx';
import Euler from '../modules/Euler/Euler.jsx';
import { POLIEDROS, REGULARES, CONTRAEJEMPLO_EULER } from '../data/cuerpos.js';
import { IDS_DIBUJABLES } from '../utils/solidos3d.js';

beforeEach(() => {
  window.scrollTo = vi.fn();
  window.localStorage.clear();
  window.location.hash = '';
});
afterEach(cleanup);

const NOMBRES = {
  cubo: 'Cubo',
  'prisma-triangular': 'Prisma triangular',
  'piramide-cuadrada': 'Pirámide cuadrada',
  tetraedro: 'Tetraedro',
  'prisma-pentagonal': 'Prisma pentagonal',
};

describe('Datos de Euler', () => {
  it('todos los poliedros y los regulares cumplen C + V = A + 2', () => {
    POLIEDROS.forEach((p) => expect(p.C + p.V).toBe(p.A + 2));
    REGULARES.forEach((p) => expect(p.C + p.V).toBe(p.A + 2));
  });
  it('el marco con agujero da 0 y los cuerpos del módulo se pueden dibujar', () => {
    const m = CONTRAEJEMPLO_EULER;
    expect(m.C + m.V - m.A).toBe(0);
    Object.keys(NOMBRES).forEach((id) => expect(IDS_DIBUJABLES).toContain(id));
  });
});

describe('Fórmula de Euler (módulo)', () => {
  it('marca en rojo lo que está mal y no deja avanzar hasta completar la tabla', async () => {
    const user = userEvent.setup();
    render(
      <AppProvider>
        <Euler onVolver={() => {}} />
      </AppProvider>
    );
    expect(screen.getByRole('button', { name: /Siguiente/ })).toBeDisabled();

    await user.type(screen.getByLabelText('Caras de Cubo'), '7');
    await user.click(screen.getByRole('button', { name: 'Comprobar tabla' }));
    expect(screen.getByText(/Hay números que no coinciden/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Siguiente/ })).toBeDisabled();

    // corrige y sigue bloqueado: faltan las demás celdas
    await user.clear(screen.getByLabelText('Caras de Cubo'));
    await user.type(screen.getByLabelText('Caras de Cubo'), '6');
    await user.click(screen.getByRole('button', { name: 'Comprobar tabla' }));
    expect(screen.getByText(/Van 1 de 15 bien/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Siguiente/ })).toBeDisabled();
  });

  it('recorre los pasos completos y guarda el progreso', async () => {
    const user = userEvent.setup();
    render(
      <AppProvider>
        <Euler onVolver={() => {}} />
      </AppProvider>
    );

    // Paso 1: tabla completa (con coma o espacios no hace falta: son enteros)
    for (const [id, nombre] of Object.entries(NOMBRES)) {
      const d = POLIEDROS.find((p) => p.id === id);
      await user.type(screen.getByLabelText(`Caras de ${nombre}`), String(d.C));
      await user.type(screen.getByLabelText(`Vértices de ${nombre}`), String(d.V));
      await user.type(screen.getByLabelText(`Aristas de ${nombre}`), String(d.A));
    }
    await user.click(screen.getByRole('button', { name: 'Comprobar tabla' }));
    expect(screen.getByText(/Toda la tabla está bien/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Siguiente/ }));

    // Paso 2
    await user.click(screen.getByRole('button', { name: 'C + V = A + 2' }));
    await user.click(screen.getByRole('button', { name: /Siguiente/ }));

    // Paso 3: 7 + 10 − 2 = 15 aristas y el poliedro imposible
    expect(screen.getByRole('button', { name: /Siguiente/ })).toBeDisabled();
    await user.type(screen.getByRole('textbox'), '15');
    await user.click(screen.getByRole('button', { name: 'Comprobar' }));
    await user.click(screen.getByRole('button', { name: 'No, no puede existir' }));
    await user.click(screen.getByRole('button', { name: /Siguiente/ }));

    // Paso 4: regulares
    expect(screen.getByRole('rowheader', { name: 'Icosaedro' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '5' }));
    await user.click(screen.getByRole('button', { name: /Siguiente/ }));

    // Paso 5: agujero
    await user.click(screen.getByRole('button', { name: '0' }));
    await user.click(screen.getByRole('button', { name: /Siguiente/ }));

    await user.click(screen.getByRole('button', { name: /Terminar/ }));
    expect(JSON.parse(window.localStorage.getItem('geo:completados'))).toEqual(['euler']);
  });
});
