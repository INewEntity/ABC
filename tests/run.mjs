// Pruebas automáticas de la app (solo en local). Ejecutar antes de publicar:
//   cd tests && npm test
// Cargan index.html en un navegador simulado (jsdom), cada caso con su propio almacenamiento,
// y comprueban que los datos de versiones anteriores se conservan y que las pantallas funcionan.
// No tocan la vista previa, la web publicada ni los datos de nadie.
import { JSDOM, VirtualConsole } from 'jsdom';
import fs from 'node:fs';
import { alDia } from '../src/construir.mjs';

const HTML = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const STORE = 'abc.v1', H = 3600e3, D = 24 * H, NOW = Date.now();
const wait = ms => new Promise(r => setTimeout(r, ms));
// Avisos del simulador que no son fallos de la app (su lector de CSS no entiende algunas reglas modernas)
const RUIDO = /Could not parse CSS stylesheet|Not implemented: (window\.scrollTo|HTMLMediaElement)/;

let ok = 0, ko = 0;
const fallos = [];
function check(caso, nombre, cond, extra = ''){
  if (cond){ ok++; console.log(`  ✓ ${nombre}`); }
  else { ko++; fallos.push(`${caso} › ${nombre}${extra ? ' — ' + extra : ''}`); console.log(`  ✗ ${nombre}${extra ? ' — ' + extra : ''}`); }
}

async function abrir(datos, hash = '#inicio'){
  const errores = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', e => { if (!RUIDO.test(e.message)) errores.push(e.message); });
  vc.on('error', (...a) => errores.push(a.map(String).join(' ')));
  const dom = new JSDOM(HTML, {
    url: 'http://localhost/' + hash, runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc,
    beforeParse(w){
      w.structuredClone = structuredClone;
      w.scrollTo = () => {}; w.print = () => {};
      if (datos !== undefined) w.localStorage.setItem(STORE, typeof datos === 'string' ? datos : JSON.stringify(datos));
      w.addEventListener('error', e => errores.push(e.message));
    },
  });
  await wait(20);
  const w = dom.window;
  const ev = expr => w.eval(expr);                 // acceso a S, funciones y constantes de la app
  const q = sel => w.document.querySelector(sel);
  const qa = sel => [...w.document.querySelectorAll(sel)];
  const click = async sel => { const b = q(sel); if (!b) throw new Error('No encuentro ' + sel); b.click(); await wait(5); };
  const disco = () => JSON.parse(w.localStorage.getItem(STORE));
  // Copias de seguridad: en vez de compartir o descargar, se guardan aquí
  const copias = [];
  w.shareOrDownload = async (blob, name) => { copias.push({name, text: await blob.text()}); return true; };
  return {w, ev, q, qa, click, disco, errores, copias, cerrar: () => dom.window.close()};
}
async function recorrer(A){
  for (const v of ['inicio', 'abc', 'abc/historial', 'abc/resumen', 'respirar', 'anclaje', 'valores', 'ajustes']){ A.ev(`go('${v}')`); await wait(3); }
}
async function importar(A, texto){
  A.ev("go('ajustes')"); await wait(5);
  const inp = A.q('#imp'), f = new A.w.File([texto], 'copia.json', {type: 'application/json'});
  Object.defineProperty(inp, 'files', {value: [f], configurable: true});
  inp.dispatchEvent(new A.w.Event('change')); await wait(40);
}

