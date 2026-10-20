// @vitest-environment jsdom
import '@angular/compiler';

import { FormBuilder } from '@angular/forms';
import type { ToastController } from '@ionic/angular';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Importación actualizada al nuevo nombre de archivo y de clase.
import { RegistroPage } from './registro.page';

describe('RegistroPage', () => {
  let component: RegistroPage;
  let present: ReturnType<typeof vi.fn>;
  let toastController: { create: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    // localStorage en memoria: el entorno de pruebas no siempre lo proporciona.
    const store = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, value),
    });
    // Toast falso: evita depender del DOM de Ionic en las pruebas.
    present = vi.fn();
    toastController = { create: vi.fn().mockResolvedValue({ present }) };
    component = new RegistroPage(new FormBuilder(), toastController as unknown as ToastController);
  });

  // Restaura temporizadores y variables globales simuladas tras cada prueba.
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  // Envía el formulario con temporizadores falsos. El hash se calcula de forma asíncrona antes de
  // la espera simulada de 2 s, así que se avanza el reloj hasta que el envío termina.
  async function submitWithFakeTimers(): Promise<void> {
    vi.useFakeTimers();
    const submission = component.onSubmit();
    await vi.waitFor(() => {
      vi.advanceTimersByTime(2000);
      expect(component.isSubmitting()).toBe(false);
    }, { timeout: 5000 });
    await submission;
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should reject a date before today', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const value = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

    component.registroForm.controls['fecha'].setValue(value);

    expect(component.registroForm.controls['fecha'].hasError('dateInPast')).toBe(true);
  });

  it('should toggle dark mode and the palette class', () => {
    const start = component.isDarkMode();

    component.toggleDarkMode();

    expect(component.isDarkMode()).toBe(!start);
    expect(document.documentElement.classList.contains('ion-palette-dark')).toBe(!start);
  });

  it('should accept today', () => {
    component.registroForm.controls['fecha'].setValue(component.today);

    expect(component.registroForm.controls['fecha'].valid).toBe(true);
  });

  it('should save valid form data to localStorage without the password', async () => {
    // localStorage falso para comprobar la llamada sin tocar el real.
    const storage = { setItem: vi.fn() };
    vi.stubGlobal('localStorage', storage);
    component.registroForm.setValue({
      nombre: 'Ana Pérez',
      email: 'ana@example.com',
      password: 'Password123',
      fecha: component.today
    });

    await submitWithFakeTimers();

    // Se guardan nombre, email y fecha; la contraseña no debe aparecer.
    expect(storage.setItem).toHaveBeenCalledWith(
      'registroForm',
      JSON.stringify({ nombre: 'Ana Pérez', email: 'ana@example.com', fecha: component.today })
    );
    expect(component.registroForm.pristine).toBe(true);
    // Se avisa al usuario con un toast de éxito.
    expect(toastController.create).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Formulario enviado correctamente' })
    );
    expect(present).toHaveBeenCalled();
    // Los datos enviados quedan guardados (sin contraseña) para generar el PDF.
    expect(component.lastSubmission()).toEqual({ nombre: 'Ana Pérez', email: 'ana@example.com', fecha: component.today });
  });

  it('should log a SHA-256 hash instead of the plain password', async () => {
    vi.stubGlobal('localStorage', { getItem: () => null, setItem: vi.fn() });
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    component.registroForm.setValue({
      nombre: 'Ana Pérez',
      email: 'ana@example.com',
      password: 'Password123',
      fecha: component.today
    });

    await submitWithFakeTimers();

    // El payload mostrado lleva un hash de 64 caracteres hexadecimales...
    // El payload se registra como texto JSON (legible también en logcat de Android).
    const payload = JSON.parse(log.mock.calls[0][1]);
    expect(payload.passwordHash).toMatch(/^[0-9a-f]{64}$/);
    // ...y en ningún punto aparece la contraseña original ni la clave "password".
    expect(JSON.stringify(log.mock.calls)).not.toContain('Password123');
    expect(payload).not.toHaveProperty('password');
    log.mockRestore();
  });
});
