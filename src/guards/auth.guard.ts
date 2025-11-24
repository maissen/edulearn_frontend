import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    console.log('AuthGuard.canActivate() called for route');
    const isAuthenticated = this.authService.isAuthenticated();
    console.log('AuthGuard result:', isAuthenticated ? 'ALLOW' : 'REDIRECT TO LOGIN');
    if (isAuthenticated) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}

@Injectable({
  providedIn: 'root'
})
export class TeacherGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.authService.isAuthenticated() && this.authService.isTeacher()) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}
