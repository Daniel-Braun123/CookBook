import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment';

export interface EntityChangeEvent {
  entity: string;
  action: 'CREATED' | 'UPDATED' | 'DELETED';
  id: number;
}

@Injectable({ providedIn: 'root' })
export class RecipeEventService implements OnDestroy {
  /** Generic stream — any tracked entity change */
  readonly entityChanged$ = new Subject<EntityChangeEvent>();

  /** Convenience shortcuts for recipes */
  readonly recipeCreated$ = new Subject<number>();
  readonly recipeUpdated$ = new Subject<number>();
  readonly recipeDeleted$ = new Subject<number>();

  /** Convenience shortcuts for users */
  readonly userDeleted$ = new Subject<number>();

  /** Convenience shortcuts for reviews */
  readonly reviewChanged$ = new Subject<number>();

  private eventSource: EventSource | null = null;
  private reconnectDelay = 1000;
  private readonly maxReconnectDelay = 30000;

  constructor() {
    this.connect();
  }

  private connect(): void {
    this.eventSource?.close();
    const url = `${environment.apiUrl}/recipes/events`;
    this.eventSource = new EventSource(url, { withCredentials: true });

    this.eventSource.addEventListener('ENTITY_CHANGE', (e: MessageEvent) => {
      const event: EntityChangeEvent = JSON.parse(e.data);
      this.entityChanged$.next(event);

      // Route to convenience subjects
      switch (event.entity) {
        case 'Recipes':
          if (event.action === 'CREATED') this.recipeCreated$.next(event.id);
          if (event.action === 'UPDATED') this.recipeUpdated$.next(event.id);
          if (event.action === 'DELETED') this.recipeDeleted$.next(event.id);
          break;
        case 'Users':
          if (event.action === 'DELETED') this.userDeleted$.next(event.id);
          break;
        case 'Review':
          this.reviewChanged$.next(event.id);
          break;
      }
    });

    this.eventSource.onopen = () => {
      this.reconnectDelay = 1000;
    };

    this.eventSource.onerror = () => {
      this.eventSource?.close();
      setTimeout(() => this.connect(), this.reconnectDelay);
      this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxReconnectDelay);
    };
  }

  ngOnDestroy(): void {
    this.eventSource?.close();
    this.eventSource = null;
  }
}
