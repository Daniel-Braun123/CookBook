import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Category } from '../../models/category';
import { CategorieService } from '@app/services/categorie.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];
  isLoading = true;

  constructor(
    private router: Router,
    private categorieService: CategorieService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categorieService.getAllCategories().subscribe(categories => {
      this.categories = categories;
      this.isLoading = false;
    });
  }

  navigateToCategory(categoryName: string): void {
    // Navigate to home page with category query parameter and scroll to recipes section
    this.router.navigate(['/'], { 
      queryParams: { category: categoryName },
      fragment: 'recipes'
    });
  }
}
