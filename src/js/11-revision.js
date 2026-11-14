/* ----- Acción propuesta al terminar el Anclaje y su revisión al día siguiente ----- */
// En cada sesión: hacer (la acción), rev ('si' | 'intento' | 'no' | null), revAt, dif (qué lo puso difícil, si fue «no»)
const REV_TXT = {si:'hecho', intento:'lo intenté', no:'no hecho'};
function revPend(){ // la acción más reciente de un día anterior (hasta 7 días atrás) que aún no se ha revisado
  const k = dayKey(), min = addDays(k, -7);
  return S.anc.filter(r => r.hacer && !r.rev && dayKey(r.at) < k && dayKey(r.at) >= min).sort((a, b) => b.at - a.at)[0] || null;
}
function revCard(){
  const r = revPend(); if (!r) return '';
  const b = (v, l, c) => `<button class="btn ${c || ''}" data-act="rev" data-id="${esc(r.id)}" data-v="${v}">${l}</button>`;
  return `<div class="card pend"><b>¿Lo hiciste?</b>
    <div style="margin:8px 0 2px">«${esc(r.hacer)}»</div><div class="muted small">${dayTitle(dayKey(r.at))}</div>${valSub(r.valor)}
    <div class="actions">${b('no', 'No')}${b('intento', 'Lo intenté')}${b('si', 'Sí', 'pri')}</div></div>`;
}
function anRev(id, v){
  const r = S.anc.find(x => x.id === id); if (!r) return;
  r.rev = v; r.revAt = Date.now(); save(); render();
  if (v === 'no') sheetRevDif(id); else if (valFrase(r.valor)) sheetRevCerca(id); else toast('Anotado');
}
function sheetRevDif(id){
  sheet(`<h2>Anotado</h2><div class="sub">No pasa nada. Si quieres, apunta qué te lo puso difícil.</div>
    <textarea id="rev-dif" rows="3" maxlength="500" style="margin-top:12px;min-height:90px" placeholder="Ej.: Estaba muy cansado y lo dejé para después."></textarea>
    <div class="actions"><button class="btn ghost" data-act="rev-dif-no">Omitir</button><button class="btn pri" data-act="rev-dif-ok" data-id="${esc(id)}">Guardar</button></div>`);
}
