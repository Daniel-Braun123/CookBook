import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TokenStorageService } from '../../services/token-storage.service';
import { UserService } from '../../services/user.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-oauth2-redirect',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-background">
      <div class="text-center">
        <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
        <p class="mt-4 text-muted-foreground">Anmeldung wird verarbeitet...</p>
      </div>
    </div>
  `
})
export class OAuth2RedirectComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tokenStorage: TokenStorageService,
    private userService: UserService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      const error = params['error'];

      if (token) {
        this.tokenStorage.saveToken(token);
        
        // Load current user from backend and set in service
        this.userService.loadAndSetCurrentUser().subscribe({
          next: (user) => {
            this.toastService.showSuccess('Erfolgreich mit Google angemeldet! Willkommen! 🎉');
            setTimeout(() => {
              this.router.navigate(['/']);
            }, 500);
          },
          error: (err) => {
            console.error('Failed to load user after OAuth2 login', err);
            this.tokenStorage.removeToken();
            this.toastService.showError('Fehler beim Laden der Benutzerdaten. Bitte versuche es erneut.');
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 2000);
          }
        });
      } else if (error) {
        // Show error toast
        let errorMsg = 'Die Anmeldung mit Google ist fehlgeschlagen. Bitte versuche es erneut.';
        
        if (error === 'user_extraction_failed') {
          errorMsg = 'Fehler beim Abrufen der Benutzerdaten von Google.';
        } else if (error === 'missing_user_info') {
          errorMsg = 'Google hat nicht alle benötigten Informationen bereitgestellt.';
        }
        
        this.toastService.showError(errorMsg);
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      } else {
        this.router.navigate(['/login']);
      }
    });
  }
}
