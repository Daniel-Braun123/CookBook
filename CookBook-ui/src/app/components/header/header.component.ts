import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CookBookLogoComponent } from '../cookbook-logo/cookbook-logo.component';
import { ThemeService } from '../../services/theme.service';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';
import { Observable } from 'rxjs';

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
  currentUser$: Observable<User | null>;
  isLoggedIn = false;

  constructor(
    public themeService: ThemeService,
    private userService: UserService,
    private router: Router
  ) {
    this.currentUser$ = this.userService.getCurrentUser();
  }

  ngOnInit(): void {
    this.isLoggedIn = this.userService.isLoggedIn();
    this.userService.getCurrentUser().subscribe(user => {
      this.isLoggedIn = user !== null;
    });
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  logout(): void {
    this.userService.logout();
    this.isLoggedIn = false;
    this.router.navigate(['/login']);
  }
}
