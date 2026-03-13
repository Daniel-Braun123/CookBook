import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Recipe } from '../models/recipe';

@Injectable({
  providedIn: 'root'
})
export class SavedRecipeService {
  private readonly API_URL = `${environment.apiUrl}/recipes`;
  private savedRecipeIdsSubject = new BehaviorSubject<Set<number>>(new Set());
  public savedRecipeIds$ = this.savedRecipeIdsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadSavedRecipeIds();
  }

  // Load all saved recipe IDs from backend
  loadSavedRecipeIds(): void {
    this.http.get<number[]>(`${this.API_URL}/saved-ids`).subscribe({
      next: (ids) => {
        this.savedRecipeIdsSubject.next(new Set(ids));
      },
      error: (err) => {
        console.error('Failed to load saved recipe IDs', err);
        this.savedRecipeIdsSubject.next(new Set());
      }
    });
  }

  // Toggle save/unsave for a recipe
  toggleSaveRecipe(recipeId: number): Observable<{ saved: boolean }> {
    return this.http.post<{ saved: boolean }>(`${this.API_URL}/${recipeId}/toggle-save`, {}).pipe(
      tap(response => {
        const currentIds = new Set(this.savedRecipeIdsSubject.value);
        if (response.saved) {
          currentIds.add(recipeId);
        } else {
          currentIds.delete(recipeId);
        }
        this.savedRecipeIdsSubject.next(currentIds);
      })
    );
  }

  // Get all saved recipes
  getSavedRecipes(): Observable<Recipe[]> {
    return this.http.get<Recipe[]>(`${this.API_URL}/saved`);
  }

  // Check if a recipe is saved (synchronous, from cached state)
  isRecipeSaved(recipeId: number): boolean {
    return this.savedRecipeIdsSubject.value.has(recipeId);
  }

  // Get saved recipe IDs (synchronous, from cached state)
  getSavedRecipeIds(): number[] {
    return Array.from(this.savedRecipeIdsSubject.value);
  }
}
