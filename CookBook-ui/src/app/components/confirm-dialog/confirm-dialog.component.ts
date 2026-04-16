import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';
import { ConfirmDialogService, ConfirmDialogOptions } from '../../services/confirm-dialog.service';

interface ActiveDialog extends ConfirmDialogOptions {
  resolve: (result: boolean) => void;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
<div *ngIf="dialog"
     class="fixed inset-0 z-[9999] flex items-center justify-center px-4 transition-all duration-200"
     [class.opacity-0]="!visible"
     [class.opacity-100]="visible"
     [class.pointer-events-none]="!visible">

  <!-- Backdrop -->
  <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" (click)="onCancel()"></div>

  <!-- Card -->
  <div class="relative bg-card border border-border rounded-2xl shadow-xl w-full max-w-sm p-6 transition-all duration-200"
       [class.scale-95]="!visible"
       [class.scale-100]="visible">

    <!-- Icon + Text -->
    <div class="flex items-start gap-4 mb-6">
      <div class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
           [ngClass]="dialog.danger !== false ? 'bg-destructive/10' : 'bg-primary/10'">
        <mat-icon [ngClass]="dialog.danger !== false ? 'text-destructive' : 'text-primary'">
          {{ dialog.danger !== false ? 'warning' : 'help_outline' }}
        </mat-icon>
      </div>
      <div>
        <h3 class="font-semibold text-foreground mb-1">
          {{ dialog.title || (dialog.danger !== false ? 'Löschen bestätigen' : 'Bestätigen') }}
        </h3>
        <p class="text-sm text-muted-foreground">{{ dialog.message }}</p>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex gap-3 justify-end">
      <button
        (click)="onCancel()"
        class="px-4 py-2 rounded-xl text-sm font-semibold bg-secondary text-foreground hover:bg-secondary/80 transition-colors duration-200">
        {{ dialog.cancelLabel || 'Abbrechen' }}
      </button>
      <button
        (click)="onConfirm()"
        class="px-4 py-2 rounded-xl text-sm font-semibold transition-colors duration-200"
        [ngClass]="dialog.danger !== false
          ? 'bg-destructive text-white hover:bg-destructive/90'
          : 'bg-primary text-primary-foreground hover:bg-primary/90'">
        {{ dialog.confirmLabel || (dialog.danger !== false ? 'Löschen' : 'Bestätigen') }}
      </button>
    </div>
  </div>
</div>
  `
})
export class ConfirmDialogComponent implements OnInit, OnDestroy {
  dialog: ActiveDialog | null = null;
  visible = false;

  private sub!: Subscription;

  constructor(private confirmDialogService: ConfirmDialogService) {}

  ngOnInit(): void {
    this.sub = this.confirmDialogService.state$.subscribe((state) => {
      if (state) {
        this.dialog = state;
        requestAnimationFrame(() => { this.visible = true; });
      } else {
        this.visible = false;
        setTimeout(() => { this.dialog = null; }, 200);
      }
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  onConfirm(): void {
    if (this.dialog) {
      this.confirmDialogService.respond(true, this.dialog.resolve);
    }
  }

  onCancel(): void {
    if (this.dialog) {
      this.confirmDialogService.respond(false, this.dialog.resolve);
    }
  }
}

