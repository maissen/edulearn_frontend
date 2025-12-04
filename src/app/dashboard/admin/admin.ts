import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { AdminService, AdminUsersResponse, TeacherUser, StudentUser, ActivationResponse, CreateTeacherRequest, CreateStudentRequest, CreateResponse, DeleteResponse, TeacherCoursesResponse, TeacherWithCourses, TeacherCourse, LogEntry, BackupEntry, BackupsResponse, CreateBackupResponse, DeleteBackupResponse, StatisticsResponse } from '../../../services/admin.service';

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
  currentPageLogs = 1;
  itemsPerPage = 5;
  
  // Data arrays
  allTeachers: TeacherUser[] = [];
  allStudents: StudentUser[] = [];
  allCourses: TeacherCourseWithTeacherInfo[] = [];
  allLogs: LogEntry[] = [];
  allBackups: BackupEntry[] = [];
  
  // Statistics data
  statistics: StatisticsResponse = {
    users: {
      admins: 0,
      teachers: 0,
      students: 0
    },
    content: {
      courses: 0,
      tests: 0,
      questions: 0,
      classes: 0
    },
    interactions: {
      forumPosts: 0
    }
  };
  
  // Filter properties
  courseFilter = '';
  courseFilterType: 'teacher' | 'category' = 'teacher';
  studentStatusFilter: 'all' | 'active' | 'inactive' = 'all';
  teacherFilter: 'all' | 'active' | 'inactive' | 'newest' | 'oldest' = 'all';
  studentFilter: 'all' | 'active' | 'inactive' | 'newest' | 'oldest' = 'all';
  logType: 'combined' | 'error' = 'combined';
  
  // Paginated data
  paginatedTeachers: TeacherUser[] = [];
  paginatedStudents: StudentUser[] = [];
  paginatedCourses: TeacherCourseWithTeacherInfo[] = [];
  paginatedLogs: LogEntry[] = [];
  
  // Loading and error states
  loading = false;
  courseLoading = false;
  logLoading = false;
  backupLoading = false;
  statisticsLoading = false;
  error = '';
  actionLoading = false;
  successMessage = '';
  
  // Popup form states
  showCreateTeacherForm = false;
  showCreateStudentForm = false;
  showDeleteConfirm = false;
  showCourseDeleteConfirm = false;
  showBackupDeleteConfirm = false;
  
  // Delete confirmation data
  deleteItemType = ''; // 'teacher', 'student', 'course', or 'backup'
  deleteItemId = 0;
  deleteItemName = '';
  
  // Course delete confirmation data
  deleteCourseId = 0;
  deleteCourseTitle = '';
  
  // Backup delete confirmation data
  deleteBackupFilename = '';
  
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
    this.loadAllLogs();
    this.loadAllBackups();
    this.loadStatistics();
  }

  loadStatistics() {
    this.statisticsLoading = true;
    this.error = '';
    
    this.adminService.getStatistics().subscribe({
      next: (response: StatisticsResponse) => {
        this.statisticsLoading = false;
        this.statistics = response;
      },
      error: (err: any) => {
        this.statisticsLoading = false;
        console.error('Error loading statistics:', err);
        
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
          this.error = 'Failed to load statistics. Please try again.';
        }
        setTimeout(() => this.error = '', 3000);
      }
    });
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

  loadAllLogs() {
    this.logLoading = true;
    this.error = '';
    this.successMessage = '';
    
    this.adminService.getLogs(50, this.logType).subscribe({
      next: (response: any) => {
        this.logLoading = false;
        if (response.success) {
          this.allLogs = response.logs;
          this.updatePaginatedLogs();
        } else {
          this.error = 'Failed to load logs.';
          setTimeout(() => this.error = '', 3000);
        }
      },
      error: (err: any) => {
        this.logLoading = false;
        console.error('Error loading logs:', err);
        
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
          this.error = 'Failed to load logs. Please try again.';
        }
        setTimeout(() => this.error = '', 3000);
      }
    });
  }

  loadAllBackups() {
    this.backupLoading = true;
    this.error = '';
    this.successMessage = '';
    
    this.adminService.getBackups().subscribe({
      next: (response: BackupsResponse) => {
        this.backupLoading = false;
        if (response.success) {
          this.allBackups = response.backups;
        } else {
          this.error = 'Failed to load backups.';
          setTimeout(() => this.error = '', 3000);
        }
      },
      error: (err: any) => {
        this.backupLoading = false;
        console.error('Error loading backups:', err);
        
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
          this.error = 'Failed to load backups. Please try again.';
        }
        setTimeout(() => this.error = '', 3000);
      }
    });
  }

  refreshBackups() {
    this.loadAllBackups();
  }

  refreshLogs() {
    this.loadAllLogs();
  }

  createBackup() {
    this.backupLoading = true;
    this.error = '';
    this.successMessage = '';

    this.adminService.createBackup().subscribe({
      next: (response: CreateBackupResponse) => {
        this.backupLoading = false;
        if (response.success) {
          this.successMessage = response.message;
          // Refresh the backups list to include the new backup
          this.loadAllBackups();
          // Clear success message after 3 seconds
          setTimeout(() => this.successMessage = '', 3000);
        } else {
          this.error = 'Failed to create backup.';
          setTimeout(() => this.error = '', 3000);
        }
      },
      error: (err: any) => {
        this.backupLoading = false;
        console.error('Error creating backup:', err);

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
          this.error = 'Failed to create backup. Please try again.';
        }
        setTimeout(() => this.error = '', 3000);
      }
    });
  }

  openBackupDeleteConfirm(filename: string) {
    this.deleteItemType = 'backup';
    this.deleteBackupFilename = filename;
    this.showBackupDeleteConfirm = true;
  }

  closeBackupDeleteConfirm() {
    this.showBackupDeleteConfirm = false;
    this.deleteItemType = '';
    this.deleteBackupFilename = '';
  }

  confirmBackupDelete() {
    if (this.deleteItemType === 'backup' && this.deleteBackupFilename) {
      this.actionLoading = true;
      this.error = '';
      this.successMessage = '';

      this.adminService.deleteBackup(this.deleteBackupFilename).subscribe({
        next: (response: DeleteBackupResponse) => {
          this.actionLoading = false;
          this.closeBackupDeleteConfirm();
          
          if (response.success) {
            this.successMessage = response.message;
            // Refresh the backups list to remove the deleted backup
            this.loadAllBackups();
            // Clear success message after 3 seconds
            setTimeout(() => this.successMessage = '', 3000);
          } else {
            this.error = 'Failed to delete backup.';
            setTimeout(() => this.error = '', 3000);
          }
        },
        error: (err: any) => {
          this.actionLoading = false;
          this.closeBackupDeleteConfirm();
          console.error('Error deleting backup:', err);

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
            this.error = 'Failed to delete backup. Please try again.';
          }
          setTimeout(() => this.error = '', 3000);
        }
      });
    }
  }

  downloadBackup(id: number) {
    this.adminService.downloadBackup(id);
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
    // Apply filter first
    let filteredCourses = this.allCourses;
    
    if (this.courseFilter) {
      if (this.courseFilterType === 'teacher') {
        filteredCourses = this.allCourses.filter(course => 
          course.teacherName.toLowerCase().includes(this.courseFilter.toLowerCase())
        );
      } else if (this.courseFilterType === 'category') {
        filteredCourses = this.allCourses.filter(course => 
          course.category.toLowerCase().includes(this.courseFilter.toLowerCase())
        );
      }
    }
    
    const startIndex = (this.currentPageCourses - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedCourses = filteredCourses.slice(startIndex, endIndex);
  }

  // Update filter
  updateCourseFilter() {
    this.currentPageCourses = 1; // Reset to first page when filter changes
    this.updatePaginatedCourses();
  }

  // Clear filter
  clearCourseFilter() {
    this.courseFilter = '';
    this.currentPageCourses = 1;
    this.updatePaginatedCourses();
  }

  nextPageCourses() {
    if (this.currentPageCourses * this.itemsPerPage < this.getCourseFilteredCount()) {
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

  getCourseFilteredCount(): number {
    if (!this.courseFilter) {
      return this.allCourses.length;
    }
    
    if (this.courseFilterType === 'teacher') {
      return this.allCourses.filter(course => 
        course.teacherName.toLowerCase().includes(this.courseFilter.toLowerCase())
      ).length;
    } else if (this.courseFilterType === 'category') {
      return this.allCourses.filter(course => 
        course.category.toLowerCase().includes(this.courseFilter.toLowerCase())
      ).length;
    }
    
    return this.allCourses.length;
  }

  getTotalPagesCourses(): number {
    return Math.ceil(this.getCourseFilteredCount() / this.itemsPerPage);
  }

  // Teacher pagination methods
  updatePaginatedTeachers() {
    // Apply filter first
    let filteredTeachers = [...this.allTeachers]; // Create a copy to avoid mutating original
    
    if (this.teacherFilter !== 'all') {
      if (this.teacherFilter === 'active' || this.teacherFilter === 'inactive') {
        const isActive = this.teacherFilter === 'active';
        filteredTeachers = filteredTeachers.filter(teacher => {
          const isActivated = Boolean(teacher.isActivated);
          return isActivated === isActive;
        });
      } else if (this.teacherFilter === 'newest') {
        // Sort by creation date descending (newest first)
        filteredTeachers.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      } else if (this.teacherFilter === 'oldest') {
        // Sort by creation date ascending (oldest first)
        filteredTeachers.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      }
    }
    
    const startIndex = (this.currentPageTeachers - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedTeachers = filteredTeachers.slice(startIndex, endIndex);
  }

  // Update teacher filter
  updateTeacherFilter(filter: 'all' | 'active' | 'inactive' | 'newest' | 'oldest') {
    this.teacherFilter = filter;
    this.currentPageTeachers = 1; // Reset to first page when filter changes
    this.updatePaginatedTeachers();
  }

  nextPageTeachers() {
    if (this.currentPageTeachers * this.itemsPerPage < this.getTeacherFilteredCount()) {
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

  getTeacherFilteredCount(): number {
    if (this.teacherFilter === 'all') {
      return this.allTeachers.length;
    }
    
    if (this.teacherFilter === 'active' || this.teacherFilter === 'inactive') {
      const isActive = this.teacherFilter === 'active';
      return this.allTeachers.filter(teacher => {
        const isActivated = Boolean(teacher.isActivated);
        return isActivated === isActive;
      }).length;
    }
    
    // For sorting filters, return all teachers
    return this.allTeachers.length;
  }

  getTotalPagesTeachers(): number {
    return Math.ceil(this.getTeacherFilteredCount() / this.itemsPerPage);
  }

  // Student pagination methods
  updatePaginatedStudents() {
    // Apply filter first
    let filteredStudents = [...this.allStudents]; // Create a copy to avoid mutating original
    
    if (this.studentFilter !== 'all') {
      if (this.studentFilter === 'active' || this.studentFilter === 'inactive') {
        const isActive = this.studentFilter === 'active';
        filteredStudents = filteredStudents.filter(student => {
          const isActivated = Boolean(student.isActivated);
          return isActivated === isActive;
        });
      } else if (this.studentFilter === 'newest') {
        // Sort by creation date descending (newest first)
        filteredStudents.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      } else if (this.studentFilter === 'oldest') {
        // Sort by creation date ascending (oldest first)
        filteredStudents.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      }
    }
    
    const startIndex = (this.currentPageStudents - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedStudents = filteredStudents.slice(startIndex, endIndex);
  }

  // Update student filter
  updateStudentFilter(filter: 'all' | 'active' | 'inactive' | 'newest' | 'oldest') {
    this.studentFilter = filter;
    this.currentPageStudents = 1; // Reset to first page when filter changes
    this.updatePaginatedStudents();
  }

  nextPageStudents() {
    if (this.currentPageStudents * this.itemsPerPage < this.getStudentFilteredCount()) {
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

  getStudentFilteredCount(): number {
    if (this.studentFilter === 'all') {
      return this.allStudents.length;
    }
    
    if (this.studentFilter === 'active' || this.studentFilter === 'inactive') {
      const isActive = this.studentFilter === 'active';
      return this.allStudents.filter(student => {
        const isActivated = Boolean(student.isActivated);
        return isActivated === isActive;
      }).length;
    }
    
    // For sorting filters, return all students
    return this.allStudents.length;
  }

  getTotalPagesStudents(): number {
    return Math.ceil(this.getStudentFilteredCount() / this.itemsPerPage);
  }

  // Log pagination methods
  updatePaginatedLogs() {
    const startIndex = (this.currentPageLogs - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedLogs = this.allLogs.slice(startIndex, endIndex);
  }

  nextPageLogs() {
    if (this.currentPageLogs * this.itemsPerPage < this.allLogs.length) {
      this.currentPageLogs++;
      this.updatePaginatedLogs();
    }
  }

  prevPageLogs() {
    if (this.currentPageLogs > 1) {
      this.currentPageLogs--;
      this.updatePaginatedLogs();
    }
  }

  getTotalPagesLogs(): number {
    return Math.ceil(this.allLogs.length / this.itemsPerPage);
  }

  // Update log type filter
  updateLogType(type: 'combined' | 'error') {
    this.logType = type;
    this.currentPageLogs = 1; // Reset to first page when filter changes
    this.loadAllLogs();
  }

  exportLogs() {
    this.logLoading = true;
    this.error = '';
    this.successMessage = '';

    this.adminService.exportLogs(this.logType).subscribe({
      next: (response: Blob) => {
        this.logLoading = false;
        // Create a download link for the CSV file
        const url = window.URL.createObjectURL(response);
        const a = document.createElement('a');
        a.href = url;
        a.download = `logs-${this.logType}-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        this.successMessage = 'Logs exported successfully';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err: any) => {
        this.logLoading = false;
        console.error('Error exporting logs:', err);

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
          this.error = 'Failed to export logs. Please try again.';
        }
        setTimeout(() => this.error = '', 3000);
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
