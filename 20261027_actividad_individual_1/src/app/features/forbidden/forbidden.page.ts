import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonHeader, IonToolbar, IonButtons, IonTitle, IonContent, IonButton } from '@ionic/angular';
import { ThemeToggleComponent } from '../../shared/components/theme-toggle/theme-toggle.component';

/** Página 403: el usuario no tiene el rol necesario para la sección. */
@Component({
  selector: 'app-forbidden',
  templateUrl: './forbidden.page.html',
  styleUrls: ['./forbidden.page.scss'],
  imports: [
    ThemeToggleComponent,
    IonButtons,RouterLink, IonHeader, IonToolbar, IonTitle, IonContent, IonButton],
})
export class ForbiddenPage {}
