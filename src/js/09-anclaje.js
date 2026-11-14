/* ===================== Anclaje ===================== */
// No busca calmar: sirve para mantenerse en pie mientras el malestar está y elegir qué hacer.
// Ningún texto promete que la emoción se vaya, y por eso aquí no se mide la tensión antes y después.
// Solo texto: cada frase se lee letra a letra, con una ola de zoom que pasa de izquierda a derecha.
// Una sesión: {id, at (ms), modo ('real' | 'sim'), seg, fin (llegó al final), hacer, abc (id del registro enlazado o null)}
const AN_DEF = 'la alarma';
const AN_SUG = ['la alarma', 'la tormenta', 'la ola', 'el nudo', 'el ruido', 'la visita', 'el pasajero'];
const AN_PASOS = [
  {t:'Nota y nombra', f:['Ahí está {n}. No pasa nada por que esté. Lo estás notando.', 'Hay una parte de ti que lo nota, y esa parte sigue aquí aunque {n} esté.', '¿Dónde lo sientes en el cuerpo? Puede ser el pecho, la garganta, el estómago, las manos… No hace falta acertar.', 'Si te viene alguna frase, puedes decirla por dentro, como si la dejaras sobre una mesa: «Estoy teniendo el pensamiento de que…»']},
  {t:'Conecta con el cuerpo', f:['Si puedes, nota los pies en el suelo. Y el peso de tu cuerpo en la silla, o en lo que estés apoyado.', 'Suelta el aire despacio, un poco más largo de lo que lo coges. No tiene que salir perfecto.']},
  {t:'Vuelve a lo que haces', f:['{N} puede seguir aquí, y tú también puedes seguir aquí.', 'Mira dónde estás. Si hay alguien cerca, mira quién. Si estás solo, mira qué tienes alrededor.', 'Si {n} no estuviera ahora mismo, ¿qué estarías haciendo?']},
];
const AN_SIM = 'Esto es un ensayo. Imagina que {n} acaba de aparecer.';
const AN_INI = 'Vamos a hacer un momento juntos. Si estás aquí, es que {n} también está aquí. No hace falta que se vaya nada. Solo estar aquí un rato.';
const AN_LETRA = 65;          // ms por letra: el ritmo de una lectura tranquila (unas 150 palabras por minuto)
const AN_HOLD = 1400;         // ms con la frase ya completa antes de pasar a la siguiente
const AN_GAP = 7, AN_GAP_FIN = 3; // segundos de silencio tras cada frase y tras la última
let AN = null;      // sesión en marcha
let AFTER = null;   // lo que hay que hacer cuando el historial termine de volver (ver popstate)
const anN = () => S.settings.anc.nombre || AN_DEF;
const anTxt = x => x.replace('{n}', anN()).replace('{N}', cap(anN()));
const anPie = () => `<div class="an-pie">No es para que ${esc(anN())} se vaya. Es para que no decida por ti.</div>`;
// Siempre a mano durante la sesión y al terminar: se puede parar, y la línea de crisis
const anSos = fin => `<div class="an-sos">${fin ? '' : 'Si se hace demasiado fuerte, puedes parar cuando quieras. '}¿En crisis? Llama al <a href="tel:024">024</a> (gratis, 24 h) o al <a href="tel:112">112</a>.</div>`;
function anClean(v){ // «La alarma» → «la alarma», para que encaje en mitad de una frase; los nombres propios se quedan como están
  v = String(v || '').trim().replace(/\s+/g, ' ').slice(0, 30);
  return /^(El|La|Los|Las|Mi|Mis|Un|Una|Ese|Esa|Eso|Este|Esta|Esto)\s/.test(v) ? v[0].toLowerCase() + v.slice(1) : v;
}

