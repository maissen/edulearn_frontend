import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { ProfileService } from '../../../services/profile.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit {
  loginForm: FormGroup;
  submitted = false;
  showPassword = false;
  errorMessage: string = '';
  loading = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private profileService: ProfileService
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      role: ['student', Validators.required]
    });
  }

  ngOnInit() {
    // If user is already authenticated, redirect them to their dashboard
    if (this.authService.isAuthenticated()) {
      this.redirectToDashboard();
    }
  }

  private redirectToDashboard() {
    const userRole = this.authService.getUserRole();
    
    if (userRole === 'admin') {
      this.router.navigate(['/admin']);
    } else if (userRole === 'enseignant' || userRole === 'teacher') {
      this.router.navigate(['/teacher/profile']);
    } else {
      this.router.navigate(['/profile']);
    }
  }

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }

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
      next: (response: any) => {
        // After successful login, verify account is active by checking profile
        this.profileService.getProfile().subscribe({
          next: (profile: any) => {
            // If profile loads successfully, account is active, proceed with navigation
            this.loading = false;
            const userRole = response.user.role.toLowerCase();
            if (userRole === 'admin') {
              this.router.navigate(['/admin']);
            } else if (userRole === 'enseignant' || userRole === 'teacher') {
              this.router.navigate(['/teacher/profile']);
            } else {
              this.router.navigate(['/profile']);
            }
          },
          error: (profileError: any) => {
            // If profile loading fails, check if it's due to deactivated account
            this.loading = false;
            if (profileError.status === 403 && profileError.error?.message?.includes('deactivated')) {
              // Account is deactivated, show error on login page
              this.errorMessage = profileError.error.message;
              // Clear auth data since login should not proceed
              this.authService.logout();
            } else {
              // Some other error occurred, still navigate but user will see error on profile page
              const userRole = response.user.role.toLowerCase();
              if (userRole === 'admin') {
                this.router.navigate(['/admin']);
              } else if (userRole === 'enseignant' || userRole === 'teacher') {
                this.router.navigate(['/teacher/profile']);
              } else {
                this.router.navigate(['/profile']);
              }
            }
          }
        });
      },
      error: (error: any) => {
        this.loading = false;
        // Handle login errors (wrong credentials, etc.)
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