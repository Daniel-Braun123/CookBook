import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Location } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { RecipeService } from '../../services/recipe.service';
import { UserService } from '../../services/user.service';
import { ToastService } from '../../services/toast.service';
import { Recipe } from '../../models/recipe';
import { filter, take, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-my-recipes',
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderComponent, FooterComponent],
  templateUrl: './my-recipes.component.html',
  styleUrls: ['./my-recipes.component.scss']
})
export class MyRecipesComponent implements OnInit {
  recipes: Recipe[] = [];
  isLoading = true;
  recipeToDelete: Recipe | null = null;

  constructor(
    private recipeService: RecipeService,
    private userService: UserService,
    private location: Location,
    private toastService: ToastService,
    private router: Router
  ) {}

  goBack(): void { this.location.back(); }

  ngOnInit(): void {
    this.userService.getCurrentUser().pipe(
      filter(user => user !== null),
      take(1),
      switchMap(user => this.recipeService.getMyRecipes(user!.id))
    ).subscribe({
      next: recipes => {
        this.recipes = recipes;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  deleteRecipe(recipe: Recipe): void {
    const currentUser = this.userService.getCurrentUserSnapshot();
    if (recipe.author.id !== currentUser?.id) return;
    this.recipeToDelete = recipe;
  }

  confirmDelete(): void {
    if (!this.recipeToDelete) return;
    const recipe = this.recipeToDelete;
    this.recipeToDelete = null;
    this.recipeService.deleteRecipe(recipe.id).subscribe({
      next: () => {
        this.recipes = this.recipes.filter(r => r.id !== recipe.id);
        this.toastService.showSuccess('Rezept erfolgreich gelöscht.');
      },
      error: () => {
        this.toastService.showError('Rezept konnte nicht gelöscht werden.');
      }
    });
  }

  cancelDelete(): void {
    this.recipeToDelete = null;
  }

  editRecipe(recipe: Recipe): void {
    this.router.navigate(['/edit-recipe', recipe.id]);
  }
}
