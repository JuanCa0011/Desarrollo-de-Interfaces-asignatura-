# Plan del Proyecto — Venta de Libros (Actividad Individual 1, DI 0488)

## 1. Resumen

App Ionic 9 + Angular 22 (standalone) de venta de libros, con backend en Supabase
(Postgres + Auth), roles Admin/Usuario Estándar, componentes reutilizables,
dashboard con gráficos, exportación PDF/CSV, accesibilidad WCAG y despliegue en Vercel.

## 2. Decisiones de arquitectura

- **Auth/roles:** Supabase Auth (email/password) + tabla `profiles` (role: admin/standard_user).
- **Guards:** Functional Guards modernos (`CanActivateFn`, `CanMatchFn`, `CanDeactivateFn`),
  `UrlTree` para redirecciones, `AuthService` basado en Signals.
- **Modelo de datos:** `profiles`, `libros` (18 columnas), `ventas`.
- **NoSQL simulado:** mock local en RxJS (reseñas de libros), sin backend adicional.
- **Estilos:** SCSS patrón 7-1 (`abstracts/components/main.scss`) + BEM, sobre el theming de Ionic.
- **Git flow:** mismo repo del curso, ramas `develop` y `feature/actividad1-*`.
- **Despliegue:** Vercel.
- **Moneda:** EUR. **Portadas:** URLs placeholder.

## 3. Esquema de base de datos (ya ejecutado en Supabase ✅)

Tablas: `profiles`, `libros` (18 columnas: id, titulo, autor, isbn, editorial, categoria,
precio, stock, anio_publicacion, idioma, numero_paginas, descripcion, portada_url,
valoracion, descuento, destacado, created_at, updated_at), `ventas`.
RLS activado con políticas por rol (`is_admin()` como función security definer).
Seed: 17 libros de ejemplo en 13 categorías.

(El script SQL completo se entregó y ya se ejecutó manualmente en el SQL Editor de Supabase.)

### 3.1 Función RPC adicional (Fase 1)

```sql
create or replace function public.email_exists(p_email text)
returns boolean
language sql
security definer
set search_path = public, auth
as $$
  select exists (select 1 from auth.users where lower(email) = lower(p_email));
$$;

grant execute on function public.email_exists(text) to anon, authenticated;
```

Usada por `emailExistsValidator` (validación asíncrona de email duplicado en el registro,
Paso 1.2 de la actividad). Ya ejecutada en Supabase.

## 4. Configuración de entorno

- `src/environments/environment.ts` y `environment.prod.ts` → **gitignored** (contienen la
  URL y la clave pública de Supabase; no se versionan aunque la anon/publishable key sea
  pública por diseño, para seguir las buenas prácticas pedidas en la actividad).
- `src/environments/environment.example.ts` → commiteado, con placeholders, como plantilla
  para que cualquier persona que clone el repo sepa qué variables debe rellenar:

  ```ts
  export const environment = {
    production: false,
    supabaseUrl: 'TU_SUPABASE_URL',
    supabaseKey: 'TU_SUPABASE_PUBLISHABLE_KEY',
  };
  ```

- Dependencia: `@supabase/supabase-js` (≥2.49, compatible con claves `sb_publishable_...`).
- Servicio: [`SupabaseService`](../src/app/core/services/supabase.service.ts) (`providedIn: 'root'`) expone el cliente
  de Supabase ya configurado para el resto de la app.
- Modelos TypeScript del esquema de BD en
  [`src/app/core/models/database.models.ts`](../src/app/core/models/database.models.ts)
  (`Profile`, `Libro`, `Venta`, `UserRole`).

## 5. Fases de implementación

- **Fase 0:** `SupabaseService`, environments, instalación de dependencias. ✅ _(completado)_
- **Fase 1:** Side Menu + lazy loading, `authGuard`/`roleMatchGuard`/`roleActivateGuard`,
  Login/Registro con validación async de email duplicado. ✅ _(completado)_
  - `AuthService` (Signals) + sesión Supabase Auth + carga de `profiles`.
  - Guards funcionales: `authGuard`, `guestGuard`, `roleMatchGuard`/`roleActivateGuard` (RBAC),
    `pendingChangesGuard` (protege el formulario de registro de pérdida de datos).
  - RPC `email_exists` en Supabase + `emailExistsValidator` (AsyncValidatorFn, `updateOn: 'blur'`).
  - `MainLayoutPage`: Side Menu (`ion-split-pane`/`ion-menu`) con navegación a Catálogo y,
    si `isAdmin()`, al Panel de administración.
  - Página "Catálogo" (`home.page`) ya consume `LibrosService` → Supabase (`libros`).
  - Rutas: `login`, `register` (con `guestGuard`), shell `''` (con `authGuard`) con hijos
    `home` y `admin` (blindada con `canMatch` + `canActivate`), `forbidden`, `**` → `not-found`.
- **Fase 2:** `BookDataTableComponent` (tabla + buscador), `StatWidgetComponent` (dashboard). ✅ _(completado)_
  - Componentes standalone en `src/app/shared/components/`, `OnPush`, con `input()`/`output()`:
    tabla con buscador, ordenación y `aria-sort` (outputs `rowSelected`, `searchChange`) y widget KPI (output `selected`).
  - Usados en el Catálogo (`home.page`) y en el Panel admin (4 widgets + tabla de inventario).
