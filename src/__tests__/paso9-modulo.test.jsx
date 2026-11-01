import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';

import { AppProvider } from '../context/AppContext.jsx';
import App from '../App.jsx';
import { COMPONENTES } from '../modules/index.js';
import DesarrolloPlano from '../modules/DesarrolloPlano/DesarrolloPlano.jsx';

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

  it('el botón «Mostrar medidas» rotula y oculta los lados del desarrollo', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <AppProvider>
        <DesarrolloPlano onVolver={() => {}} />
      </AppProvider>
    );
    // los rótulos son <text data-medida> dentro del dibujo (el «3 cm» del deslizador no cuenta)
    const rotulos = () => [...container.querySelectorAll('[data-medida]')].map((n) => n.textContent);
    const boton = screen.getByRole('button', { name: 'Mostrar medidas' });
    expect(boton).toHaveAttribute('aria-pressed', 'false');
    expect(rotulos()).toHaveLength(0);

    await user.click(boton);
    expect(boton).toHaveAttribute('aria-pressed', 'true');
    // cubo de arista 3 cm: una cara lateral y una base rotuladas
    expect(rotulos()).toEqual(['3 cm', '3 cm']);

    await user.click(boton);
    expect(rotulos()).toHaveLength(0);
  });

  it('recorre el módulo completo, bloquea cada paso hasta resolverlo y guarda el progreso', async () => {
    const user = userEvent.setup();
    const onVolver = vi.fn();
    render(
      <AppProvider>
        <DesarrolloPlano onVolver={onVolver} />
      </AppProvider>
    );
    const siguiente = () => screen.getByRole('button', { name: /Siguiente/ });

    // Paso 1: bloqueado hasta plegar el cuerpo del todo
    expect(siguiente()).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Plegar' }));
    expect(siguiente()).toBeEnabled();
    await user.click(siguiente());

    // Paso 2: área total del cubo de arista 3 cm = 54 cm²
    expect(siguiente()).toBeDisabled();
    await user.type(screen.getByRole('textbox'), '54');
    await user.click(screen.getByRole('button', { name: 'Comprobar' }));
    await user.click(siguiente());

    // Paso 3: largo del rectángulo lateral con r = 2 cm (2 · π · 2)
    expect(siguiente()).toBeDisabled();
    await user.type(screen.getByRole('textbox'), '12,56');
    await user.click(screen.getByRole('button', { name: 'Comprobar' }));
    await user.click(siguiente());

    // Paso 4: desarrollo de la pirámide cuadrada
    expect(siguiente()).toBeDisabled();
    await user.click(screen.getByRole('button', { name: '1 cuadrado y 4 triángulos' }));
    await user.click(siguiente());

    // Paso 5: cierre
    await user.click(screen.getByRole('button', { name: /Terminar/ }));
    expect(JSON.parse(window.localStorage.getItem('geo:completados'))).toEqual(['desarrollo']);
    expect(onVolver).toHaveBeenCalled();
  });
});
