import { Component } from '@angular/core';
import { IonApp, IonFab, IonFabButton, IonIcon, IonRouterOutlet } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { moon, sunny } from 'ionicons/icons';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrl: './app.component.scss',
  imports: [IonApp, IonFab, IonFabButton, IonIcon, IonRouterOutlet],
})
export class AppComponent {
  isDarkMode = false;

  constructor() {
    addIcons({ moon, sunny });

    const savedTheme = localStorage.getItem('app-theme');
    this.isDarkMode =
      savedTheme === null
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
        : savedTheme === 'dark';

    this.applyTheme();
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('app-theme', this.isDarkMode ? 'dark' : 'light');
    this.applyTheme();
  }

  private applyTheme(): void {
    document.documentElement.classList.toggle('ion-palette-dark', this.isDarkMode);
  }
}
