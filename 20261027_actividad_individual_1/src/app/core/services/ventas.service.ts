import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { VentaConLibro } from '../models/database.models';

/** Acceso a la tabla `ventas` en Supabase (fuente SQL/relacional) con el libro asociado. */
@Injectable({ providedIn: 'root' })
export class VentasService {
  private readonly supabase = inject(SupabaseService).client;

  public async listAll(): Promise<VentaConLibro[]> {
    const { data, error } = await this.supabase
      .from('ventas')
      .select('*, libros(titulo, categoria)')
      .order('fecha_venta', { ascending: true });

    if (error) {
      throw error;
    }
    return (data ?? []) as unknown as VentaConLibro[];
  }
}
