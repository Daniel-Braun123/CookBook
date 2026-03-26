import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { NutritionInfo } from "@app/models/recipe";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({
    providedIn: "root",
})
export class NutritionInfoService {
  private readonly API_URL = `${environment.apiUrl}/nutritionInfo`;

  constructor(private http: HttpClient) {}

  getNutritionInfoWithRecipeId(recipeId: string): Observable<NutritionInfo> {
    return this.http.get<NutritionInfo>(this.API_URL + "/getNutritionInfoWithRecipeId", {params: {recipeId: recipeId}});
  }
}
