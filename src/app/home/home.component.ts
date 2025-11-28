import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { CoursService, RecentCourse } from '../../services/cours.service';
import { FooterComponent } from '../shared/footer/footer';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule, DatePipe, FooterComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  isLoggedIn: boolean = false;
  isLoginFormVisible: boolean = false;
  recentCourses: RecentCourse[] = [];
  isLoadingRecentCourses: boolean = true;

  constructor(
    private router: Router, 
    private authService: AuthService,
    private coursService: CoursService
  ) {}

  ngOnInit() {
    // Check if user has a token (even if expired, we'll handle it)
    const token = this.authService.getToken();
    if (token) {
      if (this.authService.isAuthenticated()) {
        console.log('User is authenticated, redirecting to dashboard');
        this.redirectToDashboard();
      } else {
        // Token exists but is expired
        console.log('Token exists but is expired, logging out');
        this.authService.logout();
        // Stay on home page, user can login again
      }
    }

    // Fetch recent courses for guests
    this.fetchRecentCourses();
  }

  private redirectToDashboard() {
    const userRole = this.authService.getUserRole();
    console.log('Redirecting user with role:', userRole);

    if (userRole === 'admin') {
      this.router.navigate(['/admin']);
    } else if (userRole === 'enseignant' || userRole === 'teacher') {
      this.router.navigate(['/teacher']);
    } else if (userRole === 'etudiant' || userRole === 'student') {
      this.router.navigate(['/student']);
    } else {
      console.warn('Unknown user role:', userRole);
      this.router.navigate(['/login']);
    }
  }

  // Navigate to the homepage
  goHome(): void {
    this.router.navigate(['/home']);
  }

  // Navigate to the login page
  goToLogin(): void {
    console.log('Navigating to login...');
    this.router.navigate(['/login']).then(
      (success: boolean) => {
        if (success) {
          console.log('Navigation successful');
        } else {
          console.error('Navigation failed');
        }
      }
    ).catch((err: any) => {
      console.error('Navigation error:', err);
    });
  }

  // Navigate to the register page
  goToRegister(): void {
    this.router.navigate(['/signup']);
  }

  // Logout and return to home
  logout(): void {
    this.isLoggedIn = false;
    this.router.navigate(['/home']);
  }

  // Fetch recent courses for display on home page
  private fetchRecentCourses(): void {
    this.coursService.getRecentCourses().subscribe({
      next: (courses: RecentCourse[]) => {
        this.recentCourses = courses;
        this.isLoadingRecentCourses = false;
      },
      error: (error: any) => {
        console.error('Error fetching recent courses:', error);
        this.isLoadingRecentCourses = false;
      }
    });
  }
}