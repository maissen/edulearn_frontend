import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class NoAuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    const isAuthenticated = this.authService.isAuthenticated();
    
    if (isAuthenticated) {
      // Redirect to appropriate dashboard based on user role
      const userRole = this.authService.getUserRole();
      
      if (userRole === 'admin') {
        this.router.navigate(['/admin']);
        return false;
      } else if (userRole === 'enseignant' || userRole === 'teacher') {
        this.router.navigate(['/teacher/profile']);
        return false;
      } else {
        this.router.navigate(['/student']);
        return false;
      }
    }
    
    // Allow access to login/signup if not authenticated
    return true;
  }
}