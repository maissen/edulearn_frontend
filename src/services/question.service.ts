// ============================================
// question.service.ts
// ============================================
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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
private apiUrl = 'http://localhost:3000/question';
constructor(private http: HttpClient) {}
addQuestion(question: Question): Observable<Question> {
return this.http.post<Question>(this.apiUrl, question);
}
getQuestionsByQuiz(quizId: number): Observable<Question[]> {
return this.http.get<Question[]>(${this.apiUrl}/${quizId});
}
}