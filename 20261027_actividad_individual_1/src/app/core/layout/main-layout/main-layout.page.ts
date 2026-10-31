import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { bookOutline, libraryOutline, gridOutline, logOutOutline } from 'ionicons/icons';
import {
  IonSplitPane,
  IonMenu,
  IonContent,
  IonIcon,
  IonMenuToggle,
  IonRouterOutlet,
} from '@ionic/angular';
import { AuthService } from '../../services/auth.service';

addIcons({
  'book-outline': bookOutline,
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
    IonContent,
    IonIcon,
    IonMenuToggle,
    IonRouterOutlet,
  ],
})
export class MainLayoutPage {
  /** Estado de autenticación; muestra el enlace de administración solo a admins. */
  protected readonly authService = inject(AuthService);
  /** Router para redirigir al login tras cerrar sesión. */
  private readonly router = inject(Router);

  /** Inicial del nombre del usuario para el avatar. */
  protected readonly initial = computed(
    () => (this.authService.profile()?.nombre ?? 'U').trim().charAt(0) || 'U',
  );

  /** Cierra la sesión en Supabase y navega a `/login`. */
  public async logout(): Promise<void> {
    await this.authService.logout();
    void this.router.navigateByUrl('/login');
  }
}
