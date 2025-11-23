import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api.config';

export interface Enseignant {
  id?: number;
  username: string;
  email: string;
  module: string;
}

@Injectable({
  providedIn: 'root'
})
export class EnseignantService {

  // Construct the full enseignant API URL
  private apiUrl = `${API_BASE_URL}/enseignant`;

  constructor(private http: HttpClient) {}

  /**
   * Get all enseignants.
   * @returns Observable array of Enseignant objects
   */
  getAllEnseignants(): Observable<Enseignant[]> {
    return this.http.get<Enseignant[]>(this.apiUrl);
  }

  /**
   * Add a new enseignant.
   * @param enseignant Enseignant object to add
   * @returns Observable of the response message
   */
  addEnseignant(enseignant: Enseignant): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(this.apiUrl, enseignant);
  }

  /**
   * Update an existing enseignant by ID.
   * @param id ID of the enseignant to update
   * @param enseignant Partial Enseignant object with updated fields
   * @returns Observable of the response message
   */
  updateEnseignant(id: number, enseignant: Partial<Enseignant>): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/${id}`, enseignant);
  }

  /**
   * Delete an enseignant by ID.
   * @param id ID of the enseignant to delete
   * @returns Observable of the response message
   */
  deleteEnseignant(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}
