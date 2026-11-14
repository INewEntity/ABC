/* ===================== Registrar ===================== */
function renderRegistrar(){
  const k = dayKey(), hoy = sorted().filter(e => dayKey(e.at) === k).reverse();
  const semana = S.entries.filter(e => dayKey(e.at) >= weekStart(k)).length;
  const d = S.draft, pend = sorted().filter(e => lpPending(e));
  app.innerHTML = `<header class="top">${BACK}<div class="ht"><h1>Autorregistro ABC</h1><div class="sub">${longDate(Date.now())}</div></div>
    ${semana ? `<span class="chip num">${semana} esta semana</span>` : ''}</header>
  ${pend.length ? `<div class="card pend"><b>${pend.length === 1 ? 'Un registro por completar' : pend.length + ' registros por completar'}</b>
      <div class="muted small" style="margin:2px 0 8px">¿Qué pasó después, horas o días más tarde?</div>
      ${pend.slice(0, 5).map(e => `<button class="opt" data-act="lp" data-id="${esc(e.id)}"><span class="pa">${esc(e.a)}</span><span class="d num">${dayTitle(dayKey(e.at))} · ${hhmm(e.at)}</span></button>`).join('')}
      ${pend.length > 5 ? `<div class="muted small" style="margin-top:8px">y ${pend.length - 5} más en el Historial</div>` : ''}</div>` : ''}
  ${d ? `<div class="card"><b>Tienes un registro a medias</b><div class="muted small" style="margin-top:4px">${esc((d.data.a || d.data.b || 'Sin texto todavía').slice(0, 90))}</div>
      <div class="actions"><button class="btn pri" data-act="new">Seguir</button><button class="btn ghost" data-act="discard">Descartar</button></div></div>`
    : `<button class="btn pri big" data-act="new"><span style="font-size:24px">＋</span> Nuevo registro</button>`}
  <details class="card" style="margin-top:12px" ${S.entries.length ? '' : 'open'}><summary>¿Cómo se rellena?</summary>
    <ul class="abc" style="margin-top:12px">
      <li><span class="L">A</span><span><b>Antecedente:</b> lo que lo desencadenó. Algo de fuera (dónde, con quién, qué pasó) o de dentro (un recuerdo, una sensación, una idea). Solo los hechos.</span></li>
      <li><span class="L">B</span><span><b>Pensamientos:</b> lo que te pasó por la cabeza en ese momento, tal cual, en frases.</span></li>
      <li><span class="L">C</span><span><b>Consecuencias:</b> qué sentiste y con qué intensidad (0–10), qué notaste en el cuerpo, qué hiciste y qué pasó después.</span></li>
    </ul>
    <div class="muted small" style="margin-top:12px">Mejor apuntarlo cuanto antes, cuando aún recuerdas lo que pensaste. No hace falta escribir mucho.</div>
  </details>
  <h3 class="sec"><span>Hoy</span><span class="num">${hoy.length || ''}</span></h3>
  ${hoy.length ? hoy.map(entryCard).join('') : `<div class="empty">Aún no hay registros hoy.</div>`}
  ${CRISIS}`;
}
// Discreto, al pie de Registrar y Ajustes
const CRISIS = `<div class="crisis">¿Estás en crisis o piensas en hacerte daño? Llama al <a href="tel:024">024</a> (gratis, 24 h) o al <a href="tel:112">112</a>.</div>`;
function entryCard(e){
  return `<button class="ecard" data-act="open" data-id="${esc(e.id)}"><div class="eh"><span class="et num">${hhmm(e.at)}</span><span class="emos">${byI(e).map(emoChip).join('')}</span></div>
    <div class="ea">${esc(e.a)}</div><div class="eb">«${esc(e.b)}»</div>${lpPending(e) ? '<div class="falta">Falta: qué pasó más adelante</div>' : ''}</button>`;
}

