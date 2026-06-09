import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }
    return true;
  }
}

// âœ… ADMIN uniquement (suppression de compte, rÃ´les, etc.)
@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}
  canActivate(): boolean {
    if (!this.authService.isAdmin()) {
      this.router.navigate(['/unauthorized']);
      return false;
    }
    return true;
  }
}

@Injectable({ providedIn: 'root' })
export class TresorierGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}
  canActivate(): boolean {
    if (!this.authService.canValidateFinance()) {
      this.router.navigate(['/unauthorized']);
      return false;
    }
    return true;
  }
}

@Injectable({ providedIn: 'root' })
export class GestionGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}
  canActivate(): boolean {
    if (!this.authService.hasGestionAccess()) {
      this.router.navigate(['/unauthorized']);
      return false;
    }
    return true;
  }
}

@Injectable({ providedIn: 'root' })
export class AnimateurGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}
  canActivate(): boolean {
    if (!this.authService.canSaisirPresence()) {
      this.router.navigate(['/unauthorized']);
      return false;
    }
    return true;
  }
}

@Injectable({ providedIn: 'root' })
export class FormateurGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}
  canActivate(): boolean {
    if (!this.authService.isFormateur() && !this.authService.isAdmin()) {
      this.router.navigate(['/unauthorized']);
      return false;
    }
    return true;
  }
}
@Injectable({ providedIn: 'root' })
export class AdminOuAdministratifGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}
  canActivate(): boolean {
    if (this.authService.isAdmin() || this.authService.isAdministratif()) {
      return true;
    }
    this.router.navigate(['/unauthorized']);
    return false;
  }
}
