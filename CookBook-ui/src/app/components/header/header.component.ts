import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CookBookLogoComponent } from '../cookbook-logo/cookbook-logo.component';
import { SearchOverlayComponent } from '../search-overlay/search-overlay.component';
import { ThemeService } from '../../services/theme.service';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, CookBookLogoComponent, MatIconModule, MatButtonModule, SearchOverlayComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  isMenuOpen = false;
  isSearchFocused = false;
  isSearchOverlayOpen = false;
  currentUser$: Observable<User | null>;

  constructor(
    public themeService: ThemeService,
    private userService: UserService,
    private router: Router
  ) {
    this.currentUser$ = this.userService.getCurrentUser();
  }

  get isLoggedIn(): boolean {
    return this.userService.isLoggedIn();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  logout(): void {
    this.userService.logout();
    this.router.navigate(['/login']);
  }

  openSearchOverlay(): void {
    this.isSearchOverlayOpen = true;
  }

  closeSearchOverlay(): void {
    this.isSearchOverlayOpen = false;
  }
}
