// ============================================
// forum.service.ts
// ============================================
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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
private apiUrl = 'http://localhost:3000/forum';
constructor(private http: HttpClient) {}
getAllPosts(): Observable<ForumPost[]> {
return this.http.get<ForumPost[]>(this.apiUrl);
}
createPost(post: CreatePostRequest): Observable<ForumPost> {
return this.http.post<ForumPost>(this.apiUrl, post);
}
addComment(postId: number, comment: AddCommentRequest): Observable<Comment> {
return this.http.post<Comment>(${this.apiUrl}/${postId}/comment, comment);
}
}