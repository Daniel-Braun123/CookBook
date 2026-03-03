# CookBook - Angular 17 Application

Eine moderne Rezept-Webanwendung mit Angular 17 Standalone Components, Tailwind CSS und RxJS.

## 🚀 Features

- ✅ **Angular 17 Standalone Components** - Moderne komponentenbasierte Architektur
- ✅ **Responsive Design** - Optimiert für alle Bildschirmgrößen
- ✅ **Tailwind CSS** - Utility-First CSS Framework
- ✅ **RxJS** - Reactive Programming für asynchrone Operationen
- ✅ **TypeScript** - Vollständig typisiert
- ✅ **Lazy Loading** - Optimierte Performance durch Code Splitting
- ✅ **Angular Router** - Client-seitiges Routing

## 📦 Installation

### Voraussetzungen

- Node.js v18 oder höher
- npm oder yarn
- Angular CLI v17

### Setup

```bash
# Angular CLI installieren (falls nicht vorhanden)
npm install -g @angular/cli@17

# Dependencies installieren
npm install

# Entwicklungsserver starten
ng serve

# Browser öffnen: http://localhost:4200
```

## 🏗️ Projektstruktur

```
tasteful-recipes/
├── .angular/                 # Angular Cache (generiert)
├── .git/                     # Git Repository
├── dist/                     # Build Output (generiert)
├── node_modules/             # NPM Dependencies (generiert)
├── public/                   # Statische Dateien
│   └── robots.txt
├── src/                      # Quellcode
│   ├── app/                  # Angular Application
│   │   ├── components/       # Alle Komponenten (Shared + Pages)
│   │   │   ├── category-pill/
│   │   │   │   ├── category-pill.component.ts
│   │   │   │   ├── category-pill.component.html
│   │   │   │   └── category-pill.component.scss
│   │   │   ├── cookbook-logo/
│   │   │   │   ├── cookbook-logo.component.ts
│   │   │   │   ├── cookbook-logo.component.html
│   │   │   │   └── cookbook-logo.component.scss
│   │   │   ├── footer/
│   │   │   │   ├── footer.component.ts
│   │   │   │   ├── footer.component.html
│   │   │   │   └── footer.component.scss
│   │   │   ├── header/
│   │   │   │   ├── header.component.ts
│   │   │   │   ├── header.component.html
│   │   │   │   └── header.component.scss
│   │   │   ├── recipe-card/
│   │   │   │   ├── recipe-card.component.ts
│   │   │   │   ├── recipe-card.component.html
│   │   │   │   └── recipe-card.component.scss
│   │   │   ├── index/
│   │   │   │   ├── index.component.ts
│   │   │   │   ├── index.component.html
│   │   │   │   └── index.component.scss
│   │   │   ├── login/
│   │   │   │   ├── login.component.ts
│   │   │   │   ├── login.component.html
│   │   │   │   └── login.component.scss
│   │   │   ├── not-found/
│   │   │   │   ├── not-found.component.ts
│   │   │   │   ├── not-found.component.html
│   │   │   │   └── not-found.component.scss
│   │   │   ├── profile/
│   │   │   │   ├── profile.component.ts
│   │   │   │   ├── profile.component.html
│   │   │   │   └── profile.component.scss
│   │   │   ├── recipe-detail/
│   │   │   │   ├── recipe-detail.component.ts
│   │   │   │   ├── recipe-detail.component.html
│   │   │   │   └── recipe-detail.component.scss
│   │   │   └── register/
│   │   │       ├── register.component.ts
│   │   │       ├── register.component.html
│   │   │       └── register.component.scss
│   │   ├── models/           # TypeScript Interfaces & Types
│   │   │   ├── recipe.ts     # Recipe, Author, Ingredient, CookingStep, NutritionInfo
│   │   │   ├── user.ts       # User Interface
│   │   │   └── category.ts   # Category Interface
│   │   ├── services/         # Angular Services (Injectable)
│   │   │   ├── recipe.service.ts  # RecipeService mit Mock-Rezepten
│   │   │   └── user.service.ts    # UserService mit Mock-User
│   │   ├── app.component.ts  # Root Component
│   │   ├── app.component.html # Root Template
│   │   ├── app.component.css  # Root Styles
│   │   └── app.routes.ts     # Routing-Konfiguration
│   ├── assets/               # Statische Assets (Bilder, Fonts, etc.)
│   │   └── recipes/          # Rezept-Bilder
│   ├── index.css             # Legacy CSS (kann entfernt werden)
│   ├── index.html            # Angular Entry Point
│   ├── main.ts               # Application Bootstrap
│   └── styles.scss           # Globale Styles + Tailwind CSS
├── .gitignore                # Git Ignore
├── angular.json              # Angular CLI Konfiguration
├── bun.lockb                 # Bun Lockfile
├── components.json           # Shadcn/UI Komponenten-Config
├── index.html                # Root HTML Template
├── package-lock.json         # NPM Lockfile
├── package.json              # NPM Dependencies & Scripts
├── postcss.config.js         # PostCSS Konfiguration (Tailwind)
├── README.md                 # Projekt-Dokumentation
├── tailwind.config.ts        # Tailwind CSS Konfiguration
├── tsconfig.app.json         # App-spezifische TypeScript Config
└── tsconfig.json             # TypeScript Root Konfiguration
```

