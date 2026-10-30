# 📐 geometria-app

App interactiva de **geometría** para **1.º y 2.º año de secundaria**: figuras planas y cuerpos geométricos, con fórmulas, áreas, propiedades, desarrollos planos que se pliegan, fórmula de Euler y problemas con resolución paso a paso.

Mismo esquema que `estadistica-app`, `app-derivadas` e `integrales-app`: **React + Vite + Tailwind**, fórmulas en **KaTeX**, navegación por pasos con botón «Siguiente», modo desafío y modo evaluación. Pensada para abrirse **desde el celular**.

> Cada paso de este README deja la app en un estado que funciona y se puede publicar. Si te quedás sin tokens o sin tiempo, retomá desde el último paso tildado (hay un prompt para retomar al final).

---

## 📍 Estado actual (29/10/2026)

**Avance: 8 de 17 pasos terminados + el Paso 9 funcionando en el menú (le faltan detalles menores).**

**Verificación del estado actual del repo**
- `npm run test:utils`: 22 pruebas OK.
- `npm test`: 55 pruebas OK (componentes 16, Pasos 4 a 8: 19, Paso 9: 20).
- `npm run build`: compila sin errores.
- El módulo del Paso 9 está registrado, se abre desde el menú y entra en el build.

### ✅ Resuelto

| Paso | Módulo | Qué quedó funcionando |
|---|---|---|
| 1 | Proyecto | React 19 + Vite 7 + Tailwind 4 + KaTeX |
| 2 | Utilidades y datos | `geometry.js`, `format.js`, `rand.js`, `figuras.js`, `cuerpos.js`, y `check-utils.mjs` |
| 3 | Componentes y navegación | `Formula`, `StepNav`, `Slider`, `Quiz`, `NumInput`, `ProgressBar`, `ModuloLayout`, `BarraAjustes`, `AppContext` (año, π, progreso), menú por `#hash` y carga diferida |
| 4 | Ángulos y Triángulos | Dos módulos interactivos |
| 5 | Cuadriláteros y Círculo/polígonos | Dos módulos interactivos |
| 6 | Perímetro y área | Una pantalla por figura con cálculo paso a paso |
| 7 | Pitágoras | Demostración visual y ejercicios |
| 8 | Cuerpos y elementos | Galería, CSS 3D (`solidos3d.js`) y tabla comparativa |

### 🟡 Casi listo: Paso 9 · Desarrollo plano interactivo
Ya está registrado en `src/modules/index.js` y se abre desde el menú.

- Hecho: `data/nets.js` (8 desarrollos: cubo, ortoedro, prismas triangular, pentagonal y hexagonal, pirámides triangular, cuadrada y pentagonal), `modules/DesarrolloPlano/DesarrolloPlano.jsx` (5 pasos: plegado con deslizador, giro de la vista, colorear caras iguales, área total = suma de las caras, cilindro y cono que se desenrollan, mini quiz) y pruebas (`paso9.test.jsx`: 18 sobre los datos; `paso9-modulo.test.jsx`: 2 sobre el menú).
- Falta: botón para mostrar/ocultar las medidas en el desarrollo.
- Falta: una prueba que recorra el módulo completo hasta el ✓, como en los Pasos 4 a 8.

### ☐ Pendiente

| Paso | Qué falta |
|---|---|
| 10 | ¿Arma un cubo?: los 11 desarrollos válidos, los inválidos y el juego con puntaje |
| 11 | Fórmula de Euler: tabla para completar, predicción y poliedros regulares |
| 12 | Áreas y volúmenes: valores editables, unidades y animación 3 pirámides = 1 prisma |
| 13 | Formulario con buscador, filtro por año, mini calculadora e impresión (`data/figuras.js` y `cuerpos.js` ya tienen las fórmulas) |
| 14 | Problemas de resolución: crear `data/problemas.js` (no existe) y el módulo |
| 15 | Modo evaluación con puntaje, impresión y clave del docente |
| Extras | Ninguno empezado (vistas de un cuerpo, simetrías, regla y compás, memotest, etc.) |
| 16 | Revisión: borrar el módulo `Demo` (sigue en el repo), revisar fórmulas con π = 3,14 y exacto, probar en celular de 360 px y sin `localStorage` |
| 17 | Publicación: descomentar `base: '/geometria-app/'` en `vite.config.js` si va a GitHub Pages, o conectar Vercel |

