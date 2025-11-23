// ============================================
// auth.service.ts
// ============================================
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
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
    private apiUrl = 'http://localhost:3000/auth';
    constructor(private http: HttpClient) {}
    register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(${this.apiUrl}/register, data).pipe(
    tap(response => this.setToken(response.token))
    );
}
login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(${this.apiUrl}/login, data).pipe(
    tap(response => this.setToken(response.token))
    );
}

logout(): void {
    localStorage.removeItem('token');
}
setToken(token: string): void {
    localStorage.setItem('token', token);
}
getToken(): string | null {
    return localStorage.getItem('token');
}
isAuthenticated(): boolean {
    return !!this.getToken();
}
}