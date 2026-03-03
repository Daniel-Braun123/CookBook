import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { User } from '../models/user';

const mockUser: User = {
  id: 'u1',
  name: 'Maria Koch',
  email: 'maria@cookbook.de',
  avatar: '/avatars/maria.jpg',
  bio: 'Leidenschaftliche Hobbyköchin aus München. Ich liebe es, neue Rezepte auszuprobieren und mit der Community zu teilen.',
  savedRecipes: ['2', '4'],
  ownRecipes: ['1'],
  joinedAt: '2023-06-15'
};

@Injectable({
  providedIn: 'root'
})
export class UserService {

  getCurrentUser(): Observable<User> {
    return of(mockUser).pipe(delay(200));
  }

  login(email: string, password: string): Observable<User | null> {
    if (email && password) {
      return of(mockUser).pipe(delay(500));
    }
    return of(null).pipe(delay(500));
  }

  register(name: string, email: string, password: string): Observable<User | null> {
    if (name && email && password) {
      return of({ ...mockUser, name, email }).pipe(delay(500));
    }
    return of(null).pipe(delay(500));
  }

  logout(): Observable<void> {
    return of(void 0).pipe(delay(200));
  }
}
