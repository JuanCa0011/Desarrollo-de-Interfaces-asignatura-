import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonHeader, IonToolbar, IonButtons, IonTitle, IonContent, IonButton } from '@ionic/angular';
import { ThemeToggleComponent } from '../../shared/components/theme-toggle/theme-toggle.component';

/** Página 404: la ruta solicitada no existe. */
@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.page.html',
  styleUrls: ['./not-found.page.scss'],
  imports: [
    ThemeToggleComponent,
    IonButtons,RouterLink, IonHeader, IonToolbar, IonTitle, IonContent, IonButton],
})
export class NotFoundPage {}
