import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { EnseignantService } from '../../../services/enseignant.service';
import { EtudiantService } from '../../../services/etudiant.service';
import { ClasseService } from '../../../services/classe.service';
import { CoursService } from '../../../services/cours.service';
import { ExamenService } from '../../../services/examen.service';
import { NavbarComponent } from '../../shared/navbar/navbar';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class AdminComponent implements OnInit {
  userName = 'Admin';
  stats = {
    teachers: 0,
    students: 0,
    classes: 0,
    courses: 0,
    exams: 0
  };

  constructor(
    private router: Router,
    private authService: AuthService,
    private enseignantService: EnseignantService,
    private etudiantService: EtudiantService,
    private classeService: ClasseService,
    private coursService: CoursService,
    private examenService: ExamenService
  ) {}

  ngOnInit() {
    const user = this.authService.getUser();
    if (user) {
      this.userName = user.username || 'Admin';
    }
    this.loadStats();
  }

  loadStats() {
    this.enseignantService.getAllEnseignants().subscribe({
      next: (teachers) => this.stats.teachers = teachers.length,
      error: (err) => console.error('Error loading teachers:', err)
    });

    this.etudiantService.getAllEtudiants().subscribe({
      next: (students) => this.stats.students = students.length,
      error: (err) => console.error('Error loading students:', err)
    });

    this.classeService.getAllClasses().subscribe({
      next: (classes) => this.stats.classes = classes.length,
      error: (err) => console.error('Error loading classes:', err)
    });

    this.coursService.getAllCours().subscribe({
      next: (courses) => this.stats.courses = courses.length,
      error: (err) => console.error('Error loading courses:', err)
    });

    this.examenService.getAllExamens().subscribe({
      next: (exams) => this.stats.exams = exams.length,
      error: (err) => console.error('Error loading exams:', err)
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

