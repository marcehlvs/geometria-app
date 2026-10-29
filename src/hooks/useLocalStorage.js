import { useState, useEffect } from 'react';

// Como useState, pero guarda el valor en el navegador (localStorage).
// Todo va dentro de try/catch: si el navegador no deja guardar (modo privado,
// vistas previas sandbox), la app sigue funcionando, solo que sin recordar.

function leer(clave, inicial) {
  try {
    const crudo = window.localStorage.getItem(clave);
    return crudo === null ? inicial : JSON.parse(crudo);
  } catch {
    return inicial;
  }
}

export default function useLocalStorage(clave, inicial) {
  const [valor, setValor] = useState(() => leer(clave, inicial));

  useEffect(() => {
    try {
      window.localStorage.setItem(clave, JSON.stringify(valor));
    } catch {
      /* sin almacenamiento: seguimos igual */
    }
  }, [clave, valor]);

  return [valor, setValor];
}
