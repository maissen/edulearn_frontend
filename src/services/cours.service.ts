import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api.config';

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

  // Construct the full courses API URL
  private apiUrl = `${API_BASE_URL}/cours`;

  constructor(private http: HttpClient) {}

  /**
   * Get all courses.
   * @returns Observable of Cours array
   */
  getAllCours(): Observable<Cours[]> {
    return this.http.get<Cours[]>(this.apiUrl);
  }

  /**
   * Get a single course by its ID.
   * @param id Course ID
   * @returns Observable of Cours
   */
  getCoursById(id: number): Observable<Cours> {
    return this.http.get<Cours>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create a new course.
   * @param cours Cours object containing course details
   * @returns Observable of the created Cours
   */
  createCours(cours: Cours): Observable<Cours> {
    return this.http.post<Cours>(this.apiUrl, cours);
  }

  /**
   * Update an existing course.
   * @param id Course ID
   * @param cours Partial Cours object with updated fields
   * @returns Observable of the updated Cours
   */
  updateCours(id: number, cours: Partial<Cours>): Observable<Cours> {
    return this.http.put<Cours>(`${this.apiUrl}/${id}`, cours);
  }

  /**
   * Delete a course by its ID.
   * @param id Course ID
   * @returns Observable of deletion result
   */
  deleteCours(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
