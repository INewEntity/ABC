/* ===================== Bienvenida (primera vez) ===================== */
function renderBienvenida(){
  document.body.classList.remove('editing'); document.body.classList.add('nonav');
  app.innerHTML = `<header class="top"><div class="ht"><h1>Bienvenida</h1><div class="sub">${esc(APP_NOMBRE)} · antes de empezar</div></div></header>
    <div class="card"><label class="f" style="margin-top:0">¿Cómo te llamas? <span style="font-weight:400">(opcional)</span></label>
      <input id="onb-nom" maxlength="60" autocomplete="name" value="${esc(S.settings.nombre)}" placeholder="Tu nombre, o cómo quieres que te saluden">
      <div class="muted small" style="margin-top:8px">Sirve para saludarte y para salir en los informes.</div></div>
    <div class="card"><b>${ico('candado', 'inl')}Tus datos se quedan solo en este móvil</b>
      <div class="muted small" style="margin-top:8px">No hay servidor ni cuentas, y no se envía nada a ningún sitio. Solo sale lo que tú decides exportar y mandar.</div></div>
    <div class="actions"><button class="btn" data-act="onb-skip">Saltar</button><button class="btn pri" data-act="onb-ok">Empezar</button></div>
    ${CRISIS}`;
}

/* ===================== Inicio: por momentos ===================== */
// Primero «¿Cómo estás ahora?», que lleva a lo adecuado sin tener que saber qué herramienta toca;
// debajo, lo pendiente en un solo bloque y, al final, todas las herramientas.
const MOMENTOS = [
  {id:'ahora', t:'Me está pasando ahora', d:'Ansiedad, enfado o malestar fuerte en este momento', c:'hi'},
  {id:'tension', t:'Estoy en tensión', d:'Quiero bajar un poco la tensión', c:'lo'},
  {id:'paso', t:'Ha pasado algo', d:'Quiero apuntarlo mientras lo recuerdo', c:'neu'},
  {id:'calma', t:'Estoy en calma', d:'Quiero practicar o pensar en lo que me importa', c:'mid'},
];
function momento(id){
  if (id === 'ahora') return anStart('real');            // directo, sin pasos previos
  if (id === 'tension') return go('respirar');
  if (id === 'paso'){ go('abc'); return openEditor(null); }
  sheetCalma();
}
function sheetCalma(){
  const op = (attrs, t, d) => `<button class="opt" ${attrs}><span><b>${t}</b><br><span class="d">${d}</span></span><span class="muted">›</span></button>`;
  sheet(`<h2>Estás en calma</h2><div class="sub">Buen momento para entrenar o para pensar en lo que te importa.</div>
    <div class="stack" style="margin-top:12px">
      ${op('data-act="an-start" data-m="sim"', 'Simulacro del Anclaje', 'Practicarlo antes de necesitarlo · unos 2 minutos')}
      ${op('data-act="go" data-to="valores"', 'Lo que importa', S.val.frases.length ? 'Repasar tu brújula' : 'Explorar qué es importante para ti')}
      ${op('data-act="br-open" data-id="lenta"', 'Respiración lenta', 'La práctica diaria con más respaldo')}
    </div>`);
}

/* ===================== Herramientas ===================== */
const TOOLS = [
  {id:'abc', n:'Autorregistro', d:'Apunta qué pasó, qué pensaste y cómo te sentiste', ic:'<span class="ic-abc">ABC</span>'},
  {id:'respirar', n:'Respiración guiada', d:'Ejercicios para bajar la tensión, calmarte o dormir', ic:'<span class="ic-resp"><i></i></span>'},
  {id:'anclaje', n:'Anclaje', d:'Para mantenerte en pie cuando aprieta y elegir qué hacer', ic:`<span class="ic-anc">${ico('ancla')}</span>`},
  {id:'valores', n:'Lo que importa', d:'Explora qué es importante para ti', ic:`<span class="ic-val">${ico('brujula')}</span>`},
  {id:null, n:'Relajación muscular', d:'Tensar y soltar, paso a paso', ic:`<span class="ic-soon">${ico('olas')}</span>`},
];
function renderInicio(){
  const s = S.settings, h = new Date().getHours(), pend = S.entries.filter(e => lpPending(e)).length;
  const saludo = h >= 5 && h < 14 ? 'Buenos días' : h >= 5 && h < 21 ? 'Buenas tardes' : 'Buenas noches';
  const nombre = s.nombre.trim().split(/\s+/)[0];
  const avisos = (S.draft ? `<button class="aviso" data-act="go" data-to="abc"><b>Tienes un registro a medias</b><span>Seguir ›</span></button>` : '')
    + (pend ? `<button class="aviso" data-act="go" data-to="abc"><b>${pend === 1 ? 'Un registro por completar' : pend + ' registros por completar'}</b><span>Ver ›</span></button>` : '')
    + revCard() + bkCard();
  app.innerHTML = `<header class="top"><div class="ht"><h1>${saludo}${nombre ? ', ' + esc(nombre) : ''}</h1><div class="sub">${longDate(Date.now())}</div></div>
      <button class="navb" data-act="go" data-to="ajustes" aria-label="Ajustes">${ico('ajustes')}</button></header>
    <h2 class="hola">¿Cómo estás ahora?</h2>
    <div class="moms">${MOMENTOS.map(m => `<button class="mom ${m.c}" data-act="mom" data-m="${m.id}"><b>${m.t}</b><span>${m.d}</span></button>`).join('')}</div>
    ${avisos ? `<h3 class="sec"><span>Pendiente</span></h3>${avisos}` : ''}
    <h3 class="sec"><span>Todas las herramientas</span></h3>
    <div class="tools">${TOOLS.map(t => t.id
      ? `<button class="tool" data-act="go" data-to="${t.id}">${t.ic}<b>${t.n}</b><span>${t.d}</span></button>`
      : `<div class="tool soon" aria-disabled="true">${t.ic}<b>${t.n}</b><span>Próximamente</span></div>`).join('')}</div>
    ${CRISIS}`;
}
