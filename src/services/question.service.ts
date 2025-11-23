import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api.config';

export interface Question {
  id?: number;
  quiz_id: number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct: 'a' | 'b' | 'c' | 'd';
}

@Injectable({
  providedIn: 'root'
})
export class QuestionService {

  // Construct the full API URL for questions
  private apiUrl = `${API_BASE_URL}/question`;

  constructor(private http: HttpClient) {}

  /**
   * Add a new question to the database.
   * @param question Question object to add
   * @returns Observable of the response message
   */
  addQuestion(question: Question): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(this.apiUrl, question);
  }

  /**
   * Get all questions for a specific quiz.
   * @param quizId ID of the quiz
   * @returns Observable array of Question objects
   */
  getQuestionsByQuiz(quizId: number): Observable<Question[]> {
    return this.http.get<Question[]>(`${this.apiUrl}/${quizId}`);
  }
}
