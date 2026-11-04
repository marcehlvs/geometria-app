import { useState } from 'react';
import ModuloLayout from '../../components/ModuloLayout.jsx';
import StepNav from '../../components/StepNav.jsx';
import Slider from '../../components/Slider.jsx';
import Quiz from '../../components/Quiz.jsx';
import NumInput from '../../components/NumInput.jsx';
import Formula from '../../components/Formula.jsx';
import Poliedro3D from '../../components/Poliedro3D.jsx';
import Redondo3D from '../../components/Redondo3D.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { IDS_DIBUJABLES } from '../../utils/solidos3d.js';
import { fmt } from '../../utils/format.js';
import { cm3ALitros } from '../../utils/geometry.js';
import {
  CUERPOS_CALCULO,
  UNIDAD_TEXTO,
  medidasIniciales,
  calcularCuerpo,
  EQUIVALENCIAS,
  EJEMPLOS_CAPACIDAD,
  capacidadEjemplo,
  DEMO_PIRAMIDES,
} from '../../data/areasVolumenes.js';

const colorBoton = (activo) => (activo ? 'chip chip-on' : 'chip');

// ---------- Una tarjeta del desglose: fórmula → reemplazo → resultado con unidad ----------
function Desglose({ item, piEscolar }) {
  const unidad = UNIDAD_TEXTO[item.dim];
  const aprox = item.usaPi && !piEscolar;
  return (
    <div className="card p-3" data-resultado={item.id}>
      <h4 className="font-bold text-ink">{item.nombre}</h4>
      <Formula block tex={item.formula} />
      <div className="text-sm text-muted">Reemplazamos:</div>
      <Formula block tex={`= ${item.reemplazo}`} />
      <p className="mt-1 text-lg">
        Resultado:{' '}
        <strong className="text-brand-ink">
          {aprox ? '≈ ' : ''}
          {fmt(item.valor)} {unidad}
        </strong>
      </p>
      {item.dim === 'volumen' && (
        <p className="text-sm text-muted">
          En litros: {aprox ? '≈ ' : ''}
          {fmt(cm3ALitros(item.valor), 3)} L
        </p>
      )}
    </div>
  );
}

// ---------- Tres pirámides llenan un prisma (animación de llenado) ----------
function Llenado({ vertidas }) {
  // clip-path: triángulo = pirámide vista de frente
  const piramide = (k) => (
    <div
      key={k}
      className="h-16 w-14 bg-amber-300 transition-opacity duration-500"
      style={{ clipPath: 'polygon(50% 0, 100% 100%, 0 100%)', opacity: k < vertidas ? 0.2 : 1 }}
      data-piramide={k < vertidas ? 'vertida' : 'disponible'}
    />
  );
  return (
    <div className="flex items-end justify-center gap-6" aria-hidden="true">
      <div className="flex items-end gap-1">{[0, 1, 2].map(piramide)}</div>
      <div className="relative h-44 w-28 overflow-hidden rounded-b-xl border-4 border-t-0 border-teal-700 bg-surface">
        <div
          className="absolute bottom-0 left-0 w-full bg-amber-300 transition-all duration-700 ease-out"
          style={{ height: `${(vertidas / 3) * 100}%` }}
          data-nivel={vertidas}
        />
        {[1, 2].map((k) => (
          <div key={k} className="absolute left-0 w-full border-t border-dashed border-teal-700/60" style={{ bottom: `${(k / 3) * 100}%` }} />
        ))}
      </div>
    </div>
  );
}

