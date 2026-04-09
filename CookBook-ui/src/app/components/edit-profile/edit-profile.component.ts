import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { UserService } from '../../services/user.service';
import { CloudinaryService } from '../../services/cloudinary.service';
import { ToastService } from '../../services/toast.service';
import { finalize, Observable, of, Subject, switchMap, take, takeUntil } from 'rxjs';
import { User } from '../../models/user';
import { PendingChangesComponent } from '../../guards/pending-changes.guard';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HeaderComponent, FooterComponent, MatIconModule],
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss']
})
export class EditProfileComponent implements OnInit, OnDestroy, PendingChangesComponent {
  currentUser$: Observable<User | null>;
  profileForm!: FormGroup;
  isLoading = false;
  isUploading = false;
  errorMessage = '';
  selectedFile: File | null = null;
  uploadedImageUrl: string | null = null;
  previewUrl: string | null = null;
  showLeaveConfirmModal = false;
  private destroy$ = new Subject<void>();
  private originalUserData: any = null;
  private isSaving = false;
  private pendingLeaveDecision: Subject<boolean> | null = null;

  constructor(
    private userService: UserService,
    private cloudinaryService: CloudinaryService,
    private fb: FormBuilder,
    private router: Router,
    private location: Location,
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
      this.selectedFile !== null ||
      this.uploadedImageUrl !== null
    );
  }

  canDeactivate(): boolean | Observable<boolean> {
    if (!this.hasChanges || this.isSaving) {
      return true;
    }

    this.showLeaveConfirmModal = true;
    this.pendingLeaveDecision = new Subject<boolean>();
    return this.pendingLeaveDecision.asObservable().pipe(take(1));
  }

  confirmLeaveWithoutSaving(): void {
    this.showLeaveConfirmModal = false;
    this.pendingLeaveDecision?.next(true);
    this.pendingLeaveDecision?.complete();
    this.pendingLeaveDecision = null;
  }

  stayOnEditPage(): void {
    this.showLeaveConfirmModal = false;
    this.pendingLeaveDecision?.next(false);
    this.pendingLeaveDecision?.complete();
    this.pendingLeaveDecision = null;
  }

  onSubmit(): void {
    if (!this.profileForm.valid || this.isLoading || this.isUploading) {
      return;
    }

    this.isLoading = true;
    this.isSaving = true;
    this.errorMessage = '';

    const formData = this.profileForm.value;
    const upload$ = this.selectedFile
      ? this.cloudinaryService.uploadImage(this.selectedFile)
      : of(this.uploadedImageUrl);

    if (this.selectedFile) {
      this.isUploading = true;
    }

    upload$
      .pipe(
        switchMap((imageUrl) => {
          if (imageUrl) {
            this.uploadedImageUrl = imageUrl;
          }

          return this.userService.updateProfile(
            formData.name,
            formData.email,
            formData.bio,
            imageUrl || undefined
          );
        }),
        finalize(() => {
          this.isLoading = false;
          this.isUploading = false;
          this.isSaving = false;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: () => {
          this.selectedFile = null;
          this.previewUrl = null;
          this.uploadedImageUrl = null;
          this.originalUserData = { ...formData };
          this.toastService.showSuccess('Profil erfolgreich aktualisiert! ✨');
          setTimeout(() => {
            this.router.navigate(['/profile']);
          }, 700);
        },
        error: (error) => {
          this.errorMessage = error?.error?.message || error?.message || 'Fehler beim Aktualisieren des Profils';
          this.toastService.showError(this.errorMessage);
        }
      });
  }

  onCancel(): void {
    this.router.navigate(['/profile']);
  }

  goBack(): void {
    this.location.back();
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
      
    }
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
