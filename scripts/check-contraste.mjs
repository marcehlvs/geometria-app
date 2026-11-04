// Revisa el contraste (WCAG 2.1) de los pares texto/fondo de la app, en claro y en oscuro.
// Uso: node scripts/check-contraste.mjs   → termina con error si algún par común no llega a 4,5:1
import fs from 'node:fs';
import path from 'node:path';

const css = fs.readFileSync('src/styles/palette.css', 'utf8');
const claro = css.slice(css.indexOf(':root {'), css.indexOf(':root[data-theme="dark"]'));
const HEX = {};
for (const m of claro.matchAll(/--c-([a-z]+)-(\d+):\s*(#[0-9a-f]{6})/g)) HEX[`${m[1]}-${m[2]}`] = m[3];
const OSC = { 50: 950, 100: 800, 200: 700, 300: 600, 400: 500, 500: 400, 600: 300, 700: 200, 800: 100, 900: 50, 950: 50 };

// color -> {claro, oscuro}
const pal = (f, t) => ({ l: HEX[`${f}-${t}`], d: HEX[`${f}-${OSC[t]}`] });
const raw = (f, t) => ({ l: HEX[`${f}-${t}`], d: HEX[`${f}-${t}`] }); // mismo color real en los dos temas
const TOKENS = {
  white: { l: '#ffffff', d: HEX['slate-900'] },
  page: pal('slate', 50), surface: { l: '#ffffff', d: HEX['slate-900'] }, 'surface-2': pal('slate', 100),
  line: pal('slate', 200), field: pal('slate', 500), ink: pal('slate', 900), muted: pal('slate', 600),
  brand: { l: HEX['teal-700'], d: HEX['teal-400'] }, 'brand-hover': { l: HEX['teal-800'], d: HEX['teal-300'] },
  'brand-soft': pal('teal', 50), 'brand-ink': pal('teal', 800), 'on-brand': { l: '#ffffff', d: HEX['teal-950'] },
};
for (const [n, f] of [['ok', 'green'], ['bad', 'red'], ['warn', 'amber'], ['info', 'sky']]) {
  TOKENS[`${n}-soft`] = pal(f, 50); TOKENS[`${n}-line`] = pal(f, 600);
  TOKENS[`${n}-ink`] = pal(f, f === 'amber' || f === 'sky' ? 900 : 800);
}
const color = (nombre) => {
  if (TOKENS[nombre]) return TOKENS[nombre];
  const m = nombre.match(/^([a-z]+)-(\d+)$/);
  return m && HEX[nombre] ? pal(m[1], Number(m[2])) : null;
};
const lum = (h) => {
  const c = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

// ---------- 1) pares de los tokens (lo que usan .btn, .alert, .badge…)
const PARES = [
  ['ink', 'page'], ['ink', 'surface'], ['muted', 'page'], ['muted', 'surface'], ['muted', 'surface-2'], ['muted', 'brand-soft'],
  ['on-brand', 'brand'], ['on-brand', 'brand-hover'], ['brand-ink', 'brand-soft'], ['brand-ink', 'surface'], ['brand-ink', 'surface-2'], ['brand-ink', 'page'],
  ['ok-ink', 'ok-soft'], ['bad-ink', 'bad-soft'], ['warn-ink', 'warn-soft'], ['info-ink', 'info-soft'],
  ['ok-ink', 'surface'], ['bad-ink', 'surface'], ['ink', 'brand-soft'],
];
let fallos = 0;
const mostrar = (tipo, a, b, tema, r, donde) => { fallos++; console.log(`✗ ${r.toFixed(2)}:1 ${tipo} ${a} sobre ${b} (${tema}) ${donde || ''}`); };
for (const [t, f] of PARES) for (const tema of ['l', 'd']) {
  const r = ratio(TOKENS[t][tema], TOKENS[f][tema]);
  if (r < 4.5) mostrar('token', t, f, tema === 'l' ? 'claro' : 'oscuro', r);
}
// bordes de campos (UI ≥ 3:1)
for (const tema of ['l', 'd']) {
  const r = ratio(TOKENS.field[tema], TOKENS.surface[tema]);
  if (r < 3) mostrar('borde', 'field', 'surface', tema === 'l' ? 'claro' : 'oscuro', r);
}

// ---------- 2) pares reales en el código: text-X y bg-Y dentro de la misma cadena
const archivos = [];
(function rec(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) { if (e.name !== '__tests__') rec(p); } else if (p.endsWith('.jsx')) archivos.push(p); } })('src');
const vistos = new Set();
for (const f of archivos) {
  const src = fs.readFileSync(f, 'utf8');
  for (const m of src.matchAll(/(["'`])((?:(?!\1)[^\n\\])*?)\1/g)) {
    const toks = m[2].split(/\s+/).filter(Boolean);
    if (toks.length < 2 || !toks.some((t) => /^(text|bg)-/.test(t))) continue;
    const sinPref = toks.filter((t) => !t.includes(':') && !t.includes('/'));
    const txt = sinPref.find((t) => /^text-(?!xs|sm|base|lg|xl|[2-9]xl|center|left|right|display|title)/.test(t));
    const bg = sinPref.find((t) => /^bg-/.test(t));
    if (!txt) continue;
    const ct = color(txt.slice(5));
    if (!ct) continue;
    const grande = sinPref.some((t) => /^text-(xl|[2-9]xl|display|title)$/.test(t)) && sinPref.includes('font-bold');
    const min = grande ? 3 : 4.5;
    const fondos = bg ? [[bg.slice(3), color(bg.slice(3))]] : [['page', TOKENS.page], ['surface', TOKENS.surface]];
    for (const [nf, cf] of fondos) {
      if (!cf) continue;
      for (const tema of ['l', 'd']) {
        const r = ratio(ct[tema], cf[tema]);
        const clave = `${f}|${txt}|${nf}|${tema}`;
        if (r < min && !vistos.has(clave)) { vistos.add(clave); mostrar('código', txt.slice(5), nf, tema === 'l' ? 'claro' : 'oscuro', r, `${f.replace('src/', '')}  "${m[2].slice(0, 70)}"`); }
      }
    }
  }
}
console.log(fallos === 0 ? '✅ Contraste OK (tokens y clases del código)' : `\n${fallos} par(es) por debajo del mínimo`);
process.exit(fallos ? 1 : 0);
