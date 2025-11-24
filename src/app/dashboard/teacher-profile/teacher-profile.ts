import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ProfileService } from '../../../services/profile.service';
import { EnseignantService, TeacherStats } from '../../../services/enseignant.service';
import { NavbarComponent } from '../../shared/navbar/navbar';
import { LogoComponent } from '../../shared/logo/logo.component';

@Component({
  selector: 'app-teacher-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent, LogoComponent],
  templateUrl: './teacher-profile.html',
  styleUrl: './teacher-profile.css'
})
export class TeacherProfileComponent implements OnInit {
  teacherName = '';
  teacherEmail = '';
  avatarUrl = 'https://i.pravatar.cc/150?u=teacher';
  showProfileModal = false;

  // Statistics
  stats = {
    activeCourses: 0,
    totalEnrollments: 0,
    averageRating: 0,
    satisfactionRate: 0
  };

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
    private profileService: ProfileService,
    private enseignantService: EnseignantService
  ) {}

  ngOnInit() {
    this.loadTeacherData();
    this.loadTeacherStats();
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

  loadTeacherStats() {
    const user = this.authService.getUser();
    if (user && user.id) {
      this.enseignantService.getTeacherStats(user.id).subscribe({
        next: (apiStats: TeacherStats) => {
          this.stats = {
            activeCourses: apiStats.activeCourses,
            totalEnrollments: apiStats.totalEnrollments,
            averageRating: apiStats.averageRating,
            satisfactionRate: apiStats.satisfactionRate
          };
        },
        error: (error) => {
          console.error('Error loading teacher stats:', error);
          // Fallback to zeros if API fails
          this.stats = {
            activeCourses: 0,
            totalEnrollments: 0,
            averageRating: 0,
            satisfactionRate: 0
          };
        }
      });
    }
  }

  openUpdateProfileModal() {
    // Load current data into form
    this.editForm = {
      username: this.teacherName,
      email: this.teacherEmail,
      bio: this.editForm.bio || '',
      specialization: this.editForm.specialization || ''
    };
    this.showProfileModal = true;
  }

  closeProfileModal() {
    this.showProfileModal = false;
    this.editForm = {
      username: '',
      email: '',
      bio: '',
      specialization: ''
    };
  }

  isProfileFormValid(): boolean {
    return !!(
      this.editForm.username?.trim() &&
      this.editForm.email?.trim() &&
      this.editForm.email.includes('@')
    );
  }

  saveProfile() {
    if (!this.isProfileFormValid()) return;

    this.profileService.updateProfile(this.editForm).subscribe({
      next: (response: any) => {
        this.teacherName = this.editForm.username;
        this.teacherEmail = this.editForm.email;
        this.closeProfileModal();
        alert('Profil mis à jour avec succès !');
      },
      error: (error: any) => {
        console.error('Error updating profile:', error);
        alert('Erreur lors de la mise à jour du profil. Veuillez réessayer.');
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
