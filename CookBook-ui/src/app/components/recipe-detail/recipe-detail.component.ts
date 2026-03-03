import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
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
export class RecipeDetailComponent implements OnInit {
  recipe: Recipe | null = null;
  isLoading = true;
  isSaved = false;
  servings = 4;
  completedSteps = new Set<string>();

  Math = Math;

  constructor(
    private route: ActivatedRoute,
    private recipeService: RecipeService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadRecipe(id);
    }
  }

  loadRecipe(id: string): void {
    this.isLoading = true;
    this.recipeService.getRecipeById(id).subscribe(recipe => {
      if (recipe) {
        this.recipe = recipe;
        this.isSaved = recipe.isSaved || false;
        this.servings = recipe.servings;
      }
      this.isLoading = false;
    });
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
    const imageMap: Record<string, string> = {
      '/recipes/tomato-soup.jpg': 'assets/recipes/tomato-soup.jpg',
      '/recipes/carbonara.jpg': 'assets/recipes/carbonara.jpg',
      '/recipes/buddha-bowl.jpg': 'assets/recipes/buddha-bowl.jpg',
      '/recipes/pancakes.jpg': 'assets/recipes/pancakes.jpg',
      '/recipes/salmon.jpg': 'assets/recipes/salmon.jpg',
      '/recipes/tiramisu.jpg': 'assets/recipes/tiramisu.jpg',
    };
    return imageMap[this.recipe.image] || this.recipe.image;
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
    this.isSaved = !this.isSaved;
  }
}
