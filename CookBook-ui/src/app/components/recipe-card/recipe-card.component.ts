import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Recipe } from '../../models/recipe';
import { RecipeService } from '../../services/recipe.service';

@Component({
  selector: 'app-recipe-card',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule],
  templateUrl: './recipe-card.component.html',
  styleUrls: ['./recipe-card.component.scss']
})
export class RecipeCardComponent {
  @Input() recipe!: Recipe;
  @Input() className: string = '';

  isSaved = false;
  imageLoaded = false;
  Math = Math;

  constructor(private recipeService: RecipeService) {}

  ngOnInit() {
    this.isSaved = this.recipe.isSaved || false;
  }

  toggleSaved(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    
    this.recipeService.toggleSaveRecipe(this.recipe.id).subscribe(saved => {
      this.isSaved = saved;
    });
  }

  getTotalTime(): number {
    return this.recipe.prepTime + this.recipe.cookTime;
  }

  getImageUrl(): string {
    // Image mapping for local images
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
}
