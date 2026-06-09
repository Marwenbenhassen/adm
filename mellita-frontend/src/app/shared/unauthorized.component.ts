import { Component } from '@angular/core';

@Component({
  selector: 'app-unauthorized',
  template: `
    <app-navbar></app-navbar>
    <div class="d-flex align-items-center justify-content-center" style="min-height:80vh">
      <div class="text-center">
        <div class="mb-4" style="font-size:5rem">🔒</div>
        <h1 class="display-4 fw-bold text-danger">Accès Refusé</h1>
        <p class="text-muted mb-4">Vous n'avez pas les droits nécessaires pour accéder à cette page.</p>
        <a routerLink="/" class="btn btn-mellita me-2">Retour à l'Accueil</a>
        <a routerLink="/auth/login" class="btn btn-outline-secondary">Se Connecter</a>
      </div>
    </div>
    <app-footer></app-footer>
  `
})
export class UnauthorizedComponent {}
