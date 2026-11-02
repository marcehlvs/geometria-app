// Problemas de resolución (Paso 14).
//
// Cada plantilla se parametriza con un generador de números aleatorios con
// semilla (utils/rand.js): la misma semilla da siempre el mismo problema
// («Problema #4821»), y otra semilla da números distintos.
//
//   { id, tema, anios, titulo,
//     generar(r)            -> datos del problema
//     enunciado(datos)      -> texto
//     resolver(datos, ctx)  -> pasos [{ texto, tex, valor, unidad }]; el último es la respuesta
//     pistas                -> [string, string]
//     usaPi?                -> true si el resultado depende de π
//     distractores?         -> unidades equivocadas para las opciones (si la unidad no es de longitud) }
//
//   const problema = crearProblema(plantilla, 4821, { pi: 3.14, piEscolar: true });
//   corregir(problema, '12,5', 'm²') -> { estado, mensaje }

import { crearAleatorio } from '../utils/rand.js';
import { fmt, texNum, parseNum, casiIgual } from '../utils/format.js';
import { PITAGORAS } from './figuras.js';
import { POLIEDROS } from './cuerpos.js';

export const TEMAS_PROBLEMAS = [
  { id: 'figuras-planas', titulo: 'Figuras planas', icono: '🔷' },
  { id: 'pitagoras', titulo: 'Pitágoras', icono: '📐' },
  { id: 'cuerpos', titulo: 'Cuerpos', icono: '🧊' },
  { id: 'euler', titulo: 'Euler', icono: '✨' },
  { id: 'unidades', titulo: 'Unidades', icono: '📏' },
];

const n = (x) => texNum(x, 2);
const r6 = (x) => Math.round(x * 1e6) / 1e6; // saca los restos de la coma flotante (0,1 + 0,2)
const paso = (texto, tex, valor, unidad) => ({ texto, tex, valor: r6(valor), unidad });
const piTex = (ctx) => (ctx.piEscolar ? n(ctx.pi) : '\\pi');

// Una terna pitagórica, a veces ampliada al doble: [cateto, cateto, hipotenusa]
const ternaAleatoria = (r) => {
  const k = r.pick([1, 2]);
  return r.pick(PITAGORAS.ternas).map((x) => x * k);
};

// Helpers que también usa el modo evaluación (data/evaluacion.js)
export { n as texNumero, r6, piTex };

const ANIOS_TODOS = [1, 2];

