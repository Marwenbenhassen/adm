import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { EcritureService } from '../../core/services/api.services';
import { AuthService } from '../../core/services/auth.service';

// ============ VALIDATEURS PERSONNALISÉS ============
function alphaNumWithAccentsValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value || control.value === '') return null;
  // Permet: lettres (avec accents), espaces, apostrophes, tirets, points, virgules, parenthèses, chiffres
  const pattern = /^[a-zA-ZÀ-ÿ0-9\s\-'´`,.()]+$/;
  if (pattern.test(control.value)) {
    return null;
  }
  return { notAlphabetic: true };
}

@Component({
  selector: 'app-ecritures',
  template: `
    <div class="d-flex">
      <app-sidebar></app-sidebar>
      <div class="admin-content flex-grow-1">
        <div class="topbar d-flex justify-content-between align-items-center">
          <div>
            <h4 class="mb-0 fw-bold"><i class="bi bi-journal-text me-2 text-warning"></i>Écritures Comptables</h4>
            <small class="text-muted">
              Saisie : ADMINISTRATIF/ADMIN — Validation : TRÉSORIER/ADMIN
            </small>
          </div>
          <div class="d-flex gap-2">
            <span class="badge bg-warning text-dark fw-semibold" *ngIf="enAttente.length > 0">
              {{ enAttente.length }} à valider
            </span>
            <button class="btn btn-mellita" (click)="openModal()" *ngIf="canSaisir()">
              <i class="bi bi-plus-lg me-2"></i>Nouvelle écriture
            </button>
          </div>
        </div>

        <div class="p-4">
          <!-- Bilan -->
          <div class="row g-3 mb-4" *ngIf="bilan">
            <div class="col-md-3" *ngFor="let b of bilanCards">
              <div class="bilan-card" [style.border-left-color]="b.color">
                <div class="bc-icon" [style.background]="b.color+'20'" [style.color]="b.color">
                  <i class="bi {{ b.icon }}"></i>
                </div>
                <div class="bc-val" [style.color]="b.color">{{ b.value }}</div>
                <div class="bc-lbl">{{ b.label }}</div>
              </div>
            </div>
          </div>

          <!-- Tabs -->
          <div class="tabs-bar mb-4">
            <button class="tab-btn" [class.active]="tab==='toutes'" (click)="tab='toutes'">
              Toutes ({{ ecritures.length }})
            </button>
            <button class="tab-btn" [class.active]="tab==='attente'" (click)="tab='attente'"
                    *ngIf="canValider()">
              En attente
              <span class="badge bg-warning text-dark ms-1" *ngIf="enAttente.length>0">{{ enAttente.length }}</span>
            </button>
            <button class="tab-btn" [class.active]="tab==='validees'" (click)="tab='validees'">
              Validées
            </button>
          </div>

          <div class="table-responsive admin-table-wrap">
            <table class="table table-mellita mb-0">
              <thead>
                <tr>
                  <th>Libellé</th><th>Type</th><th>Catégorie</th>
                  <th>Montant</th><th>Date</th><th>Saisi par</th><th>Statut</th><th>Référence</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let e of getDisplayed()">
                  <td class="fw-semibold">{{ e.libelle }}</td>
                  <td>
                    <span class="type-badge" [class.recette]="e.type==='RECETTE'" [class.depense]="e.type==='DEPENSE'">
                      <i class="bi bi-arrow-up" *ngIf="e.type==='RECETTE'"></i>
                      <i class="bi bi-arrow-down" *ngIf="e.type==='DEPENSE'"></i>
                      {{ e.type }}
                    </span>
                   </td>
                  <td><span class="cat-tag">{{ e.categorie?.replace('_',' ') }}</span></td>
                  <td [class.text-success]="e.type==='RECETTE'" [class.text-danger]="e.type==='DEPENSE'" class="fw-bold">
                    {{ e.type==='RECETTE' ? '+' : '-' }}{{ e.montant | number:'1.0-2' }} TND
                   </td>
                  <td class="text-muted small">{{ e.dateEcriture | date:'dd/MM/yyyy' }}</td>
                  <td class="small">{{ e.saisiPar?.prenom }} {{ e.saisiPar?.nom }}</td>
                  <td>
                    <span class="statut-badge {{ e.statut?.toLowerCase() }}">{{ e.statut }}</span>
                    <div class="small text-muted" *ngIf="e.motifRejet">{{ e.motifRejet }}</div>
                   </td>
                  <td class="small text-muted">{{ e.reference || '-' }}</td>
                  <td>
                    <div class="d-flex gap-1" *ngIf="e.statut==='EN_ATTENTE' && canValider()">
                      <button class="action-btn ok" (click)="valider(e.id)" title="Valider">
                        <i class="bi bi-check-lg"></i>
                      </button>
                      <button class="action-btn rej" (click)="rejeterEcriture(e)" title="Rejeter">
                        <i class="bi bi-x-lg"></i>
                      </button>
                    </div>
                    <button class="action-btn del" (click)="deleteEcriture(e.id)" *ngIf="isAdmin()">
                      <i class="bi bi-trash-fill"></i>
                    </button>
                   </td>
                 </tr>
                <tr *ngIf="getDisplayed().length===0">
                  <td colspan="9" class="text-center text-muted py-5">Aucune écriture</td>
                 </tr>
              </tbody>
            </table>
          </div>

          <!-- Règle de gestion -->
          <div class="mt-3 rule-note">
            <i class="bi bi-shield-lock-fill me-2 text-warning"></i>
            <small><strong>Règle :</strong> L'ADMINISTRATIF saisit les écritures, le TRÉSORIER ou l'ADMIN les valide. Un saisissant ne peut pas valider ses propres écritures.</small>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal saisie -->
    <div class="modal-overlay" *ngIf="showModal" (click)="closeModal()">
      <div class="modal-box" (click)="$event.stopPropagation()">
        <div class="modal-hdr">
          <h5 class="fw-bold mb-0"><i class="bi bi-journal-plus me-2"></i>Nouvelle Écriture</h5>
          <button class="close-btn" (click)="closeModal()"><i class="bi bi-x-lg"></i></button>
        </div>
        <div class="modal-bdy">
          <form [formGroup]="form">
            <!-- Libellé -->
            <div class="mb-3">
              <label class="form-label fw-semibold">Libellé *</label>
              <input type="text" class="form-control" formControlName="libelle"
                     [class.is-invalid]="form.get('libelle')?.invalid && form.get('libelle')?.touched">
              <div class="text-danger small mt-1" *ngIf="form.get('libelle')?.invalid && form.get('libelle')?.touched">
                <span *ngIf="form.get('libelle')?.errors?.['required']">⛔ Le libellé est obligatoire</span>
                <span *ngIf="form.get('libelle')?.errors?.['notAlphabetic']">⛔ Le libellé doit contenir uniquement des lettres, chiffres, espaces, apostrophes et tirets</span>
              </div>
            </div>

            <div class="row g-3">
              <!-- Type -->
              <div class="col-6">
                <label class="form-label fw-semibold">Type *</label>
                <select class="form-select" formControlName="type"
                        [class.is-invalid]="form.get('type')?.invalid && form.get('type')?.touched">
                  <option value="">— Sélectionnez un type —</option>
                  <option value="RECETTE">Recette</option>
                  <option value="DEPENSE">Dépense</option>
                </select>
                <div class="text-danger small mt-1" *ngIf="form.get('type')?.invalid && form.get('type')?.touched">
                  ⛔ Le type est obligatoire
                </div>
              </div>

              <!-- Catégorie -->
              <div class="col-6">
                <label class="form-label fw-semibold">Catégorie *</label>
                <select class="form-select" formControlName="categorie"
                        [class.is-invalid]="form.get('categorie')?.invalid && form.get('categorie')?.touched">
                  <option value="">— Sélectionnez une catégorie —</option>
                  <option value="COTISATION">Cotisation</option>
                  <option value="DON">Don</option>
                  <option value="FRAIS_CLUB">Frais Club</option>
                  <option value="SUBVENTION">Subvention</option>
                  <option value="FORMATION">Formation</option>
                  <option value="FOURNITURES">Fournitures</option>
                  <option value="SALAIRE_ANIMATEUR">Salaire Animateur</option>
                  <option value="LOYER">Loyer</option>
                  <option value="EVENEMENT">Événement</option>
                  <option value="AUTRE">Autre</option>
                </select>
                <div class="text-danger small mt-1" *ngIf="form.get('categorie')?.invalid && form.get('categorie')?.touched">
                  ⛔ La catégorie est obligatoire
                </div>
              </div>

              <!-- Montant -->
              <div class="col-6">
                <label class="form-label fw-semibold">Montant (TND) *</label>
                <input type="number" class="form-control" formControlName="montant" min="0.01" step="0.01"
                       [class.is-invalid]="form.get('montant')?.invalid && form.get('montant')?.touched">
                <div class="text-danger small mt-1" *ngIf="form.get('montant')?.invalid && form.get('montant')?.touched">
                  <span *ngIf="form.get('montant')?.errors?.['required']">⛔ Le montant est obligatoire</span>
                  <span *ngIf="form.get('montant')?.errors?.['min']">⛔ Le montant doit être > 0 TND</span>
                </div>
              </div>

              <!-- Date -->
              <div class="col-6">
                <label class="form-label fw-semibold">Date *</label>
                <input type="date" class="form-control" formControlName="dateEcriture"
                       [class.is-invalid]="form.get('dateEcriture')?.invalid && form.get('dateEcriture')?.touched">
                <div class="text-danger small mt-1" *ngIf="form.get('dateEcriture')?.invalid && form.get('dateEcriture')?.touched">
                  ⛔ La date est obligatoire
                </div>
              </div>
            </div>

            <!-- Description -->
            <div class="mt-3">
              <label class="form-label fw-semibold">Description</label>
              <textarea class="form-control" formControlName="description" rows="2"></textarea>
            </div>

            <!-- Référence -->
            <div class="mt-3">
              <label class="form-label fw-semibold">Référence *</label>
              <input type="text" class="form-control" formControlName="reference"
                     placeholder="Ex: FACT-2024-001, RECU-001"
                     [class.is-invalid]="form.get('reference')?.invalid && form.get('reference')?.touched">
              <div class="text-danger small mt-1" *ngIf="form.get('reference')?.invalid && form.get('reference')?.touched">
                <span *ngIf="form.get('reference')?.errors?.['required']">⛔ La référence est obligatoire</span>
                <span *ngIf="form.get('reference')?.errors?.['notAlphabetic']">⛔ La référence doit contenir uniquement des lettres, chiffres, espaces, apostrophes et tirets</span>
              </div>
            </div>

            <!-- Info note -->
            <div class="mt-3 info-note">
              <i class="bi bi-info-circle me-2"></i>
              <small>Cette écriture sera soumise à validation par le TRÉSORIER ou l'ADMIN.</small>
            </div>

            <!-- Message d'erreur global -->
            <div class="alert alert-danger mt-3" *ngIf="form.invalid && form.touched">
              <i class="bi bi-exclamation-triangle-fill me-2"></i>
              Veuillez corriger toutes les erreurs ci-dessus avant d'enregistrer.
            </div>
          </form>
        </div>
        <div class="modal-ftr">
          <button class="btn btn-outline-secondary" (click)="closeModal()">Annuler</button>
          <button class="btn btn-mellita" (click)="saveEcriture()" [disabled]="saving || form.invalid">
            <span *ngIf="!saving">Soumettre</span>
            <span *ngIf="saving"><span class="spinner-border spinner-border-sm me-1"></span>...</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Rejet -->
    <div class="modal-overlay" *ngIf="showRejetModal" (click)="showRejetModal=false">
      <div class="modal-box" style="max-width:420px" (click)="$event.stopPropagation()">
        <div class="modal-hdr">
          <h5 class="fw-bold mb-0 text-danger"><i class="bi bi-x-circle me-2"></i>Rejeter l'écriture</h5>
          <button class="close-btn" (click)="showRejetModal=false"><i class="bi bi-x-lg"></i></button>
        </div>
        <div class="modal-bdy">
          <p class="text-muted">Écriture : <strong>{{ ecritureToReject?.libelle }}</strong></p>
          <label class="form-label fw-semibold">Motif du rejet *</label>
          <textarea class="form-control" [(ngModel)]="motifRejet" rows="3"
                     [class.is-invalid]="!motifRejet && motifRejetTouched"
                     (blur)="motifRejetTouched=true"
                     placeholder="Expliquez pourquoi vous rejetez cette écriture..."></textarea>
          <div class="text-danger small mt-1" *ngIf="!motifRejet && motifRejetTouched">
            ⛔ Le motif de rejet est obligatoire
          </div>
        </div>
        <div class="modal-ftr">
          <button class="btn btn-outline-secondary" (click)="showRejetModal=false">Annuler</button>
          <button class="btn btn-danger" (click)="confirmerRejet()" [disabled]="!motifRejet">
            <i class="bi bi-x-lg me-1"></i>Rejeter
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-content { margin-left:260px; background:#f4f6f8; min-height:100vh; }
    .topbar { background:white; padding:20px 28px; border-bottom:1px solid #f0f0f0; }
    .btn-mellita { background:linear-gradient(135deg,#1a6b3c,#2d9e5f); color:white; border:none; border-radius:10px; font-weight:600; padding:9px 22px; }
    .btn-mellita:hover { color:white; }
    .btn-mellita:disabled { opacity:0.6; cursor:not-allowed; }
    .bilan-card { background:white; border-radius:14px; padding:18px; border-left:4px solid; box-shadow:0 2px 8px rgba(0,0,0,.05); display:flex; align-items:center; gap:14px; }
    .bc-icon { width:44px; height:44px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:1.3rem; flex-shrink:0; }
    .bc-val { font-size:1.4rem; font-weight:900; line-height:1; }
    .bc-lbl { color:#6c757d; font-size:.78rem; margin-top:3px; }
    .tabs-bar { display:flex; gap:4px; background:white; padding:6px; border-radius:12px; box-shadow:0 2px 8px rgba(0,0,0,.05); width:fit-content; }
    .tab-btn { background:none; border:none; padding:8px 20px; border-radius:8px; font-weight:600; color:#6c757d; cursor:pointer; transition:all .2s; }
    .tab-btn.active { background:#1a6b3c; color:white; }
    .admin-table-wrap { background:white; border-radius:14px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,.05); }
    .type-badge { display:inline-flex; align-items:center; gap:4px; padding:3px 10px; border-radius:20px; font-size:.72rem; font-weight:700; }
    .type-badge.recette { background:#d4edda; color:#155724; }
    .type-badge.depense { background:#f8d7da; color:#721c24; }
    .cat-tag { background:#f0f4ff; color:#4361ee; padding:2px 8px; border-radius:6px; font-size:.72rem; font-weight:600; }
    .statut-badge { padding:3px 10px; border-radius:20px; font-size:.72rem; font-weight:700; display:inline-block; }
    .statut-badge.en_attente { background:#fff3cd; color:#856404; }
    .statut-badge.validee { background:#d4edda; color:#155724; }
    .statut-badge.rejetee { background:#f8d7da; color:#721c24; }
    .action-btn { width:30px; height:30px; border:none; border-radius:7px; display:flex; align-items:center; justify-content:center; font-size:.8rem; cursor:pointer; transition:all .2s; }
    .action-btn.ok { background:#d4edda; color:#155724; } .action-btn.ok:hover { background:#155724; color:white; }
    .action-btn.rej { background:#fff3cd; color:#856404; } .action-btn.rej:hover { background:#dc3545; color:white; }
    .action-btn.del { background:#fde8e8; color:#c0392b; } .action-btn.del:hover { background:#c0392b; color:white; }
    .rule-note { background:rgba(255,193,7,.08); border:1px solid rgba(255,193,7,.25); border-radius:10px; padding:10px 16px; }
    .info-note { background:rgba(23,162,184,.08); border:1px solid rgba(23,162,184,.2); border-radius:10px; padding:10px 16px; }
    .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,.5); z-index:9000; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px); }
    .modal-box { background:white; border-radius:20px; width:100%; max-width:560px; max-height:90vh; overflow-y:auto; box-shadow:0 20px 60px rgba(0,0,0,.2); }
    .modal-hdr { padding:20px 24px; border-bottom:1px solid #f0f0f0; display:flex; justify-content:space-between; align-items:center; }
    .modal-bdy { padding:24px; }
    .modal-ftr { padding:16px 24px; border-top:1px solid #f0f0f0; display:flex; justify-content:flex-end; gap:10px; }
    .close-btn { background:none; border:none; font-size:1.1rem; color:#6c757d; cursor:pointer; width:32px; height:32px; border-radius:8px; display:flex; align-items:center; justify-content:center; }
    .close-btn:hover { background:#f0f0f0; }
    .text-danger { color:#dc3545; }
    .is-invalid { border-color:#dc3545; }
    .alert-danger { background-color:#f8d7da; border-color:#f5c6cb; color:#721c24; border-radius:8px; padding:10px; }
  `]
})
export class EcrituresComponent implements OnInit {
  ecritures: any[] = [];
  enAttente: any[] = [];
  bilan: any = null;
  bilanCards: any[] = [];
  tab = 'toutes';
  showModal = false;
  showRejetModal = false;
  saving = false;
  ecritureToReject: any = null;
  motifRejet = '';
  motifRejetTouched = false;
  form!: FormGroup;