/* ===================== «Más adelante» pendiente ===================== */
// Pasadas 12 h, se pide completar qué pasó más adelante. Solo registros de las últimas 2 semanas y sin «Omitir».
const LP_MIN = 12 * 3600e3, LP_MAX = 14 * DAY_MS;
function lpPending(e, now = Date.now()){ return !e.lp && !e.lpNo && now - e.at >= LP_MIN && now - e.at <= LP_MAX; }
function sheetLp(id){
  const e = S.entries.find(x => x.id === id); if (!e) return;
  sheet(`<h2>¿Qué pasó después?</h2><div class="sub">${dayTitle(dayKey(e.at))} · ${hhmm(e.at)}</div>
    <div class="dsec" style="margin-top:8px"><div class="dl"><span class="L">A</span>Antecedente</div><p>${nl(e.a)}</p></div>
    ${e.cond ? `<div class="dsec"><div class="ttl" style="margin-top:0">Qué hice</div><p>${nl(e.cond)}</p></div>` : ''}
    ${e.cp ? `<div class="dsec"><div class="ttl" style="margin-top:0">Justo después</div><p>${nl(e.cp)}</p></div>` : ''}
    <label class="f" style="margin-top:16px">Más adelante (horas o días después)</label>
    <textarea id="lp-txt" rows="3" style="min-height:90px" placeholder="¿Qué efecto tuvo después? Ej.: Al día siguiente me daba más miedo hablar con ella."></textarea>
    <div class="actions"><button class="btn ghost" data-act="lp-no" data-id="${esc(e.id)}">Nada que añadir</button><button class="btn pri" data-act="lp-save" data-id="${esc(e.id)}">Guardar</button></div>`,
    el => el.querySelector('#lp-txt').focus());
}
function lpSet(id, fields, msg){
  const e = S.entries.find(x => x.id === id); if (!e) return;
  Object.assign(e, fields, {upd: Date.now()}); save(); closeSheet(); render(); toast(msg);
}

