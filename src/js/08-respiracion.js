/* ===================== Respiración guiada ===================== */
// Técnicas elegidas por su respaldo científico (cada una explica el suyo en «¿Por qué funciona?»).
// Fuera: las de hiperventilación (Wim Hof) y retenciones largas (4-7-8), con menos evidencia y más mareos.
// f: fases [tipo, segundos] para cada ritmo (0 más rápido · 1 normal · 2 más lento)
const PH = {in:['Inhala', 'por la nariz, despacio'], in2:['Un poco más', 'otra pizca de aire por la nariz'], hold:['Mantén', 'sin apretar'], out:['Suelta', 'el aire despacio']};
const TECS = [
  {id:'lenta', n:'Respiración lenta', para:'Para bajar la tensión y practicar cada día', col:'lo', track:'circle', min:5,
    f:[[['in',3],['out',5]], [['in',4],['out',6]], [['in',4.5],['out',6.5]]],
    hint:{in:'por la nariz, llevando el aire al abdomen'},
    ev:'Mucha evidencia',
    info:`<p>Respirar despacio, a unas 6 respiraciones por minuto, activa el freno natural del cuerpo ante el estrés: baja el pulso y aumenta la variabilidad de la frecuencia cardiaca, una señal de que el cuerpo se está regulando.</p>
      <p>Es la técnica de respiración más estudiada. Practicada a diario durante varias semanas, ayuda a reducir el estrés y la ansiedad. Funciona mejor como hábito que solo en el peor momento.</p>`},
  {id:'suspiro', n:'Suspiro cíclico', para:'Para calmarte rápido cuando notas mucha tensión', col:'acc', track:'circle', min:5,
    f:[[['in',2],['in2',1],['out',5]], [['in',2.5],['in2',1],['out',6]], [['in',3],['in2',1.2],['out',7]]],
    hint:{out:'largo y lento, por la boca'},
    ev:'Evidencia prometedora',
    info:`<p>Es un suspiro hecho a propósito: dos inhalaciones seguidas por la nariz (la segunda, cortita, para llenar del todo) y una exhalación larga por la boca. Es lo que el cuerpo hace solo para soltar tensión.</p>
      <p>En un ensayo, 5 minutos al día durante un mes mejoraron el estado de ánimo y bajaron la frecuencia respiratoria más que la meditación. Es un único estudio, pero sus resultados son prometedores.</p>`},
  {id:'dormir', n:'Para dormir', para:'Exhalación larga para relajarte en la cama', col:'mid', min:10, sonido:true, dim:true,
    f:[[['in',4],['out',6]], [['in',4],['out',7]], [['in',4],['out',8]]],
    hint:{in:'por la nariz, suave', out:'muy despacio, sin prisa'},
    ev:'Evidencia moderada',
    info:`<p>Soltar el aire más despacio de lo que se toma ayuda a relajarse: en un estudio, al mismo ritmo, la exhalación larga dio más sensación de calma que la corta.</p>
      <p>Antes de dormir, la respiración lenta mejora el sueño que la persona percibe en varios estudios pequeños, aunque los efectos son modestos. Con el sonido puedes cerrar los ojos: sube al inhalar y baja al soltar.</p>`},
  {id:'cuadrada', n:'Respiración cuadrada', para:'Para centrarte antes de un momento de presión', col:'hi', track:'square', min:3,
    f:[[['in',3],['hold',3],['out',3],['hold',3]], [['in',4],['hold',4],['out',4],['hold',4]], [['in',5],['hold',5],['out',5],['hold',5]]],
    ev:'Evidencia limitada',
    info:`<p>Cuatro tiempos iguales: inhalar, mantener, soltar y mantener. La usan militares y equipos de emergencias porque es fácil de recordar bajo presión y ayuda a centrar la atención.</p>
      <p>Tiene menos estudios que las anteriores: ayuda a corto plazo, pero sus efectos son menos constantes. Si lo que buscas es calmarte, la respiración lenta o el suspiro cíclico tienen más respaldo.</p>`},
];
const TEC = id => TECS.find(t => t.id === id);
const ritmoOf = t => S.settings.resp.ritmo[t.id] ?? 1;
const durOf = t => S.settings.resp.dur[t.id] ?? t.min;
const sonOf = t => S.settings.resp.son[t.id] ?? !!t.sonido;
const vibOn = () => !!navigator.vibrate && S.settings.resp.vib;
const fmtS = s => String(s).replace('.', ',');
function patTxt(t, f){
  const cyc = f.reduce((a, p) => a + p[1], 0), pm = fmtS(Math.round(600 / cyc) / 10) + ' por minuto';
  if (t.id === 'suspiro') return `Doble inhalación · suelta ${fmtS(f[2][1])} s · ${pm}`;
  if (t.id === 'cuadrada') return `${f.map(p => fmtS(p[1])).join(' · ')} s`;
  return `Inhala ${fmtS(f[0][1])} s · suelta ${fmtS(f[1][1])} s · ${pm}`;
}
const tens = v => v == null || v === '' || !isFinite(+v) ? null : Math.max(0, Math.min(10, Math.round(+v)));

