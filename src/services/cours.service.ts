import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api.config';

export interface Cours {
  id?: number;
  titre: string;
  description: string;
  category?: string;
  youtube_vd_url?: string;
  enseignant_id: number;
  imageUrl?: string;
  duration?: string;
  videoUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CourseContent {
  id: number;
  titre: string;
  description: string;
  category?: string;
  youtube_vd_url?: string;
  teacher_username: string;
  teacher_email: string;
  duration: string;
  videoUrl: string;
  imageUrl: string;
  targetAudience: string;
  prerequisites: string;
  learningObjectives: string[];
  instructor: {
    name: string;
    avatarUrl: string;
    bio: string;
    rating: number;
  };
  test?: {
    id: number;
    titre: string;
    cours_id: number;
    questions: Array<{
      id: number;
      question: string;
      option_a: string;
      option_b: string;
      option_c: string;
      option_d: string;
    }>;
    hasTakenTest: boolean;
    studentScore: number | null;
    totalScore: number | null;
  };
}

export interface RelatedCourse {
  id: number;
  titre: string;
  imageUrl: string;
  price: number;
  rating: number;
  instructor: string;
}

export interface CourseEnrollment {
  totalEnrolled: number;
  activeStudents: number;
  completionRate: number;
  averageRating: number;
  lastActivity: string;
}

export interface GroupedCourse {
  id: number;
  titre: string;
  description: string;
  enseignant_id: number;
  teacher_username: string;
  teacher_email: string;
}

export interface CategoryWithCourses {
  courses: GroupedCourse[];
  enrolledStudents: number;
}

export interface GroupedCourses {
  [category: string]: CategoryWithCourses;
}

@Injectable({
  providedIn: 'root'
})
export class CoursService {

  // Construct the full courses API URL
  private apiUrl = `${API_BASE_URL}/cours`;

  constructor(private http: HttpClient) {}

  /**
   * Get all courses.
   * @returns Observable of Cours array
   */
  getAllCours(): Observable<Cours[]> {
    return this.http.get<Cours[]>(this.apiUrl);
  }

  /**
   * Get a single course by its ID.
   * @param id Course ID
   * @returns Observable of Cours
   */
  getCoursById(id: number): Observable<Cours> {
    return this.http.get<Cours>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create a new course.
   * @param cours Cours object containing course details
   * @returns Observable of the response message
   */
  createCours(cours: Cours): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(this.apiUrl, cours);
  }

  /**
   * Update an existing course.
   * @param id Course ID
   * @param cours Partial Cours object with updated fields
   * @returns Observable of the response message
   */
  updateCours(id: number, cours: Partial<Cours>): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/${id}`, cours);
  }

  /**
   * Delete a course by its ID.
   * @param id Course ID
   * @returns Observable of the response message
   */
  deleteCours(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get full course content including video, duration, and detailed information.
   * @param id Course ID
   * @returns Observable of CourseContent
   */
  getCourseContent(id: number): Observable<CourseContent> {
    return this.http.get<CourseContent>(`${this.apiUrl}/${id}/content`);
  }

  /**
   * Get related courses for recommendations.
   * @param id Course ID
   * @returns Observable array of RelatedCourse
   */
  getRelatedCourses(id: number): Observable<RelatedCourse[]> {
    return this.http.get<RelatedCourse[]>(`${this.apiUrl}/${id}/related`);
  }

  /**
   * Get enrollment statistics for a course.
   * @param id Course ID
   * @returns Observable of CourseEnrollment
   */
  getCourseEnrollments(id: number): Observable<CourseEnrollment> {
    return this.http.get<CourseEnrollment>(`${this.apiUrl}/${id}/enrollments`);
  }

  /**
   * Get all unique course categories.
   * @returns Observable of string array
   */
  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/categories`);
  }

  /**
   * Get all courses grouped by their categories.
   * @returns Observable of GroupedCourses object
   */
  getGroupedByCategory(): Observable<GroupedCourses> {
    return this.http.get<GroupedCourses>(`${this.apiUrl}/grouped-by-category`);
  }
}
