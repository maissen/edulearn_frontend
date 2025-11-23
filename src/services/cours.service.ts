// ============================================
// cours.service.ts
// ============================================
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
export interface Cours {
id?: number;
titre: string;
description: string;
enseignant_id: number;
}
@Injectable({
providedIn: 'root'
})
export class CoursService {
private apiUrl = 'http://localhost:3000/cours';
constructor(private http: HttpClient) {}
getAllCours(): Observable<Cours[]> {
return this.http.get<Cours[]>(this.apiUrl);
}
getCoursById(id: number): Observable<Cours> {
return this.http.get<Cours>(${this.apiUrl}/${id});
}
createCours(cours: Cours): Observable<Cours> {
return this.http.post<Cours>(this.apiUrl, cours);
}
updateCours(id: number, cours: Partial<Cours>): Observable<Cours> {
return this.http.put<Cours>(${this.apiUrl}/${id}, cours);
}
deleteCours(id: number): Observable<any> {
return this.http.delete(${this.apiUrl}/${id});
}
}