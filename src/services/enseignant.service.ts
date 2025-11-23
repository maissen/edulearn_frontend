import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../environments/api.config';

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
   * @returns Observable of the added Enseignant
   */
  addEnseignant(enseignant: Enseignant): Observable<Enseignant> {
    return this.http.post<Enseignant>(this.apiUrl, enseignant);
  }

  /**
   * Update an existing enseignant by ID.
   * @param id ID of the enseignant to update
   * @param enseignant Partial Enseignant object with updated fields
   * @returns Observable of the updated Enseignant
   */
  updateEnseignant(id: number, enseignant: Partial<Enseignant>): Observable<Enseignant> {
    return this.http.put<Enseignant>(`${this.apiUrl}/${id}`, enseignant);
  }

  /**
   * Delete an enseignant by ID.
   * @param id ID of the enseignant to delete
   * @returns Observable of the deletion response
   */
  deleteEnseignant(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
