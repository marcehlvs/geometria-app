import { useState } from 'react';
import ModuloLayout from '../../components/ModuloLayout.jsx';
import StepNav from '../../components/StepNav.jsx';
import Slider from '../../components/Slider.jsx';
import Quiz from '../../components/Quiz.jsx';
import NumInput from '../../components/NumInput.jsx';
import Formula from '../../components/Formula.jsx';
import Poliedro3D from '../../components/Poliedro3D.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { POLIEDROS, REGULARES, EULER, CONTRAEJEMPLO_EULER } from '../../data/cuerpos.js';
import { euler } from '../../utils/geometry.js';
import { parseNum } from '../../utils/format.js';

// Cuerpos que el estudiante cuenta en el paso 1 (todos se dibujan en 3D).
const IDS_TABLA = ['cubo', 'prisma-triangular', 'piramide-cuadrada', 'tetraedro', 'prisma-pentagonal'];
const CORTO = {
  cubo: 'Cubo',
  'prisma-triangular': 'Prisma triangular',
  'piramide-cuadrada': 'Pirámide cuadrada',
  tetraedro: 'Tetraedro',
  'prisma-pentagonal': 'Prisma pentagonal',
};
const CAMPOS = [
  { id: 'C', nombre: 'Caras' },
  { id: 'V', nombre: 'Vértices' },
  { id: 'A', nombre: 'Aristas' },
];
const MODOS = [
  { id: 'caras', texto: 'Caras' },
  { id: 'aristas', texto: 'Aristas' },
  { id: 'vertices', texto: 'Vértices' },
];
const DATOS = Object.fromEntries(POLIEDROS.map((p) => [p.id, p]));

const colorBoton = (activo) =>
  activo ? 'border-teal-600 bg-teal-600 text-white' : 'border-slate-200 bg-white text-slate-700 active:bg-slate-100';

