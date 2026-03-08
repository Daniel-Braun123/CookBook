import { Injectable } from '@angular/core';
import { AvatarConfig, DEFAULT_AVATAR_CONFIG } from '../models/avatar-config';

@Injectable({
  providedIn: 'root'
})
export class AvatarService {

  /**
   * Generate SVG string from avatar configuration
   */
  generateSVG(config: AvatarConfig, size: number = 200): string {
    const bgColor = this.getBackgroundColor(config.backgroundColor);
    const skinColor = this.getSkinColor(config.skinTone);
    const hairColorValue = this.getHairColor(config.hairColor);

    return `
      <svg width="${size}" height="${size}" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <!-- Background -->
        <rect width="200" height="200" fill="${bgColor}" rx="100"/>
        
        <!-- Head (circle) -->
        <circle cx="100" cy="100" r="60" fill="${skinColor}"/>
        
        <!-- Hair -->
        ${this.generateHair(config.hairStyle, hairColorValue)}
        
        <!-- Eyes -->
        ${this.generateEyes(config.eyeStyle)}
        
        <!-- Mouth -->
        ${this.generateMouth(config.mouthStyle)}
        
        <!-- Accessory -->
        ${this.generateAccessory(config.accessory)}
      </svg>
    `.trim();
  }

  /**
   * Parse JSON string to AvatarConfig
   */
  parseConfig(jsonString: string | null): AvatarConfig {
    if (!jsonString) {
      return DEFAULT_AVATAR_CONFIG;
    }
    try {
      const parsed = JSON.parse(jsonString);
      return { ...DEFAULT_AVATAR_CONFIG, ...parsed };
    } catch {
      return DEFAULT_AVATAR_CONFIG;
    }
  }

  /**
   * Stringify AvatarConfig to JSON
   */
  stringifyConfig(config: AvatarConfig): string {
    return JSON.stringify(config);
  }

  /**
   * Get default avatar config
   */
  getDefaultConfig(): AvatarConfig {
    return { ...DEFAULT_AVATAR_CONFIG };
  }

  // ==============================
  // Private Helper Methods
  // ==============================

  private getBackgroundColor(color: string): string {
    const colors: Record<string, string> = {
      blue: '#3B82F6',
      green: '#10B981',
      purple: '#8B5CF6',
      orange: '#F59E0B',
      pink: '#EC4899',
      yellow: '#EAB308',
      red: '#EF4444',
      teal: '#14B8A6'
    };
    return colors[color] || colors['blue'];
  }

  private getSkinColor(tone: string): string {
    const colors: Record<string, string> = {
      pale: '#FFE5D9',
      light: '#FFD5C2',
      medium: '#E8B999',
      tan: '#C68642',
      dark: '#8D5524'
    };
    return colors[tone] || colors['light'];
  }

  private getHairColor(color: string): string {
    const colors: Record<string, string> = {
      black: '#1F2937',
      brown: '#92400E',
      auburn: '#A0522D',
      blonde: '#FCD34D',
      red: '#DC2626',
      gray: '#9CA3AF',
      blue: '#3B82F6',
      pink: '#EC4899'
    };
    return colors[color] || colors['brown'];
  }

