import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { AvatarDisplayComponent } from '../avatar-display/avatar-display.component';
import { UserService } from '../../services/user.service';
import { Observable } from 'rxjs';
import { User } from '../../models/user';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderComponent, FooterComponent, AvatarDisplayComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
  currentUser$: Observable<User | null>;

  constructor(private userService: UserService) {
    this.currentUser$ = this.userService.currentUser$;
  }
}
