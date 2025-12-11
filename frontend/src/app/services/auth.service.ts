import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

interface LoginResp { access_token: string; refresh_token?: string; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'petcarex_access_token';
  private refreshKey = 'petcarex_refresh_token';

  constructor(private http: HttpClient, private router: Router) {}

  login(username: string, password: string) {
    return this.http.post<LoginResp>('http://localhost:3000/auth/login', { username, password }).pipe(
      map(res => {
        if (res && res.access_token) {
          localStorage.setItem(this.tokenKey, res.access_token);
        }
        if (res && res.refresh_token) {
          localStorage.setItem(this.refreshKey, res.refresh_token);
        }
        return res;
      })
    );
  }

  register(payload: any) {
    return this.http.post('http://localhost:3000/auth/register', payload);
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshKey);
    this.router.navigate(['/auth/login']);
  }

  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  getRefreshToken() {
    return localStorage.getItem(this.refreshKey);
  }

  setTokens(access: string, refresh?: string) {
    if (access) localStorage.setItem(this.tokenKey, access);
    if (refresh) localStorage.setItem(this.refreshKey, refresh);
  }

  isAuthenticated() {
    return !!this.getToken();
  }

  profile() {
    return this.http.get('http://localhost:3000/auth/profile');
  }

  refresh(refreshToken?: string): Observable<LoginResp> {
    const token = refreshToken || this.getRefreshToken();
    return this.http.post<LoginResp>('http://localhost:3000/auth/refresh', { refresh_token: token });
  }

  forgot(email: string) {
    return this.http.post('http://localhost:3000/auth/forgot-password', { email });
  }
}
