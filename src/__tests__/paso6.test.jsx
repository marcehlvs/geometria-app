import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';

import { AppProvider } from '../context/AppContext.jsx';
import PerimetroArea from '../modules/PerimetroArea/PerimetroArea.jsx';

beforeEach(() => {
  window.scrollTo = vi.fn();
  window.localStorage.clear();
  window.location.hash = '';
});
afterEach(cleanup);

const montar = () =>
  render(
    <AppProvider>
      <PerimetroArea onVolver={() => {}} />
    </AppProvider>
  );

describe('Perímetro y área', () => {
  it('muestra el cálculo de cada figura y cambia con los deslizadores', async () => {
    const user = userEvent.setup();
    const { container } = montar();
    // KaTeX usa espacios duros: se comparan sin espacios
    const txt = () => container.textContent.replace(/\s/g, '');

    // Rectángulo 8 × 5: P = 26 cm, A = 40 cm²
    expect(txt()).toContain('P=26cm');
    expect(txt()).toContain('A=40cm2');

    await user.click(screen.getByLabelText('Aumentar Base')); // base 9
    expect(txt()).toContain('P=28cm');
    expect(txt()).toContain('A=45cm2');

    // Rombo 10 y 6: A = 30 cm²
    await user.click(screen.getByRole('button', { name: 'Rombo' }));
    expect(txt()).toContain('A=30cm2');

    // Círculo con π = 3,14 y r = 4: L = 25,12 ; A = 50,24
    await user.click(screen.getByRole('button', { name: 'Círculo' }));
    expect(txt()).toContain('L=25,12cm');
    expect(txt()).toContain('A=50,24cm2');
  });

  it('el trapecio nunca deja la base menor ≥ base mayor', async () => {
    const user = userEvent.setup();
    montar();
    await user.click(screen.getByRole('button', { name: 'Trapecio' }));
    // Bajar la base mayor hasta 3 (mínimo): la base menor se limita a 2
    for (let i = 0; i < 8; i++) await user.click(screen.getByLabelText('Disminuir Base mayor'));
    expect(screen.getByLabelText('Aumentar Base menor')).toBeDisabled();
  });

  it('recorre los pasos y guarda el progreso', async () => {
    const user = userEvent.setup();
    montar();

    await user.type(screen.getByRole('textbox'), '12');
    await user.click(screen.getByRole('button', { name: 'Comprobar' }));
    await user.click(screen.getByRole('button', { name: /Siguiente/ }));

    // Paso 2: animación al 100 % y quiz (la altura, no el lado inclinado)
    for (let i = 0; i < 20; i++) await user.click(screen.getByLabelText('Aumentar Mover el trozo'));
    expect(screen.getByText(/Se formó un/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '40 cm²' }));
    await user.click(screen.getByRole('button', { name: /Siguiente/ }));

    // Paso 3: elegir 6 × 4 en las pestañas y también en el quiz (el que no tiene aria-pressed)
    const grupo = screen.getByRole('group', { name: 'Elegí un rectángulo' });
    await user.click(within(grupo).getByRole('button', { name: '6 × 4' }));
    expect(screen.getAllByText(/20 cm/).length).toBeGreaterThan(0);
    const opcionQuiz = screen.getAllByRole('button', { name: '6 × 4' }).find((b) => !b.hasAttribute('aria-pressed'));
    await user.click(opcionQuiz);
    await user.click(screen.getByRole('button', { name: /Siguiente/ }));

    await user.click(screen.getByRole('button', { name: /Terminar/ }));
    expect(JSON.parse(window.localStorage.getItem('geo:completados'))).toEqual(['perimetro-area']);
  });
});
