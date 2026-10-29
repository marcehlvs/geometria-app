import { createContext, useCallback, useContext, useMemo } from 'react';
import useLocalStorage from '../hooks/useLocalStorage.js';
import { PI_ESCOLAR } from '../utils/geometry.js';

// Estado global de la app (lo que comparten todos los módulos):
//  - anio: 0 = todos, 1 = primer año, 2 = segundo año
//  - piEscolar: true -> π = 3,14 | false -> π exacto (Math.PI)
//  - completados: ids de los módulos terminados
// Se guarda en el navegador para que el progreso no se pierda.

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [anio, setAnio] = useLocalStorage('geo:anio', 0);
  const [piEscolar, setPiEscolar] = useLocalStorage('geo:piEscolar', true);
  const [completados, setCompletados] = useLocalStorage('geo:completados', []);

  const marcarCompletado = useCallback(
    (id) => setCompletados((previos) => (previos.includes(id) ? previos : [...previos, id])),
    [setCompletados]
  );
  const reiniciarProgreso = useCallback(() => setCompletados([]), [setCompletados]);

  const pi = piEscolar ? PI_ESCOLAR : Math.PI;

  const valor = useMemo(
    () => ({ anio, setAnio, piEscolar, setPiEscolar, pi, completados, marcarCompletado, reiniciarProgreso }),
    [anio, setAnio, piEscolar, setPiEscolar, pi, completados, marcarCompletado, reiniciarProgreso]
  );

  return <AppContext.Provider value={valor}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp debe usarse dentro de <AppProvider>');
  return ctx;
}