/* ===================== Editor (A → B → C) ===================== */
const blank = () => ({at: Date.now(), a:'', b:'', emo:[], fis:[], fisTxt:'', cond:'', cp:'', lp:'', val:''});
const isBlank = d => !d.a.trim() && !d.b.trim() && !d.emo.length && !d.fis.length && !d.fisTxt.trim() && !d.cond.trim() && !d.cp.trim() && !d.lp.trim();
function openEditor(id){
  closeSheet();
  if (id){ const e = S.entries.find(x => x.id === id); if (!e) return; ED = {id, step:0, data:structuredClone(e)}; }
  else if (S.draft) ED = S.draft;
  else { ED = {id:null, step:0, data:blank()}; S.draft = ED; save(); }
  window.scrollTo(0, 0); render();
}
function edChanged(){ if (!ED.id){ S.draft = ED; save(); } }
function closeEditor(){
  if (!ED.id){
    if (isBlank(ED.data)) S.draft = null; else toast('Guardado como borrador');
    save();
  }
  ED = null; window.scrollTo(0, 0); render();
}
const STEPS = [['A','Antecedente'],['B','Pensamientos'],['C','Consecuencias']];
function stepOk(i, d){ return i === 0 ? !!d.a.trim() : i === 1 ? !!d.b.trim() : d.emo.length > 0; }
function renderEditor(){
  const d = ED.data, st = ED.step;
  let body;
  if (st === 0) body = `
    <h2 class="q"><span class="L">A</span>¿Qué lo desencadenó?</h2>
    <p class="hint">Puede ser algo de fuera (dónde estabas, con quién, qué pasó) o de dentro de ti: un recuerdo, una sensación del cuerpo, una idea que te vino. Solo los hechos.</p>
    <textarea data-f="a" rows="6" placeholder="Ej.: En la reunión, mi jefa ha dicho delante de todos que el informe tenía errores. / Estaba en la cama y me vino el recuerdo de la discusión de ayer.">${esc(d.a)}</textarea>
    <label class="f">Cuándo pasó</label><input type="datetime-local" id="ed-at" value="${toLocalInput(d.at)}">`;
  else if (st === 1) body = `
    <h2 class="q"><span class="L">B</span>¿Qué pensaste?</h2>
    <p class="hint">Lo que te pasó por la cabeza en ese momento, tal cual, en primera persona.</p>
    <textarea data-f="b" rows="6" placeholder="Ej.: «Soy un desastre». «Ahora todos piensan que no valgo para esto».">${esc(d.b)}</textarea>
    <div class="note" style="border-left-color:var(--acc)"><b>Pensamiento no es emoción.</b> Un pensamiento es una frase («soy un inútil», «me va a salir mal»); la emoción suele caber en una palabra (tristeza, miedo, rabia) y va en C. «Me sentí inútil» es en realidad un pensamiento: «soy un inútil».</div>`;
  else {
    const names = EMOS.concat(d.emo.map(x => x.n).filter(n => !EMOS.includes(n)));
    body = `
    <h2 class="q"><span class="L">C</span>¿Qué sentiste?</h2>
    <p class="hint">Marca las emociones y cuánto: 0 = nada, 10 = lo máximo que has sentido.</p>
    <div class="chips">${names.map(n => `<button class="chip ${d.emo.some(x => x.n === n) ? 'on' : ''}" data-act="emo" data-n="${esc(n)}">${esc(n)}</button>`).join('')}</div>
    <div class="row" style="margin-top:8px"><input id="ed-otra" maxlength="30" placeholder="Otra emoción"><button class="btn sm" data-act="emo-add">Añadir</button></div>
    ${d.emo.map((x, i) => `<div class="sl"><div class="row"><b>${esc(x.n)}</b><span><button class="rm" data-act="emo" data-n="${esc(x.n)}" aria-label="Quitar ${esc(x.n)}">Quitar</button> <span class="v num ${ilvl(x.i)}" id="ev${i}">${x.i}</span></span></div>
      <input type="range" min="0" max="10" step="1" value="${x.i}" data-emo="${i}" aria-label="Intensidad de ${esc(x.n)}">
      <div class="ticks"><span>0 nada</span><span>5</span><span>10 máximo</span></div></div>`).join('')}
    <h2 class="q">En el cuerpo</h2>
    <p class="hint">Lo que notaste físicamente (opcional).</p>
    <div class="chips">${FIS.map(n => `<button class="chip ${d.fis.includes(n) ? 'on' : ''}" data-act="fis" data-n="${esc(n)}">${esc(n)}</button>`).join('')}</div>
    <textarea data-f="fisTxt" rows="2" style="margin-top:8px;min-height:60px" placeholder="Otra cosa o más detalle">${esc(d.fisTxt)}</textarea>
    <h2 class="q">¿Qué hiciste?</h2>
    <p class="hint">Lo que hiciste o tuviste ganas de hacer.</p>
    <textarea data-f="cond" rows="3" style="min-height:80px" placeholder="Ej.: Me callé y me fui antes de que acabara la reunión.">${esc(d.cond)}</textarea>
    ${S.val.usar && S.val.frases.length ? `<h2 class="q">¿Qué te importaba en esto?</h2>
    <p class="hint">Opcional. Lo que querías cuidar o hacia dónde querías ir, aunque no lo consiguieras.</p>
    <div class="chips">${S.val.frases.map(f => `<button class="chip ${d.val === f.id ? 'on' : ''}" data-act="ed-val" data-id="${esc(f.id)}">${esc(cap(f.palabra))} · ${esc((valArea(f.area) || {}).n || '')}</button>`).join('')}</div>` : ''}
    <h2 class="q">¿Qué pasó después?</h2>
    <p class="hint">Qué efecto tuvo lo que hiciste (opcional).</p>
    <label class="f" style="margin-top:0">Justo después</label>
    <textarea data-f="cp" rows="2" style="min-height:60px" placeholder="Ej.: Me alivié al salir de la sala.">${esc(d.cp)}</textarea>
    <label class="f">Más adelante <span style="font-weight:400">· horas o días después; si aún no lo sabes, déjalo: te lo recordaré pasadas 12 h</span></label>
    <textarea data-f="lp" rows="2" style="min-height:60px" placeholder="Ej.: No pude explicar los errores y al día siguiente me daba más miedo hablar con ella.">${esc(d.lp)}</textarea>`;
  }
  app.innerHTML = `<header class="top"><button class="navb" data-act="ed-close" aria-label="Cerrar">${ico('cerrar')}</button>
      <h1 style="flex:1">${ED.id ? 'Editar registro' : 'Nuevo registro'}</h1></header>
    <div class="steps">${STEPS.map(([l, n], i) => `<button data-act="ed-step" data-s="${i}" class="${i === st ? 'on' : ''} ${stepOk(i, d) ? 'ok' : ''}"><b>${l}</b>${n}</button>`).join('')}</div>
    ${body}
    <div class="edfoot"><div class="in">${st > 0 ? '<button class="btn" data-act="ed-prev">Atrás</button>' : ''}
      ${st < 2 ? '<button class="btn pri" data-act="ed-next">Siguiente</button>' : '<button class="btn pri" data-act="ed-save">Guardar registro</button>'}</div></div>`;
  const ta = app.querySelector('textarea[data-f]');
  if (ta && st < 2 && !ta.value) ta.focus();
}
function edGo(step){ ED.step = step; edChanged(); window.scrollTo(0, 0); render(); }
function saveEntry(){
  const d = ED.data;
  for (const i of [0, 1, 2]) if (!stepOk(i, d)){
    toast(['Falta la situación (A)', 'Faltan los pensamientos (B)', 'Marca al menos una emoción (C)'][i]);
    return edGo(i);
  }
  const now = Date.now();
  const e = {id: ED.id || uid(), at: d.at, a: d.a.trim(), b: d.b.trim(), emo: d.emo, fis: d.fis, fisTxt: d.fisTxt.trim(), cond: d.cond.trim(), cp: d.cp.trim(), lp: d.lp.trim(), cre: d.cre || now, upd: now, ...(d.val ? {val: d.val} : {})};
  if (d.lpNo && !e.lp) e.lpNo = true;
  if (d.anc){ e.anc = d.anc; const r = S.anc.find(x => x.id === d.anc); if (r) r.abc = e.id; } // viene de una sesión de Anclaje
  if (ED.id){ const i = S.entries.findIndex(x => x.id === ED.id); if (i >= 0) S.entries[i] = e; else S.entries.push(e); }
  else { S.entries.push(e); S.draft = null; }
  if (!save()) return;
  const edited = !!ED.id; ED = null;
  window.scrollTo(0, 0); render(); toast(edited ? 'Cambios guardados' : 'Registro guardado');
}

