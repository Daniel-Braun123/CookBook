import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { RecipeService } from '../../services/recipe.service';
import { Category } from '../../models/category';

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

  // Category descriptions
  categoryDescriptions: Record<string, string> = {
    'Frühstück': 'Starte deinen Tag richtig - von Omeletts bis Pancakes.',
    'Mittagessen': 'Schnelle & leckere Gerichte für die Mittagspause.',
    'Abendessen': 'Entspannte Dinner-Rezepte für jeden Geschmack.',
    'Vegan': 'Pflanzliche Köstlichkeiten - gesund und nachhaltig.',
    'Dessert': 'Süße Versuchungen für jeden Anlass.',
    'Schnell & Einfach': 'Unkomplizierte Rezepte für beschäftigte Köche.',
    'Gesund': 'Ausgewogene Gerichte für deinen Lifestyle.',
    'Backen': 'Von Brot bis Kuchen - die Kunst des Backens.',
    'Suppen': 'Wärmende Suppen für jede Jahreszeit.',
    'Pasta': 'Italienische Klassiker und kreative Nudel-Gerichte.',
    'Fisch': 'Frische Fischgerichte - leicht und gesund.'
  };

  constructor(
    private recipeService: RecipeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.recipeService.getCategories().subscribe(categories => {
      this.categories = categories;
      this.isLoading = false;
    });
  }

  getCategoryDescription(categoryName: string): string {
    return this.categoryDescriptions[categoryName] || 'Entdecke tolle Rezepte aus dieser Kategorie.';
  }

  navigateToCategory(categoryName: string): void {
    // Navigate to home page with category query parameter and scroll to recipes section
    this.router.navigate(['/'], { 
      queryParams: { category: categoryName },
      fragment: 'recipes'
    });
  }
}
