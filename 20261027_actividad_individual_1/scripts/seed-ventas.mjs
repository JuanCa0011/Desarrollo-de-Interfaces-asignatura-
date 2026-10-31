// Carga ventas de ejemplo en Supabase para que el dashboard muestre datos (gráfico de ingresos e informe de ventas).
//
// Las políticas RLS de `ventas` solo permiten registrar ventas a nombre del propio usuario autenticado,
// así que las ventas se crean con la cuenta indicada (`usuario_id` = id de esa cuenta). La columna `total`
// es generada por la base de datos y no se envía.
//
// Uso (PowerShell o bash), con las credenciales en variables de entorno, nunca en el código:
//   URL_=<supabaseUrl> KEY=<clave publishable> EMAIL=<admin> PASS=<contraseña> OUT=ids.json node scripts/seed-ventas.mjs
//
// OUT recibe los ids insertados. Para deshacerlo, en el SQL Editor de Supabase:
//   delete from public.ventas where id in (<ids>);
import { writeFileSync } from 'node:fs';

const { URL_, KEY, EMAIL, PASS, OUT } = process.env;
const j = async (r) => {
  const t = await r.text();
  try { return JSON.parse(t); } catch { return t; }
};

const auth = await j(
  await fetch(`${URL_}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASS }),
  }),
);
const H = { apikey: KEY, Authorization: `Bearer ${auth.access_token}`, 'Content-Type': 'application/json' };

const libros = await j(await fetch(`${URL_}/rest/v1/libros?select=id,titulo,categoria,precio,descuento`, { headers: H }));
const byTitle = Object.fromEntries(libros.map((l) => [l.titulo, l]));

// [título, unidades, días atrás]  -> pesos: Fantasía, Ciencia Ficción, Técnico, Infantil y Novela dominan
const plan = [
  ['Harry Potter y la Piedra Filosofal', 3, 4], ['Harry Potter y la Piedra Filosofal', 2, 19],
  ['El Hobbit', 2, 7], ['El Hobbit', 3, 33],
  ['1984', 2, 3], ['Fundación', 1, 12], ['1984', 3, 41],
  ['Clean Code', 2, 5], ['Eloquent JavaScript', 1, 16], ['Clean Code', 1, 52],
  ['El Principito', 4, 9], ['Charlie y la Fábrica de Chocolate', 2, 27],
  ['Cien Años de Soledad', 2, 14], ['Cien Años de Soledad', 1, 61],
  ['El Nombre de la Rosa', 1, 22], ['Sapiens: De Animales a Dioses', 1, 38],
  ['Steve Jobs', 1, 70], ['Naruto Vol. 1', 2, 25], ['Orgullo y Prejuicio', 1, 88], ['Los Cuatro Acuerdos', 1, 105],
];

const rows = plan.map(([titulo, cantidad, dias]) => {
  const l = byTitle[titulo];
  if (!l) throw new Error('No existe el libro: ' + titulo);
  const unit = +(l.precio * (1 - (l.descuento ?? 0) / 100)).toFixed(2);
  const fecha = new Date(Date.now() - dias * 86400000);
  fecha.setHours(10 + (dias % 8), (dias * 7) % 60, 0, 0);
  return {
    libro_id: l.id,
    usuario_id: auth.user.id,
    cantidad,
    precio_unitario: unit,
    fecha_venta: fecha.toISOString(),
  };
});

const res = await fetch(`${URL_}/rest/v1/ventas`, {
  method: 'POST',
  headers: { ...H, Prefer: 'return=representation' },
  body: JSON.stringify(rows),
});
const body = await j(res);
console.log('HTTP', res.status);
if (!res.ok) {
  console.log(JSON.stringify(body));
  process.exit(1);
}
writeFileSync(OUT, JSON.stringify(body.map((v) => v.id)));
const total = body.reduce((s, v) => s + v.total, 0);
console.log(`Insertadas ${body.length} ventas. Ingresos totales: ${total.toFixed(2)} EUR`);
