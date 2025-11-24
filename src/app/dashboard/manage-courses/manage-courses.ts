import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CoursService, Cours } from '../../../services/cours.service';
import { AuthService } from '../../../services/auth.service';
import { ProfileService } from '../../../services/profile.service';
import { NavbarComponent } from '../../shared/navbar/navbar';
import { LogoComponent } from '../../shared/logo/logo.component';

interface Quiz {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface CourseTemplate {
  id?: number;
  title: string;
  description: string;
  category: string;
  duration: number;
  imageUrl?: string;
  videoUrl?: string;
  quizzes: Quiz[];
}

@Component({
  selector: 'app-manage-courses',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, LogoComponent],
  templateUrl: './manage-courses.html',
  styleUrls: ['./manage-courses.css']
})
export class ManageCoursesComponent implements OnInit {
  userName = '';
  loading = false;
  errorMessage = '';
  successMessage = '';

  // Mode: 'create' ou 'edit'
  mode: 'create' | 'edit' = 'create';

  // Données du formulaire
  newCourse: Partial<Cours> = {
    titre: '',
    description: '',
    enseignant_id: 0
  };

  // Template-compatible course data
  oldCourse: CourseTemplate = {
    id: undefined,
    title: '',
    description: '',
    category: '',
    duration: 1,
    imageUrl: '',
    videoUrl: '',
    quizzes: []
  };

  // Form validation
  formErrors: { [key: string]: string } = {};
  isSubmitting = false;

  // Liste des cours
  courses: Cours[] = [];

  constructor(
    private router: Router,
    private coursService: CoursService,
    private authService: AuthService,
    private profileService: ProfileService
  ) {}

  ngOnInit() {
    this.loadUserData();
    this.loadCourses();
  }

  loadUserData() {
    this.profileService.getProfile().subscribe({
      next: (profile) => {
        this.userName = profile.username || 'Teacher';
        if (profile.id) {
          this.newCourse.enseignant_id = profile.id;
        }
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        const user = this.authService.getUser();
        if (user) {
          this.userName = user.username || 'Teacher';
          if (user.id) {
            this.newCourse.enseignant_id = user.id;
          }
        }
      }
    });
  }

  loadCourses() {
    this.loading = true;
    this.coursService.getAllCours().subscribe({
      next: (apiCourses) => {
        const user = this.authService.getUser();
        if (user && user.id) {
          // Filter courses by current teacher
          this.courses = apiCourses.filter(c => c.enseignant_id === user.id);
        } else {
          this.courses = apiCourses;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading courses:', error);
        this.errorMessage = 'Failed to load courses';
        this.loading = false;
      }
    });
  }

  // ✅ CREATE/UPDATE
  onCreateCourse() {
    console.log('onCreateCourse called');
    this.formErrors = {};
    this.isSubmitting = true;

    // Sync form data
    this.newCourse.titre = this.oldCourse.title;
    // Description is already bound to newCourse.description in template

    console.log('Form data:', {
      titre: this.newCourse.titre,
      description: this.newCourse.description,
      enseignant_id: this.newCourse.enseignant_id,
      oldCourse: this.oldCourse
    });

    // Validation
    if (!this.newCourse.titre?.trim()) {
      this.formErrors['title'] = 'Course title is required';
      this.isSubmitting = false;
      return;
    }
    if (!this.newCourse.description?.trim()) {
      this.formErrors['description'] = 'Course description is required';
      this.isSubmitting = false;
      return;
    }
    if (!this.newCourse.enseignant_id) {
      this.errorMessage = 'Teacher ID is required';
      this.isSubmitting = false;
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    console.log('Sending course data to API:', this.newCourse);

    if (this.mode === 'create') {
      this.coursService.createCours(this.newCourse as Cours).subscribe({
        next: (response) => {
          this.successMessage = response.message || 'Course created successfully';
          this.loadCourses();
          this.resetForm();
          this.loading = false;
          this.isSubmitting = false;
        },
        error: (error) => {
          console.error('Error creating course:', error);
          this.errorMessage = error.error?.message || 'Failed to create course. Please check your authentication.';
          this.loading = false;
          this.isSubmitting = false;
        }
      });
    } else {
      // ✅ UPDATE
      if (!this.newCourse.id) {
        this.errorMessage = 'Course ID is required for update';
        this.loading = false;
        this.isSubmitting = false;
        return;
      }
      this.coursService.updateCours(this.newCourse.id, this.newCourse).subscribe({
        next: (response) => {
          this.successMessage = response.message || 'Course updated successfully';
          this.loadCourses();
          this.resetForm();
          this.loading = false;
          this.isSubmitting = false;
        },
        error: (error) => {
          console.error('Error updating course:', error);
          this.errorMessage = error.error?.message || 'Failed to update course. Please check your authentication.';
          this.loading = false;
          this.isSubmitting = false;
        }
      });
    }
  }

  // ✏️ EDIT (pré-remplissage)
  onEditCourse(course: Cours) {
    this.newCourse = {
      id: course.id,
      titre: course.titre,
      description: course.description,
      enseignant_id: course.enseignant_id
    };
    // Also update old interface for template compatibility
    this.oldCourse = {
      id: course.id,
      title: course.titre,
      description: course.description,
      category: 'general',
      duration: 1,
      imageUrl: '',
      videoUrl: '',
      quizzes: []
    };
    this.mode = 'edit';
    this.formErrors = {};
    // Scroll to form
    setTimeout(() => {
      document.querySelector('.form-card')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  // 🗑️ DELETE
  onDeleteCourse(courseId: number) {
    const course = this.courses.find(c => c.id === courseId);
    const courseTitle = course?.titre || 'this course';

    if (confirm(`⚠️ Are you sure you want to delete "${courseTitle}"?\n\nThis action cannot be undone.`)) {
      this.loading = true;
      this.errorMessage = '';
      this.successMessage = '';

      this.coursService.deleteCours(courseId).subscribe({
        next: (response) => {
          this.successMessage = response.message || 'Course deleted successfully';
          this.loadCourses();
          if (this.mode === 'edit' && this.newCourse.id === courseId) {
            this.resetForm();
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error deleting course:', error);
          this.errorMessage = error.error?.message || 'Failed to delete course. Please check your authentication.';
          this.loading = false;
        }
      });
    }
  }

  // 🔄 RÉINITIALISER LE FORMULAIRE
  resetForm() {
    this.mode = 'create';
    const user = this.authService.getUser();
    this.newCourse = {
      titre: '',
      description: '',
      enseignant_id: user?.id || 0
    };
    this.oldCourse = {
      title: '',
      description: '',
      category: '',
      duration: 1,
      imageUrl: '',
      videoUrl: '',
      quizzes: []
    };
    this.formErrors = {};
    this.errorMessage = '';
    this.successMessage = '';
    this.isSubmitting = false;
  }

  // Gestion des quiz (méthodes manquantes)
  addQuiz() {
    if (!this.oldCourse.quizzes) this.oldCourse.quizzes = [];
    this.oldCourse.quizzes.push({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0
    });
  }

  removeQuiz(index: number) {
    if (this.oldCourse.quizzes) {
      this.oldCourse.quizzes.splice(index, 1);
    }
  }

  // --- AFFICHAGE ---
  viewCourse(id: number) {
    this.router.navigate(['/course', id]);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  navigate(url: string) {
    this.router.navigateByUrl(url);
  }
}