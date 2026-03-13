import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Recipe } from '../../models/recipe';
import { RecipeService } from '../../services/recipe.service';
import { SavedRecipeService } from '../../services/saved-recipe.service';
import { UserService } from '../../services/user.service';
import { ToastService } from '../../services/toast.service';

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
  @Output() recipeUnsaved = new EventEmitter<void>();

  isSaved = false;
  imageLoaded = false;
  Math = Math;

  constructor(
    private recipeService: RecipeService,
    private savedRecipeService: SavedRecipeService,
    private userService: UserService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check if recipe is saved from the service
    if (this.userService.isLoggedIn()) {
      this.isSaved = this.savedRecipeService.isRecipeSaved(Number(this.recipe.id));
    }
  }

  toggleSaved(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    
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
          this.recipeUnsaved.emit();
        }
      },
      error: (err) => {
        console.error('Failed to toggle save recipe', err);
        this.toastService.showError('Fehler beim Speichern');
      }
    });
  }

  getTotalTime(): number {
    return this.recipe.prepTime + this.recipe.cookTime;
  }
}
