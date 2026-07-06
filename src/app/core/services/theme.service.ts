import { Injectable, signal, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Theme } from '../models/conversion.models';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'theme';
  private platformId = inject(PLATFORM_ID);
  
  private _theme = signal<Theme>('light');
  
  theme = this._theme.asReadonly();
  
  constructor() {
    this.loadTheme();
    effect(() => {
      this.applyTheme(this._theme());
    });
  }
  
  private loadTheme(): void {
    if (isPlatformBrowser(this.platformId)) {
      const savedTheme = localStorage.getItem(this.THEME_KEY) as Theme | null;
      if (savedTheme === 'light' || savedTheme === 'dark') {
        this._theme.set(savedTheme);
      } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        this._theme.set('dark');
      }
    }
  }
  
  toggleTheme(): void {
    const newTheme = this._theme() === 'light' ? 'dark' : 'light';
    this._theme.set(newTheme);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.THEME_KEY, newTheme);
    }
  }
  
  setTheme(theme: Theme): void {
    this._theme.set(theme);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.THEME_KEY, theme);
    }
  }
  
  private applyTheme(theme: Theme): void {
    if (isPlatformBrowser(this.platformId)) {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }
}
