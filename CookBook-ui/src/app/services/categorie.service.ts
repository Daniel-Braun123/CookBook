import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Category } from "@app/models/category";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({
	providedIn: "root",
})
export class CategorieService {
  private readonly API_URL = `${environment.apiUrl}/categories`;

  constructor(private http: HttpClient) {}

  getAllCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.API_URL + "/getAll");
  }
}