function renderAnclaje(){
  const a = S.settings.anc, k = dayKey(), week = S.anc.filter(r => dayKey(r.at) >= addDays(k, -6)).sort((x, y) => y.at - x.at);
  const re = week.filter(r => r.modo === 'real').length;
  app.innerHTML = `<header class="top">${BACK}<div class="ht"><h1>Anclaje</h1><div class="sub">Para cuando aprieta</div></div></header>
    ${revCard()}
    <div class="card"><b>No busca calmarte ni que el malestar desaparezca.</b> Sirve para mantenerte en pie mientras está y elegir qué hacer.
      <div class="muted small" style="margin-top:8px">Si en algún momento las sensaciones se hacen demasiado fuertes, para y busca apoyo: no hace falta aguantar hasta el final.</div>
      <div class="muted small" style="margin-top:8px">¿Lo que quieres es bajar la tensión? Para eso está la <button class="linkb" data-act="go" data-to="respirar">Respiración guiada</button>.</div></div>
    <button class="btn pri big" data-act="an-start" data-m="real">Ahora lo necesito</button>
    <button class="btn big an-sim" data-act="an-start" data-m="sim"><b>Simulacro</b><span>Práctica diaria en calma, para entrenarlo antes de necesitarlo</span></button>
    <div class="card" style="margin-top:12px">
      <div class="row" style="justify-content:space-between"><span>${a.nombre ? 'Lo llamas' : 'Aún sin nombre. Se usará'} <b>«${esc(anN())}»</b></span>
        <button class="btn sm" data-act="an-nom">${a.nombre ? 'Cambiar' : 'Ponerle nombre'}</button></div>
      ${a.nombre ? '' : '<div class="muted small" style="margin-top:8px">Ponerle nombre ayuda a verlo desde fuera.</div>'}
      <div class="chips" style="margin-top:12px">${navigator.vibrate ? `<button class="chip ${a.vib ? 'on' : ''}" data-act="an-vib">${ico('vibrar', 'inl')}Vibración</button>` : ''}</div>
    </div>
    ${S.val.frases.length ? '' : `<div class="card"><b>¿Qué te importa?</b><div class="muted small" style="margin-top:4px">Si lo exploras, la pregunta final del Anclaje y tus acciones podrán usarlo.</div>
      <button class="btn sm" style="margin-top:12px" data-act="go" data-to="valores">Explorar lo que importa</button></div>`}
    <details class="card"><summary>¿Cómo es la sesión?</summary>
      <ol class="small" style="margin:12px 0 0;padding-left:20px;display:grid;gap:8px">${AN_PASOS.map(p => `<li><b>${p.t}.</b> ${esc(p.f.map(anTxt).join(' '))}</li>`).join('')}</ol>
      <div class="muted small" style="margin-top:12px">Dura unos dos minutos, con pausas entre frases. Solo texto, sin voz.</div></details>
    ${week.length ? `<h3 class="sec"><span>Últimos 7 días</span></h3>
      <div class="card hero">
        <div><div class="big num">${re}</div><div class="lbl">en un momento real</div></div>
        <div><div class="big num">${week.length - re}</div><div class="lbl">simulacro${week.length - re === 1 ? '' : 's'}</div></div>
        <div><div class="big num">${new Set(week.map(r => dayKey(r.at))).size}</div><div class="lbl">días</div></div>
      </div>
      <div class="card" style="padding:4px 16px">${week.slice(0, 6).map(r => `<div class="rrow"><span>${dayTitle(dayKey(r.at))} · ${hhmm(r.at)}</span><span>${r.modo === 'sim' ? 'Simulacro' : 'Momento real'}${r.hacer ? ` · <b>${esc(r.hacer.length > 60 ? r.hacer.slice(0, 60) + '…' : r.hacer)}</b>` : ''}${r.rev ? ' · ' + REV_TXT[r.rev] : ''}</span></div>`).join('')}</div>` : ''}
    ${anPie()}${CRISIS}`;
}
function sheetAnNombre(modo){ // modo: si viene de «Simulacro» la primera vez, al cerrar empieza la sesión
  const a = S.settings.anc, m = modo ? ` data-m="${modo}"` : '';
  sheet(`<h2>¿Cómo lo llamas?</h2><div class="sub">Eso que te aparece cuando hay ansiedad, enfado o malestar intenso. Ponerle nombre ayuda a verlo desde fuera.</div>
    <div class="chips" style="margin-top:12px">${AN_SUG.map(n => `<button class="chip ${a.nombre === n ? 'on' : ''}" data-act="an-sug" data-n="${esc(n)}">${esc(n)}</button>`).join('')}</div>
    <label class="f">O escribe el tuyo</label>
    <input id="an-nom" maxlength="30" autocomplete="off" value="${esc(a.nombre)}" placeholder="Una palabra, un personaje, un nombre propio">
    <div class="muted small" style="margin-top:8px">Escríbelo como lo dirías en una frase: «la alarma», «el pesado de Paco», «Paco». Mejor un nombre curioso o neutro que uno de enemigo: no se trata de pelear con ello.</div>
    <div class="actions"><button class="btn ghost" data-act="an-nom-no"${m}>${a.nombre ? 'Cancelar' : `Usar «${AN_DEF}»`}</button><button class="btn pri" data-act="an-nom-ok"${m}>Guardar</button></div>
    <div class="muted small" style="margin-top:12px">Puedes cambiarlo cuando quieras.</div>`);
}
function anNomSet(v, modo){
  const a = S.settings.anc, antes = a.nombre;
  if (v != null) a.nombre = anClean(v);
  a.preg = true; save(); closeSheet(); render();
  if (modo) anStart(modo);
  else if (v != null && a.nombre !== antes) toast(`Ahora se llama «${anN()}»`);
}

