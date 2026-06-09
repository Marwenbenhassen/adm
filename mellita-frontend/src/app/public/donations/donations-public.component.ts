import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { DonService } from '../../core/services/api.services';
import { CardValidatorService } from '../../core/services/card-validator.service';

// ─── Validateurs personnalisés CORRIGÉS ───────────────────────────────────────────────

function nomAlphabet(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const regex = /^[a-zA-Z\u00C0-\u00FF\s\-']+$/;
  return regex.test(control.value) ? null : { nomInvalide: true };
}

function emailCustom(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const regex = /^[a-zA-Z0-9._%+\-]+@(gmail\.com|yahoo\.fr)$/;
  return regex.test(control.value) ? null : { emailInvalide: true };
}

function telephoneTunisien(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const regex = /^\d{8}$/;
  return regex.test(control.value) ? null : { telephoneInvalide: true };
}

function messageAlphabert(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const regex = /^[a-zA-Z\u00C0-\u00FF0-9\s.,!?;:\-'"\n]+$/;
  return regex.test(control.value) ? null : { messageInvalide: true };
}
@Component({
  selector: 'app-donations-public',
  template: `
    <app-navbar></app-navbar>

    <!-- Hero -->
    <div class="don-hero">
      <div class="container text-center">
        <div class="don-icon-wrap">
          <i class="bi bi-heart-fill"></i>
        </div>
        <h1 class="fw-bold text-white">Soutenez Notre Mission</h1>
        <p class="text-white-50 mt-3 fs-5 mx-auto" style="max-width:560px">
          Votre générosité nous permet de continuer à œuvrer pour le développement social,
          culturel et économique de Mellita.
        </p>
      </div>
    </div>

    <!-- Impact Section -->
    <section class="py-5 bg-white">
      <div class="container">
        <div class="text-center mb-5">
          <h2 class="section-title text-center">Votre Don, Notre Impact</h2>
        </div>
        <div class="row g-4 justify-content-center">
          <div class="col-md-4" *ngFor="let impact of impacts">
            <div class="impact-card text-center">
              <div class="impact-icon" [style.background]="impact.bg" [style.color]="impact.color">
                <i class="bi {{ impact.icon }}"></i>
              </div>
              <h5 class="fw-bold mt-3">{{ impact.titre }}</h5>
              <p class="text-muted small">{{ impact.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Donation Form -->
    <section class="py-5" style="background:#f8f9fa">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-lg-7">
            <div class="don-form-card">
              <div class="don-form-header">
                <h3 class="fw-bold text-white mb-1">Faire un Don</h3>
                <p class="text-white-50 mb-0">Choisissez le montant et remplissez vos informations</p>
              </div>

              <div class="don-form-body" *ngIf="!submitted">
                <!-- Erreur globale -->
                <div class="alert alert-danger" *ngIf="errorMsg">
                  <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ errorMsg }}
                </div>

                <!-- Amount Presets -->
                <div class="mb-4">
                  <label class="form-label fw-semibold">Montant du Don (TND)</label>
                  <div class="amount-presets">
                    <button *ngFor="let amt of presetAmounts" class="amount-btn"
                            [class.selected]="selectedAmount === amt"
                            (click)="selectAmount(amt)">
                      {{ amt }} TND
                    </button>
                    <button class="amount-btn autre" [class.selected]="selectedAmount === 0"
                            (click)="selectAmount(0)">Autre</button>
                  </div>
                  <div class="mt-3" *ngIf="selectedAmount === 0">
                    <input type="number" class="form-control" placeholder="Saisir un montant..."
                           [(ngModel)]="customAmount" min="1">
                  </div>
                </div>

                <form [formGroup]="donForm" (ngSubmit)="onSubmit()" novalidate>

                  <!-- Mode de paiement -->
                  <div class="mb-4">
                    <label class="form-label fw-semibold">Mode de don *</label>
                    <div class="payment-options">
                      <label class="payment-option" [class.selected]="modePaiement === 'PRESENTIEL'" (click)="modePaiement = 'PRESENTIEL'">
                        <input type="radio" name="modePaiement" value="PRESENTIEL" [(ngModel)]="modePaiement" [ngModelOptions]="{standalone: true}">
                        <div class="po-icon"><i class="bi bi-house-heart-fill"></i></div>
                        <div>
                          <div class="fw-bold">Don Présentiel</div>
                          <small class="text-muted">Remise en main propre au siège</small>
                        </div>
                      </label>
                      <label class="payment-option" [class.selected]="modePaiement === 'CARTE'" (click)="modePaiement = 'CARTE'">
                        <input type="radio" name="modePaiement" value="CARTE" [(ngModel)]="modePaiement" [ngModelOptions]="{standalone: true}">
                        <div class="po-icon"><i class="bi bi-credit-card-fill"></i></div>
                        <div>
                          <div class="fw-bold">Par Carte Bancaire</div>
                          <small class="text-muted">Paiement sécurisé en ligne</small>
                        </div>
                      </label>
                    </div>
                  </div>

                  <!-- Informations carte -->
                  <div class="carte-section mb-4" *ngIf="modePaiement === 'CARTE'">
                    <div class="carte-header mb-3">
                      <i class="bi bi-lock-fill me-2 text-success"></i>
                      <span class="fw-semibold">Paiement Sécurisé par Carte</span>
                    </div>
                    
                    <!-- Affichage des erreurs de carte -->
                    <div class="alert alert-danger mb-3" *ngIf="showCardErrors && cardErrors.length > 0" style="padding: 8px 12px;">
                      <i class="bi bi-exclamation-triangle-fill me-2"></i>
                      <span *ngFor="let err of cardErrors" class="d-block small">• {{ err }}</span>
                    </div>
                    
                    <div class="row g-3">
                      <div class="col-12">
                        <label class="form-label fw-semibold">Numéro de carte *</label>
                        <div class="card-input-wrap">
                          <i class="bi bi-credit-card card-icon"></i>
                          <input type="text" class="form-control card-input" formControlName="numeroCarte"
                                 placeholder="XXXX XXXX XXXX XXXX" maxlength="19"
                                 (input)="formatCardNumber($event)">
                        </div>
                      </div>
                      <div class="col-md-6">
                        <label class="form-label fw-semibold">Date d'expiration *</label>
                        <input type="text" class="form-control" formControlName="dateExpiration"
                               placeholder="MM/AA" maxlength="5" (input)="formatExpiryDate($event)">
                      </div>
                      <div class="col-md-6">
                        <label class="form-label fw-semibold">CVV *</label>
                        <input type="text" class="form-control" formControlName="cvv"
                               placeholder="XXX" maxlength="4" (input)="clearCardErrors()">
                      </div>
                      <div class="col-12">
                        <label class="form-label fw-semibold">Nom sur la carte *</label>
                        <input type="text" class="form-control" formControlName="nomCarte"
                               placeholder="NOM PRÉNOM">
                      </div>
                    </div>
                    <div class="carte-secure-note mt-3">
                      <i class="bi bi-shield-check-fill text-success me-2"></i>
                      <small>Vos données bancaires sont chiffrées et sécurisées. Nous ne conservons aucune information de carte.</small>
                    </div>
                  </div>

                  <!-- Données personnelles -->
                  <div>
                    <div class="row g-3 mb-3">

                      <!-- Nom complet -->
                      <div class="col-12">
                        <label class="form-label fw-semibold">Nom complet *</label>
                        <input type="text" class="form-control"
                               [class.is-invalid]="isInvalid('donateur')"
                               [class.is-valid]="isValid('donateur')"
                               formControlName="donateur"
                               placeholder="">
                        <div class="invalid-feedback" *ngIf="hasError('donateur', 'required')">
                          <i class="bi bi-x-circle-fill me-1"></i>Le nom complet est obligatoire.
                        </div>
                        <div class="invalid-feedback" *ngIf="hasError('donateur', 'nomInvalide')">
                          <i class="bi bi-x-circle-fill me-1"></i>Le nom ne doit contenir que des lettres (pas de chiffres ni caractères spéciaux).
                        </div>
                      </div>

                      <!-- Email -->
                      <div class="col-md-6">
                        <label class="form-label fw-semibold">Email *</label>
                        <input type="email" class="form-control"
                               [class.is-invalid]="isInvalid('email')"
                               [class.is-valid]="isValid('email')"
                               formControlName="email"
                               placeholder="">
                        <div class="invalid-feedback" *ngIf="hasError('email', 'required')">
                          <i class="bi bi-x-circle-fill me-1"></i>L'email est obligatoire.
                        </div>
                        <div class="invalid-feedback" *ngIf="hasError('email', 'emailInvalide')">
                          <i class="bi bi-x-circle-fill me-1"></i>Email invalide. Utilisez &#64;gmail.com ou &#64;yahoo.fr uniquement.
                        </div>
                      </div>

                      <!-- Téléphone -->
                      <div class="col-md-6">
                        <label class="form-label fw-semibold">Téléphone *</label>
                        <input type="tel" class="form-control"
                               [class.is-invalid]="isInvalid('telephone')"
                               [class.is-valid]="isValid('telephone')"
                               formControlName="telephone"
                               placeholder=""
                               maxlength="8">
                        <div class="invalid-feedback" *ngIf="hasError('telephone', 'required')">
                          <i class="bi bi-x-circle-fill me-1"></i>Le téléphone est obligatoire.
                        </div>
                        <div class="invalid-feedback" *ngIf="hasError('telephone', 'telephoneInvalide')">
                          <i class="bi bi-x-circle-fill me-1"></i>Le téléphone doit contenir exactement 8 chiffres.
                        </div>
                      </div>

                    </div>
                  </div>

                  <!-- Message -->
                  <div class="mb-4">
                    <label class="form-label fw-semibold">Message *</label>
                    <textarea class="form-control"
                              [class.is-invalid]="isInvalid('message')"
                              [class.is-valid]="isValid('message')"
                              formControlName="message" rows="3"
                              placeholder="Un mot d'encouragement pour l'association..."></textarea>
                    <div class="invalid-feedback" *ngIf="hasError('message', 'required')">
                      <i class="bi bi-x-circle-fill me-1"></i>Le message est obligatoire.
                    </div>
                    <div class="invalid-feedback" *ngIf="hasError('message', 'messageInvalide')">
                      <i class="bi bi-x-circle-fill me-1"></i>Le message ne doit pas contenir de caractères spéciaux non autorisés.
                    </div>
                  </div>

                  <!-- Résumé -->
                  <div class="don-summary">
                    <div class="d-flex justify-content-between">
                      <span>Montant du don</span>
                      <span class="fw-bold text-success">{{ getFinalAmount() }} TND</span>
                    </div>
                    <div class="d-flex justify-content-between">
                      <span>Donateur</span>
                      <span>{{ donForm.get('donateur')?.value || '—' }}</span>
                    </div>
                    <div class="d-flex justify-content-between">
                      <span>Mode de paiement</span>
                      <span class="fw-semibold" [style.color]="modePaiement === 'CARTE' ? '#1e4d7b' : '#1a6b3c'">
                        {{ modePaiement === 'CARTE' ? 'Carte Bancaire' : 'Présentiel' }}
                      </span>
                    </div>
                  </div>

                  <!-- Bouton soumettre -->
                  <button type="submit" class="btn btn-don w-100 mt-4"
                          [disabled]="loading || getFinalAmount() <= 0">
                    <span *ngIf="!loading">
                      <i class="bi bi-heart-fill me-2"></i>Confirmer mon Don de {{ getFinalAmount() }} TND
                    </span>
                    <span *ngIf="loading">
                      <span class="spinner-border spinner-border-sm me-2"></span>Traitement...
                    </span>
                  </button>

                  <!-- Message erreur formulaire incomplet -->
                  <div class="alert alert-warning mt-3" *ngIf="formSubmitted && donForm.invalid">
                    <i class="bi bi-exclamation-circle-fill me-2"></i>
                    Veuillez corriger tous les champs en rouge avant de confirmer.
                  </div>

                </form>
              </div>

              <!-- Message de remerciement -->
              <div class="don-form-body text-center py-5" *ngIf="submitted">
                <div class="thank-you-icon">🎉</div>
                <h3 class="fw-bold mt-3">Merci pour votre générosité !</h3>
                <p class="text-muted">Votre don a bien été enregistré et sera traité dans les plus brefs délais.</p>
                <button class="btn btn-mellita mt-3" (click)="resetForm()">
                  Faire un autre don
                </button>
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="col-lg-4">
            <div class="don-info-box mb-4">
              <h6 class="fw-bold mb-3"><i class="bi bi-shield-check text-success me-2"></i>Pourquoi nous faire confiance ?</h6>
              <ul class="list-unstyled info-list">
                <li><i class="bi bi-check-circle-fill text-success me-2"></i>Association officielle enregistrée</li>
                <li><i class="bi bi-check-circle-fill text-success me-2"></i>Rapports financiers transparents</li>
                <li><i class="bi bi-check-circle-fill text-success me-2"></i>Impact direct sur la communauté</li>
                <li><i class="bi bi-check-circle-fill text-success me-2"></i>Reçu fiscal disponible sur demande</li>
              </ul>
            </div>

            <div class="don-info-box">
              <h6 class="fw-bold mb-3"><i class="bi bi-telephone text-primary me-2"></i>Nous Contacter</h6>
              <p class="text-muted small mb-2"><i class="bi bi-envelope me-2"></i>dons&#64;mellita.tn</p>
              <p class="text-muted small mb-2"><i class="bi bi-telephone me-2"></i>+216 71 000 000</p>
              <p class="text-muted small"><i class="bi bi-geo-alt me-2"></i>Mellita, Djerba, Médenine</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <app-footer></app-footer>
  `,
  styles: [`
    .don-hero {
      background: linear-gradient(135deg, #c8a84b, #1a6b3c, #0f4024);
      padding: 100px 0 80px; text-align: center;
    }
    .don-icon-wrap {
      width: 80px; height: 80px; background: rgba(255,255,255,0.15);
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      font-size: 2.5rem; color: white; margin: 0 auto 24px;
      animation: heartbeat 1.5s ease-in-out infinite;
    }
    @keyframes heartbeat {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }
    .impact-card { background: white; border-radius: 20px; padding: 32px 24px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); transition: all 0.3s; }
    .impact-card:hover { transform: translateY(-6px); box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
    .impact-icon { width: 64px; height: 64px; border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; margin: 0 auto; }

    .don-form-card { background: white; border-radius: 24px; overflow: hidden; box-shadow: 0 8px 40px rgba(0,0,0,0.1); }
    .don-form-header { background: linear-gradient(135deg, #0f4024, #1a6b3c); padding: 32px; }
    .don-form-body { padding: 32px; }

    .amount-presets { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 10px; }
    .amount-btn { background: #f0f0f0; border: 2px solid #e0e0e0; color: #495057; padding: 10px 20px; border-radius: 12px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
    .amount-btn:hover, .amount-btn.selected { background: #1a6b3c; color: white; border-color: #1a6b3c; }
    .amount-btn.autre.selected { background: #c8a84b; border-color: #c8a84b; }

    .payment-options { display: flex; gap: 12px; flex-wrap: wrap; }
    .payment-option { display: flex; align-items: center; gap: 14px; background: #f8f9fa; border: 2px solid #e0e0e0; border-radius: 14px; padding: 14px 18px; cursor: pointer; flex: 1; min-width: 200px; transition: all 0.2s; user-select: none; }
    .payment-option input[type=radio] { display: none; }
    .payment-option.selected { background: rgba(26,107,60,0.06); border-color: #1a6b3c; }
    .payment-option.selected .po-icon { background: rgba(26,107,60,0.12); color: #1a6b3c; }
    .po-icon { width: 44px; height: 44px; border-radius: 12px; background: #e9ecef; color: #6c757d; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; flex-shrink: 0; transition: all 0.2s; }

    .carte-section { background: #f0f4ff; border: 2px solid #d0d9f8; border-radius: 16px; padding: 20px; }
    .carte-header { display: flex; align-items: center; font-size: 1rem; }
    .card-input-wrap { position: relative; }
    .card-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #adb5bd; z-index: 1; }
    .card-input { padding-left: 38px; }
    .carte-secure-note { background: rgba(40,167,69,0.08); border-radius: 10px; padding: 10px 14px; display: flex; align-items: flex-start; }

    /* Validation styles */
    .form-control.is-invalid { border-color: #dc3545; background-image: none; }
    .form-control.is-valid { border-color: #198754; background-image: none; }
    .invalid-feedback { display: block; font-size: 0.82rem; color: #dc3545; margin-top: 4px; }

    .don-summary { background: #f8f9fa; border-radius: 14px; padding: 18px; }
    .don-summary div { padding: 6px 0; border-bottom: 1px solid #e9ecef; }
    .don-summary div:last-child { border-bottom: none; }

    .btn-don { background: linear-gradient(135deg, #c8a84b, #e8c96b); color: white; border: none; border-radius: 14px; padding: 16px; font-size: 1rem; font-weight: 700; box-shadow: 0 4px 15px rgba(200,168,75,0.4); transition: all 0.3s; }
    .btn-don:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 8px 25px rgba(200,168,75,0.5); color: white; }
    .btn-don:disabled { opacity: 0.6; }

    .btn-mellita { background: linear-gradient(135deg, #1a6b3c, #2d9e5f); color: white; border: none; border-radius: 12px; padding: 10px 28px; font-weight: 600; }
    .btn-mellita:hover { color: white; }

    .don-info-box { background: white; border-radius: 16px; padding: 24px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
    .info-list li { padding: 6px 0; font-size: 0.9rem; color: #495057; }
    .thank-you-icon { font-size: 4rem; }
  `]
})
export class DonationsPublicComponent {
  donForm: FormGroup;
  loading = false;
  submitted = false;
  formSubmitted = false;
  selectedAmount = 50;
  customAmount = 0;
  errorMsg = '';
  modePaiement: 'PRESENTIEL' | 'CARTE' = 'PRESENTIEL';
  
  // Variables pour validation carte
  cardErrors: string[] = [];
  showCardErrors = false;

  presetAmounts = [20, 50, 100, 200, 500];

  impacts = [
    { icon: 'bi-people-fill', titre: 'Soutien Social', desc: 'Financer des programmes d\'aide aux familles défavorisées de Mellita.', bg: 'rgba(26,107,60,0.1)', color: '#1a6b3c' },
    { icon: 'bi-book-fill', titre: 'Éducation & Formation', desc: 'Organiser des formations et ateliers pour les jeunes de la région.', bg: 'rgba(30,77,123,0.1)', color: '#1e4d7b' },
    { icon: 'bi-flower1', titre: 'Développement Local', desc: 'Soutenir des projets culturels et économiques pour dynamiser Mellita.', bg: 'rgba(200,168,75,0.1)', color: '#c8a84b' }
  ];

  constructor(
    private fb: FormBuilder, 
    private donService: DonService,
    private cardValidator: CardValidatorService
  ) {
    this.donForm = this.fb.group({
      donateur:  ['', [Validators.required, nomAlphabet]],
      email:     ['', [Validators.required, emailCustom]],
      telephone: ['', [Validators.required, telephoneTunisien]],
      message:   ['', [Validators.required, messageAlphabert]],
      numeroCarte:    [''],
      dateExpiration: [''],
      cvv:            [''],
      nomCarte:       ['']
    });
  }

  // ─── Helpers de validation pour le template ──────────────────────────────────
  isInvalid(field: string): boolean {
    const ctrl = this.donForm.get(field);
    return !!ctrl && ctrl.invalid && (ctrl.touched || this.formSubmitted);
  }

  isValid(field: string): boolean {
    const ctrl = this.donForm.get(field);
    return !!ctrl && ctrl.valid && (ctrl.touched || this.formSubmitted);
  }

  hasError(field: string, error: string): boolean {
    const ctrl = this.donForm.get(field);
    return !!ctrl && ctrl.hasError(error) && (ctrl.touched || this.formSubmitted);
  }

  // ─── Actions ─────────────────────────────────────────────────────────────────
  selectAmount(amt: number): void { this.selectedAmount = amt; }

  formatCardNumber(event: any): void {
    let val = event.target.value.replace(/\D/g, '').substring(0, 16);
    val = this.cardValidator.formatCardNumber(val);
    event.target.value = val;
    this.donForm.get('numeroCarte')?.setValue(val, { emitEvent: false });
    this.clearCardErrors();
  }
  
  formatExpiryDate(event: any): void {
    let val = event.target.value.replace(/\D/g, '').substring(0, 4);
    val = this.cardValidator.formatExpiryDate(val);
    event.target.value = val;
    this.donForm.get('dateExpiration')?.setValue(val, { emitEvent: false });
    this.clearCardErrors();
  }
  
  clearCardErrors(): void {
    this.cardErrors = [];
    this.showCardErrors = false;
  }
  
  validateCardData(): boolean {
    if (this.modePaiement !== 'CARTE') return true;
    
    const cardNumber = this.donForm.get('numeroCarte')?.value || '';
    const expiryDate = this.donForm.get('dateExpiration')?.value || '';
    const cvv = this.donForm.get('cvv')?.value || '';
    
    const validation = this.cardValidator.validateCard(cardNumber, expiryDate, cvv);
    
    if (!validation.isValid) {
      this.cardErrors = validation.errors;
      this.showCardErrors = true;
      return false;
    }
    
    this.cardErrors = [];
    this.showCardErrors = false;
    return true;
  }

  getFinalAmount(): number {
    return this.selectedAmount === 0 ? (this.customAmount || 0) : this.selectedAmount;
  }

  resetForm(): void {
    this.submitted = false;
    this.formSubmitted = false;
    this.donForm.reset();
    this.selectedAmount = 50;
    this.customAmount = 0;
    this.errorMsg = '';
    this.clearCardErrors();
  }

  onSubmit(): void {
    this.formSubmitted = true;

    const amount = this.getFinalAmount();
    if (amount <= 0) {
      this.errorMsg = 'Veuillez sélectionner ou saisir un montant valide.';
      return;
    }

    this.donForm.markAllAsTouched();

    if (this.donForm.invalid) {
      return;
    }
    
    // Validation carte bancaire
    if (!this.validateCardData()) {
      return;
    }

    this.loading = true;
    this.errorMsg = '';

    const don = {
      montant:      amount,
      donateur:     this.donForm.get('donateur')?.value  || '',
      email:        this.donForm.get('email')?.value     || '',
      telephone:    this.donForm.get('telephone')?.value || '',
      message:      this.donForm.get('message')?.value   || '',
      anonyme:      false,
      modePaiement: this.modePaiement
    };

    this.donService.createPublic(don as any).subscribe({
      next:  () => { this.submitted = true; this.loading = false; },
      error: () => { this.errorMsg = 'Erreur lors de l\'envoi. Veuillez réessayer.'; this.loading = false; }
    });
  }
}