import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
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
export class CourseDetailComponent {
  

safeVideoUrl: SafeResourceUrl;
  
  course: Course = {
    id: 1,
    title: 'Learn about Machine Learning',
    subtitle: 'Master Machine Learning — from basics to expert level.',
    duration: '1 hour',
    imageUrl: 'assets/img11.jpg',
    videoUrl: 'https://www.youtube.com/embed/ukzFI9rgwfU',
    description: 'This course covers everything from linear regression to neural networks. Perfect for beginners and intermediate learners.',
    targetAudience: 'Students with basic math knowledge and interest in AI.',
    prerequisites: 'Basic Python and algebra.',
    instructor: {
      name: 'Budin Simps',
      avatarUrl: 'https://i.pravatar.cc/150?u=budin-instructor',
      bio: 'Experienced AI educator with 10+ years in industry.',
      rating: 4.8 // ✅ Défini ici
    },
    relatedCourses: [
      {
        title: 'AWS Certified solutions Architect',
        imageUrl: 'assets/img5.jpg',
        price: 80,
        rating: 4.5
      },
      {
        title: 'Data Visualization with D3.js',
        imageUrl: 'assets/img11.jpg',
        price: 65,
        rating: 4.6
      },
      {
        title: 'Python for Data Science',
        imageUrl: 'assets/img4.jpg',
        price: 70,
        rating: 4.8
      }
    ],
    quizzes: [
      {
        question: 'What is the output of 2 + 2?',
        options: ['3', '4', '5', '6'],
        correctAnswer: 1
      },
      {
        question: 'Which algorithm is used for classification?',
        options: ['Linear Regression', 'K-Means', 'Decision Tree', 'PCA'],
        correctAnswer: 2
      }
    ]
  };



  ngOnInit() {
    // Ici, tu chargerais les données via un service (ex: this.courseService.getById(this.route.snapshot.paramMap.get('id')))
    // Pour l’instant, données statiques.
  }

  // 👇 Gestion des quiz (ajout/suppression)
  addQuiz() {
    this.course.quizzes.push({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0
    });
  }

  removeQuiz(index: number) {
    this.course.quizzes.splice(index, 1);
  }
 navigate(url: string) {
  this.router.navigateByUrl(url);
}

 

  userName = 'èlè ammar '; // À remplacer par les données réelles plus tard

  constructor(
    private router: Router, private sanitizer: DomSanitizer
  ) {
    this.safeVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.course.videoUrl);
  }

  logout() {
    localStorage.removeItem('authToken');
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }
}