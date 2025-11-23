import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../environments/api.config';

export interface ForumPost {
  id?: number;
  titre: string;
  contenu: string;
  auteur_id?: number;
  comments?: Comment[];
}

export interface Comment {
  id?: number;
  contenu: string;
  auteur_id?: number;
  post_id?: number;
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
   * @returns Observable of the created ForumPost
   */
  createPost(post: CreatePostRequest): Observable<ForumPost> {
    return this.http.post<ForumPost>(this.apiUrl, post);
  }

  /**
   * Add a comment to a specific forum post.
   * @param postId ID of the forum post
   * @param comment AddCommentRequest object with comment content
   * @returns Observable of the created Comment
   */
  addComment(postId: number, comment: AddCommentRequest): Observable<Comment> {
    return this.http.post<Comment>(`${this.apiUrl}/${postId}/comment`, comment);
  }
}
