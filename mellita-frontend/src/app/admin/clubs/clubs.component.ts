import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ClubService, UserService } from '../../core/services/api.services';
import { AuthService } from '../../core/services/auth.service';

function alphaNumWithAccentsValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value || control.value === '') return null;
  const pattern = /^[a-zA-ZÀ-ÿ\s\-'´`,.()]+$/;
  if (pattern.test(control.value)) {
    return null;
  }
  return { notAlphabetic: true };
}

@Component({
  selector: 'app-clubs',
  template: `
    <div class="d-flex">
      <app-sidebar></app-sidebar>
      <div class="admin-content flex-grow-1">
        <div class="topbar d-flex justify-content-between align-items-center">
          <div>
            <h4 class="mb-0 fw-bold"><i class="bi bi-trophy-fill me-2" style="color:#e83e8c"></i>
              {{ isAnimateur() ? 'Mes Clubs' : isMembre() ? 'Mes Clubs' : 'Gestion des Clubs' }}
            </h4>
            <small class="text-muted">{{ clubs.length }} club(s)</small>
          </div>
          <button class="btn btn-mellita" (click)="openModal()" *ngIf="isAdminOrAdministratif()">
            <i class="bi bi-plus-lg me-2"></i>Créer un Club
          </button>
        </div>

        <div class="toast-notification" [class.show]="showToast" [class.error]="toastType === 'error'">
          <div class="toast-content">
            <i class="bi" [class.bi-check-circle-fill]="toastType === 'success'"
                         [class.bi-exclamation-triangle-fill]="toastType === 'error'"></i>
            <span>{{ toastMessage }}</span>
            <button class="toast-close" (click)="showToast = false"><i class="bi bi-x-lg"></i></button>
          </div>
        </div>

        <div class="p-4">
          <div class="text-center py-5" *ngIf="loading">
            <div class="spinner-border text-success" style="width:3rem;height:3rem"></div>
          </div>
          <div class="row g-4" *ngIf="!loading">
            <div class="col-md-6 col-lg-4" *ngFor="let club of clubs">
              <div class="club-card">
                <div class="cc-header">
                  <div class="cc-icon"><i class="bi bi-trophy-fill"></i></div>
                  <div class="cc-info">
                    <h6 class="fw-bold text-white mb-0">{{ club.nom }}</h6>
                    <small style="color:rgba(255,255,255,.6)">{{ club.horaire }}</small>
                  </div>
                  <span class="cc-statut">{{ club.statut }}</span>
                </div>
                <div class="cc-body">
                  <p class="text-muted small mb-3">{{ club.description | slice:0:90 }}...</p>
                  <div class="cc-meta">
                    <div class="meta-item" *ngIf="club.lieu">
                      <i class="bi bi-geo-alt-fill text-success"></i>{{ club.lieu }}
                    </div>
                    <div class="meta-item">
                      <i class="bi bi-tag-fill text-warning"></i>{{ club.tarifSeance }} TND/séance
                    </div>
                    <div class="meta-item" *ngIf="club.animateurNom">
                      <i class="bi bi-person-fill" style="color:#e83e8c"></i>
                      {{ club.animateurPrenom }} {{ club.animateurNom }}
                    </div>
                    <div class="meta-item" *ngIf="!club.animateurNom && isAdminOrAdministratif()">
                      <i class="bi bi-exclamation-triangle text-warning"></i>
                      <span class="text-warning small">Animateur non assigné</span>
                    </div>
                    <div class="meta-item" *ngIf="club.partAnimateur && !isMembre()">
                      <i class="bi bi-cash-stack" style="color:#1a6b3c"></i>
                      Part animateur: {{ club.partAnimateur }}{{ club.typePartAnimateur === 'POURCENTAGE' ? '%' : ' TND' }}/séance
                    </div>
                  </div>
                  <!-- Infos inscription pour le membre -->
                  <div class="mt-2" *ngIf="isMembre()">
                    <small class="text-muted">
                      <i class="bi bi-calendar-check me-1"></i>Séances : {{ club.nombreSeances || 0 }}
                      &nbsp;·&nbsp;
                      <i class="bi bi-cash me-1"></i>{{ club.montantDuMois || 0 }} TND
                      &nbsp;·&nbsp;
                      <span [class]="club.paye ? 'text-success' : 'text-warning'">
                        <i class="bi bi-circle-fill me-1" style="font-size:0.5rem"></i>
                        {{ club.paye ? 'Payé' : 'En attente' }}
                      </span>
                    </small>
                  </div>
                </div>
                <div class="cc-footer">
                  <button class="btn btn-sm btn-outline-success" (click)="voirMembres(club)" *ngIf="!isMembre()">
                    <i class="bi bi-people me-1"></i>Membres
                  </button>
                  <div class="ms-auto d-flex gap-1" *ngIf="isAdminOrAdministratif()">
                    <button class="action-btn edit" (click)="editClub(club)"><i class="bi bi-pencil-fill"></i></button>
                    <button class="action-btn del" (click)="deleteClub(club.id)"><i class="bi bi-trash-fill"></i></button>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-12 text-center py-5" *ngIf="clubs.length === 0">
              <i class="bi bi-trophy" style="font-size:4rem;color:#dee2e6"></i>
              <p class="text-muted mt-3">Aucun club</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Club -->
    <div class="modal-overlay" *ngIf="showModal" (click)="closeModal()">
      <div class="modal-box" (click)="$event.stopPropagation()">
        <div class="modal-hdr">
          <h5 class="fw-bold mb-0">{{ editMode ? 'Modifier' : 'Créer' }} un Club</h5>
          <button class="close-btn" (click)="closeModal()"><i class="bi bi-x-lg"></i></button>
        </div>
        <div class="modal-bdy">
          <form [formGroup]="clubForm">
            <div class="row g-3">
              <div class="col-6">
                <label class="form-label fw-semibold">Nom (FR) *</label>
                <input type="text" class="form-control" formControlName="nom"
                       [class.is-invalid]="clubForm.get('nom')?.invalid && clubForm.get('nom')?.touched">
                <div class="text-danger small mt-1" *ngIf="clubForm.get('nom')?.invalid && clubForm.get('nom')?.touched">
                  <span *ngIf="clubForm.get('nom')?.errors?.['required']">⛔ Le nom est obligatoire</span>
                  <span *ngIf="clubForm.get('nom')?.errors?.['notAlphabetic']">⛔ Le nom doit contenir uniquement des lettres, espaces, apostrophes et tirets</span>
                </div>
              </div>
              <div class="col-6">
                <label class="form-label fw-semibold">Nom (AR)</label>
                <input type="text" class="form-control" formControlName="nomAr" dir="rtl"
                       [class.is-invalid]="clubForm.get('nomAr')?.invalid && clubForm.get('nomAr')?.touched">
                <div class="text-danger small mt-1" *ngIf="clubForm.get('nomAr')?.invalid && clubForm.get('nomAr')?.touched">
                  <span *ngIf="clubForm.get('nomAr')?.errors?.['notAlphabetic']">⛔ Le nom arabe doit contenir uniquement des lettres, espaces, apostrophes et tirets</span>
                </div>
              </div>
              <div class="col-12">
                <label class="form-label fw-semibold">Description</label>
                <textarea class="form-control" formControlName="description" rows="2"></textarea>
              </div>
              <div class="col-6">
                <label class="form-label fw-semibold">Tarif/séance (TND) *</label>
                <input type="number" class="form-control" formControlName="tarifSeance" min="0.01" step="0.01"
                       [class.is-invalid]="clubForm.get('tarifSeance')?.invalid && clubForm.get('tarifSeance')?.touched">
                <div class="text-danger small mt-1" *ngIf="clubForm.get('tarifSeance')?.invalid && clubForm.get('tarifSeance')?.touched">
                  <span *ngIf="clubForm.get('tarifSeance')?.errors?.['required']">⛔ Le tarif est obligatoire</span>
                  <span *ngIf="clubForm.get('tarifSeance')?.errors?.['min']">⛔ Le tarif doit être > 0 TND</span>
                </div>
              </div>
              <div class="col-6">
                <label class="form-label fw-semibold">Part Animateur *</label>
                <input type="number" class="form-control" formControlName="partAnimateur" min="0.01" step="0.01"
                       [class.is-invalid]="clubForm.get('partAnimateur')?.invalid && clubForm.get('partAnimateur')?.touched">
                <div class="text-danger small mt-1" *ngIf="clubForm.get('partAnimateur')?.invalid && clubForm.get('partAnimateur')?.touched">
                  <span *ngIf="clubForm.get('partAnimateur')?.errors?.['required']">⛔ La part animateur est obligatoire</span>
                  <span *ngIf="clubForm.get('partAnimateur')?.errors?.['min']">⛔ La part animateur doit être > 0</span>
                </div>
              </div>
              <div class="col-6">
                <label class="form-label fw-semibold">Type part</label>
                <select class="form-select" formControlName="typePartAnimateur">
                  <option value="FIXE">Fixe (TND)</option>
                  <option value="POURCENTAGE">Pourcentage (%)</option>
                </select>
              </div>
              <div class="col-6">
                <label class="form-label fw-semibold">Capacité Max *</label>
                <input type="number" class="form-control" formControlName="capaciteMax" min="1"
                       [class.is-invalid]="clubForm.get('capaciteMax')?.invalid && clubForm.get('capaciteMax')?.touched">
                <div class="text-danger small mt-1" *ngIf="clubForm.get('capaciteMax')?.invalid && clubForm.get('capaciteMax')?.touched">
                  <span *ngIf="clubForm.get('capaciteMax')?.errors?.['required']">⛔ La capacité maximale est obligatoire</span>
                  <span *ngIf="clubForm.get('capaciteMax')?.errors?.['min']">⛔ La capacité maximale doit être ≥ 1 personne</span>
                </div>
              </div>
              <div class="col-6">
                <label class="form-label fw-semibold">Lieu *</label>
                <input type="text" class="form-control" formControlName="lieu"
                       [class.is-invalid]="clubForm.get('lieu')?.invalid && clubForm.get('lieu')?.touched">
                <div class="text-danger small mt-1" *ngIf="clubForm.get('lieu')?.invalid && clubForm.get('lieu')?.touched">
                  <span *ngIf="clubForm.get('lieu')?.errors?.['required']">⛔ Le lieu est obligatoire</span>
                  <span *ngIf="clubForm.get('lieu')?.errors?.['notAlphabetic']">⛔ Le lieu doit contenir uniquement des lettres, espaces, apostrophes et tirets</span>
                </div>
              </div>
              <div class="col-6">
                <label class="form-label fw-semibold">Horaire *</label>
                <input type="text" class="form-control" formControlName="horaire" placeholder="Ex: Lundi 18h-20h"
                       [class.is-invalid]="clubForm.get('horaire')?.invalid && clubForm.get('horaire')?.touched">
                <div class="text-danger small mt-1" *ngIf="clubForm.get('horaire')?.invalid && clubForm.get('horaire')?.touched">⛔ L'horaire est obligatoire</div>
              </div>
              <div class="col-12">
                <label class="form-label fw-semibold">Animateur *</label>
                <select class="form-select" formControlName="animateurId"
                        [class.is-invalid]="clubForm.get('animateurId')?.invalid && clubForm.get('animateurId')?.touched">
                  <option value="">— Sélectionnez un animateur —</option>
                  <option *ngFor="let a of animateurs" [value]="a.id">{{ a.prenom }} {{ a.nom }}</option>
                </select>
                <div class="text-danger small mt-1" *ngIf="clubForm.get('animateurId')?.invalid && clubForm.get('animateurId')?.touched">⛔ L'animateur est obligatoire</div>
              </div>
              <div class="col-6" *ngIf="editMode">
                <label class="form-label fw-semibold">Statut</label>
                <select class="form-select" formControlName="statut">
                  <option value="ACTIF">Actif</option>
                  <option value="INACTIF">Inactif</option>
                  <option value="SUSPENDU">Suspendu</option>
                </select>
              </div>
            </div>
            <div class="alert alert-danger mt-3" *ngIf="clubForm.invalid && clubForm.touched">
              <i class="bi bi-exclamation-triangle-fill me-2"></i>Veuillez corriger toutes les erreurs ci-dessus avant d'enregistrer.
            </div>
          </form>
        </div>
        <div class="modal-ftr">
          <button class="btn btn-outline-secondary" (click)="closeModal()">Annuler</button>
          <button class="btn btn-mellita" (click)="saveClub()" [disabled]="saving || clubForm.invalid">
            <span *ngIf="!saving">Enregistrer</span>
            <span *ngIf="saving"><span class="spinner-border spinner-border-sm me-1"></span>...</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Membres -->
    <div class="modal-overlay" *ngIf="showMembresModal" (click)="showMembresModal=false">
      <div class="modal-box" style="max-width:640px" (click)="$event.stopPropagation()">
        <div class="modal-hdr">
          <h5 class="fw-bold mb-0">Membres — {{ selectedClub?.nom }}</h5>
          <button class="close-btn" (click)="showMembresModal=false"><i class="bi bi-x-lg"></i></button>
        </div>
        <div class="modal-bdy">
          <table class="table table-sm table-hover mb-0">
            <thead class="table-success">
              <tr><th>Membre</th><th>Séances</th><th>Montant dû</th><th>Payé</th></tr>
            </thead>
            <tbody>
              <tr *ngFor="let insc of membresClub">
                <td>{{ insc.membrePrenom }} {{ insc.membreNom }}</td>
                <td><span class="badge bg-primary">{{ insc.nombreSeances }}</span></td>
                <td class="fw-bold">{{ insc.montantDuMois | number:'1.0-2' }} TND</td>
                <td><span class="badge" [class.bg-success]="insc.paye" [class.bg-warning]="!insc.paye">{{ insc.paye ? 'Payé' : 'En attente' }}</span></td>
              </tr>
              <tr *ngIf="membresClub.length===0"><td colspan="4" class="text-center text-muted py-3">Aucun membre inscrit</td></tr>
            </tbody>
          </table>
          <div class="mt-3 d-flex justify-content-end" *ngIf="hasSaisie()">
            <button class="btn btn-sm btn-outline-warning" (click)="calculerFrais()">
              <i class="bi bi-calculator me-1"></i>Recalculer les frais mensuels
            </button>
          </div>
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
    .toast-notification { position:fixed; top:20px; right:20px; z-index:10000; background:white; border-radius:12px; box-shadow:0 4px 20px rgba(0,0,0,0.15); padding:12px 20px; transform:translateX(400px); transition:transform 0.3s ease-in-out; border-left:4px solid #28a745; }
    .toast-notification.show { transform:translateX(0); }
    .toast-notification.error { border-left-color:#dc3545; }
    .toast-content { display:flex; align-items:center; gap:12px; }
    .toast-content i { font-size:1.2rem; color:#28a745; }
    .toast-notification.error .toast-content i { color:#dc3545; }
    .toast-close { background:none; border:none; cursor:pointer; margin-left:12px; padding:0; color:#6c757d; }
    .toast-close:hover { color:#333; }
    .club-card { background:white; border-radius:18px; overflow:hidden; box-shadow:0 2px 12px rgba(0,0,0,.06); transition:all .3s; display:flex; flex-direction:column; }
    .club-card:hover { transform:translateY(-5px); box-shadow:0 10px 30px rgba(0,0,0,.1); }
    .cc-header { background:linear-gradient(135deg,#1a0535,#4a148c,#1a6b3c); padding:18px; display:flex; align-items:center; gap:12px; }
    .cc-icon { width:40px; height:40px; background:rgba(255,255,255,.15); border-radius:10px; display:flex; align-items:center; justify-content:center; color:white; font-size:1.2rem; flex-shrink:0; }
    .cc-info { flex-grow:1; min-width:0; }
    .cc-statut { padding:3px 10px; border-radius:20px; font-size:.65rem; font-weight:700; background:rgba(255,255,255,.2); color:white; flex-shrink:0; }
    .cc-body { padding:18px; flex-grow:1; }
    .cc-meta { display:flex; flex-direction:column; gap:7px; }
    .meta-item { display:flex; align-items:center; gap:8px; font-size:.83rem; color:#495057; }
    .cc-footer { padding:12px 16px; border-top:1px solid #f0f0f0; display:flex; align-items:center; gap:8px; }
    .action-btn { width:30px; height:30px; border:none; border-radius:7px; display:flex; align-items:center; justify-content:center; font-size:.75rem; cursor:pointer; transition:all .2s; }
    .action-btn.edit { background:#e8f5e9; color:#1a6b3c; } .action-btn.edit:hover { background:#1a6b3c; color:white; }
    .action-btn.del { background:#fde8e8; color:#c0392b; } .action-btn.del:hover { background:#c0392b; color:white; }
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
    .text-success { color:#28a745; }
    .text-warning { color:#ffc107; }
  `]
})
export class ClubsComponent implements OnInit {
  clubs: any[] = [];
  animateurs: any[] = [];
  membresClub: any[] = [];
  selectedClub: any = null;
  loading = true;
  showModal = false;
  showMembresModal = false;
  editMode = false;
  editingId: number | null = null;
  saving = false;
  clubForm!: FormGroup;
  showToast = false;
  toastType: 'success' | 'error' = 'success';
  toastMessage = '';
  private toastTimer: any;

