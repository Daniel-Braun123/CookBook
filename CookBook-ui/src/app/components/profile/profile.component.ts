import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Location } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { UserService } from '../../services/user.service';
import { Observable } from 'rxjs';
import { User } from '../../models/user';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, HeaderComponent, FooterComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  currentUser$: Observable<User | null>;

  constructor(private userService: UserService, private location: Location) {
    this.currentUser$ = this.userService.currentUser$;
  }

  ngOnInit(): void {
    window.scrollTo(0, 0);
  }

  goBack(): void { this.location.back(); }
}
