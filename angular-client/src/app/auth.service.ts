import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'token';

  constructor(private http: HttpClient) {}
  
  register(userData: { username: string; email?: string; password: string }) {
    return this.http.post('http://localhost:3000/register', userData);
  }

  /**
   * Sends login request to backend and expects a JWT token in response.
   */
  login(username: string, password: string): Observable<{ token: string }> {
    return this.http.post<{ token: string }>('http://localhost:3000/login', { username, password });
  }

  /**
   * Removes the JWT token from localStorage.
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  /**
   * Returns true if a JWT token is present in localStorage.
   */
  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Returns the JWT token from localStorage, or null if not present.
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Stores the JWT token in localStorage.
   */
  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }
} 