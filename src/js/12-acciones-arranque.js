/* ===================== Acciones ===================== */
const ACT = {
  'go': b => go(b.dataset.to),
  'back': goBack,
  'br-open': b => { if (!b.dataset.keep) BRPRE = null; sheetBr(b.dataset.id); },
  'br-dur': b => { S.settings.resp.dur[b.dataset.id] = +b.dataset.v; save(); keepScroll(render); sheetBr(b.dataset.id); },
  'br-rit': b => { S.settings.resp.ritmo[b.dataset.id] = +b.dataset.v; save(); keepScroll(render); sheetBr(b.dataset.id); },
  'br-son': b => { const t = TEC(b.dataset.id); S.settings.resp.son[t.id] = !sonOf(t); save(); sheetBr(t.id); },
  'br-vib': b => { S.settings.resp.vib = !S.settings.resp.vib; save(); sheetBr(b.dataset.id); },
  'br-antes': b => { BRPRE = BRPRE === +b.dataset.v ? null : +b.dataset.v; sheetBr(b.dataset.id); },
  'br-info': b => sheetBrInfo(b.dataset.id),
  'br-start': b => brStart(b.dataset.id),
  'br-pause': brPause,
  'br-stop': brFinish,
  'br-despues': b => {
    BR.despues = BR.despues === +b.dataset.v ? null : +b.dataset.v;
    if (BR.rec){ BR.rec.despues = BR.despues; save(); }
    brEndScreen();
  },
  'br-again': () => { const id = BR.t.id, d = BR.despues; document.getElementById('br')?.remove(); BR = null; BRPRE = d; brStart(id); },
  'br-done': () => { const a = BR.antes, d = BR.despues; brClose(); if (a != null && d != null) toast(`Tensión: ${a} → ${d}`); },
  'val-start': () => { VAL = {run:true, step:0, f:{}}; for (const f of S.val.frases) VAL.f[f.area] = {palabra:f.palabra, ej:f.ej}; window.scrollTo(0, 0); render(); },
  'val-exit': () => { VAL.run = false; window.scrollTo(0, 0); render(); },
  'val-prev': () => { VAL.step = Math.max(0, VAL.step - 1); window.scrollTo(0, 0); render(); },
  'val-next': () => {
    const v = S.val, id = valSeq()[VAL.step];
    if (id === 'areas' && !v.areas.length) return toast('Elige al menos un área, o toca «Ahora mismo no lo tengo claro»');
    if (id === 'pal'){ if (!v.pal.length) return toast('Marca al menos una palabra'); v.top = v.pal.length <= 5 ? v.pal.slice() : v.top.filter(p => v.pal.includes(p)); }
    if (id === 'top' && !v.top.length) return toast('Elige al menos una');
    if (id === 'frases') return valGuardar();
    VAL.step++; save(); window.scrollTo(0, 0); render();
  },
  'val-area': b => { const l = S.val.areas, i = l.indexOf(b.dataset.id); if (i >= 0) l.splice(i, 1); else if (l.length >= 3) return toast('Hasta 3 áreas, para no dispersarte'); else l.push(b.dataset.id); save(); keepScroll(render); },
  'val-pal': b => { const l = S.val.pal, i = l.indexOf(b.dataset.p); if (i >= 0) l.splice(i, 1); else l.push(b.dataset.p); save(); keepScroll(render); },
  'val-pal-add': () => { const inp = document.getElementById('val-otra'), w = inp.value.trim().replace(/\s+/g, ' ').toLowerCase(); if (!w) return inp.focus(); if (!S.val.pal.includes(w)) S.val.pal.push(w); save(); keepScroll(render); },
  'val-top': b => { const l = S.val.top, i = l.indexOf(b.dataset.p); if (i >= 0) l.splice(i, 1); else if (l.length >= 5) return toast('Hasta 5'); else l.push(b.dataset.p); save(); keepScroll(render); },
  'val-fpal': b => { const f = VAL.f[b.dataset.id] = VAL.f[b.dataset.id] || {}; f.palabra = f.palabra === b.dataset.p ? '' : b.dataset.p; keepScroll(render); },
  'val-libre': sheetValLibre,
  'val-libre-ok': () => { S.val.notas.libre = document.getElementById('val-libre').value.trim(); save(); closeSheet(); toast('Guardado'); },
  'val-usar': () => { S.val.usar = !S.val.usar; save(); keepScroll(render); },
  'val-del': sheetValBorrar,
  'val-del-yes': () => { S.val = structuredClone(DEFAULTS.val); VAL = {run:false, step:0, f:{}}; save(); closeSheet(); render(); toast('Borrado'); },
  'an-val': b => { anHacer(); AN.valor = AN.valor === b.dataset.id ? null : b.dataset.id; if (AN.rec){ AN.rec.valor = AN.valor; save(); } anEndScreen(); },
  'an-idea': b => { const v = AN && valFrase(AN.valor), a = v && valArea(v.area); if (!a) return; document.getElementById('an-hacer').value = a.ideas[+b.dataset.i]; anHacer(); },
  'ed-val': b => { ED.data.val = ED.data.val === b.dataset.id ? '' : b.dataset.id; edChanged(); keepScroll(render); },
  'rev-cerca': b => { const r = S.anc.find(x => x.id === b.dataset.id); if (r){ r.cerca = b.dataset.v; save(); } closeSheet(); toast('Anotado'); },
  'rev': b => anRev(b.dataset.id, b.dataset.v),
  'rev-dif-ok': b => { const r = S.anc.find(x => x.id === b.dataset.id), v = document.getElementById('rev-dif').value.trim(); if (r){ r.dif = v; save(); } closeSheet(); toast('Anotado'); },
  'rev-dif-no': () => { closeSheet(); toast('Anotado'); },
  'onb-ok': () => { S.settings.nombre = document.getElementById('onb-nom').value.trim(); S.settings.onb = true; save(); render(); },
  'onb-skip': () => { S.settings.onb = true; save(); render(); },
  'an-start': b => { const m = b.dataset.m; if (m === 'sim' && !S.settings.anc.nombre && !S.settings.anc.preg) return sheetAnNombre(m); anStart(m); },
  'an-nom': () => sheetAnNombre(null),
  'an-sug': b => { document.getElementById('an-nom').value = b.dataset.n; b.parentNode.querySelectorAll('.chip').forEach(c => c.classList.toggle('on', c === b)); },
  'an-nom-ok': b => anNomSet(document.getElementById('an-nom').value, b.dataset.m),
  'an-nom-no': b => anNomSet(null, b.dataset.m),
  'an-vib': () => { S.settings.anc.vib = !S.settings.anc.vib; save(); keepScroll(render); },
  'an-pause': anPause,
  'an-stop': () => anFinish(false),
  'an-done': anDone,
  'an-abc': () => anToAbc(null),
  'an-abc-add': () => anToAbc('add'),
  'an-abc-solo': () => anToAbc('solo'),
  'new': () => openEditor(null),
  'discard': () => { const d = S.draft; S.draft = null; save(); render(); toast('Borrador descartado', () => { S.draft = d; save(); render(); }); },
  'ed-close': closeEditor,
  'ed-step': b => edGo(+b.dataset.s),
  'ed-prev': () => edGo(ED.step - 1),
  'ed-next': () => edGo(ED.step + 1),
  'ed-save': saveEntry,
  'emo': b => {
    const n = b.dataset.n, i = ED.data.emo.findIndex(x => x.n === n);
    if (i >= 0) ED.data.emo.splice(i, 1); else ED.data.emo.push({n, i:5});
    edChanged(); keepScroll(render);
  },
  'emo-add': () => {
    const inp = document.getElementById('ed-otra'), n = inp.value.trim().replace(/\s+/g, ' ');
    if (!n) return inp.focus();
    const name = cap(n);
    if (!ED.data.emo.some(x => norm(x.n) === norm(name))) ED.data.emo.push({n: EMOS.find(x => norm(x) === norm(name)) || name, i:5});
    edChanged(); keepScroll(render);
  },
  'fis': b => {
    const n = b.dataset.n, i = ED.data.fis.indexOf(n);
    if (i >= 0) ED.data.fis.splice(i, 1); else ED.data.fis.push(n);
    edChanged(); keepScroll(render);
  },
  'open': b => sheetEntry(b.dataset.id),
  'edit': b => openEditor(b.dataset.id),
  'del': b => delEntry(b.dataset.id),
  'lp': b => sheetLp(b.dataset.id),
  'lp-save': b => {
    const v = document.getElementById('lp-txt').value.trim();
    if (!v) return toast('Escribe qué pasó o toca «Nada que añadir»');
    lpSet(b.dataset.id, {lp: v}, 'Registro completado');
  },
  'lp-no': b => lpSet(b.dataset.id, {lpNo: true}, 'Hecho: ya no te lo recordaré'),
  'fil-per': b => { FIL.per = b.dataset.v; renderHistorial(); },
  'fil-emo': b => { FIL.emo = b.dataset.n || null; renderHistorial(); },
  'fil-min': b => { FIL.min = +b.dataset.v; renderHistorial(); },
  'fil-clear': () => { FIL = {emo:null, min:0, per:'all', q:''}; renderHistorial(); },
  'res-per': b => { RES_PER = b.dataset.v; renderResumen(); },
  'theme': b => { S.settings.theme = b.dataset.v; save(); applyTheme(); renderAjustes(); },
  'export': sheetExport,
  'exp-pdf': exportPDF,
  'bk-export': backupExport,
  'mom': b => momento(b.dataset.m),
  'bk-later': () => { S.settings.bk.snooze = Date.now() + BK_POSPONER; save(); keepScroll(render); toast('Te lo recordaré dentro de dos semanas'); },
  'wipe': sheetWipe,
  'wipe-yes': () => { try{ for (const k of Object.keys(localStorage)) if (k.startsWith(STORE + '.')) localStorage.removeItem(k); }catch(_){} // también las copias de seguridad internas
    S = structuredClone(DEFAULTS); VAL = {run:false, step:0, f:{}}; save(); applyTheme(); closeSheet(); ED = null; history.replaceState(null, '', '#inicio'); routeFromHash(); render(); toast('Datos borrados'); },
  'sheet-close': closeSheet,
};
function keepScroll(fn){ const y = window.scrollY; fn(); window.scrollTo(0, y); }
document.addEventListener('click', e => {
  const b = e.target.closest('[data-act]'); if (!b) return;
  const f = ACT[b.dataset.act]; if (f){ e.preventDefault(); f(b, e); }
});
// Lo que se escribe en el editor se guarda al momento como borrador (sin repintar, para no perder el foco)
app.addEventListener('input', e => {
  if (!ED) return;
  const t = e.target;
  if (t.dataset.f){ ED.data[t.dataset.f] = t.value; edChanged(); }
  else if (t.dataset.emo != null){
    const i = +t.dataset.emo, v = +t.value; ED.data.emo[i].i = v; edChanged();
    const lab = document.getElementById('ev' + i); lab.textContent = v; lab.className = 'v num ' + ilvl(v);
  }
});
app.addEventListener('change', e => {
  if (ED && e.target.id === 'ed-at'){ const t = fromLocalInput(e.target.value); if (t){ ED.data.at = t; edChanged(); } }
});
app.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.id === 'ed-otra'){ e.preventDefault(); ACT['emo-add'](); } });

// Lo que se escribe en «Lo que importa» se guarda al momento (sin repintar, para no perder el foco)
app.addEventListener('input', e => {
  const t = e.target;
  if (t.dataset.nota){ S.val.notas[t.dataset.nota] = t.value; save(); }
  else if (t.dataset.fej){ (VAL.f[t.dataset.fej] = VAL.f[t.dataset.fej] || {}).ej = t.value; }
});
// El día cambia a las 05:00: al volver a la app se repinta «Hoy»
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && !ED && !BR && !AN && !document.querySelector('.sheet') && (VIEW === 'inicio' || (VIEW === 'abc' && TAB === 'registrar'))) render();
});
routeFromHash();
applyTheme();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(()=>{});
render();