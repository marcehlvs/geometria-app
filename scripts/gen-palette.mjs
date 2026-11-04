// Genera src/styles/palette.css a partir de la paleta de Tailwind.
// Cada color existe en dos versiones: claro y oscuro (la escala se "da vuelta":
// lo que era 50 pasa a 950, etc.). Así TODAS las clases (bg-slate-50, text-teal-700…)
// y los colores de los dibujos SVG cambian solos con el modo oscuro.
// Uso: node scripts/gen-palette.mjs
import fs from 'node:fs';

const FAMILIAS = ['slate', 'teal', 'amber', 'red', 'green', 'sky', 'blue', 'purple', 'emerald', 'indigo', 'rose', 'violet', 'orange', 'lime'];
const TONOS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
// tono claro -> tono que se usa en modo oscuro (la tarjeta, white, pasa a slate-900; 100 pasa a 800 para que los rellenos suaves se distingan de ella)
const OSCURO = { 50: 950, 100: 800, 200: 700, 300: 600, 400: 500, 500: 400, 600: 300, 700: 200, 800: 100, 900: 50, 950: 50 };

const tema = fs.readFileSync('node_modules/tailwindcss/theme.css', 'utf8');

function oklchAHex(texto) {
  const m = texto.match(/oklch\(\s*([\d.]+)%\s+([\d.]+)\s+([\d.]+)/);
  const L = parseFloat(m[1]) / 100, C = parseFloat(m[2]), H = (parseFloat(m[3]) * Math.PI) / 180;
  const a = C * Math.cos(H), b = C * Math.sin(H);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const [l, mm, s] = [l_ ** 3, m_ ** 3, s_ ** 3];
  const lin = [
    4.0767416621 * l - 3.3077115913 * mm + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * mm - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * mm + 1.707614701 * s,
  ];
  return '#' + lin.map((v) => {
    const c = Math.min(1, Math.max(0, v));
    const g = c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;
    return Math.round(g * 255).toString(16).padStart(2, '0');
  }).join('');
}

const hex = {};
for (const f of FAMILIAS) for (const t of TONOS) {
  const m = tema.match(new RegExp(`--color-${f}-${t}:\\s*([^;]+);`));
  if (!m) throw new Error(`Falta --color-${f}-${t} en theme.css`);
  hex[`${f}-${t}`] = oklchAHex(m[1]);
}

let claro = '', oscuro = '', puente = '';
for (const f of FAMILIAS) for (const t of TONOS) {
  claro += `  --c-${f}-${t}: ${hex[`${f}-${t}`]};\n`;
  oscuro += `  --c-${f}-${t}: ${hex[`${f}-${OSCURO[t]}`]};\n`;
  puente += `  --color-${f}-${t}: var(--c-${f}-${t});\n`;
}

const css = `/* GENERADO por scripts/gen-palette.mjs — no editar a mano. */

:root {
  --c-white: #ffffff;
${claro}}

:root[data-theme="dark"] {
  --c-white: ${hex['slate-900']};
${oscuro}}

/* Tailwind lee estos colores a través de las variables --c-*, por eso cambian con el tema */
@theme inline {
  --color-white: var(--c-white);
${puente}}
`;
fs.writeFileSync('src/styles/palette.css', css);
console.log('palette.css:', css.split('\n').length, 'líneas');
