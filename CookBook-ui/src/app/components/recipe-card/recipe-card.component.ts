import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AvatarDisplayComponent } from '../avatar-display/avatar-display.component';
import { Recipe } from '../../models/recipe';
import { RecipeService } from '../../services/recipe.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-recipe-card',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule, AvatarDisplayComponent],
  templateUrl: './recipe-card.component.html',
  styleUrls: ['./recipe-card.component.scss']
})
export class RecipeCardComponent implements OnInit {
  @Input() recipe!: Recipe;
  @Input() className: string = '';

  isSaved = false;
  imageLoaded = false;
  Math = Math;

  constructor(
    private recipeService: RecipeService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isSaved = this.recipe.isSaved || false;
  }

  toggleSaved(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    
    // Check if user is logged in
    if (!this.userService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    
    // TODO: Implement save/unsave recipe functionality
    this.isSaved = !this.isSaved;
  }

  getTotalTime(): number {
    return this.recipe.prepTime + this.recipe.cookTime;
  }
}
