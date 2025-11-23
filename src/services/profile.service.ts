// ============================================
// profile.service.ts
// ============================================
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
export interface Profile {
id: number;
email: string;
nom: string;
prenom: string;
role: string;
}
@Injectable({
providedIn: 'root'
})
export class ProfileService {
private apiUrl = 'http://localhost:3000/profile';
constructor(private http: HttpClient) {}
getProfile(): Observable<Profile> {
return this.http.get<Profile>(this.apiUrl);
}
}