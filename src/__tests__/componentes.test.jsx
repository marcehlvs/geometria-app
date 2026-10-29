import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';

import Formula from '../components/Formula.jsx';
import Quiz from '../components/Quiz.jsx';
import NumInput from '../components/NumInput.jsx';
import Slider from '../components/Slider.jsx';
import StepNav from '../components/StepNav.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import App from '../App.jsx';

beforeEach(() => {
  window.scrollTo = vi.fn(); // jsdom no implementa scrollTo
  window.localStorage.clear();
  window.location.hash = '';
});
afterEach(cleanup);

describe('Formula', () => {
  it('renderiza LaTeX con KaTeX', () => {
    const { container } = render(<Formula tex={'A = \\pi \\cdot r^2'} />);
    expect(container.querySelector('.katex')).toBeInTheDocument();
  });
  it('en modo bloque usa displayMode', () => {
    const { container } = render(<Formula block tex={'a^2 + b^2 = c^2'} />);
    expect(container.querySelector('.katex-display')).toBeInTheDocument();
  });
});

describe('ProgressBar', () => {
  it('muestra el avance', () => {
    render(<ProgressBar valor={3} max={10} etiqueta="Avance" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '3');
    expect(screen.getByText('3/10')).toBeInTheDocument();
  });
});

describe('Slider', () => {
  it('+ y − cambian el valor respetando los límites', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(<Slider etiqueta="Radio" valor={5} onChange={onChange} min={1} max={10} paso={0.5} decimales={1} unidad="cm" />);
    expect(screen.getByText('5 cm')).toBeInTheDocument();
    await user.click(screen.getByLabelText('Aumentar Radio'));
    expect(onChange).toHaveBeenLastCalledWith(5.5);
    await user.click(screen.getByLabelText('Disminuir Radio'));
    expect(onChange).toHaveBeenLastCalledWith(4.5);

    rerender(<Slider etiqueta="Radio" valor={10} onChange={onChange} min={1} max={10} paso={0.5} />);
    expect(screen.getByLabelText('Aumentar Radio')).toBeDisabled();
  });
  it('no acumula errores de coma flotante', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Slider etiqueta="X" valor={0.1} onChange={onChange} min={0} max={1} paso={0.2} decimales={1} />);
    await user.click(screen.getByLabelText('Aumentar X'));
    expect(onChange).toHaveBeenLastCalledWith(0.3);
  });
});

describe('Quiz', () => {
  it('tacha el error, deja probar y explica al acertar', async () => {
    const user = userEvent.setup();
    const onResolver = vi.fn();
    render(<Quiz pregunta="¿Ejes?" opciones={['2', '4', '8']} correcta={1} explicacion="Son cuatro." onResolver={onResolver} />);
    await user.click(screen.getByRole('button', { name: '2' }));
    expect(screen.getByText(/Esa no es/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2' })).toBeDisabled();
    expect(onResolver).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: '4' }));
    expect(screen.getByText(/¡Correcto!/)).toBeInTheDocument();
    expect(screen.getByText(/Son cuatro/)).toBeInTheDocument();
    expect(onResolver).toHaveBeenCalledWith({ intentos: 2 });
  });
  it('con barajar mantiene cuál es la correcta', async () => {
    const user = userEvent.setup();
    const onResolver = vi.fn();
    render(<Quiz pregunta="?" opciones={['a', 'b', 'c', 'd']} correcta={2} barajar onResolver={onResolver} />);
    await user.click(screen.getByRole('button', { name: 'c' }));
    expect(onResolver).toHaveBeenCalledWith({ intentos: 1 });
  });
});

describe('NumInput', () => {
  it('acepta coma decimal y valida con tolerancia', async () => {
    const user = userEvent.setup();
    const onResultado = vi.fn();
    render(<NumInput etiqueta="Longitud" correcto={31.4} unidad="cm" onResultado={onResultado} />);
    await user.type(screen.getByLabelText('Longitud'), '31,4');
    await user.click(screen.getByRole('button', { name: 'Comprobar' }));
    expect(screen.getByText(/¡Correcto!/)).toBeInTheDocument();
    expect(onResultado).toHaveBeenCalledWith({ correcto: true, intentos: 1, revelado: false });
  });
  it('rechaza texto que no es número', async () => {
    const user = userEvent.setup();
    render(<NumInput etiqueta="X" correcto={5} />);
    await user.type(screen.getByLabelText('X'), 'abc');
    await user.click(screen.getByRole('button', { name: 'Comprobar' }));
    expect(screen.getByText(/solo un número/)).toBeInTheDocument();
  });
  it('tras 2 errores permite ver el resultado', async () => {
    const user = userEvent.setup();
    const onResultado = vi.fn();
    render(<NumInput etiqueta="X" correcto={24} unidad="cm²" pista="Base por altura." onResultado={onResultado} />);
    const campo = screen.getByLabelText('X');
    await user.type(campo, '10');
    await user.click(screen.getByRole('button', { name: 'Comprobar' }));
    expect(screen.getByText(/Pista: Base por altura/)).toBeInTheDocument();
    expect(screen.queryByText('Ver resultado')).not.toBeInTheDocument();
    await user.clear(campo);
    await user.type(campo, '11');
    await user.click(screen.getByRole('button', { name: 'Comprobar' }));
    await user.click(screen.getByText('Ver resultado'));
    expect(screen.getByText(/El resultado era/)).toBeInTheDocument();
    expect(onResultado).toHaveBeenLastCalledWith({ correcto: false, intentos: 2, revelado: true });
  });
});

