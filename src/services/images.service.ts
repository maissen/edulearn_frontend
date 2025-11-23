// ============================================
// images.service.ts
// ============================================
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
export interface ImageResponse {
id: number;
filename: string;
path: string;
}
@Injectable({
providedIn: 'root'
})
export class ImagesService {
private apiUrl = 'http://localhost:3000/images';
private baseUrl = 'http://localhost:3000';
constructor(private http: HttpClient) {}
uploadImage(file: File): Observable<ImageResponse> {
const formData = new FormData();
formData.append('image', file);
return this.http.post<ImageResponse>(this.apiUrl, formData);
}
getImages(): Observable<ImageResponse[]> {
return this.http.get<ImageResponse[]>(this.apiUrl);
}
getImageUrl(filename: string): string {
return ${this.baseUrl}/uploads/${filename};
}
}
