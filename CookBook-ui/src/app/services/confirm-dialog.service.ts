import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export interface ConfirmDialogOptions {
  message: string;
  title?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

interface ConfirmDialogState extends ConfirmDialogOptions {
  resolve: (result: boolean) => void;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmDialogService {
  private _state$ = new Subject<ConfirmDialogState | null>();
  readonly state$ = this._state$.asObservable();

  /**
   * Opens the confirmation dialog and returns a Promise<boolean>.
   * true  → user clicked confirm
   * false → user clicked cancel / backdrop
   */
  confirm(options: ConfirmDialogOptions): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this._state$.next({ ...options, resolve });
    });
  }

  /** Called by the component to resolve and close. */
  respond(result: boolean, resolve: (r: boolean) => void): void {
    this._state$.next(null);
    resolve(result);
  }
}
