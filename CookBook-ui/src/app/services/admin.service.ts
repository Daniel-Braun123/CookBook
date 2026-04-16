import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Recipe } from '@app/models/recipe';

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  profilePicture: string | null;
  role: 'USER' | 'ADMIN';
  joinedAt: string;
}

export interface AdminRecipe {
  id: number;
  title: string;
  authorName: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly API_URL = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  getUsers(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(`${this.API_URL}/users`);
  }

  updateUserRole(id: number, role: 'USER' | 'ADMIN'): Observable<AdminUser> {
    return this.http.put<AdminUser>(`${this.API_URL}/users/${id}/role`, { role });
  }

  deleteUser(userId: number) {
    return this.http.delete<void>(`${this.API_URL}/delete-user/${userId}`);
  }

  deleteRecipe(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/delete-recipe/${id}`);
  }  
}