## 🎯 Verfügbare Scripts

```bash
# Entwicklungsserver
ng serve

# Production Build
ng build

# Tests ausführen
ng test
```

## 📱 Routen

- `/` - Startseite mit Rezeptübersicht
- `/recipe/:id` - Rezept-Detailseite
- `/login` - Login-Seite
- `/register` - Registrierungs-Seite
- `/profile` - Benutzer-Profil
- `/**` - 404 Not Found

## 🛠️ Technologie-Stack

- **Framework**: Angular 17.3
- **UI Components**: Angular Material 17
- **Icons**: Material Icons
- **CSS**: Tailwind CSS 3.4
- **State Management**: RxJS 7.8
- **Routing**: Angular Router
- **Forms**: Angular Forms + Material Form Fields
- **TypeScript**: 5.4
- **Build**: Angular CLI

## 📚 Komponenten

### Shared Components
- **Header Component**: Navigations-Header mit Suchfunktion und responsivem Mobile Menu
- **Recipe Card Component**: Rezept-Karte mit Bild, Titel, Bewertung, Zeit und Schwierigkeitsgrad
- **Category Pill Component**: Interaktive Kategorie-Buttons zum Filtern von Rezepten
- **Footer Component**: Footer mit Links und Copyright
- **CookBook Logo Component**: Logo-Komponente

### Page Components
Alle Page-Komponenten befinden sich jetzt unter `src/app/components/`:
- **Index**: Startseite mit Rezeptübersicht
- **Recipe Detail**: Detailansicht eines Rezepts
- **Login**: Login-Formular
- **Register**: Registrierungs-Formular
- **Profile**: Benutzer-Profil
- **Not Found**: 404-Fehlerseite

## 🎨 Styling

### Tailwind CSS
Benutzerdefiniertes Theme:
- **Primary**: Warmes Orange
- **Secondary**: Cremiges Beige
- **Animations**: Fade-in, Hover-Effekte
- **Responsive**: sm, md, lg, xl, 2xl

### Angular Material
Material Design Components:
- **Icons**: mat-icon mit Material Icons Font (search, favorite, person, lock, email, menu, etc.)
- **Buttons**: mat-button, mat-raised-button, mat-icon-button
- **Forms**: mat-form-field mit matInput, matPrefix, matSuffix
- **Checkboxen**: mat-checkbox
- **Theme**: Orange Primary (#F97316), Amber Accent

## 📝 Services

### RecipeService
Befindet sich in [recipe.service.ts](src/app/services/recipe.service.ts) und bietet:
- `getRecipes(search?, category?)` - Alle Rezepte mit optionaler Suche/Filterung
- `getRecipeById(id)` - Einzelnes Rezept nach ID
- `getCategories()` - Kategorien-Liste
- `getFeaturedRecipes()` - Hervorgehobene Rezepte
- `getPopularRecipes()` - Beliebte Rezepte sortiert nach Reviews
- `toggleSaveRecipe(id)` - Rezept speichern/entfernen
- `getSavedRecipes()` - Gespeicherte Rezepte
- `getUserRecipes(userId)` - Rezepte eines Benutzers

### UserService
Befindet sich in [user.service.ts](src/app/services/user.service.ts) und bietet:
- `getCurrentUser()` - Aktueller Benutzer
- `login(email, password)` - Anmelden
- `register(name, email, password)` - Registrierung
- `logout()` - Abmelden

## 🚀 Deployment

```bash
ng build --configuration production
```

Output: `dist/` Ordner

## 📄 Lizenz

MIT License
