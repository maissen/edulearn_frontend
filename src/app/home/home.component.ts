import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent{
isRegisterVisible: any;
showRegister() {
throw new Error('Method not implemented.');
}
  isLoggedIn: boolean = false;
  isLoginFormVisible: boolean = false;

  constructor(private router: Router) {}

  // Navigate to the homepage
  goHome(): void {
    this.router.navigate(['/home']);
  }

  // Navigate to the login page
  goToLogin(): void {
    this.router.navigate(['/login']);
    this.isLoginFormVisible = true;
  }

  // Navigate to the register page
  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  // Logout and return to home
  logout(): void {
    this.isLoggedIn = false;
    this.router.navigate(['/home']);
  }
}