import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CoursService, Cours } from '../../services/cours.service';
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

  courses: Course[] = [];
  categories: string[] = ['All'];
  searchTerm: string = '';
  selectedCategory: string = 'All';
  filteredCourses: Course[] = [];

  constructor(
    private router: Router,
    private coursService: CoursService,
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

  loadCourses() {
    this.coursService.getAllCours().subscribe({
      next: (apiCourses) => {
        // Transform API courses to display format
        this.courses = apiCourses.map((c, index) => ({
          id: c.id || index + 1,
          title: c.titre,
          category: 'Informatique', // Default category, can be enhanced
          image: `https://picsum.photos/300/180?random=${index + 1}`, // Use placeholder images
          currentLesson: Math.floor(Math.random() * 5) + 1,
          totalLessons: 7,
          rating: 4.5 + Math.random() * 0.5, // Random rating between 4.5-5.0
          progress: Math.floor(Math.random() * 100)
        }));

        // Extract unique categories
        const uniqueCategories = new Set(this.courses.map(c => c.category));
        this.categories = ['All', ...Array.from(uniqueCategories)];

        this.filteredCourses = this.courses;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading courses:', error);
        this.errorMessage = 'Failed to load courses. Please try again later.';
        this.loading = false;
      }
    });
  }

  filterCourses(): void {
    this.filteredCourses = this.courses.filter(course => {
      const matchesCategory = this.selectedCategory === 'All' || course.category === this.selectedCategory;
      const matchesSearch = course.title.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }

  openCourse(id: number): void {
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