export default function AreasVolumenes({ onVolver }) {
  const { marcarCompletado, pi, piEscolar } = useApp();

  const [id, setId] = useState('cubo');
  const [medidas, setMedidas] = useState(medidasIniciales('cubo'));
  const [tocado, setTocado] = useState(false);

  const [m2Ok, setM2Ok] = useState(false);
  const [litrosOk, setLitrosOk] = useState(false);
  const [ejemploId, setEjemploId] = useState('caja');
  const [vertidas, setVertidas] = useState(0);
  const [llenado, setLlenado] = useState(false);
  const [quizOk, setQuizOk] = useState(false);

  const terminar = () => {
    marcarCompletado('areas-volumenes');
    onVolver();
  };

  const cuerpo = CUERPOS_CALCULO.find((c) => c.id === id);
  const { previos, resultados } = calcularCuerpo(id, medidas, { pi, piEscolar });
  const esPoliedro = IDS_DIBUJABLES.includes(id);

  const elegir = (nuevo) => {
    setId(nuevo);
    setMedidas(medidasIniciales(nuevo));
  };

  const verter = () => {
    const n = Math.min(vertidas + 1, 3);
    setVertidas(n);
    if (n === 3) setLlenado(true);
  };

  const ejemplo = EJEMPLOS_CAPACIDAD.find((e) => e.id === ejemploId);
  const cap = capacidadEjemplo(ejemplo);
  const demo = DEMO_PIRAMIDES;

  const pasos = [
    {
      titulo: 'Calculá áreas y volúmenes',
      bloqueado: !tocado,
      contenido: (
        <>
          <p className="text-muted">
            Elegí un cuerpo y <strong>cambiá sus medidas</strong>: la app te muestra cada cálculo paso a paso.
          </p>

          <div className="flex flex-wrap gap-2" role="group" aria-label="Cuerpo">
            {CUERPOS_CALCULO.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => elegir(c.id)}
                aria-pressed={id === c.id}
                className={`${colorBoton(id === c.id)}`}
              >
                {c.nombre}
              </button>
            ))}
          </div>

          <div className="card p-4">
            <h3 className="text-lg font-bold">{cuerpo.nombre}</h3>
            {esPoliedro ? <Poliedro3D id={id} giro={30} resalte={null} /> : <Redondo3D id={id} resalte={null} />}
            <div className="mt-3 space-y-2">
              {cuerpo.params.map((p) => (
                <Slider
                  key={p.id}
                  etiqueta={p.etiqueta}
                  valor={medidas[p.id]}
                  onChange={(v) => {
                    setMedidas((m) => ({ ...m, [p.id]: v }));
                    setTocado(true);
                  }}
                  min={p.min}
                  max={p.max}
                  paso={p.paso}
                  unidad="cm"
                />
              ))}
            </div>
          </div>

          {previos.length > 0 && (
            <>
              <h3 className="font-bold text-ink">Primero, algunos datos que hacen falta</h3>
              {previos.map((it) => (
                <Desglose key={it.id} item={it} piEscolar={piEscolar} />
              ))}
            </>
          )}

          <h3 className="font-bold text-ink">Áreas y volumen</h3>
          {resultados.map((it) => (
            <Desglose key={it.id} item={it} piEscolar={piEscolar} />
          ))}
          <p className="text-sm text-muted">
            Cuando hay una raíz, el resultado se muestra redondeado a 2 decimales.
            {id === 'cilindro' || id === 'cono' || id === 'esfera'
              ? piEscolar
                ? ' Estás usando π = 3,14.'
                : ' Estás usando el valor exacto de π: los resultados son aproximados (≈).'
              : ''}
          </p>
        </>
      ),
    },
    {
      titulo: 'Cambio de unidades',
      bloqueado: !m2Ok,
      contenido: (
        <>
          <p className="text-muted">
            Al pasar de una unidad a otra, <strong>el área y el volumen no se multiplican por lo mismo que la longitud</strong>. Si 1 m = 100 cm,
            entonces el cuadrado de 1 m de lado tiene 100 · 100 cm² y el cubo de 1 m de arista tiene 100 · 100 · 100 cm³.
          </p>
          <div className="card overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-2 text-sm text-muted">
                <tr>
                  <th className="p-2">Medida</th>
                  <th className="p-2">Equivale a</th>
                </tr>
              </thead>
              <tbody>
                {EQUIVALENCIAS.map((e) => (
                  <tr key={e.id} className="border-t border-slate-100" data-equivalencia={e.id}>
                    <td className="p-2 font-semibold">{e.de}</td>
                    <td className="p-2">
                      {fmt(e.valor)} {e.a}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <NumInput
            etiqueta="¿Cuántos cm² tiene 1 m²?"
            unidad="cm²"
            correcto={10000}
            pista="1 m = 100 cm, entonces 1 m² = 100 · 100 cm²."
            onResultado={() => setM2Ok(true)}
          />
        </>
      ),
    },
    {
      titulo: 'Del volumen a los litros',
      bloqueado: !litrosOk,
      contenido: (
        <>
          <p className="text-muted">
            <strong>1 dm³ = 1 litro</strong>. Para saber cuántos litros entran en algo, calculá su volumen y pasalo a dm³. Tocá un ejemplo:
          </p>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Ejemplo">
            {EJEMPLOS_CAPACIDAD.map((e) => (
              <button
                key={e.id}
                type="button"
                onClick={() => setEjemploId(e.id)}
                aria-pressed={ejemploId === e.id}
                className={`${colorBoton(ejemploId === e.id)}`}
              >
                <span aria-hidden="true">{e.icono} </span>
                {e.nombre}
              </button>
            ))}
          </div>
          <div className="card p-4" data-ejemplo={ejemplo.id}>
            <p className="font-semibold">
              {ejemplo.nombre}: {ejemplo.dims.map((d) => fmt(d)).join(' × ')} {ejemplo.unidad}
            </p>
            <Formula block tex={`V = ${ejemplo.dims.map((d) => fmt(d).replace(',', '{,}')).join(' \\cdot ')}`} />
            <p>
              Volumen: <strong>{fmt(cap.volumen)} {ejemplo.unidad}³</strong>
            </p>
            {ejemplo.unidad !== 'dm' && (
              <p>
                En dm³: <strong>{fmt(cap.enDm3)} dm³</strong>
              </p>
            )}
            <p className="text-lg">
              Capacidad: <strong className="text-brand-ink">{fmt(cap.litros)} litros</strong>
            </p>
          </div>
          <NumInput
            etiqueta="Una caja de 20 cm × 30 cm × 50 cm, ¿cuántos litros entran?"
            unidad="L"
            correcto={cm3ALitros(20 * 30 * 50)}
            pista="Volumen = 20 · 30 · 50 cm³. Después, 1 000 cm³ = 1 litro."
            onResultado={() => setLitrosOk(true)}
          />
        </>
      ),
    },
    {
      titulo: 'Tres pirámides llenan un prisma',
      bloqueado: !llenado,
      contenido: (
        <>
          <p className="text-muted">
            Una pirámide y un prisma con <strong>la misma base y la misma altura</strong> (base cuadrada de {fmt(demo.lado)} cm, altura {fmt(demo.altura)} cm).
            Vertí las pirámides en el prisma y mirá hasta dónde llega.
          </p>
          <div className="card p-4">
            <Llenado vertidas={vertidas} />
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={verter}
                disabled={vertidas >= 3}
                className="btn btn-primary flex-1"
              >
                Verter una pirámide
              </button>
              <button
                type="button"
                onClick={() => setVertidas(0)}
                className="btn btn-secondary flex-1"
              >
                Vaciar
              </button>
            </div>
            <p className="mt-3 text-lg" aria-live="polite">
              Vertiste <strong>{vertidas} de 3</strong> pirámides: {fmt(vertidas * demo.volumenPiramide)} cm³ de {fmt(demo.volumenPrisma)} cm³.
            </p>
          </div>
          <div className="card p-3">
            <Formula block tex={`V_{\\text{prisma}} = A_{base} \\cdot h = ${fmt(demo.areaBase)} \\cdot ${fmt(demo.altura)} = ${fmt(demo.volumenPrisma)}\\ \\text{cm}^3`} />
            {llenado && (
              <>
                <p className="text-ok-ink">✅ ¡Se llenó justo con 3 pirámides!</p>
                <Formula block tex={`V_{\\text{pirámide}} = \\dfrac{A_{base} \\cdot h}{3} = \\dfrac{${fmt(demo.volumenPrisma)}}{3} = ${fmt(demo.volumenPiramide)}\\ \\text{cm}^3`} />
                <p className="text-sm text-muted">Con el cono y el cilindro pasa lo mismo: el cono ocupa la tercera parte.</p>
              </>
            )}
          </div>
        </>
      ),
    },
    {
      titulo: 'Cono y cilindro',
      bloqueado: !quizOk,
      contenido: (
        <Quiz
          pregunta="Un cilindro y un cono tienen la misma base y la misma altura. Si el volumen del cilindro es 90 cm³, el volumen del cono es…"
          opciones={['30 cm³', '45 cm³', '180 cm³']}
          correcta={0}
          explicacion="El cono ocupa la tercera parte del cilindro: 90 : 3 = 30 cm³."
          onResolver={() => setQuizOk(true)}
        />
      ),
    },
    {
      titulo: '¡Listo!',
      contenido: (
        <div className="card p-4">
          <p className="font-semibold">Para recordar:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6 text-ink">
            <li>Área total = área lateral + áreas de las bases.</li>
            <li>Volumen de un prisma = área de la base · altura; el de una pirámide es la tercera parte.</li>
            <li>1 m² = 10 000 cm² y 1 m³ = 1 000 000 cm³.</li>
            <li>1 dm³ = 1 000 cm³ = 1 litro.</li>
          </ul>
        </div>
      ),
    },
  ];

  return (
    <ModuloLayout titulo="Áreas y volúmenes" icono="🧮" onVolver={onVolver}>
      <StepNav pasos={pasos} onFinish={terminar} textoFinal="Terminar ✓" />
    </ModuloLayout>
  );
}
