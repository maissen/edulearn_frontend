import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api.config';

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
   * @returns Observable of the response message
   */
  addClasse(classe: Classe): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(this.apiUrl, classe);
  }

  /**
   * Update an existing class by ID.
   * @param id ID of the class to update
   * @param classe Partial Classe object with fields to update
   * @returns Observable of the response message
   */
  updateClasse(id: number, classe: Partial<Classe>): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/${id}`, classe);
  }

  /**
   * Delete a class by ID.
   * @param id ID of the class to delete
   * @returns Observable of the response message
   */
  deleteClasse(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}
