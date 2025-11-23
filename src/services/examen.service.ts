// ============================================
// examen.service.ts
// ============================================
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
export interface Examen {
id?: number;
titre: string;
date: string;
cours_id: number;
duree: number;
}
@Injectable({
providedIn: 'root'
})
export class ExamenService {
private apiUrl = 'http://localhost:3000/examen';
constructor(private http: HttpClient) {}
getAllExamens(): Observable<Examen[]> {
return this.http.get<Examen[]>(this.apiUrl);
}
addExamen(examen: Examen): Observable<Examen> {
return this.http.post<Examen>(this.apiUrl, examen);
}
updateExamen(id: number, examen: Partial<Examen>): Observable<Examen> {
return this.http.put<Examen>(${this.apiUrl}/${id}, examen);
}
deleteExamen(id: number): Observable<any> {
return this.http.delete(${this.apiUrl}/${id});
}
}