import { Component, OnInit } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { ProfileService } from '../../../services/profile.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent implements OnInit {
  userName = '';
  userRole = '';
  currentRoute = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private profileService: ProfileService
  ) {}

  ngOnInit() {
    this.loadUserData();
    this.setupRouteTracking();
  }

  loadUserData() {
    this.profileService.getProfile().subscribe({
      next: (profile) => {
        this.userName = profile.username || '';
        this.userRole = this.authService.getUserRole() || '';
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        const user = this.authService.getUser();
        if (user) {
          this.userName = user.username || '';
          this.userRole = user.role || '';
        }
      }
    });
  }

  setupRouteTracking() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.urlAfterRedirects;
      });
    this.currentRoute = this.router.url;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  isStudent(): boolean {
    return this.authService.isStudent();
  }

  isTeacher(): boolean {
    return this.authService.isTeacher();
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

}