export default function Euler({ onVolver }) {
  const { marcarCompletado } = useApp();

  // ----- Paso 1: contar y completar la tabla -----
  const [elegido, setElegido] = useState('cubo');
  const [resalte, setResalte] = useState('vertices');
  const [giro, setGiro] = useState(30);
  const [texto, setTexto] = useState({}); // { 'cubo-C': '6', ... }
  const [estado, setEstado] = useState({}); // { 'cubo-C': 'ok' | 'mal' }

  // ----- Pasos siguientes -----
  const [relacionOk, setRelacionOk] = useState(false);
  const [aristasOk, setAristasOk] = useState(false);
  const [existeOk, setExisteOk] = useState(false);
  const [regularesOk, setRegularesOk] = useState(false);
  const [agujeroOk, setAgujeroOk] = useState(false);

  const celdas = IDS_TABLA.flatMap((id) => CAMPOS.map((c) => ({ k: `${id}|${c.id}`, id, campo: c.id })));
  const tablaOk = celdas.every(({ k }) => estado[k] === 'ok');
  const correctas = celdas.filter(({ k }) => estado[k] === 'ok').length;
  const hayErrores = celdas.some(({ k }) => estado[k] === 'mal');

  const comprobarTabla = () => {
    const nuevo = {};
    celdas.forEach(({ k, id, campo }) => {
      if (estado[k] === 'ok') {
        nuevo[k] = 'ok';
        return;
      }
      const n = parseNum(texto[k] ?? '');
      if (Number.isNaN(n)) return; // vacío: sin marcar
      nuevo[k] = n === DATOS[id][campo] ? 'ok' : 'mal';
    });
    setEstado(nuevo);
  };

  const terminar = () => {
    marcarCompletado('euler');
    onVolver();
  };

  const pasos = [
    {
      titulo: 'Contá y completá',
      bloqueado: !tablaOk,
      contenido: (
        <>
          <p className="text-slate-600">
            Elegí un cuerpo, mirá el modelo y <strong>contá</strong> sus caras (C), vértices (V) y aristas (A). Completá toda la tabla.
          </p>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap gap-2" role="group" aria-label="Cuerpo a mirar">
              {IDS_TABLA.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setElegido(id)}
                  aria-pressed={elegido === id}
                  className={`min-h-11 rounded-xl border-2 px-3 text-sm font-semibold transition ${colorBoton(elegido === id)}`}
                >
                  {CORTO[id]}
                </button>
              ))}
            </div>
            <Poliedro3D id={elegido} giro={giro} resalte={resalte} />
            <div className="flex gap-2" role="group" aria-label="Resaltar">
              {MODOS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setResalte(m.id)}
                  aria-pressed={resalte === m.id}
                  className={`min-h-11 flex-1 rounded-xl border-2 px-2 text-sm font-semibold transition ${colorBoton(resalte === m.id)}`}
                >
                  {m.texto}
                </button>
              ))}
            </div>
            <div className="mt-2">
              <Slider etiqueta="Girar el cuerpo" valor={giro} onChange={setGiro} min={-180} max={180} paso={10} unidad="°" />
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 text-sm text-slate-500">
                  <th className="p-2 font-medium">Cuerpo</th>
                  {CAMPOS.map((c) => (
                    <th key={c.id} className="p-2 text-center font-medium">
                      {c.id}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {IDS_TABLA.map((id) => (
                  <tr key={id} className="border-b border-slate-100 last:border-0">
                    <th scope="row" className="p-2 text-sm font-semibold">
                      {CORTO[id]}
                    </th>
                    {CAMPOS.map((c) => {
                      const k = `${id}|${c.id}`;
                      const e = estado[k];
                      return (
                        <td key={c.id} className="p-1">
                          <input
                            type="text"
                            inputMode="numeric"
                            autoComplete="off"
                            aria-label={`${c.nombre} de ${CORTO[id]}`}
                            value={texto[k] ?? ''}
                            readOnly={e === 'ok'}
                            onChange={(ev) => {
                              setTexto((t) => ({ ...t, [k]: ev.target.value }));
                              if (e === 'mal') setEstado((s) => ({ ...s, [k]: undefined }));
                            }}
                            className={`h-11 w-full min-w-12 rounded-lg border-2 text-center text-lg outline-none ${
                              e === 'ok' ? 'border-green-500 bg-green-50' : e === 'mal' ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-white'
                            }`}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            onClick={comprobarTabla}
            className="h-12 w-full rounded-xl bg-teal-600 px-4 font-semibold text-white active:bg-teal-700"
          >
            Comprobar tabla
          </button>
          <p aria-live="polite" className="min-h-6">
            {tablaOk ? (
              <span className="text-green-700">✅ ¡Toda la tabla está bien!</span>
            ) : hayErrores ? (
              <span className="text-red-600">
                Hay números que no coinciden (en rojo). Volvé a contar con el modelo. Van {correctas} de {celdas.length} bien.
              </span>
            ) : correctas > 0 ? (
              <span className="text-slate-600">
                Van {correctas} de {celdas.length} bien.
              </span>
            ) : null}
          </p>
        </>
      ),
    },
    {
      titulo: 'Sumá y comparé',
      bloqueado: !relacionOk,
      contenido: (
        <>
          <p className="text-slate-600">
            Con tus números, calculá <strong>C + V</strong> por un lado y <strong>A + 2</strong> por el otro. ¿Qué notás?
          </p>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 text-sm text-slate-500">
                  <th className="p-2 font-medium">Cuerpo</th>
                  <th className="p-2 text-center font-medium">C + V</th>
                  <th className="p-2 text-center font-medium">A + 2</th>
                </tr>
              </thead>
              <tbody>
                {IDS_TABLA.map((id) => {
                  const d = DATOS[id];
                  return (
                    <tr key={id} className="border-b border-slate-100 last:border-0">
                      <th scope="row" className="p-2 text-sm font-semibold">
                        {CORTO[id]}
                      </th>
                      <td className="p-2 text-center tabular-nums">
                        {d.C} + {d.V} = <strong>{d.C + d.V}</strong>
                      </td>
                      <td className="p-2 text-center tabular-nums">
                        {d.A} + 2 = <strong>{d.A + 2}</strong>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Quiz
            pregunta="¿Qué relación se cumple en todos los cuerpos de la tabla?"
            opciones={['C + V = A', 'C + V = A + 2', 'C + A = V + 2']}
            correcta={1}
            explicacion="Siempre coinciden: es la fórmula de Euler para poliedros."
            onResolver={() => setRelacionOk(true)}
          />
          <div className="rounded-2xl border border-slate-200 bg-white p-3 text-center">
            <Formula block tex={EULER.tex} />
            <p className="text-sm text-slate-500">C = caras · V = vértices · A = aristas</p>
          </div>
        </>
      ),
    },
    {
      titulo: 'Usá la fórmula para predecir',
      bloqueado: !(aristasOk && existeOk),
      contenido: (
        <>
          <p className="text-slate-600">
            Ya no hace falta contar todo: si conocés dos números, el tercero sale de <Formula tex={EULER.tex} />.
          </p>
          <NumInput
            etiqueta="Un poliedro tiene 7 caras y 10 vértices. ¿Cuántas aristas tiene?"
            correcto={euler.aristas(7, 10)}
            pista="A = C + V − 2."
            onResultado={() => setAristasOk(true)}
          />
          <Quiz
            pregunta="¿Puede existir un poliedro con 5 caras, 6 vértices y 8 aristas?"
            opciones={['Sí, existe', 'No, no puede existir']}
            correcta={1}
            explicacion={`C + V = 5 + 6 = 11, pero A + 2 = 8 + 2 = 10. No coinciden, así que no existe ningún poliedro así.`}
            onResolver={() => setExisteOk(true)}
          />
        </>
      ),
    },
    {
      titulo: 'Los 5 poliedros regulares',
      bloqueado: !regularesOk,
      contenido: (
        <>
          <p className="text-slate-600">
            Un poliedro es <strong>regular</strong> si todas sus caras son polígonos regulares iguales y en cada vértice se juntan la misma cantidad de caras. Euler también se cumple en ellos.
          </p>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="p-2 font-medium">Poliedro</th>
                  <th className="p-2 font-medium">Cara</th>
                  <th className="p-2 text-center font-medium">En cada vértice</th>
                  <th className="p-2 text-center font-medium">C</th>
                  <th className="p-2 text-center font-medium">V</th>
                  <th className="p-2 text-center font-medium">A</th>
                </tr>
              </thead>
              <tbody>
                {REGULARES.map((r) => (
                  <tr key={r.id} className="border-b border-slate-100 last:border-0">
                    <th scope="row" className="p-2 font-semibold">
                      {r.nombre}
                    </th>
                    <td className="p-2">{r.cara}</td>
                    <td className="p-2 text-center">{r.porVertice}</td>
                    <td className="p-2 text-center tabular-nums">{r.C}</td>
                    <td className="p-2 text-center tabular-nums">{r.V}</td>
                    <td className="p-2 text-center tabular-nums">{r.A}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Quiz
            pregunta="¿Cuántos poliedros regulares existen?"
            opciones={['3', '5', '8']}
            correcta={1}
            explicacion="Solo 5: tetraedro, cubo, octaedro, dodecaedro e icosaedro. No hay más formas de juntar polígonos regulares iguales alrededor de un vértice."
            onResolver={() => setRegularesOk(true)}
          />
        </>
      ),
    },
    {
      titulo: 'Curiosidad: un cuerpo con agujero',
      bloqueado: !agujeroOk,
      contenido: (
        <>
          <p className="text-slate-600">
            La fórmula tiene una condición: el cuerpo <strong>no puede tener agujeros</strong> que lo atraviesen. Mirá un marco de cuadro:
          </p>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <h3 className="font-bold">{CONTRAEJEMPLO_EULER.nombre}</h3>
            <p className="mt-1 tabular-nums text-slate-700">
              C = {CONTRAEJEMPLO_EULER.C} · V = {CONTRAEJEMPLO_EULER.V} · A = {CONTRAEJEMPLO_EULER.A}
            </p>
            <p className="mt-1 text-slate-700">
              C + V = {CONTRAEJEMPLO_EULER.C + CONTRAEJEMPLO_EULER.V} y A + 2 = {CONTRAEJEMPLO_EULER.A + 2}.
            </p>
          </div>
          <Quiz
            pregunta="En el marco, ¿cuánto da C + V − A?"
            opciones={['2', '0', '16']}
            correcta={1}
            explicacion="16 + 16 − 32 = 0. En los poliedros sin agujeros siempre da 2; con un agujero da 0."
            onResolver={() => setAgujeroOk(true)}
          />
        </>
      ),
    },
    {
      titulo: '¡Listo!',
      contenido: (
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="font-semibold">Para recordar:</p>
          <Formula block tex={EULER.tex} />
          <ul className="mt-2 list-disc space-y-1 pl-6 text-slate-700">
            <li>Vale en todos los poliedros sin agujeros, sean prismas, pirámides o regulares.</li>
            <li>Si conocés dos números (C, V o A), calculás el tercero.</li>
            <li>Si no se cumple, el cuerpo no existe o tiene un agujero.</li>
            <li>No sirve para cilindros, conos ni esferas: no son poliedros.</li>
          </ul>
        </div>
      ),
    },
  ];

  return (
    <ModuloLayout titulo="Fórmula de Euler" icono="🔢" onVolver={onVolver}>
      <StepNav pasos={pasos} onFinish={terminar} textoFinal="Terminar ✓" />
    </ModuloLayout>
  );
}
