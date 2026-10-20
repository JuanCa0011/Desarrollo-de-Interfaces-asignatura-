import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonSpinner, IonList, IonButton, IonItem, IonInput, IonButtons, IonIcon, ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { moon, sunny } from 'ionicons/icons';
// jsPDF es una librería que crea archivos PDF directamente en el navegador, sin servidor.
import { jsPDF } from 'jspdf';

// Datos del último envío (sin contraseña) que se pueden descargar.
interface Envio { nombre: string; email: string; fecha: string; }

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, CommonModule, ReactiveFormsModule, IonList, IonButton, IonSpinner, IonItem, IonInput, IonButtons, IonIcon],
})
export class HomePage {
 // Definición del formulario reactivo fuertemente tipado 
  public registroForm: FormGroup; 
   
  // Uso de Signals (visto en sesiones anteriores) para gestionar el estado de envío 
  public isSubmitting = signal<boolean>(false); 
 
  // Signal con el modo oscuro; la vista cambia el icono según su valor.
  public isDarkMode = signal<boolean>(false);

  // Último formulario enviado: el botón de PDF solo aparece cuando hay datos.
  // Signal<Envio | null>: null significa "todavía no se ha enviado nada".
  // Al ser un Signal, la plantilla se actualiza sola cuando cambia su valor.
  public lastSubmission = signal<Envio | null>(null);

  // ToastController (Ionic) permite crear notificaciones emergentes desde el código.
  // eslint-disable-next-line @angular-eslint/prefer-inject
  constructor(private fb: FormBuilder, private toastController: ToastController) {
    this.registroForm = this.fb.group({ 
      nombre: ['', [Validators.required, Validators.minLength(3)]], 
      email: ['', [Validators.required, Validators.email]], 
      password: ['', [Validators.required, 
Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)]],
      // "fecha" empieza vacía, es obligatoria y además debe pasar nuestra validación.
      fecha: ['', [Validators.required, this.noPastDate]]
      // Patrón: Mínimo 8 caracteres, al menos una letra y un número. 
    }); 

    // Registra los iconos usados en la plantilla (Ionic los carga bajo demanda).
    addIcons({ moon, sunny });

    // Preferencia guardada; si no existe, se usa la del sistema operativo.
    const saved = localStorage.getItem('darkMode');
    const prefersDark = saved !== null
      ? saved === 'true'
      : (window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false);
    this.applyDarkMode(prefersDark);
  } 

  /** Alterna entre modo claro y oscuro y recuerda la elección. */
  public toggleDarkMode(): void {
    const enabled = !this.isDarkMode();
    this.applyDarkMode(enabled);
    localStorage.setItem('darkMode', String(enabled));
  }

  private applyDarkMode(enabled: boolean): void {
    this.isDarkMode.set(enabled);
    // La paleta "dark.class" de Ionic se activa con esta clase en <html>.
    document.documentElement.classList.toggle('ion-palette-dark', enabled);
  }

  /**
   * Devuelve la fecha local de hoy en el formato YYYY-MM-DD que espera
   * un input type="date".
   */
  public get today(): string {
    const date = new Date();
    // Se añade un cero delante cuando el mes o el día tienen un solo dígito.
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
  }

  /**
   * Validador personalizado de Angular: devuelve un error si la fecha
   * es anterior a hoy y null cuando el valor es válido.
   */
  private readonly noPastDate = (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    // En formato YYYY-MM-DD, comparar cadenas equivale a comparar fechas.
    return typeof value === 'string' && value < this.today ? { dateInPast: true } : null;
  };
 
  /** Genera un PDF con los datos del último envío y lo descarga. */
  public downloadPdf(): void {
    const data = this.lastSubmission();
    // Si aún no hay envío no hay nada que descargar.
    if (!data) { return; }

    const doc = new jsPDF();
    // Título: tamaño de letra mayor y posición (x=20, y=25).
    doc.setFontSize(18);
    doc.text('Datos del formulario', 20, 25);
    doc.setFontSize(12);
    // Cada línea del PDF se posiciona con coordenadas (x, y) en milímetros.
    doc.text(`Nombre: ${data.nombre}`, 20, 45);
    doc.text(`Correo electrónico: ${data.email}`, 20, 55);
    doc.text(`Fecha: ${data.fecha}`, 20, 65);
    // save() inicia la descarga del archivo en el navegador.
    doc.save('formulario.pdf');
  }

  // Getter de conveniencia para acceder a los controles en la vista 
  get f() { return this.registroForm.controls; } //EXPLICAR PDF 
 
  public async onSubmit(): Promise<void> { 
    if (this.registroForm.invalid) { 
      this.registroForm.markAllAsTouched(); // Fuerza la visualización de errores 
      return; 
    } 
 
    this.isSubmitting.set(true); 

    try { 
      // Se extraen solo los campos que queremos guardar (desestructuración).
      const { nombre, email, fecha } = this.registroForm.getRawValue();
      // No se guarda la contraseña: localStorage no es seguro para credenciales.
      const formData = { nombre, email, fecha };
      console.log('Datos del formulario:', formData); 
       
      // Simulación de llamada asíncrona a un backend HTTP 
      await new Promise(resolve => setTimeout(resolve, 2000)); 
       
      // localStorage solo almacena texto: JSON.stringify convierte el objeto en string.
      // Para recuperarlo: JSON.parse(localStorage.getItem('registroForm') ?? '{}').
      localStorage.setItem('registroForm', JSON.stringify(formData));
      // Se conservan los datos antes del reset para poder descargarlos después.
      this.lastSubmission.set(formData);
       
      this.registroForm.reset(); 

      // Notificación de éxito: se crea y se muestra 3 segundos en la parte superior.
      const toast = await this.toastController.create({
        message: 'Formulario enviado correctamente',
        duration: 3000,
        position: 'top',
        color: 'success'
      });
      await toast.present();
    } catch (error) { 
      console.error('Error al persistir los datos', error); 
    } finally { 
      this.isSubmitting.set(false); 
    } 
  } 
} 