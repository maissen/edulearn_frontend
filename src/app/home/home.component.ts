import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  isLoggedIn: boolean = false;
  isLoginFormVisible: boolean = false;

  constructor(private router: Router) {}

  // Navigate to the homepage
  goHome(): void {
    this.router.navigate(['/home']);
  }

  // Navigate to the login page
  goToLogin(): void {
    console.log('Navigating to login...');
    this.router.navigate(['/login']).then(
      (success) => {
        if (success) {
          console.log('Navigation successful');
        } else {
          console.error('Navigation failed');
        }
      }
    ).catch(err => {
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
}