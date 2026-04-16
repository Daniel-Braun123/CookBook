import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, forkJoin, debounceTime, distinctUntilChanged } from 'rxjs';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { RecipeCardComponent } from '../recipe-card/recipe-card.component';
import { RecipeService } from '../../services/recipe.service';
import { CategorieService } from '../../services/categorie.service';
import { UserService } from '../../services/user.service';
import { Recipe } from '../../models/recipe';
import { Category } from '../../models/category';

@Component({
  selector: 'app-all-recipes',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, FooterComponent, RecipeCardComponent],
  templateUrl: './all-recipes.component.html',
  styleUrls: ['./all-recipes.component.scss']
})
export class AllRecipesComponent implements OnInit, OnDestroy {
  allRecipes: Recipe[] = [];
  filteredRecipes: Recipe[] = [];
  categories: Category[] = [];
  isLoading = true;

  // Filters
  searchQuery = '';
  selectedCategory = '';
  selectedDifficulty = '';
  sortBy = 'rating';
  showOwnRecipes = false;

  // Own recipes
  hasOwnRecipes = false;
  private currentUserId: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private recipeService: RecipeService,
    private categorieService: CategorieService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    window.scrollTo(0, 0);
    forkJoin({
      recipes: this.recipeService.getAllRecipes(),
      categories: this.categorieService.getAllCategories()
    }).pipe(takeUntil(this.destroy$)).subscribe(({ recipes, categories }) => {
      const me = this.userService.getCurrentUserSnapshot();
      this.currentUserId = me?.id ?? null;
      this.hasOwnRecipes = !!me && recipes.some(r => r.author?.id === me.id);
      this.allRecipes = recipes;
      this.categories = categories;
      this.isLoading = false;

      // Pre-select category from query param
      this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
        if (params['category']) {
          this.selectedCategory = params['category'];
        }
        this.applyFilters();
      });
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  applyFilters(): void {
    // Sync URL query params with current filter state
    const queryParams: Record<string, string> = {};
    if (this.selectedCategory) queryParams['category'] = this.selectedCategory;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      replaceUrl: true
    });

    const base = this.showOwnRecipes
      ? this.allRecipes
      : this.allRecipes.filter(r => r.author?.id !== this.currentUserId);
    let result = [...base];

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.tags?.some(t => t.toLowerCase().includes(q))
      );
    }

    if (this.selectedCategory) {
      result = result.filter(r => r.category?.name === this.selectedCategory);
    }

    if (this.selectedDifficulty) {
      result = result.filter(r => r.difficulty === this.selectedDifficulty);
    }

    if (this.sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (this.sortBy === 'newest') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (this.sortBy === 'time') {
      result.sort((a, b) => (a.prepTime + a.cookTime) - (b.prepTime + b.cookTime));
    }

    this.filteredRecipes = result;
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = '';
    this.selectedDifficulty = '';
    this.sortBy = 'rating';
    this.showOwnRecipes = false;
    this.applyFilters();
  }

  get hasActiveFilters(): boolean {
    return !!(this.searchQuery || this.selectedCategory || this.selectedDifficulty || this.sortBy !== 'rating');
  }

  trackByRecipeId(_index: number, recipe: Recipe): string {
    return recipe.id;
  }
}
