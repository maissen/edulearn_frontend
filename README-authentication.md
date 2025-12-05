# Authentication System Guide

This guide is intended for developers working on the authentication system of the EduLearn platform.

## Overview

The authentication system handles user registration, login, and session management for three user roles:
- Students
- Teachers
- Administrators

## Key Files

- `src/app/auth/login/login.ts` - Login component
- `src/app/auth/signup/signup.ts` - Signup component
- `src/services/auth.service.ts` - Authentication service
- `src/guards/auth.guard.ts` - Route protection
- `src/guards/no-auth.guard.ts` - Guest route protection

## Authentication Flow

### Login Process

1. Users select their role (student, teacher, or admin)
2. Credentials are validated through the appropriate endpoint:
   - Students: `/auth/login/student`
   - Teachers: `/auth/login/teacher`
   - Admins: `/auth/login/admin`
3. Upon successful authentication, a JWT token is stored in localStorage
4. User is redirected to their respective dashboard

### Registration Process

1. Users provide username, email, password, and select role
2. Data is sent to the appropriate endpoint:
   - Students: `/auth/register/student`
   - Teachers: `/auth/register/teacher`
3. Upon successful registration, user is redirected to login page

## AuthService Methods

- `loginStudent(data)` - Authenticate student
- `loginTeacher(data)` - Authenticate teacher
- `loginAdmin(data)` - Authenticate admin
- `registerStudent(data)` - Register new student
- `registerTeacher(data)` - Register new teacher
- `logout()` - Clear user session
- `isAuthenticated()` - Check if user has valid session
- `isAdmin()` - Check if user is admin
- `isTeacher()` - Check if user is teacher
- `isStudent()` - Check if user is student

## Route Guards

- `AuthGuard` - Protects routes that require authentication
- `NoAuthGuard` - Protects routes that should only be accessible to guests

## Best Practices

1. Always check user role before displaying UI elements
2. Use `isAuthenticated()` method to check session status
3. Implement proper error handling for authentication failures
4. Never store sensitive information in localStorage beyond the JWT token

## API Endpoints

Base URL: `http://79.137.34.134:5000`

- POST `/auth/login/student`
- POST `/auth/login/teacher`
- POST `/auth/login/admin`
- POST `/auth/register/student`
- POST `/auth/register/teacher`