export const PROBLEMAS = [
  // ====================== FIGURAS PLANAS ======================
  {
    id: 'patio-baldosas',
    tema: 'figuras-planas',
    anios: ANIOS_TODOS,
    titulo: 'Patio con baldosas',
    generar: (r) => ({ largo: r.int(6, 12), ancho: r.int(3, 8), ladoCm: r.pick([20, 25, 50]) }),
    enunciado: ({ largo, ancho, ladoCm }) =>
      `Un patio rectangular mide ${largo} m por ${ancho} m. Se lo quiere cubrir con baldosas cuadradas de ${ladoCm} cm de lado. ¿Cuántas baldosas hacen falta?`,
    resolver: ({ largo, ancho, ladoCm }) => {
      const areaPatio = largo * ancho;
      const lado = ladoCm / 100;
      const areaBaldosa = r6(lado * lado);
      return [
        paso('Área del patio', `A = ${n(largo)} \\cdot ${n(ancho)}`, areaPatio, 'm²'),
        paso('Área de una baldosa (pasamos el lado a metros)', `A = ${texNum(lado, 4)}^2`, areaBaldosa, 'm²'),
        paso('Cantidad de baldosas', `n = ${n(areaPatio)} : ${texNum(areaBaldosa, 4)}`, areaPatio / areaBaldosa, 'baldosas'),
      ];
    },
    pistas: ['Pasá los cm a m antes de calcular.', 'Dividí el área del patio por el área de una baldosa.'],
    distractores: ['m²', 'cm²', 'm'],
  },
  {
    id: 'cancha-vueltas',
    tema: 'figuras-planas',
    anios: ANIOS_TODOS,
    titulo: 'Vueltas a la cancha',
    generar: (r) => ({ largo: r.pick([90, 100, 105, 110]), ancho: r.pick([60, 65, 70, 75]), vueltas: r.int(2, 5) }),
    enunciado: ({ largo, ancho, vueltas }) =>
      `Una cancha de fútbol mide ${largo} m de largo y ${ancho} m de ancho. En el entrenamiento, un jugador da ${vueltas} vueltas completas corriendo por el borde de la cancha. ¿Cuántos metros corre en total?`,
    resolver: ({ largo, ancho, vueltas }) => {
      const perimetro = 2 * (largo + ancho);
      return [
        paso('Perímetro de la cancha (una vuelta)', `P = 2 \\cdot (${n(largo)} + ${n(ancho)})`, perimetro, 'm'),
        paso('Total de metros', `${n(perimetro)} \\cdot ${n(vueltas)}`, perimetro * vueltas, 'm'),
      ];
    },
    pistas: ['El borde de la cancha es su perímetro.', 'Calculá una vuelta y después multiplicá por la cantidad de vueltas.'],
  },
  {
    id: 'cartel-triangular',
    tema: 'figuras-planas',
    anios: ANIOS_TODOS,
    titulo: 'Cartel triangular',
    generar: (r) => ({ base: r.pick([40, 60, 80, 100, 120]), altura: r.int(30, 70) }),
    enunciado: ({ base, altura }) =>
      `Un cartel con forma de triángulo mide ${base} cm de base y ${altura} cm de altura. ¿Cuál es el área de su superficie?`,
    resolver: ({ base, altura }) => [
      paso('Área del triángulo', `A = \\dfrac{${n(base)} \\cdot ${n(altura)}}{2}`, (base * altura) / 2, 'cm²'),
    ],
    pistas: ['El área de un triángulo es la mitad de base por altura.', 'Multiplicá base por altura y después dividí por 2.'],
  },
  {
    id: 'carpa-trapecio',
    tema: 'figuras-planas',
    anios: ANIOS_TODOS,
    titulo: 'Entrada de la carpa',
    generar: (r) => ({ mayor: r.pick([6, 8, 10]), menor: r.pick([2, 4]), altura: r.int(2, 4) }),
    enunciado: ({ mayor, menor, altura }) =>
      `La entrada de una carpa tiene forma de trapecio: la base mayor mide ${mayor} m, la base menor ${menor} m y la altura ${altura} m. ¿Cuántos m² de tela se necesitan para cubrirla?`,
    resolver: ({ mayor, menor, altura }) => [
      paso('Suma de las bases', `B + b = ${n(mayor)} + ${n(menor)}`, mayor + menor, 'm'),
      paso('Área del trapecio', `A = \\dfrac{${n(mayor + menor)} \\cdot ${n(altura)}}{2}`, ((mayor + menor) * altura) / 2, 'm²'),
    ],
    pistas: ['Área del trapecio = (base mayor + base menor) · altura : 2.', 'Primero sumá las dos bases.'],
  },
  {
    id: 'pileta-cinta',
    tema: 'figuras-planas',
    anios: ANIOS_TODOS,
    titulo: 'Borde de la pileta circular',
    usaPi: true,
    generar: (r) => ({ radio: r.int(2, 6) }),
    enunciado: ({ radio }) =>
      `Una pileta circular tiene ${radio} m de radio. ¿Cuántos metros de cinta de seguridad hacen falta para rodear todo su borde?`,
    resolver: ({ radio }, ctx) => [
      paso('Longitud de la circunferencia', `L = 2 \\cdot ${piTex(ctx)} \\cdot ${n(radio)}`, 2 * ctx.pi * radio, 'm'),
    ],
    pistas: ['El borde de un círculo es su circunferencia.', 'Longitud = 2 · π · radio.'],
  },
  {
    id: 'pileta-lona',
    tema: 'figuras-planas',
    anios: ANIOS_TODOS,
    titulo: 'Lona para la pileta',
    usaPi: true,
    generar: (r) => ({ radio: r.int(2, 6) }),
    enunciado: ({ radio }) => `¿Cuántos m² de lona hacen falta para cubrir una pileta circular de ${radio} m de radio?`,
    resolver: ({ radio }, ctx) => [
      paso('Área del círculo', `A = ${piTex(ctx)} \\cdot ${n(radio)}^2`, ctx.pi * radio * radio, 'm²'),
    ],
    pistas: ['Tenés que calcular la superficie del círculo.', 'Área = π · radio², y el radio va al cuadrado.'],
  },

  // ====================== PITÁGORAS ======================
  {
    id: 'escalera-pared',
    tema: 'pitagoras',
    anios: [2],
    titulo: 'Escalera y pared',
    generar: (r) => {
      const [a, b, c] = ternaAleatoria(r);
      const conocidoPrimero = r.pick([true, false]);
      return { largo: c, distancia: conocidoPrimero ? a : b, altura: conocidoPrimero ? b : a };
    },
    enunciado: ({ largo, distancia }) =>
      `Una escalera de ${largo} m de largo está apoyada en una pared. El pie de la escalera está a ${distancia} m de la pared. ¿A qué altura de la pared llega la escalera?`,
    resolver: ({ largo, distancia, altura }) => [
      paso('Cuadrado de la hipotenusa (la escalera)', `${n(largo)}^2`, largo * largo, 'm²'),
      paso('Cuadrado del cateto conocido', `${n(distancia)}^2`, distancia * distancia, 'm²'),
      paso('Cuadrado del cateto buscado', `h^2 = ${n(largo * largo)} - ${n(distancia * distancia)}`, largo * largo - distancia * distancia, 'm²'),
      paso('Altura (raíz cuadrada)', `h = \\sqrt{${n(largo * largo - distancia * distancia)}}`, altura, 'm'),
    ],
    pistas: [
      'La escalera, la pared y el piso forman un triángulo rectángulo: la escalera es la hipotenusa.',
      'Un cateto al cuadrado es la hipotenusa al cuadrado menos el otro cateto al cuadrado.',
    ],
  },
  {
    id: 'galpon-diagonal',
    tema: 'pitagoras',
    anios: [2],
    titulo: 'Diagonal de la puerta',
    generar: (r) => {
      const [a, b, c] = ternaAleatoria(r);
      return { ancho: a, alto: b, diagonal: c };
    },
    enunciado: ({ ancho, alto }) => `La puerta de un galpón mide ${ancho} m de ancho y ${alto} m de alto. ¿Cuánto mide su diagonal?`,
    resolver: ({ ancho, alto, diagonal }) => [
      paso('Cuadrado del ancho', `${n(ancho)}^2`, ancho * ancho, 'm²'),
      paso('Cuadrado del alto', `${n(alto)}^2`, alto * alto, 'm²'),
      paso('Suma de los cuadrados', `${n(ancho * ancho)} + ${n(alto * alto)}`, ancho * ancho + alto * alto, 'm²'),
      paso('Diagonal (raíz cuadrada)', `d = \\sqrt{${n(ancho * ancho + alto * alto)}}`, diagonal, 'm'),
    ],
    pistas: ['La diagonal de un rectángulo es la hipotenusa del triángulo que forma con dos lados.', 'Hipotenusa = raíz de (cateto² + cateto²).'],
  },
  {
    id: 'rampa-inclinada',
    tema: 'pitagoras',
    anios: [2],
    titulo: 'Rampa',
    generar: (r) => {
      const [a, b, c] = ternaAleatoria(r);
      return { desnivel: a, piso: b, rampa: c };
    },
    enunciado: ({ desnivel, piso }) =>
      `Una rampa salva un desnivel de ${desnivel} m y se apoya sobre ${piso} m de piso horizontal. ¿Cuántos metros mide el tramo inclinado de la rampa?`,
    resolver: ({ desnivel, piso, rampa }) => [
      paso('Cuadrado del desnivel', `${n(desnivel)}^2`, desnivel * desnivel, 'm²'),
      paso('Cuadrado del piso', `${n(piso)}^2`, piso * piso, 'm²'),
      paso('Suma de los cuadrados', `${n(desnivel * desnivel)} + ${n(piso * piso)}`, desnivel * desnivel + piso * piso, 'm²'),
      paso('Largo de la rampa (raíz cuadrada)', `c = \\sqrt{${n(desnivel * desnivel + piso * piso)}}`, rampa, 'm'),
    ],
    pistas: ['El desnivel y el piso forman un ángulo recto: la rampa es la hipotenusa.', 'Sumá los cuadrados de los dos catetos y calculá la raíz.'],
  },

  // ====================== CUERPOS ======================
  {
    id: 'caja-zapatillas',
    tema: 'cuerpos',
    anios: ANIOS_TODOS,
    titulo: 'Caja de zapatillas',
    generar: (r) => ({ largo: r.int(28, 34), ancho: r.int(18, 22), alto: r.int(10, 14) }),
    enunciado: ({ largo, ancho, alto }) =>
      `Una caja de zapatillas mide ${largo} cm de largo, ${ancho} cm de ancho y ${alto} cm de alto. ¿Cuál es su volumen?`,
    resolver: ({ largo, ancho, alto }) => [
      paso('Volumen del ortoedro', `V = ${n(largo)} \\cdot ${n(ancho)} \\cdot ${n(alto)}`, largo * ancho * alto, 'cm³'),
    ],
    pistas: ['La caja es un ortoedro.', 'Volumen = largo · ancho · alto.'],
  },
  {
    id: 'caja-forrar',
    tema: 'cuerpos',
    anios: ANIOS_TODOS,
    titulo: 'Forrar una caja',
    generar: (r) => ({ largo: r.int(20, 30), ancho: r.int(10, 20), alto: r.int(8, 15) }),
    enunciado: ({ largo, ancho, alto }) =>
      `Se quiere forrar con papel de regalo toda la superficie exterior de una caja de ${largo} cm × ${ancho} cm × ${alto} cm, sin superponer papel. ¿Cuántos cm² de papel se necesitan?`,
    resolver: ({ largo, ancho, alto }) => {
      const a = largo * ancho;
      const b = largo * alto;
      const c = ancho * alto;
      return [
        paso(`Cara de ${n(largo)} × ${n(ancho)}`, `${n(largo)} \\cdot ${n(ancho)}`, a, 'cm²'),
        paso(`Cara de ${n(largo)} × ${n(alto)}`, `${n(largo)} \\cdot ${n(alto)}`, b, 'cm²'),
        paso(`Cara de ${n(ancho)} × ${n(alto)}`, `${n(ancho)} \\cdot ${n(alto)}`, c, 'cm²'),
        paso('Área total (hay dos caras de cada tipo)', `A_T = 2 \\cdot (${n(a)} + ${n(b)} + ${n(c)})`, 2 * (a + b + c), 'cm²'),
      ];
    },
    pistas: ['Una caja tiene 6 caras, iguales de a pares.', 'Calculá el área de las tres caras distintas, sumalas y multiplicá por 2.'],
  },
  {
    id: 'pileta-litros',
    tema: 'cuerpos',
    anios: ANIOS_TODOS,
    titulo: 'Litros de la pileta',
    generar: (r) => ({ largo: r.int(4, 8), ancho: r.int(2, 4), prof: r.pick([1, 1.2, 1.5]) }),
    enunciado: ({ largo, ancho, prof }) =>
      `Una pileta rectangular mide ${largo} m de largo, ${ancho} m de ancho y ${fmt(prof)} m de profundidad. Si se llena hasta el borde, ¿cuántos litros de agua entran?`,
    resolver: ({ largo, ancho, prof }) => {
      const v = largo * ancho * prof;
      return [
        paso('Volumen de la pileta', `V = ${n(largo)} \\cdot ${n(ancho)} \\cdot ${n(prof)}`, v, 'm³'),
        paso('Pasamos a litros (1 m³ = 1000 litros)', `${n(r6(v))} \\cdot 1000`, v * 1000, 'L'),
      ];
    },
    pistas: ['Primero calculá el volumen en m³.', '1 m³ = 1000 dm³ = 1000 litros.'],
    distractores: ['m³', 'm²', 'cm²'],
  },
  {
    id: 'tanque-cilindrico',
    tema: 'cuerpos',
    anios: ANIOS_TODOS,
    titulo: 'Tanque cilíndrico',
    usaPi: true,
    generar: (r) => ({ radio: r.int(4, 8), altura: r.int(8, 15) }),
    enunciado: ({ radio, altura }) =>
      `Un tanque de agua con forma de cilindro tiene ${radio} dm de radio y ${altura} dm de altura. ¿Cuántos litros de agua entran si está lleno?`,
    resolver: ({ radio, altura }, ctx) => {
      const base = ctx.pi * radio * radio;
      return [
        paso('Área de la base', `A_{base} = ${piTex(ctx)} \\cdot ${n(radio)}^2`, base, 'dm²'),
        paso('Volumen del cilindro', `V = ${n(r6(base))} \\cdot ${n(altura)}`, base * altura, 'dm³'),
        paso('Pasamos a litros (1 dm³ = 1 litro)', `${n(r6(base * altura))}\\ \\text{dm}^3 = ${n(r6(base * altura))}\\ \\text{L}`, base * altura, 'L'),
      ];
    },
    pistas: ['Volumen del cilindro = área de la base · altura.', 'Con las medidas en dm, el volumen sale en dm³, y 1 dm³ es 1 litro.'],
    distractores: ['dm²', 'm³', 'cm'],
  },
  {
    id: 'carpa-piramide',
    tema: 'cuerpos',
    anios: ANIOS_TODOS,
    titulo: 'Carpa en pirámide',
    generar: (r) => ({ lado: r.int(3, 6), altura: r.pick([3, 6, 9]) }),
    enunciado: ({ lado, altura }) =>
      `Una carpa tiene forma de pirámide de base cuadrada de ${lado} m de lado y ${altura} m de altura. ¿Cuántos m³ de aire contiene?`,
    resolver: ({ lado, altura }) => [
      paso('Área de la base', `A_{base} = ${n(lado)}^2`, lado * lado, 'm²'),
      paso('Volumen de la pirámide', `V = \\dfrac{${n(lado * lado)} \\cdot ${n(altura)}}{3}`, (lado * lado * altura) / 3, 'm³'),
    ],
    pistas: ['El volumen de una pirámide es la tercera parte del de un prisma con la misma base y altura.', 'V = área de la base · altura : 3.'],
  },
  {
    id: 'cucurucho-cono',
    tema: 'cuerpos',
    anios: ANIOS_TODOS,
    titulo: 'Cucurucho de helado',
    usaPi: true,
    generar: (r) => ({ radio: r.int(2, 5), altura: r.int(6, 12) }),
    enunciado: ({ radio, altura }) =>
      `Un cucurucho tiene forma de cono: ${radio} cm de radio en la boca y ${altura} cm de altura. ¿Cuántos cm³ de helado entran si se lo llena hasta el borde?`,
    resolver: ({ radio, altura }, ctx) => [
      paso('Volumen del cono', `V = \\dfrac{${piTex(ctx)} \\cdot ${n(radio)}^2 \\cdot ${n(altura)}}{3}`, (ctx.pi * radio * radio * altura) / 3, 'cm³'),
    ],
    pistas: ['El cono ocupa la tercera parte del cilindro de igual base y altura.', 'V = π · radio² · altura : 3.'],
  },

  // ====================== EULER ======================
  {
    id: 'euler-aristas',
    tema: 'euler',
    anios: [2],
    titulo: 'Aristas con Euler',
    generar: (r) => {
      const p = r.pick(POLIEDROS);
      return { C: p.C, V: p.V, A: p.A };
    },
    enunciado: ({ C, V }) => `Un poliedro tiene ${C} caras y ${V} vértices. Usando la fórmula de Euler, ¿cuántas aristas tiene?`,
    resolver: ({ C, V, A }) => [
      paso('Despejamos las aristas de C + V = A + 2', `A = ${n(C)} + ${n(V)} - 2`, A, 'aristas'),
    ],
    pistas: ['La fórmula de Euler es C + V = A + 2.', 'Despejá A: A = C + V − 2.'],
    distractores: ['caras', 'vértices', 'm²'],
  },
  {
    id: 'euler-caras',
    tema: 'euler',
    anios: [2],
    titulo: 'Caras con Euler',
    generar: (r) => {
      const p = r.pick(POLIEDROS);
      return { C: p.C, V: p.V, A: p.A };
    },
    enunciado: ({ V, A }) => `Un poliedro tiene ${A} aristas y ${V} vértices. ¿Cuántas caras tiene?`,
    resolver: ({ C, V, A }) => [paso('Despejamos las caras de C + V = A + 2', `C = ${n(A)} + 2 - ${n(V)}`, C, 'caras')],
    pistas: ['La fórmula de Euler es C + V = A + 2.', 'Despejá C: C = A + 2 − V.'],
    distractores: ['aristas', 'vértices', 'm²'],
  },
  {
    id: 'euler-vertices',
    tema: 'euler',
    anios: [2],
    titulo: 'Vértices con Euler',
    generar: (r) => {
      const p = r.pick(POLIEDROS);
      return { C: p.C, V: p.V, A: p.A };
    },
    enunciado: ({ C, A }) => `Un poliedro tiene ${C} caras y ${A} aristas. ¿Cuántos vértices tiene?`,
    resolver: ({ C, V, A }) => [paso('Despejamos los vértices de C + V = A + 2', `V = ${n(A)} + 2 - ${n(C)}`, V, 'vértices')],
    pistas: ['La fórmula de Euler es C + V = A + 2.', 'Despejá V: V = A + 2 − C.'],
    distractores: ['aristas', 'caras', 'm²'],
  },
  {
    id: 'euler-prisma',
    tema: 'euler',
    anios: [2],
    titulo: 'Prisma de n lados',
    generar: (r) => ({ lados: r.int(3, 9) }),
    enunciado: ({ lados }) =>
      `Un prisma tiene por base un polígono de ${lados} lados. Tiene ${lados + 2} caras y ${2 * lados} vértices. ¿Cuántas aristas tiene?`,
    resolver: ({ lados }) => [
      paso('Aristas con la fórmula de Euler', `A = C + V - 2 = ${n(lados + 2)} + ${n(2 * lados)} - 2`, 3 * lados, 'aristas'),
    ],
    pistas: ['Usá C + V = A + 2 con los datos del enunciado.', 'A = C + V − 2.'],
    distractores: ['caras', 'vértices', 'm²'],
  },

  // ====================== UNIDADES ======================
  {
    id: 'tanque-m3-litros',
    tema: 'unidades',
    anios: ANIOS_TODOS,
    titulo: 'Del m³ a los litros',
    generar: (r) => ({ m3: r.pick([1.2, 1.5, 2, 2.5, 3]) }),
    enunciado: ({ m3 }) => `Un tanque de agua tiene una capacidad de ${fmt(m3)} m³. ¿Cuántos litros son?`,
    resolver: ({ m3 }) => [paso('1 m³ = 1000 litros', `${n(m3)} \\cdot 1000`, m3 * 1000, 'L')],
    pistas: ['1 m³ = 1000 dm³ y 1 dm³ = 1 litro.', 'Multiplicá por 1000.'],
    distractores: ['m³', 'm²', 'cm²'],
  },
  {
    id: 'piso-m2-cm2',
    tema: 'unidades',
    anios: ANIOS_TODOS,
    titulo: 'Del m² al cm²',
    generar: (r) => ({ m2: r.pick([0.5, 1.5, 2, 2.5, 3.5]) }),
    enunciado: ({ m2 }) => `Un piso de cerámica cubre ${fmt(m2)} m². ¿Cuántos cm² son?`,
    resolver: ({ m2 }) => [paso('1 m² = 10 000 cm²', `${n(m2)} \\cdot 10000`, m2 * 10000, 'cm²')],
    pistas: ['1 m = 100 cm, entonces 1 m² = 100 · 100 cm².', 'Multiplicá por 10 000.'],
  },
  {
    id: 'botella-cm3-litros',
    tema: 'unidades',
    anios: ANIOS_TODOS,
    titulo: 'De cm³ a litros',
    generar: (r) => ({ cm3: r.pick([500, 750, 1500, 2500, 3000]) }),
    enunciado: ({ cm3 }) => `Una botella tiene un volumen de ${fmt(cm3)} cm³. ¿Cuántos litros de líquido contiene?`,
    resolver: ({ cm3 }) => [paso('1000 cm³ = 1 litro', `${n(cm3)} : 1000`, cm3 / 1000, 'L')],
    pistas: ['1 litro es lo mismo que 1000 cm³.', 'Dividí por 1000.'],
    distractores: ['cm³', 'm³', 'dm²'],
  },
  {
    id: 'cartel-cm2-m2',
    tema: 'unidades',
    anios: ANIOS_TODOS,
    titulo: 'Superficie del cartel',
    generar: (r) => {
      const [base, altura] = r.pick([
        [150, 80],
        [200, 50],
        [120, 50],
        [250, 80],
      ]);
      return { base, altura };
    },
    enunciado: ({ base, altura }) => `Un cartel rectangular mide ${base} cm por ${altura} cm. ¿Cuántos m² de superficie tiene?`,
    resolver: ({ base, altura }) => {
      const cm2 = base * altura;
      return [
        paso('Área en cm²', `A = ${n(base)} \\cdot ${n(altura)}`, cm2, 'cm²'),
        paso('Pasamos a m² (1 m² = 10 000 cm²)', `${n(cm2)} : 10000`, cm2 / 10000, 'm²'),
      ];
    },
    pistas: ['Calculá el área en cm² y después cambiá de unidad.', 'Para pasar de cm² a m² se divide por 10 000.'],
  },
];

