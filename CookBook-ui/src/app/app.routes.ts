import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { guestGuard } from './guards/guest.guard';
import { pendingChangesGuard } from './guards/pending-changes.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/index/index.component').then(m => m.IndexComponent)
  },
  {
    path: 'recipe/:id',
    loadComponent: () => import('./components/recipe-detail/recipe-detail.component').then(m => m.RecipeDetailComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'register',
    loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard]
  },
  {
    path: 'edit-profile',
    loadComponent: () => import('./components/edit-profile/edit-profile.component').then(m => m.EditProfileComponent),
    canActivate: [authGuard],
    canDeactivate: [pendingChangesGuard]
  },
  {
    path: 'categories',
    loadComponent: () => import('./components/categories/categories.component').then(m => m.CategoriesComponent)
  },
  {
    path: 'create-recipe',
    loadComponent: () => import('./components/create-recipe/create-recipe.component').then(m => m.CreateRecipeComponent),
    canActivate: [authGuard]
  },
  {
    path: 'saved',
    loadComponent: () => import('./components/saved-recipes/saved-recipes.component').then(m => m.SavedRecipesComponent)
  },
  {
    path: 'search',
    loadComponent: () => import('./components/search-results/search-results.component').then(m => m.SearchResultsComponent)
  },
  {
    path: 'oauth2/redirect',
    loadComponent: () => import('./components/oauth2-redirect/oauth2-redirect.component').then(m => m.OAuth2RedirectComponent)
  },
  {
    path: 'recipes',
    loadComponent: () => import('./components/all-recipes/all-recipes.component').then(m => m.AllRecipesComponent)
  },
  {
    path: 'my-recipes',
    loadComponent: () => import('./components/my-recipes/my-recipes.component').then(m => m.MyRecipesComponent),
    canActivate: [authGuard]
  },
  {
    path: 'edit-recipe/:id',
    loadComponent: () => import('./components/edit-recipe/edit-recipe.component').then(m => m.EditRecipeComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin',
    loadComponent: () => import('./components/admin/admin.component').then(m => m.AdminComponent),
    canActivate: [authGuard, adminGuard]
  },
  {
    path: '**',
    loadComponent: () => import('./components/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];
