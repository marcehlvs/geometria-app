import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';

import { AppProvider } from '../context/AppContext.jsx';
import Cuerpos from '../modules/Cuerpos/Cuerpos.jsx';
import { POLIEDROS } from '../data/cuerpos.js';
import { construirPoliedro, IDS_DIBUJABLES } from '../utils/solidos3d.js';

beforeEach(() => {
  window.scrollTo = vi.fn();
  window.localStorage.clear();
  window.location.hash = '';
});
afterEach(cleanup);

describe('Poliedros generados en 3D', () => {
  it.each(IDS_DIBUJABLES)('%s: caras, vértices y aristas coinciden con data/cuerpos.js', (id) => {
    const datos = POLIEDROS.find((p) => p.id === id);
    const g = construirPoliedro(id);
    expect(g.caras.length).toBe(datos.C);
    expect(g.vertices.length).toBe(datos.V);
    expect(g.aristas.length).toBe(datos.A);
  });
});

describe('Cuerpos y sus elementos', () => {
  it('cuenta elementos, recorre los pasos y guarda el progreso', async () => {
    const user = userEvent.setup();
    render(
      <AppProvider>
        <Cuerpos onVolver={() => {}} />
      </AppProvider>
    );

    // Paso 1: bloqueado hasta ver 3 cuerpos
    expect(screen.getByRole('button', { name: /Siguiente/ })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Prisma hexagonal' }));
    await user.click(screen.getByRole('button', { name: 'Aristas' }));
    expect(screen.getByText(/18 aristas/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Cono' }));
    expect(screen.getByText(/cuerpo redondo/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Siguiente/ }));

    // Paso 2
    await user.type(screen.getByRole('textbox'), '15');
    await user.click(screen.getByRole('button', { name: 'Comprobar' }));
    await user.click(screen.getByRole('button', { name: /Siguiente/ }));

    // Paso 3: dos preguntas
    await user.click(screen.getByRole('button', { name: 'Cono' }));
    await user.click(screen.getByRole('button', { name: 'No, no tiene vértices' }));
    await user.click(screen.getByRole('button', { name: /Siguiente/ }));

    // Paso 4: tabla
    expect(screen.getByRole('rowheader', { name: 'Cubo' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Siguiente/ }));

    await user.click(screen.getByRole('button', { name: /Terminar/ }));
    expect(JSON.parse(window.localStorage.getItem('geo:completados'))).toEqual(['cuerpos']);
  });
});