// ---------- Consulta ----------
export const plantillasDe = (tema, anio = 0) => PROBLEMAS.filter((p) => p.tema === tema && (!anio || p.anios.includes(anio)));

export const temasDisponibles = (anio = 0) => TEMAS_PROBLEMAS.filter((t) => plantillasDe(t.id, anio).length > 0);

// Elige una plantilla del tema según la semilla (sin repetir la anterior si hay otra)
export function elegirPlantilla(tema, anio, semilla, excluirId = null) {
  const todas = plantillasDe(tema, anio);
  const candidatas = todas.length > 1 ? todas.filter((p) => p.id !== excluirId) : todas;
  return crearAleatorio((semilla + 7919) >>> 0).pick(candidatas);
}

// ---------- Armado ----------
const ESCALAS = /^(mm|cm|dm|m)(²|³)?$/;

// Cuatro unidades para elegir: la correcta y tres equivocadas (de otra dimensión o de otra escala)
export function opcionesDeUnidad(unidad, distractores, r) {
  let opciones;
  const m = ESCALAS.exec(unidad);
  if (m && !distractores) {
    const [, base, exp] = m;
    const otra = base === 'm' ? 'cm' : 'm';
    opciones = [base, `${base}²`, `${base}³`, `${otra}${exp || ''}`];
    if (!opciones.includes(unidad)) opciones[0] = unidad;
  } else {
    opciones = [unidad, ...(distractores || [])];
  }
  return r.shuffle([...new Set(opciones)].slice(0, 4));
}

