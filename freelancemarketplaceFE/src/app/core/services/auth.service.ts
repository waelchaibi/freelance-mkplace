import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, AuthUser, LoginRequest, RegisterRequest } from '../models/auth.model';
import { Role } from '../models/role.enum';
import { TokenStorageService } from './token-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = `${environment.apiUrl}/api/auth`;

  constructor(
    private readonly http: HttpClient,
    private readonly tokenStorage: TokenStorageService,
    private readonly router: Router
  ) {}

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, request).pipe(
      tap((response) => this.handleAuthSuccess(response))
    );
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, request).pipe(
      tap((response) => this.handleAuthSuccess(response))
    );
  }

  logout(): void {
    this.tokenStorage.clear();
    void this.router.navigate(['/auth/login']);
  }

  isAuthenticated(): boolean {
    return !!this.tokenStorage.getToken();
  }

  getToken(): string | null {
    return this.tokenStorage.getToken();
  }

  getUser(): AuthUser | null {
    return this.tokenStorage.getUser();
  }

  getRole(): Role | null {
    return this.tokenStorage.getUser()?.role ?? null;
  }

  handleAuthSuccess(response: AuthResponse): void {
    this.tokenStorage.setToken(response.token);
    this.tokenStorage.setUser({
      userId: response.userId,
      name: response.name,
      email: response.email,
      role: response.role,
    });
  }

  redirectByRole(role: Role): void {
    const routes: Record<Role, string> = {
      [Role.ADMIN]: '/admin',
      [Role.CLIENT]: '/client',
      [Role.FREELANCER]: '/freelancer',
    };
    const path = routes[role];
    void this.router.navigate([path, 'dashboard']);
  }
}