Mientras no estén hechos, los módulos de los Pasos 10 a 15 aparecen en el menú como **«Próximamente»**.

**Próximo paso sugerido:** seguir con el Paso 10 (¿Arma un cubo?), que reutiliza el plegado de `nets.js`.

---

## 1. Decisiones de diseño (y por qué)

| Decisión | Elección | Por qué |
|---|---|---|
| Framework | React + Vite | Igual que tus otras apps: reutilizás componentes (`Formula`, `Slider`, `StepNav`, `Quiz`). |
| Estilos | Tailwind CSS v4 | Misma base visual y rápido para ajustar en celular. |
| Fórmulas | `katex` (render directo con `renderToString`) | Se ven bien en LaTeX, sin depender de `react-katex` ni de sus peer dependencies. |
| Figuras planas | **SVG** propio | Escala sin perder nitidez, se arrastra y se mide fácil, cero dependencias. |
| Cuerpos 3D y desarrollos | **CSS 3D transforms** (sin three.js) | Funciona fluido en celulares viejos, cero dependencias, y un desarrollo plano es naturalmente «caras unidas por charnelas» que giran. |
| Cilindro, cono, esfera | SVG animado (desenrollar) | Sus desarrollos tienen curvas: más simple y preciso en 2D. |
| Decimales | Coma decimal (`toLocaleString('es-AR')`) | Es lo que ven en el cuaderno. |
| π | Selector «π = 3,14 / π exacto» | Los chicos de 1.º suelen usar 3,14; en 2.º conviene mostrar también la expresión con π. |
| Progreso | `localStorage` dentro de `try/catch` | Guarda lo hecho sin backend. En vistas previas sandbox puede no existir: la app tiene que funcionar igual. |
| Filtro por año | Cada módulo lleva `anios: [1]`, `[2]` o `[1,2]` | Mostrás solo lo que corresponde a tu planificación. |

---

## 2. Qué incluye (mapa de módulos)

### Figuras planas
| Módulo | Contenido | Año |
|---|---|---|
| **Ángulos** | Agudo/recto/obtuso/llano, complementarios, suplementarios, opuestos por el vértice, ángulos entre paralelas cortadas por una transversal | 1.º |
| **Triángulos** | Clasificación por lados y ángulos, suma de ángulos = 180° (arrastrás los vértices), desigualdad triangular (¿se puede armar con 3, 4 y 9?), puntos notables | 1.º y 2.º |
| **Cuadriláteros** | Árbol de clasificación (cuadrado ⊂ rectángulo ⊂ paralelogramo…), propiedades de lados, ángulos y diagonales, «¿qué cuadrilátero soy?» | 1.º y 2.º |
| **Círculo y polígonos regulares** | Radio, diámetro, π, longitud y área; ángulo interior/central y cantidad de diagonales | 1.º y 2.º |
| **Perímetro y área** | Deslizadores que cambian la figura y muestran el cálculo paso a paso; «misma área, distinto perímetro» | 1.º y 2.º |
| **Pitágoras** | Demostración visual con áreas de cuadrados, terna pitagórica, hallar el lado que falta | 2.º |

### Cuerpos geométricos
| Módulo | Contenido | Año |
|---|---|---|
| **Cuerpos** | Poliedros vs. cuerpos redondos, elementos (caras, aristas, vértices, bases), prismas, pirámides, cilindro, cono, esfera | 1.º y 2.º |
| **Desarrollo plano interactivo** | Slider «plegar» 0 → 100 % que arma el cuerpo; desarrollos de cubo, prismas y pirámides; cilindro y cono se desenrollan | 1.º y 2.º |
| **¿Arma un cubo?** | Juego: se muestran desarrollos de 6 cuadrados (hay 11 válidos) y hay que decidir si pliegan en un cubo | 1.º |
| **Fórmula de Euler** | C + V = A + 2: tabla que se completa contando, verificación en cada poliedro, los 5 poliedros regulares, ¿qué pasa si el cuerpo tiene un agujero? | 2.º |
| **Áreas y volúmenes** | Área lateral, área total y volumen con valores editables y el cálculo desglosado; unidades (cm², cm³, dm³ = litro) | 2.º |

