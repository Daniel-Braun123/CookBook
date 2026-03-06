import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { CookingStep, Ingredient, NutritionInfo } from "@app/models/recipe";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({
    providedIn: "root",
})
export class CookingStepsService {
private readonly API_URL = `${environment.apiUrl}/cooking-steps`;

    constructor(private http: HttpClient) {}

    getCookingStepsWithRecipeId(recipeId: string): Observable<CookingStep[]> {
        return this.http.get<CookingStep[]>(this.API_URL + "/getCookingStepsWithRecipeId", {params: {recipeId: recipeId}});
    }
}