import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  it('should create the app', async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([])]
    }).compileComponents();
    
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should toggle and persist the selected theme', async () => {
    localStorage.setItem('app-theme', 'light');
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    app.toggleTheme();
    expect(app.isDarkMode).toBe(true);
    expect(localStorage.getItem('app-theme')).toBe('dark');
    expect(document.documentElement.classList.contains('ion-palette-dark')).toBe(true);

    app.toggleTheme();
    expect(app.isDarkMode).toBe(false);
    expect(localStorage.getItem('app-theme')).toBe('light');
    expect(document.documentElement.classList.contains('ion-palette-dark')).toBe(false);

    fixture.destroy();
    localStorage.removeItem('app-theme');
  });
});
