import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError, of, map } from 'rxjs';
import { Router } from '@angular/router';
import {
  AuthResponse,
  AvatarDecoration,
  LoginRequest,
  RegisterRequest,
  User,
} from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API_URL = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  private decorationsCache?: AvatarDecoration[];

  constructor(private http: HttpClient, private router: Router) {
    // Загрузка пользователя перенесена в APP_INITIALIZER
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.API_URL}/auth/register`, data, { withCredentials: true })
      .pipe(tap((response) => this.handleAuthSuccess(response)));
  }

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.API_URL}/auth/login`, data, { withCredentials: true })
      .pipe(tap((response) => this.handleAuthSuccess(response)));
  }

  logout(): Observable<any> {
    return this.http.post(`${this.API_URL}/auth/logout`, {}, { withCredentials: true }).pipe(
      tap(() => {
        this.currentUserSubject.next(null);
        this.isAuthenticatedSubject.next(false);
        this.decorationsCache = undefined;
        this.router.navigate(['/auth/login']);
      }),
      catchError(() => {
        this.currentUserSubject.next(null);
        this.isAuthenticatedSubject.next(false);
        this.decorationsCache = undefined;
        this.router.navigate(['/auth/login']);
        return of(null);
      })
    );
  }

  updateDisplayName(displayName: string): Observable<User> {
    return this.http
      .patch<User>(
        `${this.API_URL}/users/me/display-name`,
        { displayName },
        { withCredentials: true }
      )
      .pipe(tap((user) => this.currentUserSubject.next(user)));
  }

  uploadAvatar(file: File): Observable<User> {
    const formData = new FormData();
    formData.append('avatar', file);

    return this.http
      .post<User>(`${this.API_URL}/users/me/avatar`, formData, { withCredentials: true })
      .pipe(tap((user) => this.currentUserSubject.next(user)));
  }

  getAvatarDecorations(forceRefresh = false): Observable<AvatarDecoration[]> {
    if (this.decorationsCache && !forceRefresh) {
      return of(this.decorationsCache);
    }

    type AvatarDecorationResponse = { id: string; name: string; file_url: string };

    return this.http
      .get<AvatarDecorationResponse[]>(`${this.API_URL}/users/decorations`, {
        withCredentials: true,
      })
      .pipe(
        map((decorations) =>
          decorations.map((decoration) => ({
            id: decoration.id,
            name: decoration.name,
            fileUrl: decoration.file_url,
          }))
        ),
        tap((decorations) => {
          this.decorationsCache = decorations;
        })
      );
  }

  updateDecoration(decorationUrl: string | null): Observable<User> {
    return this.http
      .patch<User>(
        `${this.API_URL}/users/me/decoration`,
        { decorationUrl },
        { withCredentials: true }
      )
      .pipe(tap((user) => this.currentUserSubject.next(user)));
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/auth/me`, { withCredentials: true }).pipe(
      tap((user) => {
        console.log('[AuthService] Successfully loaded user:', user);
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
      }),
      catchError((error) => {
        console.error('[AuthService] Failed to load user:', error);
        this.isAuthenticatedSubject.next(false);
        return of(null as any);
      })
    );
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  private handleAuthSuccess(response: AuthResponse): void {
    this.currentUserSubject.next(response.user);
    this.isAuthenticatedSubject.next(true);
  }
}
