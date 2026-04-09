import {
  Component,
  HostListener,
  ElementRef,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ColorThemeService, COLOR_PRESETS, DEFAULT_COLOR } from '../../services/color-theme.service';

@Component({
  selector: 'app-color-theme-picker',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './color-theme-picker.component.html',
  styleUrls: ['./color-theme-picker.component.scss'],
})
export class ColorThemePickerComponent {
  readonly presets = COLOR_PRESETS;
  readonly defaultColor = DEFAULT_COLOR;

  isOpen = signal(false);
  customHex = signal('');
  customError = signal('');

  readonly activeColor = computed(() => this.colorThemeService.primaryColor());
  readonly savedColors = computed(() => this.colorThemeService.savedColors());

  constructor(
    private colorThemeService: ColorThemeService,
    private elRef: ElementRef,
  ) {}

  toggle(): void {
    this.isOpen.update(v => !v);
    if (this.isOpen()) {
      this.customHex.set(this.activeColor());
      this.customError.set('');
    }
  }

  selectPreset(hex: string): void {
    this.colorThemeService.setColor(hex);
    this.customHex.set(hex);
    this.customError.set('');
  }

  applyCustom(): void {
    const raw = this.customHex().trim();
    const hex = raw.startsWith('#') ? raw : `#${raw}`;
    if (this.colorThemeService.isValidHex(hex)) {
      this.colorThemeService.setColor(hex);
      if (!this.isAlreadySaved(hex) && this.savedColors().length < 3) {
        this.colorThemeService.saveCustomColor(hex);
      }
      this.customError.set('');
      this.isOpen.set(false);
    } else {
      this.customError.set('Ungültiger Hex-Code (z.B. #ff6600)');
    }
  }

  saveCustomColor(): void {
    const raw = this.customHex().trim();
    const hex = raw.startsWith('#') ? raw : `#${raw}`;
    if (!this.colorThemeService.isValidHex(hex)) {
      this.customError.set('Ungültiger Hex-Code (z.B. #ff6600)');
      return;
    }
    this.colorThemeService.saveCustomColor(hex);
    this.customError.set('');
  }

  removeSaved(hex: string, event: MouseEvent): void {
    event.stopPropagation();
    if (this.activeColor().toLowerCase() === hex.toLowerCase()) {
      this.colorThemeService.resetToDefault();
      this.customHex.set(DEFAULT_COLOR);
    }
    this.colorThemeService.removeSavedColor(hex);
  }

  isAlreadySaved(hex: string): boolean {
    const normalized = hex.toLowerCase();
    const inPresets = this.presets.some(p => p.hex.toLowerCase() === normalized);
    const inSaved = this.savedColors().some(h => h.toLowerCase() === normalized);
    return inPresets || inSaved;
  }

  canSaveColor(): boolean {
    const raw = this.customHex().trim();
    const hex = raw.startsWith('#') ? raw : `#${raw}`;
    if (!this.colorThemeService.isValidHex(hex)) return false;
    return !this.isAlreadySaved(hex) && this.savedColors().length < 3;
  }

  onCustomInput(value: string): void {
    this.customHex.set(value);
    this.customError.set('');
  }

  reset(): void {
    this.colorThemeService.resetToDefault();
    this.customHex.set(DEFAULT_COLOR);
    this.customError.set('');
  }

  isActive(hex: string): boolean {
    return this.activeColor().toLowerCase() === hex.toLowerCase();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.isOpen.set(false);
  }
}
