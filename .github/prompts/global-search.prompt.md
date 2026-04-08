---
agent: 'agent'
description: Implement the global search feature with animated focus, pre-assigned search terms, and a dedicated search-results route in the CookBook Angular app.
---

Implement the global search feature across **both** the Spring Boot backend (`CookBook-be/`) and the Angular frontend (`CookBook-ui/`). Follow every step below exactly.

## Context

### Frontend
- Framework: Angular 17+ standalone components, Tailwind CSS, Angular Material icons
- Existing search bar is in `src/app/components/header/header.component.html` (lines 16-31) — it is a plain `<input>` with `isSearchFocused` tracking but no logic yet
- Routes are in `src/app/app.routes.ts` — no search route exists yet
- `RecipeService` (`src/app/services/recipe.service.ts`) has `getAllRecipes()` and `getRecipesByCategorieFilter()` but no search method yet
- `Recipe` model is in `src/app/models/recipe.ts`

### Backend
- Spring Boot project in `CookBook-be/src/main/java/de/cookBook/backend/`
- Controller: `controller/RecipesController.java` — mapped to `/api/recipes`
- Service: `service/RecipeService.java`
- Repository: `repository/RecipeRepository.java` — extends `JpaRepository<Recipes, Long>`
- Entity: `entities/Recipes.java` — has `title` (String), `description` (TEXT), `tags` (JSON)

---

## Step 0 – Create the backend search endpoint

### 0a – Add a repository method to `RecipeRepository.java`

Add a Spring Data JPA derived query that searches `title` and `description` case-insensitively:

```java
List<Recipes> findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
    String title, String description
);
```

Also add a helper default method for convenience:

```java
default List<Recipes> searchByQuery(String query) {
    return findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(query, query);
}
```

### 0b – Add a service method to `RecipeService.java`

```java
public List<RecipeResponseDto> searchRecipes(String query) {
    if (query == null || query.isBlank()) {
        return List.of();
    }
    return toResponseList(recipeRepository.searchByQuery(query.trim()));
}
```

### 0c – Add a controller endpoint to `RecipesController.java`

```java
@GetMapping("/search")
public List<RecipeResponseDto> searchRecipes(@RequestParam String query) {
    return recipeService.searchRecipes(query);
}
```

This exposes `GET /api/recipes/search?query=Pfannkuchen`.

---

## Step 1 – Add a `searchRecipes` method to the frontend `RecipeService`

Add a new method that calls the backend endpoint created in Step 0. Guard against empty input so the HTTP call is never made with a blank query:

```ts
searchRecipes(query: string): Observable<Recipe[]> {
  if (!query?.trim()) return of([]);
  return this.http.get<Recipe[]>(this.API_URL + '/search', { params: { query: query.trim() } });
}
```

Import `of` from `rxjs` at the top of the file if it is not already imported.

---

## Step 2 – Create the `SearchResultsComponent`

Create `src/app/components/search-results/search-results.component.ts` and its HTML template.

### Behaviour
- Read the `?q=` query param from the URL on init via `ActivatedRoute`
- Call `recipeService.searchRecipes(query)` and display results using the existing `<app-recipe-card>` component
- Show a loading skeleton while fetching
- Show a friendly empty-state message ("Keine Rezepte für „{query}" gefunden") when results are empty
- Include `<app-header>` and `<app-footer>` so the page is self-contained

### Template structure (Tailwind + existing design tokens)
```html
<app-header />
<main class="container mx-auto px-4 py-8">
  <h1 class="font-display text-3xl font-bold mb-2">Suchergebnisse für „{{ query }}"</h1>
  <p class="text-muted-foreground mb-8">{{ recipes.length }} Rezepte gefunden</p>
  <!-- loading / empty-state / recipe grid -->
</main>
<app-footer />
```

---

## Step 3 – Register the new route

In `src/app/app.routes.ts` add a lazy-loaded route **before** the `**` wildcard:

```ts
{
  path: 'search',
  loadComponent: () =>
    import('./components/search-results/search-results.component')
      .then(m => m.SearchResultsComponent)
}
```

---

## Step 4 – Create the `SearchOverlayComponent`

Create `src/app/components/search-overlay/search-overlay.component.ts` and its template.

### Behaviour
- Accepts `@Input() visible = false` and emits `@Output() closed = new EventEmitter<void>()`
- Contains a centred search input (auto-focused via `cdkTrapFocus` or a `ViewChild + focus()` call in `ngOnChanges`)
- Below the input shows pre-assigned suggestion chips:
  ```ts
  suggestions = ['Pfannkuchen', 'Pasta', 'Salat', 'Suppe', 'Pizza', 'Kuchen'];
  ```
- Clicking a chip sets the input value and immediately navigates: `router.navigate(['/search'], { queryParams: { q: term } })`
- Pressing Enter or clicking a search button with a non-empty query does the same navigation
- Pressing Escape or clicking the dark backdrop emits `closed`

### Template structure
```html
<!-- backdrop -->
<div class="fixed inset-0 bg-black/50 z-50" (click)="close()"></div>

<!-- modal panel -->
<div class="fixed top-24 left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 px-4">
  <div class="bg-card rounded-2xl shadow-2xl p-6">
    <!-- search input -->
    <!-- suggestion chips -->
  </div>
</div>
```

---

## Step 5 – Wire the overlay into `HeaderComponent`

### `header.component.ts`
- Add `isSearchOverlayOpen = false`
- Inject `Router`
- Add method `openSearchOverlay()` and `closeSearchOverlay()`

### `header.component.html`
- Make the existing search input a **button-like trigger** that calls `openSearchOverlay()` on `(click)` (keep focus animation)
- Render the overlay conditionally:
  ```html
  <app-search-overlay
    *ngIf="isSearchOverlayOpen"
    [visible]="isSearchOverlayOpen"
    (closed)="closeSearchOverlay()"
  />
  ```
- Import `SearchOverlayComponent` in the `imports` array of `HeaderComponent`

---

## Step 6 – Expand mobile support

Inside the mobile menu section of `header.component.html`, add the same trigger button that opens the overlay (reuse the overlay, do not duplicate it).

---

## Constraints

- Use existing Tailwind utility classes and CSS variables (`bg-card`, `text-foreground`, `text-primary`, `text-muted-foreground`, `border-border`) — do not introduce new colours
- All new frontend components must be **standalone**
- Do not modify any existing frontend component other than `HeaderComponent` and `RecipeService`
- Do not modify any existing backend class other than `RecipesController`, `RecipeService`, and `RecipeRepository`
- No new dependencies on either side — use only what is already in `package.json` and `build.gradle`
- The backend search is case-insensitive and matches partial strings in both `title` and `description`
