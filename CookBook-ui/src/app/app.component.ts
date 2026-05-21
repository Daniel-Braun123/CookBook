import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { ThemeService } from './services/theme.service';
import { ColorThemeService } from './services/color-theme.service';
import { ToastComponent } from './components/toast/toast.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { BackToTopComponent } from './components/back-to-top/back-to-top.component';
import { ChatWidgetComponent } from './components/chat-widget/chat-widget.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastComponent, ConfirmDialogComponent, BackToTopComponent, ChatWidgetComponent],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  title = 'CookBook';

  constructor(
    private themeService: ThemeService,
    private colorThemeService: ColorThemeService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.themeService.initializeTheme();
    this.colorThemeService.initialize();

    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event) => {
      if (!event.urlAfterRedirects.includes('#')) {
        window.scrollTo({ top: 0 });
      }
    });
  }
}
