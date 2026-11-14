/* ===================== Navegación ===================== */
// Pantallas: inicio (menú de herramientas) · abc (con sus pestañas) · respirar · anclaje · ajustes.
// Cada pantalla va en el historial (#abc/historial, #respirar…), así el botón Atrás del móvil vuelve al menú.
const TABS = ['registrar','historial','resumen'];
let VIEW = 'inicio', TAB = 'registrar';
let ED = null; // registro que se está escribiendo: {id (null si es nuevo), step, data}
const app = document.getElementById('app');
const BACK = `<button class="navb" data-act="back" aria-label="Volver">‹</button>`;
function render(){
  if (!S.settings.onb) return renderBienvenida();
  document.body.classList.toggle('editing', VIEW === 'abc' && !!ED);
  document.body.classList.toggle('nonav', VIEW !== 'abc');
  document.querySelectorAll('nav.tabs button').forEach(b => b.setAttribute('aria-current', !ED && b.dataset.tab === TAB ? 'page' : 'false'));
  if (VIEW === 'abc'){
    if (ED) return renderEditor();
    return ({registrar:renderRegistrar, historial:renderHistorial, resumen:renderResumen})[TAB]();
  }
  ({inicio:renderInicio, respirar:renderRespirar, anclaje:renderAnclaje, valores:renderValores, ajustes:renderAjustes})[VIEW]();
}
function applyTheme(){ const t = S.settings.theme; if (t === 'auto') document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme', t); }
function routeFromHash(){
  const [v, t] = location.hash.slice(1).split('/');
  if (TABS.includes(v)){ VIEW = 'abc'; TAB = v; }        // enlaces de la versión 4 (#registrar, #historial…)
  else if (v === 'abc'){ VIEW = 'abc'; TAB = TABS.includes(t) ? t : 'registrar'; }
  else VIEW = ['respirar','anclaje','valores','ajustes'].includes(v) ? v : 'inicio';
}
function go(hash){
  history.pushState({app:1}, '', '#' + hash);
  routeFromHash(); closeSheet(); window.scrollTo(0, 0); render();
}
function goBack(){
  if (history.state && history.state.app) history.back();
  else { history.replaceState(null, '', '#inicio'); routeFromHash(); closeSheet(); window.scrollTo(0, 0); render(); }
}
window.addEventListener('popstate', () => {
  if (BR) brStop();
  if (AN) anStop();
  if (ED && !ED.id && !isBlank(ED.data)) toast('Guardado como borrador');
  if (ED){ if (!ED.id && isBlank(ED.data)){ S.draft = null; save(); } ED = null; }
  routeFromHash(); closeSheet(); window.scrollTo(0, 0); render();
  if (AFTER){ const f = AFTER; AFTER = null; f(); }
});
document.querySelectorAll('nav.tabs button').forEach(b => b.addEventListener('click', () => {
  closeSheet(); TAB = b.dataset.tab; history.replaceState(history.state, '', '#abc/' + TAB); window.scrollTo(0, 0); render();
}));
