import {
  Directive,
  ElementRef,
  Input,
  OnInit,
  OnDestroy,
  PLATFORM_ID,
  Inject,
  NgZone,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type RevealType = 'fade-in-up' | 'slide-in-left' | 'slide-in-right' | 'scale-in' | 'fade-in';

@Directive({
  selector: '[scrollReveal]',
  standalone: true,
})
export class ScrollRevealDirective implements OnInit, OnDestroy {
  @Input('scrollReveal') revealType: RevealType | '' = 'fade-in-up';
  @Input() revealDelay = 0;
  @Input() revealThreshold = 0.15;

  private observer: IntersectionObserver | null = null;
  private isBrowser: boolean;

  constructor(
    private el: ElementRef<HTMLElement>,
    private zone: NgZone,
    @Inject(PLATFORM_ID) platformId: object,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      this.el.nativeElement.classList.add('scroll-reveal--no-motion');
      return;
    }

    const type = this.revealType || 'fade-in-up';
    this.el.nativeElement.classList.add('scroll-reveal', `scroll-reveal--${type}`);

    if (this.revealDelay > 0) {
      this.el.nativeElement.style.transitionDelay = `${this.revealDelay}ms`;
    }

    this.zone.runOutsideAngular(() => {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-revealed');
              this.observer?.unobserve(entry.target);
            }
          });
        },
        {
          threshold: this.revealThreshold,
          rootMargin: '0px 0px -40px 0px',
        }
      );

      this.observer.observe(this.el.nativeElement);
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
