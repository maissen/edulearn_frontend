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
  imports: [CommonModule, FormsModule, NavbarComponent],
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