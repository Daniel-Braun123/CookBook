import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Category } from '../../models/category';

@Component({
  selector: 'app-category-pill',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-pill.component.html',
  styleUrls: ['./category-pill.component.scss']
})
export class CategoryPillComponent {
  @Input() category!: Category;
  @Input() isActive: boolean = false;
  @Output() clicked = new EventEmitter<void>();

  handleClick(): void {
    this.clicked.emit();
  }
}
