/**
 * Tipos que reflejan el esquema de la base de datos en Supabase
 * (tablas `profiles`, `libros` y `ventas`).
 */

export type UserRole = 'admin' | 'standard_user';

export interface Profile {
  id: string;
  nombre: string;
  role: UserRole;
  created_at: string;
}

export interface Libro {
  id: string;
  titulo: string;
  autor: string;
  isbn: string | null;
  editorial: string | null;
  categoria: string;
  precio: number;
  stock: number;
  anio_publicacion: number | null;
  idioma: string | null;
  numero_paginas: number | null;
  descripcion: string | null;
  portada_url: string | null;
  valoracion: number | null;
  descuento: number | null;
  destacado: boolean;
  created_at: string;
  updated_at: string;
}

export interface Venta {
  id: string;
  libro_id: string;
  usuario_id: string | null;
  cantidad: number;
  precio_unitario: number;
  total: number;
  fecha_venta: string;
}

/** Venta con los datos del libro asociado (join `libros(...)` de PostgREST). */
export interface VentaConLibro extends Venta {
  libros: Pick<Libro, 'titulo' | 'categoria'> | null;
}

/** Reseña de un libro (fuente NoSQL simulada, ver `ResenasMockService`). */
export interface Resena {
  id: string;
  libroId: string;
  libroTitulo: string;
  autor: string;
  puntuacion: number;
  comentario: string;
  fecha: string;
}
