import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}
  canActivate(): boolean {
    if (this.auth.isLoggedIn()) return true;
    this.router.navigate(['/auth/login']);
    return false;
  }
}

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}
  canActivate(): boolean {
    if (this.auth.isLoggedIn() && this.auth.isAdmin()) return true;
    this.router.navigate(['/unauthorized']);
    return false;
  }
}

@Injectable({ providedIn: 'root' })
export class AdminOuAdministratifGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}
  canActivate(): boolean {
    const user = this.auth.getCurrentUser();
    const allowed = ['ADMINISTRATEUR', 'ADMINISTRATIF'];
    if (this.auth.isLoggedIn() && user && allowed.includes(user.role)) return true;
    this.router.navigate(['/unauthorized']);
    return false;
  }
}

@Injectable({ providedIn: 'root' })
export class TresorierGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}
  canActivate(): boolean {
    const user = this.auth.getCurrentUser();
    const allowed = ['ADMINISTRATEUR', 'TRESORIER'];
    if (this.auth.isLoggedIn() && user && allowed.includes(user.role)) return true;
    this.router.navigate(['/unauthorized']);
    return false;
  }
}

@Injectable({ providedIn: 'root' })
export class FormateurGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}
  canActivate(): boolean {
    const user = this.auth.getCurrentUser();
    const allowed = ['ADMINISTRATEUR', 'FORMATEUR'];
    if (this.auth.isLoggedIn() && user && allowed.includes(user.role)) return true;
    this.router.navigate(['/unauthorized']);
    return false;
  }
}

@Injectable({ providedIn: 'root' })
export class AnimateurGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}
  canActivate(): boolean {
    const user = this.auth.getCurrentUser();
    const allowed = ['ADMINISTRATEUR', 'ANIMATEUR'];
    if (this.auth.isLoggedIn() && user && allowed.includes(user.role)) return true;
    this.router.navigate(['/unauthorized']);
    return false;
  }
}
