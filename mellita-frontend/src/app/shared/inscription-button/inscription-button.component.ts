import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { EvenementService, FormationService } from '../../core/services/api.services';

@Component({
  selector: 'app-inscription-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button *ngIf="!isLoggedIn" class="btn-inscription" (click)="redirectToRegister()">
      🔐 S'inscrire
    </button>
    <button *ngIf="isLoggedIn && !isLoading" class="btn-inscription" (click)="demanderInscription()">
      📝 Demander inscription
    </button>
    <button *ngIf="isLoggedIn && isLoading" class="btn-inscription" disabled>
      ⏳ Envoi...
    </button>
    <span *ngIf="isDejaInscrit" class="deja-inscrit">✅ Déjà inscrit</span>
  `,
  styles: [`
    .btn-inscription {
      background: linear-gradient(135deg, #1a6b3c, #2d9e5f);
      color: white;
      border: none;
      padding: 10px 16px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      font-size: 0.85rem;
      transition: all 0.3s;
      width: 100%;
      margin-top: 12px;
    }
    .btn-inscription:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
    .btn-inscription:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
    .deja-inscrit { display: block; text-align: center; padding: 8px; background: #dcfce7; color: #166534; border-radius: 8px; margin-top: 12px; font-size: 0.8rem; }
  `]
})
export class InscriptionButtonComponent {
  @Input() type: 'evenement' | 'formation' = 'evenement';
  @Input() entityId: number = 0;
  @Input() entityTitle: string = '';

  isLoggedIn = false;
  isLoading = false;
  isDejaInscrit = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private evenementService: EvenementService,
    private formationService: FormationService
  ) {
    this.isLoggedIn = this.authService.isAuthenticated();
  }

  // ⭐ MÉTHODE POUR RÉCUPÉRER L'ID UTILISATEUR À LA VOLÉE
  private getUserId(): number {
    const user = this.authService.getCurrentUser();
    return user?.id || 0;
  }

  // ⭐ MÉTHODE CORRIGÉE - Redirige vers /auth/register au lieu de /register
  redirectToRegister() {
    localStorage.setItem('redirectAfterLogin', this.router.url);
    this.router.navigate(['/auth/register']);
  }

  demanderInscription() {
    if (!this.isLoggedIn) {
      this.redirectToRegister();
      return;
    }

    // ⭐ RÉCUPÉRER L'ID UTILISATEUR DYNAMIQUEMENT
    const userId = this.getUserId();

    if (!userId) {
      alert('❌ Impossible de récupérer votre identifiant. Veuillez vous reconnecter.');
      return;
    }

    this.isLoading = true;
    const message = prompt(`Confirmez-vous votre inscription à : ${this.entityTitle} ?\n\nMessage (optionnel) :`);

    const obs = this.type === 'evenement'
      ? this.evenementService.inscrireMembre(this.entityId, userId, message || undefined)
      : this.formationService.inscrireMembre(this.entityId, userId, 0);

    obs.subscribe({
      next: (res: any) => {
        alert(`✅ ${res.message || 'Demande d\'inscription envoyée avec succès'}`);
        this.isDejaInscrit = true;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur:', err);
        let errorMsg = '❌ Erreur lors de la demande';
        if (err.error?.error) errorMsg = err.error.error;
        else if (err.error?.message) errorMsg = err.error.message;
        alert(errorMsg);
        this.isLoading = false;
      }
    });
  }
}
