import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cookbook-logo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cookbook-logo.component.html',
  styleUrls: ['./cookbook-logo.component.scss']
})
export class CookBookLogoComponent {
  @Input() className: string = '';
  @Input() size: number = 48;
}
