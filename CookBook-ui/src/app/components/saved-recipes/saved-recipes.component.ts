import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { RecipeCardComponent } from '../recipe-card/recipe-card.component';
import { SavedRecipeService } from '../../services/saved-recipe.service';
import { UserService } from '../../services/user.service';
import { Recipe } from '../../models/recipe';

@Component({
  selector: 'app-saved-recipes',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, HeaderComponent, FooterComponent, RecipeCardComponent],
  templateUrl: './saved-recipes.component.html',
  styleUrls: ['./saved-recipes.component.scss']
})
export class SavedRecipesComponent implements OnInit {
  savedRecipes: Recipe[] = [];
  isLoading = true;
  isLoggedIn = false;

  constructor(
    private savedRecipeService: SavedRecipeService,
    private userService: UserService,
    private location: Location
  ) {}

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.isLoggedIn = this.userService.isLoggedIn();
    
    if (this.isLoggedIn) {
      this.loadSavedRecipes();
    } else {
      this.isLoading = false;
    }
  }

  loadSavedRecipes(): void {
    this.isLoading = true;
    this.savedRecipeService.getSavedRecipes().subscribe({
      next: (recipes) => {
        this.savedRecipes = recipes;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load saved recipes', err);
        this.isLoading = false;
      }
    });
  }

  onRecipeUnsaved(): void {
    // Reload saved recipes when a recipe is unsaved
    this.loadSavedRecipes();
  }

  goBack(): void { this.location.back(); }
}
