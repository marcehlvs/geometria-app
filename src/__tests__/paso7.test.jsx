import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';

import { AppProvider } from '../context/AppContext.jsx';
import Pitagoras from '../modules/Pitagoras/Pitagoras.jsx';

beforeEach(() => {
  window.scrollTo = vi.fn();
  window.localStorage.clear();
  window.location.hash = '';
});
afterEach(cleanup);

describe('Pitágoras', () => {
  it('muestra las áreas en vivo, resuelve los ejercicios y guarda el progreso', async () => {
    const user = userEvent.setup();
    render(
      <AppProvider>
        <Pitagoras onVolver={() => {}} />
      </AppProvider>
    );

    // Paso 1: 3-4-5 -> 9 + 16 = 25; bloqueado hasta mover un deslizador
    expect(screen.getByText(/c = 5 cm/)).toBeInTheDocument();
    expect(screen.getByText(/terna pitagórica/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Siguiente/ })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Aumentar Cateto a' }));
    // a = 4, b = 4 -> c² = 32, c ≈ 5,66
    expect(screen.getByText(/c = 5,66 cm/)).toBeInTheDocument();
    expect(screen.queryByText(/terna pitagórica/)).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Siguiente/ }));

    // Paso 2: hipotenusa de 6 y 8
    await user.type(screen.getByRole('textbox'), '10');
    await user.click(screen.getByRole('button', { name: 'Comprobar' }));
    await user.click(screen.getByRole('button', { name: /Siguiente/ }));

    // Paso 3: cateto con hipotenusa 13 y cateto 5
    await user.type(screen.getByRole('textbox'), '12');
    await user.click(screen.getByRole('button', { name: 'Comprobar' }));
    await user.click(screen.getByRole('button', { name: /Siguiente/ }));

    // Paso 4: una terna falsa no es rectángulo; luego el quiz
    await user.click(screen.getByRole('button', { name: '4 · 5 · 6' }));
    expect(screen.getByText(/No coinciden/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Sí: 7² + 24² = 25²' }));
    await user.click(screen.getByRole('button', { name: /Siguiente/ }));

    await user.click(screen.getByRole('button', { name: /Terminar/ }));
    expect(JSON.parse(window.localStorage.getItem('geo:completados'))).toEqual(['pitagoras']);
  });
});
