# CookBook - Angular 17 Rezept-App

## Architektur-Übersicht

**Angular 17 Standalone Components** - Keine NgModule-Deklarationen. Alle Komponenten sind standalone mit expliziten `imports`.

**Lazy Loading** - Alle Pages in `src/app/components/` (ehemals `pages/`) werden über dynamische Imports in [app.routes.ts](../src/app/app.routes.ts) geladen:
```typescript
loadComponent: () => import('./components/index/index.component').then(m => m.IndexComponent)
```

**Mock-Service-Pattern** - Services liefern hardcodierte Mock-Daten über RxJS Observables (`of().pipe(delay(500))`). Keine HTTP-Calls zur externen API.
- [recipe.service.ts](../src/app/services/recipe.service.ts) - RecipeService mit 6 vollständigen Mock-Rezepten
- [user.service.ts](../src/app/services/user.service.ts) - UserService mit Mock-User-Daten

**Single-File Components** - Jede Komponente: TypeScript-Datei mit separaten `.html` und `.scss` Dateien. Templates in `.component.html`, Styles in `.component.scss`.

**File Structure per Component:**
```
component-name/
  ├── component-name.component.ts    # TypeScript class
  ├── component-name.component.html  # Template
  └── component-name.component.scss  # Styles
```

## Projekt-Konventionen

### Component Structure
- **Shared Components**: `src/app/components/` - Wiederverwendbare UI-Elemente (header, footer, recipe-card, category-pill, cookbook-logo)
- **Page Components**: `src/app/components/` - Routen-Komponenten für jede URL (index, recipe-detail, login, register, profile, not-found)
- **Services**: `src/app/services/` - RecipeService & UserService mit Observable-Pattern (getrennte Dateien)
- **Models**: `src/app/models/` - TypeScript Interfaces in separaten Dateien:
  - [recipe.ts](../src/app/models/recipe.ts) - Recipe, Author, Ingredient, CookingStep, NutritionInfo
  - [user.ts](../src/app/models/user.ts) - User Interface
  - [category.ts](../src/app/models/category.ts) - Category Interface

### Naming Conventions
- Dateien: `component-name.component.ts` (kebab-case)
- Klassen: `ComponentNameComponent` (PascalCase)
- Selektoren: `app-component-name` (kebab-case mit app-Präfix)

### State Management
**Kein zentraler Store** - State wird lokal in Komponenten mit Signals oder Properties verwaltet:
```typescript
isMobileMenuOpen = false;
isSearchFocused = false;
selectedCategory = '';
```

Services nutzen RxJS BehaviorSubject für reaktive Daten (siehe RecipeService.currentUserSubject).

### Styling-System

**Tailwind CSS** mit Custom Design Tokens in [styles.scss](../src/app/../styles.scss):
- Primary: `--primary: 20 80% 55%` (Warmes Orange)
- Secondary: `--secondary: 35 30% 94%` (Cremiges Beige)
- Custom Tokens: `--cookbook-orange`, `--cookbook-cream`, `--cookbook-brown`

**Angular Material** - UI Components und Icons:
- Material Theme: Orange Primary, Amber Accent
- mat-icon für alle Icons (Material Icons Font)
- mat-form-field für Formular-Eingaben
- mat-button, mat-raised-button, mat-icon-button für Buttons
- mat-checkbox für Checkboxen

**Utility-First Approach** - Komponenten kombinieren Tailwind-Klassen mit Material Components:
```html
<div class="container mx-auto px-4 py-8">
  <button class="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
```

**Responsive Design** - Mobile-First mit Tailwind-Breakpoints: `md:flex`, `lg:grid-cols-3`, `xl:max-w-7xl`

## Key Workflows

### Development
```bash
ng serve           # Dev server auf localhost:4200
ng build           # Production build in dist/
```

### Adding Components
1. Erstelle Ordner in `src/app/components/name/`
2. Erstelle 3 Dateien:
   - `name.component.ts` - Component class mit `standalone: true`
   - `name.component.html` - Template
   - `name.component.scss` - Styles
3. Definiere Component Decorator:
```typescript
@Component({
  selector: 'app-name',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './name.component.html',
  styleUrls: ['./name.component.scss']
})
```

Beispiel-Struktur:
```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './example.component.html',
  styleUrls: ['./example.component.scss']
})
export class ExampleComponent {}
```

### Adding Routes
Neue Route in [app.routes.ts](../src/app/app.routes.ts) mit Lazy Loading:
```typescript
{
  path: 'new-page',
  loadComponent: () => import('./components/new-page/new-page.component').then(m => m.NewPageComponent)
}
```

### Data Flow Pattern
1. Service liefert Observable: `getRecipes(): Observable<Recipe[]>`
2. Component subscribet: `this.recipeService.getRecipes().subscribe(data => this.recipes = data)`
3. Template nutzt Angular-Pipes: `*ngFor="let recipe of recipes"`

## Critical Implementation Details

### Recipe Card Component
[recipe-card.component.ts](../src/app/components/recipe-card/recipe-card.component.ts) nutzt `@Input() recipe!: Recipe` und emittiert `@Output() recipeClick` Event. Enthält Save-Button mit Heart-Icon, der toggleSaveRecipe() aufruft.

### Header Component
[header.component.ts](../src/app/components/header/header.component.ts) enthält responsive Navigation mit Mobile-Menu-Toggle. Desktop: Vollständige Nav-Leiste. Mobile: Hamburger-Menü mit slide-in Navigation.

### Bootstrap Configuration
[main.ts](../src/main.ts) bootstrapt mit:
- `provideRouter(routes)` - Routing
- `provideAnimations()` - Angular Animations
- `provideHttpClient()` - HTTP (aktuell ungenutzt, für spätere API-Integration)

### Recipe Detail Logic
[recipe-detail.component.ts](../src/app/components/recipe-detail/recipe-detail.component.ts) liest Route-Parameter mit `ActivatedRoute`, adjusted Servings mit `adjustServings(direction)` Method, die Ingredient-Mengen proportional skaliert.

## Testing & Debugging

**Keine Tests implementiert** - `ng test` würde fehlschlagen. Test-Setup muss noch konfiguriert werden.

**Console Errors** - Services loggen Fehler mit `console.error()`. Browser-DevTools nutzen für Debugging.

## Dependencies
- Angular 17.3 (Core, Router, Forms, Animations)
- Angular Material 17 (UI Components, Icons)
- RxJS 7.8 (Observables, Operators)
- Tailwind CSS 3.4 + tailwindcss-animate
- TypeScript 5.4
- Zone.js 0.14 (Angular Change Detection)

## Gotchas
- **Mock Data Only** - Alle Daten sind hardcoded in recipe.service.ts und user.service.ts. Keine echte Backend-Integration.
- **Image Paths** - Rezept-Bilder referenzieren `/recipes/image.jpg`, diese existieren nicht. Komponenten zeigen Platzhalter.
- **Authentication** - Login/Register Pages sind UI-Only. Keine echte Auth-Logik implementiert.
- **LocalStorage** - User-State wird NICHT persistiert. Seite neu laden = State verloren.
