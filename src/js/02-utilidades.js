/* ===================== Utilidades ===================== */
// Iconos de línea propios (sin emojis ni librerías de fuera): 24×24, trazo redondeado, del color del texto
const IC = {
  registrar:'<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  historial:'<path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z"/><path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z"/>',
  resumen:'<path d="M3 3v18h18"/><path d="M8 17v-4"/><path d="M13 17V7"/><path d="M18 17v-7"/>',
  ajustes:'<path d="M20 7h-9"/><path d="M14 17H4"/><circle cx="7" cy="7" r="3"/><circle cx="17" cy="17" r="3"/>',
  cerrar:'<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  candado:'<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  ancla:'<circle cx="12" cy="5" r="2.5"/><path d="M12 7.5V21"/><path d="M5 12H3a9 9 0 0 0 18 0h-2"/>',
  brujula:'<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
  olas:'<path d="M2 7c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/><path d="M2 12c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/><path d="M2 17c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/>',
  archivo:'<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M9 13h6"/><path d="M9 17h6"/>',
  sonido:'<path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M19 5a10 10 0 0 1 0 14"/>',
  vibrar:'<rect x="8" y="4" width="8" height="16" rx="1.5"/><path d="m4 9-1.5 1.5L4 12l-1.5 1.5L4 15"/><path d="m20 9 1.5 1.5L20 12l1.5 1.5L20 15"/>',
};
const ico = (n, cls = '') => `<svg class="ico${cls ? ' ' + cls : ''}" viewBox="0 0 24 24" aria-hidden="true">${IC[n]}</svg>`;
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const nl = s => esc(s).replace(/\n/g, '<br>');
const pad = n => String(n).padStart(2, '0');
const DAY_MS = 86400e3;
const DAYS_LONG = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
const MONTHS = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
const MONTHS_LONG = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const cap = s => s[0].toUpperCase() + s.slice(1);
const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
// El día de la app empieza a las 05:00: lo de madrugada cuenta en el día anterior
function dayKey(ms = Date.now()){ const x = new Date(ms - 5*3600e3); return x.getFullYear()+'-'+pad(x.getMonth()+1)+'-'+pad(x.getDate()); }
function keyToDate(k){ const [y,m,d] = k.split('-').map(Number); return new Date(y, m-1, d, 12); }
function addDays(k, n){ const d = keyToDate(k); d.setDate(d.getDate()+n); return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate()); }
function weekStart(k){ return addDays(k, -((keyToDate(k).getDay() + 6) % 7)); }
function dayTitle(k){
  const t = dayKey(); if (k === t) return 'Hoy'; if (k === addDays(t, -1)) return 'Ayer';
  const d = keyToDate(k);
  return cap(DAYS_LONG[d.getDay()]) + ' ' + d.getDate() + ' ' + MONTHS[d.getMonth()] + (d.getFullYear() !== new Date().getFullYear() ? ' ' + d.getFullYear() : '');
}
const hhmm = ms => { const d = new Date(ms); return pad(d.getHours())+':'+pad(d.getMinutes()); };
const dmy = ms => { const d = new Date(ms); return pad(d.getDate())+'/'+pad(d.getMonth()+1)+'/'+d.getFullYear(); };
const longDate = ms => { const d = new Date(ms); return cap(DAYS_LONG[d.getDay()]) + ' ' + d.getDate() + ' de ' + MONTHS_LONG[d.getMonth()] + ' de ' + d.getFullYear(); };
const dateVal = ms => { const d = new Date(ms); return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate()); };
const toLocalInput = ms => dateVal(ms) + 'T' + hhmm(ms);
const fromLocalInput = s => { const t = new Date(s).getTime(); return isFinite(t) ? t : null; };
function fromDateVal(s, end){ if (!/^\d{4}-\d{2}-\d{2}$/.test(s || '')) return null; const [y,m,d] = s.split('-').map(Number); return end ? new Date(y, m-1, d, 23, 59, 59, 999).getTime() : new Date(y, m-1, d).getTime(); }
const dec = n => (Math.round(n * 10) / 10).toLocaleString('es-ES');

const maxI = e => e.emo.reduce((a, x) => Math.max(a, x.i), 0);
const byI = e => e.emo.slice().sort((a, b) => b.i - a.i);
const ilvl = i => i >= 7 ? 'hi' : i >= 4 ? 'mid' : 'lo';
const emoChip = x => `<span class="ich ${ilvl(x.i)}">${esc(x.n)} <b class="num">${x.i}</b></span>`;
const emoTxt = e => byI(e).map(x => x.n + ' ' + x.i).join(', ');
const fisTxt = e => e.fis.join(', ') + (e.fisTxt ? (e.fis.length ? ' · ' : '') + e.fisTxt : '');
const sorted = () => S.entries.slice().sort((a, b) => b.at - a.at);
function inPeriod(list, per){
  if (per === 'all') return list;
  const from = addDays(dayKey(), -(+per - 1));
  return list.filter(e => dayKey(e.at) >= from);
}

function toast(msg, undo){
  document.querySelectorAll('.toast').forEach(t => t.remove());
  const t = document.createElement('div'); t.className = 'toast'; t.innerHTML = esc(msg) + (undo ? ' <button>Deshacer</button>' : '');
  if (undo) t.querySelector('button').onclick = () => { undo(); t.remove(); };
  document.body.appendChild(t); setTimeout(() => t.remove(), 4500);
}
function sheet(html, onMount){
  const root = document.getElementById('sheet-root');
  root.innerHTML = `<div class="sheet-bg"><div class="sheet" role="dialog" aria-modal="true"><div class="grab"></div>${html}</div></div>`;
  const bg = root.firstChild;
  bg.addEventListener('click', e => { if (e.target === bg) closeSheet(); });
  if (onMount) onMount(bg.querySelector('.sheet'));
}
function closeSheet(){ document.getElementById('sheet-root').innerHTML = ''; }
