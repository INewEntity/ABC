/* ===================== Datos ===================== */
const EMOS = ['Ansiedad','Tristeza','Ira','Miedo','Culpa','Vergüenza','Frustración','Soledad','Celos','Asco','Alegría','Calma'];
const FIS = ['Tensión muscular','Palpitaciones','Nudo en el estómago','Falta de aire','Llanto','Temblor','Calor o sudor','Mareo','Cansancio','Dolor de cabeza','Inquietud'];
const PSICO = 'Raúl Triana Guillén'; // psicólogo por defecto: la app es suya
const DEFAULTS = {settings:{nombre:'', psico:PSICO, consulta:'', theme:'auto', resp:{dur:{}, ritmo:{}, son:{}, vib:true}, anc:{nombre:'', vib:true, preg:false}, bk:{last:null, snooze:null}}, entries:[], draft:null, resp:[], anc:[], val:{areas:[], notas:{}, pal:[], top:[], frases:[], usar:true, informe:false}};
// Una práctica de respiración: {id, at (ms), tec, seg (segundos hechos), antes, despues (tensión 0–10 o null)}
// Una entrada: {id, at (ms), a, b, emo:[{n, i 0–10}], fis:[…], fisTxt, cond, cp, lp, cre, upd}
// cp y lp: qué pasó después de la conducta, a corto y a largo plazo (desde la v2)
// Versión de la forma de los datos guardados (S.v). Si un cambio futuro necesita transformar datos antiguos:
// sube DATA_V y añade en MIGRAR el paso de la versión anterior a la nueva. Antes de migrar se guarda una copia
// intacta de lo que había en STORE + '.antes-vN', y si los datos no se pueden leer se apartan en STORE + '.danado'.
const DATA_V = 1;
const MIGRAR = {
  1: () => {}, // v0 → v1: solo se añade el número de versión; los campos nuevos los rellena load()
};
let S;
function load(){
  let raw = null;
  try{ raw = localStorage.getItem(STORE); }catch(_){}
  try{ S = JSON.parse(raw) || {}; }
  catch(e){ S = {}; try{ localStorage.setItem(STORE + '.danado', raw); }catch(_){} } // ilegibles: se apartan en vez de perderlos
  if (!S || typeof S !== 'object' || Array.isArray(S)) S = {};
  const v0 = Math.max(0, Math.floor(+S.v) || 0);
  if (raw && v0 < DATA_V){
    try{ localStorage.setItem(STORE + '.antes-v' + DATA_V, raw); }catch(_){} // copia intacta antes de migrar
    for (let v = v0 + 1; v <= DATA_V; v++) if (MIGRAR[v]) MIGRAR[v](S);
  }
  S = Object.assign(structuredClone(DEFAULTS), S);
  S.settings = Object.assign(structuredClone(DEFAULTS.settings), S.settings);
  if (!Array.isArray(S.entries)) S.entries = [];
  if (!Array.isArray(S.resp)) S.resp = [];
  if (!Array.isArray(S.anc)) S.anc = [];
  S.settings.anc = Object.assign(structuredClone(DEFAULTS.settings.anc), S.settings.anc);
  S.settings.bk = Object.assign(structuredClone(DEFAULTS.settings.bk), S.settings.bk && typeof S.settings.bk === 'object' ? S.settings.bk : {});
  S.val = Object.assign(structuredClone(DEFAULTS.val), S.val);
  for (const k of ['areas', 'pal', 'top', 'frases']) if (!Array.isArray(S.val[k])) S.val[k] = [];
  if (!S.val.notas || typeof S.val.notas !== 'object') S.val.notas = {};
  S.settings.resp = Object.assign(structuredClone(DEFAULTS.settings.resp), S.settings.resp);
  if (!S.settings.psico) S.settings.psico = PSICO; // las versiones 1 y 2 lo dejaban vacío
  if (S.settings.onb === undefined) S.settings.onb = !!(S.entries.length || S.resp.length || S.anc.length || S.settings.nombre); // quien ya usaba la app no ve la bienvenida
  for (const e of S.entries.concat(S.draft ? [S.draft.data] : [])){ e.cp = e.cp || ''; e.lp = e.lp || ''; }
  S.v = Math.max(v0, DATA_V); // nunca se baja: si los datos vienen de una versión más nueva, se respetan
}
function save(){
  try{ localStorage.setItem(STORE, JSON.stringify(S)); return true; }
  catch(e){ toast('No se ha podido guardar: el almacenamiento del móvil está lleno'); return false; }
}
load();
if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(()=>{});
