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
import { EtudiantService, CourseEnrollmentStatus } from '../../../services/etudiant.service';
import { NavbarComponent } from '../../shared/navbar/navbar';
import { LogoComponent } from '../../shared/logo/logo.component';
import { ExamenService } from '../../../services/examen.service';

interface Quiz {
  id?: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface TestQuestion {
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct: string;
}

interface Test {
  title: string;
  questions: TestQuestion[];
}

interface Course {
  id: number;
  title: string;
  subtitle: string;
  duration: string;
  imageUrl: string;
  videoUrl: string;
  description: string;
  category?: string;
  youtube_vd_url?: string;
  teacher?: {
    name: string;
    email: string;
  };
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
  test?: {
    id: number;
    title: string;
    cours_id: number;
    quizzes: Array<{
      question: string;
      options: {
        a: string;
        b: string;
        c: string;
        d: string;
      };
    }>;
    hasTakenTest?: boolean;
    studentScore?: number | null;
    totalScore?: number | null;
  };
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
  isEnrolled = false;
  enrollmentStatus: CourseEnrollmentStatus | null = null;
  showStartCourseButton = false;
  isCourseCompleted = false; // Add this property to track if course is completed

  // Quiz modal state
  showQuizModal = false;
  editingQuizIndex: number | null = null;
  currentTest: Test = {
    title: '',
    questions: [{
      question: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct: 'a'
    }]
  };

  // Student quiz taking state
  showQuizTakingModal = false;
  currentQuestionIndex = 0;
  selectedAnswers: { [questionId: string]: string } = {};
  quizQuestions: any[] = [];
  quizSubmissionResult: any = null;

