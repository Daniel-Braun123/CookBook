import { Component, Input, OnInit } from '@angular/core';
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
export class RecipeCardComponent implements OnInit {
  @Input() recipe!: Recipe;
  @Input() className: string = '';

  isSaved = false;
  imageLoaded = false;
  Math = Math;

  constructor(private recipeService: RecipeService) {}

  ngOnInit(): void {
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
    return this.recipeService.getImageUrl(this.recipe.image);
  }
}
