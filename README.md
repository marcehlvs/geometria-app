# 📐 geometria-app

App interactiva de **geometría** para **1.º y 2.º año de secundaria**: figuras planas y cuerpos geométricos, con fórmulas, áreas, propiedades, desarrollos planos que se pliegan, fórmula de Euler y problemas con resolución paso a paso.

Mismo esquema que `estadistica-app`, `app-derivadas` e `integrales-app`: **React + Vite + Tailwind**, fórmulas en **KaTeX**, navegación por pasos con botón «Siguiente», modo desafío y modo evaluación. Pensada para abrirse **desde el celular**.

> Cada paso de este README deja la app en un estado que funciona y se puede publicar. Si te quedás sin tokens o sin tiempo, retomá desde el último paso tildado (hay un prompt para retomar al final).

---

## 📍 Estado actual (01/11/2026)

**Avance: 15 de 17 pasos hechos (del 1 al 15). Faltan solo la revisión y la publicación.**

**Verificación del estado actual del repo**
- `npm run test:utils`: 22 pruebas OK.
- `npm test`: 176 pruebas OK (componentes y menú 17, Pasos 4 a 8: 19, Paso 9: 25, Paso 10: 9, Paso 11: 4, Paso 12: 15, Paso 13: 21, Paso 14: 44, Paso 15: 22).
- `npm run build`: compila sin errores.
- Los módulos de los Pasos 4 a 15 están registrados en `src/modules/index.js`, se abren desde el menú y entran en el build.

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
| 9 | Desarrollo plano interactivo | Ver más abajo |
| 10 | ¿Arma un cubo? | Ver más abajo |
| 11 | Fórmula de Euler | Ver más abajo |
| 12 | Áreas y volúmenes | Ver más abajo |
| 13 | Formulario | Ver más abajo |
| 14 | Problemas | Ver más abajo |
| 15 | Modo evaluación | Ver más abajo |

### ✅ Paso 9 · Desarrollo plano interactivo
- `data/nets.js`: 8 desarrollos (cubo, ortoedro, prismas triangular, pentagonal y hexagonal, pirámides triangular, cuadrada y pentagonal) modelados como árbol de caras unidas por bisagras. Nuevas funciones: `medidasDeCara` (un lado por cada longitud distinta de la cara) y `carasRepresentativas` (una cara por grupo de caras iguales).
- `components/Net3D.jsx`: nueva propiedad `medidas` (y `unidad`, por defecto `cm`) que rotula los lados con `<text data-medida>` dentro del dibujo, así los números se pliegan junto con la cara.
- `modules/DesarrolloPlano/DesarrolloPlano.jsx` (5 pasos): plegado con deslizador, giro de la vista, colorear caras iguales, **botón «Mostrar medidas»**, área total = suma de las caras (con las medidas ya visibles), cilindro y cono que se desenrollan y mini quiz.
- Pruebas: `paso9.test.jsx` (21, sobre los datos y las medidas) y `paso9-modulo.test.jsx` (4: registro en el menú, botón de medidas y **recorrido completo hasta el ✓** con el progreso guardado).

### ✅ Paso 10 · ¿Arma un cubo?
- `data/cuboNets.js`: genera los **35 hexaminós** (figuras de 6 cuadrados) y decide cuáles arman un cubo **rodando un cubo sobre la figura** (si dos cuadrados caen en la misma cara, se superponen). Da exactamente **11**, en cuatro familias: 1-4-1 (6), 2-3-1 (3), 2-2-2 (1) y 3-3 (1). No hay figuras copiadas a mano.
- `components/Net3D.jsx`: el plegado 3D se sacó de `DesarrolloPlano` a un componente compartido; el Paso 9 lo sigue usando.
- `modules/ArmaUnCubo/ArmaUnCubo.jsx` (4 pasos): 1) plegar la cruz, 2) desafío de 6 figuras (3 que arman y 3 que no, con giros y espejos al azar), con comprobación animada, cuadrados superpuestos marcados en rojo y puntaje, 3) galería de las 11 y pregunta, 4) cierre.
- Pruebas (`paso10.test.jsx`, 9): 35 hexaminós y 11 válidos, cantidades conocidas de poliominós, familias, independencia de giros/espejos, **coincidencia con el plegado 3D real**, rondas reproducibles con semilla y recorrido completo del módulo.

