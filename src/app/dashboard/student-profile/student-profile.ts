import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ProfileService } from '../../../services/profile.service';
import { CoursService, Cours } from '../../../services/cours.service';
import { EtudiantService, QuizResult } from '../../../services/etudiant.service';
import { AuthService } from '../../../services/auth.service';
import { NavbarComponent } from '../../shared/navbar/navbar';
import { LogoComponent } from '../../shared/logo/logo.component';

interface InProgressCourse {
  enrollment_id: number;
  progress_percentage: number;
  started_at: string;
  updated_at: string;
  id: number;
  titre: string;
  description: string;
  category: string;
  teacher_username: string;
}

interface CompletedCourse {
  enrollment_id: number;
  progress_percentage: number;
  started_at: string;
  completed_at: string;
  updated_at: string;
  id: number;
  titre: string;
  description: string;
  category: string;
  teacher_username: string;
}

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
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent, LogoComponent],
  templateUrl: './student-profile.html',
  styleUrls: ['./student-profile.css']
})
export class StudentProfileComponent implements OnInit {
  studentName = '';
  studentEmail = '';
  initial = '';
  avatarUrl = 'https://i.pravatar.cc/150?u=student';
  loading = true;
  errorMessage = '';
  showProfileModal = false;

  // Make Math available in templates
  Math = Math;

  // Form data for editing
  editForm = {
    username: '',
    email: '',
    biography: ''
  };

  coursesInProgress: InProgressCourse[] = [];
  completedCourses: CompletedCourse[] = [];
  quizResults: QuizResult[] = [];
  allCourses: Cours[] = [];

  constructor(
    private router: Router,
    private profileService: ProfileService,
    private coursService: CoursService,
    private etudiantService: EtudiantService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadProfile();
    this.loadInProgressCourses();
    this.loadCompletedCourses();
    this.loadQuizResults();
  }

  loadProfile() {
    this.profileService.getProfile().subscribe({
      next: (profile) => {
        this.studentName = profile.username || 'Student';
        this.studentEmail = profile.email || '';
        this.editForm.username = profile.username || '';
        this.editForm.email = profile.email || '';
        this.editForm.biography = profile.biography || '';
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
          this.editForm.username = user.username || '';
          this.editForm.email = user.email || '';
          this.initial = this.studentName.charAt(0).toUpperCase();
        }
      }
    });
  }

  loadInProgressCourses() {
    this.etudiantService.getInProgressCourses().subscribe({
      next: (courses) => {
        this.coursesInProgress = courses;
      },
      error: (error) => {
        console.error('Error loading in-progress courses:', error);
        this.coursesInProgress = [];
      }
    });
  }

  loadCompletedCourses() {
    this.etudiantService.getCompletedCourses().subscribe({
      next: (courses) => {
        this.completedCourses = courses;
      },
      error: (error) => {
        console.error('Error loading completed courses:', error);
        this.completedCourses = [];
      }
    });
  }

  loadQuizResults() {
    this.etudiantService.getQuizResults().subscribe({
      next: (results) => {
        this.quizResults = results;
      },
      error: (error) => {
        console.error('Error loading quiz results:', error);
        this.quizResults = [];
      }
    });
  }


  openUpdateProfileModal() {
    // Load current data into form
    this.editForm = {
      username: this.studentName,
      email: this.studentEmail,
      biography: this.editForm.biography || ''
    };
    this.showProfileModal = true;
  }

  closeProfileModal() {
    this.showProfileModal = false;
    this.editForm = {
      username: '',
      email: '',
      biography: ''
    };
  }

  isProfileFormValid(): boolean {
    return !!this.editForm.username?.trim();
  }

  saveProfile() {
    if (!this.isProfileFormValid()) return;

    // According to API contract, both username and biography can be updated
    const updateData: any = { username: this.editForm.username };
    if (this.editForm.biography !== undefined) {
      updateData.biography = this.editForm.biography;
    }

    this.profileService.updateProfile(updateData).subscribe({
      next: (response: any) => {
        this.studentName = this.editForm.username;
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

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  openCourse(courseId: number) {
    this.router.navigate(['/course', courseId]);
  }

  onImageError(event: any): void {
    // Fallback to a default image if the image fails to load
    event.target.src = 'https://picsum.photos/300/180?random=999';
  }

  navigate(url: string) {
    this.router.navigateByUrl(url);
  }

  get userName() {
    return this.studentName;
  }
}