function renderRespirar(){
  const k = dayKey(), week = S.resp.filter(r => dayKey(r.at) >= addDays(k, -6)).sort((a, b) => b.at - a.at);
  const pares = week.filter(r => r.antes != null && r.despues != null), avg = (l, f) => l.reduce((a, r) => a + f(r), 0) / l.length;
  app.innerHTML = `<header class="top">${BACK}<div class="ht"><h1>Respiración guiada</h1><div class="sub">Elige un ejercicio</div></div></header>
    ${TECS.map(t => `<button class="tec" data-act="br-open" data-id="${t.id}"><span class="tec-ic ${t.col}"><i></i></span>
      <span class="tec-t"><b>${t.n}</b><span>${t.para}</span><span class="tec-m num">${patTxt(t, t.f[ritmoOf(t)])} · ${durOf(t)} min</span></span><span class="muted">›</span></button>`).join('')}
    <details class="card" style="margin-top:12px"><summary>¿Cómo respirar con el abdomen?</summary>
      <ol class="small" style="margin:12px 0 0;padding-left:20px;display:grid;gap:8px">
        <li>Pon una mano en el pecho y otra en el abdomen, justo encima del ombligo.</li>
        <li>Al tomar el aire por la nariz, deja que suba sobre todo la mano del abdomen; la del pecho casi no se mueve.</li>
        <li>Al soltarlo, el abdomen baja solo. No hace falta empujar.</li>
        <li>Respira suave: no se trata de coger mucho aire, sino de hacerlo despacio.</li>
      </ol></details>
    ${week.length ? `<h3 class="sec"><span>Últimos 7 días</span></h3>
      <div class="card hero">
        <div><div class="big num">${week.length}</div><div class="lbl">práctica${week.length === 1 ? '' : 's'}</div></div>
        <div><div class="big num">${Math.round(week.reduce((a, r) => a + r.seg, 0) / 60)}</div><div class="lbl">minutos</div></div>
        <div><div class="big num">${pares.length ? `${dec(avg(pares, r => r.antes))}<span class="muted" style="font-size:18px"> → </span>${dec(avg(pares, r => r.despues))}` : '–'}</div><div class="lbl">tensión antes → después</div></div>
      </div>
      <div class="card" style="padding:4px 16px">${week.slice(0, 6).map(r => `<div class="rrow"><span>${dayTitle(dayKey(r.at))} · ${hhmm(r.at)}</span><span>${esc((TEC(r.tec) || {n:r.tec}).n)} · ${Math.max(1, Math.round(r.seg / 60))} min${r.antes != null && r.despues != null ? ` · <b class="num">${r.antes} → ${r.despues}</b>` : ''}</span></div>`).join('')}</div>` : ''}
    ${CRISIS}`;
}