  constructor(
    private ecritureService: EcritureService,
    public authService: AuthService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadData();
  }

  buildForm(): void {
    this.form = this.fb.group({
      libelle: ['', [Validators.required, alphaNumWithAccentsValidator]],
      type: ['', Validators.required],
      categorie: ['', Validators.required],
      montant: [0, [Validators.required, Validators.min(0.01)]],
      dateEcriture: ['', Validators.required],
      description: [''],
      reference: ['', [Validators.required, alphaNumWithAccentsValidator]]
    });
  }

  loadData(): void {
    this.ecritureService.getAll().subscribe(e => this.ecritures = e);
    if (this.canValider()) {
      this.ecritureService.getEnAttente().subscribe(e => this.enAttente = e);
      this.ecritureService.getBilan().subscribe(b => {
        this.bilan = b;
        this.bilanCards = [
          { icon: 'bi-arrow-up-circle-fill', label: 'Recettes validées', value: b.totalRecettes.toFixed(2) + ' TND', color: '#28a745' },
          { icon: 'bi-arrow-down-circle-fill', label: 'Dépenses validées', value: b.totalDepenses.toFixed(2) + ' TND', color: '#dc3545' },
          { icon: 'bi-wallet2-fill', label: 'Solde', value: b.solde.toFixed(2) + ' TND', color: b.solde >= 0 ? '#1a6b3c' : '#dc3545' },
          { icon: 'bi-hourglass-split', label: 'En attente', value: b.ecrituresEnAttente + ' écritures', color: '#c8a84b' },
        ];
      });
    }
  }

