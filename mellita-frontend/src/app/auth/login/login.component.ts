import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  template: `
    <div class="auth-page">
      <div class="auth-left d-none d-lg-flex">
        <div class="auth-left-content">
          <div class="brand-mark"><i class="bi bi-flower1"></i></div>
          <h2>Association de<br>Développement<br>de Mellita</h2>
          <p>Plateforme numérique intégrée pour la gestion de l'association.</p>
          <div class="auth-features">
            <div class="feature-item"><i class="bi bi-check-circle-fill"></i> 6 rôles différenciés</div>
            <div class="feature-item"><i class="bi bi-check-circle-fill"></i> Clubs & présences</div>
            <div class="feature-item"><i class="bi bi-check-circle-fill"></i> Validation financière</div>
            <div class="feature-item"><i class="bi bi-check-circle-fill"></i> Bilingue FR / عربي</div>
          </div>
        </div>
      </div>

      <div class="auth-right">
        <div class="auth-form-box">
          <h1 class="auth-title">{{ 'AUTH.LOGIN_TITLE' | translate }}</h1>
          <p class="auth-subtitle">Accédez à votre espace</p>

          <div class="alert alert-warning d-flex align-items-start gap-2" *ngIf="backendError">
            <i class="bi bi-wifi-off flex-shrink-0 mt-1"></i>
            <div>
              <strong>Backend non accessible</strong><br>
              <small>Démarrez Spring Boot :<br>
              <code>cd mellita-backend &amp;&amp; mvn spring-boot:run</code></small>
            </div>
          </div>

          <div class="alert alert-danger d-flex align-items-center gap-2" *ngIf="authError">
            <i class="bi bi-exclamation-triangle-fill"></i>
            Email ou mot de passe incorrect.
          </div>

          <!-- Comptes démo - tous les 6 rôles -->
          <div class="demo-accounts mb-4">
            <small class="fw-semibold text-muted d-block mb-2">Comptes de démonstration :</small>
            <div class="d-flex flex-wrap gap-2">
              <button class="demo-btn admin" (click)="fillDemo('admin@mellita.tn','admin123')">
                <i class="bi bi-shield-fill-check"></i> Admin
              </button>
              <button class="demo-btn administratif" (click)="fillDemo('administratif@mellita.tn','admin123')">
                <i class="bi bi-person-workspace"></i> Administratif
              </button>
              <button class="demo-btn tresorier" (click)="fillDemo('tresorier@mellita.tn','tresor123')">
                <i class="bi bi-cash-coin"></i> Trésorier
              </button>
              <button class="demo-btn formateur" (click)="fillDemo('formateur@mellita.tn','form123')">
                <i class="bi bi-mortarboard-fill"></i> Formateur
              </button>
              <button class="demo-btn animateur" (click)="fillDemo('animateur@mellita.tn','anim123')">
                <i class="bi bi-trophy-fill"></i> Animateur
              </button>
              <button class="demo-btn membre" (click)="fillDemo('membre@mellita.tn','membre123')">
                <i class="bi bi-person"></i> Membre
              </button>
            </div>
          </div>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <div class="mb-3">
              <label class="form-label fw-semibold">{{ 'AUTH.EMAIL' | translate }}</label>
              <div class="input-wrap">
                <i class="bi bi-envelope-fill input-icon"></i>
                <input type="email" class="form-control form-input"
                       formControlName="email" placeholder="votre@email.com">
              </div>
            </div>
            <div class="mb-4">
              <label class="form-label fw-semibold">{{ 'AUTH.PASSWORD' | translate }}</label>
              <div class="input-wrap">
                <i class="bi bi-lock-fill input-icon"></i>
                <input [type]="showPass ? 'text' : 'password'" class="form-control form-input"
                       formControlName="motDePasse" placeholder="••••••••">
                <button type="button" class="pass-toggle" (click)="showPass=!showPass">
                  <i class="bi" [class.bi-eye]="!showPass" [class.bi-eye-slash]="showPass"></i>
                </button>
              </div>
            </div>

            <button type="submit" class="btn btn-login w-100 py-3" [disabled]="loading">
              <span *ngIf="!loading"><i class="bi bi-box-arrow-in-right me-2"></i>{{ 'AUTH.SUBMIT_LOGIN' | translate }}</span>
              <span *ngIf="loading"><span class="spinner-border spinner-border-sm me-2"></span>Connexion...</span>
            </button>
          </form>

          <!-- Indicateur backend -->
          <div class="backend-status mt-3">
            <div class="status-dot" [class.online]="backendOnline" [class.offline]="!backendOnline && checkedBackend"></div>
            <small class="text-muted">
              Backend : <span class="text-success fw-semibold" *ngIf="backendOnline">En ligne ✓</span>
              <span class="text-danger fw-semibold" *ngIf="!backendOnline && checkedBackend">Hors ligne ✗</span>
              <span *ngIf="!checkedBackend">Vérification...</span>
            </small>
            <button class="btn btn-link btn-sm py-0 ms-1 text-muted" (click)="checkBackend()">
              <i class="bi bi-arrow-clockwise"></i>
            </button>
          </div>

          <p class="text-center mt-1">
            <a routerLink="/" class="text-muted small"><i class="bi bi-arrow-left me-1"></i>Retour au site</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page { display:flex; min-height:100vh; }
    .auth-left { flex:1; background:linear-gradient(135deg,#0f4024,#1a6b3c,#1e4d7b); display:flex; align-items:center; justify-content:center; padding:60px; position:relative; overflow:hidden; }
    .auth-left::before { content:''; position:absolute; top:-50%; left:-50%; width:200%; height:200%; background:radial-gradient(circle at center,rgba(45,158,95,.2) 0%,transparent 60%); }
    .auth-left-content { position:relative; max-width:420px; color:white; }
    .brand-mark { width:70px; height:70px; background:rgba(255,255,255,.15); border-radius:20px; display:flex; align-items:center; justify-content:center; font-size:2.5rem; margin-bottom:32px; }
    .auth-left h2 { font-size:2.5rem; font-weight:900; line-height:1.2; margin-bottom:20px; }
    .auth-left p { color:rgba(255,255,255,.7); margin-bottom:28px; line-height:1.8; }
    .feature-item { display:flex; align-items:center; gap:10px; color:rgba(255,255,255,.85); margin-bottom:10px; font-size:.9rem; }
    .feature-item i { color:#c8a84b; }
    .auth-right { width:100%; max-width:560px; display:flex; align-items:center; justify-content:center; padding:40px 20px; background:#f8f9fa; }
    .auth-form-box { width:100%; max-width:460px; background:white; border-radius:24px; padding:44px 38px; box-shadow:0 4px 30px rgba(0,0,0,.08); }
    .auth-title { font-size:1.8rem; font-weight:800; color:#1a1a2e; margin-bottom:6px; }
    .auth-subtitle { color:#6c757d; margin-bottom:24px; }
    .demo-accounts { background:#f0f7f3; border-radius:12px; padding:14px; }
    .demo-btn { background:white; border:1px solid #dee2e6; border-radius:8px; font-size:.78rem; padding:5px 10px; font-weight:600; cursor:pointer; transition:all .2s; display:flex; align-items:center; gap:5px; }
    .demo-btn.admin { color:#dc3545; border-color:#dc3545; } .demo-btn.admin:hover { background:#dc3545; color:white; }
    .demo-btn.administratif { color:#1a6b3c; border-color:#1a6b3c; } .demo-btn.administratif:hover { background:#1a6b3c; color:white; }
    .demo-btn.tresorier { color:#c8a84b; border-color:#c8a84b; } .demo-btn.tresorier:hover { background:#c8a84b; color:white; }
    .demo-btn.formateur { color:#6f42c1; border-color:#6f42c1; } .demo-btn.formateur:hover { background:#6f42c1; color:white; }
    .demo-btn.animateur { color:#e83e8c; border-color:#e83e8c; } .demo-btn.animateur:hover { background:#e83e8c; color:white; }
    .demo-btn.membre { color:#1e4d7b; border-color:#1e4d7b; } .demo-btn.membre:hover { background:#1e4d7b; color:white; }
    .input-wrap { position:relative; }
    .input-icon { position:absolute; left:14px; top:50%; transform:translateY(-50%); color:#adb5bd; z-index:2; }
    .form-input { padding-left:40px; border-radius:10px; border-color:#e0e0e0; height:48px; }
    .form-input:focus { border-color:#1a6b3c; box-shadow:0 0 0 .2rem rgba(26,107,60,.15); }
    .pass-toggle { position:absolute; right:14px; top:50%; transform:translateY(-50%); background:none; border:none; color:#adb5bd; cursor:pointer; z-index:2; }
    .btn-login { background:linear-gradient(135deg,#1a6b3c,#2d9e5f); color:white; border:none; border-radius:12px; font-weight:700; box-shadow:0 4px 15px rgba(26,107,60,.3); transition:all .3s; }
    .btn-login:hover { transform:translateY(-2px); box-shadow:0 8px 25px rgba(26,107,60,.4); color:white; }
    .btn-login:disabled { opacity:.7; transform:none; }
    .backend-status { display:flex; align-items:center; gap:6px; padding:8px 14px; background:#f8f9fa; border-radius:10px; }
    .status-dot { width:8px; height:8px; border-radius:50%; background:#adb5bd; }
    .status-dot.online { background:#28a745; box-shadow:0 0 6px rgba(40,167,69,.5); }
    .status-dot.offline { background:#dc3545; }
    code { background:#f0f0f0; padding:2px 6px; border-radius:4px; font-size:.78rem; }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  authError = false;
  backendError = false;
  loading = false;
  showPass = false;
  backendOnline = false;
  checkedBackend = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      motDePasse: ['', Validators.required]
    });
    this.checkBackend();
  }

  fillDemo(email: string, pass: string): void {
    this.loginForm.patchValue({ email, motDePasse: pass });
    this.authError = false;
    this.backendError = false;
  }

  checkBackend(): void {
    this.checkedBackend = false;
    fetch('/api/actualites/publics', { signal: AbortSignal.timeout(3000) })
      .then(r => { this.backendOnline = r.status < 500; this.checkedBackend = true; })
      .catch(() => { this.backendOnline = false; this.checkedBackend = true; });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) { this.loginForm.markAllAsTouched(); return; }
    this.loading = true;
    this.authError = false;
    this.backendError = false;

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        let returnUrl = this.route.snapshot.queryParams['returnUrl'];
        if (!returnUrl) {
          if (this.authService.isAnimateur()) {
            returnUrl = '/animateur/dashboard';
          } else if (this.authService.isFormateur()) {
            returnUrl = '/formateur/dashboard';
          } else {
            returnUrl = '/admin/dashboard';
          }
        }
        this.router.navigate([returnUrl]);
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 0) { this.backendError = true; this.backendOnline = false; this.checkedBackend = true; }
        else { this.authError = true; }
      }
    });
  }
}
