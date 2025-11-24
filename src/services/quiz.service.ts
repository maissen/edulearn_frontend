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
   * Submit quiz responses and get results.
   * @param quizId Quiz ID
   * @param responses Object mapping question IDs to selected answers
   * @returns Observable of the submission result
   */
  submitQuiz(quizId: number, responses: { [questionId: string]: string }): Observable<{
    message: string;
    result: {
      id: number;
      score: number;
      totalQuestions: number;
      correctAnswers: number;
      maxScore: number;
      pointsPerQuestion: number;
    }
  }> {
    return this.http.post<{
      message: string;
      result: {
        id: number;
        score: number;
        totalQuestions: number;
        correctAnswers: number;
        maxScore: number;
        pointsPerQuestion: number;
      }
    }>(`${this.apiUrl}/submit`, { quizId, responses });
  }
}
