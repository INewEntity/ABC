/* ===================== Exportar para el psicólogo ===================== */
// Se exporta siempre todo (desde el primer dato hasta hoy) y solo en PDF
function expRange(){
  const now = Date.now();
  return {from: Math.min(now, ...S.entries.map(e => e.at), ...S.anc.map(r => r.at), ...S.resp.map(r => r.at)), to: now};
}
function expList(){ const {from, to} = expRange(); return S.entries.filter(e => e.at >= from && e.at <= to).sort((a, b) => a.at - b.at); }
function fileBase(){
  const {from, to} = expRange(), f = ms => dmy(ms).replace(/\//g, '-');
  return (APP_NOMBRE + ' ' + (S.settings.nombre ? S.settings.nombre + ' ' : '') + f(from) + ' a ' + f(to)).replace(/[\\/:*?"<>|]/g, '');
}
function sheetExport(){
  sheet(`<h2>Exportar para tu psicólogo</h2><div class="sub">Se crea un PDF con todo lo que has registrado.</div>
    <div class="muted num" style="margin:12px 4px" id="exp-n">${expCuenta()}</div>
    <button class="btn pri big" data-act="exp-pdf">${ico('archivo')}Crear PDF</button>
    <div class="muted small" style="margin-top:8px">Se abre la ventana de imprimir: elige «Guardar como PDF» y después compártelo.</div>
    <div class="note">El informe lleva datos de salud. Cuando lo envíes, quedará también donde lo mandes (el chat o el correo): mándalo solo a tu psicólogo.</div>`);
}
// El informe es para el psicólogo: lleva todo lo del periodo (registros ABC, anclajes y acciones, respiración y valores).
function ancList(){ const {from, to} = expRange(); return S.anc.filter(r => r.at >= from && r.at <= to).sort((a, b) => a.at - b.at); }
function ancLine(){
  const l = ancList(), re = l.filter(r => r.modo === 'real').length, si = l.length - re;
  return l.length ? `Anclaje: ${re} en un momento real · ${si} simulacro${si === 1 ? '' : 's'}.` : 'Anclaje: ninguno.';
}
function accList(){ return ancList().filter(r => r.hacer); }
function accLine(){ // acciones que la persona se propuso al terminar el Anclaje y cómo salieron
  const l = accList(); if (!l.length) return '';
  const c = v => l.filter(r => r.rev === v).length, sin = l.filter(r => !r.rev).length;
  return `Acciones propuestas: ${l.length} · hechas: ${c('si')} · intentadas: ${c('intento')} · no hechas: ${c('no')}${sin ? ' · sin revisar: ' + sin : ''}.`;
}
function respList(){ const {from, to} = expRange(); return S.resp.filter(r => r.at >= from && r.at <= to).sort((a, b) => a.at - b.at); }
function respLine(){
  const l = respList(); if (!l.length) return 'Respiración: ninguna práctica.';
  const min = Math.round(l.reduce((a, r) => a + r.seg, 0) / 60), p = l.filter(r => r.antes != null && r.despues != null), m = f => dec(p.reduce((a, r) => a + f(r), 0) / p.length);
  return `Respiración: ${l.length} práctica${l.length === 1 ? '' : 's'}, ${min} min en total` + (p.length ? ` · tensión media antes → después: ${m(r => r.antes)} → ${m(r => r.despues)} (en ${p.length})` : '') + '.';
}
const respTec = r => (TEC(r.tec) || {n: r.tec}).n;
const respTens = r => r.antes != null || r.despues != null ? `${r.antes ?? '—'} → ${r.despues ?? '—'}` : '';
const ancTipo = r => (r.modo === 'sim' ? 'Simulacro' : 'Momento real') + (r.fin ? '' : ' (paró antes del final)');
const ancNombreTxt = () => `Llama «${anN()}» a lo que le aparece${S.settings.anc.nombre ? '' : ' (el nombre por defecto)'}.`;
function expVacio(){ return !expList().length && !ancList().length && !respList().length; }
function expCuenta(){
  const n = expList().length, a = ancList().length, r = respList().length;
  return `${n} registro${n === 1 ? '' : 's'} · ${a} anclaje${a === 1 ? '' : 's'} · ${r} práctica${r === 1 ? '' : 's'} de respiración`;
}
function reportHtml(list){
  const {from, to} = expRange(), s = S.settings, st = stats(list), now = Date.now(), an = ancList(), rs = respList();
  return `<h1>${esc(APP_NOMBRE)} · informe</h1>
    <div class="meta">${s.nombre ? `<b>Paciente:</b> ${esc(s.nombre)} · ` : ''}${s.psico ? `<b>Psicólogo:</b> ${esc(s.psico)} · ` : ''}<b>Periodo:</b> ${dmy(from)} – ${dmy(to)}</div>
    <h2>Resumen del periodo</h2>
    <p>Registros ABC: ${st.n}${st.n ? ` en ${st.dias} día${st.dias === 1 ? '' : 's'}` : ''}.<br>${esc(ancLine())}${accLine() ? '<br>' + esc(accLine()) : ''}<br>${esc(respLine())}</p>
    ${st.n ? `<table class="rs"><tr><th>Emoción</th><th>Veces</th><th>Intensidad media</th><th>Máxima</th></tr>
      ${st.emos.map(e => `<tr><td>${esc(e.n)}</td><td class="n">${e.c}</td><td class="n">${dec(e.sum / e.c)}</td><td class="n">${e.max}</td></tr>`).join('')}</table>
    <p>Intensidad de cada registro (la emoción más intensa): baja (0–3) ${st.buckets.lo} · media (4–6) ${st.buckets.mid} · alta (7–10) ${st.buckets.hi}.
      ${st.fis.length ? `<br>En el cuerpo, lo más frecuente: ${st.fis.slice(0, 5).map(([n, c]) => esc(n) + ' (' + c + ')').join(', ')}.` : ''}</p>` : ''}
    ${valHtml()}
    <h2>Registros ABC</h2>
    ${list.length ? `<table class="rg"><thead><tr><th style="width:9%">Fecha</th><th style="width:18%">A · Antecedente</th><th style="width:18%">B · Pensamientos</th><th style="width:12%">C · Emociones (0–10)</th><th style="width:11%">C · En el cuerpo</th><th style="width:15%">C · Qué hizo</th><th style="width:17%">C · Después (corto / largo plazo)</th></tr></thead>
      <tbody>${list.map(e => `<tr><td>${cap(DAYS_LONG[new Date(e.at).getDay()]).slice(0, 3)} ${dmy(e.at)}<br>${hhmm(e.at)}</td><td>${esc(e.a)}</td><td>${esc(e.b)}${e.val && valPal(e.val) ? `<br><i>Le importaba: «${esc(valPal(e.val))}»</i>` : ''}</td><td>${esc(emoTxt(e))}</td><td>${esc(fisTxt(e))}</td><td>${esc(e.cond)}</td><td>${e.cp ? '<b>Corto:</b> ' + esc(e.cp) : ''}${e.cp && e.lp ? '<br>' : ''}${e.lp ? '<b>Largo:</b> ' + esc(e.lp) : ''}</td></tr>`).join('')}</tbody></table>` : '<p>Sin registros ABC en el periodo.</p>'}
    <h2>Anclaje y acciones</h2>
    ${an.length ? `<p>${esc(ancNombreTxt())}</p>
    <table class="rg"><thead><tr><th style="width:10%">Fecha</th><th style="width:13%">Tipo</th><th style="width:24%">Acción propuesta</th><th style="width:12%">Valor</th><th style="width:16%">Resultado</th><th style="width:25%">Qué lo puso difícil</th></tr></thead>
      <tbody>${an.map(r => `<tr><td>${dmy(r.at)}<br>${hhmm(r.at)}</td><td>${esc(ancTipo(r))}</td><td>${esc(r.hacer || '—')}</td><td>${r.valor && valPal(r.valor) ? '«' + esc(valPal(r.valor)) + '»' : ''}</td><td>${r.hacer ? esc(accRes(r)) : ''}</td><td>${esc(r.dif || '')}</td></tr>`).join('')}</tbody></table>` : '<p>Sin sesiones de Anclaje en el periodo.</p>'}
    <h2>Respiración</h2>
    ${rs.length ? `<table class="rg"><thead><tr><th style="width:16%">Fecha</th><th style="width:34%">Técnica</th><th style="width:14%">Minutos</th><th style="width:36%">Tensión antes → después (0–10)</th></tr></thead>
      <tbody>${rs.map(r => `<tr><td>${dmy(r.at)}<br>${hhmm(r.at)}</td><td>${esc(respTec(r))}</td><td>${Math.max(1, Math.round(r.seg / 60))}</td><td>${respTens(r)}</td></tr>`).join('')}</tbody></table>` : '<p>Sin prácticas de respiración en el periodo.</p>'}
    <div class="foot">Generado con ${esc(APP_NOMBRE)} el ${dmy(now)} a las ${hhmm(now)}. Contiene datos de salud: confidencial.</div>`;
}
function exportPDF(){
  if (expVacio()) return toast('No hay nada en ese periodo');
  document.getElementById('print').innerHTML = reportHtml(expList());
  const t = document.title; document.title = fileBase();
  const done = () => { document.title = t; document.getElementById('print').innerHTML = ''; window.removeEventListener('afterprint', done); };
  window.addEventListener('afterprint', done);
  setTimeout(() => window.print(), 50);
}
// Versión en texto del informe: no se exporta; las pruebas automáticas la usan para leer el contenido
function reportText(list){
  const {from, to} = expRange(), s = S.settings, an = ancList(), rs = respList();
  const lines = [`${APP_NOMBRE} · informe` + (s.nombre ? ' · ' + s.nombre : ''), `Periodo: ${dmy(from)} – ${dmy(to)}`, '',
    `Registros ABC: ${list.length}.`, ancLine(), ...(accLine() ? [accLine()] : []), respLine(), '', ...valText()];
  if (list.length) lines.push('REGISTROS ABC', '');
  for (const e of list){
    lines.push(`— ${cap(DAYS_LONG[new Date(e.at).getDay()])} ${dmy(e.at)}, ${hhmm(e.at)}`, `A · Antecedente: ${e.a}`, `B · Pensamientos: ${e.b}`, `C · Emociones: ${emoTxt(e)}`);
    if (e.fis.length || e.fisTxt) lines.push(`C · En el cuerpo: ${fisTxt(e)}`);
    if (e.cond) lines.push(`C · Qué hice: ${e.cond}`);
    if (e.cp) lines.push(`C · Justo después: ${e.cp}`);
    if (e.lp) lines.push(`C · Más adelante: ${e.lp}`);
    if (e.val && valPal(e.val)) lines.push(`Le importaba: «${valPal(e.val)}»`);
    lines.push('');
  }
  if (an.length){
    lines.push('ANCLAJE Y ACCIONES', ancNombreTxt());
    for (const r of an) lines.push(`— ${dmy(r.at)}, ${hhmm(r.at)} · ${ancTipo(r)}` + (r.hacer ? ` · Acción: ${r.hacer} (${accRes(r)})` : '')
      + (r.valor && valPal(r.valor) ? ` · Valor: «${valPal(r.valor)}»` : '') + (r.dif ? ` · Qué lo puso difícil: ${r.dif}` : ''));
    lines.push('');
  }
  if (rs.length){
    lines.push('RESPIRACIÓN');
    for (const r of rs) lines.push(`— ${dmy(r.at)}, ${hhmm(r.at)} · ${respTec(r)} · ${Math.max(1, Math.round(r.seg / 60))} min` + (respTens(r) ? ` · tensión ${respTens(r)}` : ''));
  }
  return lines.join('\n').trim();
}
async function shareOrDownload(blob, name){ // true si se compartió o se descargó; false si la persona canceló
  const f = new File([blob], name, {type: blob.type});
  if (navigator.canShare && navigator.canShare({files:[f]})){
    try{ await navigator.share({files:[f], title:name}); return true; }catch(e){ if (e.name === 'AbortError') return false; }
  }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  toast('Archivo guardado en Descargas');
  return true;
}
