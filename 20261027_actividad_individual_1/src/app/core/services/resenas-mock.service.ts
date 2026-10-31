import { Injectable } from '@angular/core';
import { Observable, Subject, defer, delay, map, merge, of, startWith, timer } from 'rxjs';
import { Resena } from '../models/database.models';

/** Nombres ficticios usados al generar reseñas. */
const AUTORES = ['Lucía M.', 'Carlos R.', 'Elena P.', 'Miguel A.', 'Sofía G.', 'Andrés T.'];
/** Comentarios de ejemplo para las reseñas simuladas. */
const COMENTARIOS = [
  'Muy recomendable, no pude dejarlo.',
  'Buena historia, aunque el final es flojo.',
  'Un clásico imprescindible.',
  'Entretenido y bien escrito.',
  'No cumplió mis expectativas.',
  'Lo compraría de nuevo sin dudarlo.',
];

/**
 * Fuente de datos NoSQL simulada (estilo Firestore) para reseñas de libros.
 * Almacena documentos en memoria y los expone como Observables de RxJS con
 * latencia artificial; `stream()` simula un listener en tiempo real (`onSnapshot`).
 */
@Injectable({ providedIn: 'root' })
export class ResenasMockService {
  /** Colección en memoria (equivale a una colección de documentos). */
  private readonly store: Resena[] = [];
  /** Notifica cada reseña nueva a los suscriptores de `stream()`. */
  private readonly added$ = new Subject<Resena>();
  /** Contador para generar identificadores. */
  private seq = 0;

  /** Consulta puntual con latencia simulada (equivalente a `getDocs`). */
  public list(): Observable<Resena[]> {
    return defer(() => of([...this.store].reverse())).pipe(delay(400));
  }

  /** Flujo en tiempo real: emite la lista completa en cada cambio (equivalente a `onSnapshot`). */
  public stream(): Observable<Resena[]> {
    return merge(this.added$).pipe(
      startWith(null),
      map(() => [...this.store].reverse()),
    );
  }

  /** Inserta una reseña, la notifica en tiempo real y la devuelve. */
  public add(libroId: string, libroTitulo: string, puntuacion: number, comentario: string): Resena {
    const resena: Resena = {
      id: `r${++this.seq}`,
      libroId,
      libroTitulo,
      autor: AUTORES[this.seq % AUTORES.length],
      puntuacion,
      comentario,
      fecha: new Date().toISOString(),
    };
    this.store.push(resena);
    this.added$.next(resena);
    return resena;
  }

  /** Genera reseñas aleatorias periódicas sobre los libros dados (simula actividad de usuarios). */
  public simulateActivity(
    libros: { id: string; titulo: string }[],
    everyMs = 6000,
  ): Observable<Resena> {
    return timer(0, everyMs).pipe(
      map(() => {
        const l = libros[Math.floor(Math.random() * libros.length)];
        const c = COMENTARIOS[Math.floor(Math.random() * COMENTARIOS.length)];
        return this.add(l.id, l.titulo, 1 + Math.floor(Math.random() * 5), c);
      }),
    );
  }
}
