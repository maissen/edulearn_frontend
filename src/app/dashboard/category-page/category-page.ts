import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';      // ✅ Pour *ngFor, *ngIf, SlicePipe
import { FormsModule } from '@angular/forms';        // ✅ Si tu as des [(ngModel)] dans ce composant
import { Router, RouterModule } from '@angular/router';
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
    CommonModule,    // ✅ Obligatoire pour *ngFor
    FormsModule      // ✅ Si tu utilises [(ngModel)] ici
  ],
  templateUrl: './category-page.html',
  styleUrls: ['./category-page.css']
})
export class CategoryPageComponent {


  userName = 'èlè ammar '; // À remplacer par les données réelles plus tard

  constructor(
    private router: Router
  ) {}

  logout() {
    localStorage.removeItem('authToken');
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }

  categoryName = 'Programmation';

  courses: Course[] = [
    {
      id: 1,
      title: ' Machine Learning Basics',
      description: ' From data to prediction — start here.',
      category: 'programming',
      imageUrl: 'assets/img14.jpg',
      price: 80,
      rating: 4.5,
      instructor: 'John Doe',
       avatarUrl: 'assets/prof1.jpg'
    },
    {
      id: 2,
      title: 'AWS Certified Solutions Architect',
      description: 'Learn AWS cloud architecture and deployment.',
      category: 'programming',
      imageUrl: 'assets/img12.jpg',
      price: 60,
      rating: 4.7,
      instructor: 'Jane Smith',
       avatarUrl: 'assets/prof2.jpg'
    },

    {
      id:3,
      title: 'python Learning Basics',
      description: 'From data to prediction — start here.',
      category: 'programming',
      imageUrl: 'assets/img8.jpg',
      price: 60,
      rating: 4.7,
      instructor: 'Jane Smith',
       avatarUrl: 'https://i.pravatar.cc/150?u=john-doe'
    },
    {
      id:4,
      title: 'matlab Learning Basics',
      description: 'From data to prediction — start here.',
      category: 'programming',
      imageUrl: 'assets/img11.jpg',
      price: 60,
      rating: 4.7,
      instructor: 'Jane Smith',
       avatarUrl: 'https://i.pravatar.cc/150?u=john-doe'
    },








  ];

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
}