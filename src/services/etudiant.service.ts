import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api.config';

export interface Etudiant {
  id?: number;
  username: string;
  email: string;
  classe_id: number;
}

@Injectable({
  providedIn: 'root'
})
export class EtudiantService {

  // Construct the full etudiant API URL
  private apiUrl = `${API_BASE_URL}/etudiant`;

  constructor(private http: HttpClient) {}

  /**
   * Get all students.
   * @returns Observable of Etudiant array
   */
  getAllEtudiants(): Observable<Etudiant[]> {
    return this.http.get<Etudiant[]>(this.apiUrl);
  }

  /**
   * Add a new student.
   * @param etudiant Etudiant object to add
   * @returns Observable of the response message
   */
  addEtudiant(etudiant: Etudiant): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(this.apiUrl, etudiant);
  }

  /**
   * Update an existing student by ID.
   * @param id ID of the student to update
   * @param etudiant Partial Etudiant object with updated fields
   * @returns Observable of the response message
   */
  updateEtudiant(id: number, etudiant: Partial<Etudiant>): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/${id}`, etudiant);
  }

  /**
   * Delete a student by ID.
   * @param id ID of the student to delete
   * @returns Observable of the response message
   */
  deleteEtudiant(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}

