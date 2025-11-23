import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

/**
 * Intercepts outgoing HTTP requests and adds the JWT token if the user is authenticated.
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  /**
   * Intercepts HTTP requests and adds Authorization header with JWT token.
   * @param req Original HTTP request
   * @param next HTTP handler
   * @returns Observable<HttpEvent<any>>
   */
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();

    if (token) {
      // Clone the request and add the Authorization header
      const cloned = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
      return next.handle(cloned);
    }

    // Pass the request as is if no token is available
    return next.handle(req);
  }
}
