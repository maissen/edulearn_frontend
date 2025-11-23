import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api.config';

export interface ImageResponse {
  id: number;
  url: string;
}

export interface ImageUploadResponse {
  message: string;
  url: string;
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
   * @returns Observable of the upload response
   */
  uploadImage(file: File): Observable<ImageUploadResponse> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post<ImageUploadResponse>(this.apiUrl, formData);
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
