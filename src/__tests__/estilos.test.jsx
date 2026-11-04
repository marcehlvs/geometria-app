import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';

import App, { Menu } from '../App.jsx';
import { AppProvider, useApp } from '../context/AppContext.jsx';
import NumInput from '../components/NumInput.jsx';
import { Alert, Cargando, EmptyState, ErrorBoundary } from '../components/ui.jsx';

beforeEach(() => {
  window.scrollTo = vi.fn();
  window.localStorage.clear();
  window.location.hash = '';
  document.documentElement.removeAttribute('data-theme');
});
afterEach(cleanup);

describe('Tema claro / oscuro', () => {
  it('el botón recorre automático → claro → oscuro y lo recuerda', async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');

    await user.click(screen.getByRole('button', { name: /Tema automático/ }));
    expect(screen.getByRole('button', { name: /Tema claro/ })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Tema claro/ }));
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(JSON.parse(window.localStorage.getItem('geo:tema'))).toBe('oscuro');
  });

  it('arranca con el tema guardado', () => {
    window.localStorage.setItem('geo:tema', JSON.stringify('oscuro'));
    render(<App />);
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
  });
});

describe('Menú: confirmación, éxito y portada', () => {
  it('«Reiniciar progreso» pide confirmación en una ventana accesible', async () => {
    window.localStorage.setItem('geo:completados', JSON.stringify(['angulos']));
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Reiniciar progreso' }));
    const dialogo = screen.getByRole('dialog', { name: '¿Borrar tu progreso?' });
    expect(dialogo).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByRole('button', { name: 'Cancelar' })).toHaveFocus(); // foco en la opción segura

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem('geo:completados'))).toEqual(['angulos']);

    await user.click(screen.getByRole('button', { name: 'Reiniciar progreso' }));
    await user.click(screen.getByRole('button', { name: 'Sí, borrar' }));
    expect(JSON.parse(window.localStorage.getItem('geo:completados'))).toEqual([]);
  });

  it('el foco queda dentro de la ventana al apretar Tab', async () => {
    window.localStorage.setItem('geo:completados', JSON.stringify(['angulos']));
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Reiniciar progreso' }));
    await user.tab();
    expect(screen.getByRole('button', { name: 'Sí, borrar' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toHaveFocus(); // vuelve al principio
  });

  it('al completar un módulo aparece el aviso de éxito y se puede cerrar', async () => {
    function Completar() {
      const { marcarCompletado } = useApp();
      return <button type="button" onClick={() => marcarCompletado('angulos')}>terminar</button>;
    }
    const user = userEvent.setup();
    render(
      <AppProvider>
        <Completar />
        <Menu abrir={() => {}} />
      </AppProvider>
    );
    expect(screen.queryByText('¡Módulo completado!')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'terminar' }));
    expect(screen.getByText('¡Módulo completado!')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Cerrar aviso' }));
    expect(screen.queryByText('¡Módulo completado!')).not.toBeInTheDocument();
  });

  it('la portada ofrece una sola acción principal: empezar o continuar', async () => {
    const abrir = vi.fn();
    const user = userEvent.setup();
    render(<AppProvider><Menu abrir={abrir} /></AppProvider>);
    await user.click(screen.getByRole('button', { name: /Empezar: Ángulos/ }));
    expect(abrir).toHaveBeenCalledWith('angulos');
  });

  it('con todo completado, la portada lo celebra en lugar de ofrecer «continuar»', () => {
    // todos los módulos disponibles del menú
    window.localStorage.setItem(
      'geo:completados',
      JSON.stringify(['angulos', 'triangulos', 'cuadrilateros', 'circulo', 'perimetro-area', 'pitagoras', 'cuerpos', 'desarrollo', 'arma-cubo', 'euler', 'areas-volumenes', 'formulario', 'problemas', 'evaluacion'])
    );
    render(<AppProvider><Menu abrir={() => {}} /></AppProvider>);
    expect(screen.getByText('¡Terminaste todos los módulos!')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Continuar:/ })).not.toBeInTheDocument();
  });
});

describe('Estados: vacío, error, carga', () => {
  it('Formulario sin resultados muestra el estado vacío y permite borrar la búsqueda', async () => {
    window.location.hash = 'formulario';
    const user = userEvent.setup();
    render(<App />);
    const buscador = await screen.findByRole('searchbox');
    await user.type(buscador, 'zzzzqq');
    expect(screen.getByText('Sin resultados')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Borrar búsqueda' }));
    expect(screen.queryByText('Sin resultados')).not.toBeInTheDocument();
  });

  it('NumInput marca el campo como inválido y anuncia el error', async () => {
    const user = userEvent.setup();
    render(<NumInput etiqueta="Área" correcto={24} />);
    const campo = screen.getByLabelText('Área');
    expect(campo).not.toHaveAttribute('aria-invalid');
    await user.type(campo, '5');
    await user.click(screen.getByRole('button', { name: 'Comprobar' }));
    expect(campo).toHaveAttribute('aria-invalid', 'true');
    expect(campo).toHaveAccessibleDescription(/No coincide/);
  });

  it('dos NumInput en la misma pantalla no repiten ids', () => {
    render(<><NumInput etiqueta="A" correcto={1} /><NumInput etiqueta="B" correcto={2} /></>);
    expect(screen.getByLabelText('A').id).not.toBe(screen.getByLabelText('B').id);
  });

  it('si un módulo falla, se ve un error claro con salida', async () => {
    const silencio = vi.spyOn(console, 'error').mockImplementation(() => {});
    const Roto = () => { throw new Error('sin conexión'); };
    const volver = vi.fn();
    const user = userEvent.setup();
    render(<ErrorBoundary resetKey="x" onVolver={volver}><Roto /></ErrorBoundary>);
    expect(screen.getByRole('alert')).toHaveTextContent('No se pudo cargar esta pantalla');
    await user.click(screen.getByRole('button', { name: 'Volver al menú' }));
    expect(volver).toHaveBeenCalled();
    silencio.mockRestore();
  });

  it('la carga se anuncia como estado y los avisos usan el rol correcto', () => {
    render(<><Cargando /><Alert tono="bad" titulo="Error" /><Alert tono="ok" titulo="Listo" /><EmptyState titulo="Nada" /></>);
    expect(screen.getByText('Cargando…')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Error');
    expect(screen.getAllByRole('status').length).toBeGreaterThanOrEqual(2);
  });
});
