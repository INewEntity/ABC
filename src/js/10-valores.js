/* ===================== Lo que importa (valores) ===================== */
// Un valor es una dirección, no una meta. Todo se hace con listas y plantillas escritas de antemano: sin IA y sin servidor.
// S.val: {areas (hasta 3), notas {área: texto, libre: texto}, pal (palabras marcadas), top (hasta 5), frases [{id, area, palabra, ej}], usar, informe}
const VAL_AREAS = [
  {id:'familia', n:'Familia', en:'en tu familia', q:'¿Qué echarías de menos de tu familia si no estuviera?', ideas:['Escribir un mensaje a alguien de mi familia', 'Llamar a alguien de mi familia', 'Pasar cinco minutos con alguien de casa']},
  {id:'pareja', n:'Pareja', en:'en tu pareja', q:'¿Qué tipo de pareja te gustaría ser en un día normal, sin nada especial?', ideas:['Decirle algo bueno', 'Preguntarle cómo está', 'Hacer algo pequeño por esa persona']},
  {id:'amistades', n:'Amistades', en:'en tus amistades', q:'¿Cómo te gustaría que te describiera un buen amigo o una buena amiga?', ideas:['Escribir a un amigo o una amiga', 'Proponer un café o un paseo', 'Contestar un mensaje pendiente']},
  {id:'trabajo', n:'Trabajo o estudios', en:'en tu trabajo o tus estudios', q:'¿Qué te gustaría que se notara en cómo trabajas, aunque nadie te lo dijera?', ideas:['Hacer solo el primer paso de lo pendiente', 'Ordenar la mesa cinco minutos', 'Escribir en una línea la siguiente tarea']},
  {id:'salud', n:'Salud', en:'en tu salud', q:'¿Cómo te gustaría tratar a tu cuerpo, sin exigirte nada raro?', ideas:['Beber un vaso de agua', 'Dar un paseo de diez minutos', 'Estirar el cuerpo un minuto']},
  {id:'cuidarme', n:'Cuidarme', en:'en cuidarte', q:'¿Qué harías por ti si te trataras como a alguien a quien quieres?', ideas:['Preparar algo de comer', 'Hacer algo que me guste durante cinco minutos', 'Acostarme un poco antes']},
  {id:'crecer', n:'Crecer', en:'en crecer', q:'¿Qué te gustaría seguir aprendiendo o probando?', ideas:['Leer una página', 'Apuntar algo que quiero aprender', 'Dedicar diez minutos a aprenderlo']},
  {id:'comunidad', n:'Comunidad', en:'en tu comunidad', q:'¿Qué te importa del mundo que te rodea: tu barrio, tu gente, lo que hay fuera de casa?', ideas:['Saludar a un vecino', 'Hacer un pequeño favor', 'Salir a la calle un rato']},
];
const VAL_PAL = ['afecto','aprender','autenticidad','aventura','bondad','calma','cercanía','compromiso','confianza','constancia','creatividad','cuidar','curiosidad','disfrutar','equilibrio','escuchar','esfuerzo','generosidad','gratitud','honestidad','humor','justicia','lealtad','libertad','orden','paciencia','perdón','presencia','respeto','responsabilidad','salud','sencillez','serenidad','servicio','valentía'];
const valArea = id => VAL_AREAS.find(a => a.id === id);
const valFrase = id => S.val.frases.find(f => f.id === id);
const valPal = id => (valFrase(id) || {}).palabra || '';
const valSub = id => { const f = valFrase(id), a = f && valArea(f.area); return a ? `<div class="muted small">Para «${esc(f.palabra)}» ${esc(a.en)}</div>` : ''; };
const valSeq = () => ['areas', 'notas', 'pal'].concat(S.val.pal.length > 5 ? ['top'] : [], ['frases']); // «top» solo si hay más de 5 palabras
let VAL = {run:false, step:0, f:{}};   // f: {área: {palabra, ej}} mientras se escribe la frase de cada área

