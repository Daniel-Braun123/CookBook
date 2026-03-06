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
    createdAt: '2024-01-03',
    isSaved: false
  },
];


@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private readonly SAVED_RECIPES_KEY = 'cookbook-saved-recipes';
  private readonly API_URL = `${environment.apiUrl}/recipes`;

  constructor(private http: HttpClient) { }

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

  toggleSaveRecipe(recipeId: string): Observable<boolean> {
    const recipe = mockRecipes.find(r => r.id === recipeId);
    if (recipe) {
      recipe.isSaved = !recipe.isSaved;
      this.saveSavedRecipes();
      return of(recipe.isSaved).pipe(delay(200));
    }
    return of(false).pipe(delay(200));
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

  getRecipeById(recipeId: string): Observable<Recipe> {
    return this.http.get<Recipe>(this.API_URL + "/getRecipeById", {params: {recipeId: recipeId}});
  }
}
