/**
 * Tipos que reflejan el esquema de la base de datos en Supabase
 * (tablas `profiles`, `libros` y `ventas`) y la fuente NoSQL simulada de reseñas.
 */

/** Rol de un usuario: `admin` accede al panel de administración, `standard_user` solo al catálogo. */
export type UserRole = 'admin' | 'standard_user';

/** Fila de la tabla `profiles`, asociada 1:1 a un usuario de Supabase Auth. */
export interface Profile {
  /** UUID del usuario (coincide con `auth.users.id`). */
  id: string;
  /** Nombre visible del usuario. */
  nombre: string;
  /** Rol usado por los guards RBAC. */
  role: UserRole;
  /** Fecha de alta (ISO 8601). */
  created_at: string;
}

/** Fila de la tabla `libros` (18 columnas). */
export interface Libro {
  /** Identificador único (UUID). */
  id: string;
  titulo: string;
  autor: string;
  /** Código ISBN, si se conoce. */
  isbn: string | null;
  editorial: string | null;
  /** Categoría temática (una de las 13 del catálogo). */
  categoria: string;
  /** Precio en euros. */
  precio: number;
  /** Unidades disponibles; 5 o menos se considera stock bajo. */
  stock: number;
  anio_publicacion: number | null;
  idioma: string | null;
  numero_paginas: number | null;
  descripcion: string | null;
  /** URL de la portada (imagen placeholder). */
  portada_url: string | null;
  /** Valoración media (0-5). */
  valoracion: number | null;
  /** Porcentaje de descuento aplicado. */
  descuento: number | null;
  /** Indica si el libro aparece como destacado. */
  destacado: boolean;
  /** Fecha de creación (ISO 8601). */
  created_at: string;
  /** Fecha de la última modificación (ISO 8601). */
  updated_at: string;
}

/** Fila de la tabla `ventas`. */
export interface Venta {
  /** Identificador único de la venta. */
  id: string;
  /** Libro vendido (clave foránea a `libros.id`). */
  libro_id: string;
  /** Comprador, o `null` si la venta es anónima. */
  usuario_id: string | null;
  /** Unidades vendidas. */
  cantidad: number;
  /** Precio por unidad en el momento de la venta. */
  precio_unitario: number;
  /** Importe total de la venta (`cantidad * precio_unitario`). */
  total: number;
  /** Fecha de la venta (ISO 8601). */
  fecha_venta: string;
}

/** Venta con los datos del libro asociado (join `libros(...)` de PostgREST). */
export interface VentaConLibro extends Venta {
  /** Título y categoría del libro vendido, o `null` si ya no existe. */
  libros: Pick<Libro, 'titulo' | 'categoria'> | null;
}

/** Reseña de un libro (fuente NoSQL simulada, ver `ResenasMockService`). */
export interface Resena {
  /** Identificador del documento. */
  id: string;
  /** Libro reseñado. */
  libroId: string;
  /** Título del libro, desnormalizado como en una base de documentos. */
  libroTitulo: string;
  /** Nombre del autor de la reseña. */
  autor: string;
  /** Puntuación de 1 a 5. */
  puntuacion: number;
  comentario: string;
  /** Fecha de creación (ISO 8601). */
  fecha: string;
}
