import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Recipe } from '../models/recipe';
import { Category } from '../models/category';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

// Mock data structured like real API responses
const mockRecipes: Recipe[] = [
  {
    id: '1',
    title: 'Cremige Tomatensuppe mit Basilikum',
    description: 'Eine samtige Tomatensuppe mit frischem Basilikum und einem Hauch von Knoblauch. Perfekt für kalte Tage.',
    image: '/recipes/tomato-soup.jpg',
    rating: 4.8,
    reviewCount: 234,
    prepTime: 15,
    cookTime: 30,
    difficulty: 'EINFACH',
    servings: 4,
    category: { id: 'cat9', name: 'Suppen', icon: '🍲', count: 32 },
    tags: ['Vegetarisch', 'Gesund', 'Schnell'],
    author: {
      id: 'u1',
      name: 'Maria Koch',
      avatar: '/avatars/maria.jpg'
    },
    ingredients: [
      { id: 'i1', name: 'Tomaten (Dose)', amount: 800, unit: 'g' },
      { id: 'i2', name: 'Zwiebel', amount: 1, unit: 'Stück' },
      { id: 'i3', name: 'Knoblauch', amount: 2, unit: 'Zehen' },
      { id: 'i4', name: 'Basilikum', amount: 1, unit: 'Bund' },
      { id: 'i5', name: 'Sahne', amount: 100, unit: 'ml' },
      { id: 'i6', name: 'Olivenöl', amount: 2, unit: 'EL' },
      { id: 'i7', name: 'Salz', amount: 1, unit: 'TL' },
      { id: 'i8', name: 'Pfeffer', amount: 1, unit: 'Prise' },
    ],
    steps: [
      { id: 's1', stepNumber: 1, instruction: 'Zwiebel und Knoblauch fein hacken und in Olivenöl glasig anschwitzen.', duration: 5 },
      { id: 's2', stepNumber: 2, instruction: 'Die Dosentomaten hinzugeben und 20 Minuten köcheln lassen.', duration: 20 },
      { id: 's3', stepNumber: 3, instruction: 'Mit einem Stabmixer pürieren bis die Suppe cremig ist.', duration: 2 },
      { id: 's4', stepNumber: 4, instruction: 'Sahne einrühren und mit Salz und Pfeffer abschmecken.', duration: 2 },
      { id: 's5', stepNumber: 5, instruction: 'Mit frischem Basilikum garnieren und servieren.', duration: 1 },
    ],
    nutrition: {
      calories: 180,
      protein: 4,
      carbs: 15,
      fat: 12,
      fiber: 3
    },
    createdAt: '2024-01-15',
    isSaved: false
  },
  {
    id: '2',
    title: 'Klassische Spaghetti Carbonara',
    description: 'Original italienische Carbonara mit Guanciale, Pecorino und cremiger Eier-Sauce. Ein zeitloser Klassiker.',
    image: '/recipes/carbonara.jpg',
    rating: 4.9,
    reviewCount: 567,
    prepTime: 10,
    cookTime: 20,
    difficulty: 'MITTEL',
    servings: 4,
    category: { id: 'cat10', name: 'Pasta', icon: '🍝', count: 76 },
    tags: ['Italienisch', 'Klassiker'],
    author: {
      id: 'u2',
      name: 'Luigi Rossi',
      avatar: '/avatars/luigi.jpg'
    },
    ingredients: [
      { id: 'i1', name: 'Spaghetti', amount: 400, unit: 'g' },
      { id: 'i2', name: 'Guanciale', amount: 200, unit: 'g' },
      { id: 'i3', name: 'Eigelb', amount: 4, unit: 'Stück' },
      { id: 'i4', name: 'Pecorino Romano', amount: 100, unit: 'g' },
      { id: 'i5', name: 'Schwarzer Pfeffer', amount: 2, unit: 'TL' },
    ],
    steps: [
      { id: 's1', stepNumber: 1, instruction: 'Spaghetti in reichlich Salzwasser al dente kochen.', duration: 10 },
      { id: 's2', stepNumber: 2, instruction: 'Guanciale in Streifen schneiden und knusprig braten.', duration: 8 },
      { id: 's3', stepNumber: 3, instruction: 'Eigelb mit geriebenem Pecorino und Pfeffer vermischen.', duration: 2 },
      { id: 's4', stepNumber: 4, instruction: 'Heiße Pasta zum Guanciale geben und vom Herd nehmen.', duration: 1 },
      { id: 's5', stepNumber: 5, instruction: 'Ei-Käse-Mischung unterrühren bis eine cremige Sauce entsteht.', duration: 2 },
    ],
    nutrition: {
      calories: 650,
      protein: 25,
      carbs: 70,
      fat: 30,
      fiber: 3
    },
    createdAt: '2024-01-10',
    isSaved: true
  },
  {
    id: '3',
    title: 'Veganer Buddha Bowl',
    description: 'Bunte Schüssel voller Nährstoffe mit Quinoa, geröstetem Gemüse und Tahini-Dressing.',
    image: '/recipes/buddha-bowl.jpg',
    rating: 4.7,
    reviewCount: 189,
    prepTime: 20,
    cookTime: 25,
    difficulty: 'EINFACH',
    servings: 2,
    category: { id: 'cat4', name: 'Vegan', icon: '🥗', count: 67 },
    tags: ['Vegan', 'Gesund', 'Bowl'],
    author: {
      id: 'u3',
      name: 'Sophie Grün',
      avatar: '/avatars/sophie.jpg'
    },
    ingredients: [
      { id: 'i1', name: 'Quinoa', amount: 150, unit: 'g' },
      { id: 'i2', name: 'Kichererbsen', amount: 200, unit: 'g' },
      { id: 'i3', name: 'Süßkartoffel', amount: 1, unit: 'große' },
      { id: 'i4', name: 'Avocado', amount: 1, unit: 'Stück' },
      { id: 'i5', name: 'Spinat', amount: 100, unit: 'g' },
      { id: 'i6', name: 'Tahini', amount: 3, unit: 'EL' },
    ],
    steps: [
      { id: 's1', stepNumber: 1, instruction: 'Quinoa nach Packungsanleitung kochen.', duration: 15 },
      { id: 's2', stepNumber: 2, instruction: 'Süßkartoffel würfeln und mit Kichererbsen im Ofen rösten.', duration: 25 },
      { id: 's3', stepNumber: 3, instruction: 'Tahini-Dressing aus Tahini, Zitrone und Wasser anrühren.', duration: 3 },
      { id: 's4', stepNumber: 4, instruction: 'Alle Zutaten in einer Schüssel anrichten und mit Dressing servieren.', duration: 5 },
    ],
    nutrition: {
      calories: 520,
      protein: 18,
      carbs: 60,
      fat: 24,
      fiber: 12
    },
    createdAt: '2024-01-12',
    isSaved: false
  },
  {
    id: '4',
    title: 'Fluffige Pancakes mit Ahornsirup',
    description: 'Amerikanische Pancakes, die auf der Zunge zergehen. Mit echtem Ahornsirup und frischen Beeren.',
    image: '/recipes/pancakes.jpg',
    rating: 4.6,
    reviewCount: 423,
    prepTime: 10,
    cookTime: 15,
    difficulty: 'EINFACH',
    servings: 4,
    category: { id: 'cat1', name: 'Frühstück', icon: '🍳', count: 45 },
    tags: ['Süß', 'Frühstück', 'Amerikanisch'],
    author: {
      id: 'u4',
      name: 'Tom Baker',
      avatar: '/avatars/tom.jpg'
    },
    ingredients: [
      { id: 'i1', name: 'Mehl', amount: 250, unit: 'g' },
      { id: 'i2', name: 'Milch', amount: 300, unit: 'ml' },
      { id: 'i3', name: 'Eier', amount: 2, unit: 'Stück' },
      { id: 'i4', name: 'Backpulver', amount: 2, unit: 'TL' },
      { id: 'i5', name: 'Butter', amount: 30, unit: 'g' },
      { id: 'i6', name: 'Ahornsirup', amount: 100, unit: 'ml' },
    ],
    steps: [
      { id: 's1', stepNumber: 1, instruction: 'Mehl, Backpulver und eine Prise Salz vermischen.', duration: 2 },
      { id: 's2', stepNumber: 2, instruction: 'Milch, Eier und geschmolzene Butter hinzufügen und verrühren.', duration: 3 },
      { id: 's3', stepNumber: 3, instruction: 'In einer Pfanne bei mittlerer Hitze goldbraun backen.', duration: 15 },
      { id: 's4', stepNumber: 4, instruction: 'Mit Ahornsirup und frischen Beeren servieren.', duration: 2 },
    ],
    nutrition: {
      calories: 380,
      protein: 10,
      carbs: 55,
      fat: 14,
    },
    createdAt: '2024-01-08',
    isSaved: true
  },
  {
    id: '5',
    title: 'Mediterraner Lachs mit Gemüse',
    description: 'Zarter Lachs auf einem Bett von gegrilltem Mittelmeer-Gemüse mit Zitronen-Kräuter-Butter.',
    image: '/recipes/salmon.jpg',
    rating: 4.9,
    reviewCount: 312,
    prepTime: 15,
    cookTime: 25,
    difficulty: 'MITTEL',
    servings: 2,
    category: { id: 'cat11', name: 'Fisch', icon: '🐟', count: 41 },
    tags: ['Gesund', 'Low Carb', 'Mediterran'],
    author: {
      id: 'u5',
      name: 'Anna Fischer',
      avatar: '/avatars/anna.jpg'
    },
    ingredients: [
      { id: 'i1', name: 'Lachsfilet', amount: 400, unit: 'g' },
      { id: 'i2', name: 'Zucchini', amount: 1, unit: 'Stück' },
      { id: 'i3', name: 'Paprika', amount: 2, unit: 'Stück' },
      { id: 'i4', name: 'Cherrytomaten', amount: 200, unit: 'g' },
      { id: 'i5', name: 'Zitrone', amount: 1, unit: 'Stück' },
      { id: 'i6', name: 'Frische Kräuter', amount: 1, unit: 'Bund' },
    ],
    steps: [
      { id: 's1', stepNumber: 1, instruction: 'Gemüse in mundgerechte Stücke schneiden.', duration: 10 },
      { id: 's2', stepNumber: 2, instruction: 'Gemüse auf einem Backblech verteilen und mit Olivenöl beträufeln.', duration: 5 },
      { id: 's3', stepNumber: 3, instruction: 'Lachs würzen und auf das Gemüse legen.', duration: 3 },
      { id: 's4', stepNumber: 4, instruction: 'Bei 200°C etwa 20 Minuten backen.', duration: 20 },
      { id: 's5', stepNumber: 5, instruction: 'Mit Zitronensaft und frischen Kräutern servieren.', duration: 2 },
    ],
    nutrition: {
      calories: 420,
      protein: 35,
      carbs: 15,
      fat: 25,
      fiber: 5
    },
    createdAt: '2024-01-05',
    isSaved: false
  },
  {
    id: '6',
    title: 'Tiramisu Klassisch',
    description: 'Das Original aus Italien: Löffelbiskuits, Mascarpone, Espresso und Kakao in perfekter Harmonie.',
    image: '/recipes/tiramisu.jpg',
    rating: 4.8,
    reviewCount: 456,
    prepTime: 30,
    cookTime: 0,
    difficulty: 'MITTEL',
    servings: 8,
    category: { id: 'cat5', name: 'Dessert', icon: '🍰', count: 54 },
    tags: ['Italienisch', 'Süß', 'No-Bake'],
    author: {
      id: 'u2',
      name: 'Luigi Rossi',
      avatar: '/avatars/luigi.jpg'
    },
    ingredients: [
      { id: 'i1', name: 'Löffelbiskuits', amount: 400, unit: 'g' },
      { id: 'i2', name: 'Mascarpone', amount: 500, unit: 'g' },
      { id: 'i3', name: 'Espresso', amount: 300, unit: 'ml' },
      { id: 'i4', name: 'Eigelb', amount: 4, unit: 'Stück' },
      { id: 'i5', name: 'Zucker', amount: 100, unit: 'g' },
      { id: 'i6', name: 'Kakaopulver', amount: 2, unit: 'EL' },
    ],
    steps: [
      { id: 's1', stepNumber: 1, instruction: 'Eigelb mit Zucker cremig schlagen.', duration: 5 },
      { id: 's2', stepNumber: 2, instruction: 'Mascarpone vorsichtig unterheben.', duration: 3 },
      { id: 's3', stepNumber: 3, instruction: 'Löffelbiskuits kurz in Espresso tauchen und schichten.', duration: 10 },
      { id: 's4', stepNumber: 4, instruction: 'Abwechselnd Creme und Biskuits schichten.', duration: 10 },
      { id: 's5', stepNumber: 5, instruction: 'Mindestens 4 Stunden kühlen und mit Kakao bestäuben.', duration: 240 },
    ],
    nutrition: {
      calories: 420,
      protein: 8,
      carbs: 45,
      fat: 24,
    },
    createdAt: '2024-01-03',
    isSaved: false
  },
];

