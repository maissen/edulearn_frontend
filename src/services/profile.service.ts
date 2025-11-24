import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api.config';

export interface Profile {
  id: number;
  username: string;
  email: string;
  role: string;
  biography?: string;
  avatarUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  // Construct the full profile API URL
  private apiUrl = `${API_BASE_URL}/profile`;

  constructor(private http: HttpClient) {}

  /**
   * Fetch the currently logged-in user's profile.
   * @returns Observable of Profile
   */
  getProfile(): Observable<Profile> {
    return this.http.get<Profile>(this.apiUrl);
  }

  /**
   * Update the currently logged-in user's profile.
   * @param profileData Partial profile data to update
   * @returns Observable of Profile
   */
  updateProfile(profileData: Partial<Profile>): Observable<Profile> {
    return this.http.put<Profile>(this.apiUrl, profileData);
  }
}
