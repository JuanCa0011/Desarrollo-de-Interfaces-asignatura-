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
- **Fase 4:** Responsive mobile-first, WCAG/ARIA, auditoría Lighthouse ≥90.
- **Fase 5:** Git flow, Compodoc, manual de usuario, despliegue en Vercel.

## 6. Checklist de entregables finales

- [ ] URL del repositorio (con historial de ramas)
- [ ] URL de la app en producción (Vercel)
- [ ] Credenciales de prueba (admin / usuario estándar)
- [ ] Informe Lighthouse (Accessibility y Best Practices ≥ 90)
- [ ] Documentación técnica (Compodoc) + Manual de Usuario

## 7. Limitaciones conocidas del entorno

- El runner de tests (`ng test`, basado en `@angular/build:unit-test` + Vitest) no encuentra
  los archivos `*.spec.ts` cuando el repositorio está anidado dentro de una ruta con paréntesis
  (`Desarrollo de Interfaces (asignatura)`), por un problema de resolución de globs de Vitest
  con rutas que contienen caracteres especiales. Es un problema de la ruta del workspace, no del
  código del proyecto: `tsc --noEmit` y `ng build` sí se ejecutan correctamente y se usan como
  validación mientras tanto. Si hace falta ejecutar los tests en CI/local, clonar el repo en una
  ruta sin paréntesis resuelve el problema.