### Transversales
| Módulo | Contenido |
|---|---|
| **Formulario** | Tarjetas con todas las fórmulas en KaTeX, con buscador y filtro por año; cada tarjeta tiene una mini calculadora |
| **Problemas** | Problemas contextualizados (patio, pileta, tanque, cancha) con valores aleatorios, pistas, resolución paso a paso y corrección con unidades |
| **Modo evaluación** | Dos ejercicios completos (uno de figuras planas y uno de cuerpos), sin pistas, con puntaje y botón de imprimir |

---

## 3. Estructura de carpetas

```
geometria-app/
├─ index.html
├─ package.json
├─ vite.config.js            # base: '/geometria-app/' si se publica en GitHub Pages
├─ README.md
├─ scripts/
│  └─ check-utils.mjs        # npm run test:utils (fórmulas, formato, datos, KaTeX)
└─ src/
   ├─ main.jsx
   ├─ App.jsx                # menú de módulos + navegación por #hash
   ├─ index.css              # Tailwind + KaTeX + deslizador táctil
   ├─ __tests__/             # npm test (Vitest + Testing Library)
   ├─ context/
   │  └─ AppContext.jsx      # año, π (3,14 / exacto) y progreso
   ├─ hooks/
   │  └─ useLocalStorage.js  # guarda en el navegador sin romper si no puede
   ├─ components/
   │  ├─ Formula.jsx         # KaTeX
   │  ├─ StepNav.jsx         # pasos con «Siguiente / Anterior»
   │  ├─ Slider.jsx          # deslizador con − y +
   │  ├─ Quiz.jsx            # opción múltiple con feedback
   │  ├─ NumInput.jsx        # respuesta numérica (coma o punto, tolerancia)
   │  ├─ ProgressBar.jsx
   │  ├─ ModuloLayout.jsx    # marco común de cada módulo
   │  └─ BarraAjustes.jsx    # selector de año y de π
   ├─ modules/
   │  ├─ index.js            # registro id -> componente (carga diferida)
   │  ├─ Demo/               # prueba de componentes (se borra en el Paso 16)
   │  ├─ Angulos/            # (Paso 4)
   │  ├─ Triangulos/
   │  ├─ Cuadrilateros/
   │  ├─ CirculoPoligonos/
   │  ├─ PerimetroArea/
   │  ├─ Pitagoras/
   │  ├─ Cuerpos/
   │  ├─ DesarrolloPlano/    # (Paso 9)
   │  ├─ ArmaUnCubo/
   │  ├─ Euler/
   │  ├─ AreasVolumenes/
   │  ├─ Formulario/
   │  ├─ Problemas/
   │  └─ Evaluacion/
   ├─ data/
   │  ├─ modulos.js          # catálogo del menú (título, año, grupo)
   │  ├─ figuras.js          # fórmulas y propiedades de figuras planas
   │  ├─ cuerpos.js          # C, V, A, fórmulas de cada cuerpo
   │  ├─ nets.js             # desarrollos planos (Paso 9)
   │  └─ problemas.js        # plantillas de problemas (Paso 14)
   └─ utils/
      ├─ geometry.js         # áreas, perímetros, volúmenes, Pitágoras, unidades
      ├─ solidos3d.js        # geometría de los cuerpos para CSS 3D (Paso 8)
      ├─ format.js           # números en es-AR, parseNum, tolerancia
      └─ rand.js             # aleatorios con semilla
```

---

## 4. Pasos de implementación

Cada paso tiene **Qué hacer** y **Por qué**. Orden pensado para que lo más valioso (lo interactivo) quede temprano.

### FASE 1 — Base

#### ✅ Paso 1 · Crear el proyecto
**Qué hacer**
```bash
npm create vite@latest geometria-app -- --template react
cd geometria-app
npm install
npm install katex
npm install tailwindcss @tailwindcss/vite
```
En `vite.config.js` agregar el plugin de Tailwind y, si publicás en GitHub Pages, `base: '/geometria-app/'`. En `src/index.css`:
```css
@import "tailwindcss";
@import "katex/dist/katex.min.css";
```
**Por qué:** es el mismo arranque que tus otras apps; con esto ya podés correr `npm run dev`.

