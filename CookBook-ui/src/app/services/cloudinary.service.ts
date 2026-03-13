import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';

export interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class CloudinaryService {
  private readonly CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/djdmnrz4h/image/upload';
  private readonly UPLOAD_PRESET = 'CookBook_uploads';

  constructor(private http: HttpClient) {}

  uploadImage(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.UPLOAD_PRESET);

    return this.http.post<CloudinaryResponse>(this.CLOUDINARY_URL, formData).pipe(
      map(response => response.secure_url),
      catchError(error => {
        console.error('Cloudinary upload error:', error);
        return throwError(() => new Error('Bild-Upload fehlgeschlagen. Bitte versuche es erneut.'));
      })
    );
  }

  validateImage(file: File): { valid: boolean; error?: string } {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return { valid: false, error: 'Bitte wähle eine Bilddatei aus (JPG, PNG, WebP).' };
    }

    // Check file size (5MB = 5 * 1024 * 1024 bytes)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return { valid: false, error: 'Das Bild ist zu groß. Maximale Größe: 5MB.' };
    }

    return { valid: true };
  }
}
