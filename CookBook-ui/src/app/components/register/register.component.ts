import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CookBookLogoComponent } from '../../components/cookbook-logo/cookbook-logo.component';
import { UserService } from '../../services/user.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CookBookLogoComponent],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  showPassword = false;
  isLoading = false;
  errors: Record<string, string> = {};

  constructor(
    private userService: UserService,
    private router: Router,
    private toastService: ToastService
  ) {}

  validate(): boolean {
    const newErrors: Record<string, string> = {};
    
    if (!this.name) {
      newErrors['name'] = 'Name ist erforderlich';
    }
    
    if (!this.email) {
      newErrors['email'] = 'E-Mail ist erforderlich';
    } else if (!/\S+@\S+\.\S+/.test(this.email)) {
      newErrors['email'] = 'Ungültige E-Mail-Adresse';
    }
    
    if (!this.password) {
      newErrors['password'] = 'Passwort ist erforderlich';
    } else if (this.password.length < 8) {
      newErrors['password'] = 'Passwort muss mindestens 8 Zeichen haben';
    } else if (!/[A-Z]/.test(this.password)) {
      newErrors['password'] = 'Passwort muss einen Großbuchstaben enthalten';
    } else if (!/[0-9]/.test(this.password)) {
      newErrors['password'] = 'Passwort muss eine Zahl enthalten';
    }
    
    if (this.password !== this.confirmPassword) {
      newErrors['confirmPassword'] = 'Passwörter stimmen nicht überein';
    }
    
    this.errors = newErrors;
    return Object.keys(newErrors).length === 0;
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    
    if (!this.validate()) return;
    
    this.isLoading = true;
    
    this.userService.register(this.name, this.email, this.password).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.toastService.showSuccess('Registrierung erfolgreich! Willkommen bei CookBook! 🎉');
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 1000);
      },
      error: (error) => {
        this.isLoading = false;
        if (error.status === 409) {
          this.toastService.showError('Diese E-Mail-Adresse ist bereits registriert');
        } else {
          this.toastService.showError('Registrierung fehlgeschlagen. Bitte versuche es später erneut.');
        }
      }
    });
  }

  getPasswordRequirements() {
    return [
      { met: this.password.length >= 8, text: 'Mindestens 8 Zeichen' },
      { met: /[A-Z]/.test(this.password), text: 'Ein Großbuchstabe' },
      { met: /[0-9]/.test(this.password), text: 'Eine Zahl' },
    ];
  }

  signInWithGoogle(): void {
    // Redirect to backend OAuth2 authorization endpoint
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  }
}