#### ✅ Paso 2 · Utilidades y datos
**Qué hacer**
- `utils/geometry.js`: funciones puras, una por fórmula (`areaTriangulo(b, h)`, `areaCirculo(r)`, `volumenPrisma(areaBase, h)`, `hipotenusa(a, b)`…).
- `utils/format.js`: `fmt(n, dec = 2)` con `toLocaleString('es-AR')` y `fmtU(n, 'cm²')`.
- `utils/rand.js`: generador con semilla (mulberry32) para que un problema sea reproducible.
- `data/cuerpos.js`: por cada cuerpo, `{ id, nombre, tipo, caras, vertices, aristas, formulas }`.

**Por qué:** toda la app (calculadoras, problemas, evaluación) usa las mismas funciones. Si una fórmula tiene un error, se corrige en un solo lugar.

**Cómo verificar:** `npm run test:utils` corre 22 pruebas (fórmulas, formato, aleatorios con semilla, que todos los poliedros cumplan Euler y que cada fórmula LaTeX se renderice en KaTeX).

#### ✅ Paso 3 · Componentes base y navegación
**Qué se hizo**
- `Formula`, `StepNav`, `Slider`, `Quiz`, `NumInput`, `ProgressBar`, `ModuloLayout` y `BarraAjustes` en `src/components/`.
- `AppContext` con tres cosas globales: **año** (todos / 1.º / 2.º), **π** (3,14 o exacto) y **progreso** (módulos completados). Se guardan en el navegador.
- `App.jsx`: menú con tarjetas por grupo, barra de avance, filtro por año y navegación por `#hash` (el botón «atrás» del celular vuelve al menú).
- `data/modulos.js`: catálogo con los 14 módulos. Los que todavía no existen aparecen como **«Próximamente»** y se activan solos cuando se registran.
- `modules/Demo`: módulo de prueba que usa todos los componentes. Es el **molde** para los módulos reales.

**Por qué**
- Contexto en vez de pasar props: cada módulo necesita saber el valor de π y marcar su progreso; con `useApp()` lo obtiene en una línea.
- `#hash` en vez de una librería de rutas: cero dependencias y funciona en cualquier hosting estático.
- Carga diferida (`lazy`): cada módulo se descarga solo al abrirlo, así la portada carga rápido en el celular.
- Todos los botones miden al menos 44 px y los campos usan 16 px (evita el zoom automático de iOS).

**Receta para agregar un módulo nuevo (Pasos 4 en adelante)**
1. Copiar `src/modules/Demo/Demo.jsx` a `src/modules/<Nombre>/<Nombre>.jsx` y reemplazar los pasos.
2. Registrarlo en `src/modules/index.js`:
```js
triangulos: lazy(() => import('./Triangulos/Triangulos.jsx')),
```
3. Listo: en `data/modulos.js` ya está con su título, año y descripción; el menú lo habilita solo.
4. Al final del módulo, `marcarCompletado('<id>')` (del `useApp()`) suma el ✓ y el avance.

**Cómo verificar**
- `npm test` corre 16 pruebas que simulan toques: slider, quiz, respuesta con coma, pasos bloqueados, filtro por año y el recorrido completo del módulo de prueba.
- `npm run dev` y abrir el módulo «🧪 Prueba de componentes». Probar cambiar «Valor de π» y ver cómo se adapta la fórmula.

---

### FASE 2 — Figuras planas

#### ✅ Paso 4 · Ángulos y triángulos
**Qué hacer**
- **Ángulos:** SVG con transportador, un deslizador de 0° a 180° que clasifica en vivo; dos pares de ángulos (complementarios y suplementarios) donde se mueve uno y el otro se ajusta; paralelas cortadas por una transversal con los 8 ángulos coloreados.
- **Triángulos:** vértices arrastrables, clasificación automática por lados y ángulos, suma de ángulos (muestra 180° siempre), desigualdad triangular con tres deslizadores («¿se puede armar?»).

**Por qué:** arrastrar y ver que la suma da siempre 180° convence más que enunciarlo. Es la actividad «primero hacer, después nombrar».

