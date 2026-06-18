# Prompt für Claude Design — CookBook Präsentation

> **Hinweis:** Diesen kompletten Block in Claude (claude.ai) einfügen. Claude erstellt daraus ein vollständiges HTML-Artifact (single-file Präsentation).

---

## 🎯 Prompt (zum Kopieren)

Du bist ein Senior Presentation Designer mit Fokus auf moderne, ästhetische Tech-Präsentationen im **Anthropic / Claude Design-Stil** (warme, papierartige Farbtöne, edle Serif-Typografie, viel Whitespace, sanfte Schatten, minimalistische Eleganz).

Erstelle eine **vollständige, eigenständige HTML-Präsentation** (single-file, alles inline: HTML + CSS + JavaScript) zu meinem Abschlussprojekt **CookBook**. Maximum: **15 Folien**. Navigation per Pfeiltasten ← / →, Leertaste, Maus-Buttons und Touch-Swipe. Folienzähler unten rechts. Sanfte Übergänge zwischen Folien.

---

### 🎨 Design-Anforderungen (Claude-Style)

- **Farbpalette** (Anthropic-inspiriert):
  - Hintergrund: `#F5F1EB` (warmes Papierweiß) oder `#FAF7F2` (cremig)
  - Text: `#2D2A26` (warmes Schwarz)
  - Akzent 1: `#CC785C` (Claude-Terrakotta / Coral)
  - Akzent 2: `#8B7355` (Erdton / Mocha)
  - Subtle: `#D4C5B0` (sandfarben), `#6B6359` (grauweich)
- **Typografie**:
  - Headlines: edle Serif (z. B. `Fraunces`, `Tiempos`, `EB Garamond` oder `Crimson Pro`) via Google Fonts
  - Body: clean Sans-Serif (`Inter`, `Söhne` oder `Geist`)
  - Code: `JetBrains Mono`
- **Layout-Prinzipien**:
  - Viel Whitespace, großzügige Padding (60–80px)
  - Subtile Schatten (`box-shadow: 0 1px 3px rgba(0,0,0,.04)`)
  - Soft border-radius (12–20px)
  - Sanfte Hover-States
  - Kein dunkler Modus, kein „Tech-Cyberpunk-Look", keine grellen Neon-Farben
  - Mikro-Animationen mit `cubic-bezier(.22, 1, .36, 1)`
- **Bildsprache**:
  - Optional dezente Hintergrund-Pattern (Papier-Grain via SVG-Filter, ~3% Opacity)
  - Sehr feine Linien als Trennelemente
  - SVG-Diagramme statt Bilder, in den Akzentfarben gehalten

---

### 📋 Projekt-Informationen (vollständig)

#### Was ist CookBook?
Eine moderne **Full-Stack Rezeptanwendung** zum Erstellen, Teilen, Bewerten und Verwalten von Rezepten — inklusive **KI-gestütztem Koch-Assistenten** (Chat-Widget mit GPT-5-mini-Streaming).

**Autor:** Daniel Braun · **Abschlussprojekt** · Juni 2026

#### Tech Stack

**Backend (CookBook-be):**
- Spring Boot **4.0.1** · Java **17** · Gradle
- PostgreSQL **17** (Port 5433) · Flyway-Migrationen (V0.0 – V0.8)
- Spring Data JPA · Hibernate · Lombok
- Spring Security · JWT (jjwt 0.12.5, HMAC-SHA256, 24h Gültigkeit)
- Spring OAuth2 Client (Google Login)
- Spring WebFlux + WebClient für reaktives Streaming
- Server-Sent Events (SSE) für AI-Chat
- Cloudinary für Bildhosting (URL-only)

**Frontend (CookBook-ui):**
- Angular **17** Standalone Components · TypeScript **5.4**
- Tailwind CSS + SCSS · Angular Material · Lucide Icons
- RxJS BehaviorSubject für State
- Angular Service Worker → **PWA-fähig** (offline support)
- Dark / Light Mode + Color Theme Picker

#### Architektur (3-Schichten)
```
Angular 17 (:4200)  ──REST──►  Spring Boot (:8080)  ──JPA──►  PostgreSQL
                                       │
                                       └── OAuth2 ──► Google Identity
                                       └── WebClient ──► LLM API (GPT-5-mini)
```