  constructor(
    private clubService: ClubService,
    private userService: UserService,
    public authService: AuthService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadClubs();
    if (!this.isAnimateur() && !this.isMembre()) {
      this.userService.getAll().subscribe(u =>
        this.animateurs = u.filter((x: any) => x.role === 'ANIMATEUR')
      );
    }
  }

  buildForm(c?: any): void {
    this.clubForm = this.fb.group({
      nom: [c?.nom || '', [Validators.required, alphaNumWithAccentsValidator]],
      nomAr: [c?.nomAr || ''], // ✅ Plus de validation, champ optionnel
      description: [c?.description || ''],
      tarifSeance: [c?.tarifSeance ?? 0, [Validators.required, Validators.min(0.01)]],
      partAnimateur: [c?.partAnimateur ?? 0, [Validators.required, Validators.min(0.01)]],
      typePartAnimateur: [c?.typePartAnimateur || 'FIXE'],
      capaciteMax: [c?.capaciteMax || 20, [Validators.required, Validators.min(1)]],
      lieu: [c?.lieu || '', [Validators.required, alphaNumWithAccentsValidator]],
      horaire: [c?.horaire || '', Validators.required],
      animateurId: [c?.animateurId || '', Validators.required],
      statut: [c?.statut || 'ACTIF']
    });
  }

