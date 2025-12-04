import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { AdminService, AdminUsersResponse, TeacherUser, StudentUser, ActivationResponse, CreateTeacherRequest, CreateStudentRequest, CreateResponse, DeleteResponse, TeacherCoursesResponse, TeacherWithCourses, TeacherCourse } from '../../../services/admin.service';

// Extend TeacherCourse interface to include teacher information
interface TeacherCourseWithTeacherInfo extends TeacherCourse {
  teacherName: string;
  teacherId: number;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class AdminComponent implements OnInit {
  userName = 'Admin';
  
  // Pagination properties
  currentPageTeachers = 1;
  currentPageStudents = 1;
  currentPageCourses = 1;
  itemsPerPage = 5;
  
  // Data arrays
  allTeachers: TeacherUser[] = [];
  allStudents: StudentUser[] = [];
  allCourses: TeacherCourseWithTeacherInfo[] = [];
  
  // Paginated data
  paginatedTeachers: TeacherUser[] = [];
  paginatedStudents: StudentUser[] = [];
  paginatedCourses: TeacherCourseWithTeacherInfo[] = [];
  
  // Loading and error states
  loading = false;
  courseLoading = false;
  error = '';
  actionLoading = false;
  successMessage = '';
  
  // Popup form states
  showCreateTeacherForm = false;
  showCreateStudentForm = false;
  showDeleteConfirm = false;
  showCourseDeleteConfirm = false;
  
  // Delete confirmation data
  deleteItemType = ''; // 'teacher', 'student', or 'course'
  deleteItemId = 0;
  deleteItemName = '';
  
  // Course delete confirmation data
  deleteCourseId = 0;
  deleteCourseTitle = '';
  
  // Form data
  newTeacher: CreateTeacherRequest = {
    username: '',
    email: '',
    password: '',
    module: ''
  };
  
  newStudent: CreateStudentRequest = {
    username: '',
    email: '',
    password: ''
  };

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
    this.loadAllCourses();
  }

