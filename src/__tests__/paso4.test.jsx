import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';

import { AppProvider } from '../context/AppContext.jsx';
import Angulos from '../modules/Angulos/Angulos.jsx';
import Triangulos from '../modules/Triangulos/Triangulos.jsx';
import App from '../App.jsx';

beforeEach(() => {
  window.scrollTo = vi.fn();
  window.localStorage.clear();
  window.location.hash = '';
});
afterEach(cleanup);

describe('Módulo Ángulos', () => {
  it('renderiza transportador y clasifica ángulos en vivo', async () => {
    const user = userEvent.setup();
    const onVolver = vi.fn();

    render(
      <AppProvider>
        <Angulos onVolver={onVolver} />
      </AppProvider>
    );

    // Debe mostrar el título del módulo y el paso 1
    expect(screen.getByRole('heading', { level: 1, name: /Ángulos/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /1\. Transportador y clasificación/i })).toBeInTheDocument();

    // Ángulo agudo inicial (60°)
    expect(screen.getByText(/Ángulo agudo/i)).toBeInTheDocument();

    // Aumentar ángulo hasta recto (90°)
    const aumentarBtn = screen.getByLabelText('Aumentar Abertura del ángulo');
    for (let i = 0; i < 6; i++) {
      await user.click(aumentarBtn);
    }
    expect(screen.getByText(/Ángulo recto \(90°\)/i)).toBeInTheDocument();

    // Resolver el quiz para desbloquear paso 2
    await user.click(screen.getByRole('button', { name: 'Recto' }));
    expect(screen.getByText(/¡Correcto!/i)).toBeInTheDocument();

    // Siguiente paso
    const siguienteBtn = screen.getByRole('button', { name: /Siguiente/i });
    expect(siguienteBtn).not.toBeDisabled();
    await user.click(siguienteBtn);

    // Paso 2: Complementarios y suplementarios
    expect(screen.getByRole('heading', { level: 2, name: /2\. Complementarios y suplementarios/i })).toBeInTheDocument();
  });
});

describe('Módulo Triángulos', () => {
  it('renderiza triángulo interactivo, clasifica y permite avanzar', async () => {
    const user = userEvent.setup();
    const onVolver = vi.fn();

    render(
      <AppProvider>
        <Triangulos onVolver={onVolver} />
      </AppProvider>
    );

    // Debe mostrar título y paso 1
    expect(screen.getByRole('heading', { level: 1, name: /Triángulos/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /1\. Arrastrá los vértices/i })).toBeInTheDocument();

    // Clasificación inicial presente
    expect(screen.getByText(/Por sus lados/i)).toBeInTheDocument();
    expect(screen.getByText(/Por sus ángulos/i)).toBeInTheDocument();

    // Probar preset rectángulo
    await user.click(screen.getByRole('button', { name: 'Rectángulo' }));
    expect(screen.getByText('rectángulo', { selector: 'p' })).toBeInTheDocument();

    // Resolver quiz
    await user.click(screen.getByRole('button', { name: /No, porque en un equilátero los 3 ángulos siempre son de 60°/i }));
    expect(screen.getByText(/¡Correcto!/i)).toBeInTheDocument();

    // Siguiente paso
    const siguienteBtn = screen.getByRole('button', { name: /Siguiente/i });
    expect(siguienteBtn).not.toBeDisabled();
    await user.click(siguienteBtn);

    // Paso 2: Suma de ángulos interiores = 180°
    expect(screen.getByRole('heading', { level: 2, name: /2\. Suma de ángulos interiores = 180°/i })).toBeInTheDocument();
  });

  it('aparecen ambos módulos en el menú principal y se pueden abrir', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Verificamos que los botones de Ángulos y Triángulos no estén deshabilitados
    const btnAngulos = screen.getByText('Ángulos', { selector: 'span' }).closest('button');
    const btnTriangulos = screen.getByText('Triángulos', { selector: 'span' }).closest('button');

    expect(btnAngulos).not.toBeDisabled();
    expect(btnTriangulos).not.toBeDisabled();

    // Abrir Ángulos
    await user.click(btnAngulos);
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: /Ángulos/i })).toBeInTheDocument();
    });

    // Volver al menú
    await user.click(screen.getByRole('button', { name: /← Menú/i }));
    await waitFor(() => {
      expect(screen.getByText(/Geometría en acción/i)).toBeInTheDocument();
    });
  });
});
