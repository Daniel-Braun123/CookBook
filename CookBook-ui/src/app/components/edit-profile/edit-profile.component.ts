import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { UserService } from '../../services/user.service';
import { CloudinaryService } from '../../services/cloudinary.service';
import { ToastService } from '../../services/toast.service';
import { Observable, Subject, takeUntil } from 'rxjs';
import { User } from '../../models/user';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HeaderComponent, FooterComponent, MatIconModule],
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss']
})
export class EditProfileComponent implements OnInit, OnDestroy {
  currentUser$: Observable<User | null>;
  profileForm!: FormGroup;
  isLoading = false;
  isUploading = false;
  errorMessage = '';
  selectedFile: File | null = null;
  uploadedImageUrl: string | null = null;
  previewUrl: string | null = null;
  private destroy$ = new Subject<void>();
  private originalUserData: any = null;

  constructor(
    private userService: UserService,
    private cloudinaryService: CloudinaryService,
    private fb: FormBuilder,
    private router: Router,
    private toastService: ToastService
  ) {
    this.currentUser$ = this.userService.currentUser$;
  }

  ngOnInit(): void {
    this.initializeForm();
    this.loadUserData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      bio: ['', [Validators.maxLength(500)]]
    });
  }

  private loadUserData(): void {
    this.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        if (user) {
          const userData = {
            name: user.name || '',
            email: user.email || '',
            bio: user.bio || ''
          };
          
          this.originalUserData = { ...userData };
          this.profileForm.patchValue(userData);
        }
      });
  }

  get hasChanges(): boolean {
    if (!this.originalUserData || !this.profileForm) {
      return false;
    }
    
    const currentValues = this.profileForm.value;
    
    return (
      currentValues.name !== this.originalUserData.name ||
      currentValues.email !== this.originalUserData.email ||
      currentValues.bio !== this.originalUserData.bio ||
      this.uploadedImageUrl !== null
    );
  }

  onSubmit(): void {
    if (this.profileForm.valid && !this.isLoading && !this.isUploading) {
      this.isLoading = true;
      this.errorMessage = '';

      const formData = this.profileForm.value;
      
      // Use uploaded image URL if available, otherwise keep current profilePicture
      const profilePictureUrl = this.uploadedImageUrl || undefined;
      
      this.userService.updateProfile(
        formData.name, 
        formData.email, 
        formData.bio,
        profilePictureUrl
      )
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.isLoading = false;
            this.toastService.showSuccess('Profil erfolgreich aktualisiert! ✨');
            setTimeout(() => {
              this.router.navigate(['/profile']);
            }, 1000);
          },
          error: (error) => {
            this.isLoading = false;
            this.errorMessage = error.error?.message || 'Fehler beim Aktualisieren des Profils';
            this.toastService.showError('Fehler beim Aktualisieren des Profils');
          }
        });
    }
  }

  onCancel(): void {
    this.router.navigate(['/profile']);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Validate file
      const validation = this.cloudinaryService.validateImage(file);
      if (!validation.valid) {
        this.toastService.showError(validation.error || 'Ungültige Datei');
        input.value = ''; // Reset input
        return;
      }
      
      this.selectedFile = file;
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrl = e.target?.result as string;
      };
      reader.readAsDataURL(file);
      
      this.toastService.showSuccess(`${file.name} ausgewählt. Klicke auf "Hochladen" um fortzufahren.`);
    }
  }

  onUploadImage(): void {
    if (!this.selectedFile) return;
    
    this.isUploading = true;
    
    this.cloudinaryService.uploadImage(this.selectedFile)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (imageUrl) => {
          this.isUploading = false;
          this.uploadedImageUrl = imageUrl;
          this.selectedFile = null;
          this.toastService.showSuccess('Bild erfolgreich hochgeladen! 🎉');
        },
        error: (error) => {
          this.isUploading = false;
          this.toastService.showError(error.message || 'Upload fehlgeschlagen');
        }
      });
  }

  getDisplayImageUrl(user: User): string {
    // Priority: 1. Uploaded image, 2. Current profile picture, 3. Fallback
    if (this.uploadedImageUrl) {
      return this.uploadedImageUrl;
    }
    if (this.previewUrl) {
      return this.previewUrl;
    }
    return user.profilePicture || 'assets/fallbackProfilePicture.png';
  }
}
