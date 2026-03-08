import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil, forkJoin, switchMap, of } from 'rxjs';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { RecipeCardComponent } from '../../components/recipe-card/recipe-card.component';
import { CategoryPillComponent } from '../../components/category-pill/category-pill.component';
import { RecipeService } from '../../services/recipe.service';
import { CategorieService } from '../../services/categorie.service';
import { UserService } from '../../services/user.service';
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
export class IndexComponent implements OnInit, OnDestroy {
  recipes: Recipe[] = [];
  categories: Category[] = [];
  activeCategory: string | number | null = null;
  isLoading = true;

  private destroy$ = new Subject<void>();

  @ViewChild('recipesSection') recipesSection?: ElementRef<HTMLElement>;

  constructor(
    private recipeService: RecipeService,
    private categorieService: CategorieService,
    private userService: UserService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadData(): void {
    this.isLoading = true;

    forkJoin({
      recipes: this.recipeService.getSixBestRatedRecipes(),
      categories: this.categorieService.getAllCategories()
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe(({ recipes, categories }) => {
      this.recipes = recipes;
      this.categories = categories;
      this.isLoading = false;
      this.route.queryParams.pipe(
        takeUntil(this.destroy$)
      ).subscribe(params => {
        const categoryName = params['category'];
        if (categoryName && this.categories.length > 0) {
          const category = this.categories.find(c => c.name === categoryName);
          if (category) {
            this.activeCategory = category.id;
            this.filterByCategory(categoryName);
            setTimeout(() => this.scrollToRecipes(), 500);
          }
        }
      });
    });
  }

  handleCategoryClick(categoryId: string | number): void {
    if (this.activeCategory === categoryId) {
      this.activeCategory = null;
      this.recipeService.getSixBestRatedRecipes().pipe(
        takeUntil(this.destroy$)
      ).subscribe(recipes => {
        this.recipes = recipes;
      });
    } else {
      this.activeCategory = categoryId;
      const category = this.categories.find(c => c.id === categoryId);
      if (category) {
        this.filterByCategory(category.name);
      }
    }
  }

  getAnimationDelay(index: number): string {
    return `${index * 0.1}s`;
  }

  trackByRecipeId(_index: number, recipe: Recipe): string {
    return recipe.id;
  }

  trackByCategoryId(_index: number, category: Category): string | number {
    return category.id;
  }

  get isLoggedIn(): boolean {
    return this.userService.isLoggedIn();
  }

  private filterByCategory(categoryName: string): void {
    this.recipeService.getRecipesByCategorieFilter(categoryName).pipe(
      switchMap(filtered => filtered.length > 0 
        ? of(filtered) 
        : this.recipeService.getSixBestRatedRecipes()
      ),
      takeUntil(this.destroy$)
    ).subscribe(recipes => {
      this.recipes = recipes;
    });
  }

  private scrollToRecipes(): void {
    if (this.recipesSection) {
      this.recipesSection.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      const el = document.getElementById('recipes');
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