  private generateHair(style: string, color: string): string {
    switch (style) {
      case 'short':
        // Einfacher kurzer Schnitt - sauber und symmetrisch
        return `
          <ellipse cx="100" cy="55" rx="50" ry="30" fill="${color}"/>
          <path d="M 50 60 Q 50 45 100 40 Q 150 45 150 60" fill="${color}"/>
        `;
      
      case 'long':
        // Längere Haare - fällt an den Seiten herunter
        return `
          <ellipse cx="100" cy="55" rx="50" ry="32" fill="${color}"/>
          <path d="M 50 60 Q 50 45 100 40 Q 150 45 150 60" fill="${color}"/>
          <ellipse cx="45" cy="90" rx="12" ry="30" fill="${color}"/>
          <ellipse cx="155" cy="90" rx="12" ry="30" fill="${color}"/>
        `;
      
      case 'bob':
        // Bob-Schnitt - etwas länger an den Seiten
        return `
          <ellipse cx="100" cy="55" rx="50" ry="30" fill="${color}"/>
          <path d="M 50 60 Q 50 45 100 40 Q 150 45 150 60" fill="${color}"/>
          <ellipse cx="48" cy="85" rx="10" ry="22" fill="${color}"/>
          <ellipse cx="152" cy="85" rx="10" ry="22" fill="${color}"/>
        `;
      
      case 'curly':
        // Lockige Haare - kreisförmige Locken
        return `
          <circle cx="60" cy="52" r="16" fill="${color}"/>
          <circle cx="80" cy="42" r="17" fill="${color}"/>
          <circle cx="100" cy="38" r="18" fill="${color}"/>
          <circle cx="120" cy="42" r="17" fill="${color}"/>
          <circle cx="140" cy="52" r="16" fill="${color}"/>
          <circle cx="48" cy="68" r="14" fill="${color}"/>
          <circle cx="152" cy="68" r="14" fill="${color}"/>
          <circle cx="70" cy="60" r="12" fill="${color}"/>
          <circle cx="130" cy="60" r="12" fill="${color}"/>
        `;
      
      case 'wavy':
        // Wellige Haare - sanfte Wellen
        return `
          <ellipse cx="100" cy="55" rx="50" ry="30" fill="${color}"/>
          <path d="M 50 60 Q 50 45 100 40 Q 150 45 150 60" fill="${color}"/>
          <path d="M 52 65 Q 48 75 52 85" stroke="${color}" stroke-width="5" fill="none" stroke-linecap="round"/>
          <path d="M 148 65 Q 152 75 148 85" stroke="${color}" stroke-width="5" fill="none" stroke-linecap="round"/>
        `;
      
      case 'bun':
        // Dutt/Hochsteckfrisur - Haare zusammengebunden
        return `
          <circle cx="100" cy="30" r="16" fill="${color}"/>
          <ellipse cx="100" cy="26" rx="14" ry="8" fill="${color}" opacity="0.6"/>
          <ellipse cx="100" cy="55" rx="48" ry="25" fill="${color}"/>
          <path d="M 52 60 Q 52 48 100 42 Q 148 48 148 60" fill="${color}"/>
        `;
      
      case 'bald':
        return '';  // Keine Haare
      
      default:
        return this.generateHair('short', color);
    }
  }

  private generateEyes(style: string): string {
    switch (style) {
      case 'normal':
        return `
          <ellipse cx="80" cy="90" rx="8" ry="12" fill="#1F2937"/>
          <ellipse cx="120" cy="90" rx="8" ry="12" fill="#1F2937"/>
          <ellipse cx="82" cy="88" rx="3" ry="4" fill="#FFFFFF"/>
          <ellipse cx="122" cy="88" rx="3" ry="4" fill="#FFFFFF"/>
        `;
      case 'happy':
        return `
          <path d="M 72 85 Q 80 92 88 85" stroke="#1F2937" stroke-width="3" fill="none" stroke-linecap="round"/>
          <path d="M 112 85 Q 120 92 128 85" stroke="#1F2937" stroke-width="3" fill="none" stroke-linecap="round"/>
        `;
      case 'wink':
        return `
          <ellipse cx="80" cy="90" rx="8" ry="12" fill="#1F2937"/>
          <ellipse cx="82" cy="88" rx="3" ry="4" fill="#FFFFFF"/>
          <path d="M 112 90 Q 120 88 128 90" stroke="#1F2937" stroke-width="3" fill="none" stroke-linecap="round"/>
        `;
      case 'closed':
        return `
          <path d="M 72 90 Q 80 85 88 90" stroke="#1F2937" stroke-width="3" fill="none" stroke-linecap="round"/>
          <path d="M 112 90 Q 120 85 128 90" stroke="#1F2937" stroke-width="3" fill="none" stroke-linecap="round"/>
        `;
      case 'surprised':
        return `
          <circle cx="80" cy="90" r="10" fill="#1F2937"/>
          <circle cx="120" cy="90" r="10" fill="#1F2937"/>
          <circle cx="82" cy="88" r="4" fill="#FFFFFF"/>
          <circle cx="122" cy="88" r="4" fill="#FFFFFF"/>
        `;
      default:
        return this.generateEyes('normal');
    }
  }

  private generateMouth(style: string): string {
    switch (style) {
      case 'smile':
        return `
          <path d="M 75 115 Q 100 130 125 115" stroke="#1F2937" stroke-width="3" fill="none" stroke-linecap="round"/>
        `;
      case 'neutral':
        return `
          <line x1="80" y1="120" x2="120" y2="120" stroke="#1F2937" stroke-width="3" stroke-linecap="round"/>
        `;
      case 'smirk':
        return `
          <path d="M 75 118 Q 90 120 100 118 Q 110 116 120 115" stroke="#1F2937" stroke-width="3" fill="none" stroke-linecap="round"/>
        `;
      case 'surprised':
        return `
          <ellipse cx="100" cy="120" rx="12" ry="15" fill="#1F2937"/>
          <ellipse cx="100" cy="118" rx="8" ry="10" fill="#FFFFFF"/>
        `;
      default:
        return this.generateMouth('smile');
    }
  }