let BRPRE = null; // tensión antes de empezar (0–10 o null)
const scaleHtml = (act, id, sel) => `<div class="scale">${[...Array(11).keys()].map(v => `<button data-act="${act}" data-id="${id}" data-v="${v}" class="${sel === v ? 'on' : ''}">${v}</button>`).join('')}</div>`;
function sheetBr(id){
  const t = TEC(id), ri = ritmoOf(t), dur = durOf(t);
  sheet(`<h2>${t.n}</h2><div class="sub">${t.para}</div>
    <label class="f">Duración</label>
    <div class="seg">${[1, 3, 5, 10, 15].map(m => `<button data-act="br-dur" data-id="${id}" data-v="${m}" class="${dur === m ? 'on' : ''}">${m} min</button>`).join('')}</div>
    <label class="f">Ritmo</label>
    <div class="seg">${['Más rápido', 'Normal', 'Más lento'].map((l, i) => `<button data-act="br-rit" data-id="${id}" data-v="${i}" class="${ri === i ? 'on' : ''}">${l}</button>`).join('')}</div>
    <div class="muted small num" style="margin-top:8px">${patTxt(t, t.f[ri])}</div>
    <div class="chips" style="margin-top:12px"><button class="chip ${sonOf(t) ? 'on' : ''}" data-act="br-son" data-id="${id}">${ico('sonido', 'inl')}Sonido</button>
      ${navigator.vibrate ? `<button class="chip ${vibOn() ? 'on' : ''}" data-act="br-vib" data-id="${id}">${ico('vibrar', 'inl')}Vibración</button>` : ''}</div>
    <label class="f">¿Cuánta tensión notas ahora? <span style="font-weight:400">(opcional)</span></label>
    ${scaleHtml('br-antes', id, BRPRE)}
    <div class="actions"><button class="btn ghost" data-act="br-info" data-id="${id}">¿Por qué funciona?</button><button class="btn pri" data-act="br-start" data-id="${id}">Empezar</button></div>
    <div class="muted small" style="margin-top:12px">Respira suave, sin forzar. Si te mareas o notas molestias, vuelve a tu respiración normal.</div>`);
}
function sheetBrInfo(id){
  const t = TEC(id);
  sheet(`<h2>¿Por qué funciona?</h2><div class="sub">${t.n} · <b>${t.ev}</b></div>
    <div class="info">${t.info}</div>
    <div class="muted small" style="margin-top:8px">Es un complemento de la terapia, no la sustituye. Coméntalo con tu psicólogo si tienes dudas sobre cuándo usarla.</div>
    <div class="actions"><button class="btn" data-act="br-open" data-id="${id}" data-keep="1">Volver</button></div>`);
}

