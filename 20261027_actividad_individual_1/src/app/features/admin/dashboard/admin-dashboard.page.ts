import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonText } from '@ionic/angular';

/**
 * Placeholder del Dashboard de administración (se completa en la Fase 3 con
 * gráficos Chart.js, consumo de datos agregados y exportación PDF/CSV).
 * Protegida por `roleMatchGuard`/`roleActivateGuard(['admin'])` en `admin.routes.ts`.
 */
@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.page.html',
  styleUrls: ['./admin-dashboard.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonText],
})
export class AdminDashboardPage {}
