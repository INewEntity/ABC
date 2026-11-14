/* ===================== Ajustes ===================== */
function renderAjustes(){
  const s = S.settings;
  app.innerHTML = `<header class="top">${BACK}<div class="ht"><h1>Ajustes</h1></div></header>
  <div class="card">
    <label class="f" style="margin-top:0">Tu nombre</label><input data-s="nombre" maxlength="60" autocomplete="name" value="${esc(s.nombre)}" placeholder="Sale en el informe (opcional)">
    <label class="f">Tu psicólogo</label><input data-s="psico" maxlength="60" value="${esc(s.psico)}" placeholder="${PSICO}">
  </div>
  <div class="card">
    <label class="f" style="margin-top:0">Para tu psicólogo</label>
    <button class="btn pri" style="width:100%" data-act="export">Exportar informe en PDF</button>
  </div>
  <div class="card">
    <label class="f" style="margin-top:0">Anclaje</label>
    <div class="row" style="justify-content:space-between"><span>Lo llamas <b>«${esc(anN())}»</b></span><button class="btn sm" data-act="an-nom">Cambiar</button></div>
  </div>
  <div class="card">
    <label class="f" style="margin-top:0">Tema</label>
    <div class="seg">${[['auto','Auto'],['dark','Oscuro'],['light','Claro']].map(([v, l]) => `<button data-act="theme" data-v="${v}" class="${s.theme === v ? 'on' : ''}">${l}</button>`).join('')}</div>
  </div>
  <div class="card">
    <label class="f" style="margin-top:0">${ico('candado', 'inl')}Privacidad</label>
    <div class="muted small">Tus registros se guardan <b>solo en este móvil</b>. La app no tiene servidor ni cuentas y no envía nada a ningún sitio: solo sale lo que tú exportas y mandas. Si desinstalas la app o borras los datos de Chrome, se pierden; para no perderlos, guarda una copia de seguridad de vez en cuando.</div>
  </div>
  <div class="card">
    <label class="f" style="margin-top:0">Copia de seguridad</label>
    <div class="actions" style="margin-top:0"><button class="btn" data-act="bk-export">Exportar</button><label class="btn" style="cursor:pointer">Importar<input type="file" accept="application/json,.json" id="imp" hidden></label></div>
    <div class="muted small num" style="margin-top:8px">Última copia: ${S.settings.bk.last ? dmy(S.settings.bk.last) : 'nunca'}.</div>
    <div class="muted small" style="margin-top:8px">La copia lleva todos tus registros: guárdala en un sitio privado. Al importar se añaden los registros que falten; no se borra nada.</div>
  </div>
  <div class="card">
    <button class="btn danger" style="width:100%" data-act="wipe">Borrar todos los datos</button>
  </div>
  <div class="muted num" style="text-align:center;font-size:12px">${esc(APP_NOMBRE)} · versión ${VERSION} · ${S.entries.length} registro${S.entries.length === 1 ? '' : 's'}</div>
  ${CRISIS}`;
  app.querySelectorAll('[data-s]').forEach(inp => inp.addEventListener('change', () => {
    S.settings[inp.dataset.s] = inp.value.trim();
    if (inp.dataset.s === 'psico' && !S.settings.psico) inp.value = S.settings.psico = PSICO; // vacío = el de siempre
    save(); toast('Guardado');
  }));
  app.querySelector('#imp').addEventListener('change', async e => {
    const f = e.target.files[0]; if (!f) return; e.target.value = '';
    try{
      const data = JSON.parse(await f.text());
      if (!data || !Array.isArray(data.entries)) throw 0;
      const valid = data.entries.filter(x => x && typeof x.id === 'string' && typeof x.at === 'number' && typeof x.a === 'string' && typeof x.b === 'string' && Array.isArray(x.emo))
        .map(x => ({id:x.id, at:x.at, a:x.a, b:x.b, emo:x.emo.filter(y => y && typeof y.n === 'string').map(y => ({n:y.n.slice(0, 30), i:Math.max(0, Math.min(10, Math.round(+y.i || 0)))})),
          fis:Array.isArray(x.fis) ? x.fis.filter(y => typeof y === 'string') : [], fisTxt:String(x.fisTxt || ''), cond:String(x.cond || ''), cp:String(x.cp || ''), lp:String(x.lp || ''), ...(x.lpNo ? {lpNo:true} : {}), ...(typeof x.anc === 'string' ? {anc:x.anc} : {}), ...(typeof x.val === 'string' ? {val:x.val} : {}), cre:+x.cre || x.at, upd:+x.upd || x.at}));
      let added = 0, updated = 0;
      for (const x of valid){
        const i = S.entries.findIndex(y => y.id === x.id);
        if (i < 0){ S.entries.push(x); added++; }
        else if (x.upd > (S.entries[i].upd || 0)){ S.entries[i] = x; updated++; }
      }
      if (data.settings) for (const k of ['nombre','consulta']) if (!S.settings[k] && typeof data.settings[k] === 'string') S.settings[k] = data.settings[k];
      let addedR = 0; // prácticas de respiración (copias desde la v5)
      if (Array.isArray(data.resp)) for (const x of data.resp){
        if (!x || typeof x.id !== 'string' || typeof x.at !== 'number' || !TEC(x.tec) || S.resp.some(y => y.id === x.id)) continue;
        S.resp.push({id:x.id, at:x.at, tec:x.tec, seg:Math.max(0, Math.round(+x.seg || 0)), antes:tens(x.antes), despues:tens(x.despues)}); addedR++;
      }
      let addedV = 0;
      let addedA = 0; // sesiones de anclaje (copias desde la v6)
      if (Array.isArray(data.anc)) for (const x of data.anc){
        if (!x || typeof x.id !== 'string' || typeof x.at !== 'number' || !['real','sim'].includes(x.modo)) continue;
        const n = {id:x.id, at:x.at, modo:x.modo, seg:Math.max(0, Math.round(+x.seg || 0)), fin:!!x.fin, hacer:String(x.hacer || '').slice(0, 500), abc:typeof x.abc === 'string' ? x.abc : null,
          rev:['si','intento','no'].includes(x.rev) ? x.rev : null, revAt:+x.revAt || null, dif:String(x.dif || '').slice(0, 500),
          valor:typeof x.valor === 'string' ? x.valor : null, cerca:['si','poco','no'].includes(x.cerca) ? x.cerca : null};
        const y = S.anc.find(z => z.id === x.id);
        if (!y){ S.anc.push(n); addedA++; }
        else if (!y.rev && n.rev){ y.rev = n.rev; y.revAt = n.revAt; y.dif = n.dif; } // la revisión que ya estaba hecha en la copia
        else if (y.rev && y.rev === n.rev && !y.dif && n.dif) y.dif = n.dif;
        if (y){ if (!y.valor && n.valor) y.valor = n.valor; if (!y.cerca && n.cerca) y.cerca = n.cerca; }
      }
      if (data.val && typeof data.val === 'object' && !S.val.frases.length && Array.isArray(data.val.frases)){ // los valores se traen solo si aquí aún no hay ninguno
        const ids = new Set(VAL_AREAS.map(a => a.id)), str = (l, n) => (Array.isArray(l) ? l : []).filter(y => typeof y === 'string').map(y => y.slice(0, 30)).slice(0, n);
        S.val.areas = str(data.val.areas, 3).filter(a => ids.has(a)); S.val.pal = str(data.val.pal, 80); S.val.top = str(data.val.top, 5);
        S.val.frases = data.val.frases.filter(f => f && typeof f.id === 'string' && ids.has(f.area) && typeof f.palabra === 'string').slice(0, 3)
          .map(f => ({id:f.id, area:f.area, palabra:f.palabra.slice(0, 30), ej:String(f.ej || '').slice(0, 200)}));
        if (data.val.notas && typeof data.val.notas === 'object') for (const k of [...ids, 'libre']) if (typeof data.val.notas[k] === 'string') S.val.notas[k] = data.val.notas[k].slice(0, 600);
        S.val.usar = data.val.usar !== false; S.val.informe = data.val.informe === true; addedV = S.val.frases.length;
      }
      if (data.settings && data.settings.anc && !S.settings.anc.nombre && typeof data.settings.anc.nombre === 'string') S.settings.anc.nombre = anClean(data.settings.anc.nombre);
      save(); render();
      toast(`Importado: ${added} registro${added === 1 ? '' : 's'} nuevo${added === 1 ? '' : 's'}` + (updated ? `, ${updated} actualizado${updated === 1 ? '' : 's'}` : '') + (addedR ? `, ${addedR} práctica${addedR === 1 ? '' : 's'} de respiración` : '') + (addedA ? `, ${addedA} anclaje${addedA === 1 ? '' : 's'}` : '') + (addedV ? ', tus valores' : ''));
    }catch(_){ toast('Ese archivo no es una copia válida'); }
  });
}
async function backupExport(){
  const data = {app:'registro-abc', version:VERSION, exportado:new Date().toISOString(), settings:S.settings, entries:S.entries, resp:S.resp, anc:S.anc, val:S.val};
  const ok = await shareOrDownload(new Blob([JSON.stringify(data, null, 1)], {type:'application/json'}), 'Copia ' + APP_NOMBRE + ' ' + dmy(Date.now()).replace(/\//g, '-') + '.json');
  if (ok){ S.settings.bk.last = Date.now(); S.settings.bk.snooze = null; save(); if (VIEW === 'inicio' || VIEW === 'ajustes') keepScroll(render); }
}
// Recordatorio de copia: los datos solo viven en este móvil. Sale en Inicio si hay cambios sin copiar y hace un mes
// de la última copia (o, si nunca se hizo, cuando el primer dato tiene dos semanas). «Ahora no» lo aparta dos semanas.
const BK_CADA = 30 * DAY_MS, BK_PRIMERA = 14 * DAY_MS, BK_POSPONER = 14 * DAY_MS;
function bkUltimoCambio(){
  let t = 0;
  for (const e of S.entries) t = Math.max(t, e.upd || e.at);
  for (const r of S.anc) t = Math.max(t, r.at, r.revAt || 0);
  for (const r of S.resp) t = Math.max(t, r.at);
  return Math.max(t, S.val.upd || 0);
}
function bkPrimerDato(){ return Math.min(Infinity, ...S.entries.map(e => e.at), ...S.anc.map(r => r.at), ...S.resp.map(r => r.at)); }
function bkPendiente(now = Date.now()){
  const b = S.settings.bk, ult = bkUltimoCambio();
  if (!ult || (b.snooze && now < b.snooze)) return false;
  return b.last ? ult > b.last && now - b.last >= BK_CADA : now - bkPrimerDato() >= BK_PRIMERA;
}
function bkCard(){
  return bkPendiente() ? `<div class="card pend"><b>Guarda una copia de tus datos</b>
    <div class="muted small" style="margin-top:4px">Solo están en este móvil. Si se borran los datos del navegador o cambias de móvil, se perderían.</div>
    <div class="actions"><button class="btn" data-act="bk-later">Ahora no</button><button class="btn pri" data-act="bk-export">Guardar copia</button></div></div>` : '';
}
function sheetWipe(){
  sheet(`<h2>¿Borrar todos los datos?</h2><div class="sub">Se borrarán ${S.entries.length} registro${S.entries.length === 1 ? '' : 's'}, ${S.resp.length} práctica${S.resp.length === 1 ? '' : 's'} de respiración, ${S.anc.length} anclaje${S.anc.length === 1 ? '' : 's'} y los ajustes de este móvil. No se puede deshacer; si quieres conservarlos, exporta antes una copia.</div>
    <div class="actions"><button class="btn" data-act="sheet-close">Cancelar</button><button class="btn danger" data-act="wipe-yes">Borrar todo</button></div>`);
}