  loadClubs(): void {
    this.loading = true;
    let obs;
    if (this.isMembre()) {
      obs = this.clubService.getMesInscriptionsClub();
    } else if (this.isAnimateur()) {
      obs = this.clubService.getMesClubs();
    } else {
      obs = this.clubService.getAll();
    }
    obs.subscribe({
      next: c => { this.clubs = c; this.loading = false; },
      error: () => { this.loading = false; this.showNotification('Erreur chargement clubs', 'error'); }
    });
  }

  openModal(): void {
    this.editMode = false;
    this.editingId = null;
    this.buildForm();
    this.showModal = true;
  }

  closeModal(): void { this.showModal = false; }

  editClub(c: any): void {
    this.editMode = true;
    this.editingId = c.id;
    this.buildForm(c);
    this.showModal = true;
  }

  saveClub(): void {
    Object.keys(this.clubForm.controls).forEach(key => {
      const control = this.clubForm.get(key);
      control?.markAsTouched();
    });
    this.clubForm.markAllAsTouched();
    if (this.clubForm.invalid) {
      this.showNotification('Veuillez corriger les erreurs dans le formulaire', 'error');
      return;
    }
    this.saving = true;
    const data = { ...this.clubForm.value };
    const animateurId = data.animateurId;
    delete data.animateurId;
    const obs = this.editMode
      ? this.clubService.update(this.editingId!, data)
      : this.clubService.create(data);
    obs.subscribe({
      next: (saved: any) => {
        const clubId = this.editMode ? this.editingId! : saved.id;
        this.clubService.affecterAnimateur(clubId, +animateurId).subscribe({
          next: () => {
            this.loadClubs();
            this.closeModal();
            this.saving = false;
            this.showNotification('Club sauvegardé avec succès', 'success');
          },
          error: () => {
            this.saving = false;
            this.showNotification('Erreur lors de l\'affectation de l\'animateur', 'error');
          }
        });
      },
      error: () => {
        this.saving = false;
        this.showNotification('Erreur lors de la sauvegarde du club', 'error');
      }
    });
  }

