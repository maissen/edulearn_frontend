import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
interface Quiz {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface Course {
  id: number;
  title: string;
  description: string;
  category: string;
  duration: number;
  imageUrl?: string;
  videoUrl?: string;
  quizzes: Quiz[];
}

@Component({
  selector: 'app-manage-courses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-courses.html',
  styleUrls: ['./manage-courses.css']
})
export class ManageCoursesComponent {
  userName = 'Souhir'; // ← Doit être DÉCLARÉ ici

  // Mode: 'create' ou 'edit'
  mode: 'create' | 'edit' = 'create';

  // Données du formulaire
  newCourse: Course = {
    id: 0,
    title: '',
    description: '',
    category: '',
    duration: 1,
    imageUrl: '',
    videoUrl: '',
    quizzes: []
  };

  // Liste des cours
  courses: Course[] = [
    {
      id: 1,
      title: 'Introduction à Python',
      description: 'Apprenez les bases de la programmation avec Python.',
      category: 'programming',
      duration: 8,
      imageUrl: 'assets/img8.jpg',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      quizzes: [
        { question: 'Quel mot-clé déclare une fonction ?', options: ['func', 'def', 'function'], correctAnswer: 1 }
      ]
    },
    {
      id: 2,
      title: 'Design UX/UI',
      description: 'Principes fondamentaux de l’expérience utilisateur.',
      category: 'design',
      duration: 6,
      imageUrl: 'assets/img9.jpg',
      videoUrl: '',
      quizzes: [
        { question: 'Qu’est-ce qu’un wireframe ?', options: ['Maquette basse fidélité', 'Code final', 'Logo'], correctAnswer: 0 }
      ]
    }
  ];

  // --- CRUD METHODS ---

  // ✅ CREATE
  onCreateCourse() {
    if (this.mode === 'create') {
      const newId = this.courses.length > 0 ? Math.max(...this.courses.map(c => c.id)) + 1 : 1;
      this.courses.push({ ...this.newCourse, id: newId });
      console.log('✅ Cours créé');
    } else {
      // ✅ UPDATE
      const index = this.courses.findIndex(c => c.id === this.newCourse.id);
      if (index !== -1) {
        this.courses[index] = { ...this.newCourse };
        console.log('✅ Cours mis à jour');
      }
    }
    this.resetForm();
  }

  // ✏️ EDIT (pré-remplissage)
  onEditCourse(course: Course) {
    this.newCourse = {
      id: course.id,
      title: course.title,
      description: course.description,
      category: course.category,
      duration: course.duration,
      imageUrl: course.imageUrl || '',
      videoUrl: course.videoUrl || '',
      quizzes: course.quizzes.map(q => ({ ...q }))
    };
    this.mode = 'edit';
    // Scroll to form
    document.querySelector('.form-card')?.scrollIntoView({ behavior: 'smooth' });
  }

  // 🗑️ DELETE
  onDeleteCourse(courseId: number) {
    if (confirm('⚠️ Voulez-vous vraiment supprimer ce cours ? Cette action est irréversible.')) {
      this.courses = this.courses.filter(c => c.id !== courseId);
      console.log('🗑️ Cours supprimé');
      if (this.mode === 'edit' && this.newCourse.id === courseId) {
        this.resetForm();
      }
    }
  }

  // 🔄 RÉINITIALISER LE FORMULAIRE
  resetForm() {
    this.mode = 'create';
    this.newCourse = {
      id: 0,
      title: '',
      description: '',
      category: '',
      duration: 1,
      imageUrl: '',
      videoUrl: '',
      quizzes: []
    };
  }

  // --- GESTION DES QUIZ ---

  addQuiz() {
    this.newCourse.quizzes.push({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0
    });
  }

  removeQuiz(index: number) {
    this.newCourse.quizzes.splice(index, 1);
  }

  // --- AFFICHAGE ---

  viewCourse(id: number) {
    alert(`👁️ Affichage du cours ID ${id} (à implémenter dans une page dédiée)`);
  }



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
}