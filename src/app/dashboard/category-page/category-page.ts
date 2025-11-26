import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CoursService } from '../../../services/cours.service';
import { AuthService } from '../../../services/auth.service';
import { NavbarComponent } from '../../shared/navbar/navbar';
import { FooterComponent } from '../../shared/footer/footer';

interface Course {
  id: number;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  price: number;
  rating: number;
  instructor: string;
  avatarUrl: string;
}

@Component({
  selector: 'app-category-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NavbarComponent,
    FooterComponent
  ],
  templateUrl: './category-page.html',
  styleUrls: ['./category-page.css']
})
export class CategoryPageComponent implements OnInit {
  userName = '';
  categoryName = 'Programmation';
  courses: Course[] = [];
  loading = true;
  errorMessage = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private coursService: CoursService,
    private authService: AuthService
  ) {
    const user = this.authService.getUser();
    if (user) {
      this.userName = user.username || 'User';
    }
  }

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.categoryName = this.formatCategoryName(slug);
    }
    this.loadCourses();
  }

  formatCategoryName(slug: string): string {
    return slug.charAt(0).toUpperCase() + slug.slice(1);
  }

  loadCourses() {
    this.loading = true;
    this.coursService.getAllCours().subscribe({
      next: (apiCourses) => {
        // Transform API courses to display format
        this.courses = apiCourses.map((c, index) => ({
          id: c.id || index + 1,
          title: c.titre,
          description: c.description || 'No description available',
          category: 'programming', // Default category
          imageUrl: `https://picsum.photos/300/180?random=${index + 10}`,
          price: Math.floor(Math.random() * 50) + 50,
          rating: 4.5 + Math.random() * 0.5,
          instructor: 'Instructor',
          avatarUrl: 'https://i.pravatar.cc/150?u=instructor'
        }));
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading courses:', error);
        this.errorMessage = 'Failed to load courses';
        this.loading = false;
      }
    });
  }

  get uniqueInstructors() {
    const seen = new Set<string>();
    return this.courses.filter(c => {
      const name = c.instructor;
      if (seen.has(name)) return false;
      seen.add(name);
      return true;
    });
  }

  navigate(url: string) {
    this.router.navigateByUrl(url);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
