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
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonText,
  IonSpinner,
} from '@ionic/angular';
import { AuthService } from '../../../core/services/auth.service';
import { ComponentCanDeactivate } from '../../../core/guards/pending-changes.guard';
import { emailExistsValidator } from '../../../core/validators/email-exists.validator';

function passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirmPassword = group.get('confirmPassword')?.value;
  return password === confirmPassword ? null : { passwordsMismatch: true };
}

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  imports: [
    ReactiveFormsModule,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonText,
    IonSpinner,
  ],
})
export class RegisterPage implements ComponentCanDeactivate {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  public readonly submitting = signal(false);
  public readonly errorMessage = signal<string | null>(null);
  public readonly registered = signal(false);

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
