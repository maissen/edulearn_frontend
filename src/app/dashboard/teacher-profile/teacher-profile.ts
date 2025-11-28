import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ProfileService } from '../../../services/profile.service';
import { EnseignantService, TeacherStats, TeacherCourse } from '../../../services/enseignant.service';
import { QuizService, TeacherTest } from '../../../services/quiz.service';
import { NavbarComponent } from '../../shared/navbar/navbar';
import { FooterComponent } from '../../shared/footer/footer';

// Extend the Profile interface for teacher-specific data
interface TeacherProfile {
  id: number;
  username: string;
  email: string;
  role: string;
  biography?: string;
  totalCoursesCreated: number;
  totalStudentsEnrolled: number;
  averageTestScore: number;
  courses: TeacherCourseFromProfile[];
}

interface TeacherCourseFromProfile {
  id: number;
  titre: string;
  description: string;
  category: string;
  youtube_vd_url: string;
  created_at: string;
  updated_at: string;
  enrolled_students: number;
}

@Component({
  selector: 'app-teacher-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent, FooterComponent],
  templateUrl: './teacher-profile.html',
  styleUrl: './teacher-profile.css'
})
export class TeacherProfileComponent implements OnInit {
  teacherName = '';
  teacherEmail = '';
  showProfileModal = false;
  teacherCourses: TeacherCourseFromProfile[] = [];
  teacherTests: TeacherTest[] = [];

  // Statistics
  stats = {
    totalCoursesCreated: 0,
    totalStudentsEnrolled: 0,
    averageTestScore: 0
  };

  // Form data for editing
  editForm = {
    username: '',
    email: '',
    biography: ''
  };

  constructor(
    private router: Router,
    private authService: AuthService,
    private profileService: ProfileService,
    private enseignantService: EnseignantService,
    private quizService: QuizService
  ) {}

  ngOnInit(): void {
    this.loadTeacherData();
    this.loadTeacherTests();
  }

  loadTeacherData(): void {
    this.profileService.getProfile().subscribe({
      next: (profile: any) => {
        // Cast to TeacherProfile to access teacher-specific fields
        const teacherProfile = profile as TeacherProfile;
        
        this.teacherName = teacherProfile.username || 'Teacher';
        this.teacherEmail = teacherProfile.email || '';
        this.editForm.username = teacherProfile.username || '';
        this.editForm.email = teacherProfile.email || '';
        this.editForm.biography = teacherProfile.biography || '';
        
        // Update stats with profile data
        this.stats.totalCoursesCreated = teacherProfile.totalCoursesCreated || 0;
        this.stats.totalStudentsEnrolled = teacherProfile.totalStudentsEnrolled || 0;
        this.stats.averageTestScore = teacherProfile.averageTestScore || 0;
        
        // Update courses from profile data
        this.teacherCourses = teacherProfile.courses || [];
      },
      error: (error: any) => {
        console.error('Error loading profile:', error);
        const user = this.authService.getUser();
        if (user) {
          this.teacherName = user.username || 'Teacher';
          this.teacherEmail = user.email || '';
          this.editForm.username = user.username || '';
          this.editForm.email = user.email || '';
        }
      }
    });
  }

  loadTeacherTests(): void {
    this.quizService.getTeacherTests().subscribe({
      next: (tests: TeacherTest[]) => {
        // Sort tests by score (highest first) for each test's students
        this.teacherTests = tests.map(test => {
          return {
            ...test,
            students: [...test.students].sort((a, b) => b.score - a.score)
          };
        });
      },
      error: (error: any) => {
        console.error('Error loading teacher tests:', error);
      }
    });
  }

  openUpdateProfileModal(): void {
    // Load current data into form
    this.editForm = {
      username: this.teacherName,
      email: this.teacherEmail,
      biography: this.editForm.biography || ''
    };
    this.showProfileModal = true;
  }

  closeProfileModal(): void {
    this.showProfileModal = false;
    this.editForm = {
      username: '',
      email: '',
      biography: ''
    };
  }

  isProfileFormValid(): boolean {
    return !!(this.editForm.username?.trim());
  }

  saveProfile(): void {
    if (!this.isProfileFormValid()) return;

    // According to API contract, both username and biography can be updated
    const updateData: any = { username: this.editForm.username };
    if (this.editForm.biography !== undefined) {
      updateData.biography = this.editForm.biography;
    }

    this.profileService.updateProfile(updateData).subscribe({
      next: (response: any) => {
        this.teacherName = this.editForm.username;
        // Update local biography
        this.editForm.biography = this.editForm.biography || '';
        this.closeProfileModal();
        alert('Profil mis à jour avec succès !');
      },
      error: (error: any) => {
        console.error('Error updating profile:', error);
        alert('Erreur lors de la mise à jour du profil. Veuillez réessayer.');
      }
    });
  }

  navigateToCourse(courseId: number): void {
    this.router.navigate(['/course', courseId]);
  }

  navigate(url: string): void {
    this.router.navigateByUrl(url);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // Helper methods for displaying test data
  getTestScorePercentage(score: number, total: number): number {
    return total > 0 ? Math.round((score / total) * 100) : 0;
  }

  getScoreClass(score: number, total: number): string {
    const percentage = this.getTestScorePercentage(score, total);
    if (percentage >= 80) return 'excellent';
    if (percentage >= 60) return 'good';
    if (percentage >= 40) return 'average';
    return 'poor';
  }
}