// ---------- Datos de cada versión, con la forma que tenían entonces ----------
const entrada = (id, horas, extra = {}) => ({id, at: NOW - horas * H, a: 'Reunión ' + id, b: 'Lo voy a hacer mal', emo: [{n: 'Ansiedad', i: 7}], fis: ['Palpitaciones'], fisTxt: '', cond: 'Me fui', cp: 'Alivio', lp: '', cre: NOW - horas * H, upd: NOW - horas * H, ...extra});
const V4 = {
  settings: {nombre: 'Paciente Cuatro', psico: 'Raúl Triana Guillén', consulta: '2026-11-01', theme: 'auto'},
  entries: [entrada('v4a', 20), entrada('v4b', 80, {lp: 'Lo hablé'}), entrada('v4c', 30 * 24, {lpNo: true})],
  draft: {id: null, step: 1, data: {at: NOW, a: 'A medias', b: '', emo: [], fis: [], fisTxt: '', cond: '', cp: '', lp: ''}},
};
const V5 = {
  settings: {nombre: '', psico: 'Raúl Triana Guillén', consulta: '', theme: 'dark', resp: {dur: {lenta: 10}, ritmo: {lenta: 2}, son: {}, vib: false}},
  entries: [entrada('v5a', 5)], draft: null,
  resp: [{id: 'r1', at: NOW - 2 * D, tec: 'lenta', seg: 600, antes: 7, despues: 4}, {id: 'r2', at: NOW - D, tec: 'suspiro', seg: 300, antes: null, despues: null}],
};
const V6 = {
  settings: {nombre: 'Paciente Seis', psico: 'Raúl Triana Guillén', consulta: '', theme: 'auto', onb: true, resp: {dur: {}, ritmo: {}, son: {}, vib: true}, anc: {nombre: 'la tormenta', vib: true, preg: true}},
  entries: [entrada('v6a', 3, {val: 'f1'})], draft: null, resp: [],
  anc: [
    {id: 'a1', at: NOW - 30 * H, modo: 'real', seg: 95, fin: true, hacer: 'Llamar a mi hermana', abc: null, valor: 'f1', rev: null},
    {id: 'a2', at: NOW - 4 * D, modo: 'sim', seg: 100, fin: true, hacer: 'Salir a pasear', abc: null, rev: 'no', revAt: NOW - 3 * D, dif: 'Llovía'},
  ],
  val: {areas: ['familia'], notas: {familia: 'Las comidas'}, pal: ['cercanía'], top: ['cercanía'], frases: [{id: 'f1', area: 'familia', palabra: 'cercanía', ej: 'Comer juntos'}], usar: true, informe: false},
};

// ---------- Casos ----------
async function primerUso(){
  console.log('\nPrimer uso (sin datos)');
  const A = await abrir(undefined);
  check('Primer uso', 'sale la bienvenida', !!A.q('#onb-nom'));
  A.q('#onb-nom').value = 'Ana'; await A.click('[data-act="onb-ok"]');
  check('Primer uso', 'tras «Empezar» saluda por su nombre', /Ana/.test(A.q('h1').textContent));
  check('Primer uso', 'no pide copia de seguridad sin datos', !A.q('[data-act="bk-later"]'));
  await recorrer(A);
  check('Primer uso', 'sin errores', !A.errores.length, A.errores.join(' | '));
  A.cerrar();
}

async function version(nombre, datos, extra){
  console.log(`\nDatos de la ${nombre}`);
  const antes = JSON.parse(JSON.stringify(datos));
  const A = await abrir(datos, nombre === 'versión 4' ? '#registrar' : '#inicio');
  check(nombre, 'no sale la bienvenida a quien ya tenía datos', !A.q('#onb-nom'));
  check(nombre, 'conserva todos los registros', A.ev('S.entries.length') === antes.entries.length);
  check(nombre, 'conserva el texto de los registros', A.ev('JSON.stringify(S.entries.map(e => [e.id, e.a, e.b, e.lp]))') === JSON.stringify(antes.entries.map(e => [e.id, e.a, e.b, e.lp])));
  check(nombre, 'conserva el nombre y la consulta', A.ev('S.settings.nombre') === antes.settings.nombre && A.ev('S.settings.consulta') === antes.settings.consulta);
  check(nombre, 'conserva el borrador', A.ev('JSON.stringify(S.draft && S.draft.data.a)') === JSON.stringify(antes.draft && antes.draft.data.a));
  check(nombre, 'añade los campos nuevos sin romper nada', A.ev("Array.isArray(S.resp) && Array.isArray(S.anc) && Array.isArray(S.val.frases) && typeof S.settings.bk === 'object'"));
  await recorrer(A);
  A.ev("S.entries[0].lp = S.entries[0].lp + ''; save()"); // forzar un guardado
  check(nombre, 'lo guardado en disco sigue teniendo los registros', A.disco().entries.length === antes.entries.length);
  check(nombre, 'el informe en texto se genera', A.ev('reportText(expList())').includes(antes.entries[0].a));
  check(nombre, 'el informe en PDF se genera', A.ev('reportHtml(expList())').includes('<table'));
  await A.click('[data-act="bk-export"]').catch(() => A.ev('backupExport()')); await wait(20);
  if (!A.copias.length){ A.ev('backupExport()'); await wait(20); }
  const copia = A.copias.length && JSON.parse(A.copias.at(-1).text);
  check(nombre, 'la copia de seguridad lleva todos los registros', copia && copia.entries.length === antes.entries.length);
  check(nombre, 'la copia anota la fecha de la última copia', !!A.ev('S.settings.bk.last'));
  if (extra) await extra(A, antes);
  check(nombre, 'sin errores', !A.errores.length, A.errores.join(' | '));
  A.cerrar();
  return copia;
}