  loadAllUsers() {
    this.loading = true;
    this.error = '';
    this.successMessage = '';
    
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
        setTimeout(() => this.error = '', 3000);
      }
    });
  }

  loadAllCourses() {
    this.courseLoading = true;
    this.error = '';
    this.successMessage = '';
    
    this.adminService.getTeacherCourses().subscribe({
      next: (response: TeacherCoursesResponse) => {
        this.courseLoading = false;
        // Flatten the courses from all teachers into a single array
        const coursesWithTeacherInfo: TeacherCourseWithTeacherInfo[] = [];
        response.teachers.forEach(teacher => {
          teacher.courses.forEach(course => {
            coursesWithTeacherInfo.push({
              ...course,
              teacherName: teacher.username,
              teacherId: teacher.id
            });
          });
        });
        this.allCourses = coursesWithTeacherInfo;
        this.updatePaginatedCourses();
      },
      error: (err: any) => {
        this.courseLoading = false;
        console.error('Error loading courses:', err);
        
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
          this.error = 'Failed to load courses. Please try again.';
        }
        setTimeout(() => this.error = '', 3000);
      }
    });
  }

  toggleTeacherActivation(teacher: TeacherUser) {
    this.actionLoading = true;
    this.adminService.toggleTeacherActivation(teacher.id, teacher.isActivated).subscribe({
      next: (response: ActivationResponse) => {
        this.actionLoading = false;
        // Update the teacher's activation status in our local data
        const index = this.allTeachers.findIndex(t => t.id === teacher.id);
        if (index !== -1) {
          this.allTeachers[index].isActivated = response.isActivated;
          // Refresh the paginated data
          this.updatePaginatedTeachers();
        }
        this.successMessage = response.message;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err: any) => {
        this.actionLoading = false;
        console.error('Error toggling teacher activation:', err);
        this.error = 'Failed to update teacher activation status. Please try again.';
        setTimeout(() => this.error = '', 3000);
      }
    });
  }

  toggleStudentActivation(student: StudentUser) {
    this.actionLoading = true;
    this.adminService.toggleStudentActivation(student.id, student.isActivated).subscribe({
      next: (response: ActivationResponse) => {
        this.actionLoading = false;
        // Update the student's activation status in our local data
        const index = this.allStudents.findIndex(s => s.id === student.id);
        if (index !== -1) {
          this.allStudents[index].isActivated = response.isActivated;
          // Refresh the paginated data
          this.updatePaginatedStudents();
        }
        this.successMessage = response.message;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err: any) => {
        this.actionLoading = false;
        console.error('Error toggling student activation:', err);
        this.error = 'Failed to update student activation status. Please try again.';
        setTimeout(() => this.error = '', 3000);
      }
    });
  }

  openCreateTeacherForm() {
    this.newTeacher = {
      username: '',
      email: '',
      password: '',
      module: ''
    };
    this.showCreateTeacherForm = true;
  }

  openCreateStudentForm() {
    this.newStudent = {
      username: '',
      email: '',
      password: ''
    };
    this.showCreateStudentForm = true;
  }

  closeCreateTeacherForm() {
    this.showCreateTeacherForm = false;
  }

  closeCreateStudentForm() {
    this.showCreateStudentForm = false;
  }

  createTeacher() {
    if (!this.newTeacher.username || !this.newTeacher.email || !this.newTeacher.password) {
      this.error = 'Please fill in all required fields.';
      setTimeout(() => this.error = '', 3000);
      return;
    }

    this.actionLoading = true;
    this.adminService.createTeacher(this.newTeacher).subscribe({
      next: (response: CreateResponse) => {
        this.actionLoading = false;
        this.closeCreateTeacherForm();
        this.successMessage = response.message;
        setTimeout(() => this.successMessage = '', 3000);
        // Reload users to show the new teacher
        this.loadAllUsers();
      },
      error: (err: any) => {
        this.actionLoading = false;
        console.error('Error creating teacher:', err);
        this.error = err.error?.message || 'Failed to create teacher. Please try again.';
        setTimeout(() => this.error = '', 3000);
      }
    });
  }

  createStudent() {
    if (!this.newStudent.username || !this.newStudent.email || !this.newStudent.password) {
      this.error = 'Please fill in all required fields.';
      setTimeout(() => this.error = '', 3000);
      return;
    }

    this.actionLoading = true;
    this.adminService.createStudent(this.newStudent).subscribe({
      next: (response: CreateResponse) => {
        this.actionLoading = false;
        this.closeCreateStudentForm();
        this.successMessage = response.message;
        setTimeout(() => this.successMessage = '', 3000);
        // Reload users to show the new student
        this.loadAllUsers();
      },
      error: (err: any) => {
        this.actionLoading = false;
        console.error('Error creating student:', err);
        this.error = err.error?.message || 'Failed to create student. Please try again.';
        setTimeout(() => this.error = '', 3000);
      }
    });
  }

  // Open delete confirmation dialog
  openDeleteConfirm(itemType: string, itemId: number, itemName: string) {
    this.deleteItemType = itemType;
    this.deleteItemId = itemId;
    this.deleteItemName = itemName;
    this.showDeleteConfirm = true;
  }

  // Close delete confirmation dialog
  closeDeleteConfirm() {
    this.showDeleteConfirm = false;
    this.deleteItemType = '';
    this.deleteItemId = 0;
    this.deleteItemName = '';
  }

  // Open course delete confirmation dialog
  openCourseDeleteConfirm(courseId: number, courseTitle: string) {
    this.deleteCourseId = courseId;
    this.deleteCourseTitle = courseTitle;
    this.showCourseDeleteConfirm = true;
  }

  // Close course delete confirmation dialog
  closeCourseDeleteConfirm() {
    this.showCourseDeleteConfirm = false;
    this.deleteCourseId = 0;
    this.deleteCourseTitle = '';
  }

  // Confirm and execute delete
  confirmDelete() {
    if (this.deleteItemType === 'teacher') {
      this.deleteTeacher(this.deleteItemId);
    } else if (this.deleteItemType === 'student') {
      this.deleteStudent(this.deleteItemId);
    }
    this.closeDeleteConfirm();
  }

  // Confirm and execute course delete
  confirmCourseDelete() {
    this.deleteCourse(this.deleteCourseId);
    this.closeCourseDeleteConfirm();
  }

  // Delete teacher
  deleteTeacher(id: number) {
    this.actionLoading = true;
    this.adminService.deleteTeacher(id).subscribe({
      next: (response: DeleteResponse) => {
        this.actionLoading = false;
        this.successMessage = response.message;
        setTimeout(() => this.successMessage = '', 3000);
        // Reload users to reflect the deletion
        this.loadAllUsers();
      },
      error: (err: any) => {
        this.actionLoading = false;
        console.error('Error deleting teacher:', err);
        this.error = err.error?.message || 'Failed to delete teacher. Please try again.';
        setTimeout(() => this.error = '', 3000);
      }
    });
  }

  // Delete student
  deleteStudent(id: number) {
    this.actionLoading = true;
    this.adminService.deleteStudent(id).subscribe({
      next: (response: DeleteResponse) => {
        this.actionLoading = false;
        this.successMessage = response.message;
        setTimeout(() => this.successMessage = '', 3000);
        // Reload users to reflect the deletion
        this.loadAllUsers();
      },
      error: (err: any) => {
        this.actionLoading = false;
        console.error('Error deleting student:', err);
        this.error = err.error?.message || 'Failed to delete student. Please try again.';
        setTimeout(() => this.error = '', 3000);
      }
    });
  }

  // Delete course
  deleteCourse(id: number) {
    this.actionLoading = true;
    this.adminService.deleteCourse(id).subscribe({
      next: (response: DeleteResponse) => {
        this.actionLoading = false;
        this.successMessage = response.message;
        setTimeout(() => this.successMessage = '', 3000);
        // Reload courses to reflect the deletion
        this.loadAllCourses();
      },
      error: (err: any) => {
        this.actionLoading = false;
        console.error('Error deleting course:', err);
        this.error = err.error?.message || 'Failed to delete course. Please try again.';
        setTimeout(() => this.error = '', 3000);
      }
    });
  }

  // Course pagination methods
  updatePaginatedCourses() {
    const startIndex = (this.currentPageCourses - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedCourses = this.allCourses.slice(startIndex, endIndex);
  }

  nextPageCourses() {
    if (this.currentPageCourses * this.itemsPerPage < this.allCourses.length) {
      this.currentPageCourses++;
      this.updatePaginatedCourses();
    }
  }

  prevPageCourses() {
    if (this.currentPageCourses > 1) {
      this.currentPageCourses--;
      this.updatePaginatedCourses();
    }
  }

  getTotalPagesCourses(): number {
    return Math.ceil(this.allCourses.length / this.itemsPerPage);
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