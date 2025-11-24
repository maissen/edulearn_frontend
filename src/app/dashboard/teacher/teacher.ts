import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { ProfileService } from '../../../services/profile.service';
import { CoursService, Cours } from '../../../services/cours.service';
import { NavbarComponent } from '../../shared/navbar/navbar';
import { LogoComponent } from '../../shared/logo/logo.component';

@Component({
  selector: 'app-teacher',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, LogoComponent],
  templateUrl: './teacher.html',
  styleUrl: './teacher.css'
})
export class Teacher implements OnInit {
  userName = 'Teacher';
  courses: Cours[] = [];
  stats = {
    students: 0,
    successRate: 0,
    activeCourses: 0,
    experts: 0
  };
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
    this.loadStats();
  }

  loadUserData() {
    this.profileService.getProfile().subscribe({
      next: (profile) => {
        this.userName = profile.username || 'Teacher';
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        const user = this.authService.getUser();
        if (user) {
          this.userName = user.username || 'Teacher';
        }
      }
    });
  }

  loadCourses() {
    this.loading = true;
    this.coursService.getAllCours().subscribe({
      next: (apiCourses) => {
        // Filter courses by current teacher (if enseignant_id matches)
        const user = this.authService.getUser();
        if (user && user.id) {
          this.courses = apiCourses.filter(c => c.enseignant_id === user.id);
        } else {
          this.courses = apiCourses;
        }
        this.stats.activeCourses = this.courses.length;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading courses:', error);
        this.loading = false;
      }
    });
  }

  loadStats() {
    // Mock stats - in real app, these would come from API
    this.stats = {
      students: 15000,
      successRate: 75,
      activeCourses: this.courses.length,
      experts: 26
    };
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}