describe('StepNav', () => {
  const armar = (bloqueado) => [
    { titulo: 'Uno', contenido: <p>Contenido uno</p>, bloqueado },
    { titulo: 'Dos', contenido: <p>Contenido dos</p> },
  ];
  it('bloquea «Siguiente» hasta resolver y termina en el último paso', async () => {
    const user = userEvent.setup();
    const onFinish = vi.fn();
    const { rerender } = render(<StepNav pasos={armar(true)} onFinish={onFinish} />);
    expect(screen.getByText('Paso 1 de 2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Siguiente/ })).toBeDisabled();
    expect(screen.getByText(/Resolvé la actividad/)).toBeInTheDocument();

    rerender(<StepNav pasos={armar(false)} onFinish={onFinish} />);
    await user.click(screen.getByRole('button', { name: /Siguiente/ }));
    expect(screen.getByText('Contenido dos')).toBeInTheDocument();
    expect(screen.getByText('Paso 2 de 2')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Anterior/ }));
    expect(screen.getByText('Contenido uno')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Siguiente/ }));
    await user.click(screen.getByRole('button', { name: /Terminar/ }));
    expect(onFinish).toHaveBeenCalledTimes(1);
  });
  it('no deja saltar a pasos no visitados desde los puntitos', () => {
    render(<StepNav pasos={armar(false)} onFinish={() => {}} />);
    expect(screen.getByLabelText(/Ir al paso 2/)).toBeDisabled();
  });
});

describe('App (menú y navegación)', () => {
  it('muestra el menú con módulos disponibles y próximos', () => {
    render(<App />);
    expect(screen.getByText(/Geometría en acción/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Prueba de componentes/ })).toBeEnabled();
    const triangulos = screen.getByText('Triángulos', { selector: 'span' }).closest('button');
    expect(triangulos).toBeEnabled();
    const pitagoras = screen.getByRole('button', { name: /Pitágoras/ });
    expect(pitagoras).toBeDisabled();
    expect(within(pitagoras).getByText('Próximamente')).toBeInTheDocument();
  });

  it('el filtro por año oculta lo que no corresponde', async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(screen.getByText('Teorema de Pitágoras')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '1.º año' }));
    expect(screen.queryByText('Teorema de Pitágoras')).not.toBeInTheDocument();
    expect(screen.getByText('¿Arma un cubo?')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '2.º año' }));
    expect(screen.queryByText('¿Arma un cubo?')).not.toBeInTheDocument();
    expect(screen.getByText('Teorema de Pitágoras')).toBeInTheDocument();
  });

  it('recorre el módulo de prueba completo y vuelve al menú con ✓', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: /Prueba de componentes/ }));
    expect(await screen.findByText('Paso 1 de 4')).toBeInTheDocument();

    // Paso 1: la fórmula usa π = 3,14 por defecto
    expect(screen.getByLabelText('Aumentar Radio')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Siguiente/ }));

    // Paso 2: quiz
    expect(screen.getByRole('button', { name: /Siguiente/ })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: '2' }));
    await user.click(screen.getByRole('button', { name: '4' }));
    await user.click(screen.getByRole('button', { name: /Siguiente/ }));

    // Paso 3: número
    expect(screen.getByRole('button', { name: /Siguiente/ })).toBeDisabled();
    await user.type(screen.getByRole('textbox'), '24');
    await user.click(screen.getByRole('button', { name: 'Comprobar' }));
    await user.click(screen.getByRole('button', { name: /Siguiente/ }));

    // Paso 4: terminar
    expect(screen.getByText('¡Todo funciona!', { selector: 'h2' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Terminar/ }));

    expect(await screen.findByRole('heading', { name: /Figuras planas/ })).toBeInTheDocument();
    expect(screen.getByLabelText('completado')).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem('geo:completados'))).toEqual(['demo']);
  });

  it('recuerda el año elegido', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);
    await user.click(screen.getByRole('button', { name: '2.º año' }));
    unmount();
    render(<App />);
    expect(screen.getByRole('button', { name: '2.º año' })).toHaveAttribute('aria-pressed', 'true');
  });
});
