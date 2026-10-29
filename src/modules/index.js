import { lazy } from 'react';

// Registro de módulos: id -> componente.
// `lazy` hace que cada módulo se descargue solo cuando se abre (la app carga más
// rápido en el celular). Cada paso nuevo agrega una línea acá.
export const COMPONENTES = {
  demo: lazy(() => import('./Demo/Demo.jsx')),
};
