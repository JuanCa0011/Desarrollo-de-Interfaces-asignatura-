import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';

const NewClientPage: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Nuevo cliente</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {/* Formulario de alta: pendiente de implementar */}
      </IonContent>
    </IonPage>
  );
};

export default NewClientPage;