async function extrasV5(A, antes){
  check('versión 5', 'conserva las prácticas de respiración', A.ev('S.resp.length') === antes.resp.length);
  check('versión 5', 'conserva los ajustes de respiración', A.ev('S.settings.resp.dur.lenta') === 10 && A.ev('S.settings.resp.ritmo.lenta') === 2);
}
async function extrasV6(A){
  A.ev("go('inicio')"); await wait(5);
  check('versión 6', 'pregunta «¿Lo hiciste?» por la acción de ayer', /Llamar a mi hermana/.test(A.q('.card.pend')?.textContent || ''));
  check('versión 6', 'conserva las acciones y su revisión', A.ev("S.anc.find(r => r.id === 'a2').dif") === 'Llovía');
  check('versión 6', 'conserva los valores', A.ev('S.val.frases[0].palabra') === 'cercanía');
  const txt = A.ev('reportText(expList())');
  check('versión 6', 'el informe lleva las acciones', /Acciones propuestas: 2/.test(txt));
  const pdf = A.ev('reportHtml(expList())');
  check('versión 6', 'el informe lleva siempre los valores y lo que escribió al explorar', /LO QUE LE IMPORTA/.test(txt) && /«cercanía»/.test(txt) && /Las comidas/.test(txt) && /Lo que le importa/.test(pdf));
  check('versión 6', 'el informe lleva cada sesión de Anclaje, también los simulacros', /Momento real/.test(txt) && /Simulacro/.test(txt) && (pdf.match(/<td>(Momento real|Simulacro)/g) || []).length === 2);
  check('versión 6', 'el informe lleva el valor y el resultado de cada acción', /Llamar a mi hermana \(sin revisar\) · Valor: «cercanía»/.test(txt) && /Salir a pasear \(no hecho\).*Llovía/.test(txt));
  check('versión 6', 'el informe dice cómo llama a lo que le aparece', /Llama «la tormenta»/.test(txt));
  check('versión 6', 'el registro ABC lleva lo que le importaba', /Le importaba: «cercanía»/.test(txt));
  A.ev("go('valores')");
  check('versión 6', 'ya no hay interruptor de informe en Lo que importa', !/Informe para tu psicólogo/.test(A.q('#app').textContent));
}
async function informe(){
  console.log('\nInforme para el psicólogo');
  const A = await abrir(V5);
  const txt = A.ev('reportText(expList())'), pdf = A.ev('reportHtml(expList())');
  check('Informe', 'lleva la respiración: técnica, minutos y tensión', /RESPIRACIÓN/.test(txt) && /Respiración lenta · 10 min · tensión 7 → 4/.test(txt) && /<h2>Respiración<\/h2>/.test(pdf));
  check('Informe', 'resume la respiración del periodo', /Respiración: 2 prácticas, 15 min en total · tensión media antes → después: 7 → 4 \(en 1\)/.test(txt));
  A.cerrar();
  const soloAnclaje = {...V6, entries: [], resp: []};
  const B = await abrir(soloAnclaje);
  check('Informe', 'se puede exportar aunque no haya registros ABC', B.ev('expVacio()') === false && /Sin registros ABC en el periodo/.test(B.ev('reportHtml(expList())')));
  B.ev('sheetExport()');
  check('Informe', 'la pantalla de exportar cuenta todo', /0 registros · 2 anclajes · 0 prácticas de respiración/.test(B.q('#exp-n').textContent));
  check('Informe', 'se exporta siempre todo, desde el primer dato', B.ev('expRange().from') === Math.min(...soloAnclaje.anc.map(r => r.at)) && B.ev('ancList().length') === 2);
  check('Informe', 'solo hay un botón: crear el PDF', B.qa('.sheet [data-act^="exp-"]').map(b => b.dataset.act).join() === 'exp-pdf');
  check('Informe', 'sin errores', !B.errores.length, B.errores.join(' | '));
  B.cerrar();
  const C = await abrir({...V6, entries: [], anc: [], resp: []});
  check('Informe', 'sin ningún dato avisa en vez de exportar vacío', C.ev('expVacio()') === true);
  C.ev("go('ajustes')");
  check('Informe', 'Ajustes ya no pide la fecha de la última consulta', !/Última consulta/.test(C.q('#app').textContent) && /Exportar informe en PDF/.test(C.q('#app').textContent));
  C.cerrar();
}

