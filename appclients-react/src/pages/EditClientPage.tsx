import { IonContent, IonPage, useIonViewWillEnter } from '@ionic/react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import type { Client } from '../interfaces/Client';
import { ClientsService } from '../services/ClientsService';

/*
 * ============================================================
 *  FLUJO PARA EDITAR UN CLIENTE (usa la ruta paramétrica /edit-client/:id)
 * ============================================================
 *  PASO 1 → Botón "Editar" del listado navega a /edit-client/5
 *  PASO 2 → useParams() lee el ":id" de la URL → "5"
 *  PASO 3 → ClientsService.getClient(5) trae los datos de Supabase
 *           (SELECT * FROM clients WHERE id = 5) y rellenan el formulario
 *  PASO 4 → El usuario modifica los campos (setClient con spread ...client)
 *  PASO 5 → Al guardar, ClientsService.updateClient(5, client)
 *           (UPDATE clients SET name=..., email=..., phone=... WHERE id = 5)
 *  PASO 6 → navigate('/clients') vuelve al listado, que se recarga solo
 * ============================================================
 */
export default function EditClientPage(): React.JSX.Element {
  const navigate = useNavigate();

  // PASO 2: el nombre "id" coincide con ":id" de la ruta en App.tsx.
  // Los parámetros de la URL siempre llegan como texto → se convierte a número
  const { id } = useParams<{ id: string }>();
  const clientId = Number(id);

  const [client, setClient] = useState<Client>({ name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // true si el cliente no se pudo cargar → no se muestra el formulario
  const [loadFailed, setLoadFailed] = useState(false);

  // PASO 3: carga el cliente cada vez que se entra en la página o cambia el id
  useIonViewWillEnter(() => {
    const loadClient = async () => {
      setLoading(true);
      setError(null);
      setLoadFailed(false);

      // Si la URL trae algo que no es un número (/edit-client/abc) no se consulta
      if (!Number.isInteger(clientId)) {
        setError('El id del cliente no es válido');
        setLoadFailed(true);
        setLoading(false);
        return;
      }

      try {
        const data = await ClientsService.getClient(clientId);
        setClient(data); // rellena el formulario con los datos actuales
      } catch {
        setError(`No se encontró el cliente con id ${clientId}`);
        setLoadFailed(true);
      } finally {
        setLoading(false);
      }
    };

    loadClient();
  }, [clientId]);

  // PASO 5: guarda los cambios
  const save = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // evita que el formulario recargue la página

    setSaving(true);
    setError(null);
    try {
      await ClientsService.updateClient(clientId, client);
      navigate('/clients'); // PASO 6
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar el cliente');
    } finally {
      setSaving(false);
    }
  };

  return (
    <IonPage>
      <IonContent>
        <div className="container mt-4">
          <h2>Editar Cliente {Number.isInteger(clientId) && `#${clientId}`}</h2>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {loading ? (
            <p>Cargando cliente...</p>
          ) : loadFailed ? (
            <Link to="/clients" className="btn btn-secondary">
              Volver al listado
            </Link>
          ) : (
            <form onSubmit={save}>
              {/* PASO 4: cada campo muestra el valor actual (value) y lo
                  actualiza al escribir, conservando el resto con ...client */}
              <input
                className="form-control mb-2"
                placeholder="Nombre"
                required
                value={client.name}
                onChange={(e) => setClient({ ...client, name: e.target.value })}
              />

              <input
                type="email"
                className="form-control mb-2"
                placeholder="Email"
                required
                value={client.email}
                onChange={(e) => setClient({ ...client, email: e.target.value })}
              />

              <input
                type="tel"
                className="form-control mb-2"
                placeholder="Teléfono"
                required
                value={client.phone}
                onChange={(e) => setClient({ ...client, phone: e.target.value })}
              />

              <button type="submit" className="btn btn-success me-2" disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>

              <Link to="/clients" className="btn btn-secondary">
                Cancelar
              </Link>
            </form>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
}