  getDisplayed(): any[] {
    if (this.tab === 'attente') return this.ecritures.filter(e => e.statut === 'EN_ATTENTE');
    if (this.tab === 'validees') return this.ecritures.filter(e => e.statut === 'VALIDEE');
    return this.ecritures;
  }

  openModal(): void {
    this.buildForm();
    this.showModal = true;
  }

  closeModal(): void { this.showModal = false; }

  saveEcriture(): void {
    // Marquer tous les champs comme touchés
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      control?.markAsTouched();
    });
    this.form.markAllAsTouched();

    // Vérifier si le formulaire est valide
    if (this.form.invalid) {
      console.log('❌ Formulaire invalide - Envoi bloqué');
      console.log('Erreurs détaillées:', this.form.errors);
      Object.keys(this.form.controls).forEach(key => {
        const control = this.form.get(key);
        if (control?.invalid) {
          console.log(`- ${key}:`, control.errors);
        }
      });
      return; // ⛔ BLOQUE L'ENVOI
    }

    this.saving = true;
    this.ecritureService.create(this.form.value).subscribe({
      next: () => {
        this.loadData();
        this.closeModal();
        this.saving = false;
      },
      error: (err) => {
        console.error('Erreur lors de la création:', err);
        this.saving = false;
      }
    });
  }

  valider(id: number): void {
    this.ecritureService.valider(id).subscribe(() => this.loadData());
  }

  rejeterEcriture(e: any): void {
    this.ecritureToReject = e;
    this.motifRejet = '';
    this.motifRejetTouched = false;
    this.showRejetModal = true;
  }

  confirmerRejet(): void {
    if (!this.ecritureToReject || !this.motifRejet) {
      this.motifRejetTouched = true;
      return;
    }
    this.ecritureService.rejeter(this.ecritureToReject.id, this.motifRejet).subscribe(() => {
      this.showRejetModal = false;
      this.loadData();
    });
  }

  deleteEcriture(id: number): void {
    if (!confirm('Supprimer cette écriture ?')) return;
    this.ecritureService.delete(id).subscribe(() => this.loadData());
  }

  canSaisir(): boolean { return this.authService.hasSaisieAccess(); }
  canValider(): boolean { return this.authService.canValidateFinance(); }
  isAdmin(): boolean { return this.authService.isAdmin(); }
}