#### ✅ Paso 5 · Cuadriláteros, círculo y polígonos regulares
**Qué hacer**
- Árbol de clasificación de cuadriláteros; al tocar uno se resaltan sus propiedades (lados, ángulos, diagonales).
- «¿Qué cuadrilátero soy?» con pistas progresivas.
- Círculo: radio con deslizador, longitud y área con cálculo desglosado; mostrar que L / d ≈ π.
- Polígonos regulares: `n` de 3 a 12, ángulo interior, ángulo central y diagonales con `n(n−3)/2`.

**Por qué:** la jerarquía «el cuadrado también es rectángulo» es el error conceptual más común en 1.º; verla en un árbol lo aclara.

#### ✅ Paso 6 · Perímetro y área
**Qué hacer**
- Una pantalla por figura (rectángulo, triángulo, paralelogramo, trapecio, rombo, círculo) con deslizadores y el cálculo mostrado paso a paso: fórmula → reemplazo → resultado con unidad.
- Actividad «misma área, distinto perímetro» sobre una cuadrícula.
- Para el área del triángulo y del paralelogramo, animación de «cortar y mover» el pedazo para formar un rectángulo.

**Por qué:** mostrar de dónde sale la fórmula (descomposición) reduce el aprendizaje de memoria.

#### ✅ Paso 7 · Pitágoras (2.º año)
**Qué hacer**
- Triángulo rectángulo con tres cuadrados sobre los lados; las áreas se calculan en vivo y se ve que a² + b² = c².
- Ejercicios: hallar hipotenusa o cateto; verificar ternas (3-4-5, 5-12-13, 8-15-17); «¿es rectángulo?».

**Por qué:** es el tema central de geometría de 2.º y conecta área con medidas de lados.

---

### FASE 3 — Cuerpos (lo más distintivo de la app)

#### ✅ Paso 8 · Cuerpos y sus elementos
**Qué hacer**
- Galería con prismas, pirámides, cilindro, cono y esfera; al tocar uno, un cuerpo que rota (CSS 3D) con caras, aristas y vértices resaltables.
- Clasificación poliedros vs. cuerpos redondos con un mini quiz.
- Tabla comparativa generada desde `data/cuerpos.js`.

**Por qué:** una sola fuente de datos alimenta galería, tabla, Euler y problemas.

#### 🟡 Paso 9 · Desarrollo plano interactivo ⭐
> **Estado:** funcionando y registrado en el menú; falta el botón de mostrar/ocultar medidas y una prueba del recorrido completo (ver «Estado actual»).

**Qué hacer**
- Modelar cada desarrollo en `data/nets.js` como un árbol de caras unidas por charnelas:
```js
// Cada cara: tamaño, de qué cara cuelga, por qué borde y cuánto gira al plegar
export const cubo = {
  id: 'cubo',
  caras: [
    { id: 'base',    w: 1, h: 1, padre: null },
    { id: 'frente',  w: 1, h: 1, padre: 'base',   borde: 'abajo',     angulo: 90 },
    { id: 'derecha', w: 1, h: 1, padre: 'frente', borde: 'derecha',   angulo: 90 },
    // …
  ],
};
```
- Componente `Net3D`: renderiza cada cara como `div` anidado dentro de su padre, con `transform-origin` en el borde de la charnela y `rotateX/rotateY(angulo * plegado)`, donde `plegado` va de 0 a 1 con un slider.
- Botones: «Plegar», «Desplegar», rotar la vista, mostrar/ocultar medidas, colorear caras según sean iguales.
- Cilindro y cono: SVG que «desenrolla» la superficie lateral (rectángulo de largo `2πr`; sector circular de ángulo `360°·r/g` para el cono).
- Panel lateral: «Área total = suma de las áreas del desarrollo», con el cálculo.

**Por qué:** el desarrollo plano es la forma más concreta de entender el área total, y se conecta con tu PDF de redes desplegables con hilo (misma idea: mismas caras y medidas).

#### ☐ Paso 10 · ¿Arma un cubo?
**Qué hacer**
- Guardar 11 desarrollos válidos y varios inválidos de 6 cuadrados. Mostrar uno al azar; el estudiante responde sí/no y después se anima el plegado para comprobarlo.

