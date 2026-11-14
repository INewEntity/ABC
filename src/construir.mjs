// Monta index.html a partir de src/: la página (pagina.html), los estilos (estilos.css) y el código (js/*.js, por orden de nombre).
// La app que reciben los pacientes sigue siendo un único index.html, igual que antes; esto solo ordena el código fuente.
//
//   node src/construir.mjs              escribe index.html
//   node src/construir.mjs --comprobar  no escribe nada: falla si index.html no coincide con src/ (alguien lo editó a mano)
//
// Editar siempre en src/ y volver a montar. No editar index.html directamente.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SRC = path.dirname(fileURLToPath(import.meta.url));
const SALIDA = path.join(SRC, '..', 'index.html');

export function montar(){
  const leer = f => fs.readFileSync(path.join(SRC, f), 'utf8');
  const modulos = fs.readdirSync(path.join(SRC, 'js')).filter(f => f.endsWith('.js')).sort();
  const codigo = modulos.map(f => leer(path.join('js', f))).join('\n');
  const pagina = leer('pagina.html');
  for (const marca of ['@@ESTILOS@@', '@@CODIGO@@']) if (pagina.split(marca).length !== 2) throw new Error(`pagina.html debe tener ${marca} una sola vez`);
  return pagina.replace('@@ESTILOS@@', () => leer('estilos.css')).replace('@@CODIGO@@', () => codigo);
}
export const alDia = () => fs.readFileSync(SALIDA, 'utf8') === montar();

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)){
  if (process.argv.includes('--comprobar')){
    if (!alDia()){ console.error('index.html NO coincide con src/. Edita en src/ y monta con: node src/construir.mjs'); process.exit(1); }
    console.log('index.html está al día con src/');
  } else {
    fs.writeFileSync(SALIDA, montar());
    console.log('index.html montado desde src/');
  }
}