async function anclaje(){
  console.log('\nSesión de Anclaje');
  const A = await abrir(V6, '#anclaje');
  check('Anclaje', 'la pantalla avisa de que se puede parar', /demasiado fuertes, para y busca apoyo/.test(A.q('#app').textContent));
  await A.click('[data-act="an-start"][data-m="real"]');
  check('Anclaje', 'durante la sesión: se puede parar y está la línea de crisis', /puedes parar cuando quieras/.test(A.q('#an .an-sos')?.textContent || '') && !!A.q('#an a[href="tel:024"]'));
  check('Anclaje', 'usa el nombre elegido', /la tormenta/.test(A.ev('anTxt(AN.seq[0].x)')));
  A.ev('while (AN && !AN.ended){ anHush(); anNext(); }'); await wait(5);
  check('Anclaje', 'pantalla final con la pregunta', /¿Qué quieres hacer ahora\?/.test(A.q('#an h2')?.textContent || ''));
  check('Anclaje', 'pantalla final con la línea de crisis', !!A.q('#an a[href="tel:024"]') && !!A.q('#an a[href="tel:112"]'));
  await A.click('[data-act="an-val"][data-id="f1"]');
  check('Anclaje', 'al elegir un valor salen ideas', A.qa('[data-act="an-idea"]').length === 3);
  await A.click('[data-act="an-idea"]');
  const id = A.ev('AN.rec.id');
  await A.click('[data-act="an-done"]'); await wait(20);
  const r = A.ev(`JSON.stringify(S.anc.find(x => x.id === '${id}'))`);
  check('Anclaje', 'la sesión se guarda con la acción y el valor', /"hacer":"Escribir un mensaje/.test(r) && /"valor":"f1"/.test(r));
  check('Anclaje', 'sin errores', !A.errores.length, A.errores.join(' | '));
  A.cerrar();
}

async function recordatorio(){
  console.log('\nRecordatorio de copia de seguridad');
  const base = d => ({...JSON.parse(JSON.stringify(V4)), draft: null, settings: {...V4.settings, bk: d}});
  const visto = async (datos, txt) => { const A = await abrir(datos); const v = !!A.q('[data-act="bk-later"]'); A.cerrar(); return v; };
  check('Copia', 'nunca hecha y el primer dato tiene más de dos semanas: sale', await visto(base({last: null, snooze: null})));
  const reciente = base({last: null, snooze: null}); reciente.entries = [entrada('n1', 24)];
  check('Copia', 'nunca hecha pero los datos son recientes: no sale', !(await visto(reciente)));
  check('Copia', 'última copia hace 40 días y hay cambios después: sale', await visto(base({last: NOW - 40 * D, snooze: null})));
  const sinCambios = base({last: NOW - 40 * D, snooze: null}); sinCambios.entries = [entrada('n2', 50 * 24)];
  check('Copia', 'última copia hace 40 días sin cambios después: no sale', !(await visto(sinCambios)));
  check('Copia', 'copia hace 10 días: no sale', !(await visto(base({last: NOW - 10 * D, snooze: null}))));
  check('Copia', 'pospuesto: no sale', !(await visto(base({last: null, snooze: NOW + 5 * D}))));
  const A = await abrir(base({last: null, snooze: null}));
  await A.click('[data-act="bk-later"]');
  check('Copia', '«Ahora no» lo aparta dos semanas', !A.q('[data-act="bk-later"]') && A.ev('S.settings.bk.snooze') > NOW + 13 * D);
  A.ev('S.settings.bk.snooze = null; render()'); await wait(5);
  await A.click('.card.pend [data-act="bk-export"]'); await wait(20);
  check('Copia', '«Guardar copia» la hace y el aviso desaparece', A.copias.length === 1 && !A.q('[data-act="bk-later"]'));
  A.ev("go('ajustes')"); await wait(5);
  check('Copia', 'Ajustes muestra la fecha de la última copia', /Última copia: \d\d\/\d\d\/\d{4}/.test(A.q('#app').textContent));
  check('Copia', 'sin errores', !A.errores.length, A.errores.join(' | '));
  A.cerrar();
}

async function restaurar(copia6){
  console.log('\nRestaurar una copia en un móvil nuevo');
  const A = await abrir(undefined);
  A.ev("S.settings.onb = true; save()");
  await importar(A, JSON.stringify(copia6));
  check('Restaurar', 'recupera registros, acciones y valores', A.ev('S.entries.length') === V6.entries.length && A.ev('S.anc.length') === V6.anc.length && A.ev('S.val.frases.length') === 1);
  check('Restaurar', 'recupera la revisión de las acciones', A.ev("S.anc.find(r => r.id === 'a2').rev") === 'no');
  await importar(A, JSON.stringify(copia6));
  check('Restaurar', 'importar dos veces no duplica', A.ev('S.entries.length') === V6.entries.length && A.ev('S.anc.length') === V6.anc.length);
  await importar(A, '{esto no es una copia');
  check('Restaurar', 'un archivo roto no borra nada', A.ev('S.entries.length') === V6.entries.length && /no es una copia válida/.test(A.q('.toast')?.textContent || ''));
  check('Restaurar', 'sin errores', !A.errores.length, A.errores.join(' | '));
  A.cerrar();
}

async function inicio(){
  console.log('\nInicio por momentos');
  const A = await abrir(V6);
  const moms = A.qa('[data-act="mom"]').map(b => b.querySelector('b').textContent);
  check('Inicio', 'pregunta «¿Cómo estás ahora?» con los cuatro momentos', /¿Cómo estás ahora\?/.test(A.q('#app').textContent) && moms.join('|') === 'Me está pasando ahora|Estoy en tensión|Ha pasado algo|Estoy en calma');
  const orden = [...A.q('#app').children].map(e => e.className || e.tagName);
  check('Inicio', 'los momentos van antes que lo pendiente y que las herramientas', orden.indexOf('moms') < orden.findIndex(c => /card pend/.test(c)) && /Pendiente/.test(A.q('#app').textContent));
  check('Inicio', 'lo pendiente va junto, bajo «Pendiente»', A.qa('h3.sec').map(h => h.textContent).join('|') === 'Pendiente|Todas las herramientas');
  await A.click('[data-m="ahora"]');
  check('Inicio', '«Me está pasando ahora» empieza el Anclaje sin pasos previos', A.ev('!!AN && AN.modo') === 'real' && !A.q('.sheet'));
  A.ev('anClose()'); await wait(10);
  check('Inicio', 'cerrar sin terminar no guarda la sesión', A.ev('S.anc.length') === V6.anc.length);
  A.ev("go('inicio')"); await wait(5);
  await A.click('[data-m="tension"]');
  check('Inicio', '«Estoy en tensión» lleva a la Respiración', A.ev('VIEW') === 'respirar');
  A.ev("go('inicio')"); await wait(5);
  await A.click('[data-m="paso"]');
  check('Inicio', '«Ha pasado algo» abre un registro nuevo', A.ev('VIEW') === 'abc' && A.ev('!!ED') && /Nuevo registro/.test(A.q('h1').textContent));
  A.ev('closeEditor()'); A.ev("go('inicio')"); await wait(5);
  await A.click('[data-m="calma"]');
  const ops = A.qa('.sheet .opt b').map(b => b.textContent).join('|');
  check('Inicio', '«Estoy en calma» ofrece simulacro, valores y respiración lenta', ops === 'Simulacro del Anclaje|Lo que importa|Respiración lenta');
  await A.click('.sheet [data-act="an-start"][data-m="sim"]');
  check('Inicio', 'el simulacro arranca desde ahí', A.ev('!!AN && AN.modo') === 'sim');
  A.ev('anClose()'); await wait(10);
  check('Inicio', 'sin errores', !A.errores.length, A.errores.join(' | '));
  A.cerrar();
  const B = await abrir({...V6, anc: [], entries: [entrada('x', 2)]});
  check('Inicio', 'sin nada pendiente no sale el bloque «Pendiente»', !/Pendiente/.test(B.q('#app').textContent));
  B.cerrar();
}

async function versionDatos(){
  console.log('\nVersión de los datos guardados');
  const original = JSON.stringify(V4);
  const A = await abrir(original);
  check('Datos', 'los datos sin versión pasan a la versión 1', A.ev('S.v') === 1);
  check('Datos', 'antes de migrar guarda una copia intacta de lo que había', A.w.localStorage.getItem(STORE + '.antes-v1') === original);
  A.ev('save()');
  check('Datos', 'lo guardado lleva el número de versión', A.disco().v === 1 && A.disco().entries.length === V4.entries.length);
  A.cerrar();
  const B = await abrir({...V6, v: 1});
  check('Datos', 'con datos ya en la versión 1 no hace copia', B.w.localStorage.getItem(STORE + '.antes-v1') === null);
  B.cerrar();
  const C = await abrir({...V6, v: 5});
  check('Datos', 'datos de una versión más nueva: no baja el número', C.ev('S.v') === 5);
  C.cerrar();
  const D = await abrir('{esto está roto');
  check('Datos', 'datos ilegibles: se apartan en vez de perderse', D.w.localStorage.getItem(STORE + '.danado') === '{esto está roto');
  check('Datos', 'datos ilegibles: la app abre igualmente', !!D.q('#onb-nom'));
  check('Datos', 'sin errores', !D.errores.length, D.errores.join(' | '));
  D.cerrar();
}

async function borrarTodo(){
  console.log('\nBorrar todos los datos');
  const A = await abrir(V6, '#ajustes');
  await A.click('[data-act="wipe"]'); await A.click('[data-act="wipe-yes"]');
  check('Borrar', 'borra también las copias internas', A.w.localStorage.getItem(STORE + '.antes-v1') === null);
  check('Borrar', 'deja la app vacía y vuelve la bienvenida', A.ev('S.entries.length + S.anc.length + S.val.frases.length') === 0 && !!A.q('#onb-nom'));
  check('Borrar', 'sin errores', !A.errores.length, A.errores.join(' | '));
  A.cerrar();
}

console.log('\nCódigo fuente');
check('Fuente', 'index.html está al día con src/ (nadie lo editó a mano)', alDia());
await primerUso();
await version('versión 4', V4);
await version('versión 5', V5, extrasV5);
const copia6 = await version('versión 6', V6, extrasV6);
await informe();
await anclaje();
await inicio();
await recordatorio();
await restaurar(copia6);
await versionDatos();
await borrarTodo();

console.log(`\n${ok} correctas, ${ko} fallidas`);
if (ko){ console.log('\nFallos:\n- ' + fallos.join('\n- ')); process.exit(1); }
