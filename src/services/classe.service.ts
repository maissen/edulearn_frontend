import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../environments/api.config';

export interface Classe {
  id?: number;
  nom: string;
  niveau: string;
}

@Injectable({
  providedIn: 'root'
})
export class ClasseService {

  // Construct the full API URL for classe endpoints
  private apiUrl = `${API_BASE_URL}/classe`;

  constructor(private http: HttpClient) {}

  /**
   * Get all classes.
   * @returns Observable of Classe array
   */
  getAllClasses(): Observable<Classe[]> {
    return this.http.get<Classe[]>(this.apiUrl);
  }

  /**
   * Add a new class.
   * @param classe Classe object
   * @returns Observable of the created Classe
   */
  addClasse(classe: Classe): Observable<Classe> {
    return this.http.post<Classe>(this.apiUrl, classe);
  }

  /**
   * Update an existing class by ID.
   * @param id ID of the class to update
   * @param classe Partial Classe object with fields to update
   * @returns Observable of the updated Classe
   */
  updateClasse(id: number, classe: Partial<Classe>): Observable<Classe> {
    return this.http.put<Classe>(`${this.apiUrl}/${id}`, classe);
  }

  /**
   * Delete a class by ID.
   * @param id ID of the class to delete
   * @returns Observable of any response
   */
  deleteClasse(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
