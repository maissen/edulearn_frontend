import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api.config';
import { AuthService } from './auth.service';

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface TeacherUser {
  id: number;
  username: string;
  email: string;
  module: string;
  biography: string;
  isActivated: boolean;
  created_at: string;
  updated_at: string;
}

export interface StudentUser {
  id: number;
  username: string;
  email: string;
  classe_id: number;
  biography: string;
  isActivated: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminUsersResponse {
  admins: AdminUser[];
  teachers: TeacherUser[];
  students: StudentUser[];
}

export interface TestInfo {
  id: number;
  title: string;
  description: string;
  question_count: number;
}

export interface TeacherCourse {
  id: number;
  title: string;
  description: string;
  category: string;
  youtube_url: string;
  image_url: string;
  created_at: string;
  updated_at: string;
  test: TestInfo;
  enrolled_student_count: number;
  average_test_score: number;
}

export interface TeacherWithCourses {
  id: number;
  username: string;
  email: string;
  module: string;
  courses: TeacherCourse[];
}

export interface TeacherCoursesResponse {
  teachers: TeacherWithCourses[];
}

export interface ActivationResponse {
  message: string;
  isActivated: boolean;
}

export interface CreateTeacherRequest {
  username: string;
  email: string;
  password: string;
  module?: string;
}

export interface CreateStudentRequest {
  username: string;
  email: string;
  password: string;
}

export interface CreateResponse {
  message: string;
  teacherId?: number;
  studentId?: number;
}

export interface DeleteResponse {
  message: string;
}

export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  service: string;
  userId: number;
}

export interface LogsResponse {
  success: boolean;
  count: number;
  logs: LogEntry[];
}

// Placeholder interface for backups - to be updated when API is available
export interface BackupEntry {
  id: number;
  name: string;
  createdAt: string;
  size: string;
}

export interface BackupsResponse {
  success: boolean;
  count: number;
  backups: BackupEntry[];
}

export interface CreateBackupResponse {
  success: boolean;
  message: string;
  filename: string;
  size: number;
  createdAt: string;
}

export interface DeleteBackupResponse {
  success: boolean;
  message: string;
  filename: string;
}

