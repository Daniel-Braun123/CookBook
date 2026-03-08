import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AvatarService } from '../../services/avatar.service';
import { AvatarConfig } from '../../models/avatar-config';

@Component({
  selector: 'app-avatar-display',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './avatar-display.component.html',
  styleUrls: ['./avatar-display.component.scss']
})
export class AvatarDisplayComponent implements OnInit {
  @Input() avatarConfig: string | null = null;  // JSON string from database
  @Input() userName: string = '';  // For fallback initial
  @Input() size: number = 50;  // Size in pixels

  avatarSVG: SafeHtml | null = null;
  showFallback: boolean = false;
  initial: string = '';

  constructor(
    private avatarService: AvatarService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.generateAvatar();
  }

  ngOnChanges(): void {
    this.generateAvatar();
  }

  private generateAvatar(): void {
    if (this.avatarConfig) {
      try {
        const config: AvatarConfig = this.avatarService.parseConfig(this.avatarConfig);
        const svg = this.avatarService.generateSVG(config, this.size);
        this.avatarSVG = this.sanitizer.bypassSecurityTrustHtml(svg);
        this.showFallback = false;
      } catch (error) {
        console.error('Error generating avatar:', error);
        this.useFallback();
      }
    } else {
      this.useFallback();
    }
  }

  private useFallback(): void {
    this.showFallback = true;
    this.initial = (this.userName || 'U').charAt(0).toUpperCase();
    this.avatarSVG = null;
  }
}
