import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AvatarConfig, AVATAR_OPTIONS, DEFAULT_AVATAR_CONFIG } from '../../models/avatar-config';
import { AvatarDisplayComponent } from '../avatar-display/avatar-display.component';

@Component({
  selector: 'app-avatar-builder',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    AvatarDisplayComponent
  ],
  templateUrl: './avatar-builder.component.html',
  styleUrls: ['./avatar-builder.component.scss']
})
export class AvatarBuilderComponent {
  config: AvatarConfig;
  options = AVATAR_OPTIONS;

  constructor(
    public dialogRef: MatDialogRef<AvatarBuilderComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { config: AvatarConfig | null }
  ) {
    // Initialize with provided config or default
    this.config = data?.config ? { ...data.config } : { ...DEFAULT_AVATAR_CONFIG };
  }

  get configAsJson(): string {
    return JSON.stringify(this.config);
  }

  onSave(): void {
    this.dialogRef.close(this.config);
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

  selectBackground(value: any): void {
    this.config.backgroundColor = value;
  }

  selectSkinTone(value: any): void {
    this.config.skinTone = value;
  }

  selectHairStyle(value: any): void {
    this.config.hairStyle = value;
  }

  selectHairColor(value: any): void {
    this.config.hairColor = value;
  }

  selectEyeStyle(value: any): void {
    this.config.eyeStyle = value;
  }

  selectMouthStyle(value: any): void {
    this.config.mouthStyle = value;
  }

  selectAccessory(value: any): void {
    this.config.accessory = value;
  }
}
