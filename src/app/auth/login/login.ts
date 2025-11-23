import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  loginForm: FormGroup;
  submitted = false;
  showPassword = false;
  errorMessage: string = '';
  loading = false;
  role: 'student' | 'teacher' | 'admin' = 'student';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      role: ['student', Validators.required]
    });
  }

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }
  get roleControl() { return this.loginForm.get('role'); }

  onSubmit() {
    this.submitted = true;
    this.errorMessage = '';

    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    const { email, password } = this.loginForm.value;
    const role = this.loginForm.value.role;

    let loginObservable;

    switch (role) {
      case 'student':
        loginObservable = this.authService.loginStudent({ email, password });
        break;
      case 'teacher':
        loginObservable = this.authService.loginTeacher({ email, password });
        break;
      case 'admin':
        loginObservable = this.authService.loginAdmin({ email, password });
        break;
      default:
        this.errorMessage = 'Invalid role selected';
        this.loading = false;
        return;
    }

    loginObservable.subscribe({
      next: (response) => {
        this.loading = false;
        // Route based on user role
        const userRole = response.user.role.toLowerCase();
        if (userRole === 'admin') {
          this.router.navigate(['/admin']);
        } else if (userRole === 'enseignant' || userRole === 'teacher') {
          this.router.navigate(['/teacher']);
        } else {
          this.router.navigate(['/student']);
        }
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.message || 'Login failed. Please check your credentials.';
        console.error('Login error:', error);
      }
    });
  }

  goToSignup() {
    this.router.navigate(['/signup']);
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    if (passwordInput) {
      passwordInput.type = this.showPassword ? 'text' : 'password';
    }
  }
}