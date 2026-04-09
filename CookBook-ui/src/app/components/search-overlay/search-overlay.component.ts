import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  OnChanges,
  SimpleChanges,
  HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CookBookLogoComponent } from '../cookbook-logo/cookbook-logo.component';

@Component({
  selector: 'app-search-overlay',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, RouterLink, CookBookLogoComponent],
  templateUrl: './search-overlay.component.html',
  styleUrls: ['./search-overlay.component.scss']
})
export class SearchOverlayComponent implements OnChanges {
  @Input() visible = false;
  @Output() closed = new EventEmitter<void>();

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  searchQuery = '';
  suggestions = ['Pfannkuchen', 'Pasta', 'Salat', 'Suppe', 'Pizza', 'Kuchen'];

  constructor(private router: Router) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']?.currentValue === true) {
      setTimeout(() => this.searchInput?.nativeElement?.focus());
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close();
  }

  close(): void {
    this.closed.emit();
  }

  search(): void {
    const q = this.searchQuery.trim();
    if (!q) return;
    this.router.navigate(['/search'], { queryParams: { q } });
    this.close();
  }

  searchTerm(term: string): void {
    this.searchQuery = term;
    this.router.navigate(['/search'], { queryParams: { q: term } });
    this.close();
  }
}
