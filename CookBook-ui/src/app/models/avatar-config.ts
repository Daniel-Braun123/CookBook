export interface AvatarConfig {
  backgroundColor: BackgroundColor;
  skinTone: SkinTone;
  hairStyle: HairStyle;
  hairColor: HairColor;
  eyeStyle: EyeStyle;
  mouthStyle: MouthStyle;
  accessory: Accessory;
}

export type BackgroundColor = 'blue' | 'green' | 'purple' | 'orange' | 'pink' | 'yellow' | 'red' | 'teal';
export type SkinTone = 'light' | 'medium' | 'tan' | 'dark' | 'pale';
export type HairStyle = 'short' | 'long' | 'curly' | 'bald' | 'wavy' | 'bob' | 'bun';
export type HairColor = 'black' | 'brown' | 'blonde' | 'red' | 'gray' | 'blue' | 'pink' | 'auburn';
export type EyeStyle = 'normal' | 'happy' | 'wink' | 'closed' | 'surprised';
export type MouthStyle = 'smile' | 'neutral' | 'surprised' | 'smirk';
export type Accessory = 'none' | 'glasses' | 'sunglasses' | 'roundGlasses' | 'beanie' | 'headband';

export const AVATAR_OPTIONS = {
  backgroundColors: [
    { value: 'blue' as BackgroundColor, label: 'Blau', color: '#3B82F6' },
    { value: 'green' as BackgroundColor, label: 'Grün', color: '#10B981' },
    { value: 'purple' as BackgroundColor, label: 'Lila', color: '#8B5CF6' },
    { value: 'orange' as BackgroundColor, label: 'Orange', color: '#F59E0B' },
    { value: 'pink' as BackgroundColor, label: 'Pink', color: '#EC4899' },
    { value: 'yellow' as BackgroundColor, label: 'Gelb', color: '#EAB308' },
    { value: 'red' as BackgroundColor, label: 'Rot', color: '#EF4444' },
    { value: 'teal' as BackgroundColor, label: 'Türkis', color: '#14B8A6' }
  ],
  skinTones: [
    { value: 'pale' as SkinTone, label: 'Sehr Hell', color: '#FFE5D9' },
    { value: 'light' as SkinTone, label: 'Hell', color: '#FFD5C2' },
    { value: 'medium' as SkinTone, label: 'Mittel', color: '#E8B999' },
    { value: 'tan' as SkinTone, label: 'Gebräunt', color: '#C68642' },
    { value: 'dark' as SkinTone, label: 'Dunkel', color: '#8D5524' }
  ],
  hairStyles: [
    { value: 'short' as HairStyle, label: 'Kurz' },
    { value: 'long' as HairStyle, label: 'Lang' },
    { value: 'bob' as HairStyle, label: 'Bob' },
    { value: 'curly' as HairStyle, label: 'Lockig' },
    { value: 'wavy' as HairStyle, label: 'Wellig' },
    { value: 'bun' as HairStyle, label: 'Dutt' },
    { value: 'bald' as HairStyle, label: 'Glatze' }
  ],
  hairColors: [
    { value: 'black' as HairColor, label: 'Schwarz', color: '#1F2937' },
    { value: 'brown' as HairColor, label: 'Braun', color: '#92400E' },
    { value: 'auburn' as HairColor, label: 'Kastanie', color: '#A0522D' },
    { value: 'blonde' as HairColor, label: 'Blond', color: '#FCD34D' },
    { value: 'red' as HairColor, label: 'Rot', color: '#DC2626' },
    { value: 'gray' as HairColor, label: 'Grau', color: '#9CA3AF' },
    { value: 'blue' as HairColor, label: 'Blau', color: '#3B82F6' },
    { value: 'pink' as HairColor, label: 'Pink', color: '#EC4899' }
  ],
  eyeStyles: [
    { value: 'normal' as EyeStyle, label: 'Normal' },
    { value: 'happy' as EyeStyle, label: 'Glücklich' },
    { value: 'wink' as EyeStyle, label: 'Zwinkern' },
    { value: 'closed' as EyeStyle, label: 'Geschlossen' },
    { value: 'surprised' as EyeStyle, label: 'Überrascht' }
  ],
  mouthStyles: [
    { value: 'smile' as MouthStyle, label: 'Lächeln' },
    { value: 'neutral' as MouthStyle, label: 'Neutral' },
    { value: 'smirk' as MouthStyle, label: 'Schmunzeln' },
    { value: 'surprised' as MouthStyle, label: 'Überrascht' }
  ],
  accessories: [
    { value: 'none' as Accessory, label: 'Keine' },
    { value: 'roundGlasses' as Accessory, label: 'Runde Brille' },
    { value: 'glasses' as Accessory, label: 'Eckige Brille' },
    { value: 'sunglasses' as Accessory, label: 'Sonnenbrille' },
    { value: 'beanie' as Accessory, label: 'Mütze' },
    { value: 'headband' as Accessory, label: 'Stirnband' }
  ]
};

export const DEFAULT_AVATAR_CONFIG: AvatarConfig = {
  backgroundColor: 'blue',
  skinTone: 'light',
  hairStyle: 'short',
  hairColor: 'brown',
  eyeStyle: 'normal',
  mouthStyle: 'smile',
  accessory: 'none'
};