  private generateAccessory(accessory: string): string {
    switch (accessory) {
      case 'roundGlasses':
        // Runde Brille wie Harry Potter
        return `
          <circle cx="77" cy="92" r="13" fill="none" stroke="#1F2937" stroke-width="2.5"/>
          <circle cx="123" cy="92" r="13" fill="none" stroke="#1F2937" stroke-width="2.5"/>
          <line x1="90" y1="92" x2="110" y2="92" stroke="#1F2937" stroke-width="2.5"/>
          <path d="M 64 92 L 58 90 L 55 88" stroke="#1F2937" stroke-width="2" fill="none"/>
          <path d="M 136 92 L 142 90 L 145 88" stroke="#1F2937" stroke-width="2" fill="none"/>
          <ellipse cx="72" cy="88" rx="3" ry="4" fill="#FFFFFF" opacity="0.5"/>
          <ellipse cx="118" cy="88" rx="3" ry="4" fill="#FFFFFF" opacity="0.5"/>
        `;
      
      case 'glasses':
        // Eckige stylische Brille
        return `
          <rect x="64" y="82" width="26" height="20" rx="3" fill="none" stroke="#1F2937" stroke-width="2.5"/>
          <rect x="110" y="82" width="26" height="20" rx="3" fill="none" stroke="#1F2937" stroke-width="2.5"/>
          <line x1="90" y1="92" x2="110" y2="92" stroke="#1F2937" stroke-width="2.5"/>
          <path d="M 64 92 L 58 90" stroke="#1F2937" stroke-width="2" fill="none"/>
          <path d="M 136 92 L 142 90" stroke="#1F2937" stroke-width="2" fill="none"/>
          <rect x="68" y="85" width="8" height="6" fill="#FFFFFF" opacity="0.4"/>
          <rect x="114" y="85" width="8" height="6" fill="#FFFFFF" opacity="0.4"/>
        `;
      
      case 'sunglasses':
        // Coole Sonnenbrille
        return `
          <path d="M 64 85 L 90 85 L 90 100 Q 85 102 77 102 Q 69 102 64 100 Z" fill="#1F2937" opacity="0.85"/>
          <path d="M 110 85 L 136 85 L 136 100 Q 131 102 123 102 Q 115 102 110 100 Z" fill="#1F2937" opacity="0.85"/>
          <line x1="90" y1="92" x2="110" y2="92" stroke="#1F2937" stroke-width="3"/>
          <path d="M 64 92 L 58 88" stroke="#1F2937" stroke-width="2.5" fill="none"/>
          <path d="M 136 92 L 142 88" stroke="#1F2937" stroke-width="2.5" fill="none"/>
          <ellipse cx="72" cy="90" rx="5" ry="6" fill="#FFFFFF" opacity="0.25"/>
          <ellipse cx="128" cy="90" rx="5" ry="6" fill="#FFFFFF" opacity="0.25"/>
        `;
      
      case 'beanie':
        // Warme Mütze/Beanie
        return `
          <ellipse cx="100" cy="48" rx="52" ry="18" fill="#DC2626"/>
          <path d="M 48 48 Q 48 35 65 30 Q 82 26 100 26 Q 118 26 135 30 Q 152 35 152 48" fill="#DC2626"/>
          <rect x="45" y="44" width="110" height="8" fill="#991B1B"/>
          <circle cx="100" cy="24" r="6" fill="#DC2626"/>
          <circle cx="100" cy="22" r="4" fill="#991B1B"/>
        `;
      
      case 'headband':
        // Stirnband
        return `
          <path d="M 45 65 Q 50 55 70 52 Q 85 50 100 50 Q 115 50 130 52 Q 150 55 155 65" stroke="#EC4899" stroke-width="8" fill="none" stroke-linecap="round"/>
          <path d="M 48 65 Q 52 58 68 55" stroke="#FFFFFF" stroke-width="2" fill="none" opacity="0.5"/>
          <circle cx="100" cy="52" r="6" fill="#EC4899"/>
          <circle cx="100" cy="50" r="4" fill="#FFFFFF" opacity="0.6"/>
        `;
      
      case 'none':
      default:
        return '';
    }
  }
}