**Por qué:** razonamiento espacial con retroalimentación inmediata; funciona muy bien como desafío con puntos.

#### ☐ Paso 11 · Fórmula de Euler ⭐
**Qué hacer**
- Pantalla 1: tabla con cubo, prisma triangular, pirámide cuadrada, tetraedro, octaedro, etc. El estudiante cuenta y completa **C, V, A**; la app corrige.
- Pantalla 2: calcular `C + V` y `A + 2` y notar que coinciden. Mostrar `C + V = A + 2`.
- Pantalla 3: uso práctico — dado un poliedro con V y C, hallar A (y al revés); «¿existe un poliedro con 5 caras, 8 aristas y 6 vértices?».
- Pantalla 4: los 5 poliedros regulares con su tabla (cuántas caras, qué polígono, cuántas se juntan en cada vértice).
- Pantalla 5 (curiosidad): un cuerpo con agujero (toroide) da 0 en vez de 2, para mostrar que la fórmula tiene condiciones.

**Por qué:** pasa de «contar» a «predecir», que es lo que hace valiosa a la fórmula.

#### ☐ Paso 12 · Áreas y volúmenes
**Qué hacer**
- Por cuerpo: valores editables, fórmula en KaTeX, reemplazo y resultado con unidad.
- Pantalla de **unidades**: cm² ↔ m², cm³ ↔ dm³ ↔ litros (1 dm³ = 1 L) con ejemplos (pileta, tanque, caja).
- Principio de que el volumen de un prisma es «área de la base × altura» y el de la pirámide es un tercio, con animación de llenado (3 pirámides llenan 1 prisma).

**Por qué:** las unidades son donde más se equivocan los chicos; vale una pantalla propia.

---

### FASE 4 — Fórmulas y problemas

#### ☐ Paso 13 · Formulario
**Qué hacer**
- Tarjetas generadas desde `data/figuras.js` y `data/cuerpos.js` (una sola fuente de verdad), con buscador, filtro por año y mini calculadora en cada tarjeta.
- Botón «imprimir» para llevar un resumen al cuaderno.

**Por qué:** es la referencia rápida que los chicos usan durante los problemas.

#### ☐ Paso 14 · Problemas de resolución
**Qué hacer**
- `data/problemas.js` con plantillas parametrizadas:
```js
{
  id: 'patio-baldosas',
  anios: [1, 2],
  tema: 'perimetro-area',
  generar: (r) => ({ largo: r.int(6, 12), ancho: r.int(3, 8), lado: 0.2 }),
  enunciado: ({ largo, ancho, lado }) =>
    `Un patio rectangular mide ${largo} m por ${ancho} m. Se lo quiere cubrir con baldosas cuadradas de ${lado * 100} cm de lado. ¿Cuántas baldosas hacen falta?`,
  resolver: ({ largo, ancho, lado }) => [
    { texto: 'Área del patio', tex: 'A = largo \\cdot ancho', valor: largo * ancho, unidad: 'm²' },
    { texto: 'Área de una baldosa', tex: 'A = lado^2', valor: lado * lado, unidad: 'm²' },
    { texto: 'Cantidad de baldosas', tex: 'n = A_{patio} : A_{baldosa}', valor: (largo * ancho) / (lado * lado), unidad: 'baldosas' },
  ],
  pistas: ['Pasá los cm a m antes de calcular.', 'Dividí el área total por el área de una baldosa.'],
}
```
- Pantalla de problema: enunciado → el estudiante escribe su respuesta → pistas progresivas → «ver resolución paso a paso» → «otro problema parecido» (nueva semilla).
- Corrección con tolerancia y chequeo de unidad.
- Contextos locales (cancha de fútbol, pileta, tanque de agua, cartel, caja de zapatillas, carpa).
- Mínimo 3 plantillas por tema: figuras planas, Pitágoras, cuerpos, Euler, unidades.

**Por qué:** con valores aleatorios cada chico tiene números distintos (menos copia), y la resolución paso a paso enseña el método, no solo el resultado.

