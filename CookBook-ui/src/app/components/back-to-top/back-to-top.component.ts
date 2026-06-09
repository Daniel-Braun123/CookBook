import { Component, HostListener, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-back-to-top',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      *ngIf="isVisible"
      (click)="scrollToTop()"
      class="back-to-top-btn"
      aria-label="Nach oben scrollen"
      title="Nach oben"
    >
      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
      </svg>
    </button>
  `,
  styles: [`
    .back-to-top-btn {
      position: fixed;
      bottom: 1.5rem;
      right: 1.5rem;
      z-index: 45;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: hsl(var(--primary));
      color: hsl(var(--primary-foreground));
      border: none;
      cursor: pointer;
      box-shadow: var(--shadow-button);
      opacity: 0;
      transform: translateY(12px);
      animation: back-to-top-in 0.3s cubic-bezier(0.22, 1, 0.36, 1) forwards;
      transition: background 0.2s ease, transform 0.2s ease;
    }
    .back-to-top-btn:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-card-hover);
    }
    .back-to-top-btn:active {
      transform: translateY(0);
    }
    @keyframes back-to-top-in {
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .back-to-top-btn {
        animation: none;
        opacity: 1;
        transform: none;
      }
    }
  `]
})
export class BackToTopComponent implements OnInit {
  isVisible = false;
  private lastScrollY = 0;
  private ticking = false;
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.lastScrollY = window.scrollY;
    }
  }

  @HostListener('window:scroll')
  onScroll(): void {
    if (!this.isBrowser || this.ticking) return;

    this.ticking = true;
    requestAnimationFrame(() => {
      const currentScrollY = window.scrollY;
      const scrollingUp = currentScrollY < this.lastScrollY;
      const pastThreshold = currentScrollY > 600;

      this.isVisible = pastThreshold && scrollingUp;

      // Also show if scrolled very far (user might not scroll up first)
      if (currentScrollY > 1500) {
        this.isVisible = true;
      }

      // Hide when near top
      if (currentScrollY < 200) {
        this.isVisible = false;
      }

      this.lastScrollY = currentScrollY;
      this.ticking = false;
    });
  }

  scrollToTop(): void {
    if (this.isBrowser) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}
