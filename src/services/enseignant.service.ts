/ ============================================
// enseignant.service.ts
// ============================================
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
export interface Enseignant {
id?: number;
nom: string;
prenom: string;
email: string;
matiere: string;
password?: string;
}
@Injectable({
providedIn: 'root'
})
export class EnseignantService {
private apiUrl = 'http://localhost:3000/enseignant';
constructor(private http: HttpClient) {}
getAllEnseignants(): Observable<Enseignant[]> {
return this.http.get<Enseignant[]>(this.apiUrl);
}
addEnseignant(enseignant: Enseignant): Observable<Enseignant> {
return this.http.post<Enseignant>(this.apiUrl, enseignant);
}
updateEnseignant(id: number, enseignant: Partial<Enseignant>): Observable<Enseignant> {
return this.http.put<Enseignant>(${this.apiUrl}/${id}, enseignant);
}
deleteEnseignant(id: number): Observable<any> {
return this.http.delete(${this.apiUrl}/${id});
}
}