function renderValores(){ return VAL.run ? renderValPaso() : renderValHome(); }
function renderValHome(){
  const v = S.val, hay = v.frases.length;
  app.innerHTML = `<header class="top">${BACK}<div class="ht"><h1>Lo que importa</h1><div class="sub">${hay ? 'Tu brújula' : 'Para explorar con calma'}</div></div></header>
    ${hay ? `${v.frases.map(f => { const a = valArea(f.area); return a ? `<div class="card"><div class="muted small">${esc(cap(a.en))}</div>
        <div style="font-size:20px;font-weight:600;margin-top:2px">«${esc(f.palabra)}»</div>${f.ej ? `<div class="muted" style="margin-top:4px">${esc(f.ej)}</div>` : ''}</div>` : ''; }).join('')}
      <div class="card"><label class="f" style="margin-top:0">Dónde se usa</label>
        <div class="chips"><button class="chip ${v.usar ? 'on' : ''}" data-act="val-usar">Anclaje y registro ABC</button></div></div>
      <div class="actions"><button class="btn" data-act="val-start">Volver a explorar</button><button class="btn danger" data-act="val-del">Borrar</button></div>
      <div class="muted small" style="margin-top:12px">Son direcciones, no notas: no hay una forma correcta de seguirlas.</div>`
    : `<div class="card"><b>Lo que te importa es una dirección, no una meta.</b>
        <div class="muted" style="margin-top:8px">«Ser un buen amigo» es una dirección que puedes seguir cada día. «Quedar el sábado» es un paso en esa dirección. Aquí vas a explorar qué te importa, sin objetivos ni notas.</div></div>
      <div class="note" style="border-left-color:var(--acc)"><b>No hay respuestas correctas.</b> Si ahora no te sale nada, está bien: puedes dejarlo y volver cuando quieras.</div>
      <button class="btn pri big" style="margin-top:16px" data-act="val-start">Empezar</button>
      <div class="muted small" style="margin-top:12px;text-align:center">Lo que escribas se queda solo en este móvil.</div>`}
    ${CRISIS}`;
}
function renderValPaso(){
  const v = S.val, seq = valSeq(), st = Math.min(VAL.step, seq.length - 1), id = seq[st];
  const chip = (txt, on, act, attrs) => `<button class="chip ${on ? 'on' : ''}" data-act="${act}" ${attrs}>${esc(txt)}</button>`;
  let body = '';
  if (id === 'areas') body = `<h2 class="q">¿Qué áreas de tu vida te importan más ahora?</h2>
    <p class="hint">Elige hasta 3. No hace falta que todo vaya bien en ellas: basta con que te importen.</p>
    <div class="chips">${VAL_AREAS.map(a => chip(a.n, v.areas.includes(a.id), 'val-area', `data-id="${a.id}"`)).join('')}</div>
    <button class="btn ghost" style="margin-top:16px;width:100%" data-act="val-libre">Ahora mismo no lo tengo claro</button>`;
  else if (id === 'notas') body = `<h2 class="q">Imagina un día normal</h2>
    <p class="hint">Escribe lo que te salga, aunque sea una palabra. Puedes dejar en blanco lo que no te diga nada.</p>
    ${v.areas.map(aid => { const a = valArea(aid); return `<div class="card"><b>${esc(a.n)}</b><div class="muted" style="margin:4px 0 8px">${esc(a.q)}</div>
      <textarea data-nota="${a.id}" rows="3" style="min-height:80px" placeholder="Lo que te salga">${esc(v.notas[a.id] || '')}</textarea></div>`; }).join('')}`;
  else if (id === 'pal') body = `<h2 class="q">¿Qué palabras te dicen algo?</h2>
    <p class="hint">Marca las que te digan algo, sin pensarlo mucho. Pueden ser muchas.</p>
    <div class="chips">${VAL_PAL.concat(v.pal.filter(p => !VAL_PAL.includes(p))).map(p => chip(cap(p), v.pal.includes(p), 'val-pal', `data-p="${esc(p)}"`)).join('')}</div>
    <div class="row" style="margin-top:12px"><input id="val-otra" maxlength="30" placeholder="Otra palabra"><button class="btn sm" data-act="val-pal-add">Añadir</button></div>
    <div class="muted small num" style="margin-top:8px">${v.pal.length} marcada${v.pal.length === 1 ? '' : 's'}</div>`;
  else if (id === 'top') body = `<h2 class="q">¿Cuáles son las 5 que más?</h2>
    <p class="hint">Elige hasta 5 de las que marcaste. Luego puedes cambiarlas.</p>
    <div class="chips">${v.pal.map(p => chip(cap(p), v.top.includes(p), 'val-top', `data-p="${esc(p)}"`)).join('')}</div>
    <div class="muted small num" style="margin-top:8px">${v.top.length} de 5</div>`;
  else { const lista = v.top.length ? v.top : v.pal;
    body = `<h2 class="q">Ponlo con tus palabras</h2>
    <p class="hint">Para cada área, elige la palabra que mejor la describe y, si quieres, un ejemplo de cómo se vería en un día normal.</p>
    ${v.areas.map(aid => { const a = valArea(aid), f = VAL.f[aid] || {}; return `<div class="card"><b>${esc(cap(a.en))}</b>
      <div class="chips" style="margin-top:8px">${lista.map(p => chip(cap(p), f.palabra === p, 'val-fpal', `data-id="${a.id}" data-p="${esc(p)}"`)).join('')}</div>
      <textarea data-fej="${a.id}" rows="2" style="min-height:64px;margin-top:12px" placeholder="Ej.: llamar a mis padres los domingos (opcional)">${esc(f.ej || '')}</textarea></div>`; }).join('')}`; }
  app.innerHTML = `<header class="top"><button class="navb" data-act="val-exit" aria-label="Salir">${ico('cerrar')}</button><div class="ht"><h1>Lo que importa</h1><div class="sub">${({areas:'Áreas', notas:'Un día normal', pal:'Palabras', top:'Las que más', frases:'Con tus palabras'})[id]}</div></div></header>
    ${body}
    <div class="actions" style="margin-top:20px">${st > 0 ? '<button class="btn" data-act="val-prev">Atrás</button>' : ''}<button class="btn pri" data-act="val-next">${id === 'frases' ? 'Guardar' : 'Siguiente'}</button></div>
    ${CRISIS}`;
}
function sheetValLibre(){
  sheet(`<h2>Si ahora no te sale nada</h2><div class="sub">Es normal, sobre todo en épocas duras. Prueba con una de estas, sin prisa:</div>
    <ul class="small" style="margin:12px 0 0;padding-left:20px;display:grid;gap:8px"><li>¿Qué te molesta que falte en tu vida?</li><li>¿A quién admiras, y qué admiras de esa persona?</li><li>¿Qué te gustaba hacer antes, aunque ahora no tengas ganas?</li></ul>
    <textarea id="val-libre" rows="4" style="margin-top:12px;min-height:100px" placeholder="Lo que te venga, tal cual.">${esc(S.val.notas.libre || '')}</textarea>
    <div class="muted small" style="margin-top:8px">No hay prisa. Puedes dejarlo y volver otro día.</div>
    <div class="actions"><button class="btn ghost" data-act="sheet-close">Cerrar</button><button class="btn pri" data-act="val-libre-ok">Guardar</button></div>`);
}
function sheetValBorrar(){
  sheet(`<h2>¿Borrar lo que has escrito aquí?</h2><div class="sub">Se borran tus áreas, palabras y frases. Las acciones del Anclaje y los registros ABC no se tocan. No se puede deshacer.</div>
    <div class="actions"><button class="btn" data-act="sheet-close">Cancelar</button><button class="btn danger" data-act="val-del-yes">Borrar</button></div>`);
}
function valGuardar(){
  const v = S.val, fr = [];
  for (const aid of v.areas){
    const f = VAL.f[aid]; if (!f || !f.palabra) continue;
    const prev = v.frases.find(x => x.area === aid);
    fr.push({id: prev ? prev.id : uid(), area: aid, palabra: f.palabra, ej: (f.ej || '').trim().slice(0, 200)});
  }
  if (!fr.length) return toast('Elige una palabra para al menos un área');
  v.frases = fr; v.upd = Date.now(); VAL = {run:false, step:0, f:{}}; save(); window.scrollTo(0, 0); render(); toast('Guardado');
}
function anIdeas(){ // en la pantalla final: la persona elige qué le importa en este momento y ve ideas de pasos pequeños para esa área
  const l = S.val.usar ? S.val.frases.filter(f => valArea(f.area)) : []; if (!l.length) return '';
  const v = AN.valor && valFrase(AN.valor), a = v && valArea(v.area);
  return `<label class="f">¿Qué te importa en este momento? <span style="font-weight:400">(opcional)</span></label>
    <div class="chips">${l.map(f => `<button class="chip ${AN.valor === f.id ? 'on' : ''}" data-act="an-val" data-id="${esc(f.id)}">${esc(cap(f.palabra))} · ${esc(valArea(f.area).n)}</button>`).join('')}</div>
    ${a ? `<div class="muted small" style="margin-top:12px">Algunas ideas ${esc(a.en)}, por si te sirven. Vale lo tuyo:</div>
    <div class="chips" style="margin-top:8px">${a.ideas.map((t, i) => `<button class="chip" data-act="an-idea" data-i="${i}">${esc(t)}</button>`).join('')}</div>` : ''}`;
}
function valNotas(){ // lo que escribió al explorar: [pregunta, respuesta]
  const n = S.val.notas || {}, l = VAL_AREAS.filter(a => (n[a.id] || '').trim()).map(a => [a.q, n[a.id].trim()]);
  if ((n.libre || '').trim()) l.push(['Si ahora no le sale nada (preguntas alternativas)', n.libre.trim()]);
  return l;
}
function valHtml(){ // en el informe: sus frases y lo que escribió al explorar
  const v = S.val, notas = valNotas(); if (!v.frases.length && !notas.length) return '';
  return `<h2>Lo que le importa</h2>${v.frases.length ? `<ul>${v.frases.map(f => { const a = valArea(f.area); return a ? `<li>${esc(cap(a.en))}: «${esc(f.palabra)}»${f.ej ? ' · ' + esc(f.ej) : ''}</li>` : ''; }).join('')}</ul>` : ''}
    ${notas.length ? `<p><b>Al explorar escribió:</b></p><ul>${notas.map(([q, r]) => `<li><i>${esc(q)}</i> ${esc(r)}</li>`).join('')}</ul>` : ''}
    ${v.top.length ? `<p>Palabras que más le importan: ${v.top.map(esc).join(', ')}.</p>` : ''}`;
}
function valText(){
  const v = S.val, notas = valNotas(); if (!v.frases.length && !notas.length) return [];
  return ['LO QUE LE IMPORTA', ...v.frases.map(f => { const a = valArea(f.area); return a ? `— ${cap(a.en)}: «${f.palabra}»${f.ej ? ' · ' + f.ej : ''}` : ''; }).filter(Boolean),
    ...(notas.length ? ['Al explorar escribió:', ...notas.map(([q, r]) => `— ${q} ${r}`)] : []),
    ...(v.top.length ? [`Palabras que más le importan: ${v.top.join(', ')}.`] : []), ''];
}
const CERCA_TXT = {si:'sí', poco:'un poco', no:'no'};
const accRes = r => (r.rev ? REV_TXT[r.rev] : 'sin revisar') + (r.cerca ? ' · te acercó a lo que importa: ' + CERCA_TXT[r.cerca] : '');
function sheetRevCerca(id){
  sheet(`<h2>Anotado</h2><div class="sub">Una última pregunta, si quieres: ¿te acercó a lo que te importa?</div>
    <div class="actions" style="margin-top:12px">${[['no', 'No'], ['poco', 'Un poco'], ['si', 'Sí']].map(([v, l]) => `<button class="btn ${v === 'si' ? 'pri' : ''}" data-act="rev-cerca" data-id="${esc(id)}" data-v="${v}">${l}</button>`).join('')}</div>
    <div class="actions"><button class="btn ghost" data-act="rev-dif-no">Omitir</button></div>`);
}