  deleteClub(id: number): void {
    if (!confirm('Supprimer ce club ? Toutes les présences et inscriptions liées seront supprimées.')) return;
    this.clubService.delete(id).subscribe({
      next: () => { this.loadClubs(); this.showNotification('Club supprimé avec succès', 'success'); },
      error: () => { this.showNotification('Erreur : impossible de supprimer ce club', 'error'); }
    });
  }

  voirMembres(club: any): void {
    this.selectedClub = club;
    this.clubService.getMembres(club.id).subscribe({
      next: m => { this.membresClub = m; this.showMembresModal = true; },
      error: () => this.showNotification('Erreur chargement membres', 'error')
    });
  }

  calculerFrais(): void {
    if (!this.selectedClub) return;
    this.clubService.calculerFraisMensuels(this.selectedClub.id).subscribe({
      next: () => {
        this.clubService.getMembres(this.selectedClub.id).subscribe(m => this.membresClub = m);
        this.showNotification('Frais recalculés avec succès !', 'success');
      },
      error: () => this.showNotification('Erreur lors du calcul des frais', 'error')
    });
  }

  showNotification(message: string, type: 'success' | 'error'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => { this.showToast = false; }, 3000);
  }

  isAdmin() { return this.authService.isAdmin(); }
  isAnimateur() { return this.authService.isAnimateur(); }
  isMembre() { return this.authService.isMembre(); }
  hasSaisie() { return this.authService.hasSaisieAccess(); }
  isAdminOrAdministratif() { return this.authService.isAdmin() || this.authService.isAdministratif(); }
}