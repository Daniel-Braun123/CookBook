import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { AvatarDisplayComponent } from '../avatar-display/avatar-display.component';
import { AvatarBuilderComponent } from '../avatar-builder/avatar-builder.component';
import { UserService } from '../../services/user.service';
import { AvatarService } from '../../services/avatar.service';
import { ToastService } from '../../services/toast.service';
import { Observable, Subject, takeUntil } from 'rxjs';
import { User } from '../../models/user';
import { AvatarConfig } from '../../models/avatar-config';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, HeaderComponent, FooterComponent, AvatarDisplayComponent],
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss']
})
export class EditProfileComponent implements OnInit, OnDestroy {
  currentUser$: Observable<User | null>;
  profileForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  private destroy$ = new Subject<void>();
  private originalUserData: any = null;
  currentAvatarConfig: string | null = null;

  constructor(
    private userService: UserService,
    private avatarService: AvatarService,
    private fb: FormBuilder,
    private router: Router,
    private dialog: MatDialog,
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
          
          this.originalUserData = { ...userData, avatar: user.avatar };
          this.currentAvatarConfig = user.avatar || null;
          this.profileForm.patchValue(userData);
        }
      });
  }

  get hasChanges(): boolean {
    if (!this.originalUserData || !this.profileForm) {
      return false;
    }
    
    const currentValues = this.profileForm.value;
    const avatarChanged = (this.currentAvatarConfig || null) !== (this.originalUserData.avatar || null);
    
    return (
      currentValues.name !== this.originalUserData.name ||
      currentValues.email !== this.originalUserData.email ||
      currentValues.bio !== this.originalUserData.bio ||
      avatarChanged
    );
  }

  onSubmit(): void {
    if (this.profileForm.valid && !this.isLoading) {
      this.isLoading = true;
      this.errorMessage = '';

      const formData = this.profileForm.value;
      
      this.userService.updateProfile(
        formData.name, 
        formData.email, 
        formData.bio,
        this.currentAvatarConfig || undefined
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

  onAvatarChange(): void {
    const currentConfig = this.avatarService.parseConfig(this.currentAvatarConfig);
    
    const dialogRef = this.dialog.open(AvatarBuilderComponent, {
      width: '90vw',
      maxWidth: '1100px',
      data: { config: currentConfig }
    });

    dialogRef.afterClosed().subscribe((result: AvatarConfig | null) => {
      if (result) {
        this.currentAvatarConfig = this.avatarService.stringifyConfig(result);
      }
    });
  }
}
