import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  message: string;
  type: 'success' | 'error';
  id: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts$ = new BehaviorSubject<Toast[]>([]);
  private idCounter = 0;

  getToasts() {
    return this.toasts$.asObservable();
  }

  showSuccess(message: string, duration: number = 3000) {
    this.show(message, 'success', duration);
  }

  showError(message: string, duration: number = 4000) {
    this.show(message, 'error', duration);
  }

  private show(message: string, type: 'success' | 'error', duration: number) {
    const id = this.idCounter++;
    const toast: Toast = { message, type, id };
    
    const currentToasts = this.toasts$.value;
    this.toasts$.next([...currentToasts, toast]);

    setTimeout(() => {
      this.remove(id);
    }, duration);
  }

  private remove(id: number) {
    const currentToasts = this.toasts$.value;
    this.toasts$.next(currentToasts.filter(t => t.id !== id));
  }
}