#### ☐ Paso 15 · Modo evaluación
**Qué hacer**
- Solapa que arma **dos ejercicios completos**: uno de figuras planas y uno de cuerpos (con desarrollo plano y volumen), sin pistas, con puntaje por paso.
- Botón de imprimir para la versión en papel (`window.print()` con estilos de impresión) y una versión con clave de respuestas para el docente.

**Por qué:** mismo esquema que el modo evaluación de `estadistica-app`.

---

### FASE 5 — Extras sugeridos

Ordenados por valor / esfuerzo:

1. **Vistas de un cuerpo** (frente, lado, arriba): dado un cuerpo, elegir sus tres vistas. Muy bueno para 1.º.
2. **Simetrías**: ejes de simetría de figuras planas (cuántos tiene cada polígono regular).
3. **Construcciones con regla y compás**: mediatriz, bisectriz y triángulo con tres lados dados, paso a paso animado.
4. **Memotest geométrico**: figura ↔ nombre ↔ fórmula.
5. **«¿Qué cuerpo soy?»**: adivinanza con pistas («tengo 6 caras, 12 aristas…»).
6. **Cuerpos con cubitos**: contar cubitos para entender volumen como «cantidad de unidades».
7. **Modo desafío con rachas y medallas** (reutilizar el de las otras apps).
8. **Ficha de actividad para imprimir** de cada módulo.

---

### FASE 6 — Pruebas y publicación

#### ☐ Paso 16 · Revisión
**Qué hacer**
- Quitar el módulo de prueba: borrar `src/modules/Demo/`, su línea en `modules/index.js` y su entrada `demo` en `data/modulos.js`.
- Revisar **todas** las fórmulas contra tu planificación (usar π = 3,14 y π exacto).
- Probar en celular real (ancho 360 px): sliders con zona táctil grande, SVG con `viewBox`, textos legibles.
- Revisar accesibilidad básica: contraste, tamaño de fuente mínimo 16 px, botones de al menos 44 px.
- Verificar que sin `localStorage` la app sigue funcionando.

#### ☐ Paso 17 · Publicar
**Qué hacer**
1. Crear el repo `geometria-app` en GitHub y subir el proyecto.
2. Publicar con **Vercel** (más simple, conecta con el repo y despliega solo) o **GitHub Pages** (poner `base: '/geometria-app/'` en `vite.config.js`).
3. Compartir el link por el grupo de la escuela; abre directo en el celular.

**Por qué:** un link evita que los chicos instalen nada.

---

## 5. Checklist de avance

- [x] Paso 1 · Proyecto
- [x] Paso 2 · Utilidades y datos
- [x] Paso 3 · Componentes base y navegación
- [x] Paso 4 · Ángulos y triángulos
- [x] Paso 5 · Cuadriláteros, círculo y polígonos
- [x] Paso 6 · Perímetro y área
- [x] Paso 7 · Pitágoras
- [x] Paso 8 · Cuerpos y elementos
- [~] Paso 9 · Desarrollo plano interactivo (funciona; faltan mostrar/ocultar medidas y prueba del recorrido)
- [ ] Paso 10 · ¿Arma un cubo?
- [ ] Paso 11 · Fórmula de Euler
- [ ] Paso 12 · Áreas y volúmenes
- [ ] Paso 13 · Formulario
- [ ] Paso 14 · Problemas
- [ ] Paso 15 · Modo evaluación
- [ ] Extras
- [ ] Paso 16 · Revisión
- [ ] Paso 17 · Publicación

---

## 6. Prompt para retomar

Si se corta la conversación, pegá esto en un chat nuevo:

> Estoy armando `geometria-app` (React + Vite + Tailwind + KaTeX) para 1.º y 2.º año de secundaria, siguiendo el README del repo. Ya hice hasta el **Paso N**. Pasame los archivos completos del siguiente paso, con el razonamiento de cada decisión, usando la misma estructura de carpetas y el mismo esquema que `estadistica-app` e `integrales-app`.

---

## 7. Criterios de calidad

- Cada pantalla: **primero actividad, después definición**.
- Todo resultado numérico lleva **unidad** (cm, cm², cm³, L).
- Coma decimal en pantalla; punto solo en el código.
- Nada de teoría larga: máximo 3–4 líneas por pantalla, el resto en desplegables.
- Cada fórmula se ve en LaTeX y sale de una **única fuente de datos**.
