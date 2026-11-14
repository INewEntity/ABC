// Genera un informe de ejemplo con datos falsos, con el mismo estilo que la impresión, para revisarlo en pantalla.
import { JSDOM, VirtualConsole } from 'jsdom';
import fs from 'node:fs';
const [,, appDir, out] = process.argv;
const html = fs.readFileSync(appDir + '/index.html', 'utf8');
const H = 3600e3, D = 24 * H, N = Date.now();
const e = (id, h, a, b, emo, extra = {}) => ({id, at: N - h * H, a, b, emo, fis: ['Tensión muscular'], fisTxt: '', cond: 'Me fui a casa', cp: 'Alivio', lp: '', cre: N - h * H, upd: N - h * H, ...extra});
const datos = {
  settings: {nombre: 'Paciente de ejemplo', psico: 'Raúl Triana Guillén', consulta: '', theme: 'auto', onb: true, anc: {nombre: 'la tormenta', vib: true, preg: true}},
  entries: [e('1', 30, 'Reunión de equipo, me corrigieron delante de todos', 'Soy un desastre', [{n: 'Vergüenza', i: 8}, {n: 'Ansiedad', i: 6}], {val: 'f2', lp: 'Al día siguiente me costó volver'}),
            e('2', 80, 'Cena familiar', 'No me escuchan', [{n: 'Tristeza', i: 5}], {val: 'f1'})],
  resp: [{id: 'r1', at: N - 2 * D, tec: 'lenta', seg: 300, antes: 7, despues: 4}, {id: 'r2', at: N - 4 * D, tec: 'suspiro', seg: 180, antes: 6, despues: 5}],
  anc: [{id: 'a1', at: N - 30 * H, modo: 'real', seg: 110, fin: true, hacer: 'Volver a la reunión y terminar lo mío', valor: 'f2', rev: 'intento', revAt: N - 5 * H, cerca: 'poco'},
        {id: 'a2', at: N - 3 * D, modo: 'sim', seg: 120, fin: true, hacer: 'Llamar a mi madre', valor: 'f1', rev: 'no', dif: 'Estaba muy cansado'},
        {id: 'a3', at: N - 5 * D, modo: 'real', seg: 40, fin: false, hacer: ''}],
  val: {areas: ['familia', 'trabajo'], notas: {familia: 'Las comidas de los domingos', libre: 'Echo de menos reírme'}, pal: ['cercanía', 'aprender', 'humor'], top: ['cercanía', 'aprender', 'humor'],
        frases: [{id: 'f1', area: 'familia', palabra: 'cercanía', ej: 'Comer juntos los domingos'}, {id: 'f2', area: 'trabajo', palabra: 'aprender', ej: ''}], usar: true},
};
const dom = new JSDOM(html, {url: 'http://localhost/', runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: new VirtualConsole(),
  beforeParse(w){ w.structuredClone = structuredClone; w.scrollTo = () => {}; w.localStorage.setItem('abc.v1', JSON.stringify(datos)); }});
await new Promise(r => setTimeout(r, 30));
dom.window.eval("EXP.per = 'all'");
const cuerpo = dom.window.eval('reportHtml(expList())');
const css = (html.match(/@media print\{([\s\S]*?)\n\}/) || [, ''])[1].replace(/@page\{[^}]*\}/, '').replace(/main,nav\.tabs[^}]*\}/, '').replace(/html,body\{[^}]*\}/, '');
fs.writeFileSync(out, `<!doctype html><meta charset="utf-8"><title>Informe de ejemplo</title><style>body{background:#fff;color:#000;font-family:system-ui,sans-serif;margin:24px;max-width:1100px}${css.replace('#print{display:block;', '#print{')}</style><div id="print">${cuerpo}</div>`);
console.log('ok', out);