#### Datenbank — 9 Tabellen
| Tabelle | Zweck |
|---|---|
| `users` | Profile, Auth-Provider (LOCAL/GOOGLE), Rolle (USER/ADMIN) |
| `categories` | Rezeptkategorien mit Icon |
| `recipes` | Titel, Beschreibung, Rating, Tags (JSONB) |
| `ingredients` | Zutatenlisten (Name, Menge, Einheit) |
| `cooking_steps` | Schritt-für-Schritt-Anleitungen (sortiert) |
| `nutrition_info` | Kalorien, Protein, Carbs, Fett, Ballaststoffe |
| `saved_recipes` | N:M Favoriten Nutzer ↔ Rezepte |
| `reviews` | 1–5 Sterne + Kommentare (UNIQUE user_id + recipe_id) |
| `chat_history` | KI-Chatverläufe pro User |

**Flyway-Migrationen:** V0.0 (Tabellen) → V0.1 (Testdaten) → V0.2 (Cleanup) → V0.3 (Testdaten ohne User) → V0.4 (OAuth2) → V0.5 (Profilbild-Rename) → V0.6 (Reviews) → V0.7 (Rollen) → V0.8 (Chat History)

#### REST API — 11 Controller, ~30 Endpoints
- `AuthController` — Register, Login, Profil, Profilbild
- `RecipesController` — CRUD, Suche, Favoriten
- `ReviewController` — Bewertungen (Upsert pro User/Recipe)
- `CategorieController`, `IngredientsController`, `CookingStepsController`, `NutritionInfoController`
- `AdminController` — Nutzerverwaltung, Rollenzuweisung, Moderation
- `ChatController` — KI-Chat (SSE-Streaming)
- `ChatHistoryController` — Chatverläufe laden/speichern
- `HomeController` — Health & Statistik

**Zugriffsebenen:** Öffentlich · JWT (authentifiziert) · ADMIN (Rolle)

#### Features
1. **Rezeptverwaltung** — CRUD mit Zutaten, Kochschritten, Nährwerten
2. **Bewertungssystem** — 1–5 Sterne, aggregiertes Rating, ein Review pro User/Rezept
3. **Volltextsuche** — Titel & Beschreibung (PostgreSQL FTS)
4. **Kategoriefilter** — Rezepte nach Kategorie durchsuchen
5. **Favoriten** — Rezepte speichern / unspeichern
6. **Kochmodus** — Vollbild, Schritt-für-Schritt mit Timer
7. **Portionsanpassung** — Dynamische Mengenberechnung
8. **KI-Chat-Assistent** — Streaming-Chat (GPT-5-mini via SSE), kennt alle Rezepte aus der DB, antwortet auf Deutsch, verlinkt passende Rezepte
9. **Auth** — E-Mail-Registrierung + Google OAuth2
10. **Cloudinary-Bildupload** — Profilbilder & Rezeptbilder
11. **Admin-Dashboard** — Nutzerverwaltung, Rollen, Rezept-Moderation
12. **PWA** — Installierbar, Service Worker, Offline-Support
13. **Dark/Light Mode** + Color Theme Picker
14. **Globale Confirm-Dialoge** + Route Guards (Auth/Guest/Admin/PendingChanges)

#### Security
- **BCrypt** Passwort-Hashing mit Salt
- **JWT** HMAC-SHA256 · 24h · enthält userId + role
- **JwtAuthFilter** → SecurityContext bei jedem Request
- **CustomOAuth2SuccessHandler** → Upsert User mit `auth_provider = GOOGLE`
- **@PreAuthorize** auf ADMIN-Endpoints
- **CORS** konfiguriert für `localhost:4200`

#### Vorgehensweise (5 Phasen)
1. **Grundidee** — Was soll die App können? Orientierung an Chefkoch.de
2. **Datenmodell** — Relationales ER-Diagramm zuerst (drawio)
3. **Frontend-Entwurf** — UI-Grundgerüst mit KI generiert
4. **Iterativ erweitert** — REST + UI Hand in Hand
5. **Security zuletzt** — JWT + OAuth2 mit KI-Unterstützung

#### Aufgetretene Probleme & Lösungen
- **Spring Boot Setup** → Dokumentation gelesen, Schritt für Schritt konfiguriert
- **DB-Verbindung** → application.properties penibel geprüft
- **JPA-Beziehungen** → Mit kleinen Test-Entities geübt
- **REST-API testen** → Postman + DTO-Anpassungen
- **Eingabevalidierung** → Pflichtfelder + Bean-Validation
- **Bilder-Upload** → Cloudinary statt eigenem Filesystem
- **OAuth2-Integration** → Aufwendigste Stelle; viel Doku & Trial-and-Error
- **SSE-Streaming für Chat** → Reactive WebClient + SseEmitter

