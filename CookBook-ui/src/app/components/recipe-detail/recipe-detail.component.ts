import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subject, switchMap, takeUntil, filter, map } from 'rxjs';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { RecipeService } from '../../services/recipe.service';
import { Recipe } from '../../models/recipe';

@Component({
  selector: 'app-recipe-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderComponent, FooterComponent],
  templateUrl: './recipe-detail.component.html',
  styleUrls: ['./recipe-detail.component.scss']
})
export class RecipeDetailComponent implements OnInit, OnDestroy {
  recipe: Recipe | null = null;
  isLoading = true;
  isSaved = false;
  servings = 4;
  completedSteps = new Set<string>();

  Math = Math;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private recipeService: RecipeService
  ) {}

  ngOnInit(): void {
    // Use reactive params so navigating between recipes works
    this.route.paramMap.pipe(
      map(params => params.get('id')),
      filter((id): id is string => id !== null),
      switchMap(id => {
        this.isLoading = true;
        return this.recipeService.getRecipeById(id);
      }),
      takeUntil(this.destroy$)
    ).subscribe(recipe => {
      if (recipe) {
        this.recipe = recipe;
        this.isSaved = recipe.isSaved || false;
        this.servings = recipe.servings;
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
    if (!this.recipe) return amount;
    return Math.round((amount * this.servings / this.recipe.servings) * 100) / 100;
  }

  getImageUrl(): string {
    if (!this.recipe) return '';
    return this.recipeService.getImageUrl(this.recipe.image);
  }

  getTotalTime(): number {
    if (!this.recipe) return 0;
    return this.recipe.prepTime + this.recipe.cookTime;
  }

  getDifficultyClass(): string {
    if (!this.recipe) return '';
    const classes: Record<string, string> = {
      'einfach': 'bg-cookbook-green/10 text-cookbook-green border-cookbook-green/20',
      'mittel': 'bg-cookbook-orange/10 text-cookbook-orange border-cookbook-orange/20',
      'schwer': 'bg-destructive/10 text-destructive border-destructive/20',
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
