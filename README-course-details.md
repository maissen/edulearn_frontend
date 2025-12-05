# Course Details System Guide

This guide is intended for developers working on the course details and display features of the EduLearn platform.

## Overview

The course details system displays comprehensive information about courses to students and teachers. It includes course content, videos, tests, and enrollment functionality.

## Key Files

- `src/app/dashboard/course-detail/course-detail.ts` - Course details component
- `src/app/courses/courses.ts` - Course listing component
- `src/services/cours.service.ts` - Course-related API services
- `src/services/etudiant.service.ts` - Student-related services
- `src/services/examen.service.ts` - Exam/test submission services

## Features

### Course Display

Students and teachers can view detailed course information:
- Course title and description
- Instructor information
- YouTube video content
- Course category
- Duration
- Learning objectives
- Prerequisites
- Target audience

### Test/Quiz Functionality

For students:
- Take tests associated with courses
- View test results
- See score and feedback

For teachers:
- View test structure
- See student performance

### Enrollment System

Students can:
- Enroll in courses
- Start courses
- Complete courses
- View enrollment status

## Component Structure

### CourseDetailComponent

Main features:
- Loading and displaying course content
- Handling video embedding from YouTube URLs
- Managing test/quizzes
- Student enrollment workflow
- Course completion tracking

### CoursesComponent

Handles the course listing view:
- Displaying available courses
- Filtering by category
- Navigation to course details

## Services

### CoursService

Key methods for course details:
- `getCourseContent(courseId)` - Get detailed course information
- `getRelatedCourses(courseId)` - Get related courses

### EtudiantService

Student-specific methods:
- `getCourseEnrollmentStatus(courseId)` - Check if student is enrolled
- `startCourse(courseId)` - Mark course as started
- `completeCourse(courseId)` - Mark course as completed
- `getCompletedCourses()` - Get list of completed courses

### ExamenService

Test submission:
- `submitTest(testId, answers)` - Submit test answers for grading

## Data Models

### Course Content

```typescript
interface CourseContent {
  id: number;
  titre: string;
  description: string;
  category: string;
  youtube_vd_url: string;
  videoUrl: string;
  image_url: string;
  duration: string;
  teacher_username: string;
  teacher_email: string;
  instructor: {
    name: string;
    avatarUrl: string;
    bio: string;
    rating: number;
  };
  targetAudience: string;
  prerequisites: string;
  learningObjectives: string[];
}
```

### Test Structure

```typescript
interface Test {
  id: number;
  titre: string;
  cours_id: number;
  questions: Array<{
    id: number;
    question: string;
    options: {
      a: string;
      b: string;
      c: string;
      d: string;
    };
  }>;
  hasTakenTest?: boolean;
  studentScore?: number | null;
  totalScore?: number | null;
  hasStartedCourse?: boolean;
  hasFinishedCourse?: boolean;
  finishedCourseId?: number | null;
  finishedAt?: string | null;
  finalGrade?: number | null;
}
```

## Video Integration

The system supports YouTube video embedding:
- Converts standard YouTube URLs to embed format
- Handles various YouTube URL formats
- Displays videos in a responsive player

## Best Practices

1. Implement proper loading states for API calls
2. Handle video embedding security with DomSanitizer
3. Provide clear feedback for test submission
4. Implement proper error handling for all user actions
5. Ensure responsive design for all device sizes
6. Follow accessibility guidelines for all interactive elements

## User Workflows

### Student Journey

1. Browse courses
2. View course details
3. Enroll in course
4. Start course (watch video)
5. Take test
6. View results
7. Complete course

### Teacher Journey

1. View course details
2. See enrollment statistics
3. Review test structure
4. Monitor student progress

## API Endpoints

Base URL: `http://79.137.34.134:5000`

Course Content:
- GET `/cours/:id/content` - Get detailed course content
- GET `/cours/:id/related` - Get related courses

Student Actions:
- POST `/etudiants/cours/:id/start` - Start a course
- POST `/etudiants/cours/:id/complete` - Complete a course
- GET `/etudiants/cours/:id/status` - Get enrollment status
- GET `/etudiants/cours/completed` - Get completed courses

Test Submission:
- POST `/examens/tests/:id/submit` - Submit test answers