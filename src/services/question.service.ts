import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api.config';

export interface Question {
  id?: number;
  question: string;
  options: string[];
  correct_answer: string;
  quiz_id: number;
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
   * @returns Observable of the added Question
   */
  addQuestion(question: Question): Observable<Question> {
    return this.http.post<Question>(this.apiUrl, question);
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
