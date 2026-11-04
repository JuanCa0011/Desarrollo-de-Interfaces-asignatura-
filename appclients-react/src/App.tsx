import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Navigate, Route } from 'react-router-dom';

import ClientsPage from './pages/ClientsPage';
import EditClientPage from './pages/EditClientPage';
import NewClientPage from './pages/NewClientPage';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';
//import bootstrap
import 'bootstrap/dist/css/bootstrap.min.css'

/* Theme variables */
import './theme/variables.css';

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    {/* IonReactRouter = BrowserRouter de react-router-dom con las transiciones de Ionic */}
    <IonReactRouter>
      {/* IonRouterOutlet = <Routes> con la pila de navegación de Ionic */}
      <IonRouterOutlet>
        <Route path="/" element={<Navigate to="/clients" replace />} />
        <Route path="/clients" element={<ClientsPage />} />
        <Route path="/new-client" element={<NewClientPage />} />
        <Route path="/edit-client/:id" element={<EditClientPage />} />
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App;
