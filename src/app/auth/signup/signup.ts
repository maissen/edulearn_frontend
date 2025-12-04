import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './signup.html',
  styleUrl: './signup.css'
})
export class Signup implements OnInit {
  signupForm: FormGroup;
  submitted = false;
  showPassword = false;
  errorMessage: string = '';
  successMessage: string = '';
  loading = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.signupForm = this.formBuilder.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
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
      this.router.navigate(['/student']);
    }
  }

  get username() { return this.signupForm.get('username'); }
  get email() { return this.signupForm.get('email'); }
  get password() { return this.signupForm.get('password'); }
  get role() { return this.signupForm.get('role'); }

  onRoleChange() {
    // No additional validation needed since we removed class selection
  }

  onSubmit() {
    this.submitted = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (this.signupForm.invalid) {
      return;
    }

    this.loading = true;
    const { username, email, password, role } = this.signupForm.value;

    let registerObservable;

    switch (role) {
      case 'student':
        registerObservable = this.authService.registerStudent({ username, email, password });
        break;
      case 'teacher':
        registerObservable = this.authService.registerTeacher({ username, email, password });
        break;
      default:
        this.errorMessage = 'Only student and teacher registration is available';
        this.loading = false;
        return;
    }

    registerObservable.subscribe({
      next: (response: any) => {
        this.loading = false;
        this.successMessage = response.message || 'Registration successful!';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error: any) => {
        this.loading = false;

        // Handle specific error cases
        if (error.error?.error?.includes('foreign key constraint') ||
            error.error?.error?.includes('class') ||
            error.status === 500) {
          this.errorMessage = 'Service temporairement indisponible. Veuillez contacter l\'administrateur.';
        } else {
          this.errorMessage = error.error?.message || 'Erreur lors de l\'inscription. Veuillez réessayer.';
        }

        console.error('Signup error:', error);
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    if (passwordInput) {
      passwordInput.type = this.showPassword ? 'text' : 'password';
    }
  }
}