### ✅ Paso 11 · Fórmula de Euler
- `modules/Euler/Euler.jsx` (6 pasos): 1) el estudiante **cuenta** C, V y A de 5 cuerpos con el modelo 3D (resaltando caras, aristas o vértices) y la app corrige celda por celda; 2) compara C + V con A + 2 y responde qué relación se cumple; 3) **predice**: hallar las aristas de un poliedro con 7 caras y 10 vértices, y decidir si existe uno con 5 caras, 6 vértices y 8 aristas; 4) los 5 poliedros regulares; 5) curiosidad del marco con agujero (C + V − A = 0); 6) cierre.
- `components/Poliedro3D.jsx`: el modelo 3D en SVG se sacó de `Cuerpos` a un componente compartido (Pasos 8 y 11).
- Todos los números salen de `data/cuerpos.js` (fuente única) y de `utils/geometry.js`.
- Pruebas (`paso11.test.jsx`, 4): todos los poliedros y regulares cumplen Euler, el marco da 0, la tabla marca errores y bloquea el avance, y el recorrido completo guarda el progreso.

### ✅ Paso 12 · Áreas y volúmenes
- `data/areasVolumenes.js`: arma el desglose de cada cuerpo (fórmula → reemplazo → resultado) usando **solo** `utils/geometry.js` para los números y `data/cuerpos.js` para las fórmulas. Cubre cubo, ortoedro, prisma triangular (base 3-4-5 con Pitágoras), pirámide cuadrada (con su apotema), cilindro, cono y esfera. También tiene la tabla de equivalencias de unidades, los ejemplos de capacidad (caja, tanque, pileta) y los datos de la demostración 3 pirámides = 1 prisma.
- `data/cuerpos.js`: se agregaron las fórmulas de área lateral del cubo y del ortoedro (`FORMULAS_POLIEDROS`).
- `components/Redondo3D.jsx`: el dibujo de cilindro, cono y esfera se sacó de `Cuerpos` a un componente compartido (Pasos 8 y 12).
- `modules/AreasVolumenes/AreasVolumenes.jsx` (6 pasos): 1) elegir un cuerpo, cambiar sus medidas con deslizadores y ver cada cálculo con unidad (y el volumen también en litros); con **π = 3,14** el reemplazo muestra 3,14, con **π exacto** muestra el símbolo π y el resultado se marca como aproximado (≈); 2) cambio de unidades (cm² ↔ m², cm³ ↔ dm³ ↔ L) con tabla y un ejercicio; 3) del volumen a los litros con caja, tanque y pileta, y un ejercicio; 4) **animación de llenado**: se vierten 3 pirámides en un prisma de igual base y altura (324 cm³ contra 3 · 108 cm³); 5) quiz de cono y cilindro; 6) cierre.
- Pruebas (`paso12.test.jsx`, 15): cálculos de los 7 cuerpos con valores conocidos, π escolar y exacto, el cono como tercera parte del cilindro, que todas las fórmulas y reemplazos se rendericen en KaTeX, equivalencias y litros, y el recorrido completo del módulo.

### ✅ Paso 13 · Formulario
- `data/formulario.js`: arma las **18 tarjetas** a partir de `data/figuras.js` y `data/cuerpos.js` (no se escribió ninguna fórmula nueva de figuras ni de cuerpos redondos): 8 figuras planas + Pitágoras, 7 cuerpos (cubo, ortoedro, prisma recto, pirámide, cilindro, cono y esfera), la fórmula de Euler y las unidades de área, volumen y capacidad (tabla de `data/areasVolumenes.js`).
- Buscador sin tildes ni mayúsculas (`area` encuentra «Área»); si se escriben varias palabras, todas tienen que aparecer en la tarjeta.
- Filtro por año (Todos, 1.º, 2.º) que arranca con el año elegido en el menú.
- **Mini calculadora** en cada tarjeta (todas menos «Unidades»): se completan los datos que se tengan (acepta coma decimal) y aparecen solos los resultados que se pueden calcular, con unidad (mm, cm, dm o m, elegible arriba). Usa `utils/geometry.js` y el valor de π elegido (3,14 o exacto). No muestra resultados imposibles, como un cateto con c menor que b.
- **Imprimir resumen**: imprime las tarjetas que se ven con el buscador y el filtro aplicados. En `index.css` hay estilos `@media print` que ocultan los controles (clase `no-imprimir`, que también tiene la barra superior de `ModuloLayout`).
- Es un módulo de consulta (no tiene pasos): queda marcado con ✓ al abrirlo.
- Pruebas (`paso13.test.jsx`, 21): una tarjeta por figura, fórmulas y variables en KaTeX, buscador, filtro por año, resultados de cada calculadora con valores conocidos, casos inválidos, cambio de unidad, que lo escrito en una calculadora se conserve al buscar y volver, y la impresión.

