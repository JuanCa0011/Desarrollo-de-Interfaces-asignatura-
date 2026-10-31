# Informes Lighthouse

Auditoría sobre el build de producción (`ng build`) servido en local, con Chrome headless.
Las páginas protegidas se auditaron con la sesión del administrador ya iniciada.

| Página | Accesibilidad | Buenas prácticas | Informe |
|---|---|---|---|
| `/login` | 100 | 100 | [lighthouse-login.html](lighthouse-login.html) |
| `/` (Catálogo) | 100 | 100 | [lighthouse-catalogo.html](lighthouse-catalogo.html) |
| `/admin` (Panel de administración) | 100 | 100 | [lighthouse-admin.html](lighthouse-admin.html) |

- Se midieron solo las categorías exigidas por la actividad (Accesibilidad y Buenas prácticas ≥ 90).
- Único aviso: *source maps* ausentes en el JavaScript de producción; no afecta a la puntuación.
- La URL del proyecto de Supabase está sustituida por `PROYECTO_REDACTADO` en los HTML.
