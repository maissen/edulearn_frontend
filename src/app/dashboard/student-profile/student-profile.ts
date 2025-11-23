import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Router, RouterModule } from '@angular/router';
interface Course {
  id: number;
  title: string;
  category: string;
  progress: number;
  lastLesson?: string;
  completed: boolean;
  completionDate?: string;
  grade?: number;
  imageUrl: string;
}

@Component({
  selector: 'app-student-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './student-profile.html',
  styleUrls: ['./student-profile.css']
})
export class StudentProfileComponent {


  

  studentName = 'amira';
  studentEmail = 'amira200@gmail.com';
  
  initial = this.studentName.charAt(0).toUpperCase();
  avatarUrl = 'https://i.pravatar.cc/150?u=amira-student';
  overallProgress = 68;

  coursesInProgress: Course[] = [
    {
      id: 1,
      title: 'Introduction à Python',
      category: 'Programmation',
      progress: 75,
      lastLesson: 'Les fonctions',
      completed: false,
      imageUrl: 'assets/img5.jpg'
    },
    {
      id: 2,
      title: 'UI/UX Design Fundamentals',
      category: 'Design',
      progress: 40,
      lastLesson: 'Wireframing',
      completed: false,
      imageUrl: 'assets/img12.jpg'
    }
  ];

  completedCourses: Course[] = [
    {
      id: 3,
      title: 'HTML & CSS Basics',
      category: 'Programmation',
      progress: 100,
      completed: true,
      completionDate: '15 nov. 2025',
      grade: 92,
      imageUrl: 'assets/img8.jpg'
    }
  ];

  recommendedCourses: Course[] = [
    {
      id: 4,
      title: 'JavaScript pour débutants',
      category: 'Programmation',
      progress: 0,
      completed: false,
      imageUrl: 'assets/img11.jpg'
    },
    {
      id: 5,
      title: 'Data Visualization avec D3.js',
      category: 'Data Science',
      progress: 0,
      completed: false,
      imageUrl: 'assets/img14.jpg'
    }
  ];

   constructor(
    private router: Router
  ) {}

  logout() { // ← Doit être DÉCLARÉ ici
    localStorage.removeItem('authToken');
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }

  navigate(url: string) {
  this.router.navigateByUrl(url);
}

  userName = 'èlè ammar '; // À remplacer par les données réelles plus tard

 
}