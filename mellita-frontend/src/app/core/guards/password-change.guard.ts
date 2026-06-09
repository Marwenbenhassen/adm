import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class PasswordChangeGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    const user = this.authService.getCurrentUser();
    
    // Si l'utilisateur doit changer son mot de passe, rediriger
    if (user && (user as any).forcePasswordChange) {
      this.router.navigate(['/auth/change-password']);
      return false;
    }
    
    return true;
  }
}
