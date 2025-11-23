// ============================================
// classe.service.ts
// ============================================
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
export interface Classe {
id?: number;
nom: string;
niveau: string;
}
@Injectable({
providedIn: 'root'
})
export class ClasseService {
private apiUrl = 'http://localhost:3000/classe';
constructor(private http: HttpClient) {}
getAllClasses(): Observable<Classe[]> {
return this.http.get<Classe[]>(this.apiUrl);
}
addClasse(classe: Classe): Observable<Classe> {
return this.http.post<Classe>(this.apiUrl, classe);
}
updateClasse(id: number, classe: Partial<Classe>): Observable<Classe> {
return this.http.put<Classe>(${this.apiUrl}/${id}, classe);
}
deleteClasse(id: number): Observable<any> {
return this.http.delete(${this.apiUrl}/${id});
}
}