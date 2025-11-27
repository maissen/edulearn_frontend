import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CoursService, Cours } from '../../../services/cours.service';
import { AuthService } from '../../../services/auth.service';
import { ProfileService } from '../../../services/profile.service';
import { QuizService, Quiz } from '../../../services/quiz.service';
import { NavbarComponent } from '../../shared/navbar/navbar';
import { FooterComponent } from '../../shared/footer/footer';

interface QuizTemplate {
  id?: number;
  titre?: string; // Add titre property for test name
  question: string;
  options: string[];
  correctAnswer: number | null; // Make correctAnswer nullable
}

interface CourseTemplate {
  id?: number;
  title: string;
  description: string;
  category: string;
  duration: number;
  imageUrl?: string;
  videoUrl?: string;
  quizzes: QuizTemplate[];
}

@Component({
  selector: 'app-manage-courses',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, FooterComponent],
  templateUrl: './manage-courses.html',
  styleUrls: ['./manage-courses.css']
})
export class ManageCoursesComponent implements OnInit {
  userName = '';
  loading = false;
  errorMessage = '';
  successMessage = '';

  // Snackbar notification
  showSnackbar = false;
  snackbarMessage = '';
  snackbarType: 'success' | 'error' = 'success';

  showSnackbarMessage(message: string, type: 'success' | 'error' = 'success'): void {
    this.snackbarMessage = message;
    this.snackbarType = type;
    this.showSnackbar = true;
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      this.showSnackbar = false;
    }, 3000);
  }

  // Mode: 'create' ou 'edit'
  mode: 'create' | 'edit' = 'create';

  // Données du formulaire
  newCourse: Partial<Cours> = {
    titre: '',
    description: '',
    category: '',
    youtube_vd_url: '',
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

  // Course quizzes for editing
  courseQuizzes: Quiz[] = [];

  // Test form visibility
  showTestForm = false;
  showTestNameForm = false; // New property for test name form
  testName = ''; // New property for test name
  currentQuiz: QuizTemplate = {
    titre: '',
    question: '',
    options: ['', '', '', ''],
    correctAnswer: null // Initialize as null
  };

  constructor(
    private router: Router,
    private coursService: CoursService,
    private authService: AuthService,
    private profileService: ProfileService,
    private quizService: QuizService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.loadCourses();
  }

  loadUserData(): void {
    this.profileService.getProfile().subscribe({
      next: (profile: any) => {
        this.userName = profile.username || 'Teacher';
        if (profile.id) {
          this.newCourse.enseignant_id = profile.id;
        }
      },
      error: (error: any) => {
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

  loadCourses(): void {
    this.loading = true;
    this.coursService.getAllCours().subscribe({
      next: (apiCourses: Cours[]) => {
        const user = this.authService.getUser();
        if (user && user.id) {
          // Filter courses by current teacher
          this.courses = apiCourses.filter((c: Cours) => c.enseignant_id === user.id);
        } else {
          this.courses = apiCourses;
        }
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading courses:', error);
        this.errorMessage = 'Failed to load courses';
        this.loading = false;
      }
    });
  }

  // ✅ CREATE/UPDATE
  onCreateCourse(): void {
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
    
    // Validate test name if a test has been started
    if (this.testName?.trim() && !this.currentQuiz.titre) {
      this.errorMessage = 'Please click "Add Question" to create the test or clear the test name field';
      this.isSubmitting = false;
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    console.log('Sending course data to API:', this.newCourse);

    if (this.mode === 'create') {
      this.coursService.createCours(this.newCourse as Cours).subscribe({
        next: (response: any) => {
          this.successMessage = response.message || 'Course created successfully';
          this.showSnackbarMessage('Course has been created successfully!', 'success');
          this.loadCourses();
          this.resetForm();
          this.loading = false;
          this.isSubmitting = false;
        },
        error: (error: any) => {
          console.error('Error creating course:', error);
          this.errorMessage = error.error?.message || 'Failed to create course. Please check your authentication.';
          this.showSnackbarMessage(this.errorMessage, 'error');
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

      this.coursService.updateCours(this.newCourse.id, this.newCourse as Cours).subscribe({
        next: (response: any) => {
          this.successMessage = response.message || 'Course updated successfully';
          this.showSnackbarMessage('Course has been updated successfully!', 'success');
          this.loadCourses();
          this.loading = false;
          this.isSubmitting = false;
        },
        error: (error: any) => {
          console.error('Error updating course:', error);
          this.errorMessage = error.error?.message || 'Failed to update course. Please check your authentication.';
          this.showSnackbarMessage(this.errorMessage, 'error');
          this.loading = false;
          this.isSubmitting = false;
        }
      });
    }
  }

  // ✏️ EDIT (pré-remplissage)
  onEditCourse(course: Cours): void {
    this.newCourse = {
      id: course.id,
      titre: course.titre,
      description: course.description,
      category: course.category,
      youtube_vd_url: course.youtube_vd_url,
      enseignant_id: course.enseignant_id
    };
    // Also update old interface for template compatibility
    this.oldCourse = {
      id: course.id,
      title: course.titre,
      description: course.description,
      category: course.category || 'general',
      duration: 1,
      imageUrl: course.imageUrl || '',
      videoUrl: course.videoUrl || '',
      quizzes: []
    };

    // Load quizzes for this course
    if (course.id) {
      this.loadCourseQuizzes(course.id);
    }

    this.mode = 'edit';
    this.formErrors = {};
    // Scroll to form
    setTimeout(() => {
      document.querySelector('.form-card')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  // 🗑️ DELETE
  onDeleteCourse(courseId: number): void {
    const course = this.courses.find(c => c.id === courseId);
    const courseTitle = course?.titre || 'this course';

    if (confirm(`⚠️ Are you sure you want to delete "${courseTitle}"?\n\nThis action cannot be undone.`)) {
      this.loading = true;
      this.errorMessage = '';
      this.successMessage = '';

      this.coursService.deleteCours(courseId).subscribe({
        next: (response: any) => {
          this.successMessage = response.message || 'Course deleted successfully';
          this.loadCourses();
          if (this.mode === 'edit' && this.newCourse.id === courseId) {
            this.resetForm();
          }
          this.loading = false;
        },
        error: (error: any) => {
          console.error('Error deleting course:', error);
          this.errorMessage = error.error?.message || 'Failed to delete course. Please check your authentication.';
          this.loading = false;
        }
      });
    }
  }

  // 🔄 RÉINITIALISER LE FORMULAIRE
  resetForm(): void {
    this.mode = 'create';
    const user = this.authService.getUser();
    this.newCourse = {
      titre: '',
      description: '',
      category: '',
      youtube_vd_url: '',
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
    this.showTestForm = false;
  }

  // Gestion des quiz (méthodes manquantes)
  addQuiz(): void {
    // Reset the current quiz form
    this.currentQuiz = {
      titre: '',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: null
    };
  }

  removeQuiz(index: number): void {
    if (this.oldCourse.quizzes) {
      this.oldCourse.quizzes.splice(index, 1);
    }
  }

  // New methods for test form handling
  addNewTestForm(): void {
    this.showTestNameForm = true; // Show test name form first
    this.testName = '';
  }

  saveTestName(): void {
    if (this.testName?.trim()) {
      // Set the test name in currentQuiz
      this.currentQuiz.titre = this.testName.trim();
      // Reset the question form fields
      this.currentQuiz.question = '';
      this.currentQuiz.options = ['', '', '', ''];
      this.currentQuiz.correctAnswer = null;
      // Show the question form immediately
      this.showTestForm = true;
    }
  }

  cancelTestNameForm(): void {
    this.showTestNameForm = false;
    this.testName = '';
  }

  cancelTestForm(): void {
    this.showTestForm = false;
    this.showTestNameForm = false; // Also hide test name form
    this.testName = '';
    this.currentQuiz = {
      titre: '',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: null
    };
  }

  saveTestQuestion(): void {
    if (!this.isQuizValid()) return;

    if (!this.oldCourse.quizzes) this.oldCourse.quizzes = [];
    this.oldCourse.quizzes.push({ ...this.currentQuiz });
    this.showTestForm = false;
    this.currentQuiz = {
      titre: this.testName,
      question: '',
      options: ['', '', '', ''],
      correctAnswer: null
    };
  }

  getOptionLetter(index: number): string {
    return String.fromCharCode(65 + index); // A, B, C, D...
  }

  // Quiz Modal Methods
  closeAddQuizModal(): void {
    // Removed reference to showAddQuizModal
    this.currentQuiz = {
      titre: '',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: null
    };
  }

  saveQuiz(): void {
    if (!this.isQuizValid()) return;

    if (!this.oldCourse.quizzes) this.oldCourse.quizzes = [];
    this.oldCourse.quizzes.push({ ...this.currentQuiz });
    // Removed reference to showAddQuizModal
  }

  isQuizValid(): boolean {
    return !!(
      this.currentQuiz.titre?.trim() &&
      this.currentQuiz.question.trim() &&
      this.currentQuiz.options.every(opt => opt.trim()) &&
      this.currentQuiz.correctAnswer !== null && 
      this.currentQuiz.correctAnswer !== undefined &&
      this.currentQuiz.correctAnswer >= 0 &&
      this.currentQuiz.correctAnswer < this.currentQuiz.options.length &&
      this.currentQuiz.options[this.currentQuiz.correctAnswer]?.trim()
    );
  }

  // Load quizzes for a specific course (for editing)
  loadCourseQuizzes(courseId: number): void {
    this.quizService.getTestByCourse(courseId).subscribe({
      next: (test: any) => {
        // handle test/question state
      },
      error: (err: any) => {
        // handle error
      }
    });
  }

  // Delete a quiz with confirmation
  deleteTest(testId: number): void {
    this.quizService.deleteTest(testId).subscribe({
      next: (res: any) => {
        // refresh list, alert
      },
      error: (err: any) => {
        // handle error
      }
    });
  }

  // --- AFFICHAGE ---
  viewCourse(id: number): void {
    this.router.navigate(['/course', id]);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  navigate(url: string): void {
    this.router.navigateByUrl(url);
  }
}