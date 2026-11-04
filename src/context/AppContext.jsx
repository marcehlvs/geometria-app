import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import useLocalStorage from '../hooks/useLocalStorage.js';
import { PI_ESCOLAR } from '../utils/geometry.js';

// Estado global de la app (lo que comparten todos los módulos):
//  - anio: 0 = todos, 1 = primer año, 2 = segundo año
//  - piEscolar: true -> π = 3,14 | false -> π exacto (Math.PI)
//  - completados: ids de los módulos terminados
//  - tema: 'auto' (sigue al sistema) | 'claro' | 'oscuro'
//  - ultimoCompletado: módulo que se acaba de terminar (solo para el aviso del menú; no se guarda)
// Se guarda en el navegador para que el progreso no se pierda.

const AppContext = createContext(null);

const consultaOscuro = () => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null);

function aplicarTema(tema) {
  const oscuro = tema === 'oscuro' || (tema === 'auto' && Boolean(consultaOscuro()?.matches));
  document.documentElement.setAttribute('data-theme', oscuro ? 'dark' : 'light');
}

export function AppProvider({ children }) {
  const [anio, setAnio] = useLocalStorage('geo:anio', 0);
  const [piEscolar, setPiEscolar] = useLocalStorage('geo:piEscolar', true);
  const [completados, setCompletados] = useLocalStorage('geo:completados', []);
  const [tema, setTema] = useLocalStorage('geo:tema', 'auto');
  const [ultimoCompletado, setUltimoCompletado] = useState(null);

  const completadosRef = useRef(completados);
  completadosRef.current = completados;

  const marcarCompletado = useCallback(
    (id) => {
      // el aviso del menú solo aparece la primera vez que se completa un módulo
      if (!completadosRef.current.includes(id)) setUltimoCompletado(id);
      setCompletados((previos) => (previos.includes(id) ? previos : [...previos, id]));
    },
    [setCompletados]
  );
  const reiniciarProgreso = useCallback(() => {
    setCompletados([]);
    setUltimoCompletado(null);
  }, [setCompletados]);

  // El tema se aplica en <html data-theme>. En «auto» acompaña los cambios del sistema.
  useEffect(() => {
    aplicarTema(tema);
    const mq = consultaOscuro();
    if (tema !== 'auto' || !mq?.addEventListener) return undefined;
    const alCambiar = () => aplicarTema('auto');
    mq.addEventListener('change', alCambiar);
    return () => mq.removeEventListener('change', alCambiar);
  }, [tema]);

  // Al imprimir siempre sale en claro (ahorra tinta y se lee bien en papel)
  useEffect(() => {
    const antes = () => document.documentElement.setAttribute('data-theme', 'light');
    const despues = () => aplicarTema(tema);
    window.addEventListener('beforeprint', antes);
    window.addEventListener('afterprint', despues);
    return () => {
      window.removeEventListener('beforeprint', antes);
      window.removeEventListener('afterprint', despues);
    };
  }, [tema]);

  const pi = piEscolar ? PI_ESCOLAR : Math.PI;

  const valor = useMemo(
    () => ({
      anio, setAnio, piEscolar, setPiEscolar, pi, completados, marcarCompletado, reiniciarProgreso,
      tema, setTema, ultimoCompletado, limpiarAviso: () => setUltimoCompletado(null),
    }),
    [anio, setAnio, piEscolar, setPiEscolar, pi, completados, marcarCompletado, reiniciarProgreso, tema, setTema, ultimoCompletado]
  );

  return <AppContext.Provider value={valor}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp debe usarse dentro de <AppProvider>');
  return ctx;
}
