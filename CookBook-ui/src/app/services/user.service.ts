import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
import { User } from '../models/user';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/auth';
import { TokenStorageService } from './token-storage.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly API_URL = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorageService
  ) {
    // Load user from localStorage if token exists
    this.loadCurrentUserFromToken();
  }

  private loadCurrentUserFromToken(): void {
    if (this.tokenStorage.hasToken()) {
      // Load user data from backend
      this.fetchCurrentUser().subscribe({
        next: (user) => this.currentUserSubject.next(user),
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

  getCurrentUser(): Observable<User | null> {
    return this.currentUser$;
  }

  login(email: string, password: string): Observable<AuthResponse> {
    const request: LoginRequest = { email, password };
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, request).pipe(
      tap(response => {
        this.tokenStorage.saveToken(response.token);
        this.currentUserSubject.next(response.user);
      })
    );
  }

  register(name: string, email: string, password: string): Observable<AuthResponse> {
    const request: RegisterRequest = { name, email, password };
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, request).pipe(
      tap(response => {
        this.tokenStorage.saveToken(response.token);
        this.currentUserSubject.next(response.user);
      })
    );
  }

  logout(): void {
    this.tokenStorage.removeToken();
    this.currentUserSubject.next(null);
  }

  updateProfile(name: string, email: string, bio?: string, avatar?: string): Observable<User> {
    const updateData = { name, email, bio, avatar };
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
