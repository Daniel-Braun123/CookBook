import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { User } from '../models/user';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/auth';
import { TokenStorageService } from './token-storage.service';
import { SavedRecipeService } from './saved-recipe.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly API_URL = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorageService,
    private savedRecipeService: SavedRecipeService
  ) {
    // Load user from localStorage if token exists
    this.loadCurrentUserFromToken();
  }

  private loadCurrentUserFromToken(): void {
    if (this.tokenStorage.hasToken()) {
      // Load user data from backend
      this.loadAndSetCurrentUser().subscribe({
        next: () => {}, // User already set in tap
        error: (err) => {
          console.error('Failed to load user', err);
          this.tokenStorage.removeToken(); // Token ungültig
        }
      });
    }
  }

  fetchCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/me`);
  }

  loadAndSetCurrentUser(): Observable<User> {
    return this.fetchCurrentUser().pipe(
      tap(user => {
        this.currentUserSubject.next(user);
        // Load saved recipe IDs after user is loaded
        this.savedRecipeService.loadSavedRecipeIds();
      })
    );
  }

  getCurrentUser(): Observable<User | null> {
    return this.currentUser$;
  }

  login(email: string, password: string): Observable<AuthResponse> {
    const request: LoginRequest = { email, password };
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, request).pipe(
      tap(response => {
        this.tokenStorage.saveToken(response.token);
        this.currentUserSubject.next(response.user);
        // Load saved recipe IDs after login
        this.savedRecipeService.loadSavedRecipeIds();
      })
    );
  }

  register(name: string, email: string, password: string): Observable<AuthResponse> {
    const request: RegisterRequest = { name, email, password };
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, request).pipe(
      tap(response => {
        this.tokenStorage.saveToken(response.token);
        this.currentUserSubject.next(response.user);
        // Load saved recipe IDs after register
        this.savedRecipeService.loadSavedRecipeIds();
      })
    );
  }

  logout(): void {
    this.tokenStorage.removeToken();
    this.currentUserSubject.next(null);
    // Clear saved recipe IDs on logout
    this.savedRecipeService.loadSavedRecipeIds(); // This will fail and clear the set
  }

  updateProfile(name: string, email: string, bio?: string, profilePicture?: string): Observable<User> {
    const updateData: { name: string; email: string; bio?: string; profilePicture?: string } = {
      name,
      email,
      bio
    };

    if (profilePicture) {
      updateData.profilePicture = profilePicture;
    }

    return this.http.put<User>(`${this.API_URL}/update`, updateData).pipe(
      tap(user => {
        this.currentUserSubject.next(user);
      })
    );
  }

  isLoggedIn(): boolean {
    return this.tokenStorage.hasToken();
  }
}