let BR = null; // sesión en marcha
const PREP = 3; // segundos de «Prepárate»
// Animación diseñada en motion-lab (respira/respira.html): un círculo plano que se llena y se vacía y, alrededor,
// el mapa del ciclo con un tramo por fase (cuadrado en la respiración cuadrada); se enciende el de la fase actual.
function spring(t, zeta = .7, f = 2){ // muelle de motion.js, de 0 a 1
  if (t <= 0) return 0;
  const w = 2 * Math.PI * f;
  if (zeta >= 1) return 1 - Math.exp(-w * t) * (1 + w * t);
  const wd = w * Math.sqrt(1 - zeta * zeta);
  return 1 - Math.exp(-zeta * w * t) * (Math.cos(wd * t) + (zeta * w / wd) * Math.sin(wd * t));
}
const sine = x => .5 - Math.cos(Math.PI * Math.min(1, Math.max(0, x))) / 2;
function brModel(f){ // dónde estamos del ciclo y cuánto aire hay (0 vacío · 1 lleno), en función del tiempo
  const cyc = f.reduce((a, p) => a + p[1], 0), lv = []; let cur = 0;
  f.forEach(([typ], i) => {
    const to = typ === 'in' ? (f[i + 1] && f[i + 1][0] === 'in2' ? .7 : 1) : typ === 'in2' ? 1 : typ === 'out' ? 0 : cur;
    lv.push([cur, to]); cur = to;
  });
  function at(e){
    if (e < 0) return {prep:true, k:-1, pos:0};
    const ci = Math.floor(e / cyc), pos = e - ci * cyc; let acc = 0, k = 0;
    while (k < f.length - 1 && pos >= acc + f[k][1]){ acc += f[k][1]; k++; }
    return {k, ci, typ:f[k][0], d:f[k][1], u:pos - acc, pos};
  }
  function level(s){
    if (s.prep) return 0;
    const [a, b] = lv[s.k];
    return a + (b - a) * (s.typ === 'in2' ? spring(s.u, .55, 1.8) : sine(s.u / s.d)); // la pizca de aire entra con un pequeño rebote
  }
  return {cyc, at, level};
}
const SVGNS = 'http://www.w3.org/2000/svg';
function svgEl(tag, attrs, parent, style = {}){ const e = document.createElementNS(SVGNS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); Object.assign(e.style, style); parent.appendChild(e); return e; }
function brStage(svg, t, f, M){
  const C = `var(--${t.col})`, RMIN = 64, RMAX = 148;
  const disc = svgEl('circle', {cx:0, cy:0, r:RMIN, 'stroke-width':2.5}, svg, {fill:C, fillOpacity:.2, stroke:C});
  const num = svgEl('text', {x:0, y:2, 'text-anchor':'middle', 'dominant-baseline':'middle'}, svg);
  let track = null, len = 0, dot = null, segs = [];
  if (t.track){
    const d = t.track === 'square'
      ? 'M -172 172 L -172 -172 L 172 -172 L 172 172 Z'                 // empieza abajo a la izquierda y sube (inhala)
      : 'M 0 -176 A 176 176 0 1 1 0 176 A 176 176 0 1 1 0 -176';      // empieza arriba, sentido horario
    track = svgEl('path', {d, fill:'none', stroke:'none'}, svg);
    len = track.getTotalLength();
    let a = 0;
    segs = f.map(([typ, s]) => {
      const L = s / M.cyc * len, gap = 10;
      const p = svgEl('path', {d, fill:'none', 'stroke-linecap':'round', 'stroke-dasharray':`0 ${a + gap / 2} ${Math.max(0, L - gap)} ${len}`}, svg,
        {stroke: typ === 'hold' ? 'var(--muted)' : C});
      a += L; return p;
    });
    dot = svgEl('circle', {r:7, 'stroke-width':4}, svg, {fill:'var(--text)', stroke:'var(--bg)'});
  }
  let lastK = null;
  return function draw(e){
    const s = M.at(e);
    disc.setAttribute('r', (RMIN + (RMAX - RMIN) * M.level(s)).toFixed(2));
    const n = String(s.prep ? Math.ceil(-e) : Math.max(1, Math.ceil(s.d - s.u - 1e-6)));
    if (num.textContent !== n) num.textContent = n;
    if (s.k !== lastK){ lastK = s.k; segs.forEach((p, i) => { p.setAttribute('stroke-width', i === s.k ? 6 : 3); p.style.strokeOpacity = i === s.k ? 1 : .28; }); }
    if (dot){ const p = track.getPointAtLength(s.prep ? 0 : s.pos / M.cyc * len); dot.setAttribute('cx', p.x.toFixed(2)); dot.setAttribute('cy', p.y.toFixed(2)); }
    return s;
  };
}
function brStart(id){
  const t = TEC(id), f = t.f[ritmoOf(t)], M = brModel(f), n = Math.max(1, Math.round(durOf(t) * 60 / M.cyc));
  closeSheet();
  BR = {t, f, M, total: n * M.cyc, antes: BRPRE, despues: null, t0: performance.now(), paused: null, pausedMs: 0, phase: -1, el: -PREP,
    audio: sonOf(t) ? brAudio() : null, vib: vibOn(), lock: null, ended: false, rec: null};
  if (!(history.state && history.state.br)) history.pushState({app:1, br:1}, '', '#respirar'); // Atrás cierra la sesión
  const el = document.createElement('div'); el.id = 'br'; el.className = 'br' + (t.dim ? ' dim' : '');
  el.innerHTML = `<div class="br-top"><span class="t num" id="br-left"></span><button class="btn sm ghost" data-act="br-stop">Terminar</button></div>
    <div class="br-stage"><svg id="br-svg" viewBox="-200 -200 400 400" aria-hidden="true"></svg></div>
    <div class="br-txt" aria-live="polite"><b id="br-ph">Prepárate</b><span id="br-hint">busca una postura cómoda</span></div>
    <div class="br-bot"><button class="btn" data-act="br-pause" id="br-pause">Pausa</button>
      <div class="muted small">Respira suave, sin forzar. Si te mareas, vuelve a tu respiración normal.</div></div>`;
  document.body.appendChild(el);
  BR.draw = brStage(document.getElementById('br-svg'), t, f, M);
  BR.draw(-PREP);
  brWake();
  BR.raf = requestAnimationFrame(brTick);
}
const mmss = s => Math.floor(s / 60) + ':' + pad(Math.floor(s % 60));
function brSet(id, v){ const e = document.getElementById(id); if (e && e.textContent !== v) e.textContent = v; }
function brTick(now){
  if (!BR || BR.ended) return;
  if (BR.paused == null){
    const e = BR.el = (now - BR.t0 - BR.pausedMs) / 1000 - PREP;
    if (e >= BR.total) return brFinish();
    const s = BR.draw(e);
    if (s.prep) brSet('br-left', mmss(Math.ceil(BR.total)));
    else {
      const g = s.ci * BR.f.length + s.k;
      if (g !== BR.phase){ BR.phase = g; brPhase(s.typ, s.d); }
      document.getElementById('br-ph').style.opacity = (.35 + .65 * Math.min(1, s.u / .15)).toFixed(3); // la palabra nueva entra en 150 ms, sin moverse
      brSet('br-left', mmss(Math.ceil(BR.total - e)));
    }
  }
  BR.raf = requestAnimationFrame(brTick);
}
function brPhase(typ, d){
  const [ph, hint] = PH[typ];
  brSet('br-ph', ph); brSet('br-hint', (BR.t.hint && BR.t.hint[typ]) || hint);
  if (BR.vib) navigator.vibrate(typ === 'hold' ? 15 : 30);
  brSound(typ, d);
}
// Sonido: ruido suave (como el aire) que sube al inhalar y baja al soltar; en silencio al mantener
function brAudio(){
  const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
  try{
    const ctx = new AC(), len = ctx.sampleRate * 2, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0; // ruido rosa aproximado, más suave que el blanco
    for (let i = 0; i < len; i++){ const w = Math.random() * 2 - 1; b0 = .99765 * b0 + w * .099046; b1 = .963 * b1 + w * .2965164; b2 = .57 * b2 + w * 1.0526913; d[i] = (b0 + b1 + b2 + w * .1848) * .18; }
    const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 260; lp.Q.value = .7;
    const g = ctx.createGain(); g.gain.value = .0001;
    src.connect(lp).connect(g).connect(ctx.destination); src.start();
    return {ctx, g, lp};
  }catch(_){ return null; }
}
function brSound(typ, d){
  const A = BR.audio; if (!A) return;
  const t = A.ctx.currentTime, g = A.g.gain, f = A.lp.frequency;
  g.cancelScheduledValues(t); f.cancelScheduledValues(t); g.setValueAtTime(Math.max(g.value, .0001), t); f.setValueAtTime(f.value, t);
  if (typ === 'in'){ g.linearRampToValueAtTime(.5, t + d); f.exponentialRampToValueAtTime(1300, t + d); }
  else if (typ === 'in2'){ g.linearRampToValueAtTime(.6, t + d); f.exponentialRampToValueAtTime(1700, t + d); }
  else if (typ === 'out'){ g.linearRampToValueAtTime(.45, t + .3); g.linearRampToValueAtTime(.0001, t + d); f.exponentialRampToValueAtTime(240, t + d); }
  else g.linearRampToValueAtTime(.0001, t + .4);
}
async function brWake(){ try{ if ('wakeLock' in navigator && BR && !BR.ended) BR.lock = await navigator.wakeLock.request('screen'); }catch(_){} }
function brPause(){
  if (!BR || BR.ended) return;
  const btn = document.getElementById('br-pause');
  if (BR.paused == null){
    BR.paused = performance.now(); if (BR.audio) BR.audio.ctx.suspend();
    btn.textContent = 'Seguir'; brSet('br-ph', 'En pausa'); brSet('br-hint', 'toca «Seguir» cuando quieras'); document.getElementById('br-ph').style.opacity = 1;
  } else {
    BR.pausedMs += performance.now() - BR.paused; BR.paused = null; if (BR.audio) BR.audio.ctx.resume();
    btn.textContent = 'Pausa'; BR.phase = -1; // repinta el texto de la fase
  }
}
function brRecord(){
  if (!BR || BR.rec) return;
  const el = BR.ended && BR.el >= BR.total ? BR.total : ((BR.paused ?? performance.now()) - BR.t0 - BR.pausedMs) / 1000 - PREP; // al momento, no el del último fotograma
  const seg = Math.round(Math.max(0, Math.min(el, BR.total)));
  if (seg < 30) return; // menos de medio minuto no cuenta como práctica
  BR.rec = {id: uid(), at: Date.now(), tec: BR.t.id, seg, antes: BR.antes, despues: null};
  S.resp.push(BR.rec); save();
}
function brQuiet(){ // para animación, sonido y bloqueo de pantalla
  cancelAnimationFrame(BR.raf);
  if (BR.audio){ const A = BR.audio; try{ A.g.gain.cancelScheduledValues(A.ctx.currentTime); A.g.gain.setTargetAtTime(.0001, A.ctx.currentTime, .15); }catch(_){} setTimeout(() => A.ctx.close().catch(() => {}), 800); BR.audio = null; }
  if (BR.lock){ BR.lock.release().catch(() => {}); BR.lock = null; }
}
function brFinish(){
  if (!BR || BR.ended) return;
  BR.ended = true; brQuiet(); brRecord();
  if (!BR.rec){ brClose(); toast('Práctica cancelada: dura menos de medio minuto'); return; }
  brEndScreen();
}
function brEndScreen(){
  const r = BR.rec, el = document.getElementById('br');
  el.classList.remove('dim');
  el.innerHTML = `<div class="br-end fin"><h2>Has terminado</h2>
    <div class="muted">${Math.max(1, Math.round(r.seg / 60))} min de ${BR.t.n.toLowerCase()}</div>
    <label class="f" style="margin-top:24px">¿Y ahora, cuánta tensión notas? <span style="font-weight:400">(opcional)</span></label>
    ${scaleHtml('br-despues', '', BR.despues)}
    ${BR.antes != null ? `<div class="muted small num" style="margin-top:8px">Antes: ${BR.antes}${BR.despues != null ? ` · ahora: <b>${BR.despues}</b>` : ''}</div>` : ''}
    <div class="actions"><button class="btn" data-act="br-again">Repetir</button><button class="btn pri" data-act="br-done">Hecho</button></div>
    ${anSos(true)}</div>`;
}
function brClose(){ // quita la sesión de la pantalla y del historial
  if (!BR) return;
  if (!BR.ended){ BR.ended = true; brQuiet(); }
  document.getElementById('br')?.remove(); BR = null;
  if (history.state && history.state.br) history.back(); else render();
}
function brStop(){ // Atrás del móvil durante la sesión (el historial ya ha vuelto)
  if (!BR) return;
  if (!BR.ended){ BR.ended = true; brQuiet(); brRecord(); }
  document.getElementById('br')?.remove(); BR = null;
}
document.addEventListener('visibilitychange', () => {
  if (!BR || BR.ended) return;
  if (document.hidden){ if (BR.paused == null) brPause(); }
  else brWake(); // el bloqueo de pantalla se suelta al salir de la app
});
