import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CookBookLogoComponent } from '../cookbook-logo/cookbook-logo.component';
import { ThemeService } from '../../services/theme.service';
import { RecipeService } from '@app/services/recipe.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, CookBookLogoComponent, MatIconModule, MatButtonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit{
  isMenuOpen = false;
  isSearchFocused = false;

  constructor(public themeService: ThemeService, private recipe: RecipeService) {}

  ngOnInit(): void {
  
  }


  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
