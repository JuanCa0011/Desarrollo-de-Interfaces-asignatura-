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
