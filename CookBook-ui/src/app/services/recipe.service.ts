import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Recipe } from '../models/recipe';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private readonly SAVED_RECIPES_KEY = 'cookbook-saved-recipes';
  private readonly API_URL = `${environment.apiUrl}/recipes`;

  constructor(private http: HttpClient) { }

  toggleSaveRecipe(recipeId: string) {
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

  createRecipe(recipeData: any): Observable<Recipe> {
    return this.http.post<Recipe>(this.API_URL + "/create", recipeData);
  }
}
