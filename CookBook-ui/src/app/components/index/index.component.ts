import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { RecipeCardComponent } from '../../components/recipe-card/recipe-card.component';
import { CategoryPillComponent } from '../../components/category-pill/category-pill.component';
import { RecipeService } from '../../services/recipe.service';
import { Recipe } from '../../models/recipe';
import { Category } from '../../models/category';

@Component({
  selector: 'app-index',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink, 
    HeaderComponent, 
    FooterComponent, 
    RecipeCardComponent,
    CategoryPillComponent
  ],
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit {
  recipes: Recipe[] = [];
  categories: Category[] = [];
  activeCategory: string | null = null;
  isLoading = true;

  constructor(
    private recipeService: RecipeService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Load data first
    this.loadData().then(() => {
      // Then check for query parameters (from categories page)
      this.route.queryParams.subscribe(params => {
        const categoryName = params['category'];
        if (categoryName && this.categories.length > 0) {
          // Find category by name and set it as active
          const category = this.categories.find(c => c.name === categoryName);
          if (category) {
            this.activeCategory = category.id;
            this.filterByCategory(categoryName);
            
            // Scroll to recipes section after a short delay
            setTimeout(() => {
              this.scrollToRecipes();
            }, 500);
          }
        }
      });
    });
  }

  loadData(): Promise<void> {
    this.isLoading = true;
    
    return Promise.all([
      this.recipeService.getPopularRecipes().toPromise(),
      this.recipeService.getCategories().toPromise()
    ]).then(([recipes, categories]) => {
      this.recipes = recipes || [];
      this.categories = categories || [];
      this.isLoading = false;
    });
  }

  handleCategoryClick(categoryId: string): void {
    if (this.activeCategory === categoryId) {
      this.activeCategory = null;
      this.recipeService.getPopularRecipes().subscribe(recipes => {
        this.recipes = recipes;
      });
    } else {
      this.activeCategory = categoryId;
      const category = this.categories.find(c => c.id === categoryId);
      if (category) {
        this.recipeService.getRecipes(undefined, category.name).subscribe(filteredRecipes => {
          if (filteredRecipes.length > 0) {
            this.recipes = filteredRecipes;
          } else {
            this.recipeService.getPopularRecipes().subscribe(recipes => {
              this.recipes = recipes;
            });
          }
        });
      }
    }
  }

  getAnimationDelay(index: number): string {
    return `${index * 0.1}s`;
  }

  private filterByCategory(categoryName: string): void {
    this.recipeService.getRecipes(undefined, categoryName).subscribe(filteredRecipes => {
      if (filteredRecipes.length > 0) {
        this.recipes = filteredRecipes;
      } else {
        this.recipeService.getPopularRecipes().subscribe(recipes => {
          this.recipes = recipes;
        });
      }
    });
  }

  private scrollToRecipes(): void {
    const recipesSection = document.getElementById('recipes');
    if (recipesSection) {
      recipesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
