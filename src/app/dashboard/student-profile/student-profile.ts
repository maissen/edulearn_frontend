import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ProfileService } from '../../../services/profile.service';
import { CoursService, Cours } from '../../../services/cours.service';
import { AuthService } from '../../../services/auth.service';
import { NavbarComponent } from '../../shared/navbar/navbar';

interface Course {
  id: number;
  title: string;
  category: string;
  progress: number;
  lastLesson?: string;
  completed: boolean;
  completionDate?: string;
  grade?: number;
  imageUrl: string;
}

@Component({
  selector: 'app-student-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  templateUrl: './student-profile.html',
  styleUrls: ['./student-profile.css']
})
export class StudentProfileComponent implements OnInit {
  studentName = '';
  studentEmail = '';
  initial = '';
  avatarUrl = 'https://i.pravatar.cc/150?u=student';
  overallProgress = 0;
  loading = true;
  errorMessage = '';

  coursesInProgress: Course[] = [];
  completedCourses: Course[] = [];
  recommendedCourses: Course[] = [];
  allCourses: Cours[] = [];

  constructor(
    private router: Router,
    private profileService: ProfileService,
    private coursService: CoursService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadProfile();
    this.loadCourses();
  }

  loadProfile() {
    this.profileService.getProfile().subscribe({
      next: (profile) => {
        this.studentName = profile.username || 'Student';
        this.studentEmail = profile.email || '';
        this.initial = this.studentName.charAt(0).toUpperCase();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.errorMessage = 'Failed to load profile';
        this.loading = false;
        // Fallback to auth service user data
        const user = this.authService.getUser();
        if (user) {
          this.studentName = user.username || 'Student';
          this.studentEmail = user.email || '';
          this.initial = this.studentName.charAt(0).toUpperCase();
        }
      }
    });
  }

  loadCourses() {
    this.coursService.getAllCours().subscribe({
      next: (courses) => {
        this.allCourses = courses;
        // Transform API courses to display format
        this.coursesInProgress = courses.slice(0, 2).map(c => ({
          id: c.id || 0,
          title: c.titre,
          category: 'General',
          progress: Math.floor(Math.random() * 80) + 10, // Mock progress
          completed: false,
          imageUrl: 'https://picsum.photos/300/180?random=8'
        }));
        
        // Mock completed courses (in real app, this would come from API)
        this.completedCourses = courses.slice(2, 3).map(c => ({
          id: c.id || 0,
          title: c.titre,
          category: 'General',
          progress: 100,
          completed: true,
          completionDate: new Date().toLocaleDateString('fr-FR'),
          grade: Math.floor(Math.random() * 20) + 80,
          imageUrl: 'https://picsum.photos/300/180?random=8'
        }));

        // Recommended courses
        this.recommendedCourses = courses.slice(3, 5).map(c => ({
          id: c.id || 0,
          title: c.titre,
          category: 'General',
          progress: 0,
          completed: false,
          imageUrl: 'assets/img11.jpg'
        }));

        // Calculate overall progress
        if (this.coursesInProgress.length > 0) {
          this.overallProgress = Math.round(
            this.coursesInProgress.reduce((sum, c) => sum + c.progress, 0) / this.coursesInProgress.length
          );
        }
      },
      error: (error) => {
        console.error('Error loading courses:', error);
        this.errorMessage = 'Failed to load courses';
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  navigate(url: string) {
    this.router.navigateByUrl(url);
  }

  get userName() {
    return this.studentName;
  }
}