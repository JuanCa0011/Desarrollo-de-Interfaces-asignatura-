import { inject } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

/**
 * Validador asíncrono reactivo (Paso 1.2): comprueba contra Supabase si el email
 * introducido ya está registrado. Se evalúa con `updateOn: 'blur'` en el FormControl
 * para no disparar una petición de red en cada pulsación de tecla.
 *
 * Debe instanciarse dentro de un contexto de inyección (p. ej. un inicializador de
 * propiedad de un componente standalone), ya que usa `inject()` internamente.
 */
export function emailExistsValidator(): AsyncValidatorFn {
  const authService = inject(AuthService);

  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const email = (control.value ?? '').trim();
    if (!email) {
      return from([null]);
    }

    return from(authService.emailExists(email)).pipe(
      map((exists) => (exists ? { emailExists: true } : null)),
    );
  };
}
