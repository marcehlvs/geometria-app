import { useApp } from '../context/AppContext.jsx';

// Botón de tema: Automático → Claro → Oscuro → Automático…
const SIGUIENTE = { auto: 'claro', claro: 'oscuro', oscuro: 'auto' };
const DATOS = {
  auto: { icono: '🌓', nombre: 'automático' },
  claro: { icono: '☀️', nombre: 'claro' },
  oscuro: { icono: '🌙', nombre: 'oscuro' },
};

export default function ThemeToggle() {
  const { tema, setTema } = useApp();
  const { icono, nombre } = DATOS[tema] ?? DATOS.auto;
  return (
    <button
      type="button"
      className="btn btn-ghost !min-w-11 !px-2 text-xl no-imprimir"
      onClick={() => setTema(SIGUIENTE[tema] ?? 'auto')}
      aria-label={`Tema ${nombre}. Tocá para cambiarlo`}
      title={`Tema ${nombre}`}
    >
      <span aria-hidden="true">{icono}</span>
    </button>
  );
}