const mockCategories: Category[] = [
  { id: 'cat1', name: 'Frühstück', icon: '🍳', count: 45 },
  { id: 'cat2', name: 'Mittagessen', icon: '🍝', count: 120 },
  { id: 'cat3', name: 'Abendessen', icon: '🍽️', count: 98 },
  { id: 'cat4', name: 'Vegan', icon: '🥗', count: 67 },
  { id: 'cat5', name: 'Dessert', icon: '🍰', count: 54 },
  { id: 'cat6', name: 'Schnell & Einfach', icon: '⏱️', count: 89 },
  { id: 'cat7', name: 'Gesund', icon: '💪', count: 72 },
  { id: 'cat8', name: 'Backen', icon: '🥐', count: 43 },
  { id: 'cat9', name: 'Suppen', icon: '🍲', count: 32 },
  { id: 'cat10', name: 'Pasta', icon: '🍝', count: 76 },
  { id: 'cat11', name: 'Fisch', icon: '🐟', count: 41 },
];

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private readonly SAVED_RECIPES_KEY = 'cookbook-saved-recipes';
  private readonly API_URL = `${environment.apiUrl}/recipes`;

  constructor(private http: HttpClient) {
    // Load saved recipes from localStorage on initialization
    this.loadSavedRecipes();
  }

  /**
   * Load saved recipe IDs from localStorage and update mockRecipes
   */
  private loadSavedRecipes(): void {
    try {
      const savedIds = localStorage.getItem(this.SAVED_RECIPES_KEY);
      if (savedIds) {
        const ids: string[] = JSON.parse(savedIds);
        mockRecipes.forEach(recipe => {
          recipe.isSaved = ids.includes(recipe.id);
        });
      }
    } catch (error) {
      console.error('Failed to load saved recipes from localStorage:', error);
    }
  }

  /**
   * Save recipe IDs to localStorage
   */
  private saveSavedRecipes(): void {
    try {
      const savedIds = mockRecipes.filter(r => r.isSaved).map(r => r.id);
      localStorage.setItem(this.SAVED_RECIPES_KEY, JSON.stringify(savedIds));
    } catch (error) {
      console.error('Failed to save recipes to localStorage:', error);
    }
  }

  getRecipes(search?: string, category?: string): Observable<Recipe[]> {
    let results = [...mockRecipes];
    
    if (search) {
      const searchLower = search.toLowerCase();
      results = results.filter(r => 
        r.title.toLowerCase().includes(searchLower) ||
        r.description.toLowerCase().includes(searchLower) ||
        r.tags.some(t => t.toLowerCase().includes(searchLower))
      );
    }
    
    if (category) {
      results = results.filter(r => r.category.name === category);
    }
    
    return of(results).pipe(delay(300));
  }

  getRecipeById(id: string): Observable<Recipe | null> {
    const recipe = mockRecipes.find(r => r.id === id) || null;
    return of(recipe).pipe(delay(200));
  }

  getCategories(): Observable<Category[]> {
    return of(mockCategories).pipe(delay(200));
  }

  getFeaturedRecipes(): Observable<Recipe[]> {
    return of(mockRecipes.slice(0, 3)).pipe(delay(300));
  }

  getPopularRecipes(): Observable<Recipe[]> {
    const popular = [...mockRecipes].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 6);
    return of(popular).pipe(delay(300));
  }

  toggleSaveRecipe(recipeId: string): Observable<boolean> {
    const recipe = mockRecipes.find(r => r.id === recipeId);
    if (recipe) {
      recipe.isSaved = !recipe.isSaved;
      this.saveSavedRecipes();
      return of(recipe.isSaved).pipe(delay(200));
    }
    return of(false).pipe(delay(200));
  }

  getSavedRecipes(): Observable<Recipe[]> {
    const saved = mockRecipes.filter(r => r.isSaved);
    return of(saved).pipe(delay(300));
  }

  getUserRecipes(userId: string): Observable<Recipe[]> {
    const userRecipes = mockRecipes.filter(r => r.author.id === userId);
    return of(userRecipes).pipe(delay(300));
  }

  /**
   * Resolve image path from mock data path to actual asset path
   */
  getImageUrl(imagePath: string): string {
    const imageMap: Record<string, string> = {
      '/recipes/tomato-soup.jpg': 'assets/recipes/tomato-soup.jpg',
      '/recipes/carbonara.jpg': 'assets/recipes/carbonara.jpg',
      '/recipes/buddha-bowl.jpg': 'assets/recipes/buddha-bowl.jpg',
      '/recipes/pancakes.jpg': 'assets/recipes/pancakes.jpg',
      '/recipes/salmon.jpg': 'assets/recipes/salmon.jpg',
      '/recipes/tiramisu.jpg': 'assets/recipes/tiramisu.jpg',
    };
    return imageMap[imagePath] || imagePath;
  }

  getAllRecipes(): Observable<Recipe[]> {
    return this.http.get<Recipe[]>(this.API_URL + "/getAll");
  }

  getSixBestRatedRecipes(): Observable<Recipe[]> {
    return this.http.get<Recipe[]>(this.API_URL + "/getSixBestRated");
  }

  getRecipesByCategorieFilter(categoryName: string): Observable<Recipe[]> {
    return this.http.get<Recipe[]>(this.API_URL + "/getByCategorieFilter", {params: {categoryName: categoryName}});
  }
}
