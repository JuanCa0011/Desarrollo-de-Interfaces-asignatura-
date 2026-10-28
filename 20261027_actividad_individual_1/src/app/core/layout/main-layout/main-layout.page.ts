import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { libraryOutline, gridOutline, logOutOutline } from 'ionicons/icons';
import {
  IonSplitPane,
  IonMenu,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonIcon,
  IonLabel,
  IonMenuToggle,
  IonRouterOutlet,
} from '@ionic/angular';
import { AuthService } from '../../services/auth.service';

addIcons({
  'library-outline': libraryOutline,
  'grid-outline': gridOutline,
  'log-out-outline': logOutOutline,
});

/**
 * Shell de navegación global (Paso 1.1): Side Menu con carga diferida de las secciones
 * hijas a través del `<ion-router-outlet>` anidado. El enlace al panel de administración
 * solo se muestra si `authService.isAdmin()`; el acceso real a la ruta está protegido
 * además por los guards (`roleMatchGuard`/`roleActivateGuard`), no solo por esta
 * ocultación visual.
 */
@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.page.html',
  styleUrls: ['./main-layout.page.scss'],
  imports: [
    RouterLink,
    RouterLinkActive,
    IonSplitPane,
    IonMenu,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonIcon,
    IonLabel,
    IonMenuToggle,
    IonRouterOutlet,
  ],
})
export class MainLayoutPage {
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  public async logout(): Promise<void> {
    await this.authService.logout();
    void this.router.navigateByUrl('/login');
  }
}
