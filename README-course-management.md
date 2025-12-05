# Course Management System Guide

This guide is intended for developers working on the course management features of the EduLearn platform.

## Overview

The course management system allows teachers to create, edit, and delete courses. Teachers can also add tests to their courses with multiple-choice questions.

## Key Files

- `src/app/dashboard/manage-courses/manage-courses.ts` - Main course management component
- `src/services/cours.service.ts` - Course-related API services
- `src/services/quiz.service.ts` - Quiz/test-related API services

## Features

### Course Creation

Teachers can create new courses with:
- Title
- Description
- Category
- YouTube video URL
- Image URL

### Test Creation

When creating or editing a course, teachers can add a test with:
- Test name
- Multiple questions, each with:
  - Question text
  - Four answer options (A, B, C, D)
  - Correct answer selection

### Course Editing

Teachers can modify existing courses:
- Update course details
- Add or modify tests
- View existing tests

### Course Deletion

Teachers can delete their courses, which removes:
- The course itself
- Associated tests and questions

## Component Structure

The `ManageCoursesComponent` handles all course management functionality:
- State management for create/edit modes
- Form validation
- API integration
- User feedback through notifications

## Services

### CoursService

Main methods:
- `createCours(course)` - Create a new course
- `createCoursWithTest(data)` - Create a course with an associated test
- `getAllCours()` - Get all courses (filtered by teacher)
- `getCoursById(id)` - Get a specific course by ID
- `updateCours(id, course)` - Update course details
- `updateCoursWithTest(id, data)` - Update course with test data
- `deleteCours(id)` - Delete a course

### QuizService

Main methods:
- `createTest(testData)` - Create a new test
- `getTestByCourse(courseId)` - Get test for a specific course
- `deleteTest(testId)` - Delete a test

## Data Models

### Course Object

```typescript
interface Course {
  id?: number;
  titre: string;
  description: string;
  category: string;
  youtube_vd_url: string;
  image_url: string;
  enseignant_id: number;
}
```

### Quiz/Test Object

```typescript
interface QuizTemplate {
  id?: number;
  titre: string;
  question: string;
  options: string[];
  correctAnswer: number | null;
}
```

## Best Practices

1. Always validate form data before submitting to the API
2. Provide clear user feedback for all operations
3. Handle errors gracefully with informative messages
4. Ensure proper cleanup when switching between create/edit modes
5. Use appropriate loading states during API operations

## API Endpoints

Base URL: `http://79.137.34.134:5000`

Courses:
- GET `/cours` - Get all courses
- GET `/cours/:id` - Get specific course
- POST `/cours` - Create new course
- PUT `/cours/:id` - Update course
- DELETE `/cours/:id` - Delete course

Tests:
- POST `/tests` - Create new test
- GET `/tests/cours/:courseId` - Get test for course
- DELETE `/tests/:id` - Delete test