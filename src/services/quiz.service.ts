import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../environments/api.config';

export interface Quiz {
  id?: number;
  titre: string;
  cours_id: number;
  duree: number;
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
   * Create a new quiz.
   * @param quiz Quiz object containing title, course id, and duration
   * @returns Observable of the created Quiz
   */
  createQuiz(quiz: Quiz): Observable<Quiz> {
    return this.http.post<Quiz>(this.apiUrl, quiz);
  }

  /**
   * Delete a quiz by its ID.
   * @param id Quiz ID to delete
   * @returns Observable of any response from the server
   */
  deleteQuiz(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