#### Lessons Learned
- **Architektur:** DTO-Pattern lohnt sich · Constructor Injection > `@Autowired` · Schichten trennen
- **Praxis:** Flyway von Tag 1 · Security früh konzipieren · Konsistente API-Pfade
- **Mindset:** Funktional first, dann optimieren · aussagekräftige Commits · iterativ statt perfekt
- **Wichtigste Erkenntnis:** Eine solide Backend-Basis (Datenmodell + REST + Security) macht alle nachfolgenden Arbeiten massiv einfacher.

#### KI im Projekt — wo half es?
**Stark bei:** Frontend (Angular UI-Komponenten), Boilerplate (DTOs, Mapper), Tailwind, Test-Skelette, Refactoring-Vorschläge, Doku, Recherche, Stacktrace-Analyse
**Schwach bei:** Architekturentscheidungen, Datenmodell-Design, Security-Konzept, OAuth2-Komplexität, Domain-Bugs, DB-Migrations-Strategie, Performance, Big Picture
**Fazit:** KI ist ein **Beschleuniger**, kein **Ersatz** für eigene Architektur-Verantwortung. **Ich** habe die Entscheidungen getroffen, KI hat sie umgesetzt.

#### Live Demo
URL: `http://localhost:4200` — Letzte Folie enthält großen, einladenden Demo-Button.

---

### 📑 Vorgeschlagene Folienstruktur (max. 15)

| # | Titel | Inhalt |
|---|---|---|
| 1 | **CookBook** | Titelfolie · Subtitle · Tech-Pills · Autor + Datum |
| 2 | **Was ist CookBook?** | Kurzbeschreibung + 4 KPI-Kacheln (30 Endpoints, 9 Tabellen, 11 Controller, 25+ Komponenten) |
| 3 | **Vorgehensweise** | 5 Phasen mit Zeitstrahl · Leitprinzip |
| 4 | **Tech Stack** | 3 Spalten: Backend / DB & Build / Security & Frontend |
| 5 | **Architektur** | SVG: 3-Schichten-Diagramm (Angular ↔ Spring Boot ↔ PostgreSQL + Google + LLM) |
| 6 | **Datenmodell** | ER-Diagramm mit allen 9 Tabellen + Beziehungen |
| 7 | **REST API** | Endpoint-Übersicht gruppiert nach Controller (Statistik-Kacheln) |
| 8 | **Code-Beispiel** | `POST /api/recipes/create` — Request + Service-Flow + Response |
| 9 | **Security** | JWT-Flow (lokaler Login) + OAuth2-Flow (Google) |
| 10 | **KI-Chat-Assistent** ⭐ | Highlight-Folie · GPT-5-mini · SSE-Streaming · Recipe-Awareness · Code-Snippet |
| 11 | **Herausforderungen** | 6 Probleme + Lösungen als Cards |
| 12 | **Lessons Learned** | Architektur / Praxis / Mindset + Hauptaussage |
| 13 | **KI im Projekt** | Pro/Contra · Stark vs. Schwach |
| 14 | **Fazit** | Zusammenfassung + Feature-Highlights |
| 15 | **Live Demo & Danke** | Großer Demo-Button → `http://localhost:4200` |

---

### ⚙️ Technische Anforderungen an die HTML-Datei

- **Single File** — alles inline, keine externen Assets außer Google Fonts
- **Responsive** — funktioniert ab 320px Breite
- **Keyboard Navigation** — ← / → / Leertaste / Home / End / Backspace
- **Touch-Support** — Swipe links/rechts auf Mobile
- **Progress Bar** — oben (3px hoch, Akzent-Gradient)
- **Slide Counter** — z. B. „07 / 15" unten rechts
- **Smooth Transitions** — `opacity` + `translateY` mit Easing
- **Print-friendly** — `@media print` Regel mit `page-break-after: always`
- **Kein JavaScript-Framework** — pures Vanilla JS
- **Semantic HTML** — `<section>` pro Folie

---

### 🎯 Output

Gib mir **nur den vollständigen HTML-Code** als Artifact zurück (single file). Keine Erklärungen davor oder danach. Die Präsentation soll sofort nutzbar sein — ich speichere sie als `.html` und öffne sie im Browser.

**Wichtig:** Halte dich strikt an **Claude/Anthropic-Designsprache** — warm, papierartig, edel. Keine dunklen Hintergründe, keine Neon-Akzente, keine Cyberpunk-Ästhetik.
