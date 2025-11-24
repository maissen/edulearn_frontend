import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { API_BASE_URL } from '../api.config';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  expiration_date: number;
  user: {
    id: number;
    username: string;
    email: string;
    role: string;
  };
}

export interface RegisterResponse {
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // Construct the full auth API URL
  private apiUrl = `${API_BASE_URL}/auth`;

  constructor(private http: HttpClient) {}

  /**
   * Register a new student.
   * @param data RegisterRequest object containing username, email, and password
   * @returns Observable of RegisterResponse
   */
  registerStudent(data: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register/student`, data);
  }

  /**
   * Register a new teacher.
   * @param data RegisterRequest object containing username, email, and password
   * @returns Observable of RegisterResponse
   */
  registerTeacher(data: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register/teacher`, data);
  }

  /**
   * Login as a student.
   * @param data LoginRequest object containing email and password
   * @returns Observable of AuthResponse
   */
  loginStudent(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login/student`, data).pipe(
      tap(response => {
        this.setToken(response.token);
        this.setUser(response.user);
      })
    );
  }

  /**
   * Login as a teacher.
   * @param data LoginRequest object containing email and password
   * @returns Observable of AuthResponse
   */
  loginTeacher(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login/teacher`, data).pipe(
      tap(response => {
        this.setToken(response.token);
        this.setUser(response.user);
      })
    );
  }

  /**
   * Login as an admin.
   * @param data LoginRequest object containing email and password
   * @returns Observable of AuthResponse
   */
  loginAdmin(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login/admin`, data).pipe(
      tap(response => {
        this.setToken(response.token);
        this.setUser(response.user);
      })
    );
  }

  /**
   * Log out the user by removing the token and user data from localStorage.
   */
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  /**
   * Store the JWT token in localStorage.
   * @param token JWT token string
   */
  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  /**
   * Get the JWT token from localStorage.
   * @returns JWT token string or null
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Store the user data in localStorage.
   * @param user User object
   */
  setUser(user: any): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  /**
   * Get the user data from localStorage.
   * @returns User object or null
   */
  getUser(): any {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Get the user role from localStorage.
   * @returns User role string or null
   */
  getUserRole(): string | null {
    const user = this.getUser();
    return user ? user.role : null;
  }

  /**
   * Check if the token is expired.
   * @returns boolean
   */
  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationDate = payload.exp * 1000; // Convert to milliseconds
      return Date.now() >= expirationDate;
    } catch (error) {
      console.error('Error parsing token:', error);
      return true;
    }
  }

  /**
   * Check if the user is authenticated (i.e., token exists and is not expired).
   * @returns boolean
   */
  isAuthenticated(): boolean {
    return !!this.getToken() && !this.isTokenExpired();
  }

  /**
   * Check if the user is an admin.
   * @returns boolean
   */
  isAdmin(): boolean {
    return this.getUserRole() === 'admin';
  }

  /**
   * Check if the user is a teacher.
   * @returns boolean
   */
  isTeacher(): boolean {
    return this.getUserRole() === 'enseignant' || this.getUserRole() === 'teacher';
  }

  /**
   * Check if the user is a student.
   * @returns boolean
   */
  isStudent(): boolean {
    return this.getUserRole() === 'etudiant' || this.getUserRole() === 'student';
  }
}
