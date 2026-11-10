import { IonContent, IonPage, useIonViewWillEnter } from '@ionic/react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import type { Client } from '../interfaces/Client';
import { ClientsService } from '../services/ClientsService';

export default function ClientsPage(): React.JSX.Element {
  // useState: almacena el estado del componente
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadClients = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ClientsService.getClients();
      // setClients: actualiza el estado y obliga a React a renderizar de nuevo
      setClients(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar los clientes');
    } finally {
      setLoading(false);
    }
  };

  // Equivalente a useEffect(() => {...}, []) pero adaptado a Ionic:
  // IonRouterOutlet mantiene la página montada al navegar, así que useEffect
  // solo se ejecutaría una vez. useIonViewWillEnter se ejecuta cada vez que
  // la página se muestra, de modo que la lista se refresca al volver de
  // crear o editar un cliente.
  useIonViewWillEnter(() => {
    loadClients();
  });

  /*
   * ============================================================
   *  FLUJO PARA ELIMINAR UN CLIENTE (no usa ninguna ruta/URL)
   * ============================================================
   *  PASO 1 → Botón "Eliminar" de la tabla (más abajo, en el JSX)
   *  PASO 2 → handleDelete(client)            (esta función)
   *  PASO 3 → ClientsService.deleteClient(id) (services/ClientsService.ts)
   *  PASO 4 → Supabase: DELETE FROM clients WHERE id = :id
   *  PASO 5 → loadClients() vuelve a pedir la lista
   *  PASO 6 → setClients() actualiza el estado y React repinta la tabla
   *
   *  El id viaja como ARGUMENTO de la función, no en la URL.
   *  La única ruta paramétrica de la app es /edit-client/:id (editar).
   * ============================================================
   */
  // PASO 2: recibe el cliente de la fila pulsada
  const handleDelete = async (client: Client) => {
    // Un cliente sin id no está guardado en la BD → no se puede borrar
    if (client.id === undefined) return;
    // Pide confirmación antes de borrar
    if (!window.confirm(`¿Eliminar a ${client.name}?`)) return;

    try {
      // PASO 3 y 4: llama al servicio, que ejecuta el DELETE en Supabase
      await ClientsService.deleteClient(client.id);
      // PASO 5 y 6: recarga la lista para que desaparezca de la tabla
      await loadClients();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el cliente');
    }
  };

  return (
    <IonPage>
      <IonContent>
        <div className="container mt-4">
          <h2>Clientes</h2>

          <Link to="/new-client" className="btn btn-primary mb-3">
            Nuevo Cliente
          </Link>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {loading ? (
            <p>Cargando clientes...</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Teléfono</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center">
                        No hay clientes registrados
                      </td>
                    </tr>
                  ) : (
                    clients.map((client) => (
                      <tr key={client.id}>
                        <td>{client.id}</td>
                        <td>{client.name}</td>
                        <td>{client.email}</td>
                        <td>{client.phone}</td>
                        <td>
                          <Link
                            to={`/edit-client/${client.id}`}
                            className="btn btn-sm btn-warning me-2"
                          >
                            Editar
                          </Link>
                          {/* PASO 1: al pulsar, se pasa el cliente de esta fila a handleDelete */}
                          <button
                            type="button"
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(client)}
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
}
