import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Category } from '../../models/category';
import { CategorieService } from '@app/services/categorie.service';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, MatIconModule, HeaderComponent, FooterComponent],
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];
  isLoading = true;

  constructor(
    private router: Router,
    private location: Location,
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
    this.router.navigate(['/recipes'], { 
      queryParams: { category: categoryName }
    });
  }

  goBack(): void { this.location.back(); }
}
