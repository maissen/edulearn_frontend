import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { AdminService, AdminUsersResponse, TeacherUser, StudentUser, ActivationResponse, CreateTeacherRequest, CreateStudentRequest, CreateAdminRequest, CreateResponse, DeleteResponse, TeacherCoursesResponse, TeacherWithCourses, TeacherCourse, LogEntry, BackupEntry, BackupsResponse, CreateBackupResponse, DeleteBackupResponse, StatisticsResponse } from '../../../services/admin.service';

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
  
  // Snackbar properties
  showSnackbar = false;
  snackbarMessage = '';
  snackbarType: 'success' | 'error' = 'success';
  
  // Popup form states
  showCreateTeacherForm = false;
  showCreateStudentForm = false;
  showCreateAdminForm = false;
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

  newAdmin: CreateAdminRequest = {
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
        this.showSnackbarMessage('Failed to load statistics. Please try again.', 'error');
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
          this.showSnackbarMessage('Access denied. Please ensure you are logged in as an administrator.', 'error');
        } else if (err.status === 401) {
          this.showSnackbarMessage('Authentication failed. Please log in again.', 'error');
          // Automatically redirect to login
          this.authService.logout();
          this.router.navigate(['/login']);
        } else if (err.status === 0) {
          this.showSnackbarMessage('Network error. Please check your connection and try again.', 'error');
        } else {
          this.showSnackbarMessage('Failed to load users. Please try again.', 'error');
        }
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
          this.showSnackbarMessage('Access denied. Please ensure you are logged in as an administrator.', 'error');
        } else if (err.status === 401) {
          this.showSnackbarMessage('Authentication failed. Please log in again.', 'error');
          // Automatically redirect to login
          this.authService.logout();
          this.router.navigate(['/login']);
        } else if (err.status === 0) {
          this.showSnackbarMessage('Network error. Please check your connection and try again.', 'error');
        } else {
          this.showSnackbarMessage('Failed to load courses. Please try again.', 'error');
        }
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
          this.showSnackbarMessage('Failed to load logs.', 'error');
        }
      },
      error: (err: any) => {
        this.logLoading = false;
        console.error('Error loading logs:', err);
        
        // More specific error handling
        if (err.status === 403) {
          this.showSnackbarMessage('Access denied. Please ensure you are logged in as an administrator.', 'error');
        } else if (err.status === 401) {
          this.showSnackbarMessage('Authentication failed. Please log in again.', 'error');
          // Automatically redirect to login
          this.authService.logout();
          this.router.navigate(['/login']);
        } else if (err.status === 0) {
          this.showSnackbarMessage('Network error. Please check your connection and try again.', 'error');
        } else {
          this.showSnackbarMessage('Failed to load logs. Please try again.', 'error');
        }
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
          this.showSnackbarMessage('Failed to load backups.', 'error');
        }
      },
      error: (err: any) => {
        this.backupLoading = false;
        console.error('Error loading backups:', err);
        
        // More specific error handling
        if (err.status === 403) {
          this.showSnackbarMessage('Access denied. Please ensure you are logged in as an administrator.', 'error');
        } else if (err.status === 401) {
          this.showSnackbarMessage('Authentication failed. Please log in again.', 'error');
          // Automatically redirect to login
          this.authService.logout();
          this.router.navigate(['/login']);
        } else if (err.status === 0) {
          this.showSnackbarMessage('Network error. Please check your connection and try again.', 'error');
        } else {
          this.showSnackbarMessage('Failed to load backups. Please try again.', 'error');
        }
      }
    });
  }

  createBackup() {
    this.backupLoading = true;
    this.error = '';
    this.successMessage = '';

    this.adminService.createBackup().subscribe({
      next: (response: CreateBackupResponse) => {
        this.backupLoading = false;
        if (response.success) {
          this.showSnackbarMessage(response.message, 'success');
          // Add the new backup to the list
          const newBackup: BackupEntry = {
            filename: response.filename,
            size: response.size,
            createdAt: response.createdAt,
            modifiedAt: response.createdAt // Using createdAt as modifiedAt since it's a new backup
          };
          this.allBackups.unshift(newBackup);
        } else {
          this.showSnackbarMessage('Failed to create backup.', 'error');
        }
      },
      error: (err: any) => {
        this.backupLoading = false;
        console.error('Error creating backup:', err);

        // More specific error handling
        if (err.status === 403) {
          this.showSnackbarMessage('Access denied. Please ensure you are logged in as an administrator.', 'error');
        } else if (err.status === 401) {
          this.showSnackbarMessage('Authentication failed. Please log in again.', 'error');
          // Automatically redirect to login
          this.authService.logout();
          this.router.navigate(['/login']);
        } else if (err.status === 0) {
          this.showSnackbarMessage('Network error. Please check your connection and try again.', 'error');
        } else {
          this.showSnackbarMessage('Failed to create backup. Please try again.', 'error');
        }
      }
    });
  }

  openBackupDeleteConfirm(filename: string) {
    this.deleteItemType = 'backup';
    this.deleteBackupFilename = filename;
    this.showBackupDeleteConfirm = true;
    // Reset actionLoading flag when opening confirmation
    this.actionLoading = false;
  }

  closeBackupDeleteConfirm() {
    this.showBackupDeleteConfirm = false;
    this.deleteItemType = '';
    this.deleteBackupFilename = '';
  }

  confirmBackupDelete() {
    // Ensure we have the right data before proceeding
    if (this.deleteItemType === 'backup' && this.deleteBackupFilename) {
      this.actionLoading = true;

      this.adminService.deleteBackup(this.deleteBackupFilename).subscribe({
        next: (response: DeleteBackupResponse) => {
          this.actionLoading = false;
          this.closeBackupDeleteConfirm();
          
          if (response.success) {
            this.showSnackbarMessage(response.message, 'success');
            // Remove the deleted backup from the list
            this.allBackups = this.allBackups.filter(backup => backup.filename !== this.deleteBackupFilename);
          } else {
            this.showSnackbarMessage('Failed to delete backup.', 'error');
          }
        },
        error: (err: any) => {
          this.actionLoading = false;
          this.closeBackupDeleteConfirm();

          // More specific error handling
          if (err.status === 403) {
            this.showSnackbarMessage('Access denied. Please ensure you are logged in as an administrator.', 'error');
          } else if (err.status === 401) {
            this.showSnackbarMessage('Authentication failed. Please log in again.', 'error');
            // Automatically redirect to login
            this.authService.logout();
            this.router.navigate(['/login']);
          } else if (err.status === 0) {
            this.showSnackbarMessage('Network error. Please check your connection and try again.', 'error');
          } else {
            this.showSnackbarMessage('Failed to delete backup. Please try again.', 'error');
          }
        }
      });
    }
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
        
        this.showSnackbarMessage('Logs exported successfully', 'success');
      },
      error: (err: any) => {
        this.logLoading = false;
        console.error('Error exporting logs:', err);

        // More specific error handling
        if (err.status === 403) {
          this.showSnackbarMessage('Access denied. Please ensure you are logged in as an administrator.', 'error');
        } else if (err.status === 401) {
          this.showSnackbarMessage('Authentication failed. Please log in again.', 'error');
          // Automatically redirect to login
          this.authService.logout();
          this.router.navigate(['/login']);
        } else if (err.status === 0) {
          this.showSnackbarMessage('Network error. Please check your connection and try again.', 'error');
        } else {
          this.showSnackbarMessage('Failed to export logs. Please try again.', 'error');
        }
      }
    });
  }

  downloadBackup(filename: string) {
    this.adminService.downloadBackup(filename).subscribe({
      next: (response: Blob) => {
        // Create a download link for the backup file
        const url = window.URL.createObjectURL(response);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        this.showSnackbarMessage('Backup downloaded successfully', 'success');
      },
      error: (err: any) => {
        console.error('Error downloading backup:', err);
        
        if (err.status === 403) {
          this.showSnackbarMessage('Access denied. Please ensure you are logged in as an administrator.', 'error');
        } else if (err.status === 401) {
          this.showSnackbarMessage('Authentication failed. Please log in again.', 'error');
          this.authService.logout();
          this.router.navigate(['/login']);
        } else if (err.status === 0) {
          this.showSnackbarMessage('Network error. Please check your connection and try again.', 'error');
        } else {
          this.showSnackbarMessage('Failed to download backup. Please try again.', 'error');
        }
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
          this.updatePaginatedTeachers();
        }
        this.showSnackbarMessage(response.message, 'success');
      },
      error: (err: any) => {
        this.actionLoading = false;
        console.error('Error toggling teacher activation:', err);
        
        if (err.status === 403) {
          this.showSnackbarMessage('Access denied. Please ensure you are logged in as an administrator.', 'error');
        } else if (err.status === 401) {
          this.showSnackbarMessage('Authentication failed. Please log in again.', 'error');
          this.authService.logout();
          this.router.navigate(['/login']);
        } else if (err.status === 0) {
          this.showSnackbarMessage('Network error. Please check your connection and try again.', 'error');
        } else {
          this.showSnackbarMessage('Failed to toggle teacher activation. Please try again.', 'error');
        }
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
          this.updatePaginatedStudents();
        }
        this.showSnackbarMessage(response.message, 'success');
      },
      error: (err: any) => {
        this.actionLoading = false;
        console.error('Error toggling student activation:', err);
        
        if (err.status === 403) {
          this.showSnackbarMessage('Access denied. Please ensure you are logged in as an administrator.', 'error');
        } else if (err.status === 401) {
          this.showSnackbarMessage('Authentication failed. Please log in again.', 'error');
          this.authService.logout();
          this.router.navigate(['/login']);
        } else if (err.status === 0) {
          this.showSnackbarMessage('Network error. Please check your connection and try again.', 'error');
        } else {
          this.showSnackbarMessage('Failed to toggle student activation. Please try again.', 'error');
        }
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

  closeCreateTeacherForm() {
    this.showCreateTeacherForm = false;
  }

  createTeacher() {
    this.actionLoading = true;
    this.adminService.createTeacher(this.newTeacher).subscribe({
      next: (response: CreateResponse) => {
        this.actionLoading = false;
        this.closeCreateTeacherForm();
        this.showSnackbarMessage(response.message, 'success');
        // Reload users to show the new teacher
        this.loadAllUsers();
      },
      error: (err: any) => {
        this.actionLoading = false;
        console.error('Error creating teacher:', err);
        
        if (err.status === 403) {
          this.showSnackbarMessage('Access denied. Please ensure you are logged in as an administrator.', 'error');
        } else if (err.status === 401) {
          this.showSnackbarMessage('Authentication failed. Please log in again.', 'error');
          this.authService.logout();
          this.router.navigate(['/login']);
        } else if (err.status === 0) {
          this.showSnackbarMessage('Network error. Please check your connection and try again.', 'error');
        } else {
          this.showSnackbarMessage('Failed to create teacher. Please try again.', 'error');
        }
      }
    });
  }

  openCreateStudentForm() {
    this.newStudent = {
      username: '',
      email: '',
      password: ''
    };
    this.showCreateStudentForm = true;
  }

  closeCreateStudentForm() {
    this.showCreateStudentForm = false;
  }

  // Admin form methods
  openCreateAdminForm() {
    this.newAdmin = {
      username: '',
      email: '',
      password: ''
    };
    this.showCreateAdminForm = true;
  }

  closeCreateAdminForm() {
    this.showCreateAdminForm = false;
  }

  createAdmin() {
    this.actionLoading = true;
    this.adminService.createAdmin(this.newAdmin).subscribe({
      next: (response: CreateResponse) => {
        this.actionLoading = false;
        this.closeCreateAdminForm();
        this.showSnackbarMessage(response.message, 'success');
        // Reload users to show the new admin
        this.loadAllUsers();
      },
      error: (err: any) => {
        this.actionLoading = false;
        console.error('Error creating admin:', err);
        
        if (err.status === 403) {
          this.showSnackbarMessage('Access denied. Please ensure you are logged in as an administrator.', 'error');
        } else if (err.status === 401) {
          this.showSnackbarMessage('Authentication failed. Please log in again.', 'error');
          this.authService.logout();
          this.router.navigate(['/login']);
        } else if (err.status === 0) {
          this.showSnackbarMessage('Network error. Please check your connection and try again.', 'error');
        } else {
          this.showSnackbarMessage('Failed to create admin. Please try again.', 'error');
        }
      }
    });
  }

  createStudent() {
    this.actionLoading = true;
    this.adminService.createStudent(this.newStudent).subscribe({
      next: (response: CreateResponse) => {
        this.actionLoading = false;
        this.closeCreateStudentForm();
        this.showSnackbarMessage(response.message, 'success');
        // Reload users to show the new student
        this.loadAllUsers();
      },
      error: (err: any) => {
        this.actionLoading = false;
        console.error('Error creating student:', err);
        
        if (err.status === 403) {
          this.showSnackbarMessage('Access denied. Please ensure you are logged in as an administrator.', 'error');
        } else if (err.status === 401) {
          this.showSnackbarMessage('Authentication failed. Please log in again.', 'error');
          this.authService.logout();
          this.router.navigate(['/login']);
        } else if (err.status === 0) {
          this.showSnackbarMessage('Network error. Please check your connection and try again.', 'error');
        } else {
          this.showSnackbarMessage('Failed to create student. Please try again.', 'error');
        }
      }
    });
  }

  openDeleteConfirm(itemType: string, itemId: number, itemName: string) {
    this.deleteItemType = itemType;
    this.deleteItemId = itemId;
    this.deleteItemName = itemName;
    this.showDeleteConfirm = true;
  }

  closeDeleteConfirm() {
    this.showDeleteConfirm = false;
    this.deleteItemType = '';
    this.deleteItemId = 0;
    this.deleteItemName = '';
  }

  confirmDelete() {
    if (this.deleteItemType === 'teacher') {
      this.actionLoading = true;
      this.adminService.deleteTeacher(this.deleteItemId).subscribe({
        next: (response: DeleteResponse) => {
          this.actionLoading = false;
          this.closeDeleteConfirm();
          this.showSnackbarMessage(response.message, 'success');
          // Reload users to reflect the deletion
          this.loadAllUsers();
        },
        error: (err: any) => {
          this.actionLoading = false;
          this.closeDeleteConfirm();
          console.error('Error deleting teacher:', err);
          
          if (err.status === 403) {
            this.showSnackbarMessage('Access denied. Please ensure you are logged in as an administrator.', 'error');
          } else if (err.status === 401) {
            this.showSnackbarMessage('Authentication failed. Please log in again.', 'error');
            this.authService.logout();
            this.router.navigate(['/login']);
          } else if (err.status === 0) {
            this.showSnackbarMessage('Network error. Please check your connection and try again.', 'error');
          } else {
            this.showSnackbarMessage('Failed to delete teacher. Please try again.', 'error');
          }
        }
      });
    } else if (this.deleteItemType === 'student') {
      this.actionLoading = true;
      this.adminService.deleteStudent(this.deleteItemId).subscribe({
        next: (response: DeleteResponse) => {
          this.actionLoading = false;
          this.closeDeleteConfirm();
          this.showSnackbarMessage(response.message, 'success');
          // Reload users to reflect the deletion
          this.loadAllUsers();
        },
        error: (err: any) => {
          this.actionLoading = false;
          this.closeDeleteConfirm();
          console.error('Error deleting student:', err);
          
          if (err.status === 403) {
            this.showSnackbarMessage('Access denied. Please ensure you are logged in as an administrator.', 'error');
          } else if (err.status === 401) {
            this.showSnackbarMessage('Authentication failed. Please log in again.', 'error');
            this.authService.logout();
            this.router.navigate(['/login']);
          } else if (err.status === 0) {
            this.showSnackbarMessage('Network error. Please check your connection and try again.', 'error');
          } else {
            this.showSnackbarMessage('Failed to delete student. Please try again.', 'error');
          }
        }
      });
    }
  }

  openCourseDeleteConfirm(courseId: number, courseTitle: string) {
    this.deleteCourseId = courseId;
    this.deleteCourseTitle = courseTitle;
    this.showCourseDeleteConfirm = true;
  }

  closeCourseDeleteConfirm() {
    this.showCourseDeleteConfirm = false;
    this.deleteCourseId = 0;
    this.deleteCourseTitle = '';
  }

  confirmCourseDelete() {
    this.actionLoading = true;
    this.adminService.deleteCourse(this.deleteCourseId).subscribe({
      next: (response: DeleteResponse) => {
        this.actionLoading = false;
        this.closeCourseDeleteConfirm();
        this.showSnackbarMessage(response.message, 'success');
        // Reload courses to reflect the deletion
        this.loadAllCourses();
      },
      error: (err: any) => {
        this.actionLoading = false;
        this.closeCourseDeleteConfirm();
        console.error('Error deleting course:', err);
        
        if (err.status === 403) {
          this.showSnackbarMessage('Access denied. Please ensure you are logged in as an administrator.', 'error');
        } else if (err.status === 401) {
          this.showSnackbarMessage('Authentication failed. Please log in again.', 'error');
          this.authService.logout();
          this.router.navigate(['/login']);
        } else if (err.status === 0) {
          this.showSnackbarMessage('Network error. Please check your connection and try again.', 'error');
        } else {
          this.showSnackbarMessage('Failed to delete course. Please try again.', 'error');
        }
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

  // Clear logs
  clearLogs() {
    this.logLoading = true;
    this.error = '';
    this.successMessage = '';

    this.adminService.clearLogs().subscribe({
      next: (response: { success: boolean; message: string }) => {
        this.logLoading = false;
        if (response.success) {
          this.showSnackbarMessage(response.message, 'success');
          // Clear the logs array
          this.allLogs = [];
          this.updatePaginatedLogs();
        } else {
          this.showSnackbarMessage('Failed to clear logs.', 'error');
        }
      },
      error: (err: any) => {
        this.logLoading = false;
        console.error('Error clearing logs:', err);

        // More specific error handling
        if (err.status === 403) {
          this.showSnackbarMessage('Access denied. Please ensure you are logged in as an administrator.', 'error');
        } else if (err.status === 401) {
          this.showSnackbarMessage('Authentication failed. Please log in again.', 'error');
          // Automatically redirect to login
          this.authService.logout();
          this.router.navigate(['/login']);
        } else if (err.status === 0) {
          this.showSnackbarMessage('Network error. Please check your connection and try again.', 'error');
        } else {
          this.showSnackbarMessage('Failed to clear logs. Please try again.', 'error');
        }
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // Snackbar methods
  showSnackbarMessage(message: string, type: 'success' | 'error') {
    this.snackbarMessage = message;
    this.snackbarType = type;
    this.showSnackbar = true;

    // Hide the snackbar after 3 seconds
    setTimeout(() => {
      this.hideSnackbar();
    }, 3000);
  }

  hideSnackbar() {
    this.showSnackbar = false;
  }

  // Helper function to format file size with appropriate units
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 bytes';
    
    const k = 1024;
    const sizes = ['bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    // If the size is less than 1 KB, show in bytes
    if (i === 0) {
      return bytes + ' ' + sizes[i];
    }
    
    // For larger sizes, show with 2 decimal places
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  refreshBackups() {
    this.loadAllBackups();
  }

  refreshLogs() {
    this.loadAllLogs();
  }
}
