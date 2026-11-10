import { IonContent, IonPage, useIonViewWillEnter } from '@ionic/react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import type { Client } from '../interfaces/Client';
import { ClientsService } from '../services/ClientsService';

const EMPTY_CLIENT: Client = {
  name: '',
  email: '',
  phone: '',
};

export default function NewClientPage(): React.JSX.Element {
  const navigate = useNavigate();

  const [client, setClient] = useState<Client>(EMPTY_CLIENT);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ionic mantiene la página montada entre visitas: se limpia el formulario
  // cada vez que se entra para no ver los datos del cliente anterior
  useIonViewWillEnter(() => {
    setClient(EMPTY_CLIENT);
    setError(null);
  });

  const save = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // evita que el formulario recargue la página

    setSaving(true);
    setError(null);
    try {
      await ClientsService.addClient(client);
      navigate('/clients');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el cliente');
    } finally {
      setSaving(false);
    }
  };

  return (
    <IonPage>
      <IonContent>
        <div className="container mt-4">
          <h2>Nuevo Cliente</h2>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={save}>
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
              {saving ? 'Guardando...' : 'Guardar'}
            </button>

            <Link to="/clients" className="btn btn-secondary">
              Cancelar
            </Link>
          </form>
        </div>
      </IonContent>
    </IonPage>
  );
}
