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

  // Student quiz taking state
  showQuizTakingModal = false;
  currentQuestionIndex = 0;
  selectedAnswers: { [questionId: string]: string } = {};
  quizQuestions: any[] = [];
  quizSubmissionResult: any = null;

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

  get hasDescription(): boolean {
    return !!(this.course?.description && this.course.description.trim());
  }

  getTotalQuestions(): number {
    // For now, assuming each quiz has 4 questions (a, b, c, d options)
    // In a real implementation, this would come from the questions API
    return this.quizzes.length * 4;
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
        console.log('Course content loaded:', courseContent); // Debug log
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
        console.log('Course description:', this.course.description); // Debug log

        // Convert YouTube URL to embed format if needed
        const embedUrl = this.convertToEmbedUrl(this.course.videoUrl);
        this.safeVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
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
            // For teachers, we show quiz management interface
            // For students, we prepare quiz data for taking
            this.course.quizzes = quizzes.map(quiz => ({
              id: quiz.id,
              question: quiz.titre,
              options: ['Loading questions...'], // Will be replaced when questions are loaded
              correctAnswer: 0
            }));

            // Load questions for each quiz
            this.loadQuizQuestions(quizzes);
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

  loadQuizQuestions(quizzes: any[]) {
    // Load questions for all quizzes in this course
    const questionPromises = quizzes.map(quiz =>
      this.questionService.getQuestionsByQuiz(quiz.id).toPromise()
    );

    Promise.all(questionPromises).then((questionsArrays) => {
      // Flatten all questions from all quizzes
      this.quizQuestions = questionsArrays.flat().map((q: any) => ({
        id: q.id,
        quiz_id: q.quiz_id,
        question: q.question,
        options: [
          { key: 'a', text: q.option_a, value: 'a' },
          { key: 'b', text: q.option_b, value: 'b' },
          { key: 'c', text: q.option_c, value: 'c' },
          { key: 'd', text: q.option_d, value: 'd' }
        ],
        correct: q.correct
      }));
      console.log('Loaded quiz questions:', this.quizQuestions);
    }).catch((error) => {
      console.error('Error loading quiz questions:', error);
      this.quizQuestions = [];
    });
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

  // Student Quiz Taking Methods
  startQuiz() {
    if (this.quizQuestions.length === 0) {
      alert('No questions available for this quiz. Please try again later.');
      return;
    }

    this.currentQuestionIndex = 0;
    this.selectedAnswers = {};
    this.quizSubmissionResult = null;
    this.showQuizTakingModal = true;
  }

  closeQuizTakingModal() {
    this.showQuizTakingModal = false;
    this.currentQuestionIndex = 0;
    this.selectedAnswers = {};
    this.quizSubmissionResult = null;
  }

  selectAnswer(questionId: string, answer: string) {
    this.selectedAnswers[questionId] = answer;
  }

  getCurrentQuestion() {
    return this.quizQuestions[this.currentQuestionIndex];
  }

  nextQuestion() {
    const currentQuestion = this.getCurrentQuestion();
    if (!currentQuestion || !this.selectedAnswers[currentQuestion.id]) {
      alert('Please select an answer before proceeding.');
      return;
    }

    if (this.currentQuestionIndex < this.quizQuestions.length - 1) {
      this.currentQuestionIndex++;
    } else {
      // Last question, submit quiz
      this.submitQuiz();
    }
  }

  previousQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }

  isLastQuestion(): boolean {
    return this.currentQuestionIndex === this.quizQuestions.length - 1;
  }

  canProceed(): boolean {
    const currentQuestion = this.getCurrentQuestion();
    return currentQuestion && !!this.selectedAnswers[currentQuestion.id];
  }

  submitQuiz() {
    // Check if all questions have answers
    const unanswered = this.quizQuestions.filter(q => !this.selectedAnswers[q.id]);
    if (unanswered.length > 0) {
      alert(`Please answer all questions before submitting. ${unanswered.length} question(s) remaining.`);
      return;
    }

    // Find the quiz ID (assuming all questions belong to the same quiz for now)
    const quizId = this.quizQuestions[0]?.quiz_id;
    if (!quizId) {
      alert('Unable to submit quiz. Quiz ID not found.');
      return;
    }

    // Submit quiz via API
    this.quizService.submitQuiz(quizId, this.selectedAnswers).subscribe({
      next: (result) => {
        this.quizSubmissionResult = result.result;
        console.log('Quiz submitted successfully:', result);
      },
      error: (error) => {
        console.error('Error submitting quiz:', error);
        alert('Failed to submit quiz. Please try again.');
      }
    });
  }

  navigate(url: string) {
    this.router.navigateByUrl(url);
  }

  convertToEmbedUrl(url: string): string {
    if (!url) return '';

    // If it's already an embed URL, return as is
    if (url.includes('youtube.com/embed/') || url.includes('youtu.be/embed/')) {
      return url;
    }

    // Extract video ID from various YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return `https://www.youtube.com/embed/${match[1]}`;
      }
    }

    // If it's not a YouTube URL, return as is (assuming it's already embeddable)
    return url;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}