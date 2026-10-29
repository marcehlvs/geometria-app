import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';

import { AppProvider } from '../context/AppContext.jsx';
import Cuadrilateros from '../modules/Cuadrilateros/Cuadrilateros.jsx';
import CirculoPoligonos from '../modules/CirculoPoligonos/CirculoPoligonos.jsx';

beforeEach(() => {
  window.scrollTo = vi.fn();
  window.localStorage.clear();
  window.location.hash = '';
});
afterEach(cleanup);

const montar = (Modulo) =>
  render(
    <AppProvider>
      <Modulo onVolver={() => {}} />
    </AppProvider>
  );

describe('Cuadriláteros', () => {
  it('el cuadrado hereda de rectángulo y rombo; el recorrido completo termina y guarda progreso', async () => {
    const user = userEvent.setup();
    montar(Cuadrilateros);

    // Paso 1: cuadrado elegido por defecto -> hereda de rectángulo y rombo
    expect(screen.getByText(/Además cumple todo lo de/)).toHaveTextContent(/Rectángulo/);
    expect(screen.getByText(/Además cumple todo lo de/)).toHaveTextContent(/Rombo/);
    expect(screen.getByRole('button', { name: /Siguiente/ })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Rombo' }));
    expect(screen.getByRole('button', { name: /Siguiente/ })).toBeEnabled();

    // Cambiar a trapecio: propiedades propias, y no hereda de nada salvo cuadrilátero
    await user.click(screen.getByRole('button', { name: 'Trapecio', pressed: false }));
    expect(screen.getByText(/al menos un par de lados paralelos/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Siguiente/ }));

    // Paso 2: tres acertijos
    for (const respuesta of ['Rectángulo', 'Rombo', 'Trapecio']) {
      await user.click(screen.getByRole('button', { name: respuesta }));
      const otro = screen.queryByRole('button', { name: /Siguiente acertijo/ });
      if (otro) await user.click(otro);
    }
    await user.click(screen.getByRole('button', { name: /Siguiente →/ }));

    // Paso 3: duda del cuadrado
    await user.click(screen.getByRole('button', { name: /Sí: el cuadrado cumple/ }));
    await user.click(screen.getByRole('button', { name: /Siguiente →/ }));

    // Paso 4
    await user.click(screen.getByRole('button', { name: /Terminar/ }));
    expect(JSON.parse(window.localStorage.getItem('geo:completados'))).toEqual(['cuadrilateros']);
  });
});

describe('Círculo y polígonos regulares', () => {
  it('con π = 3,14 el radio 5 da L = 31,4 y completa el módulo', async () => {
    const user = userEvent.setup();
    montar(CirculoPoligonos);

    // Radio inicial 5: L = 2 · 3,14 · 5 = 31,4 ; A = 3,14 · 25 = 78,5
    expect(screen.getAllByText(/31\{?,\}?4/).length + screen.getAllByText(/31,4/).length).toBeGreaterThan(0);
    expect(screen.getByText(/31,4 cm ÷ 10 cm/)).toHaveTextContent('3,14');

    await user.type(screen.getByRole('textbox'), '31,4');
    await user.click(screen.getByRole('button', { name: 'Comprobar' }));
    await user.click(screen.getByRole('button', { name: /Siguiente/ }));

    // Paso 2: hexágono por defecto -> 120° interior, 60° central, 9 diagonales
    expect(screen.getByText(/hexágono regular/i)).toBeInTheDocument();
    await user.type(screen.getByRole('textbox'), '20');
    await user.click(screen.getByRole('button', { name: 'Comprobar' }));
    await user.click(screen.getByRole('button', { name: /Siguiente/ }));

    // Paso 3
    await user.click(screen.getByRole('button', { name: 'Tantos como lados tiene el polígono' }));
    await user.click(screen.getByRole('button', { name: /Siguiente/ }));

    await user.click(screen.getByRole('button', { name: /Terminar/ }));
    expect(JSON.parse(window.localStorage.getItem('geo:completados'))).toEqual(['circulo']);
  });
});
