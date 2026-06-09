import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

// ─── Validateurs personnalisés ───────────────────────────────────────────────

function onlyAlpha(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const regex = /^[a-zA-ZàâäéèêëîïôùûüçÀÂÄÉÈÊËÎÏÔÙÛÜÇ\s\-']+$/;
  return regex.test(control.value) ? null : { onlyAlpha: true };
}

function emailCustom(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const regex = /^[a-zA-Z0-9._%+\-]+@(gmail\.com|yahoo\.fr)$/;
  return regex.test(control.value) ? null : { emailInvalide: true };
}

function telephone8(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  return /^\d{8}$/.test(control.value) ? null : { telephone8: true };
}

function alphaText(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const regex = /^[a-zA-ZàâäéèêëîïôùûüçÀÂÄÉÈÊËÎÏÔÙÛÜÇ0-9\s.,!?;:\-'"\n]+$/;
  return regex.test(control.value) ? null : { alphaText: true };
}

@Component({
  selector: 'app-register',
  template: `
    <div class="auth-page">
      <div class="auth-left d-none d-lg-flex">
        <div class="auth-left-content">
          <div class="brand-mark"><i class="bi bi-flower1"></i></div>
          <h2>Rejoignez-nous</h2>
          <p>Devenez membre de l'Association de Développement de Mellita.</p>
          <div class="auth-features">
            <div class="feature-item"><i class="bi bi-check-circle-fill"></i> Inscription simple et rapide</div>
            <div class="feature-item"><i class="bi bi-check-circle-fill"></i> Validation par l'administrateur</div>
            <div class="feature-item"><i class="bi bi-check-circle-fill"></i> Accès à tous les services</div>
          </div>
        </div>
      </div>

      <div class="auth-right">
        <div class="auth-form-box">
          <h1 class="auth-title">{{ 'AUTH.REGISTER_TITLE' | translate }}</h1>
          <p class="auth-subtitle">Remplissez le formulaire ci-dessous</p>

          <div class="alert alert-success" *ngIf="success">
            <i class="bi bi-check-circle-fill me-2"></i>
            <strong>Demande envoyée !</strong><br>
            Vous recevrez un email avec vos identifiants une fois votre compte validé par l'administrateur.
          </div>

          <div class="alert alert-danger" *ngIf="error">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ error }}
          </div>

          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" novalidate *ngIf="!success">
            <div class="row g-3">

              <!-- Prénom -->
              <div class="col-6">
                <label class="form-label fw-semibold">{{ 'AUTH.FIRST_NAME' | translate }} *</label>
                <input type="text" class="form-control form-input"
                       [class.is-invalid]="isInvalid('prenom')"
                       [class.is-valid]="isValid('prenom')"
                       formControlName="prenom" placeholder="Votre prénom">
                <div class="invalid-feedback" *ngIf="hasError('prenom', 'required')">
                  <i class="bi bi-x-circle-fill me-1"></i>Le prénom est obligatoire.
                </div>
                <div class="invalid-feedback" *ngIf="hasError('prenom', 'onlyAlpha')">
                  <i class="bi bi-x-circle-fill me-1"></i>Lettres uniquement, pas de chiffres.
                </div>
              </div>

              <!-- Nom -->
              <div class="col-6">
                <label class="form-label fw-semibold">{{ 'AUTH.LAST_NAME' | translate }} *</label>
                <input type="text" class="form-control form-input"
                       [class.is-invalid]="isInvalid('nom')"
                       [class.is-valid]="isValid('nom')"
                       formControlName="nom" placeholder="Votre nom">
                <div class="invalid-feedback" *ngIf="hasError('nom', 'required')">
                  <i class="bi bi-x-circle-fill me-1"></i>Le nom est obligatoire.
                </div>
                <div class="invalid-feedback" *ngIf="hasError('nom', 'onlyAlpha')">
                  <i class="bi bi-x-circle-fill me-1"></i>Lettres uniquement, pas de chiffres.
                </div>
              </div>

              <!-- Email -->
              <div class="col-12">
                <label class="form-label fw-semibold">{{ 'AUTH.EMAIL' | translate }} *</label>
                <div class="input-wrap">
                  <i class="bi bi-envelope-fill input-icon"></i>
                  <input type="email" class="form-control form-input ps-icon"
                         [class.is-invalid]="isInvalid('email')"
                         [class.is-valid]="isValid('email')"
                         formControlName="email" placeholder="">
                </div>
                <div class="invalid-feedback d-block" *ngIf="hasError('email', 'required')">
                  <i class="bi bi-x-circle-fill me-1"></i>L'email est obligatoire.
                </div>
                <div class="invalid-feedback d-block" *ngIf="hasError('email', 'emailInvalide')">
                  <i class="bi bi-x-circle-fill me-1"></i>Email invalide. Utilisez &#64;gmail.com ou &#64;yahoo.fr uniquement.
                </div>
              </div>

              <!-- Téléphone -->
              <div class="col-12">
                <label class="form-label fw-semibold">{{ 'AUTH.PHONE' | translate }} *</label>
                <input type="tel" class="form-control form-input"
                       [class.is-invalid]="isInvalid('telephone')"
                       [class.is-valid]="isValid('telephone')"
                       formControlName="telephone" placeholder="" maxlength="8">
                <div class="invalid-feedback" *ngIf="hasError('telephone', 'required')">
                  <i class="bi bi-x-circle-fill me-1"></i>Le téléphone est obligatoire.
                </div>
                <div class="invalid-feedback" *ngIf="hasError('telephone', 'telephone8')">
                  <i class="bi bi-x-circle-fill me-1"></i>Le téléphone doit contenir exactement 8 chiffres.
                </div>
              </div>

              <!-- Adresse -->
              <div class="col-12">
                <label class="form-label fw-semibold">{{ 'AUTH.ADDRESS' | translate }} *</label>
                <input type="text" class="form-control form-input"
                       [class.is-invalid]="isInvalid('adresse')"
                       [class.is-valid]="isValid('adresse')"
                       formControlName="adresse" placeholder="Votre adresse">
                <div class="invalid-feedback" *ngIf="hasError('adresse', 'required')">
                  <i class="bi bi-x-circle-fill me-1"></i>L'adresse est obligatoire.
                </div>
                <div class="invalid-feedback" *ngIf="hasError('adresse', 'alphaText')">
                  <i class="bi bi-x-circle-fill me-1"></i>L'adresse ne doit pas contenir de caractères spéciaux.
                </div>
              </div>

              <!-- Message -->
              <div class="col-12">
                <label class="form-label fw-semibold">Message *</label>
                <textarea class="form-control form-input"
                          [class.is-invalid]="isInvalid('message')"
                          [class.is-valid]="isValid('message')"
                          formControlName="message" rows="2"
                          placeholder="Pourquoi souhaitez-vous rejoindre l'association ?"></textarea>
                <div class="invalid-feedback" *ngIf="hasError('message', 'required')">
                  <i class="bi bi-x-circle-fill me-1"></i>Le message est obligatoire.
                </div>
                <div class="invalid-feedback" *ngIf="hasError('message', 'alphaText')">
                  <i class="bi bi-x-circle-fill me-1"></i>Le message ne doit pas contenir de caractères spéciaux.
                </div>
              </div>

            </div>

            <div class="info-box mt-3">
              <i class="bi bi-info-circle-fill me-2"></i>
              <small>Après validation, vous recevrez un email avec vos identifiants de connexion.</small>
            </div>

            <!-- Avertissement global -->
            <div class="alert alert-warning mt-3 py-2" *ngIf="formSubmitted && registerForm.invalid">
              <i class="bi bi-exclamation-circle-fill me-2"></i>
              <small>Veuillez corriger tous les champs en rouge avant d'envoyer.</small>
            </div>

            <button type="submit" class="btn btn-register w-100 mt-4 py-3" [disabled]="loading">
              <span *ngIf="!loading"><i class="bi bi-send-fill me-2"></i>{{ 'AUTH.SUBMIT_REGISTER' | translate }}</span>
              <span *ngIf="loading"><span class="spinner-border spinner-border-sm me-2"></span>Envoi en cours...</span>
            </button>
          </form>

          <p class="text-center mt-4 text-muted">
            {{ 'AUTH.HAVE_ACCOUNT' | translate }}
            <a routerLink="/auth/login" class="text-success fw-semibold">{{ 'AUTH.LOGIN_TITLE' | translate }}</a>
          </p>
          <p class="text-center mt-1">
            <a routerLink="/" class="text-muted small"><i class="bi bi-arrow-left me-1"></i>Retour au site</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page { display:flex; min-height:100vh; }
    .auth-left { flex:1; background:linear-gradient(135deg,#0f4024,#1a6b3c,#1e4d7b); display:flex; align-items:center; justify-content:center; padding:60px; }
    .auth-left-content { max-width:420px; color:white; }
    .brand-mark { width:70px; height:70px; background:rgba(255,255,255,.15); border-radius:20px; display:flex; align-items:center; justify-content:center; font-size:2.5rem; margin-bottom:32px; }
    .auth-left h2 { font-size:2.5rem; font-weight:900; line-height:1.2; margin-bottom:20px; }
    .auth-left p { color:rgba(255,255,255,.7); margin-bottom:28px; }
    .feature-item { display:flex; align-items:center; gap:10px; color:rgba(255,255,255,.85); margin-bottom:10px; }
    .feature-item i { color:#c8a84b; }
    .auth-right { width:100%; max-width:560px; display:flex; align-items:center; justify-content:center; padding:40px 20px; background:#f8f9fa; }
    .auth-form-box { width:100%; max-width:500px; background:white; border-radius:24px; padding:44px 38px; box-shadow:0 4px 30px rgba(0,0,0,.08); }
    .auth-title { font-size:1.8rem; font-weight:800; color:#1a1a2e; margin-bottom:6px; }
    .auth-subtitle { color:#6c757d; margin-bottom:24px; }
    .input-wrap { position:relative; }
    .input-icon { position:absolute; left:14px; top:50%; transform:translateY(-50%); color:#adb5bd; z-index:2; }
    .ps-icon { padding-left: 38px; }
    .form-input { border-radius:10px; border-color:#e0e0e0; padding:10px 14px; }
    .form-input:focus { border-color:#1a6b3c; box-shadow:0 0 0 .2rem rgba(26,107,60,.15); }
    .form-input.is-invalid { border-color:#dc3545; background-image:none; }
    .form-input.is-valid  { border-color:#198754; background-image:none; }
    .invalid-feedback { font-size:0.82rem; color:#dc3545; margin-top:4px; }
    .btn-register { background:linear-gradient(135deg,#1a6b3c,#2d9e5f); color:white; border:none; border-radius:12px; font-weight:700; }
    .btn-register:hover { color:white; transform:translateY(-2px); }
    .btn-register:disabled { opacity:.7; }
    .info-box { background:rgba(23,162,184,.08); border:1px solid rgba(23,162,184,.2); border-radius:10px; padding:10px 14px; }
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  success = false;
  error = '';
  formSubmitted = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      prenom:    ['', [Validators.required, onlyAlpha]],
      nom:       ['', [Validators.required, onlyAlpha]],
      email:     ['', [Validators.required, emailCustom]],
      telephone: ['', [Validators.required, telephone8]],
      adresse:   ['', [Validators.required, alphaText]],
      message:   ['', [Validators.required, alphaText]]
    });
  }

  // ─── Helpers template ────────────────────────────────────────────────────────
  isInvalid(field: string): boolean {
    const c = this.registerForm.get(field);
    return !!c && c.invalid && (c.touched || this.formSubmitted);
  }

  isValid(field: string): boolean {
    const c = this.registerForm.get(field);
    return !!c && c.valid && (c.touched || this.formSubmitted);
  }

  hasError(field: string, error: string): boolean {
    const c = this.registerForm.get(field);
    return !!c && c.hasError(error) && (c.touched || this.formSubmitted);
  }

  // ─── Soumission ──────────────────────────────────────────────────────────────
  onSubmit(): void {
    this.formSubmitted = true;
    this.registerForm.markAllAsTouched();

    if (this.registerForm.invalid) return;

    this.loading = true;
    this.error = '';

    this.http.post(`${environment.apiUrl}/demandes-inscription/public`, this.registerForm.value)
      .subscribe({
        next: () => { this.success = true; this.loading = false; },
        error: (err) => {
          this.error = err.error?.error || 'Erreur lors de l\'envoi de la demande';
          this.loading = false;
        }
      });
  }
}
