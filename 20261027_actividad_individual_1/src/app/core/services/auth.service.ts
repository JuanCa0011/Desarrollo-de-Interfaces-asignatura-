import { Injectable, computed, inject, signal } from '@angular/core';
import type { Session } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';
import { Profile, UserRole } from '../models/database.models';

/**
 * Centraliza el estado de autenticación de la app usando Signals (ver Dossier_Guards).
 *
 * - `session` refleja la sesión de Supabase Auth (null si no hay usuario logueado).
 * - `profile` es la fila de la tabla `profiles` asociada (incluye el rol).
 * - `ready` indica si ya se completó la restauración inicial de sesión; los guards
 *   deben esperar a `whenReady()` antes de decidir, para no expulsar al usuario en un
 *   refresco de página mientras Supabase todavía está restaurando el token guardado.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  /** Cliente de Supabase compartido. */
  private readonly supabase = inject(SupabaseService).client;

  /** Sesión de Supabase Auth (null si no hay usuario). */
  private readonly _session = signal<Session | null>(null);
  /** Fila de `profiles` del usuario actual. */
  private readonly _profile = signal<Profile | null>(null);
  /** Indica que ya se restauró la sesión inicial. */
  private readonly _ready = signal(false);

  /** Sesión actual, solo lectura. */
  public readonly session = this._session.asReadonly();
  /** Perfil actual (incluye el rol), solo lectura. */
  public readonly profile = this._profile.asReadonly();
  /** Señal `true` cuando la restauración inicial de sesión terminó. */
  public readonly ready = this._ready.asReadonly();

  /** `true` si hay sesión activa. */
  public readonly isAuthenticated = computed(() => this._session() !== null);
  /** Rol del usuario actual o `null`. */
  public readonly role = computed<UserRole | null>(() => this._profile()?.role ?? null);
  /** `true` si el usuario es administrador. */
  public readonly isAdmin = computed(() => this.role() === 'admin');

  /** Resuelve `readyPromise` al terminar `initialize()`. */
  private resolveReady!: () => void;
  /** Promesa que esperan los guards antes de decidir. */
  private readonly readyPromise = new Promise<void>((resolve) => {
    this.resolveReady = resolve;
  });

  /** Arranca la restauración de sesión. */
  constructor() {
    void this.initialize();
  }

  /** Espera a que se complete la restauración inicial de sesión (usado por los guards). */
  public whenReady(): Promise<void> {
    return this._ready() ? Promise.resolve() : this.readyPromise;
  }

  /** Inicia sesión con email y contraseña; devuelve el mensaje de error de Supabase o `null`. */
  public async login(email: string, password: string): Promise<{ error: string | null }> {
    const { error } = await this.supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }

  /** Crea una cuenta nueva (el nombre viaja en los metadatos) y devuelve el error o `null`. */
  public async register(
    email: string,
    password: string,
    nombre: string,
  ): Promise<{ error: string | null }> {
    const { error } = await this.supabase.auth.signUp({
      email,
      password,
      options: { data: { nombre } },
    });
    return { error: error?.message ?? null };
  }

  /** Cierra la sesión actual. */
  public async logout(): Promise<void> {
    await this.supabase.auth.signOut();
  }

  /** Validación asíncrona (Paso 1.2): comprueba contra Supabase si el email ya está en uso. */
  public async emailExists(email: string): Promise<boolean> {
    const { data, error } = await this.supabase.rpc('email_exists', { p_email: email });
    if (error) {
      // Si el servicio falla, no bloqueamos el formulario: se validará igualmente en el submit.
      return false;
    }
    return Boolean(data);
  }

  /** Restaura la sesión guardada y se suscribe a los cambios de autenticación. */
  private async initialize(): Promise<void> {
    const { data } = await this.supabase.auth.getSession();
    await this.applySession(data.session);
    this._ready.set(true);
    this.resolveReady();

    this.supabase.auth.onAuthStateChange((_event, session) => {
      void this.applySession(session);
    });
  }

  /** Actualiza la sesión y carga o limpia el perfil asociado. */
  private async applySession(session: Session | null): Promise<void> {
    this._session.set(session);
    if (!session) {
      this._profile.set(null);
      return;
    }
    await this.loadProfile(session.user.id);
  }

  /** Lee la fila de `profiles` del usuario indicado. */
  private async loadProfile(userId: string): Promise<void> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    this._profile.set(error ? null : (data as Profile));
  }
}
