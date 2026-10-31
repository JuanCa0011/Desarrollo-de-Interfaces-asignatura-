import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  ReactiveFormsModule,
  FormBuilder,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonTitle,
  IonContent,
  IonItem,
  IonInput,
  IonButton,
  IonText,
  IonSpinner,
} from '@ionic/angular';
import { AuthService } from '../../../core/services/auth.service';
import { ComponentCanDeactivate } from '../../../core/guards/pending-changes.guard';
import { emailExistsValidator } from '../../../core/validators/email-exists.validator';
import { ThemeToggleComponent } from '../../../shared/components/theme-toggle/theme-toggle.component';

/** Validador de grupo: error `passwordsMismatch` si las contraseñas no coinciden. */
function passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirmPassword = group.get('confirmPassword')?.value;
  return password === confirmPassword ? null : { passwordsMismatch: true };
}

/** Página de registro con validación asíncrona de email duplicado y protección de cambios sin guardar. */
@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  imports: [
    ThemeToggleComponent,
    IonButtons,
    ReactiveFormsModule,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonInput,
    IonButton,
    IonText,
    IonSpinner,
  ],
})
export class RegisterPage implements ComponentCanDeactivate {
  /** Constructor de formularios reactivos. */
  private readonly fb = inject(FormBuilder);
  /** Servicio de autenticación. */
  private readonly authService = inject(AuthService);
  /** Router para redirigir tras el registro. */
  private readonly router = inject(Router);

  /** Indica que hay un envío en curso. */
  public readonly submitting = signal(false);
  /** Mensaje de error a mostrar, o `null`. */
  public readonly errorMessage = signal<string | null>(null);
  /** `true` cuando la cuenta se creó correctamente. */
  public readonly registered = signal(false);

  /** Formulario con nombre, email (async, al perder el foco) y contraseñas. */
  public readonly form = this.fb.nonNullable.group(
    {
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      email: [
        '',
        {
          validators: [Validators.required, Validators.email],
          asyncValidators: [emailExistsValidator()],
          updateOn: 'blur',
        },
      ],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordsMatchValidator },
  );

  /** Valida, registra al usuario y, si queda con sesión, navega al catálogo. */
  public async onSubmit(): Promise<void> {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    const { nombre, email, password } = this.form.getRawValue();
    const { error } = await this.authService.register(email, password, nombre);

    this.submitting.set(false);

    if (error) {
      this.errorMessage.set(error);
      return;
    }

    this.registered.set(true);
    this.form.reset();

    if (this.authService.isAuthenticated()) {
      void this.router.navigateByUrl('/');
    }
  }

  /** Implementación de ComponentCanDeactivate (pendingChangesGuard). */
  public canDeactivate(): boolean {
    if (this.form.dirty && !this.registered()) {
      return window.confirm(
        'Existen cambios sin guardar en el formulario de registro. ¿Desea descartar la información?',
      );
    }
    return true;
  }
}