function anStart(modo){
  closeSheet();
  const a = S.settings.anc, seq = [{p:-1, x:AN_INI}];
  if (modo === 'sim') seq.unshift({p:-1, x:AN_SIM});
  AN_PASOS.forEach((s, i) => s.f.forEach(x => seq.push({p:i, x})));
  AN = {modo, seq, i:-1, at:Date.now(), pAt:null, pausedMs:0, tok:0, tm:[], lock:null, ended:false, rec:null, conf:false, valor: null, // el valor lo elige la persona al final
    vib: !!navigator.vibrate && a.vib};
  if (!(history.state && history.state.an)) history.pushState({app:1, an:1}, '', '#anclaje'); // Atrás cierra la sesión
  const el = document.createElement('div'); el.id = 'an'; el.className = 'br';
  el.innerHTML = `<div class="br-top"><span class="t">${modo === 'sim' ? 'Simulacro' : 'Anclaje'}</span><button class="btn sm ghost" data-act="an-stop">Terminar</button></div>
    <div class="an-stage"><div class="an-dots">${AN_PASOS.map((_, i) => `<i id="an-d${i}"></i>`).join('')}</div>
      <div class="an-paso" id="an-paso"></div><div class="an-fr" id="an-fr" aria-live="polite"></div></div>
    <div class="br-bot"><button class="btn" data-act="an-pause" id="an-pause">Pausa</button>${anPie()}${anSos()}</div>`;
  document.body.appendChild(el);
  anWake(); anNext();
}
function anNext(){
  if (!AN || AN.ended) return;
  if (++AN.i >= AN.seq.length) return anFinish(true);
  anSay();
}
function anSay(){ // la frase se lee letra a letra (una ola de zoom de izquierda a derecha) y, al acabar, queda un silencio antes de la siguiente
  const it = AN.seq[AN.i], txt = anTxt(it.x), tok = ++AN.tok, last = AN.i === AN.seq.length - 1;
  document.getElementById('an-paso').textContent = it.p < 0 ? 'Antes de empezar' : `Paso ${it.p + 1} de ${AN_PASOS.length} · ${AN_PASOS[it.p].t}`;
  AN_PASOS.forEach((_, i) => document.getElementById('an-d' + i).classList.toggle('on', i <= it.p));
  const fr = document.getElementById('an-fr'); let k = 0;
  fr.setAttribute('aria-label', txt); // para lectores de pantalla, la frase entera y no letra a letra
  fr.innerHTML = txt.split(' ').map((w, i) => (i ? (k++, ' ') : '') + `<span class="w" aria-hidden="true">${[...w].map(c => `<span class="ch" style="animation-delay:${k++ * AN_LETRA}ms">${esc(c)}</span>`).join('')}</span>`).join('');
  if (AN.vib) navigator.vibrate(20);
  const later = (fn, s) => AN.tm.push(setTimeout(() => { if (AN && AN.tok === tok && !AN.ended) fn(); }, s * 1000));
  later(() => later(anNext, last ? AN_GAP_FIN : AN_GAP), (txt.length * AN_LETRA + AN_HOLD) / 1000);
}
function anHush(){ // corta lo que estuviera programado
  AN.tok++; AN.tm.forEach(clearTimeout); AN.tm = [];
}
async function anWake(){ try{ if ('wakeLock' in navigator && AN && !AN.ended) AN.lock = await navigator.wakeLock.request('screen'); }catch(_){} }
function anPause(){
  if (!AN || AN.ended) return;
  const btn = document.getElementById('an-pause');
  if (AN.pAt == null){ AN.pAt = Date.now(); anHush(); btn.textContent = 'Seguir'; }
  else { AN.pausedMs += Date.now() - AN.pAt; AN.pAt = null; btn.textContent = 'Pausa'; anSay(); } // vuelve a leer la frase en la que estaba
}
function anQuiet(){ anHush(); if (AN.lock){ AN.lock.release().catch(() => {}); AN.lock = null; } }
function anRecord(done){ // cuenta si se llegó al final o, al menos, al segundo paso
  const it = AN.seq[Math.min(Math.max(0, AN.i), AN.seq.length - 1)];
  if (AN.rec || !(done || it.p >= 1)) return;
  const seg = Math.max(0, Math.round(((AN.pAt ?? Date.now()) - AN.at - AN.pausedMs) / 1000));
  AN.rec = {id: uid(), at: AN.at, modo: AN.modo, seg, fin: !!done, hacer: '', abc: null, valor: AN.valor};
  S.anc.push(AN.rec); save();
}
function anFinish(done){
  if (!AN || AN.ended) return;
  AN.ended = true; anQuiet(); anRecord(done);
  if (AN.rec) anEndScreen(); else anClose();
}
function anEndScreen(){
  document.getElementById('an').innerHTML = `<div class="br-end fin"><h2>¿Qué quieres hacer ahora?</h2>
    <div class="muted">Algo pequeño y concreto, que vaya en la dirección de esa pregunta. Si no quieres escribir nada, toca «Hecho».</div>
    ${anIdeas()}
    <textarea id="an-hacer" rows="3" maxlength="500" style="margin-top:16px;min-height:96px" placeholder="Ej.: Llamar a mi hermana, aunque no me apetezca.">${esc(AN.rec.hacer)}</textarea>
    <div class="muted small" style="margin-top:8px">Si escribes algo, mañana te preguntaré cómo fue. Sin juicio.</div>
    ${AN.conf ? `<div class="note">Ya tienes un registro ABC a medias. ¿Lo añado a ese?</div>
        <div class="actions"><button class="btn" data-act="an-abc-solo">Dejarlo solo aquí</button><button class="btn pri" data-act="an-abc-add">Añadirlo</button></div>`
      : `<div class="actions"><button class="btn" data-act="an-abc">Guardar en el registro ABC</button><button class="btn pri" data-act="an-done">Hecho</button></div>`}
    ${anPie()}${anSos(true)}</div>`;
}
function anHacer(){ // guarda lo escrito en la sesión
  const t = document.getElementById('an-hacer');
  if (t && AN && AN.rec){ AN.rec.hacer = t.value.trim(); save(); }
  return t;
}
function anDone(){
  anHacer();
  const ask = !S.settings.anc.nombre && !S.settings.anc.preg; // tras la primera vez, invita a ponerle nombre
  anClose(ask ? () => sheetAnNombre(null) : null);
}
function anToAbc(mode){ // lo escrito pasa al registro ABC como registro a medias (el ABC pide antecedente, pensamiento y emoción)
  const t = anHacer(), r = AN.rec;
  if (!r.hacer){ t.placeholder = 'Escribe aquí qué quieres hacer para poder guardarlo'; return t.focus(); }
  const has = S.draft && !isBlank(S.draft.data);
  if (has && !mode){ AN.conf = true; return anEndScreen(); }
  if (mode === 'solo') return anClose();
  if (has){ const d = S.draft.data; d.cond = (d.cond.trim() ? d.cond.trim() + '\n' : '') + r.hacer; if (!d.anc) d.anc = r.id; }
  else S.draft = {id: null, step: 0, data: {...blank(), cond: r.hacer, anc: r.id}};
  save();
  anClose(() => toast(has ? 'Añadido a tu registro a medias' : 'Guardado como registro a medias: complétalo cuando puedas'));
}
function anClose(after){ // quita la sesión de la pantalla y del historial
  if (!AN) return;
  if (!AN.ended){ AN.ended = true; anQuiet(); }
  document.getElementById('an')?.remove(); AN = null;
  if (history.state && history.state.an){ AFTER = after || null; history.back(); }
  else { render(); if (after) after(); }
}
function anStop(){ // Atrás del móvil durante la sesión (el historial ya ha vuelto)
  if (!AN) return;
  if (!AN.ended){ AN.ended = true; anQuiet(); anRecord(false); } else anHacer();
  document.getElementById('an')?.remove(); AN = null;
}
document.addEventListener('visibilitychange', () => {
  if (!AN || AN.ended) return;
  if (document.hidden){ if (AN.pAt == null) anPause(); }
  else anWake();
});
