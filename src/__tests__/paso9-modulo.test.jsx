import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';

import { AppProvider } from '../context/AppContext.jsx';
import App from '../App.jsx';
import { COMPONENTES } from '../modules/index.js';

beforeEach(() => {
  window.scrollTo = vi.fn();
  window.localStorage.clear();
  window.location.hash = '';
});
afterEach(cleanup);

describe('Desarrollo plano interactivo (registro en el menú)', () => {
  it('está registrado en modules/index.js', () => {
    expect(COMPONENTES.desarrollo).toBeDefined();
  });

  it('se abre desde el menú y muestra la galería de cuerpos', async () => {
    const user = userEvent.setup();
    render(
      <AppProvider>
        <App />
      </AppProvider>
    );

    await user.click(await screen.findByRole('button', { name: /Desarrollo plano interactivo/ }));

    expect(await screen.findByText('Plegá el desarrollo')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cubo' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cono' })).toBeInTheDocument();
  });
});