- **Fase 3:** `LibrosService`/`VentasService` (Supabase), `ResenasMockService` (NoSQL simulado),
  Dashboard admin con Chart.js, exportación PDF (jsPDF) y CSV. ✅ _(completado)_
  - `VentasService` (join con `libros`), `ResenasMockService` (RxJS, `list()` + `stream()` tipo `onSnapshot`),
    `ExportService` (CSV con BOM, PDF con jsPDF + autotable cargados en diferido).
  - `ChartCardComponent` (Chart.js reutilizable) y dashboard con 4 widgets, 2 gráficos,
    reseñas en tiempo real y botones de exportación de inventario y ventas.
- **Fase 4:** Responsive mobile-first, WCAG/ARIA, auditoría Lighthouse ≥90. ✅ _(completado)_
  - `index.html`: `lang="es"`, título, descripción y viewport sin bloqueo de zoom (WCAG 1.4.4).
  - Botón de menú (`ion-menu-button`) en móvil, `h1` por página (`.sr-only`), etiquetas asociadas
    con `label`/`labelPlacement` en `ion-input`, foco visible global y `prefers-reduced-motion`.
  - Tabla con `caption`, `scope` y `aria-sort`; gráficos con `role="img"` y `aria-label`.
  - Lighthouse (build de producción, sesión admin iniciada con navegador automatizado):
    `/login`, `/` (Catálogo) y `/admin` → Accesibilidad 100, Buenas prácticas 100.
    Único aviso: source maps ausentes en el JS de producción (no afecta a la puntuación).
  - Botón de modo claro/oscuro (`ThemeToggleComponent`) en la esquina superior derecha de cada página: `ThemeService` (Signal + `localStorage`, valor inicial
    según el sistema) con la paleta `dark.class` de Ionic (`ion-palette-dark` en `<html>`);
    los gráficos se redibujan al cambiar de tema.
  - Corregido contraste en modo oscuro: tokens propios `--app-surface`, `--app-text-muted`,
    `--app-danger-text` en `global.scss` (las variables `--ion-color-step-*` no estaban definidas).
- **Rediseño visual** ✅ (rama `feature/actividad1-diseno`): referencias de Dribbble y guías de dashboards 2026.
  - Tema en `src/theme/variables.scss`: papel cálido / azul noche, acento índigo, Fraunces (títulos) + Inter.
  - Catálogo con hero, filtros por categoría, orden, `BookCardComponent` + `BookCoverComponent`
    (portadas generadas con CSS, sustituyen a los placeholders externos) y modal de detalle.
  - Login/registro en diseño partido; menú lateral con marca y tarjeta de usuario.
  - Dashboard bento: KPI planos, circulares con top 5 + «Otros», reseñas en directo y tabla en panel.
  - Lighthouse tras el rediseño (claro y oscuro): Accesibilidad 100 / Buenas prácticas 100.
- **Fase 5:** Git flow, Compodoc, manual de usuario, despliegue en Vercel.
  - **Compodoc** ✅: `npm run docs` genera `documentation/` (versionada en Git como entregable; regenerar con el mismo comando tras cambios) y `npm run docs:serve` la sirve
    en local. Usa `tsconfig.doc.json`. Cobertura de documentación: 98 % (JSDoc en servicios, guards,
    modelos, páginas y componentes compartidos).
  - **Manual de usuario** ✅: [`docs/manual/MANUAL_USUARIO.md`](docs/manual/MANUAL_USUARIO.md), con capturas
    en `docs/manual/img/` y credenciales de prueba.
  - **Git flow** ✅: `develop` recibe `feature/actividad1-setup` con merge `--no-ff`; ramas subidas a GitHub.
    Trabajar en `develop`/`feature/*`: en `main` los `environment*.ts` antiguos siguen versionados y
    cambiar a esa rama sobrescribe los locales (hay que regenerarlos con `scripts/set-env.mjs`).
  - **Vercel** (configuración lista, falta conectar el repo en vercel.com):
    - `vercel.json`: `npm ci`, `npm run build:vercel`, salida `www`, reescritura de rutas a `index.html` (SPA).
    - `scripts/set-env.mjs` genera `environment.ts`/`environment.prod.ts` desde `SUPABASE_URL` y `SUPABASE_KEY`.
    - Pasos: Import Project → repo `Desarrollo-de-Interfaces-asignatura-` → *Root Directory*
      `20261027_actividad_individual_1` → rama a desplegar → *Environment Variables*
      `SUPABASE_URL` y `SUPABASE_KEY` → Deploy.
    - En Supabase: *Authentication → URL Configuration* → añadir la URL de Vercel en *Site URL*/*Redirect URLs*.

## 6. Checklist de entregables finales

- [ ] URL del repositorio (con historial de ramas)
- [ ] URL de la app en producción (Vercel)
- [ ] Credenciales de prueba (admin / usuario estándar)
- [x] Informe Lighthouse (Accessibility y Best Practices ≥ 90): [`docs/lighthouse/`](docs/lighthouse/README.md)
- [ ] Documentación técnica (Compodoc) + Manual de Usuario

## 7. Limitaciones conocidas del entorno

- El runner de tests (`ng test`, basado en `@angular/build:unit-test` + Vitest) no encuentra
  los archivos `*.spec.ts` cuando el repositorio está anidado dentro de una ruta con paréntesis
  (`Desarrollo de Interfaces (asignatura)`), por un problema de resolución de globs de Vitest
  con rutas que contienen caracteres especiales. Es un problema de la ruta del workspace, no del
  código del proyecto: `tsc --noEmit` y `ng build` sí se ejecutan correctamente y se usan como
  validación mientras tanto. Si hace falta ejecutar los tests en CI/local, clonar el repo en una
  ruta sin paréntesis resuelve el problema.
