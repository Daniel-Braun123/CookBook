import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'cookbook-theme';
  private readonly DARK_CLASS = 'dark';
  
  private renderer: Renderer2;
  private currentThemeSubject: BehaviorSubject<Theme>;
  public currentTheme$: Observable<Theme>;

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
    
    // Initialize theme from localStorage or default to light
    const savedTheme = this.getThemeFromStorage();
    this.currentThemeSubject = new BehaviorSubject<Theme>(savedTheme);
    this.currentTheme$ = this.currentThemeSubject.asObservable();
  }

  /**
   * Initialize theme by applying the current theme class to document
   * Should be called once during app initialization
   */
  initializeTheme(): void {
    const theme = this.currentThemeSubject.value;
    this.applyTheme(theme);
  }

  /**
   * Get current theme value
   */
  getCurrentTheme(): Theme {
    return this.currentThemeSubject.value;
  }

  /**
   * Check if dark mode is active
   */
  isDarkMode(): boolean {
    return this.currentThemeSubject.value === 'dark';
  }

  /**
   * Toggle between light and dark mode
   */
  toggleTheme(): void {
    const newTheme: Theme = this.isDarkMode() ? 'light' : 'dark';
    this.setTheme(newTheme);
  }

  /**
   * Set a specific theme
   */
  setTheme(theme: Theme): void {
    this.applyTheme(theme);
    this.saveThemeToStorage(theme);
    this.currentThemeSubject.next(theme);
  }

  /**
   * Apply theme by adding/removing dark class on document element
   */
  private applyTheme(theme: Theme): void {
    const html = document.documentElement;
    
    if (theme === 'dark') {
      this.renderer.addClass(html, this.DARK_CLASS);
    } else {
      this.renderer.removeClass(html, this.DARK_CLASS);
    }
  }

  /**
   * Get theme from localStorage
   */
  private getThemeFromStorage(): Theme {
    try {
      const savedTheme = localStorage.getItem(this.THEME_KEY);
      return (savedTheme === 'dark' || savedTheme === 'light') ? savedTheme : 'light';
    } catch (error) {
      console.warn('Failed to load theme from localStorage:', error);
      return 'light';
    }
  }

  /**
   * Save theme to localStorage
   */
  private saveThemeToStorage(theme: Theme): void {
    try {
      localStorage.setItem(this.THEME_KEY, theme);
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error);
    }
  }
}
