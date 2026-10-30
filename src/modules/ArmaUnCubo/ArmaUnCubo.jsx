import { useEffect, useMemo, useRef, useState } from 'react';
import ModuloLayout from '../../components/ModuloLayout.jsx';
import StepNav from '../../components/StepNav.jsx';
import Slider from '../../components/Slider.jsx';
import Quiz from '../../components/Quiz.jsx';
import Net3D, { PALETA } from '../../components/Net3D.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { CRUZ, FAMILIAS, VALIDOS, elegirRonda } from '../../data/cuboNets.js';
import { nuevaSemilla } from '../../utils/rand.js';

const RONDAS = 6;

// ---------- Desarrollo en 2D (SVG) ----------
//   coloreado  pinta cada cuadrado según la cara del cubo donde cae
//   marcar     índices de celdas que se superponen (borde rojo)
function Plano2D({ figura, lado = 44, coloreado = false, marcar = [], etiqueta }) {
  const { celdas, caraPorCelda } = figura;
  const ancho = Math.max(...celdas.map((c) => c[0])) + 1;
  const alto = Math.max(...celdas.map((c) => c[1])) + 1;
  const orden = [];
  caraPorCelda.forEach((f) => {
    if (!orden.includes(f)) orden.push(f);
  });
  return (
    <svg
      viewBox={`-2 -2 ${ancho * lado + 4} ${alto * lado + 4}`}
      width={ancho * lado + 4}
      height={alto * lado + 4}
      className="mx-auto max-w-full"
      role="img"
      aria-label={etiqueta}
    >
      {celdas.map(([x, y], i) => (
        <rect
          key={i}
          x={x * lado}
          y={y * lado}
          width={lado}
          height={lado}
          rx="3"
          fill={coloreado ? PALETA[orden.indexOf(caraPorCelda[i]) % PALETA.length] : '#e2e8f0'}
          stroke={marcar.includes(i) ? '#dc2626' : '#0f766e'}
          strokeWidth={marcar.includes(i) ? 4 : 2}
        />
      ))}
    </svg>
  );
}

const botonPrimario = 'h-12 w-full rounded-xl bg-teal-600 px-4 font-semibold text-white active:bg-teal-700';

