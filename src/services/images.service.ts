import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../environments/api.config';

export interface ImageResponse {
  id: number;
  filename: string;
  path: string;
}

@Injectable({
  providedIn: 'root'
})
export class ImagesService {

  // API endpoint for images
  private apiUrl = `${API_BASE_URL}/images`;

  constructor(private http: HttpClient) {}

  /**
   * Upload an image file to the server.
   * @param file File object to upload
   * @returns Observable of the uploaded ImageResponse
   */
  uploadImage(file: File): Observable<ImageResponse> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post<ImageResponse>(this.apiUrl, formData);
  }

  /**
   * Retrieve all images from the server.
   * @returns Observable array of ImageResponse
   */
  getImages(): Observable<ImageResponse[]> {
    return this.http.get<ImageResponse[]>(this.apiUrl);
  }

  /**
   * Get the full URL of an image given its filename.
   * @param filename Name of the image file
   * @returns Full URL string
   */
  getImageUrl(filename: string): string {
    return `${API_BASE_URL}/uploads/${filename}`;
  }
}