export interface StatisticsResponse {
  users: {
    admins: number;
    teachers: number;
    students: number;
  };
  content: {
    courses: number;
    tests: number;
    questions: number;
    classes: number;
  };
  interactions: {
    forumPosts: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${API_BASE_URL}/admin`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Get all users (admins, teachers, and students) with all their details
   * @returns Observable of AdminUsersResponse
   */
  getAllUsers(): Observable<AdminUsersResponse> {
    const token = this.authService.getToken();
    let headers = new HttpHeaders();
    
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    
    return this.http.get<AdminUsersResponse>(`${this.apiUrl}/users`, { headers });
  }

  /**
   * Get all courses of teachers with all details
   * @returns Observable of TeacherCoursesResponse
   */
  getTeacherCourses(): Observable<TeacherCoursesResponse> {
    const token = this.authService.getToken();
    let headers = new HttpHeaders();
    
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    
    return this.http.get<TeacherCoursesResponse>(`${this.apiUrl}/teacher-courses`, { headers });
  }

  /**
   * Toggle activation status for a teacher
   * @param id Teacher ID
   * @param isActivated New activation status
   * @returns Observable of ActivationResponse
   */
  toggleTeacherActivation(id: number, isActivated: boolean): Observable<ActivationResponse> {
    const token = this.authService.getToken();
    let headers = new HttpHeaders();
    
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    
    return this.http.patch<ActivationResponse>(
      `${this.apiUrl}/teachers/${id}/activation`,
      { isActivated: !isActivated }, // Send the opposite value to toggle
      { headers }
    );
  }

  /**
   * Toggle activation status for a student
   * @param id Student ID
   * @param isActivated New activation status
   * @returns Observable of ActivationResponse
   */
  toggleStudentActivation(id: number, isActivated: boolean): Observable<ActivationResponse> {
    const token = this.authService.getToken();
    let headers = new HttpHeaders();
    
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    
    return this.http.patch<ActivationResponse>(
      `${this.apiUrl}/students/${id}/activation`,
      { isActivated: !isActivated }, // Send the opposite value to toggle
      { headers }
    );
  }

  /**
   * Create a new teacher account
   * @param teacher Teacher data
   * @returns Observable of CreateResponse
   */
  createTeacher(teacher: CreateTeacherRequest): Observable<CreateResponse> {
    const token = this.authService.getToken();
    let headers = new HttpHeaders();
    
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    
    return this.http.post<CreateResponse>(
      `${this.apiUrl}/teachers`,
      teacher,
      { headers }
    );
  }

  /**
   * Create a new student account
   * @param student Student data
   * @returns Observable of CreateResponse
   */
  createStudent(student: CreateStudentRequest): Observable<CreateResponse> {
    const token = this.authService.getToken();
    let headers = new HttpHeaders();
    
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    
    return this.http.post<CreateResponse>(
      `${this.apiUrl}/students`,
      student,
      { headers }
    );
  }

  /**
   * Delete a teacher account and all related data
   * @param id Teacher ID
   * @returns Observable of DeleteResponse
   */
  deleteTeacher(id: number): Observable<DeleteResponse> {
    const token = this.authService.getToken();
    let headers = new HttpHeaders();
    
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    
    return this.http.delete<DeleteResponse>(
      `${this.apiUrl}/teachers/${id}`,
      { headers }
    );
  }

  /**
   * Delete a student account and all related data
   * @param id Student ID
   * @returns Observable of DeleteResponse
   */
  deleteStudent(id: number): Observable<DeleteResponse> {
    const token = this.authService.getToken();
    let headers = new HttpHeaders();
    
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    
    return this.http.delete<DeleteResponse>(
      `${this.apiUrl}/students/${id}`,
      { headers }
    );
  }

  /**
   * Delete a course and all related data
   * @param id Course ID
   * @returns Observable of DeleteResponse
   */
  deleteCourse(id: number): Observable<DeleteResponse> {
    const token = this.authService.getToken();
    let headers = new HttpHeaders();
    
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    
    return this.http.delete<DeleteResponse>(
      `${this.apiUrl}/courses/${id}`,
      { headers }
    );
  }

  /**
   * Get recent log entries from the application logs
   * @param count Number of log entries to return (default: 50, max: 1000)
   * @param type Type of logs to retrieve ('combined' or 'error', default: 'combined')
   * @returns Observable of LogsResponse
   */
  getLogs(count: number = 50, type: string = 'combined'): Observable<LogsResponse> {
    const token = this.authService.getToken();
    let headers = new HttpHeaders();
    
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    
    const params = {
      count: count.toString(),
      type: type
    };
    
    return this.http.get<LogsResponse>(`${this.apiUrl}/logs`, { headers, params });
  }

  /**
   * Export application logs as a CSV file
   * @param type Type of logs to export ('combined' or 'error', default: 'combined')
   * @returns Observable of CSV file content
   */
  exportLogs(type: string = 'combined'): Observable<Blob> {
    const token = this.authService.getToken();
    let headers = new HttpHeaders();
    
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    
    const params = { type };
    
    return this.http.get(`${this.apiUrl}/logs/export`, { 
      headers, 
      params, 
      responseType: 'blob' 
    });
  }

  /**
   * Get system statistics including counts of users, content, and interactions
   * @returns Observable of StatisticsResponse
   */
  getStatistics(): Observable<StatisticsResponse> {
    const token = this.authService.getToken();
    let headers = new HttpHeaders();
    
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    
    return this.http.get<StatisticsResponse>(`${this.apiUrl}/statistics`, { headers });
  }

  /**
   * Get available backups (placeholder implementation)
   * @returns Observable of BackupsResponse
   */
  getBackups(): Observable<BackupsResponse> {
    const token = this.authService.getToken();
    let headers = new HttpHeaders();
    
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    
    // When API is available, use this line:
    return this.http.get<BackupsResponse>(`${this.apiUrl}/backup`, { headers });
    
    // Placeholder - remove when API is available
    // return new Observable<BackupsResponse>((observer: any) => {
    //   // Simulate API response
    //   setTimeout(() => {
    //     observer.next({
    //       success: true,
    //       count: 3,
    //       backups: [
    //         {
    //           id: 1,
    //           name: 'backup_2025-12-04_14-30-00.zip',
    //           createdAt: '2025-12-04T14:30:00.000Z',
    //           size: '125 MB'
    //         },
    //         {
    //           id: 2,
    //           name: 'backup_2025-12-03_10-15-00.zip',
    //           createdAt: '2025-12-03T10:15:00.000Z',
    //           size: '118 MB'
    //         },
    //         {
    //           id: 3,
    //           name: 'backup_2025-12-02_09-45-00.zip',
    //           createdAt: '2025-12-02T09:45:00.000Z',
    //           size: '132 MB'
    //         }
    //       ]
    //     });
    //     observer.complete();
    //   }, 500);
    // });
  }

  /**
   * Create a new database backup
   * @returns Observable of CreateBackupResponse
   */
  createBackup(): Observable<CreateBackupResponse> {
    const token = this.authService.getToken();
    let headers = new HttpHeaders();
    
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    
    return this.http.post<CreateBackupResponse>(`${this.apiUrl}/backup`, {}, { headers });
  }

  /**
   * Delete a specific database backup file
   * @param filename Name of the backup file to delete
   * @returns Observable of DeleteBackupResponse
   */
  deleteBackup(filename: string): Observable<DeleteBackupResponse> {
    const token = this.authService.getToken();
    let headers = new HttpHeaders();
    
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    
    return this.http.delete<DeleteBackupResponse>(
      `${this.apiUrl}/backups/${filename}`, 
      { headers }
    );
  }

  /**
   * Download a backup file
   * @param id Backup ID
   */
  downloadBackup(id: number): void {
    // Placeholder - replace with actual download logic when API is available
    console.log(`Downloading backup with ID: ${id}`);
    alert(`Download functionality would be implemented here. Backup ID: ${id}`);
    
    // When API is available, implement actual download logic:
    // const token = this.authService.getToken();
    // const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    // return this.http.get(`${this.apiUrl}/backups/${id}/download`, { headers, responseType: 'blob' });
  }
}