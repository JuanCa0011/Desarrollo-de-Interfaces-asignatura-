import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

/**
 * Servicio singleton que centraliza el cliente de Supabase (Postgres + Auth).
 * El resto de servicios de la app (AuthService, LibrosService, VentasService...)
 * deben inyectar este servicio en lugar de instanciar su propio cliente.
 */
@Injectable({ providedIn: 'root' })
export class SupabaseService {
  public readonly client: SupabaseClient = createClient(
    environment.supabaseUrl,
    environment.supabaseKey,
  );
}
