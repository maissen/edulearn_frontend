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
}