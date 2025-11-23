import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api.config';

export interface ForumPost {
  id?: number;
  titre: string;
  contenu: string;
  user_id?: number;
  username?: string;
}

export interface CreatePostRequest {
  titre: string;
  contenu: string;
}

export interface AddCommentRequest {
  contenu: string;
}

@Injectable({
  providedIn: 'root'
})
export class ForumService {

  // Construct the full forum API URL
  private apiUrl = `${API_BASE_URL}/forum`;

  constructor(private http: HttpClient) {}

  /**
   * Get all forum posts.
   * @returns Observable array of ForumPost
   */
  getAllPosts(): Observable<ForumPost[]> {
    return this.http.get<ForumPost[]>(this.apiUrl);
  }

  /**
   * Create a new forum post.
   * @param post CreatePostRequest object with title and content
   * @returns Observable of the response message
   */
  createPost(post: CreatePostRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(this.apiUrl, post);
  }

  /**
   * Add a comment to a specific forum post.
   * @param postId ID of the forum post
   * @param comment AddCommentRequest object with comment content
   * @returns Observable of the response message
   */
  addComment(postId: number, comment: AddCommentRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/${postId}/comment`, comment);
  }
}
