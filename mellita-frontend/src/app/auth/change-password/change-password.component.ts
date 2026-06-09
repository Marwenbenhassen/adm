import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-change-password',
  template: `
    <div class="change-password-page">
      <div class="change-password-box">
        <div class="text-center mb-4">
          <div class="warning-icon"><i class="bi bi-shield-lock-fill"></i></div>
          <h3 class="fw-bold mt-3">Changement de mot de passe obligatoire</h3>
          <p class="text-muted">Pour des raisons de sécurité, vous devez changer votre mot de passe temporaire.</p>
        </div>

        <div class="alert alert-danger" *ngIf="error">
          <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ error }}
        </div>

        <form [formGroup]="passwordForm" (ngSubmit)="onSubmit()">
          <!-- ✅ AJOUT : Champ ancien mot de passe -->
          <div class="mb-3">
            <label class="form-label fw-semibold">Ancien mot de passe *</label>
            <input type="password" class="form-control" formControlName="oldPassword"
                   placeholder="Votre mot de passe actuel">
          </div>

          <div class="mb-3">
            <label class="form-label fw-semibold">Nouveau mot de passe *</label>
            <input type="password" class="form-control" formControlName="newPassword"
                   placeholder="Au moins 6 caractères">
            <small class="text-muted">Minimum 6 caractères</small>
          </div>

          <div class="mb-4">
            <label class="form-label fw-semibold">Confirmer le mot de passe *</label>
            <input type="password" class="form-control" formControlName="confirmPassword"
                   placeholder="Répétez votre mot de passe">
            <small class="text-danger" *ngIf="passwordForm.errors?.['mismatch'] && passwordForm.get('confirmPassword')?.touched">
              Les mots de passe ne correspondent pas
            </small>
          </div>

          <button type="submit" class="btn btn-primary w-100 py-3" [disabled]="loading || passwordForm.invalid">
            <span *ngIf="!loading"><i class="bi bi-check-lg me-2"></i>Valider mon mot de passe</span>
            <span *ngIf="loading"><span class="spinner-border spinner-border-sm me-2"></span>Validation...</span>
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .change-password-page { min-height:100vh; display:flex; align-items:center; justify-content:center; background:#f4f6f8; padding:20px; }
    .change-password-box { background:white; border-radius:24px; padding:48px 40px; max-width:480px; width:100%; box-shadow:0 8px 40px rgba(0,0,0,.1); }
    .warning-icon { width:80px; height:80px; background:rgba(255,193,7,.1); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:2.5rem; color:#ffc107; margin:0 auto; }
  `]
})
export class ChangePasswordComponent implements OnInit {
  passwordForm: FormGroup;
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {
    this.passwordForm = this.fb.group({
      oldPassword: ['', Validators.required],  // ✅ AJOUT
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Vérifier si l'utilisateur doit vraiment changer son mot de passe
    const user = this.authService.getCurrentUser();
    if (!user || !(user as any).forcePasswordChange) {
      this.router.navigate(['/admin/dashboard']);
    }
  }

  passwordMatchValidator(g: FormGroup) {
    const newPassword = g.get('newPassword')?.value;
    const confirmPassword = g.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { 'mismatch': true };
  }

  onSubmit(): void {
    if (this.passwordForm.invalid) return;

    this.loading = true;
    this.error = '';

    const token = this.authService.getToken();

    // ✅ CORRECTION : Envoyer les deux champs demandés par le backend
    this.http.post(`${environment.apiUrl}/auth/change-password`, {
      oldPassword: this.passwordForm.get('oldPassword')?.value,
      newPassword: this.passwordForm.get('newPassword')?.value
    }, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: () => {
        alert('Mot de passe modifié avec succès !');
        // Mettre à jour le flag dans le localStorage
        const user = this.authService.getCurrentUser();
        if (user) {
          (user as any).forcePasswordChange = false;
          localStorage.setItem('user', JSON.stringify(user));
        }
        this.router.navigate(['/admin/dashboard']);
      },
      error: (err) => {
        this.error = err.error?.error || err.error?.message || 'Erreur lors du changement de mot de passe';
        this.loading = false;
      }
    });
  }
}