### ✅ Paso 14 · Problemas de resolución
- `data/problemas.js`: **23 plantillas** parametrizadas con semilla (`utils/rand.js`), repartidas en 5 temas: figuras planas (6), Pitágoras (3), cuerpos (6), Euler (4) y unidades (4). Los contextos son de la vida real: patio con baldosas, cancha de fútbol, pileta, tanque de agua, cartel, caja de zapatillas, carpa, cucurucho, escalera y rampa. Cada plantilla define `generar`, `enunciado`, `resolver` (pasos con fórmula con los números ya puestos, valor y unidad) y dos `pistas`. Pitágoras usa las ternas de `data/figuras.js` y Euler los poliedros de `data/cuerpos.js`, así que todos los resultados son enteros y consistentes.
- **Misma semilla, mismo problema** («Problema #5500»); otra semilla, otros números. `crearProblema(plantilla, semilla, { pi, piEscolar })` arma enunciado, pasos, respuesta y opciones de unidad. En los problemas con π el enunciado avisa qué valor usar (3,14 o la tecla π).
- **Corrección con tolerancia y unidad** (`corregir`): el estudiante escribe el número (acepta coma) y **elige la unidad** entre 4 opciones (la correcta y otras de distinta dimensión o escala; nunca una equivalente, como dm³ para litros). Distingue «número bien, unidad mal», «unidad bien, número mal» y todo mal. Un resultado entero tiene que ser exacto; con decimales o con π se acepta un 1 % de margen, así vale tanto 3,14 como la tecla π.
- `modules/Problemas/Problemas.jsx`: filtro por año y por tema, enunciado, respuesta + unidad, **pistas progresivas** (de a una), **«Ver la resolución paso a paso»**, **«Otro parecido»** (misma plantilla, otra semilla) y **«Otro distinto»** (otra plantilla del tema). Con 3 problemas bien resueltos queda marcado con ✓ en el menú.
- Pruebas (`paso14.test.jsx`, 44): cada plantilla con 40 semillas y los dos valores de π (números positivos, unidades, KaTeX, 4 opciones sin repetir), reproducibilidad por semilla, resultados conocidos (por ejemplo `C + V = A + 2` en Euler), tolerancia, y el módulo completo (corrección, pistas, resolución, otros problemas, filtros y progreso).

### ✅ Paso 15 · Modo evaluación
- `data/evaluacion.js`: arma una **evaluación de 12 puntos con dos ejercicios completos**, uno de figuras planas y uno de cuerpos, **sin pistas y con puntaje por paso** (cada ejercicio vale 6 puntos repartidos en 3 o 4 pasos). Hay 7 ejercicios: figuras planas (terreno con pileta, cartel en forma de casita con Pitágoras y patio con rincón) y cuerpos (caja, cubo, pirámide y cilindro, cada uno **con su desarrollo plano**). Los de 1.º año no usan Pitágoras, así que en ese año salen solo 5 de los 7.
- Todo sale de un **número de evaluación** («Evaluación N.º 4821»): el mismo número da siempre la misma evaluación, con la misma hoja del alumno, la misma corrección y la misma clave. Con otro número cambian los ejercicios y los datos.
- **Corrección por paso:** número y unidad bien = puntaje completo; número bien con la unidad faltante o equivocada = se descuentan **0,5 puntos** en ese paso; número mal o vacío = 0. Los enteros tienen que ser exactos; con decimales o con π se acepta un 1 % de margen, así que vale tanto 3,14 como la tecla π. Cada paso se corrige con los datos del enunciado (no arrastra el error de un paso anterior).
- `modules/Evaluacion/Evaluacion.jsx` con **tres solapas**: «Resolver en pantalla» (campo de respuesta y unidad por paso, «Corregir evaluación», puntaje total, respuestas correctas de lo que falló y «Volver a intentarlo»), «Versión para imprimir» (encabezado con nombre, curso, fecha y el número de evaluación, espacio para cálculos y para la respuesta) y «Clave del docente» (respuesta con unidad, cálculo y nota de cada paso). Las dos últimas tienen su botón **Imprimir** (`window.print()` con los estilos de impresión del Formulario; el desarrollo plano se imprime plano y con medidas).
- Se completa (✓ en el menú) al corregir una evaluación con el 60 % del puntaje o más.
- `index.css`: la clase `ejercicio` evita que un ejercicio se corte entre dos hojas al imprimir.
- Pruebas (`paso15.test.jsx`, 22): estructura de la evaluación para cada año y 60 números distintos, que todos los pasos sean válidos con los dos valores de π, que el área total coincida con la calculada **con las caras del desarrollo plano**, el puntaje (todo bien, sin unidades, en blanco), y el módulo completo (pantalla, impresión, clave, número de evaluación y medidas en el dibujo).
- El menú ya no tiene módulos «Próximamente»; la prueba de ese comportamiento se hace quitando un componente a propósito.

### ☐ Pendiente

| Paso | Qué falta |
|---|---|
| Extras | Ninguno empezado (vistas de un cuerpo, simetrías, regla y compás, memotest, etc.) |
| 16 | Revisión: **hecho** el módulo `Demo` borrado, zonas táctiles de 44 px, fuente mínima de 14 px y prueba sin `localStorage`. **Falta lo que solo se hace a mano:** revisar fórmulas contra tu planificación, probar en un celular de 360 px y mirar la vista previa de impresión |
| 17 | Publicación: descomentar `base: '/geometria-app/'` en `vite.config.js` si va a GitHub Pages, o conectar Vercel |

Todos los módulos del menú están hechos.

**Próximo paso sugerido:** Paso 16 (Revisión). Antes de publicar conviene mirar con el celular, en particular **la impresión del Modo evaluación y del Formulario** (la vista previa de impresión del navegador), porque esas pantallas se probaron con pruebas automáticas pero no en papel.

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
   ├─ index.css              # Tailwind + KaTeX + deslizador táctil + estilos de impresión
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
   │  ├─ Poliedro3D.jsx      # poliedro en SVG con caras, aristas y vértices resaltables (Pasos 8 y 11)
   │  ├─ Redondo3D.jsx       # cilindro, cono y esfera en SVG (Pasos 8 y 12)
   │  ├─ Net3D.jsx           # desarrollo plano que se pliega (CSS 3D) y puede rotular medidas, compartido por los Pasos 9 y 10
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
   │  ├─ ArmaUnCubo/         # (Paso 10)
   │  ├─ Euler/              # (Paso 11)
   │  ├─ AreasVolumenes/     # (Paso 12)
   │  ├─ Formulario/         # (Paso 13)
   │  ├─ Problemas/          # (Paso 14)
   │  └─ Evaluacion/         # (Paso 15)
   ├─ data/
   │  ├─ modulos.js          # catálogo del menú (título, año, grupo)
   │  ├─ figuras.js          # fórmulas y propiedades de figuras planas
   │  ├─ cuerpos.js          # C, V, A, fórmulas de cada cuerpo
   │  ├─ nets.js             # desarrollos planos y medidas de cada cara (Paso 9)
   │  ├─ cuboNets.js         # los 35 hexaminós y cuáles arman un cubo (Paso 10)
   │  ├─ areasVolumenes.js   # desglose de áreas y volúmenes, unidades y capacidad (Paso 12)
   │  ├─ formulario.js       # tarjetas, buscador y mini calculadoras (Paso 13)
   │  ├─ problemas.js        # plantillas de problemas (Paso 14)
   │  └─ evaluacion.js       # evaluación de dos ejercicios, puntaje y clave (Paso 15)
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

#### ✅ Paso 9 · Desarrollo plano interactivo ⭐
> **Estado:** hecho, con el botón de mostrar/ocultar medidas y la prueba del recorrido completo (ver «Estado actual»).

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

#### ✅ Paso 10 · ¿Arma un cubo?
> **Estado:** hecho. En vez de guardar los 11 desarrollos a mano, se generan y validan en `data/cuboNets.js` (ver «Estado actual»).

**Qué hacer**
- Guardar 11 desarrollos válidos y varios inválidos de 6 cuadrados. Mostrar uno al azar; el estudiante responde sí/no y después se anima el plegado para comprobarlo.

**Por qué:** razonamiento espacial con retroalimentación inmediata; funciona muy bien como desafío con puntos.

#### ✅ Paso 11 · Fórmula de Euler ⭐
> **Estado:** hecho (ver «Estado actual»).

**Qué hacer**
- Pantalla 1: tabla con cubo, prisma triangular, pirámide cuadrada, tetraedro, octaedro, etc. El estudiante cuenta y completa **C, V, A**; la app corrige.
- Pantalla 2: calcular `C + V` y `A + 2` y notar que coinciden. Mostrar `C + V = A + 2`.
- Pantalla 3: uso práctico — dado un poliedro con V y C, hallar A (y al revés); «¿existe un poliedro con 5 caras, 8 aristas y 6 vértices?».
- Pantalla 4: los 5 poliedros regulares con su tabla (cuántas caras, qué polígono, cuántas se juntan en cada vértice).
- Pantalla 5 (curiosidad): un cuerpo con agujero (toroide) da 0 en vez de 2, para mostrar que la fórmula tiene condiciones.

**Por qué:** pasa de «contar» a «predecir», que es lo que hace valiosa a la fórmula.

#### ✅ Paso 12 · Áreas y volúmenes
> **Estado:** hecho (ver «Estado actual»).

**Qué hacer**
- Por cuerpo: valores editables, fórmula en KaTeX, reemplazo y resultado con unidad.
- Pantalla de **unidades**: cm² ↔ m², cm³ ↔ dm³ ↔ litros (1 dm³ = 1 L) con ejemplos (pileta, tanque, caja).
- Principio de que el volumen de un prisma es «área de la base × altura» y el de la pirámide es un tercio, con animación de llenado (3 pirámides llenan 1 prisma).

**Por qué:** las unidades son donde más se equivocan los chicos; vale una pantalla propia.

---

### FASE 4 — Fórmulas y problemas

#### ✅ Paso 13 · Formulario
> **Estado:** hecho (ver «Estado actual»).

**Qué hacer**
- Tarjetas generadas desde `data/figuras.js` y `data/cuerpos.js` (una sola fuente de verdad), con buscador, filtro por año y mini calculadora en cada tarjeta.
- Botón «imprimir» para llevar un resumen al cuaderno.

**Por qué:** es la referencia rápida que los chicos usan durante los problemas.

#### ✅ Paso 14 · Problemas de resolución
> **Estado:** hecho (ver «Estado actual»). Las plantillas quedaron en `data/problemas.js` con `generar`, `enunciado`, `resolver` y `pistas`; la unidad de la respuesta se elige entre 4 opciones.

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

#### ✅ Paso 15 · Modo evaluación
> **Estado:** hecho (ver «Estado actual»).

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

#### 🟡 Paso 16 · Revisión (parte automática hecha)
**Qué se hizo**
- Se borró `src/modules/Demo/`, su línea en `modules/index.js`, su entrada en `data/modulos.js` y el filtro `m.id !== 'demo'` de `App.jsx`. La prueba que recorría el módulo de prueba se reemplazó por una que abre un módulo real y chequea el ✓ del menú.
- **Zonas táctiles de 44 px:** botones de relaciones en `Angulos` (eran de ~28 px), selector de año y de π en `BarraAjustes` (40 → 44 px) y puntitos de `StepNav` (la barrita sigue midiendo 10 px, pero el área que se toca ahora es de 44 px de alto).
- **Texto:** se eliminó `text-xs` (12 px) en toda la app; el mínimo ahora es `text-sm` (14 px). Los campos de entrada siguen en 16 px para que iOS no haga zoom.
- **Sin `localStorage`:** nueva prueba que hace fallar `getItem` y `setItem` y verifica que el menú, el filtro por año y la apertura de un módulo funcionan igual.

**Falta (solo se puede hacer a mano)**
- Revisar **todas** las fórmulas contra tu planificación, con π = 3,14 y π exacto. Las pruebas ya comprueban que los cálculos son coherentes entre sí, pero no pueden saber si coinciden con lo que das en clase.
- Probar en celular real (ancho 360 px): sliders, dibujos SVG y legibilidad.
- Mirar la vista previa de impresión del Modo evaluación y del Formulario.

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
- [x] Paso 9 · Desarrollo plano interactivo
- [x] Paso 10 · ¿Arma un cubo?
- [x] Paso 11 · Fórmula de Euler
- [x] Paso 12 · Áreas y volúmenes
- [x] Paso 13 · Formulario
- [x] Paso 14 · Problemas
- [x] Paso 15 · Modo evaluación
- [ ] Extras
- [~] Paso 16 · Revisión (falta la revisión manual)
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
