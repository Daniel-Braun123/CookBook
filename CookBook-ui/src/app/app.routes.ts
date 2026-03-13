import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

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
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'profile',
    loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard]
  },
  {
    path: 'edit-profile',
    loadComponent: () => import('./components/edit-profile/edit-profile.component').then(m => m.EditProfileComponent),
    canActivate: [authGuard]
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
    path: 'oauth2/redirect',
    loadComponent: () => import('./components/oauth2-redirect/oauth2-redirect.component').then(m => m.OAuth2RedirectComponent)
  },
  {
    path: '**',
    loadComponent: () => import('./components/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];