export function crearProblema(plantilla, semilla, ctx = { pi: 3.14, piEscolar: true }) {
  const r = crearAleatorio(semilla);
  const datos = plantilla.generar(r);
  const pasos = plantilla.resolver(datos, ctx);
  const ultimo = pasos[pasos.length - 1];
  const notaPi = plantilla.usaPi
    ? ctx.piEscolar
      ? ' Usá π = 3,14.'
      : ' Usá la tecla π de la calculadora.'
    : '';
  return {
    plantilla: plantilla.id,
    tema: plantilla.tema,
    titulo: plantilla.titulo,
    semilla,
    datos,
    enunciado: plantilla.enunciado(datos) + notaPi,
    pasos,
    respuesta: { valor: ultimo.valor, unidad: ultimo.unidad },
    opciones: opcionesDeUnidad(ultimo.unidad, plantilla.distractores, r),
    pistas: plantilla.pistas,
    // Con π o con decimales se acepta un 1 % de margen (3,14 contra la tecla π); un entero tiene que ser exacto
    tolerancia: plantilla.usaPi || !Number.isInteger(ultimo.valor) ? 0.01 : 0,
  };
}

// ---------- Corrección ----------
// estado: 'ok' | 'unidad' (número bien, unidad mal) | 'numero' (unidad bien, número mal)
//         | 'mal' | 'sin-unidad' | 'invalido'
export function corregir(problema, texto, unidad) {
  const valor = parseNum(texto);
  if (Number.isNaN(valor)) {
    return { estado: 'invalido', mensaje: 'Escribí un número (podés usar coma para los decimales).' };
  }
  if (!unidad) {
    return { estado: 'sin-unidad', mensaje: 'Elegí la unidad de tu respuesta.' };
  }
  const numeroOk = casiIgual(valor, problema.respuesta.valor, problema.tolerancia);
  const unidadOk = unidad === problema.respuesta.unidad;
  if (numeroOk && unidadOk) return { estado: 'ok', mensaje: '¡Correcto! ✅' };
  if (numeroOk) return { estado: 'unidad', mensaje: 'El número está bien, pero revisá la unidad.' };
  if (unidadOk) return { estado: 'numero', mensaje: 'La unidad está bien, pero el número no coincide. Revisá el cálculo.' };
  return { estado: 'mal', mensaje: 'Todavía no. Probá con una pista.' };
}
