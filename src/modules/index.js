import { lazy } from 'react';

// Registro de módulos: id -> componente.
// `lazy` hace que cada módulo se descargue solo cuando se abre (la app carga más
// rápido en el celular). Cada paso nuevo agrega una línea acá.
export const COMPONENTES = {
  demo: lazy(() => import('./Demo/Demo.jsx')),
  angulos: lazy(() => import('./Angulos/Angulos.jsx')),
  triangulos: lazy(() => import('./Triangulos/Triangulos.jsx')),
  cuadrilateros: lazy(() => import('./Cuadrilateros/Cuadrilateros.jsx')),
  circulo: lazy(() => import('./CirculoPoligonos/CirculoPoligonos.jsx')),
  'perimetro-area': lazy(() => import('./PerimetroArea/PerimetroArea.jsx')),
  pitagoras: lazy(() => import('./Pitagoras/Pitagoras.jsx')),
  cuerpos: lazy(() => import('./Cuerpos/Cuerpos.jsx')),
};
