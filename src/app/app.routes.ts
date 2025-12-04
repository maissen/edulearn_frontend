import { Routes } from '@angular/router';
import { AuthGuard, TeacherGuard } from '../guards/auth.guard';
import { NoAuthGuard } from '../guards/no-auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  {
    path: 'home',
    loadComponent: () => import('./home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login').then(m => m.Login),
    canActivate: [NoAuthGuard]
  },
  {
    path: 'signup',
    loadComponent: () => import('./auth/signup/signup').then(m => m.Signup),
    canActivate: [NoAuthGuard]
  },
  {
    path: 'student',
    loadComponent: () => import('./dashboard/student/student').then(m => m.Student),
    canActivate: [AuthGuard]
  },
  {
    path: 'admin',
    loadComponent: () => import('./dashboard/admin/admin').then(m => m.AdminComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'courses',
    loadComponent: () => import('./courses/courses').then(m => m.CoursesComponent)
  },
  {
    path: 'coursesManage',
    loadComponent: () => import('./dashboard/manage-courses/manage-courses').then(m => m.ManageCoursesComponent),
    canActivate: [TeacherGuard]
  },
  {
    path: 'category/:slug',
    loadComponent: () => import('./dashboard/category-page/category-page').then(c => c.CategoryPageComponent)
  },
  {
    path: 'profile',
    loadComponent: () => import('./dashboard/student-profile/student-profile').then(c => c.StudentProfileComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'course/:id',
    loadComponent: () => import('./dashboard/course-detail/course-detail').then(c => c.CourseDetailComponent)
  },
  {
    path: 'analytics',
    loadComponent: () => import('./dashboard/analytics/analytics').then(c => c.AnalyticsComponent)
  },
  {
    path: 'teacher/profile',
    loadComponent: () => import('./dashboard/teacher-profile/teacher-profile').then(c => c.TeacherProfileComponent),
    canActivate: [AuthGuard]
  }
];