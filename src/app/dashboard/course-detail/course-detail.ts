import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CoursService } from '../../../services/cours.service';
import { QuizService } from '../../../services/quiz.service';
import { QuestionService, Question } from '../../../services/question.service';
import { AuthService } from '../../../services/auth.service';
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
  instructor: {
    name: string;
    avatarUrl: string;
    bio: string;
    rating: number; // ✅ Ajouté pour résoudre l'erreur NGTSC
  };
  relatedCourses: {
    title: string;
    imageUrl: string;
    price: number;
    rating: number;
  }[];
  quizzes: Quiz[]; // ✅ Nouveau champ pour les quiz
}

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [CommonModule, FormsModule ],
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

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private coursService: CoursService,
    private quizService: QuizService,
    private questionService: QuestionService,
    private authService: AuthService
  ) {
    this.safeVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl('');
    const user = this.authService.getUser();
    if (user) {
      this.userName = user.username || 'User';
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
    this.coursService.getCoursById(this.courseId).subscribe({
      next: (apiCourse) => {
        // Transform API course to display format
        this.course = {
          id: apiCourse.id || 0,
          title: apiCourse.titre,
          subtitle: `Learn ${apiCourse.titre} — from basics to expert level.`,
          duration: '1 hour',
          imageUrl: 'assets/img11.jpg',
          videoUrl: 'https://www.youtube.com/embed/ukzFI9rgwfU',
          description: apiCourse.description || 'No description available.',
          targetAudience: 'Students interested in this subject.',
          prerequisites: 'Basic knowledge recommended.',
          instructor: {
            name: 'Instructor',
            avatarUrl: 'https://i.pravatar.cc/150?u=instructor',
            bio: 'Experienced educator.',
            rating: 4.8
          },
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
    this.coursService.getAllCours().subscribe({
      next: (courses) => {
        if (this.course) {
          // Get 3 random related courses (excluding current)
          const related = courses
            .filter(c => c.id !== this.courseId)
            .slice(0, 3)
            .map(c => ({
              title: c.titre,
              imageUrl: 'assets/img5.jpg',
              price: Math.floor(Math.random() * 50) + 50,
              rating: 4.5 + Math.random() * 0.5
            }));
          if (this.course) {
            this.course.relatedCourses = related;
          }
        }
      },
      error: (error) => {
        console.error('Error loading related courses:', error);
      }
    });
  }

  loadQuizzes() {
    // Quizzes will be loaded separately using QuizService
    // For now, using empty array
  }


  navigate(url: string) {
    this.router.navigateByUrl(url);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}