import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Libro } from '../models/database.models';

/**
 * Acceso a la tabla `libros` en Supabase (fuente de datos SQL/relacional, Fase 3).
 * Se amplía en fases posteriores con búsqueda, alta/edición y agregados para informes.
 */
@Injectable({ providedIn: 'root' })
export class LibrosService {
  private readonly supabase = inject(SupabaseService).client;

  public async listAll(): Promise<Libro[]> {
    const { data, error } = await this.supabase
      .from('libros')
      .select('*')
      .order('titulo', { ascending: true });

    if (error) {
      throw error;
    }
    return (data ?? []) as Libro[];
  }
}