/* ===================== Detalle ===================== */
function sheetEntry(id){
  const e = S.entries.find(x => x.id === id); if (!e) return;
  sheet(`<h2>${dayTitle(dayKey(e.at))} · ${hhmm(e.at)}</h2><div class="sub">${longDate(e.at)}${e.anc ? ' · desde Anclaje' : ''}</div>
    <div class="dsec"><div class="dl"><span class="L">A</span>Antecedente</div><p>${nl(e.a)}</p></div>
    <div class="dsec"><div class="dl"><span class="L">B</span>Pensamientos</div><p>${nl(e.b)}</p></div>
    <div class="dsec"><div class="dl"><span class="L">C</span>Consecuencias</div>
      <div class="ttl">Emociones</div><div class="chips">${byI(e).map(emoChip).join('')}</div>
      ${e.fis.length || e.fisTxt ? `<div class="ttl">En el cuerpo</div><p>${esc(fisTxt(e))}</p>` : ''}
      ${e.cond ? `<div class="ttl">Qué hice</div><p>${nl(e.cond)}</p>` : ''}
      ${e.cp ? `<div class="ttl">Justo después</div><p>${nl(e.cp)}</p>` : ''}
      ${e.lp ? `<div class="ttl">Más adelante</div><p>${nl(e.lp)}</p>` : ''}
      ${e.val && valPal(e.val) ? `<div class="ttl">Lo que me importaba</div><p>«${esc(valPal(e.val))}»</p>` : ''}</div>
    <div class="actions" style="margin-top:20px"><button class="btn" data-act="edit" data-id="${esc(e.id)}">Editar</button><button class="btn danger" data-act="del" data-id="${esc(e.id)}">Borrar</button></div>`);
}
function delEntry(id){
  const i = S.entries.findIndex(x => x.id === id); if (i < 0) return;
  const [removed] = S.entries.splice(i, 1); save(); closeSheet(); render();
  toast('Registro borrado', () => { S.entries.push(removed); save(); render(); });
}