  // Test result state
  hasTakenTest = false;
  studentScore: number | null = null;
  totalScore: number | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private coursService: CoursService,
    private quizService: QuizService,
    private questionService: QuestionService,
    private authService: AuthService,
    private enseignantService: EnseignantService,
    private examenService: ExamenService,
    private etudiantService: EtudiantService
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
      // Check enrollment status first
      if (!this.isTeacher) {
        this.checkEnrollmentStatus();
      } else {
        this.loadCourse();
      }
    } else {
      this.errorMessage = 'Course ID not found';
      this.loading = false;
    }
  }

  checkEnrollmentStatus() {
    this.etudiantService.getCourseEnrollmentStatus(this.courseId).subscribe({
      next: (status: CourseEnrollmentStatus) => {
        this.enrollmentStatus = status;
        this.isEnrolled = status.isEnrolled;
        this.showStartCourseButton = !this.isEnrolled;
        // Load course content after checking enrollment
        this.loadCourse();
      },
      error: (error: any) => {
        console.error('Error checking enrollment status:', error);
        // Still load course content even if enrollment check fails
        this.loadCourse();
      }
    });
  }

  loadCourse() {
    this.loading = true;
    this.coursService.getCourseContent(this.courseId).subscribe({
      next: (courseContent: CourseContent) => {
        console.log('Course content loaded:', courseContent); // Debug log
        // Process course content data
        this.course = {
          id: courseContent.id,
          title: courseContent.titre,
          subtitle: `${courseContent.titre}`,
          description: courseContent.description,
          category: courseContent.category,
          youtube_vd_url: courseContent.youtube_vd_url,
          teacher: {
            name: courseContent.teacher_username,
            email: courseContent.teacher_email
          },
          duration: courseContent.duration,
          videoUrl: courseContent.videoUrl,
          imageUrl: courseContent.imageUrl,
          targetAudience: courseContent.targetAudience,
          prerequisites: courseContent.prerequisites,
          learningObjectives: courseContent.learningObjectives,
          instructor: courseContent.instructor,
          relatedCourses: [],
          quizzes: [],
          test: (courseContent as any).test // Include test data from API response
        };
        if (this.course) {
          console.log('Course description:', this.course.description); // Debug log
        }
        // Convert YouTube URL to embed format if needed
        // First check if there's a specific YouTube video URL, otherwise use the general video URL
        const videoUrlToUse = this.course.youtube_vd_url || this.course.videoUrl;
        const embedUrl = this.convertToEmbedUrl(videoUrlToUse);
        this.safeVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);

        // Load quiz data (now part of course content)
        this.loadQuizzes();

        this.loadRelatedCourses();
        
        // Check if student has already taken the test using data from course content
        if (this.course && this.course.test && !this.isTeacher) {
          const test = this.course.test as any;
          console.log('Test data:', test);
          this.hasTakenTest = test.hasTakenTest || false;
          // Handle string to number conversion for studentScore
          const score = test.studentScore;
          this.studentScore = score !== null && score !== undefined ? Number(score) : null;
          this.totalScore = test.totalScore || null;
          console.log('Test result status:', { hasTakenTest: this.hasTakenTest, studentScore: this.studentScore, totalScore: this.totalScore });
        }
        
        // Check if the course is completed
        if (!this.isTeacher) {
          this.checkIfCourseCompleted();
        }
        
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading course:', error);
        this.errorMessage = 'Failed to load course';
        this.loading = false;
      }
    });
  }

  checkIfCourseCompleted() {
    this.etudiantService.getCompletedCourses().subscribe({
      next: (completedCourses: any[]) => {
        // Check if the current course is in the completed courses list
        const isCompleted = completedCourses.some(course => course.id === this.courseId);
        this.isCourseCompleted = isCompleted;
        console.log('Course completed status:', this.isCourseCompleted);
      },
      error: (error: any) => {
        console.error('Error checking completed courses:', error);
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
      error: (error: any) => {
        console.error('Error loading related courses:', error);
        // Fallback to empty array if API fails
        if (this.course) {
          this.course.relatedCourses = [];
        }
      }
    });
  }

  loadQuizzes() {
    // Quiz data is now included in the course content API response
    // No separate API call needed - data comes from this.course.test.quizzes
    if (this.course && this.course.test && this.course.test.quizzes) {
      // Transform the quiz data from course content to our component format
      this.quizQuestions = this.course.test.quizzes.map((q: any, index: number) => ({
        id: index + 1, // Generate sequential IDs
        quiz_id: this.course?.test?.id || this.courseId,
        question: q.question,
        options: [
          { key: 'a', text: q.options.a, value: 'a' },
          { key: 'b', text: q.options.b, value: 'b' },
          { key: 'c', text: q.options.c, value: 'c' },
          { key: 'd', text: q.options.d, value: 'd' }
        ],
        correct: 'a' // Default - actual correct answers will be validated server-side
      }));

      // For teacher interface, create a single quiz object representing the test
      this.course.quizzes = [{
        id: this.course.test.id,
        question: this.course.test.title,
        options: [], // Teachers don't need individual question options in the list view
        correctAnswer: 0
      }];
    } else {
      // No quiz data available
      this.quizQuestions = [];
      if (this.course) {
        this.course.quizzes = [];
      }
    }
  }

  // Quiz Modal Methods
  openAddQuizModal() {
    this.editingQuizIndex = null;
    this.currentTest = {
      title: '',
      questions: [{
        question: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct: 'a'
      }]
    };
    this.showQuizModal = true;
  }

  editQuiz(index: number) {
    // For now, editing is not implemented - teachers would need to delete and recreate
    alert('Editing tests is not currently supported. Please delete and create a new test.');
  }

  closeQuizModal() {
    this.showQuizModal = false;
    this.editingQuizIndex = null;
    this.currentTest = {
      title: '',
      questions: [{
        question: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct: 'a'
      }]
    };
  }

  addQuestion() {
    this.currentTest.questions.push({
      question: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct: 'a'
    });
  }

  removeQuestion(index: number) {
    if (this.currentTest.questions.length > 1) {
      this.currentTest.questions.splice(index, 1);
    }
  }

  isTestFormValid(): boolean {
    return !!(
      this.currentTest.title.trim() &&
      this.currentTest.questions.length > 0 &&
      this.currentTest.questions.every(q =>
        q.question.trim() &&
        q.option_a.trim() &&
        q.option_b.trim() &&
        q.option_c.trim() &&
        q.option_d.trim() &&
        q.correct
      )
    );
  }

  saveQuiz() {
    if (!this.isTestFormValid()) {
      alert('Please fill in all required fields for the test and questions.');
      return;
    }

    if (!this.courseId) {
      alert('Course ID not available.');
      return;
    }

    // Create the test data in the API format
    const testData = {
      titre: this.currentTest.title,
      description: '', // Adding the required description field
      cours_id: this.courseId,
      questions: this.currentTest.questions.map(q => ({
        question: q.question,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        answer: q.correct
      }))
    };

    // Call the QuizService to create the test
    this.quizService.createTest(testData).subscribe({
      next: (result: any) => {
        console.log('Test created successfully:', result);
        alert('Test created successfully!');
        this.closeQuizModal();
        // Reload course data to get the updated test
        this.loadCourse();
      },
      error: (error: any) => {
        console.error('Error creating test:', error);
        alert('Failed to create test. Please try again.');
      }
    });
  }

  deleteQuiz(index: number) {
    // Use the test ID for deletion
    if (!this.course?.test?.id) {
      alert('No test to delete.');
      return;
    }
    if (confirm('Are you sure you want to delete this test? This action cannot be undone.')) {
      this.quizService.deleteTest(this.course.test.id).subscribe({
        next: (res: any) => {
          alert(res.message || 'Test deleted!');
          this.loadCourse();
        },
        error: (err: any) => {
          alert('Failed to delete test.');
        }
      });
    }
  }

  // Student Quiz Taking Methods
  startQuiz() {
    // Prevent starting quiz if student has already taken it
    if (this.hasTakenTest) {
      alert('You have already taken this test. Check your results above.');
      return;
    }
    
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
      // Last question, submit all quizzes (even if just one)
      this.submitAllQuizzes();
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

  /**
   * Submit all course quizzes in a single API call (exam submission).
   * Uses /test/submit endpoint with testID and answer array.
   */
  submitAllQuizzes() {
    if (!this.course || !this.course.test || !this.course.test.quizzes) {
      alert('No quizzes to submit.');
      return;
    }
    // Build submissions[] as required by new /test/submit API
    const submissions: Array<{ quizId: number, answer: string }> = this.quizQuestions.map(q => ({
      quizId: q.id, // Actual question/quiz ID (should be from API)
      answer: this.selectedAnswers[q.id]
    })).filter(s => s.answer); // Only include answered

    if (!submissions.length) {
      alert('Please answer at least one question before submitting.');
      return;
    }

    const testID = this.course.test.id;

    this.examenService.submitTest(testID, submissions).subscribe({
      next: (response: any) => {
        if (response && response.result) {
          this.quizSubmissionResult = response.result;
          // Update test result status
          this.hasTakenTest = true;
          this.studentScore = response.result.score;
          this.totalScore = response.result.maxScore;
        } else if (response && response.error) {
          alert(response.error);
        } else {
          alert('Unexpected/empty response from server.');
        }
      },
      error: (error: any) => {
        let msg = 'Failed to submit test. Please try again.';
        if (error && error.error && error.error.error) {
          msg = error.error.error;
        }
        alert(msg);
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

  startCourse() {
    this.etudiantService.startCourse(this.courseId).subscribe({
      next: (response: { message: string }) => {
        console.log('Course started successfully:', response.message);
        // Hide the start button and show the video
        this.showStartCourseButton = false;
        this.isEnrolled = true;
        // Update enrollment status
        if (this.enrollmentStatus) {
          this.enrollmentStatus.isEnrolled = true;
          this.enrollmentStatus.status = 'in_progress';
        }
      },
      error: (error: any) => {
        console.error('Error starting course:', error);
        alert('Failed to start the course. Please try again.');
      }
    });
  }

  completeCourse() {
    this.etudiantService.completeCourse(this.courseId).subscribe({
      next: (response: { message: string }) => {
        console.log('Course completed successfully:', response.message);
        // Show confetti effect
        this.showConfetti();
        // Update UI to reflect completion
        if (this.enrollmentStatus) {
          this.enrollmentStatus.status = 'completed';
        }
      },
      error: (error: any) => {
        console.error('Error completing course:', error);
        alert('Failed to complete the course. Please try again.');
      }
    });
  }

  showConfetti() {
    // Create confetti container
    const confettiContainer = document.createElement('div');
    confettiContainer.className = 'confetti-container';
    
    // Create confetti pieces
    let confettiHTML = '<div class="confetti">';
    for (let i = 0; i < 150; i++) {
      const color = `hsl(${Math.random() * 360}, 100%, 50%)`;
      const left = Math.random() * 100;
      const delay = Math.random() * 5;
      const size = Math.random() * 10 + 5;
      confettiHTML += `<div class="confetti-piece" style="background: ${color}; left: ${left}%; animation-delay: ${delay}s; width: ${size}px; height: ${size}px;"></div>`;
    }
    confettiHTML += '</div>';
    
    confettiContainer.innerHTML = confettiHTML;
    document.body.appendChild(confettiContainer);
    
    // Remove confetti after animation
    setTimeout(() => {
      if (document.body.contains(confettiContainer)) {
        document.body.removeChild(confettiContainer);
      }
    }, 5000);
  }
}