// Plantilla de environment. Copia este archivo como `environment.ts` (desarrollo)
// y `environment.prod.ts` (producción), y rellena con tus credenciales reales de Supabase.
// Los archivos `environment.ts` y `environment.prod.ts` están excluidos del control de
// versiones (ver .gitignore) para no exponer configuración de entorno en el repositorio.

export const environment = {
  production: false,
  supabaseUrl: 'TU_SUPABASE_URL',
  supabaseKey: 'TU_SUPABASE_PUBLISHABLE_KEY',
};