/* ===================== Historial ===================== */
let FIL = {emo:null, min:0, per:'30', q:''};
function filtered(){
  const q = norm(FIL.q.trim());
  return inPeriod(sorted(), FIL.per).filter(e => {
    if (FIL.emo){ const x = e.emo.find(x => x.n === FIL.emo); if (!x || x.i < FIL.min) return false; }
    else if (maxI(e) < FIL.min) return false;
    if (q && !norm([e.a, e.b, e.cond, e.cp, e.lp, e.fisTxt, ...e.fis, ...e.emo.map(x => x.n)].join(' ')).includes(q)) return false;
    return true;
  });
}
function usedEmos(list){
  const c = {}; list.forEach(e => e.emo.forEach(x => c[x.n] = (c[x.n] || 0) + 1));
  return Object.keys(c).sort((a, b) => c[b] - c[a]);
}
function renderHistorial(){
  const emos = usedEmos(S.entries);
  if (FIL.emo && !emos.includes(FIL.emo)) FIL.emo = null;
  app.innerHTML = `<header class="top">${BACK}<div class="ht"><h1>Historial</h1><div class="sub num" id="hcount"></div></div>
      ${S.entries.length ? '<button class="btn sm" data-act="export">Exportar</button>' : ''}</header>
    ${S.entries.length ? `<div class="card">
      <div class="seg">${[['7','7 días'],['30','30 días'],['90','3 meses'],['all','Todo']].map(([v, l]) => `<button data-act="fil-per" data-v="${v}" class="${FIL.per === v ? 'on' : ''}">${l}</button>`).join('')}</div>
      <label class="f">Emoción</label>
      <div class="chips"><button class="chip ${!FIL.emo ? 'on' : ''}" data-act="fil-emo" data-n="">Todas</button>${emos.map(n => `<button class="chip ${FIL.emo === n ? 'on' : ''}" data-act="fil-emo" data-n="${esc(n)}">${esc(n)}</button>`).join('')}</div>
      <label class="f">Intensidad</label>
      <div class="seg">${[[0,'Cualquiera'],[4,'4 o más'],[7,'7 o más']].map(([v, l]) => `<button data-act="fil-min" data-v="${v}" class="${FIL.min === v ? 'on' : ''}">${l}</button>`).join('')}</div>
      <input type="search" id="fil-q" style="margin-top:12px" placeholder="Buscar en el texto" value="${esc(FIL.q)}">
    </div>` : ''}
    <div id="hlist"></div>`;
  const q = app.querySelector('#fil-q');
  if (q) q.addEventListener('input', () => { FIL.q = q.value; renderHList(); });
  renderHList();
}
function renderHList(){
  const el = document.getElementById('hlist'), list = filtered();
  document.getElementById('hcount').textContent = S.entries.length ? `${list.length} registro${list.length === 1 ? '' : 's'}` : '';
  if (!S.entries.length){ el.innerHTML = `<div class="empty">Aquí irán apareciendo tus registros.</div>`; return; }
  if (!list.length){ el.innerHTML = `<div class="empty">Ningún registro con estos filtros.<div style="margin-top:12px"><button class="btn sm" data-act="fil-clear">Quitar filtros</button></div></div>`; return; }
  let h = '', groups = {};
  list.forEach(e => { const k = dayKey(e.at); (groups[k] = groups[k] || []).push(e); });
  for (const k of Object.keys(groups)){
    h +=`<h3 class="sec"><span>${dayTitle(k)}</span><span class="num">${groups[k].length}</span></h3>` + groups[k].map(entryCard).join('');
  }
  el.innerHTML = h;
}

