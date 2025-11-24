import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ProfileService } from '../../../services/profile.service';

@Component({
  selector: 'app-teacher-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './teacher-profile.html',
  styleUrl: './teacher-profile.css'
})
export class TeacherProfileComponent implements OnInit {
  teacherName = '';
  teacherEmail = '';
  avatarUrl = 'https://i.pravatar.cc/150?u=teacher';
  isEditing = false;

  // Form data for editing
  editForm = {
    username: '',
    email: '',
    bio: '',
    specialization: ''
  };

  constructor(
    private router: Router,
    private authService: AuthService,
    private profileService: ProfileService
  ) {}

  ngOnInit() {
    this.loadTeacherData();
  }

  loadTeacherData() {
    this.profileService.getProfile().subscribe({
      next: (profile) => {
        this.teacherName = profile.username || 'Teacher';
        this.teacherEmail = profile.email || '';
        this.editForm.username = profile.username || '';
        this.editForm.email = profile.email || '';
        this.editForm.bio = profile.bio || '';
        this.editForm.specialization = profile.specialization || '';
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        const user = this.authService.getUser();
        if (user) {
          this.teacherName = user.username || 'Teacher';
          this.teacherEmail = user.email || '';
          this.editForm.username = user.username || '';
          this.editForm.email = user.email || '';
        }
      }
    });
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      // Reset form data if canceling edit
      this.loadTeacherData();
    }
  }

  saveProfile() {
    this.profileService.updateProfile(this.editForm).subscribe({
      next: (response) => {
        this.teacherName = this.editForm.username;
        this.teacherEmail = this.editForm.email;
        this.isEditing = false;
        alert('Profile updated successfully!');
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        alert('Error updating profile. Please try again.');
      }
    });
  }

  navigate(url: string) {
    this.router.navigateByUrl(url);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
