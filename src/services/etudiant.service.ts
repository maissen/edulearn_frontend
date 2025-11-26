import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api.config';

export interface Etudiant {
  id?: number;
  username: string;
  email: string;
  classe_id: number;
}

export interface InProgressCourse {
  enrollment_id: number;
  progress_percentage: number;
  started_at: string;
  updated_at: string;
  id: number;
  titre: string;
  description: string;
  category: string;
  teacher_username: string;
}

export interface CompletedCourse {
  finished_course_id: number;
  final_grade: number;
  completed_at: string;
  created_at: string;
  id: number;
  titre: string;
  description: string;
  category: string;
  teacher_username: string;
}

export interface CourseEnrollmentStatus {
  isEnrolled: boolean;
  status: string | null; // "in_progress" or "completed" or null
  enrollmentId: number | null;
  progressPercentage: number;
  startedAt: string | null;
  completedAt: string | null;
}

export interface QuizResult {
  id: number;
  etudiant_id: number;
  quiz_id: number;
  score: number;
  total_questions: number;
  correct_answers: number;
  submitted_at: string;
  quiz_title: string;
  course_title: string;
  course_category: string;
}

@Injectable({
  providedIn: 'root'
})
export class EtudiantService {

  // Construct the full etudiant API URL
  private apiUrl = `${API_BASE_URL}/etudiant`;

  constructor(private http: HttpClient) {}

  /**
   * Get all students.
   * @returns Observable of Etudiant array
   */
  getAllEtudiants(): Observable<Etudiant[]> {
    return this.http.get<Etudiant[]>(this.apiUrl);
  }

  /**
   * Add a new student.
   * @param etudiant Etudiant object to add
   * @returns Observable of the response message
   */
  addEtudiant(etudiant: Etudiant): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(this.apiUrl, etudiant);
  }

  /**
   * Update an existing student by ID.
   * @param id ID of the student to update
   * @param etudiant Partial Etudiant object with updated fields
   * @returns Observable of the response message
   */
  updateEtudiant(id: number, etudiant: Partial<Etudiant>): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/${id}`, etudiant);
  }

  /**
   * Delete a student by ID.
   * @param id ID of the student to delete
   * @returns Observable of the response message
   */
  deleteEtudiant(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get all courses currently in progress for the authenticated student.
   * @returns Observable of InProgressCourse array
   */
  getInProgressCourses(): Observable<InProgressCourse[]> {
    return this.http.get<InProgressCourse[]>(`${this.apiUrl}/courses/in-progress`);
  }

  /**
   * Check if the authenticated student is enrolled in a specific course.
   * @param courseId The ID of the course to check
   * @returns Observable of CourseEnrollmentStatus
   */
  getCourseEnrollmentStatus(courseId: number): Observable<CourseEnrollmentStatus> {
    return this.http.get<CourseEnrollmentStatus>(`${this.apiUrl}/is-enrolled/${courseId}`);
  }

  /**
   * Get all test/exam results for the authenticated student.
   * Maps to GET /etudiant/test-results
   */
  getTestResults(): Observable<QuizResult[]> {
    return this.http.get<QuizResult[]>(`${this.apiUrl}/test-results`);
  }
  // getQuizResults obsolete, do not use.

  /**
   * Get all completed courses for the authenticated student.
   * @returns Observable of CompletedCourse array
   */
  getCompletedCourses(): Observable<CompletedCourse[]> {
    return this.http.get<CompletedCourse[]>(`${this.apiUrl}/courses/completed`);
  }

  /**
   * Add a course to the student's in-progress courses list
   * @param courseId The ID of the course to start
   * @returns Observable of the response message
   */
  startCourse(courseId: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/start-course`, { coursId: courseId });
  }

  /**
   * Mark a course as completed for the student
   * @param courseId The ID of the course to complete
   * @returns Observable of the response message
   */
  completeCourse(courseId: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/complete-course`, { coursId: courseId });
  }
}