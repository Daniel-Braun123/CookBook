import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { AdminService, AdminUser } from '../../services/admin.service';
import { ToastService } from '../../services/toast.service';
import { ConfirmDialogService } from '../../services/confirm-dialog.service';
import { RecipeService } from '@app/services/recipe.service';
import { Recipe } from '@app/models/recipe';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, HeaderComponent, FooterComponent],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  users: AdminUser[] = [];
  recipes: Recipe[] = [];
  isLoading = true;

  // Collapsible sections
  usersOpen = true;
  recipesOpen = true;

  // Search
  userSearch = '';
  recipeSearch = '';

  // Pagination
  readonly PAGE_SIZE = 5;
  userPage = 0;
  recipePage = 0;

  constructor(
    private adminService: AdminService,
    private recipeService: RecipeService,
    private toastService: ToastService,
    private confirmDialog: ConfirmDialogService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadRecipes();
  }

  // ── Data loading ─────────────────────────────────────────────────────

  loadUsers(): void {
    this.isLoading = true;
    this.adminService.getUsers().subscribe({
      next: (users) => { this.users = users; this.isLoading = false; },
      error: () => { this.toastService.showError('Fehler beim Laden der Nutzer'); this.isLoading = false; }
    });
  }

  loadRecipes(): void {
    this.recipeService.getAllRecipes().subscribe({
      next: (recipes) => { this.recipes = recipes; },
      error: () => { this.toastService.showError('Fehler beim Laden der Rezepte'); }
    });
  }

  // ── Filtered & paginated data ─────────────────────────────────────────

  get filteredUsers(): AdminUser[] {
    const q = this.userSearch.toLowerCase();
    return this.users.filter(u =>
      u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }

  get pagedUsers(): AdminUser[] {
    const start = this.userPage * this.PAGE_SIZE;
    return this.filteredUsers.slice(start, start + this.PAGE_SIZE);
  }

  get userTotalPages(): number {
    return Math.max(1, Math.ceil(this.filteredUsers.length / this.PAGE_SIZE));
  }

  get filteredRecipes(): Recipe[] {
    const q = this.recipeSearch.toLowerCase();
    return this.recipes.filter(r =>
      r.title.toLowerCase().includes(q) || r.author?.name?.toLowerCase().includes(q)
    );
  }

  get pagedRecipes(): Recipe[] {
    const start = this.recipePage * this.PAGE_SIZE;
    return this.filteredRecipes.slice(start, start + this.PAGE_SIZE);
  }

  get recipeTotalPages(): number {
    return Math.max(1, Math.ceil(this.filteredRecipes.length / this.PAGE_SIZE));
  }

  onUserSearchChange(): void { this.userPage = 0; }
  onRecipeSearchChange(): void { this.recipePage = 0; }

  // ── Star rating helper ────────────────────────────────────────────────

  starsArray(rating: number): number[] {
    const full = Math.round(rating ?? 0);
    return Array.from({ length: 5 }, (_, i) => i < full ? 1 : 0);
  }

  // ── Actions ───────────────────────────────────────────────────────────

  toggleRole(user: AdminUser): void {
    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    this.adminService.updateUserRole(user.id, newRole).subscribe({
      next: (updated) => {
        user.role = updated.role;
        this.toastService.showSuccess(`${user.name} ist jetzt ${updated.role}`);
      },
      error: () => { this.toastService.showError('Fehler beim Ändern der Rolle'); }
    });
  }

  async confirmDeleteUser(user: AdminUser): Promise<void> {
    const ok = await this.confirmDialog.confirm({
      message: `Nutzer „${user.name}" wirklich löschen?`,
    });
    if (!ok) return;
    this.adminService.deleteUser(user.id).subscribe({
      next: () => { this.toastService.showSuccess(`${user.name} gelöscht`); this.loadUsers(); },
      error: () => { this.toastService.showError('Fehler beim Löschen'); }
    });
  }

  async confirmDeleteRecipe(recipe: Recipe): Promise<void> {
    const ok = await this.confirmDialog.confirm({
      message: `Rezept „${recipe.title}" wirklich löschen?`,
    });
    if (!ok) return;
    this.adminService.deleteRecipe(recipe.id).subscribe({
      next: () => { this.toastService.showSuccess(`${recipe.title} gelöscht`); this.loadRecipes(); },
      error: () => { this.toastService.showError('Fehler beim Löschen'); }
    });
  }

  viewRecipe(recipeId: string): void {
    this.router.navigate(['/recipe', recipeId]);
  }
}