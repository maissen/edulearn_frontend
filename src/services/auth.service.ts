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
  email: string;
  password: string;
  nom: string;
  prenom: string;
  role: 'etudiant' | 'enseignant' | 'admin';
}

export interface AuthResponse {
  token: string;
  user: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // Construct the full auth API URL
  private apiUrl = `${API_BASE_URL}/auth`;

  constructor(private http: HttpClient) {}

  /**
   * Register a new user.
   * @param data RegisterRequest object containing email, password, name, and role
   * @returns Observable of AuthResponse
   */
  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
      tap(response => this.setToken(response.token))
    );
  }

  /**
   * Login a user.
   * @param data LoginRequest object containing email and password
   * @returns Observable of AuthResponse
   */

  // save the fetched token as a local storage in the browser (caching)
  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data).pipe(
      tap(response => this.setToken(response.token))
    );
  }

  /**
   * Log out the user by removing the token from localStorage.
   */

  // remove the token from the local storage to logout the user
  logout(): void {
    localStorage.removeItem('token');
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
   * Check if the user is authenticated (i.e., token exists).
   * @returns boolean
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
