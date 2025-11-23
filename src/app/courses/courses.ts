import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
// Définir l'interface Course
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
  imports: [FormsModule], // permet l'utilisation de [(ngModel)]
  templateUrl: './courses.html',
  styleUrls: ['./courses.css']
})
export class CoursesComponent implements OnInit {
   userName = 'èlè ammar '; // À remplacer par les données réelles plus tard

  constructor(
    private router: Router
  ) {}

  logout() {
    localStorage.removeItem('authToken');
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }

  courses: Course[] = [
    { id: 1, title: 'Introduction to Java', category: 'Informatique', image: 'assets/img8.jpg', currentLesson: 5, totalLessons: 7, rating: 4.8, progress: 70 },
    { id: 2, title: 'Kotlin Basics', category: 'Informatique', image: 'assets/img7.jpg', currentLesson: 3, totalLessons: 7, rating: 4.6, progress: 40 },
    { id: 3, title: 'Advanced PHP', category: 'Informatique', image: 'assets/img9.jpg', currentLesson: 6, totalLessons: 7, rating: 4.9, progress: 85 },
    { id: 4, title: 'Angular for Beginners', category: 'Informatique', image: 'assets/img10.jpg', currentLesson: 2, totalLessons: 7, rating: 4.7, progress: 30 },
    { id: 5, title: 'Digital Marketing 101', category: 'Marketing', image: 'assets/img11.jpg', currentLesson: 4, totalLessons: 8, rating: 4.5, progress: 50 },
    { id: 6, title: 'Photography Basics', category: 'Photography', image: 'assets/img12.jpg', currentLesson: 2, totalLessons: 5, rating: 4.3, progress: 40 }
  ];

  categories: string[] = ['All', 'Informatique', 'Marketing', 'Photography'];

  searchTerm: string = '';
  selectedCategory: string = 'All';
  filteredCourses: Course[] = [];

  ngOnInit(): void {
    this.filteredCourses = this.courses;
  }

  filterCourses(): void {
    this.filteredCourses = this.courses.filter(course => {
      const matchesCategory = this.selectedCategory === 'All' || course.category === this.selectedCategory;
      const matchesSearch = course.title.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }

  openCourse(id: number): void {
    console.log('Ouvrir le cours avec ID :', id);
    // Rediriger vers le cours réel
    // Exemple : this.router.navigate(['/course', id]);
  }

  navigate(url: string) {
  this.router.navigateByUrl(url);
}
}
