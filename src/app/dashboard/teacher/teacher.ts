import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-teacher',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './teacher.html',
  styleUrl: './teacher.css'
})
export class Teacher {
  userName = 'Souhir'; // ← Doit être DÉCLARÉ ici

  constructor(
    private router: Router
  ) {}

  logout() { // ← Doit être DÉCLARÉ ici
    localStorage.removeItem('authToken');
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }
}