export default function ArmaUnCubo({ onVolver, semilla }) {
  const { marcarCompletado } = useApp();

  // ----- Paso 1: plegar la cruz -----
  const [tCruz, setTCruz] = useState(0);
  const [animarCruz, setAnimarCruz] = useState(false);
  const [plegoCruz, setPlegoCruz] = useState(false);

  // ----- Paso 2: el desafío -----
  const [semillaJuego, setSemillaJuego] = useState(() => semilla ?? nuevaSemilla());
  const ronda = useMemo(() => elegirRonda(semillaJuego, RONDAS), [semillaJuego]);
  const [idx, setIdx] = useState(0);
  const [respuesta, setRespuesta] = useState(null); // null | true | false
  const [aciertos, setAciertos] = useState(0);
  const [jugado, setJugado] = useState(false);
  const [t, setT] = useState(0);
  const [animar, setAnimar] = useState(false);

  // ----- Paso 3 -----
  const [quizOk, setQuizOk] = useState(false);

  const temporizador = useRef(null);
  useEffect(() => () => clearTimeout(temporizador.current), []);

  const figura = ronda[idx];
  const ultima = idx === ronda.length - 1;

  const plegar = (destino, setValor, setAnim) => {
    setAnim(true);
    setValor(destino);
    clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => setAnim(false), 1000);
  };

  const responder = (dice) => {
    if (respuesta !== null) return;
    setRespuesta(dice);
    if (dice === figura.valido) setAciertos((a) => a + 1);
    if (ultima) setJugado(true);
    // para comprobar: se pliega solo
    setT(0);
    setAnimar(false);
    clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => plegar(1, setT, setAnimar), 400);
  };

  const siguiente = () => {
    clearTimeout(temporizador.current);
    setIdx((i) => i + 1);
    setRespuesta(null);
    setT(0);
    setAnimar(false);
  };

  const jugarDeNuevo = () => {
    clearTimeout(temporizador.current);
    setSemillaJuego(nuevaSemilla());
    setIdx(0);
    setRespuesta(null);
    setAciertos(0);
    setT(0);
    setAnimar(false);
  };

  const terminar = () => {
    marcarCompletado('arma-cubo');
    onVolver();
  };

  const acerto = respuesta !== null && respuesta === figura.valido;

  const pasos = [
    {
      titulo: 'Plegá la cruz',
      bloqueado: !plegoCruz,
      contenido: (
        <>
          <p className="text-slate-600">
            Este desarrollo está formado por <strong>6 cuadrados</strong>. Llevá el deslizador hasta <strong>100 %</strong> y mirá si se cierra un cubo.
          </p>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <Net3D desarrollo={CRUZ.desarrollo} t={tCruz} giroVista={-25} colorear animar={animarCruz} etiqueta="Cruz de 6 cuadrados" />
            <div className="mt-3 space-y-2">
              <Slider
                etiqueta="Plegar"
                valor={Math.round(tCruz * 100)}
                onChange={(v) => {
                  setAnimarCruz(false);
                  setTCruz(v / 100);
                  if (v >= 100) setPlegoCruz(true);
                }}
                min={0}
                max={100}
                paso={5}
                unidad="%"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    plegar(1, setTCruz, setAnimarCruz);
                    setPlegoCruz(true);
                  }}
                  className="h-11 flex-1 rounded-xl bg-teal-600 font-semibold text-white active:bg-teal-700"
                >
                  Plegar solo
                </button>
                <button
                  type="button"
                  onClick={() => plegar(0, setTCruz, setAnimarCruz)}
                  className="h-11 flex-1 rounded-xl border-2 border-teal-600 font-semibold text-teal-700 active:bg-teal-50"
                >
                  Desplegar
                </button>
              </div>
            </div>
          </div>
          <p className="rounded-lg bg-amber-50 p-2 text-amber-900">
            Cada cuadrado pasa a ser <strong>una cara</strong> y cada una queda de un color distinto. Si el desarrollo arma un cubo, las 6 caras quedan distintas.
          </p>
        </>
      ),
    },
    {
      titulo: '¿Arma un cubo?',
      bloqueado: !jugado,
      contenido: (
        <>
          <p className="text-slate-600">
            Mirá el desarrollo y decidí: ¿se puede plegar para formar un cubo? Después lo comprobamos plegándolo.
          </p>

          <div className="flex items-center justify-between text-sm font-medium text-slate-600" aria-live="polite">
            <span>
              Desarrollo {idx + 1} de {ronda.length}
            </span>
            <span>Aciertos: {aciertos}</span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <Plano2D
              key={`${semillaJuego}-${idx}`}
              figura={figura}
              coloreado={respuesta !== null}
              marcar={respuesta !== null && !figura.valido ? figura.repetidas.flat() : []}
              etiqueta="Desarrollo plano de 6 cuadrados"
            />

            {respuesta === null ? (
              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button type="button" onClick={() => responder(true)} className="min-h-12 rounded-xl border-2 border-teal-600 px-3 font-semibold text-teal-800 active:bg-teal-50">
                  ✅ Sí, arma un cubo
                </button>
                <button type="button" onClick={() => responder(false)} className="min-h-12 rounded-xl border-2 border-slate-300 px-3 font-semibold text-slate-700 active:bg-slate-100">
                  ❌ No, no arma un cubo
                </button>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                <p className={`rounded-lg p-2 font-semibold ${acerto ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-700'}`} aria-live="polite">
                  {acerto ? '✅ ¡Bien!' : '❌ No era así.'}{' '}
                  {figura.valido
                    ? 'Sí arma un cubo: los 6 cuadrados caen sobre 6 caras distintas.'
                    : `No arma un cubo: los cuadrados marcados en rojo caen sobre la misma cara y ${
                        figura.faltan === 1 ? 'queda 1 cara sin cubrir' : `quedan ${figura.faltan} caras sin cubrir`
                      }.`}
                </p>
                <Net3D desarrollo={figura.desarrollo} t={t} giroVista={-25} colorear animar={animar} etiqueta="Comprobación plegando el desarrollo" />
                <Slider
                  etiqueta="Plegar"
                  valor={Math.round(t * 100)}
                  onChange={(v) => {
                    setAnimar(false);
                    setT(v / 100);
                  }}
                  min={0}
                  max={100}
                  paso={5}
                  unidad="%"
                />
                {!ultima ? (
                  <button type="button" onClick={siguiente} className={botonPrimario}>
                    Siguiente desarrollo →
                  </button>
                ) : (
                  <div className="rounded-xl bg-teal-50 p-3 text-center">
                    <p className="text-lg font-bold text-teal-800">
                      Terminaste: {aciertos} de {ronda.length}
                    </p>
                    <button type="button" onClick={jugarDeNuevo} className="mt-2 h-11 rounded-xl border-2 border-teal-600 px-4 font-semibold text-teal-700 active:bg-teal-100">
                      Jugar de nuevo
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      ),
    },
    {
      titulo: 'Los 11 desarrollos del cubo',
      bloqueado: !quizOk,
      contenido: (
        <>
          <p className="text-slate-600">
            Con 6 cuadrados se pueden armar 35 figuras distintas, pero <strong>solo 11</strong> se pliegan en un cubo.
          </p>
          <div className="space-y-3">
            {FAMILIAS.map((fam) => (
              <div key={fam.id} className="rounded-2xl border border-slate-200 bg-white p-3">
                <h3 className="font-bold">{fam.titulo}</h3>
                <div className="mt-2 flex flex-wrap items-end gap-3">
                  {VALIDOS.filter((v) => v.familia === fam.id).map((v) => (
                    <Plano2D key={v.id} figura={v} lado={20} coloreado etiqueta={`Desarrollo del cubo, familia ${fam.id}`} />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <ul className="list-disc space-y-1 pl-6 text-slate-700">
            <li>Una fila de 4 con un cuadrado arriba y otro abajo (en cualquier lugar) <strong>siempre</strong> arma un cubo.</li>
            <li>Si hay 4 cuadrados formando un bloque de 2 × 2, <strong>nunca</strong> arma.</li>
          </ul>
          <Quiz
            pregunta="¿Cuántos desarrollos distintos tiene el cubo (sin contar giros ni espejos)?"
            opciones={['6', '11', '35']}
            correcta={1}
            explicacion="Hay 35 figuras de 6 cuadrados, pero solo 11 se pliegan en un cubo."
            onResolver={() => setQuizOk(true)}
          />
        </>
      ),
    },
    {
      titulo: '¡Listo!',
      contenido: (
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="font-semibold">Para recordar:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6 text-slate-700">
            <li>Un cubo tiene 6 caras: el desarrollo necesita 6 cuadrados unidos por los lados.</li>
            <li>Si al plegar dos cuadrados caen sobre la misma cara, no arma un cubo.</li>
            <li>Existen 11 desarrollos distintos del cubo.</li>
          </ul>
        </div>
      ),
    },
  ];

  return (
    <ModuloLayout titulo="¿Arma un cubo?" icono="🎲" onVolver={onVolver}>
      <StepNav pasos={pasos} onFinish={terminar} textoFinal="Terminar ✓" />
    </ModuloLayout>
  );
}
