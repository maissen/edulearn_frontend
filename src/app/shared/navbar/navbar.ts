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
    // Only load user data if user is authenticated and token is not expired
    if (this.authService.isAuthenticated()) {
      this.profileService.getProfile().subscribe({
        next: (profile) => {
          this.userName = profile.username || '';
          this.userRole = this.authService.getUserRole() || '';
        },
        error: (error) => {
          console.error('Error loading profile:', error);
          // If profile request fails with 401, the token might be invalid/expired
          if (error.status === 401) {
            console.log('Token expired or invalid, logging out...');
            this.authService.logout();
            this.router.navigate(['/login']);
            this.userName = '';
            this.userRole = '';
            return;
          }

          // If profile request fails for other reasons, try to get data from localStorage as fallback
          const user = this.authService.getUser();
          if (user) {
            this.userName = user.username || '';
            this.userRole = user.role || '';
          } else {
            // If no user data available, clear the navbar data
            this.userName = '';
            this.userRole = '';
          }
        }
      });
    } else {
      // Clear navbar data if not authenticated
      this.userName = '';
      this.userRole = '';
    }
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
