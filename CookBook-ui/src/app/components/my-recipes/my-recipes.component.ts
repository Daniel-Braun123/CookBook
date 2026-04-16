import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Location } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { RecipeService } from '../../services/recipe.service';
import { UserService } from '../../services/user.service';
import { ToastService } from '../../services/toast.service';
import { ConfirmDialogService } from '../../services/confirm-dialog.service';
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

  constructor(
    private recipeService: RecipeService,
    private userService: UserService,
    private location: Location,
    private toastService: ToastService,
    private confirmDialog: ConfirmDialogService,
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

  async deleteRecipe(recipe: Recipe): Promise<void> {
    const currentUser = this.userService.getCurrentUserSnapshot();
    if (recipe.author.id !== currentUser?.id) return;

    const ok = await this.confirmDialog.confirm({
      message: `"${recipe.title}" wird unwiderruflich gelöscht.`,
    });
    if (!ok) return;

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

  editRecipe(recipe: Recipe): void {
    this.router.navigate(['/edit-recipe', recipe.id]);
  }
}
