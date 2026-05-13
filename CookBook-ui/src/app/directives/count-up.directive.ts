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

@Directive({
  selector: '[countUp]',
  standalone: true,
})
export class CountUpDirective implements OnInit, OnDestroy {
  @Input('countUp') targetValue = 0;
  @Input() countSuffix = '';
  @Input() countDuration = 1800;

  private observer: IntersectionObserver | null = null;
  private isBrowser: boolean;
  private animationFrameId: number | null = null;

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
      this.el.nativeElement.textContent = this.formatValue(this.targetValue) + this.countSuffix;
      return;
    }

    this.el.nativeElement.textContent = '0' + this.countSuffix;

    this.zone.runOutsideAngular(() => {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              this.animate();
              this.observer?.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.3 }
      );

      this.observer.observe(this.el.nativeElement);
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  private animate(): void {
    const start = performance.now();
    const duration = this.countDuration;
    const target = this.targetValue;

    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      const current = Math.round(eased * target);

      this.el.nativeElement.textContent = this.formatValue(current) + this.countSuffix;

      if (progress < 1) {
        this.animationFrameId = requestAnimationFrame(step);
      }
    };

    this.animationFrameId = requestAnimationFrame(step);
  }

  private formatValue(value: number): string {
    if (value >= 1000) {
      const k = value / 1000;
      return k % 1 === 0 ? `${k}k` : `${k.toFixed(1)}k`;
    }
    return value.toString();
  }
}
