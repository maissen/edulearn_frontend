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
}