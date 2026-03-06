import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subject, switchMap, takeUntil, filter, map, forkJoin } from 'rxjs';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { RecipeService } from '../../services/recipe.service';
import { NutritionInfoService } from '../../services/nutritionInfo.service';
import { CookingStep, Ingredient, NutritionInfo, Recipe } from '../../models/recipe';
import { IngridientsService } from '@app/services/ingredients.service';
import { CookingStepsService } from '@app/services/cookingSteps.service';

@Component({
  selector: 'app-recipe-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderComponent, FooterComponent],
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

  Math = Math;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private recipeService: RecipeService,
    private nutritionInfoService: NutritionInfoService,
    private ingridientService: IngridientsService,
    private cookingStepsService: CookingStepsService
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
          cookingSteps: this.cookingStepsService.getCookingStepsWithRecipeId(recipeId)
        });
      }),
      takeUntil(this.destroy$)
    ).subscribe(({ recipe, nutrition, ingredients, cookingSteps }) => {
      if (recipe) {
        this.recipe = recipe;
        this.nutritionInfo = nutrition;
        this.ingredients = ingredients;
        this.cookingSteps = cookingSteps;

        this.servings = recipe.servings;
        this.originalServings = recipe.servings;

        this.completedSteps.clear();
      }
      this.isLoading = false;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
      'MITTEl': 'bg-cookbook-orange/10 text-cookbook-orange border-cookbook-orange/20',
      'SCHWER': 'bg-destructive/10 text-destructive border-destructive/20',
    };
    return classes[this.recipe.difficulty] || '';
  }

  toggleSaved(): void {
    if (!this.recipe) return;
    this.recipeService.toggleSaveRecipe(this.recipe.id).subscribe(saved => {
      this.isSaved = saved;
    });
  }
}
