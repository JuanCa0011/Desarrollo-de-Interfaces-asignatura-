import { supabase } from '../config/supabase';
import type { Client } from '../interfaces/Client';

const TABLE = 'clients';

export class ClientsService {
  // Obtiene todos los clientes ordenados por id
  static async getClients(): Promise<Client[]> {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      throw error;
    }
    return data as Client[];
  }

  // Obtiene un cliente por su id
  static async getClient(id: number): Promise<Client> {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }
    return data as Client;
  }

  // Inserta un cliente nuevo (el id lo genera la base de datos)
  static async addClient(client: Client): Promise<void> {
    const { id: _id, ...newClient } = client;

    const { error } = await supabase.from(TABLE).insert([newClient]);

    if (error) {
      throw error;
    }
  }

  // Actualiza un cliente existente (no se modifica su id)
  static async updateClient(id: number, client: Client): Promise<void> {
    const { id: _id, ...changes } = client;

    const { error } = await supabase.from(TABLE).update(changes).eq('id', id);

    if (error) {
      throw error;
    }
  }

  // Elimina un cliente por su id
  static async deleteClient(id: number): Promise<void> {
    const { error } = await supabase.from(TABLE).delete().eq('id', id);

    if (error) {
      throw error;
    }
  }
}
