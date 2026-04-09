import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Subject, switchMap, takeUntil, filter, map, forkJoin } from 'rxjs';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { RecipeService } from '../../services/recipe.service';
import { SavedRecipeService } from '../../services/saved-recipe.service';
import { UserService } from '../../services/user.service';
import { ToastService } from '../../services/toast.service';
import { NutritionInfoService } from '../../services/nutritionInfo.service';
import { Recipe } from '../../models/recipe';
import { CookingStep } from '../../models/cooking-step';
import { Ingredient } from '../../models/ingredient';
import { NutritionInfo } from '../../models/nutrition-info';
import { IngridientsService } from '@app/services/ingredients.service';
import { CookingStepsService } from '@app/services/cookingSteps.service';
import { ReviewService } from '../../services/review.service';
import { Review } from '../../models/review';

@Component({
  selector: 'app-recipe-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderComponent, FooterComponent, MatIconModule, FormsModule],
  templateUrl: './recipe-detail.component.html',
  styleUrls: ['./recipe-detail.component.scss']
})
export class RecipeDetailComponent implements OnInit, OnDestroy {
  recipe: Recipe | null = null;
  nutritionInfo: NutritionInfo | null = null;
  ingredients: Ingredient[] | null = null;
  cookingSteps: CookingStep[] | null = null;
  isLoading = true;
  isSaved = false;
  servings: number = 1;
  originalServings: number = 1;
  completedSteps = new Set<string>();

  reviews: Review[] = [];
  hoverStar = 0;
  selectedStar = 0;
  reviewComment = '';
  isSubmittingReview = false;
  existingUserReview: Review | null = null;

  cookingMode = false;
  cookingStepIndex = 0;
  cookingShowIngredients = false;
  private wakeLock: any = null;

