import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { ProfileService } from '../../../services/profile.service';
import { CoursService, Cours } from '../../../services/cours.service';
import { EnseignantService, TeacherStats } from '../../../services/enseignant.service';
import { NavbarComponent } from '../../shared/navbar/navbar';
import { LogoComponent } from '../../shared/logo/logo.component';
import { FooterComponent } from '../../shared/footer/footer';

@Component({
  selector: 'app-teacher',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, LogoComponent, FooterComponent],
  templateUrl: './teacher.html',
  styleUrl: './teacher.css'
})
export class Teacher implements OnInit {
  userName = 'Teacher';
  courses: Cours[] = [];
  stats = {
    totalEnrollments: 0,
    satisfactionRate: 0,
    activeCourses: 0,
    averageRating: 0
  };
  loading = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private profileService: ProfileService,
    private coursService: CoursService,
    private enseignantService: EnseignantService
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
    const user = this.authService.getUser();
    if (user && user.id) {
      this.enseignantService.getTeacherStats(user.id).subscribe({
        next: (apiStats: TeacherStats) => {
          this.stats = {
            totalEnrollments: apiStats.totalEnrollments,
            satisfactionRate: apiStats.satisfactionRate,
            activeCourses: apiStats.activeCourses,
            averageRating: apiStats.averageRating
          };
        },
        error: (error) => {
          console.error('Error loading teacher stats:', error);
          // Fallback to basic stats if API fails
          this.stats = {
            totalEnrollments: 0,
            satisfactionRate: 0,
            activeCourses: this.courses.length,
            averageRating: 0
          };
        }
      });
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
