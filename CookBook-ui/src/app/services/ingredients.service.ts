import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Ingredient, NutritionInfo } from "@app/models/recipe";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({
    providedIn: "root",
})
export class IngridientsService {
private readonly API_URL = `${environment.apiUrl}/ingridients`;

    constructor(private http: HttpClient) {}

    getIngredientsWithRecipeId(recipeId: string): Observable<Ingredient[]> {
        return this.http.get<Ingredient[]>(this.API_URL + "/getIngredientsWithRecipeId", {params: {recipeId: recipeId}});
    }
}