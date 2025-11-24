import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CoursService, Cours, GroupedCourses } from '../../services/cours.service';
import { EtudiantService, CourseEnrollmentStatus } from '../../services/etudiant.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../shared/navbar/navbar';

interface Course {
  id: number;
  title: string;
  category: string;
  image: string;
  currentLesson: number;
  totalLessons: number;
  rating: number;
  progress: number;
  enrollmentStatus?: CourseEnrollmentStatus;
}

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule, NavbarComponent],
  templateUrl: './courses.html',
  styleUrls: ['./courses.css']
})
export class CoursesComponent implements OnInit {
  userName = '';
  loading = true;
  errorMessage = '';

  groupedCourses: GroupedCourses = {};
  categories: string[] = [];
  searchTerm: string = '';
  selectedCategory: string = 'All';
  filteredCourses: Course[] = [];
  enrollmentStatuses: Map<number, CourseEnrollmentStatus> = new Map();

  // Make Math and Object available in templates
  Math = Math;
  Object = Object;

  constructor(
    private router: Router,
    private coursService: CoursService,
    private etudiantService: EtudiantService,
    private authService: AuthService
  ) {
    const user = this.authService.getUser();
    if (user) {
      this.userName = user.username || 'User';
    }
  }

  ngOnInit(): void {
    this.loadCourses();
  }

  loadEnrollmentStatuses(): void {
    const allCourses: any[] = [];
    Object.keys(this.groupedCourses).forEach(category => {
      if (this.groupedCourses[category].courses) {
        this.groupedCourses[category].courses.forEach(course => {
          allCourses.push(course);
        });
      }
    });

    // Check enrollment status for each course
    const enrollmentChecks = allCourses.map(course =>
      this.etudiantService.getCourseEnrollmentStatus(course.id).toPromise()
        .then(status => {
          this.enrollmentStatuses.set(course.id, status || {
            isEnrolled: false,
            status: null,
            enrollmentId: null,
            progressPercentage: 0,
            startedAt: null,
            completedAt: null
          });
          return status;
        })
        .catch(error => {
          console.error(`Error checking enrollment for course ${course.id}:`, error);
          const defaultStatus: CourseEnrollmentStatus = {
            isEnrolled: false,
            status: null,
            enrollmentId: null,
            progressPercentage: 0,
            startedAt: null,
            completedAt: null
          };
          this.enrollmentStatuses.set(course.id, defaultStatus);
          return defaultStatus;
        })
    );

    Promise.all(enrollmentChecks).then(() => {
      this.loading = false;
    }).catch(() => {
      this.loading = false;
    });
  }

  onCategoryChange(): void {
    this.filterCourses();
  }

  loadCourses() {
    this.coursService.getGroupedByCategory().subscribe({
      next: (groupedCourses) => {
        this.groupedCourses = groupedCourses;
        this.categories = ['All', ...Object.keys(groupedCourses)];
        this.selectedCategory = 'All';
        this.filterCourses();

        // Check enrollment status for each course if user is a student
        const user = this.authService.getUser();
        if (user && user.role === 'etudiant') {
          this.loadEnrollmentStatuses();
        } else {
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Error loading courses:', error);
        this.errorMessage = 'Failed to load courses. Please try again later.';
        this.loading = false;
      }
    });
  }

  filterCourses(): void {
    if (this.selectedCategory === 'All') {
      // Show all courses from all categories
      const allCourses: Course[] = [];
      let index = 0;
      Object.keys(this.groupedCourses).forEach(category => {
        this.groupedCourses[category].courses.forEach(course => {
          allCourses.push({
            id: course.id,
            title: course.titre,
            category: category,
            image: `https://picsum.photos/300/180?random=${index++}`,
            currentLesson: Math.floor(Math.random() * 5) + 1,
            totalLessons: 7,
            rating: 4.5 + Math.random() * 0.5,
            progress: Math.floor(Math.random() * 100)
          });
        });
      });
      this.filteredCourses = allCourses.filter(course =>
        course.title.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    } else {
      // Show courses from selected category
      const categoryData = this.groupedCourses[this.selectedCategory];
      if (categoryData && categoryData.courses) {
        this.filteredCourses = categoryData.courses.map((course, index) => ({
          id: course.id,
          title: course.titre,
          category: this.selectedCategory,
          image: `https://picsum.photos/300/180?random=${index + 100}`,
          currentLesson: Math.floor(Math.random() * 5) + 1,
          totalLessons: 7,
          rating: 4.5 + Math.random() * 0.5,
          progress: Math.floor(Math.random() * 100)
        })).filter(course =>
          course.title.toLowerCase().includes(this.searchTerm.toLowerCase())
        );
      } else {
        this.filteredCourses = [];
      }
    }
  }

  openCourse(id: number): void {
    this.router.navigate(['/course', id]);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getEnrollmentStatus(courseId: number): CourseEnrollmentStatus | undefined {
    return this.enrollmentStatuses.get(courseId);
  }

  onImageError(event: any): void {
    // Fallback to a default image if the image fails to load
    event.target.src = 'https://picsum.photos/300/180?random=999';
  }

  navigate(url: string) {
    this.router.navigateByUrl(url);
  }
}
