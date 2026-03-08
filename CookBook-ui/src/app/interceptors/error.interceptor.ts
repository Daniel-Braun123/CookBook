import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { TokenStorageService } from '../services/token-storage.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const tokenStorage = inject(TokenStorageService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Only redirect to login if we actually sent an auth token
        // This prevents redirects for public endpoints accessed without login
        const hadAuthToken = req.headers.has('Authorization');
        if (hadAuthToken) {
          // Unauthorized - token expired or invalid
          tokenStorage.removeToken();
          router.navigate(['/login']);
        }
      } else if (error.status === 403) {
        // Forbidden
        console.error('Access forbidden');
      }
      return throwError(() => error);
    })
  );
};