/* ===================== Resumen ===================== */
let RES_PER = '30';
function stats(list){
  const emo = {}, fis = {}, buckets = {lo:0, mid:0, hi:0}, franja = [0, 0, 0, 0];
  for (const e of list){
    for (const x of e.emo){ const s = emo[x.n] = emo[x.n] || {n:x.n, c:0, sum:0, max:0}; s.c++; s.sum += x.i; s.max = Math.max(s.max, x.i); }
    for (const f of e.fis) fis[f] = (fis[f] || 0) + 1;
    buckets[ilvl(maxI(e))]++;
    const h = new Date(e.at).getHours(); franja[h < 6 ? 0 : h < 12 ? 1 : h < 20 ? 2 : 3]++;
  }
  const emos = Object.values(emo).sort((a, b) => b.c - a.c || b.sum / b.c - a.sum / a.c);
  const fisL = Object.entries(fis).sort((a, b) => b[1] - a[1]);
  const media = list.length ? list.reduce((a, e) => a + maxI(e), 0) / list.length : 0;
  return {n:list.length, dias:new Set(list.map(e => dayKey(e.at))).size, media, emos, fis:fisL, buckets, franja};
}
function renderResumen(){
  const list = inPeriod(S.entries, RES_PER), st = stats(list);
  const seg = `<div class="seg" style="margin-bottom:12px">${[['7','7 días'],['30','30 días'],['90','3 meses'],['all','Todo']].map(([v, l]) => `<button data-act="res-per" data-v="${v}" class="${RES_PER === v ? 'on' : ''}">${l}</button>`).join('')}</div>`;
  if (!st.n){
    app.innerHTML = `<header class="top">${BACK}<div class="ht"><h1>Resumen</h1></div></header>${S.entries.length ? seg : ''}<div class="empty">${S.entries.length ? 'No hay registros en este periodo.' : 'Cuando tengas algunos registros, aquí verás qué emociones aparecen más y con qué intensidad.'}</div>`;
    return;
  }
  const maxC = st.emos[0].c;
  const hb = (label, val, max, cls, right) => `<span>${label}</span><span class="bar"><i class="${cls}" style="width:${max ? Math.max(3, val / max * 100) : 0}%"></i></span><span class="r num">${right}</span>`;
  // registros por día (7 días) o por semana
  let cols = [];
  if (RES_PER === '7'){
    for (let i = 6; i >= 0; i--){ const k = addDays(dayKey(), -i); cols.push({l: 'LMXJVSD'[(keyToDate(k).getDay() + 6) % 7], c: list.filter(e => dayKey(e.at) === k).length}); }
  } else {
    const first = list.reduce((a, e) => Math.min(a, e.at), Infinity);
    const nW = RES_PER === '30' ? 5 : RES_PER === '90' ? 13 : Math.min(12, Math.floor((keyToDate(weekStart(dayKey())) - keyToDate(weekStart(dayKey(first)))) / (7 * DAY_MS)) + 1);
    const w0 = weekStart(dayKey());
    for (let i = nW - 1; i >= 0; i--){
      const ws = addDays(w0, -7 * i), we = addDays(ws, 7), d = keyToDate(ws);
      cols.push({l: d.getDate() + '/' + (d.getMonth() + 1), c: list.filter(e => { const k = dayKey(e.at); return k >= ws && k < we; }).length});
    }
  }
  const maxCol = Math.max(1, ...cols.map(c => c.c));
  const fr = ['Madrugada','Mañana','Tarde','Noche'], maxF = Math.max(...st.franja);
  app.innerHTML = `<header class="top">${BACK}<div class="ht"><h1>Resumen</h1><div class="sub">${RES_PER === 'all' ? 'Desde el primer registro' : 'Últimos ' + RES_PER + ' días'}</div></div>
      <button class="btn sm" data-act="export">Exportar</button></header>
    ${seg}
    <div class="card hero">
      <div><div class="big num">${st.n}</div><div class="lbl">registros</div></div>
      <div><div class="big num">${st.dias}</div><div class="lbl">días con registro</div></div>
      <div><div class="big num ${ilvl(st.media)}">${dec(st.media)}</div><div class="lbl">intensidad media</div></div>
    </div>
    <div class="card"><h3 class="sec" style="margin-top:0"><span>Emociones</span><span>veces · media · máx.</span></h3>
      <div class="hb">${st.emos.map(s => hb(esc(s.n), s.c, maxC, ilvl(s.sum / s.c), `${s.c} · ${dec(s.sum / s.c)} · ${s.max}`)).join('')}</div>
    </div>
    <div class="card"><h3 class="sec" style="margin-top:0"><span>Intensidad de cada registro</span></h3>
      <div class="hb">${hb('Baja (0–3)', st.buckets.lo, st.n, 'lo', st.buckets.lo)}${hb('Media (4–6)', st.buckets.mid, st.n, 'mid', st.buckets.mid)}${hb('Alta (7–10)', st.buckets.hi, st.n, 'hi', st.buckets.hi)}</div>
      <div class="muted small" style="margin-top:8px">Cuenta la emoción más intensa de cada registro.</div>
    </div>
    <div class="card"><h3 class="sec" style="margin-top:0"><span>${RES_PER === '7' ? 'Registros por día' : 'Registros por semana'}</span></h3>
      <div class="vbars">${cols.map(c => `<div><em class="num">${c.c || ''}</em><i style="height:${c.c / maxCol * 80}%"></i><span>${c.l}</span></div>`).join('')}</div>
    </div>
    <div class="card"><h3 class="sec" style="margin-top:0"><span>Momento del día</span></h3>
      <div class="hb">${fr.map((n, i) => hb(n, st.franja[i], maxF, '', st.franja[i])).join('')}</div>
      <div class="muted small" style="margin-top:8px">Madrugada 0–6 h · mañana 6–12 h · tarde 12–20 h · noche 20–24 h.</div>
    </div>
    ${st.fis.length ? `<div class="card"><h3 class="sec" style="margin-top:0"><span>En el cuerpo</span></h3>
      <div class="hb">${st.fis.slice(0, 8).map(([n, c]) => hb(esc(n), c, st.fis[0][1], '', c)).join('')}</div></div>` : ''}`;
}
