import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './services/theme.service';
import { ToastComponent } from './components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastComponent],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  title = 'CookBook';

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    // Initialize theme on app startup
    this.themeService.initializeTheme();
  }
}
