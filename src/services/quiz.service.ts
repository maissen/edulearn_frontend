import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api.config';

export interface Quiz {
  id?: number;
  titre: string;
  cours_id: number;
}

@Injectable({
  providedIn: 'root'
})
export class QuizService {

  // Construct the full quiz API URL
  private apiUrl = `${API_BASE_URL}/quiz`;

  constructor(private http: HttpClient) {}

  /**
   * Fetch all quizzes from the backend.
   * @returns Observable of Quiz array
   */
  getAllQuiz(): Observable<Quiz[]> {
    return this.http.get<Quiz[]>(this.apiUrl);
  }

  /**
   * Fetch all quizzes for a specific course.
   * @param courseId Course ID
   * @returns Observable of Quiz array
   */
  getQuizzesByCourse(courseId: number): Observable<Quiz[]> {
    return this.http.get<Quiz[]>(`${this.apiUrl}/course/${courseId}`);
  }

  /**
   * Create a new quiz.
   * @param quiz Quiz object containing title and course id
   * @returns Observable of the response message
   */
  createQuiz(quiz: Quiz): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(this.apiUrl, quiz);
  }

  /**
   * Delete a quiz by its ID.
   * @param id Quiz ID to delete
   * @returns Observable of the response message
   */
  deleteQuiz(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  /**
   * Fetch the test/exam for a given course ID.
   * Maps to GET /quiz/test/course/:courseId
   */
  getTestByCourse(courseId: number): Observable<any> {
    return this.http.get<any>(`${API_BASE_URL}/quiz/test/course/${courseId}`);
  }

  /**
   * Create a test (teacher only) with questions
   * Maps to POST /quiz/test
   */
  createTest(testData: {
    titre: string;
    description: string;
    cours_id: number;
    questions: Array<{
      question: string;
      option_a: string;
      option_b: string;
      option_c: string;
      option_d: string;
      answer: string;
    }>;
  }): Observable<any> {
    return this.http.post<any>(`${API_BASE_URL}/quiz/test`, testData);
  }

  /**
   * Delete a test/exam by ID
   * Maps to DELETE /quiz/test/:id
   */
  deleteTest(testId: number): Observable<any> {
    return this.http.delete<any>(`${API_BASE_URL}/quiz/test/${testId}`);
  }
}
