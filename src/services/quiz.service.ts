// ============================================
// quiz.service.ts
// ============================================
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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
private apiUrl = 'http://localhost:3000/quiz';
constructor(private http: HttpClient) {}
getAllQuiz(): Observable<Quiz[]> {
return this.http.get<Quiz[]>(this.apiUrl);
}
createQuiz(quiz: Quiz): Observable<Quiz> {
return this.http.post<Quiz>(this.apiUrl, quiz);
}
deleteQuiz(id: number): Observable<any> {
return this.http.delete(${this.apiUrl}/${id});
}
}