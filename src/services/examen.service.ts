import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../environments/api.config';

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

  // Construct the full examen API URL
  private apiUrl = `${API_BASE_URL}/examen`;

  constructor(private http: HttpClient) {}

  /**
   * Fetch all examens from the server.
   * @returns Observable of Examen array
   */
  getAllExamens(): Observable<Examen[]> {
    return this.http.get<Examen[]>(this.apiUrl);
  }

  /**
   * Add a new examen.
   * @param examen Examen object to add
   * @returns Observable of the created Examen
   */
  addExamen(examen: Examen): Observable<Examen> {
    return this.http.post<Examen>(this.apiUrl, examen);
  }

  /**
   * Update an existing examen by ID.
   * @param id Examen ID
   * @param examen Partial Examen object with updated fields
   * @returns Observable of the updated Examen
   */
  updateExamen(id: number, examen: Partial<Examen>): Observable<Examen> {
    return this.http.put<Examen>(`${this.apiUrl}/${id}`, examen);
  }

  /**
   * Delete an examen by ID.
   * @param id Examen ID
   * @returns Observable of any response
   */
  deleteExamen(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
