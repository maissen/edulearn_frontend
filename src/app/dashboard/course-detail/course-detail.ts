import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CoursService, CourseContent, RelatedCourse } from '../../../services/cours.service';
import { QuizService } from '../../../services/quiz.service';
import { QuestionService, Question } from '../../../services/question.service';
import { AuthService } from '../../../services/auth.service';
import { EnseignantService } from '../../../services/enseignant.service';
import { NavbarComponent } from '../../shared/navbar/navbar';
import { LogoComponent } from '../../shared/logo/logo.component';
interface Quiz {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface Course {
  id: number;
  title: string;
  subtitle: string;
  duration: string;
  imageUrl: string;
  videoUrl: string;
  description: string;
  targetAudience: string;
  prerequisites: string;
  learningObjectives: string[];
  instructor: {
    name: string;
    avatarUrl: string;
    bio: string;
    rating: number;
  };
  relatedCourses: RelatedCourse[];
  quizzes: Quiz[];
}

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, LogoComponent],
  templateUrl: './course-detail.html',
  styleUrls: ['./course-detail.css']
})
export class CourseDetailComponent implements OnInit {
  safeVideoUrl: SafeResourceUrl;

  course: Course | null = null;
  loading = true;
  errorMessage = '';
  courseId: number = 0;
  userName = '';
  isTeacher = false;

  // Quiz modal state
  showQuizModal = false;
  editingQuizIndex: number | null = null;
  currentQuiz: Quiz = {
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private coursService: CoursService,
    private quizService: QuizService,
    private questionService: QuestionService,
    private authService: AuthService,
    private enseignantService: EnseignantService
  ) {
    this.safeVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl('');
    const user = this.authService.getUser();
    if (user) {
      this.userName = user.username || 'User';
      this.isTeacher = this.authService.isTeacher();
    }
  }

  // Safe getters for template
  get quizzes() {
    return this.course?.quizzes || [];
  }

  get instructor() {
    return this.course?.instructor || { name: 'Instructor', avatarUrl: 'https://i.pravatar.cc/150?u=instructor', bio: 'Experienced educator.', rating: 4.8 };
  }

  get relatedCourses() {
    return this.course?.relatedCourses || [];
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.courseId = parseInt(id, 10);
      this.loadCourse();
      this.loadQuizzes();
    } else {
      this.errorMessage = 'Course ID not found';
      this.loading = false;
    }
  }

  loadCourse() {
    this.loading = true;
    this.coursService.getCourseContent(this.courseId).subscribe({
      next: (courseContent: CourseContent) => {
        // Transform API course content to display format
        this.course = {
          id: courseContent.id,
          title: courseContent.titre,
          subtitle: `Learn ${courseContent.titre} — from basics to expert level.`,
          duration: courseContent.duration,
          imageUrl: courseContent.imageUrl,
          videoUrl: courseContent.videoUrl,
          description: courseContent.description,
          targetAudience: courseContent.targetAudience,
          prerequisites: courseContent.prerequisites,
          learningObjectives: courseContent.learningObjectives,
          instructor: courseContent.instructor,
          relatedCourses: [],
          quizzes: []
        };
        this.safeVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.course.videoUrl);
        this.loadRelatedCourses();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading course:', error);
        this.errorMessage = 'Failed to load course';
        this.loading = false;
      }
    });
  }

  loadRelatedCourses() {
    this.coursService.getRelatedCourses(this.courseId).subscribe({
      next: (relatedCourses: RelatedCourse[]) => {
        if (this.course) {
          this.course.relatedCourses = relatedCourses;
        }
      },
      error: (error) => {
        console.error('Error loading related courses:', error);
        // Fallback to empty array if API fails
        if (this.course) {
          this.course.relatedCourses = [];
        }
      }
    });
  }

  loadQuizzes() {
    if (this.courseId) {
      this.quizService.getQuizzesByCourse(this.courseId).subscribe({
        next: (quizzes) => {
          if (this.course) {
            // Transform API quizzes to component format
            this.course.quizzes = quizzes.map(quiz => ({
              question: quiz.titre, // Assuming titre contains the question
              options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'], // This should come from questions API
              correctAnswer: 0
            }));
          }
        },
        error: (error) => {
          console.error('Error loading quizzes:', error);
          if (this.course) {
            this.course.quizzes = [];
          }
        }
      });
    }
  }

  // Quiz Modal Methods
  openAddQuizModal() {
    this.editingQuizIndex = null;
    this.currentQuiz = {
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0
    };
    this.showQuizModal = true;
  }

  editQuiz(index: number) {
    if (this.course && this.course.quizzes[index]) {
      this.editingQuizIndex = index;
      this.currentQuiz = { ...this.course.quizzes[index] };
      this.showQuizModal = true;
    }
  }

  closeQuizModal() {
    this.showQuizModal = false;
    this.editingQuizIndex = null;
    this.currentQuiz = {
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0
    };
  }

  addOption() {
    if (this.currentQuiz.options.length < 6) {
      this.currentQuiz.options.push('');
    }
  }

  removeOption(index: number) {
    if (this.currentQuiz.options.length > 2) {
      this.currentQuiz.options.splice(index, 1);
      // Adjust correct answer if it was pointing to a removed option
      if (this.currentQuiz.correctAnswer >= this.currentQuiz.options.length) {
        this.currentQuiz.correctAnswer = this.currentQuiz.options.length - 1;
      }
    }
  }

  isQuizFormValid(): boolean {
    return !!(
      this.currentQuiz.question.trim() &&
      this.currentQuiz.options.every(opt => opt.trim()) &&
      this.currentQuiz.correctAnswer >= 0 &&
      this.currentQuiz.correctAnswer < this.currentQuiz.options.length
    );
  }

  saveQuiz() {
    if (!this.isQuizFormValid()) return;

    if (!this.course) return;

    if (this.editingQuizIndex !== null) {
      // Update existing quiz
      this.course.quizzes[this.editingQuizIndex] = { ...this.currentQuiz };
    } else {
      // Add new quiz
      this.course.quizzes.push({ ...this.currentQuiz });
    }

    // Here you would typically save to the backend
    // For now, we'll just close the modal
    this.closeQuizModal();
  }

  deleteQuiz(index: number) {
    if (confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      if (this.course) {
        this.course.quizzes.splice(index, 1);
      }
    }
  }

  navigate(url: string) {
    this.router.navigateByUrl(url);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}