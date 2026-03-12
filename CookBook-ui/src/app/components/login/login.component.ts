import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CookBookLogoComponent } from '../../components/cookbook-logo/cookbook-logo.component';
import { UserService } from '../../services/user.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CookBookLogoComponent, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatCheckboxModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email = '';
  password = '';
  showPassword = false;
  isLoading = false;
  errors: { email?: string; password?: string } = {};

  constructor(
    private userService: UserService,
    private router: Router,
    private toastService: ToastService
  ) {}

  validate(): boolean {
    const newErrors: { email?: string; password?: string } = {};
    
    if (!this.email) {
      newErrors.email = 'E-Mail ist erforderlich';
    } else if (!/\S+@\S+\.\S+/.test(this.email)) {
      newErrors.email = 'Ungültige E-Mail-Adresse';
    }
    
    if (!this.password) {
      newErrors.password = 'Passwort ist erforderlich';
    } else if (this.password.length < 8) {
      newErrors.password = 'Passwort muss mindestens 8 Zeichen haben';
    }
    
    this.errors = newErrors;
    return Object.keys(newErrors).length === 0;
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    
    if (!this.validate()) return;
    
    this.isLoading = true;
    
    this.userService.login(this.email, this.password).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.toastService.showSuccess('Erfolgreich eingeloggt! Willkommen zurück! 👋');
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 800);
      },
      error: (error) => {
        this.isLoading = false;
        if (error.status === 401) {
          this.toastService.showError('Ungültige E-Mail oder Passwort');
        } else {
          this.toastService.showError('Login fehlgeschlagen. Bitte versuche es später erneut.');
        }
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  signInWithGoogle(): void {
    // Redirect to backend OAuth2 authorization endpoint
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  }
}
