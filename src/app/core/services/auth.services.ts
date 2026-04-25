// services/auth.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../environment/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private tokenKey = 'token';
  private refreshTokenKey = 'refreshToken';
  private apiUrl = environment.apiUrl;

  user = signal<any | null>(this.getUserFromToken());

  constructor(private http: HttpClient) {}

  // =============================
  // 🔐 LOGIN API
  // =============================

  login(data: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/account/login`, data).pipe(
      tap(res => {
        this.setSession(res.data.authResponse.accessToken, res.data.authResponse.refreshToken);
      })
    );
  }

  // =============================
  // SESSION
  // =============================

  setSession(token: string, refreshToken: string) {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.refreshTokenKey, refreshToken);
    this.user.set(this.getUserFromToken());
  }

  logout() {
    localStorage.clear();
    this.user.set(null);
  }

  // =============================
  // TOKEN
  // =============================

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken() && !this.isTokenExpired();
  }

  // =============================
  // JWT PARSE
  // =============================

  getUserFromToken(): any {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));

      var user = {
        id: payload.sub,
        role: payload.role,
        email: payload.email,
        exp: payload.exp
      };
      return user;
    } catch {
      return null;
    }
  }

  isTokenExpired(): boolean {
    const user = this.getUserFromToken();
    if (!user) return true;

    return Date.now() > user.exp * 1000;
  }

  // =============================
  // 🔁 REFRESH TOKEN API
  // =============================

  refreshToken(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/account/refresh`, {
      refreshToken: this.getRefreshToken()
    });
  }
}