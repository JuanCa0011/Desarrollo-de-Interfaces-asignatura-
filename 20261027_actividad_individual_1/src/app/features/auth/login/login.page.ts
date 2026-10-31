import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonTitle,
  IonContent,
  IonIcon,
  IonInput,
  IonInputPasswordToggle,
  IonButton,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { bookOutline } from 'ionicons/icons';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeToggleComponent } from '../../../shared/components/theme-toggle/theme-toggle.component';

addIcons({ 'book-outline': bookOutline });

/** Página de inicio de sesión (email y contraseña) contra Supabase Auth. */
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['../auth.shared.scss'],
  imports: [
    ThemeToggleComponent,
    IonButtons,
    ReactiveFormsModule,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonIcon,
    IonInputPasswordToggle,
    IonInput,
    IonButton,
  ],
})
export class LoginPage {
  /** Constructor de formularios reactivos. */
  private readonly fb = inject(FormBuilder);
  /** Servicio de autenticación. */
  private readonly authService = inject(AuthService);
  /** Router para redirigir tras el login. */
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  /** Indica que hay un envío en curso. */
  public readonly submitting = signal(false);
  /** Mensaje de error a mostrar, o `null`. */
  public readonly errorMessage = signal<string | null>(null);

  /** Formulario reactivo con `email` y `password`. */
  public readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  /** Valida el formulario, inicia sesión y navega a `returnUrl` (o `/`). */
  public async onSubmit(): Promise<void> {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.form.getRawValue();
    const { error } = await this.authService.login(email, password);

    this.submitting.set(false);

    if (error) {
      this.errorMessage.set(
        /invalid login credentials/i.test(error)
          ? 'Email o contraseña incorrectos. Inténtalo de nuevo.'
          : /not confirmed/i.test(error)
            ? 'Debes confirmar tu email antes de iniciar sesión. Revisa tu bandeja de entrada.'
            : `No se pudo iniciar sesión: ${error}`,
      );
      return;
    }

    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/';
    void this.router.navigateByUrl(returnUrl);
  }
}
