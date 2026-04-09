import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './services/theme.service';
import { ColorThemeService } from './services/color-theme.service';
import { ToastComponent } from './components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastComponent],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  title = 'CookBook';

  constructor(
    private themeService: ThemeService,
    private colorThemeService: ColorThemeService,
  ) {}

  ngOnInit(): void {
    this.themeService.initializeTheme();
    this.colorThemeService.initialize();
  }
}
