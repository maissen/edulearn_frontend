import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { ProfileService } from '../../../services/profile.service';
import { CoursService, Cours } from '../../../services/cours.service';

@Component({
  selector: 'app-student',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './student.html',
  styleUrl: './student.css'
})
export class Student implements OnInit {
  userName = 'Student';
  courses: Cours[] = [];
  loading = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private profileService: ProfileService,
    private coursService: CoursService
  ) {}

  ngOnInit() {
    this.loadUserData();
    this.loadCourses();
  }

  loadUserData() {
    this.profileService.getProfile().subscribe({
      next: (profile) => {
        this.userName = profile.username || 'Student';
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        const user = this.authService.getUser();
        if (user) {
          this.userName = user.username || 'Student';
        }
      }
    });
  }

  loadCourses() {
    this.loading = true;
    this.coursService.getAllCours().subscribe({
      next: (apiCourses) => {
        this.courses = apiCourses;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading courses:', error);
        this.loading = false;
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}