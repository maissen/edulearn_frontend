import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/navbar/navbar';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  templateUrl: './analytics.html',
  styleUrl: './analytics.css'
})
export class AnalyticsComponent {
  constructor(private router: Router) {}

  logout() {
    // TODO: Implement logout logic
    this.router.navigate(['/login']);
  }
}
