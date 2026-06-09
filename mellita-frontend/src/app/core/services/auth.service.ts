import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthRequest, AuthResponse, RegisterRequest, Role } from '../../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<AuthResponse | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    const stored = localStorage.getItem('mellita_user');
    if (stored) {
      try {
        this.currentUserSubject.next(JSON.parse(stored));
      }
      catch {
        localStorage.removeItem('mellita_user');
      }
    }
  }

  // ==================== AUTHENTIFICATION ====================

  login(credentials: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap(response => {
        if (response && response.token) {
          localStorage.setItem('mellita_token', response.token);
          localStorage.setItem('mellita_user', JSON.stringify(response));
          this.currentUserSubject.next(response);
        }
      })
    );
  }

  register(data: RegisterRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, data, { responseType: 'text' });
  }

  logout(): void {
    localStorage.removeItem('mellita_token');
    localStorage.removeItem('mellita_user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/']);
  }

  // ==================== GESTION DU MOT DE PASSE ====================

  changePassword(newPassword: string): Observable<any> {
    const token = this.getToken();
    return this.http.post(`${this.apiUrl}/auth/change-password`,
      { newPassword },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  }

  // ==================== MÉTHODES UTILITAIRES ====================

  getToken(): string | null {
    return localStorage.getItem('mellita_token');
  }

  getCurrentUser(): AuthResponse | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getRole(): Role | null {
    return this.getCurrentUser()?.role || null;
  }

  // ==================== VÉRIFICATIONS DE RÔLES ====================

  isAdmin(): boolean {
    return this.getRole() === 'ADMIN';
  }

  isAdministratif(): boolean {
    return this.getRole() === 'ADMINISTRATIF';
  }

  isTresorier(): boolean {
    return this.getRole() === 'TRESORIER';
  }

  isFormateur(): boolean {
    return this.getRole() === 'FORMATEUR';
  }

  isAnimateur(): boolean {
    return this.getRole() === 'ANIMATEUR';
  }

  isMembre(): boolean {
    return this.getRole() === 'MEMBRE';
  }

  // ==================== VÉRIFICATIONS D'ACCÈS ====================

  hasAdminAccess(): boolean {
    return this.isAdmin();
  }

  hasGestionAccess(): boolean {
    return this.isAdmin() || this.isAdministratif();
  }

  hasFinanceAccess(): boolean {
    return this.isAdmin() || this.isTresorier();
  }

  hasSaisieAccess(): boolean {
    return this.isAdmin() || this.isAdministratif() || this.isAnimateur();
  }

  canValidateFinance(): boolean {
    return this.isAdmin() || this.isTresorier();
  }

  canSaisirPresence(): boolean {
    return this.isAdmin() || this.isAdministratif() || this.isAnimateur();
  }

  isAuthenticated(): boolean {
    return this.isLoggedIn();
  }

  // ==================== REDIRECTION SELON LE RÔLE ====================

 getDashboardUrl(): string {
  const stored = localStorage.getItem('mellita_user');
  const user = stored ? JSON.parse(stored) : this.getCurrentUser();
  const role = user?.role;

  if (role === 'ADMIN')         return '/admin/dashboard';
  if (role === 'ADMINISTRATIF') return '/admin/dashboard';
  if (role === 'TRESORIER')     return '/admin/finance';
  if (role === 'FORMATEUR')     return '/formateur/dashboard';
  if (role === 'ANIMATEUR')     return '/animateur/dashboard';
  return '/';
}

  // ==================== MISE À JOUR DU PROFIL ====================

  updateCurrentUser(user: AuthResponse): void {
    localStorage.setItem('mellita_user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  // ==================== VÉRIFICATION DE SESSION ====================

  checkSession(): boolean {
    const token = this.getToken();
    if (!token) return false;

    // Vérifier si le token est expiré (optionnel)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000;
      if (Date.now() >= exp) {
        this.logout();
        return false;
      }
    } catch (e) {
      return false;
    }
    return true;
  }
}