  Math = Math;
  readonly today = new Date();

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private recipeService: RecipeService,
    private savedRecipeService: SavedRecipeService,
    public userService: UserService,
    private toastService: ToastService,
    private nutritionInfoService: NutritionInfoService,
    private ingridientService: IngridientsService,
    private cookingStepsService: CookingStepsService,
    private reviewService: ReviewService
  ) {}

  ngOnInit(): void {
    window.scrollTo(0, 0);
    
    // Use reactive params so navigating between recipes works
    this.route.paramMap.pipe(
      map(params => params.get('id')),
      filter((recipeId): recipeId is string => recipeId !== null),
      switchMap(recipeId => {
        this.isLoading = true;
        window.scrollTo(0, 0);
        return forkJoin({
          recipe: this.recipeService.getRecipeById(recipeId),
          nutrition: this.nutritionInfoService.getNutritionInfoWithRecipeId(recipeId),
          ingredients: this.ingridientService.getIngredientsWithRecipeId(recipeId),
          cookingSteps: this.cookingStepsService.getCookingStepsWithRecipeId(recipeId),
          reviews: this.reviewService.getReviewsForRecipe(recipeId)
        });
      }),
      takeUntil(this.destroy$)
    ).subscribe(({ recipe, nutrition, ingredients, cookingSteps, reviews }) => {
      if (recipe) {
        // Redirect to edit page if the current user is the author,
        // unless ?view=true is set (navigating from my-recipes detail view)
        const currentUser = this.userService.getCurrentUserSnapshot();
        const viewOnly = this.route.snapshot.queryParamMap.get('view') === 'true';
        if (currentUser && recipe.author?.id === currentUser.id && !viewOnly) {
          this.isLoading = false;
          this.router.navigate(['/edit-recipe', recipe.id], { replaceUrl: true });
          return;
        }

        this.recipe = recipe;
        this.nutritionInfo = nutrition;
        this.ingredients = ingredients;
        this.cookingSteps = cookingSteps;

        this.servings = recipe.servings;
        this.originalServings = recipe.servings;

        this.completedSteps.clear();

        // Reviews
        this.reviews = reviews;
        const me = this.userService.getCurrentUserSnapshot();
        this.existingUserReview = me
          ? (reviews.find(r => String(r.authorId) === me.id) ?? null)
          : null;
        if (this.existingUserReview) {
          this.selectedStar = this.existingUserReview.stars;
          this.reviewComment = this.existingUserReview.comment ?? '';
        } else {
          this.selectedStar = 0;
          this.reviewComment = '';
        }
        
        // Check if recipe is saved
        if (this.userService.isLoggedIn()) {
          this.isSaved = this.savedRecipeService.isRecipeSaved(Number(recipe.id));
        }
      }
      this.isLoading = false;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.releaseWakeLock();
    document.body.style.overflow = '';
  }

  @HostListener('document:keydown', ['$event'])
  onCookingKeyDown(event: KeyboardEvent): void {
    if (!this.cookingMode) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      this.cookingNext();
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.cookingPrev();
    } else if (event.key === 'Escape') {
      this.exitCookingMode();
    }
  }

  toggleStep(stepId: string): void {
    if (this.completedSteps.has(stepId)) {
      this.completedSteps.delete(stepId);
    } else {
      this.completedSteps.add(stepId);
    }
  }

  adjustAmount(amount: number): number {
    if (!this.originalServings) return amount;
    return Math.round((amount * this.servings / this.originalServings) * 100) / 100;
  }

  getTotalTime(): number {
    if (!this.recipe) return 0;
    return this.recipe.prepTime + this.recipe.cookTime;
  }

  getDifficultyClass(): string {
    if (!this.recipe) return '';
    const classes: Record<string, string> = {
      'EINFACH': 'bg-cookbook-green/10 text-cookbook-green border-cookbook-green/20',
      'MITTEL': 'bg-cookbook-orange/10 text-cookbook-orange border-cookbook-orange/20',
      'SCHWER': 'bg-destructive/10 text-destructive border-destructive/20',
    };
    return classes[this.recipe.difficulty] || '';
  }

  toggleSaved(): void {
    if (!this.recipe) return;
    
    // Check if user is logged in
    if (!this.userService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    
    // Toggle save state via service
    this.savedRecipeService.toggleSaveRecipe(Number(this.recipe.id)).subscribe({
      next: (response) => {
        this.isSaved = response.saved;
        if (response.saved) {
          this.toastService.showSuccess('Rezept gespeichert! ❤️');
        } else {
          this.toastService.showSuccess('Rezept entfernt');
        }
      },
      error: (err) => {
        console.error('Failed to toggle save recipe', err);
        this.toastService.showError('Fehler beim Speichern');
      }
    });
  }

  enterCookingMode(): void {
    this.cookingMode = true;
    this.cookingStepIndex = 0;
    this.cookingShowIngredients = false;
    document.body.style.overflow = 'hidden';
    void this.requestWakeLock();
  }

  exitCookingMode(): void {
    this.cookingMode = false;
    document.body.style.overflow = '';
    this.releaseWakeLock();
  }

  cookingNext(): void {
    if (this.cookingSteps && this.cookingStepIndex < this.cookingSteps.length) {
      this.cookingStepIndex++;
    }
  }

  cookingPrev(): void {
    if (this.cookingStepIndex > 0) {
      this.cookingStepIndex--;
    }
  }

  cookingProgress(): number {
    if (!this.cookingSteps?.length) return 0;
    return (this.cookingStepIndex / this.cookingSteps.length) * 100;
  }

  private async requestWakeLock(): Promise<void> {
    try {
      if ('wakeLock' in navigator) {
        this.wakeLock = await (navigator as any).wakeLock.request('screen');
        // Re-acquire after the user returns from another tab/app
        this.wakeLock.addEventListener('release', () => {
          if (this.cookingMode) void this.requestWakeLock();
        });
      }
    } catch { /* silently ignore — browser may deny in background */ }
  }

  private releaseWakeLock(): void {
    if (this.wakeLock) {
      this.wakeLock.release().catch(() => {});
      this.wakeLock = null;
    }
  }

  printRecipe(): void {
    window.print();
  }

  onSubmitReview(): void {
    if (!this.recipe || this.selectedStar === 0 || this.isSubmittingReview) return;
    this.isSubmittingReview = true;
    this.reviewService.submitReview(String(this.recipe.id), this.selectedStar, this.reviewComment)
      .subscribe({
        next: (review) => {
          this.existingUserReview = review;
          // Replace in list or prepend
          const idx = this.reviews.findIndex(r => r.authorId === review.authorId);
          if (idx >= 0) {
            this.reviews = [review, ...this.reviews.filter((_, i) => i !== idx)];
          } else {
            this.reviews = [review, ...this.reviews];
          }
          // Update aggregate
          if (this.recipe) {
            this.recipe = { ...this.recipe, reviewCount: this.reviews.length };
          }
          this.toastService.showSuccess('Bewertung gespeichert! ⭐');
          this.isSubmittingReview = false;
        },
        error: () => {
          this.toastService.showError('Fehler beim Speichern der Bewertung');
          this.isSubmittingReview = false;
        }
      });
  }

  onDeleteReview(): void {
    if (!this.recipe || !this.existingUserReview) return;
    this.reviewService.deleteReview(String(this.recipe.id)).subscribe({
      next: () => {
        this.reviews = this.reviews.filter(r => r.id !== this.existingUserReview!.id);
        this.existingUserReview = null;
        this.selectedStar = 0;
        this.reviewComment = '';
        this.toastService.showSuccess('Bewertung gelöscht');
      },
      error: () => this.toastService.showError('Fehler beim Löschen')
    });
  }
}
