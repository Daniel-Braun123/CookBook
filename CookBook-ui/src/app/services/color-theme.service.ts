import { Injectable, signal } from '@angular/core';

export interface ColorPreset {
  name: string;
  hex: string;
}

export const COLOR_PRESETS: ColorPreset[] = [
  { name: 'Terracotta', hex: '#c1563a' },
  { name: 'Ocean', hex: '#2563eb' },
  { name: 'Forest', hex: '#16a34a' },
  { name: 'Violet', hex: '#7c3aed' },
  { name: 'Rose', hex: '#e11d48' },
  { name: 'Amber', hex: '#d97706' },
  { name: 'Teal', hex: '#0d9488' },
  { name: 'Slate', hex: '#475569' },
];

export const DEFAULT_COLOR = '#c1563a';
const STORAGE_KEY = 'cookbook-primary-color';
const CUSTOM_COLORS_KEY = 'cookbook-custom-colors';

@Injectable({ providedIn: 'root' })
export class ColorThemeService {
  readonly presets = COLOR_PRESETS;
  readonly primaryColor = signal<string>(DEFAULT_COLOR);
  readonly savedColors = signal<string[]>([]);

  initialize(): void {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && this.isValidHex(saved)) {
      this.applyColor(saved);
    } else {
      this.applyColor(DEFAULT_COLOR);
    }
    const savedCustom = localStorage.getItem(CUSTOM_COLORS_KEY);
    if (savedCustom) {
      try {
        const parsed = JSON.parse(savedCustom);
        if (Array.isArray(parsed)) {
          this.savedColors.set(parsed.filter((h: string) => this.isValidHex(h)));
        }
      } catch { /* ignore */ }
    }
  }

  saveCustomColor(hex: string): void {
    const normalized = hex.startsWith('#') ? hex : `#${hex}`;
    if (!this.isValidHex(normalized)) return;
    const current = this.savedColors();
    if (current.some(h => h.toLowerCase() === normalized.toLowerCase())) return;
    const updated = [normalized, ...current].slice(0, 3);
    this.savedColors.set(updated);
    localStorage.setItem(CUSTOM_COLORS_KEY, JSON.stringify(updated));
  }

  removeSavedColor(hex: string): void {
    const updated = this.savedColors().filter(h => h.toLowerCase() !== hex.toLowerCase());
    this.savedColors.set(updated);
    localStorage.setItem(CUSTOM_COLORS_KEY, JSON.stringify(updated));
  }

  setColor(hex: string): void {
    const normalized = hex.startsWith('#') ? hex : `#${hex}`;
    if (!this.isValidHex(normalized)) return;
    localStorage.setItem(STORAGE_KEY, normalized);
    this.applyColor(normalized);
  }

  resetToDefault(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.applyColor(DEFAULT_COLOR);
  }

  isValidHex(hex: string): boolean {
    return /^#[0-9A-Fa-f]{6}$/.test(hex);
  }

  private applyColor(hex: string): void {
    this.primaryColor.set(hex);
    const { h, s, l } = this.hexToHsl(hex);
    const root = document.documentElement;
    root.style.setProperty('--primary', `${h} ${s}% ${l}%`);
    root.style.setProperty('--ring', `${h} ${s}% ${l}%`);
    // Use light foreground for dark colors, dark foreground for light colors
    root.style.setProperty('--primary-foreground', l > 55 ? '16 44% 8%' : '40 50% 97%');
    // Terracotta-light / dark variants for gradient / hover usage
    root.style.setProperty('--cookbook-terracotta', `${h} ${s}% ${l}%`);
    root.style.setProperty('--cookbook-terracotta-light', `${h} ${Math.min(s + 3, 100)}% ${Math.min(l + 14, 95)}%`);
    root.style.setProperty('--cookbook-terracotta-dark', `${h} ${s}% ${Math.max(l - 10, 5)}%`);
  }

  private hexToHsl(hex: string): { h: number; s: number; l: number } {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  }
}
