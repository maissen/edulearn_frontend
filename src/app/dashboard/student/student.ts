import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { ProfileService } from '../../../services/profile.service';
import { CoursService, Cours } from '../../../services/cours.service';
import { EtudiantService, InProgressCourse } from '../../../services/etudiant.service';
import { NavbarComponent } from '../../shared/navbar/navbar';
import { LogoComponent } from '../../shared/logo/logo.component';

@Component({
  selector: 'app-student',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, LogoComponent],
  templateUrl: './student.html',
  styleUrl: './student.css'
})
export class Student implements OnInit {
  userName = 'Student';
  courses: Cours[] = [];
  inProgressCourses: InProgressCourse[] = [];
  categories: string[] = [];
  loading = false;
  categoriesLoading = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private profileService: ProfileService,
    private coursService: CoursService,
    private etudiantService: EtudiantService
  ) {}

  ngOnInit() {
    this.loadUserData();
    this.loadInProgressCourses();
    this.loadCategories();
  }

  loadUserData() {
    this.profileService.getProfile().subscribe({
      next: (profile) => {
        this.userName = profile.username || 'Student';
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        const user = this.authService.getUser();
        if (user) {
          this.userName = user.username || 'Student';
        }
      }
    });
  }

  loadInProgressCourses() {
    this.loading = true;
    this.etudiantService.getInProgressCourses().subscribe({
      next: (courses) => {
        this.inProgressCourses = courses;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading in-progress courses:', error);
        this.loading = false;
      }
    });
  }

  loadCategories() {
    this.categoriesLoading = true;
    this.coursService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.categoriesLoading = false;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.categoriesLoading = false;
      }
    });
  }

  getCategoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      'Mathematics': '🔢',
      'Literature': '📚',
      'Science': '🔬',
      'History': '🏛️',
      'Programming': '💻',
      'Design': '🎨',
      'Business': '💼',
      'Marketing': '📢',
      'Photography': '📷',
      'Acting': '🎭'
    };
    return icons[category] || '📖';
  }

  getCategoryDescription(category: string): string {
    const descriptions: { [key: string]: string } = {
      'Mathematics': 'Numbers, equations, algebra, calculus',
      'Literature': 'Books, writing, poetry, analysis',
      'Science': 'Physics, chemistry, biology, experiments',
      'History': 'Past events, civilizations, timeline',
      'Programming': 'Code, algorithms, development, tech',
      'Design': 'Creativity, visuals, aesthetics, tools',
      'Business': 'Management, finance, entrepreneurship',
      'Marketing': 'Digital, SEO, social media, branding',
      'Photography': 'Lightroom, composition, portrait',
      'Acting': 'Voice, stage, film, improvisation'
    };
    return descriptions[category] || 'Explore and learn new skills';
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}