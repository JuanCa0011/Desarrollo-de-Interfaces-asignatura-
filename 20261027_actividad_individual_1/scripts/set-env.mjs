// Genera src/environments/environment.ts y environment.prod.ts a partir de variables de entorno.
// Se usa en el despliegue (Vercel), donde esos archivos no existen porque están en .gitignore.
//
// Variables requeridas: SUPABASE_URL y SUPABASE_KEY (clave publishable).
import { mkdirSync, writeFileSync } from 'node:fs';

const { SUPABASE_URL, SUPABASE_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Faltan las variables de entorno SUPABASE_URL y/o SUPABASE_KEY.');
  process.exit(1);
}

const render = (production) =>
  `export const environment = {\n  production: ${production},\n  supabaseUrl: ${JSON.stringify(SUPABASE_URL)},\n  supabaseKey: ${JSON.stringify(SUPABASE_KEY)},\n};\n`;

mkdirSync('src/environments', { recursive: true });
writeFileSync('src/environments/environment.ts', render(false));
writeFileSync('src/environments/environment.prod.ts', render(true));
console.log('Archivos de entorno generados.');
