import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { AdminService, AdminUsersResponse, TeacherUser, StudentUser } from '../../../services/admin.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class AdminComponent implements OnInit {
  userName = 'Admin';
  
  // Pagination properties
  currentPageTeachers = 1;
  currentPageStudents = 1;
  itemsPerPage = 5;
  
  // Data arrays
  allTeachers: TeacherUser[] = [];
  allStudents: StudentUser[] = [];
  
  // Paginated data
  paginatedTeachers: TeacherUser[] = [];
  paginatedStudents: StudentUser[] = [];
  
  // Loading and error states
  loading = false;
  error = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private adminService: AdminService
  ) {}

  ngOnInit() {
    const user = this.authService.getUser();
    if (user) {
      this.userName = user.username || 'Admin';
    }
    this.loadAllUsers();
  }

  loadAllUsers() {
    this.loading = true;
    this.error = '';
    
    this.adminService.getAllUsers().subscribe({
      next: (response: AdminUsersResponse) => {
        this.loading = false;
        this.allTeachers = response.teachers;
        this.allStudents = response.students;
        this.updatePaginatedTeachers();
        this.updatePaginatedStudents();
      },
      error: (err: any) => {
        this.loading = false;
        console.error('Error loading users:', err);
        
        // More specific error handling
        if (err.status === 403) {
          this.error = 'Access denied. Please ensure you are logged in as an administrator.';
        } else if (err.status === 401) {
          this.error = 'Authentication failed. Please log in again.';
          // Automatically redirect to login
          this.authService.logout();
          this.router.navigate(['/login']);
        } else if (err.status === 0) {
          this.error = 'Network error. Please check your connection and try again.';
        } else {
          this.error = 'Failed to load users. Please try again.';
        }
      }
    });
  }

  // Teacher pagination methods
  updatePaginatedTeachers() {
    const startIndex = (this.currentPageTeachers - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedTeachers = this.allTeachers.slice(startIndex, endIndex);
  }

  nextPageTeachers() {
    if (this.currentPageTeachers * this.itemsPerPage < this.allTeachers.length) {
      this.currentPageTeachers++;
      this.updatePaginatedTeachers();
    }
  }

  prevPageTeachers() {
    if (this.currentPageTeachers > 1) {
      this.currentPageTeachers--;
      this.updatePaginatedTeachers();
    }
  }

  getTotalPagesTeachers(): number {
    return Math.ceil(this.allTeachers.length / this.itemsPerPage);
  }

  // Student pagination methods
  updatePaginatedStudents() {
    const startIndex = (this.currentPageStudents - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedStudents = this.allStudents.slice(startIndex, endIndex);
  }

  nextPageStudents() {
    if (this.currentPageStudents * this.itemsPerPage < this.allStudents.length) {
      this.currentPageStudents++;
      this.updatePaginatedStudents();
    }
  }

  prevPageStudents() {
    if (this.currentPageStudents > 1) {
      this.currentPageStudents--;
      this.updatePaginatedStudents();
    }
  }

  getTotalPagesStudents(): number {
    return Math.ceil(this.allStudents.length / this.itemsPerPage);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}