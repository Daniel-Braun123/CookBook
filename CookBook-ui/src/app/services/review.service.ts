import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Review } from '../models/review';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private readonly API_URL = `${environment.apiUrl}/reviews`;

  constructor(private http: HttpClient) {}

  getReviewsForRecipe(recipeId: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.API_URL}/recipe/${recipeId}`);
  }

  submitReview(recipeId: string, stars: number, comment: string): Observable<Review> {
    return this.http.post<Review>(`${this.API_URL}/recipe/${recipeId}`, { stars, comment });
  }

  deleteReview(recipeId: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/recipe/${recipeId}`);
  }
}
