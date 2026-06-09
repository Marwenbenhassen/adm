import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { EvenementService, DocumentService, FormationService, UserService } from '../../core/services/api.services';
import { Evenement, Document, Formation } from '../../models/models';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

// ============ VALIDATEURS PERSONNALISÉS ============
function alphaNumWithAccentsValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value || control.value === '') return null;
  const pattern = /^[a-zA-Z\u00C0-\u00FF\s\-'´`,.()]+$/;
  if (pattern.test(control.value)) {
    return null;
  }
  return { notAlphabetic: true };
}

function dateRangeValidator(group: AbstractControl): ValidationErrors | null {
  const dateDebut = group.get('dateDebut')?.value;
  const dateFin = group.get('dateFin')?.value;

  if (dateDebut && dateFin && new Date(dateFin) < new Date(dateDebut)) {
    return { dateFinInvalid: true };
  }
  return null;
}

// ============ ADMIN EVENTS COMPLET ============
@Component({
  selector: 'app-admin-events',
  template: `
    <div class="d-flex">
      <app-sidebar></app-sidebar>
      <div class="admin-content flex-grow-1">
        <div class="admin-topbar d-flex justify-content-between align-items-center">
          <div>
            <h4 class="mb-0 fw-bold">
              <i class="bi bi-calendar-event-fill me-2 text-primary"></i>
              {{ isMembre() ? 'Mes Événements' : 'Gestion des Événements' }}
            </h4>
            <small class="text-muted">{{ events.length }} événement(s)</small>
          </div>
          <button class="btn btn-mellita" (click)="openModal()" *ngIf="!isMembre()">
            <i class="bi bi-plus-lg me-2"></i>Ajouter
          </button>
        </div>
        <div class="p-4">
          <div class="row g-4" *ngIf="!loading">
            <div class="col-md-6 col-lg-4" *ngFor="let ev of events">
              <div class="ev-card">
                <div class="ev-card-header">
                  <span class="ev-statut {{ ev.statut?.toLowerCase() }}">{{ ev.statut?.replace('_',' ') }}</span>
                  <div class="ev-actions" *ngIf="!isMembre()">
                    <button class="btn-icon-sm members" (click)="voirMembres(ev)" title="Voir les membres inscrits">
                      <i class="bi bi-people-fill"></i>
                    </button>
                    <button class="btn-icon-sm edit" (click)="editEvent(ev)"><i class="bi bi-pencil-fill"></i></button>
                    <button class="btn-icon-sm del" (click)="deleteEvent(ev.id!)"><i class="bi bi-trash-fill"></i></button>
                  </div>
                  <div class="d-flex gap-1" *ngIf="isMembre()">
                    <span class="badge" [ngClass]="ev.presence ? 'bg-success' : 'bg-warning'" style="font-size:0.7rem">
                      {{ ev.presence ? 'Présent' : 'Absent' }}
                    </span>
                    <span class="badge" [ngClass]="ev.statutPaiement === 'PAYE' ? 'bg-success' : 'bg-danger'" style="font-size:0.7rem">
                      {{ ev.statutPaiement === 'PAYE' ? 'Payé' : 'En attente' }}
                    </span>
                  </div>
                </div>
                <div class="p-3">
                  <h6 class="fw-bold">{{ ev.titre }}</h6>
                  <p class="text-muted small mb-2">{{ ev.description | slice:0:80 }}...</p>
                  <div class="d-flex flex-wrap gap-2 mt-2">
                    <span class="info-tag"><i class="bi bi-calendar me-1"></i>{{ ev.dateDebut | date:'dd/MM/yyyy' }}</span>
                    <span class="info-tag" *ngIf="ev.lieu"><i class="bi bi-geo-alt me-1"></i>{{ ev.lieu }}</span>
                    <span class="info-tag price" *ngIf="ev.prix === 0">Gratuit</span>
                    <span class="info-tag price" *ngIf="ev.prix && ev.prix > 0">{{ ev.prix }} TND</span>
                    <span class="info-tag capacity"><i class="bi bi-people me-1"></i>{{ ev.capaciteMax }} places</span>
                  </div>
                  <div class="mt-2 small text-muted" *ngIf="isMembre() && ev.montantPaye !== undefined">
                    <i class="bi bi-credit-card me-1"></i>Payé: {{ ev.montantPaye }} TND
                  </div>
                </div>
              </div>
            </div>
            <div class="col-12 text-center text-muted py-5" *ngIf="events.length === 0">
              <i class="bi bi-calendar-x fs-1 mb-3 d-block"></i>
              {{ isMembre() ? 'Vous n\'êtes inscrit à aucun événement' : 'Aucun événement' }}
            </div>
          </div>
          <div class="text-center py-5" *ngIf="loading">
            <div class="spinner-border text-success"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Ajout/Modification Événement -->
    <div class="modal-overlay" *ngIf="showModal && !isMembre()" (click)="closeModal()">
      <div class="modal-box" (click)="$event.stopPropagation()">
        <div class="modal-header-custom">
          <h5 class="fw-bold mb-0">{{ editMode ? 'Modifier' : 'Ajouter' }} un Événement</h5>
          <button class="btn-close-custom" (click)="closeModal()"><i class="bi bi-x-lg"></i></button>
        </div>
        <div class="modal-body-custom">
          <form [formGroup]="eventForm">
            <div class="mb-3">
              <label class="form-label">Titre (FR) *</label>
              <input type="text" class="form-control" formControlName="titre" [class.is-invalid]="eventForm.get('titre')?.invalid && eventForm.get('titre')?.touched">
              <div class="text-danger small mt-1" *ngIf="eventForm.get('titre')?.invalid && eventForm.get('titre')?.touched">
                <span *ngIf="eventForm.get('titre')?.errors?.['required']">⛔ Le titre est obligatoire</span>
                <span *ngIf="eventForm.get('titre')?.errors?.['notAlphabetic']">⛔ Le titre doit contenir uniquement des lettres, espaces, apostrophes et tirets</span>
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label">Titre (AR)</label>
              <input type="text" class="form-control" formControlName="titreAr" dir="rtl">
            </div>
            <div class="mb-3">
              <label class="form-label">Description</label>
              <textarea class="form-control" formControlName="description" rows="3"></textarea>
            </div>
            <div class="row g-3">
              <div class="col-6">
                <label class="form-label">Date Début *</label>
                <input type="datetime-local" class="form-control" formControlName="dateDebut" [class.is-invalid]="eventForm.get('dateDebut')?.invalid && eventForm.get('dateDebut')?.touched">
                <div class="text-danger small mt-1" *ngIf="eventForm.get('dateDebut')?.invalid && eventForm.get('dateDebut')?.touched">⛔ La date de début est obligatoire</div>
              </div>
              <div class="col-6">
                <label class="form-label">Date Fin *</label>
                <input type="datetime-local" class="form-control" formControlName="dateFin" [class.is-invalid]="eventForm.get('dateFin')?.invalid && eventForm.get('dateFin')?.touched">
                <div class="text-danger small mt-1" *ngIf="eventForm.get('dateFin')?.invalid && eventForm.get('dateFin')?.touched">
                  <span *ngIf="eventForm.get('dateFin')?.errors?.['required']">⛔ La date de fin est obligatoire</span>
                  <span *ngIf="eventForm.get('dateFin')?.errors?.['dateFinInvalid']">⛔ La date de fin doit être après la date de début</span>
                </div>
              </div>
              <div class="col-6">
                <label class="form-label">Lieu *</label>
                <input type="text" class="form-control" formControlName="lieu" [class.is-invalid]="eventForm.get('lieu')?.invalid && eventForm.get('lieu')?.touched">
                <div class="text-danger small mt-1" *ngIf="eventForm.get('lieu')?.invalid && eventForm.get('lieu')?.touched">
                  <span *ngIf="eventForm.get('lieu')?.errors?.['required']">⛔ Le lieu est obligatoire</span>
                  <span *ngIf="eventForm.get('lieu')?.errors?.['notAlphabetic']">⛔ Le lieu doit contenir uniquement des lettres, espaces, apostrophes et tirets</span>
                </div>
              </div>
              <div class="col-6">
                <label class="form-label">Prix (TND) *</label>
                <input type="number" class="form-control" formControlName="prix" min="0" step="0.01" [class.is-invalid]="eventForm.get('prix')?.invalid && eventForm.get('prix')?.touched">
                <div class="text-danger small mt-1" *ngIf="eventForm.get('prix')?.invalid && eventForm.get('prix')?.touched">
                  <span *ngIf="eventForm.get('prix')?.errors?.['required']">⛔ Le prix est obligatoire</span>
                  <span *ngIf="eventForm.get('prix')?.errors?.['min']">⛔ Le prix doit être ≥ 0 TND</span>
                </div>
              </div>
              <div class="col-6">
                <label class="form-label">Capacité Max *</label>
                <input type="number" class="form-control" formControlName="capaciteMax" min="1" [class.is-invalid]="eventForm.get('capaciteMax')?.invalid && eventForm.get('capaciteMax')?.touched">
                <div class="text-danger small mt-1" *ngIf="eventForm.get('capaciteMax')?.invalid && eventForm.get('capaciteMax')?.touched">
                  <span *ngIf="eventForm.get('capaciteMax')?.errors?.['required']">⛔ La capacité maximale est obligatoire</span>
                  <span *ngIf="eventForm.get('capaciteMax')?.errors?.['min']">⛔ La capacité maximale doit être ≥ 1 personne</span>
                </div>
              </div>
              <div class="col-6">
                <label class="form-label">Statut *</label>
                <select class="form-select" formControlName="statut" [class.is-invalid]="eventForm.get('statut')?.invalid && eventForm.get('statut')?.touched">
                  <option value="A_VENIR">À Venir</option>
                  <option value="EN_COURS">En Cours</option>
                  <option value="TERMINE">Terminé</option>
                  <option value="ANNULE">Annulé</option>
                </select>
                <div class="text-danger small mt-1" *ngIf="eventForm.get('statut')?.invalid && eventForm.get('statut')?.touched">⛔ Le statut est obligatoire</div>
              </div>
            </div>

            <!-- ⭐ SECTIONS DYNAMIQUES POUR CONTENU RICHE (ÉVÉNEMENTS) ⭐ -->
            <div class="mt-3">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <h6 class="fw-bold">Sections de contenu</h6>
                <button type="button" class="btn btn-sm btn-outline-success" (click)="addSection()">
                  <i class="bi bi-plus-lg me-1"></i>Ajouter une section
                </button>
              </div>
              
              <div *ngFor="let section of sections; let i = index" class="card mb-3">
                <div class="card-header bg-light d-flex justify-content-between align-items-center">
                  <span>Section {{ i + 1 }}</span>
                  <button type="button" class="btn btn-sm btn-outline-danger" (click)="removeSection(i)" *ngIf="sections.length > 1">
                    <i class="bi bi-trash"></i> Supprimer
                  </button>
                </div>
                <div class="card-body">
                  <div class="mb-3">
                    <label class="form-label">Titre de la section</label>
                    <input type="text" class="form-control" [(ngModel)]="section.titre" [ngModelOptions]="{standalone: true}" placeholder="Ex: Programme de la journée">
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Texte / Paragraphe</label>
                    <textarea class="form-control" rows="4" [(ngModel)]="section.texte" [ngModelOptions]="{standalone: true}" placeholder="Description détaillée..."></textarea>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Image</label>
                    <input type="file" class="form-control" (change)="onFileSelected($event, i)" accept="image/*">
                    <div *ngIf="section.image" class="mt-2">
                      <img [src]="section.image" class="img-thumbnail" style="max-height: 100px;">
                      <button type="button" class="btn btn-sm btn-outline-danger ms-2" (click)="removeImage(i)">Supprimer</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Galerie d'images supplémentaire -->
            <div class="mb-3 mt-3">
              <label class="form-label fw-bold">Galerie d'images</label>
              <input type="file" class="form-control" (change)="onGalerieFilesSelected($event)" multiple accept="image/*">
              <div class="d-flex flex-wrap gap-2 mt-2">
                <div *ngFor="let img of galerieImages; let i = index" class="position-relative">
                  <img [src]="img" class="img-thumbnail" style="width: 80px; height: 80px; object-fit: cover;">
                  <button type="button" class="btn btn-sm btn-danger position-absolute top-0 end-0 rounded-circle p-0" style="width: 20px; height: 20px; font-size: 10px;" (click)="removeGalerieImage(i)">×</button>
                </div>
              </div>
              <small class="text-muted">Sélectionnez plusieurs images pour la galerie</small>
            </div>

            <div class="alert alert-danger mt-3" *ngIf="eventForm.invalid && eventForm.touched">
              <i class="bi bi-exclamation-triangle-fill me-2"></i>Veuillez corriger les erreurs ci-dessus avant d'enregistrer.
            </div>
          </form>
        </div>
        <div class="modal-footer-custom">
          <button class="btn btn-outline-secondary" (click)="closeModal()">Annuler</button>
          <button class="btn btn-mellita" (click)="saveEvent()" [disabled]="saving">
            <span *ngIf="!saving">Enregistrer</span>
            <span *ngIf="saving"><span class="spinner-border spinner-border-sm me-1"></span>...</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Membres Événement -->
    <div class="modal-overlay" *ngIf="showMembresModal" (click)="closeMembresModal()">
      <div class="modal-box" style="max-width: 640px;" (click)="$event.stopPropagation()">
        <div class="modal-header-custom">
          <h5 class="fw-bold mb-0">
            <i class="bi bi-people-fill me-2 text-primary"></i>
            Membres inscrits - {{ selectedEvent?.titre }}
          </h5>
          <button class="btn-close-custom" (click)="closeMembresModal()">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <div class="modal-body-custom">
          <div class="text-center py-5" *ngIf="loadingMembres">
            <div class="spinner-border text-success"></div>
            <p class="mt-2 text-muted">Chargement des membres...</p>
          </div>
          
          <div *ngIf="!loadingMembres">
            <div class="mb-3 text-end">
              <span class="badge bg-primary">{{ eventMembres.length }} membre(s) inscrit(s)</span>
            </div>
            
            <div class="table-responsive">
              <table class="table table-hover">
                <thead class="table-light">
                  <tr>
                    <th>Membre</th>
                    <th>Email</th>
                    <th>Présence</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let insc of eventMembres">
                    <td class="fw-semibold">{{ insc.membreNom }}</td>
                    <td>{{ insc.membreEmail }}</td>
                    <td>
                      <span class="badge" [class.bg-success]="insc.presence" [class.bg-secondary]="!insc.presence">
                        {{ insc.presence ? 'Présent' : 'Absent' }}
                      </span>
                    </td>
                  </tr>
                  <tr *ngIf="eventMembres.length === 0">
                    <td colspan="3" class="text-center text-muted py-4">
                      <i class="bi bi-people fs-2 d-block mb-2"></i>
                      Aucun membre inscrit à cet événement
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div class="modal-footer-custom">
          <button class="btn btn-secondary" (click)="closeMembresModal()">Fermer</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-topbar { background: white; padding: 20px 28px; border-bottom: 1px solid #f0f0f0; }
    .admin-content { margin-left: 260px; background: #f4f6f8; min-height: 100vh; }
    .btn-mellita { background: linear-gradient(135deg, #1a6b3c, #2d9e5f); color: white; border: none; border-radius: 10px; font-weight: 600; padding: 9px 22px; }
    .btn-mellita:hover { color: white; }
    .btn-mellita:disabled { opacity: 0.6; cursor: not-allowed; }
    .ev-card { background: white; border-radius: 16px; box-shadow: 0 2px 10px rgba(0,0,0,0.06); overflow: hidden; transition: all 0.3s; }
    .ev-card:hover { transform: translateY(-4px); box-shadow: 0 8px 25px rgba(0,0,0,0.1); }
    .ev-card-header { background: linear-gradient(135deg, #0f4024, #1a6b3c); padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; }
    .ev-statut { padding: 3px 10px; border-radius: 20px; font-size: 0.72rem; font-weight: 700; background: rgba(255,255,255,0.2); color: white; }
    .ev-actions { display: flex; gap: 6px; }
    .btn-icon-sm { width: 28px; height: 28px; border: none; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; cursor: pointer; }
    .btn-icon-sm.edit { background: rgba(255,255,255,0.2); color: white; }
    .btn-icon-sm.del { background: rgba(220,53,69,0.3); color: #ffaaaa; }
    .btn-icon-sm.members { background: rgba(13, 110, 253, 0.3); color: #0d6efd; }
    .btn-icon-sm.members:hover { background: #0d6efd; color: white; }
    .info-tag { background: #f0f4ff; color: #4361ee; padding: 3px 8px; border-radius: 6px; font-size: 0.72rem; }
    .info-tag.price { background: #fef9e7; color: #c8a84b; }
    .info-tag.capacity { background: #e8f5e9; color: #2e7d32; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 9000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); }
    .modal-box { background: white; border-radius: 20px; width: 100%; max-width: 760px; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
    .modal-header-custom { padding: 20px 24px; border-bottom: 1px solid #f0f0f0; display: flex; justify-content: space-between; align-items: center; }
    .modal-body-custom { padding: 24px; }
    .modal-footer-custom { padding: 16px 24px; border-top: 1px solid #f0f0f0; display: flex; justify-content: flex-end; gap: 10px; }
    .btn-close-custom { background: none; border: none; font-size: 1.1rem; color: #6c757d; cursor: pointer; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
    .text-danger { color: #dc3545; }
    .is-invalid { border-color: #dc3545; }
    .alert-danger { background-color: #f8d7da; border-color: #f5c6cb; color: #721c24; border-radius: 8px; padding: 10px; }
    .badge { font-size: 0.7rem; padding: 3px 8px; border-radius: 12px; }
    .bg-success { background-color: #28a745; color: white; }
    .bg-warning { background-color: #ffc107; color: #333; }
    .bg-danger { background-color: #dc3545; color: white; }
  `]
})
export class AdminEventsComponent implements OnInit {
  events: Evenement[] = [];
  loading = true;
  showModal = false;
  editMode = false;
  editingId: number | null = null;
  saving = false;
  eventForm!: FormGroup;

  showMembresModal = false;
  selectedEvent: any = null;
  eventMembres: any[] = [];
  loadingMembres = false;

  sections: Array<{ titre: string; texte: string; image: string | null }> = [];
  galerieImages: string[] = [];

  constructor(
    private eventService: EvenementService,
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void { this.buildForm(); this.loadEvents(); }

  isMembre(): boolean { return this.authService.isMembre(); }

  buildForm(ev?: Evenement): void {
    if (ev) {
      this.sections = [];
      for (let i = 1; i <= 10; i++) {
        const titre = ev[`section${i}Titre`];
        const texte = ev[`section${i}Texte`];
        const image = ev[`section${i}Image`];
        if (titre || texte || image) {
          this.sections.push({ titre: titre || '', texte: texte || '', image: image || null });
        }
      }
      if (ev.galerieImages) {
        try {
          this.galerieImages = JSON.parse(ev.galerieImages);
        } catch(e) {
          this.galerieImages = ev.galerieImages ? [ev.galerieImages] : [];
        }
      } else {
        this.galerieImages = [];
      }
    }
    
    if (this.sections.length === 0) {
      this.sections = [{ titre: '', texte: '', image: null }];
    }

    this.eventForm = this.fb.group({
      titre: [ev?.titre || '', [Validators.required, alphaNumWithAccentsValidator]],
      titreAr: [ev?.titreAr || ''], // ✅ Plus de validation, champ optionnel
      description: [ev?.description || ''],
      descriptionAr: [ev?.descriptionAr || ''],
      dateDebut: [ev?.dateDebut || '', Validators.required],
      dateFin: [ev?.dateFin || '', Validators.required],
      lieu: [ev?.lieu || '', [Validators.required, alphaNumWithAccentsValidator]],
      prix: [ev?.prix ?? 0, [Validators.required, Validators.min(0)]],
      capaciteMax: [ev?.capaciteMax || 50, [Validators.required, Validators.min(1)]],
      statut: [ev?.statut || 'A_VENIR', Validators.required],
      image: [ev?.image || ''],
      programme: [ev?.programme || ''],
      lieuDetaille: [ev?.lieuDetaille || ''],
      horaireDetaille: [ev?.horaireDetaille || '']
    }, { validators: dateRangeValidator });
  }

  addSection(): void {
    if (this.sections.length < 10) {
      this.sections.push({ titre: '', texte: '', image: null });
    }
  }

  removeSection(index: number): void {
    if (this.sections.length > 1) {
      this.sections.splice(index, 1);
    }
  }

  compressImage(file: File, maxWidth: number = 800, quality: number = 0.7): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event: any) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  }

  async onFileSelected(event: any, index: number): Promise<void> {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      try {
        const compressedImage = await this.compressImage(file, 800, 0.7);
        this.sections[index].image = compressedImage;
      } catch (error) {
        console.error('Erreur compression image:', error);
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.sections[index].image = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    }
  }

  removeImage(index: number): void {
    this.sections[index].image = null;
  }

  async onGalerieFilesSelected(event: any): Promise<void> {
    const files = event.target.files;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file && file.type.startsWith('image/')) {
        try {
          const compressedImage = await this.compressImage(file, 800, 0.7);
          this.galerieImages.push(compressedImage);
        } catch (error) {
          console.error('Erreur compression image galerie:', error);
          const reader = new FileReader();
          reader.onload = (e: any) => {
            this.galerieImages.push(e.target.result);
          };
          reader.readAsDataURL(file);
        }
      }
    }
  }

  removeGalerieImage(index: number): void {
    this.galerieImages.splice(index, 1);
  }

  loadEvents(): void {
    this.loading = true;
    if (this.isMembre()) {
      this.eventService.getMesEvenements().subscribe({
        next: ev => { this.events = ev; this.loading = false; },
        error: () => { this.events = []; this.loading = false; }
      });
    } else {
      this.eventService.getAll().subscribe({
        next: ev => { this.events = ev; this.loading = false; },
        error: () => this.loading = false
      });
    }
  }

  openModal(): void {
    if (this.isMembre()) return;
    this.editMode = false;
    this.editingId = null;
    this.sections = [{ titre: '', texte: '', image: null }];
    this.galerieImages = [];
    this.buildForm();
    this.showModal = true;
  }

  closeModal(): void { this.showModal = false; }

  editEvent(ev: Evenement): void {
    if (this.isMembre()) return;
    this.editMode = true;
    this.editingId = ev.id!;
    this.buildForm(ev);
    this.showModal = true;
  }

  saveEvent(): void {
    if (this.isMembre()) return;
    
    Object.keys(this.eventForm.controls).forEach(key => {
      const control = this.eventForm.get(key);
      control?.markAsTouched();
    });
    this.eventForm.markAllAsTouched();
    
    if (this.eventForm.invalid) { 
      alert('Veuillez corriger les erreurs dans le formulaire');
      return; 
    }
    
    this.saving = true;
    const formValue = { ...this.eventForm.value };
    
    for (let i = 0; i < this.sections.length; i++) {
      const section = this.sections[i];
      formValue[`section${i + 1}Titre`] = section.titre;
      formValue[`section${i + 1}Texte`] = section.texte;
      formValue[`section${i + 1}Image`] = section.image;
    }
    
    formValue.galerieImages = JSON.stringify(this.galerieImages);
    
    const obs = this.editMode
      ? this.eventService.update(this.editingId!, formValue)
      : this.eventService.create(formValue);
      
    obs.subscribe({
      next: (response: any) => { 
        this.loadEvents(); 
        this.closeModal(); 
        this.saving = false; 
        alert('Événement enregistré avec succès');
        
        const id = this.editMode ? this.editingId : response?.id;
        if (id) {
          this.router.navigate(['/events', id]);
        }
      },
      error: (err) => { 
        console.error(err); 
        alert('Erreur lors de l\'enregistrement: ' + (err.error?.message || err.message));
        this.saving = false; 
      }
    });
  }

  deleteEvent(id: number): void {
    if (this.isMembre()) return;
    if (!confirm('⚠️ Êtes-vous sûr de vouloir supprimer cet événement ?')) return;
    this.eventService.delete(id).subscribe(() => this.loadEvents());
  }

  voirMembres(event: any): void {
    this.selectedEvent = event;
    this.loadingMembres = true;
    this.showMembresModal = true;
    
    this.eventService.getInscriptions(event.id).subscribe({
      next: (inscriptions: any[]) => {
        this.eventMembres = inscriptions.map(insc => ({
          id: insc.id,
          membreNom: insc.membreNom,
          membreEmail: insc.membreEmail,
          presence: insc.presence || false
        }));
        this.loadingMembres = false;
      },
      error: (err) => {
        console.error('Erreur chargement membres:', err);
        this.loadingMembres = false;
        this.eventMembres = [];
      }
    });
  }

  closeMembresModal(): void {
    this.showMembresModal = false;
    this.selectedEvent = null;
    this.eventMembres = [];
    this.loadingMembres = false;
  }
}

// ============ ADMIN FORMATIONS COMPLET ============
@Component({
  selector: 'app-admin-formations',
  template: `
    <div class="d-flex">
      <app-sidebar></app-sidebar>
      <div class="admin-content flex-grow-1">
        <div class="admin-topbar d-flex justify-content-between align-items-center">
          <div>
            <h4 class="mb-0 fw-bold">
              <i class="bi bi-mortarboard-fill me-2 text-purple"></i>
              {{ isMembre() ? 'Mes Formations' : (isFormateur() ? 'Mes Formations' : 'Gestion des Formations') }}
            </h4>
            <small class="text-muted">{{ formations.length }} formation(s)</small>
          </div>
          <button class="btn btn-mellita" (click)="openModal()" *ngIf="isAdminOrAdministratif()">
            <i class="bi bi-plus-lg me-2"></i>Ajouter
          </button>
        </div>

        <div class="p-4">
          <div class="row g-4" *ngIf="!loading">
            <div class="col-md-6 col-lg-4" *ngFor="let f of formations">
              <div class="form-card">
                <div class="form-card-top">
                  <span class="form-statut">{{ f.statut }}</span>
                  <div class="d-flex gap-1" *ngIf="isAdminOrAdministratif()">
                    <button class="btn-icon-sm members" (click)="voirMembres(f)" title="Voir les membres inscrits">
                      <i class="bi bi-people-fill"></i>
                    </button>
                    <button class="btn-icon-sm edit" (click)="editFormation(f)">
                      <i class="bi bi-pencil-fill"></i>
                    </button>
                    <button class="btn-icon-sm del" (click)="deleteFormation(f.id!)">
                      <i class="bi bi-trash-fill"></i>
                    </button>
                  </div>
                  <div class="d-flex gap-1" *ngIf="isMembre() || isFormateur()">
                    <span class="badge" [ngClass]="f.presence ? 'bg-success' : 'bg-warning'" style="font-size: 0.7rem;">
                      {{ f.presence ? 'Présent' : 'Absent' }}
                    </span>
                    <span class="badge" [ngClass]="f.statutPaiement === 'PAYE' ? 'bg-success' : 'bg-danger'" style="font-size: 0.7rem;">
                      {{ f.statutPaiement === 'PAYE' ? 'Payé' : 'En attente' }}
                    </span>
                  </div>
                </div>
                <div class="p-3">
                  <h6 class="fw-bold mb-1">{{ f.titre }}</h6>
                  <p class="text-muted small mb-2">{{ f.description | slice:0:80 }}...</p>
                  <div class="d-flex flex-wrap gap-2">
                    <span class="info-tag" *ngIf="f.formateur">
                      <i class="bi bi-person me-1"></i>{{ f.formateur }}
                    </span>
                    <span class="info-tag" *ngIf="f.dateDebut">
                      <i class="bi bi-calendar me-1"></i>{{ f.dateDebut | date:'dd/MM/yyyy' }}
                    </span>
                    <span class="info-tag price">
                      {{ f.prix === 0 ? 'Gratuit' : (f.prix + ' TND') }}
                    </span>
                    <span class="info-tag" *ngIf="f.dureeHeures">
                      <i class="bi bi-clock me-1"></i>{{ f.dureeHeures }}h
                    </span>
                    <span class="info-tag capacity"><i class="bi bi-people me-1"></i>{{ f.capaciteMax }} places</span>
                  </div>
                  <div class="mt-2 small text-muted" *ngIf="(isMembre() || isFormateur()) && f.montantPaye !== undefined">
                    <i class="bi bi-credit-card me-1"></i>Payé: {{ f.montantPaye }} TND
                  </div>
                </div>
              </div>
            </div>
            <div class="col-12 text-center text-muted py-5" *ngIf="formations.length === 0">
              <i class="bi bi-mortarboard fs-1 mb-3 d-block"></i>
              {{ isMembre() ? 'Vous n\'êtes inscrit à aucune formation' : (isFormateur() ? 'Aucune formation assignée' : 'Aucune formation') }}
            </div>
          </div>
          <div class="text-center py-5" *ngIf="loading">
            <div class="spinner-border text-success"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Ajout/Modification Formation -->
    <div class="modal-overlay" *ngIf="showModal && isAdminOrAdministratif()" (click)="closeModal()">
      <div class="modal-box" (click)="$event.stopPropagation()">
        <div class="modal-header-custom">
          <h5 class="fw-bold mb-0">{{ editMode ? 'Modifier' : 'Ajouter' }} une Formation</h5>
          <button class="btn-close-custom" (click)="closeModal()">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <div class="modal-body-custom">
          <form [formGroup]="formationForm">
            <div class="mb-3">
              <label class="form-label">Titre (FR) *</label>
              <input type="text" class="form-control" formControlName="titre" [class.is-invalid]="formationForm.get('titre')?.invalid && formationForm.get('titre')?.touched">
              <div class="text-danger small mt-1" *ngIf="formationForm.get('titre')?.invalid && formationForm.get('titre')?.touched">
                <span *ngIf="formationForm.get('titre')?.errors?.['required']">⛔ Le titre est obligatoire</span>
                <span *ngIf="formationForm.get('titre')?.errors?.['notAlphabetic']">⛔ Le titre doit contenir uniquement des lettres, espaces, apostrophes et tirets</span>
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label">Titre (AR)</label>
              <input type="text" class="form-control" formControlName="titreAr" dir="rtl">
            </div>
            <div class="mb-3">
              <label class="form-label">Description</label>
              <textarea class="form-control" formControlName="description" rows="3"></textarea>
            </div>
            <div class="row g-3">
              <div class="col-12">
                <label class="form-label">Formateur *</label>
                <select class="form-select" formControlName="formateurId" [class.is-invalid]="formationForm.get('formateurId')?.invalid && formationForm.get('formateurId')?.touched">
                  <option value="">— Sélectionnez un formateur —</option>
                  <option *ngFor="let fmt of formateurs" [value]="fmt.id">{{ fmt.prenom }} {{ fmt.nom }}</option>
                </select>
                <div class="text-danger small mt-1" *ngIf="formationForm.get('formateurId')?.invalid && formationForm.get('formateurId')?.touched">⛔ Le formateur est obligatoire</div>
                <small class="text-muted" *ngIf="formateurs.length === 0 && !loadingFormateurs"><i class="bi bi-info-circle me-1"></i>Aucun formateur disponible</small>
              </div>
              <div class="col-6">
                <label class="form-label">Durée (heures) *</label>
                <input type="number" class="form-control" formControlName="dureeHeures" min="1" [class.is-invalid]="formationForm.get('dureeHeures')?.invalid && formationForm.get('dureeHeures')?.touched">
                <div class="text-danger small mt-1" *ngIf="formationForm.get('dureeHeures')?.invalid && formationForm.get('dureeHeures')?.touched">
                  <span *ngIf="formationForm.get('dureeHeures')?.errors?.['required']">⛔ La durée est obligatoire</span>
                  <span *ngIf="formationForm.get('dureeHeures')?.errors?.['min']">⛔ La durée doit être ≥ 1 heure</span>
                </div>
              </div>
              <div class="col-6">
                <label class="form-label">Date Début *</label>
                <input type="date" class="form-control" formControlName="dateDebut" [class.is-invalid]="formationForm.get('dateDebut')?.invalid && formationForm.get('dateDebut')?.touched">
                <div class="text-danger small mt-1" *ngIf="formationForm.get('dateDebut')?.invalid && formationForm.get('dateDebut')?.touched">⛔ La date de début est obligatoire</div>
              </div>
              <div class="col-6">
                <label class="form-label">Date Fin *</label>
                <input type="date" class="form-control" formControlName="dateFin" [class.is-invalid]="formationForm.get('dateFin')?.invalid && formationForm.get('dateFin')?.touched">
                <div class="text-danger small mt-1" *ngIf="formationForm.get('dateFin')?.invalid && formationForm.get('dateFin')?.touched">
                  <span *ngIf="formationForm.get('dateFin')?.errors?.['required']">⛔ La date de fin est obligatoire</span>
                  <span *ngIf="formationForm.get('dateFin')?.errors?.['dateFinInvalid']">⛔ La date de fin doit être après la date de début</span>
                </div>
              </div>
              <div class="col-6">
                <label class="form-label">Lieu *</label>
                <input type="text" class="form-control" formControlName="lieu" [class.is-invalid]="formationForm.get('lieu')?.invalid && formationForm.get('lieu')?.touched">
                <div class="text-danger small mt-1" *ngIf="formationForm.get('lieu')?.invalid && formationForm.get('lieu')?.touched">
                  <span *ngIf="formationForm.get('lieu')?.errors?.['required']">⛔ Le lieu est obligatoire</span>
                  <span *ngIf="formationForm.get('lieu')?.errors?.['notAlphabetic']">⛔ Le lieu doit contenir uniquement des lettres, espaces, apostrophes et tirets</span>
                </div>
              </div>
              <div class="col-6">
                <label class="form-label">Prix (TND) *</label>
                <input type="number" class="form-control" formControlName="prix" min="0" step="0.01" [class.is-invalid]="formationForm.get('prix')?.invalid && formationForm.get('prix')?.touched">
                <div class="text-danger small mt-1" *ngIf="formationForm.get('prix')?.invalid && formationForm.get('prix')?.touched">
                  <span *ngIf="formationForm.get('prix')?.errors?.['required']">⛔ Le prix est obligatoire</span>
                  <span *ngIf="formationForm.get('prix')?.errors?.['min']">⛔ Le prix doit être ≥ 0 TND</span>
                </div>
              </div>
              <div class="col-6">
                <label class="form-label">Capacité Max *</label>
                <input type="number" class="form-control" formControlName="capaciteMax" min="1" [class.is-invalid]="formationForm.get('capaciteMax')?.invalid && formationForm.get('capaciteMax')?.touched">
                <div class="text-danger small mt-1" *ngIf="formationForm.get('capaciteMax')?.invalid && formationForm.get('capaciteMax')?.touched">
                  <span *ngIf="formationForm.get('capaciteMax')?.errors?.['required']">⛔ La capacité maximale est obligatoire</span>
                  <span *ngIf="formationForm.get('capaciteMax')?.errors?.['min']">⛔ La capacité maximale doit être ≥ 1 personne</span>
                </div>
              </div>
              <div class="col-6">
                <label class="form-label">Statut *</label>
                <select class="form-select" formControlName="statut" [class.is-invalid]="formationForm.get('statut')?.invalid && formationForm.get('statut')?.touched">
                  <option value="">— Sélectionnez un statut —</option>
                  <option value="PLANIFIEE">Planifiée</option>
                  <option value="EN_COURS">En Cours</option>
                  <option value="TERMINEE">Terminée</option>
                  <option value="ANNULEE">Annulée</option>
                </select>
                <div class="text-danger small mt-1" *ngIf="formationForm.get('statut')?.invalid && formationForm.get('statut')?.touched">⛔ Le statut est obligatoire</div>
              </div>
            </div>

            <!-- ⭐ SECTIONS DYNAMIQUES POUR FORMATIONS ⭐ -->
            <div class="mt-3">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <h6 class="fw-bold">Sections de contenu</h6>
                <button type="button" class="btn btn-sm btn-outline-success" (click)="addFormationSection()">
                  <i class="bi bi-plus-lg me-1"></i>Ajouter une section
                </button>
              </div>
              
              <div *ngFor="let section of formationSections; let i = index" class="card mb-3">
                <div class="card-header bg-light d-flex justify-content-between align-items-center">
                  <span>{{ i === 0 ? 'Objectifs pédagogiques' : i === 1 ? 'Programme détaillé' : i === 2 ? 'Prérequis' : 'Section ' + (i+1) }}</span>
                  <button type="button" class="btn btn-sm btn-outline-danger" (click)="removeFormationSection(i)" *ngIf="formationSections.length > 1">
                    <i class="bi bi-trash"></i> Supprimer
                  </button>
                </div>
                <div class="card-body">
                  <div class="mb-3">
                    <label class="form-label">Titre</label>
                    <input type="text" class="form-control" [(ngModel)]="section.titre" [ngModelOptions]="{standalone: true}" placeholder="Titre de la section">
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Texte / Paragraphe</label>
                    <textarea class="form-control" rows="4" [(ngModel)]="section.texte" [ngModelOptions]="{standalone: true}" placeholder="Description..."></textarea>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Image</label>
                    <input type="file" class="form-control" (change)="onFormationFileSelected($event, i)" accept="image/*">
                    <div *ngIf="section.image" class="mt-2">
                      <img [src]="section.image" class="img-thumbnail" style="max-height: 100px;">
                      <button type="button" class="btn btn-sm btn-outline-danger ms-2" (click)="removeFormationImage(i)">Supprimer</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Galerie d'images pour formations -->
            <div class="mb-3 mt-3">
              <label class="form-label fw-bold">Galerie d'images</label>
              <input type="file" class="form-control" (change)="onFormationGalerieSelected($event)" multiple accept="image/*">
              <div class="d-flex flex-wrap gap-2 mt-2">
                <div *ngFor="let img of formationGalerieImages; let i = index" class="position-relative">
                  <img [src]="img" class="img-thumbnail" style="width: 80px; height: 80px; object-fit: cover;">
                  <button type="button" class="btn btn-sm btn-danger position-absolute top-0 end-0 rounded-circle p-0" style="width: 20px; height: 20px; font-size: 10px;" (click)="removeFormationGalerieImage(i)">×</button>
                </div>
              </div>
              <small class="text-muted">Sélectionnez plusieurs images pour la galerie</small>
            </div>

            <div class="alert alert-danger mt-3" *ngIf="formationForm.invalid && formationForm.touched">
              <i class="bi bi-exclamation-triangle-fill me-2"></i>Veuillez corriger toutes les erreurs ci-dessus avant d'enregistrer.
            </div>
          </form>
        </div>
        <div class="modal-footer-custom">
          <button class="btn btn-outline-secondary" (click)="closeModal()">Annuler</button>
          <button class="btn btn-mellita" (click)="saveFormation()" [disabled]="saving">
            <span *ngIf="!saving">Enregistrer</span>
            <span *ngIf="saving"><span class="spinner-border spinner-border-sm me-1"></span>...</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Membres Formation -->
    <div class="modal-overlay" *ngIf="showMembresModal" (click)="closeMembresModal()">
      <div class="modal-box" style="max-width: 640px;" (click)="$event.stopPropagation()">
        <div class="modal-header-custom">
          <h5 class="fw-bold mb-0">
            <i class="bi bi-people-fill me-2 text-purple"></i>
            Membres inscrits - {{ selectedFormation?.titre }}
          </h5>
          <button class="btn-close-custom" (click)="closeMembresModal()">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <div class="modal-body-custom">
          <div class="text-center py-5" *ngIf="loadingMembres">
            <div class="spinner-border text-success"></div>
            <p class="mt-2 text-muted">Chargement des membres...</p>
          </div>
          
          <div *ngIf="!loadingMembres">
            <div class="mb-3 text-end">
              <span class="badge bg-purple">{{ formationMembres.length }} membre(s) inscrit(s)</span>
            </div>
            
            <div class="table-responsive">
              <table class="table table-hover">
                <thead class="table-light">
                  <tr>
                    <th>Membre</th>
                    <th>Email</th>
                    <th>Présence</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let insc of formationMembres">
                    <td class="fw-semibold">{{ insc.membreNom }}</td>
                    <td>{{ insc.membreEmail || '—' }}</td>
                    <td>
                      <span class="badge" [class.bg-success]="insc.presence" [class.bg-secondary]="!insc.presence">
                        {{ insc.presence ? 'Présent' : 'Absent' }}
                      </span>
                    </td>
                  </tr>
                  <tr *ngIf="formationMembres.length === 0">
                    <td colspan="3" class="text-center text-muted py-4">
                      <i class="bi bi-people fs-2 d-block mb-2"></i>
                      Aucun membre inscrit à cette formation
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div class="modal-footer-custom">
          <button class="btn btn-secondary" (click)="closeMembresModal()">Fermer</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-topbar { background: white; padding: 20px 28px; border-bottom: 1px solid #f0f0f0; }
    .admin-content { margin-left: 260px; background: #f4f6f8; min-height: 100vh; }
    .btn-mellita { background: linear-gradient(135deg, #1a6b3c, #2d9e5f); color: white; border: none; border-radius: 10px; font-weight: 600; padding: 9px 22px; }
    .btn-mellita:hover { color: white; }
    .btn-mellita:disabled { opacity: 0.6; cursor: not-allowed; }
    .form-card { background: white; border-radius: 16px; box-shadow: 0 2px 10px rgba(0,0,0,0.06); overflow: hidden; transition: all 0.3s; }
    .form-card:hover { transform: translateY(-4px); box-shadow: 0 8px 25px rgba(0,0,0,0.1); }
    .form-card-top { background: linear-gradient(135deg, #4a148c, #6f42c1); padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; }
    .form-statut { padding: 3px 10px; border-radius: 20px; background: rgba(255,255,255,0.2); color: white; font-size: 0.72rem; font-weight: 700; }
    .btn-icon-sm { width: 28px; height: 28px; border: none; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; cursor: pointer; }
    .btn-icon-sm.edit { background: rgba(255,255,255,0.2); color: white; }
    .btn-icon-sm.del { background: rgba(220,53,69,0.3); color: #ffaaaa; }
    .btn-icon-sm.members { background: rgba(13, 110, 253, 0.3); color: #0d6efd; }
    .btn-icon-sm.members:hover { background: #0d6efd; color: white; }
    .info-tag { background: #f0f4ff; color: #4361ee; padding: 3px 8px; border-radius: 6px; font-size: 0.72rem; }
    .info-tag.price { background: #fef9e7; color: #c8a84b; }
    .info-tag.capacity { background: #e8f5e9; color: #2e7d32; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 9000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); }
    .modal-box { background: white; border-radius: 20px; width: 100%; max-width: 760px; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
    .modal-header-custom { padding: 20px 24px; border-bottom: 1px solid #f0f0f0; display: flex; justify-content: space-between; align-items: center; }
    .modal-body-custom { padding: 24px; }
    .modal-footer-custom { padding: 16px 24px; border-top: 1px solid #f0f0f0; display: flex; justify-content: flex-end; gap: 10px; }
    .btn-close-custom { background: none; border: none; font-size: 1.1rem; color: #6c757d; cursor: pointer; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
    .text-danger { color: #dc3545; }
    .is-invalid { border-color: #dc3545; }
    .alert-danger { background-color: #f8d7da; border-color: #f5c6cb; color: #721c24; border-radius: 8px; padding: 10px; }
    .badge { font-size: 0.7rem; padding: 3px 8px; border-radius: 12px; }
    .bg-success { background-color: #28a745; color: white; }
    .bg-warning { background-color: #ffc107; color: #333; }
    .bg-danger { background-color: #dc3545; color: white; }
    .bg-purple { background: #6f42c1; }
  `]
})
export class AdminFormationsComponent implements OnInit {
  formations: Formation[] = [];
  formateurs: any[] = [];
  loadingFormateurs = false;
  loading = false;
  showModal = false;
  editMode = false;
  editingId: number | null = null;
  saving = false;
  formationForm!: FormGroup;

  showMembresModal = false;
  selectedFormation: any = null;
  formationMembres: any[] = [];
  loadingMembres = false;

  formationSections: Array<{ titre: string; texte: string; image: string | null }> = [];
  formationGalerieImages: string[] = [];

  constructor(
    private formationService: FormationService,
    private userService: UserService,
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadFormations();
    if (this.isAdminOrAdministratif()) {
      this.loadFormateurs();
    }
  }

  isMembre(): boolean { return this.authService.isMembre(); }
  isFormateur(): boolean { return this.authService.isFormateur(); }
  isAdminOrAdministratif(): boolean { return this.authService.isAdmin() || this.authService.isAdministratif(); }

  loadFormateurs(): void {
    this.loadingFormateurs = true;
    this.userService.getAll().subscribe({
      next: users => {
        this.formateurs = users.filter((u: any) => u.role === 'FORMATEUR');
        this.loadingFormateurs = false;
      },
      error: () => this.loadingFormateurs = false
    });
  }

  buildForm(f?: Formation): void {
    if (f) {
      this.formationSections = [];
      for (let i = 1; i <= 10; i++) {
        const titre = f[`section${i}Titre`];
        const texte = f[`section${i}Texte`];
        const image = f[`section${i}Image`];
        if (titre || texte || image) {
          this.formationSections.push({ titre: titre || '', texte: texte || '', image: image || null });
        }
      }
      if (f.galerieImages) {
        try {
          this.formationGalerieImages = JSON.parse(f.galerieImages);
        } catch(e) {
          this.formationGalerieImages = f.galerieImages ? [f.galerieImages] : [];
        }
      } else {
        this.formationGalerieImages = [];
      }
    }
    
    if (this.formationSections.length === 0) {
      this.formationSections = [
        { titre: '', texte: '', image: null },
        { titre: '', texte: '', image: null },
        { titre: '', texte: '', image: null }
      ];
    }

    this.formationForm = this.fb.group({
      titre: [f?.titre || '', [Validators.required, alphaNumWithAccentsValidator]],
      titreAr: [f?.titreAr || ''], // ✅ Plus de validation, champ optionnel
      description: [f?.description || ''],
      descriptionAr: [f?.descriptionAr || ''],
      formateurId: [f?.formateurId || '', Validators.required],
      dateDebut: [f?.dateDebut || '', Validators.required],
      dateFin: [f?.dateFin || '', Validators.required],
      dureeHeures: [f?.dureeHeures || 0, [Validators.required, Validators.min(1)]],
      lieu: [f?.lieu || '', [Validators.required, alphaNumWithAccentsValidator]],
      prix: [f?.prix ?? 0, [Validators.required, Validators.min(0)]],
      capaciteMax: [f?.capaciteMax || 20, [Validators.required, Validators.min(1)]],
      statut: [f?.statut || '', Validators.required],
      image: [f?.image || '']
    }, { validators: dateRangeValidator });
  }

  addFormationSection(): void {
    if (this.formationSections.length < 10) {
      this.formationSections.push({ titre: '', texte: '', image: null });
    }
  }

  removeFormationSection(index: number): void {
    if (this.formationSections.length > 1) {
      this.formationSections.splice(index, 1);
    }
  }

  compressImage(file: File, maxWidth: number = 800, quality: number = 0.7): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event: any) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  }

  async onFormationFileSelected(event: any, index: number): Promise<void> {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      try {
        const compressedImage = await this.compressImage(file, 800, 0.7);
        this.formationSections[index].image = compressedImage;
      } catch (error) {
        console.error('Erreur compression image formation:', error);
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.formationSections[index].image = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    }
  }

  removeFormationImage(index: number): void {
    this.formationSections[index].image = null;
  }

  async onFormationGalerieSelected(event: any): Promise<void> {
    const files = event.target.files;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file && file.type.startsWith('image/')) {
        try {
          const compressedImage = await this.compressImage(file, 800, 0.7);
          this.formationGalerieImages.push(compressedImage);
        } catch (error) {
          console.error('Erreur compression image galerie formation:', error);
          const reader = new FileReader();
          reader.onload = (e: any) => {
            this.formationGalerieImages.push(e.target.result);
          };
          reader.readAsDataURL(file);
        }
      }
    }
  }

  removeFormationGalerieImage(index: number): void {
    this.formationGalerieImages.splice(index, 1);
  }

  loadFormations(): void {
    this.loading = true;

    if (this.isMembre()) {
      this.formationService.getMesFormations().subscribe({
        next: f => {
          this.formations = f;
          this.loading = false;
        },
        error: (err) => {
          console.error('❌ Erreur chargement formations membre:', err);
          this.formations = [];
          this.loading = false;
        }
      });
    } else if (this.isFormateur()) {
      this.formationService.getAll().subscribe({
        next: f => {
          const currentUserId = this.authService.getCurrentUser()?.id;
          this.formations = f.filter(formation => formation.formateurId === currentUserId);
          this.loading = false;
        },
        error: (err) => {
          console.error('❌ Erreur chargement formations formateur:', err);
          this.formations = [];
          this.loading = false;
        }
      });
    } else {
      this.formationService.getAll().subscribe({
        next: f => {
          this.formations = f;
          this.loading = false;
        },
        error: (err) => {
          console.error('❌ Erreur chargement toutes formations:', err);
          this.formations = [];
          this.loading = false;
        }
      });
    }
  }

  openModal(): void {
    if (!this.isAdminOrAdministratif()) return;
    this.editMode = false;
    this.editingId = null;
    this.formationSections = [
      { titre: '', texte: '', image: null },
      { titre: '', texte: '', image: null },
      { titre: '', texte: '', image: null }
    ];
    this.formationGalerieImages = [];
    this.buildForm();
    this.showModal = true;
  }

  closeModal(): void { this.showModal = false; }

  editFormation(f: Formation): void {
    if (!this.isAdminOrAdministratif()) return;
    this.editMode = true;
    this.editingId = f.id!;
    this.buildForm(f);
    this.showModal = true;
  }

  saveFormation(): void {
    if (!this.isAdminOrAdministratif()) return;

    Object.keys(this.formationForm.controls).forEach(key => {
      const control = this.formationForm.get(key);
      control?.markAsTouched();
    });
    this.formationForm.markAllAsTouched();

    if (this.formationForm.invalid) {
      alert('❌ Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    this.saving = true;
    const formValue = { ...this.formationForm.value };
    if (formValue.formateurId) {
      formValue.formateurId = +formValue.formateurId;
    }

    for (let i = 0; i < this.formationSections.length; i++) {
      const section = this.formationSections[i];
      formValue[`section${i + 1}Titre`] = section.titre;
      formValue[`section${i + 1}Texte`] = section.texte;
      formValue[`section${i + 1}Image`] = section.image;
    }

    formValue.galerieImages = JSON.stringify(this.formationGalerieImages);

    const obs = this.editMode
      ? this.formationService.update(this.editingId!, formValue)
      : this.formationService.create(formValue);

    obs.subscribe({
      next: (response: any) => {
        this.loadFormations();
        this.closeModal();
        this.saving = false;
        alert('Formation enregistrée avec succès');
        
        const id = this.editMode ? this.editingId : response?.id;
        if (id) {
          this.router.navigate(['/formations', id]);
        }
      },
      error: (err) => {
        console.error('❌ Erreur lors de l\'enregistrement:', err);
        alert('Erreur lors de l\'enregistrement: ' + (err.error?.message || err.message));
        this.saving = false;
      }
    });
  }

  deleteFormation(id: number): void {
    if (!this.isAdminOrAdministratif()) return;
    if (!confirm('Supprimer cette formation ?')) return;
    this.formationService.delete(id).subscribe(() => this.loadFormations());
  }

  voirMembres(formation: any): void {
    this.selectedFormation = formation;
    this.loadingMembres = true;
    this.showMembresModal = true;
    
    this.formationService.getInscriptions(formation.id).subscribe({
      next: (inscriptions: any[]) => {
        this.formationMembres = inscriptions.map(insc => {
          let membreNom = '';
          let membreEmail = '';
          let presence = false;
          
          if (insc.membre) {
            membreNom = `${insc.membre.prenom || ''} ${insc.membre.nom || ''}`.trim();
            membreEmail = insc.membre.email || '';
            presence = insc.presence === true || insc.presence === 1;
          } else if (insc.membreNom) {
            membreNom = insc.membreNom;
            membreEmail = insc.membreEmail || '';
            presence = insc.presence === true || insc.presence === 1;
          } else if (insc.nom || insc.prenom) {
            membreNom = `${insc.prenom || ''} ${insc.nom || ''}`.trim();
            membreEmail = insc.email || '';
            presence = insc.presence === true || insc.presence === 1;
          } else {
            membreNom = 'Membre';
            membreEmail = '';
            presence = false;
          }
          
          if (!membreNom || membreNom.trim() === '') {
            membreNom = 'Membre';
          }
          
          return {
            id: insc.id,
            membreNom: membreNom,
            membreEmail: membreEmail || '—',
            presence: presence
          };
        });
        
        this.loadingMembres = false;
      },
      error: (err) => {
        console.error('❌ Erreur chargement membres:', err);
        this.loadingMembres = false;
        this.formationMembres = [];
        alert('Erreur lors du chargement des membres');
      }
    });
  }

  closeMembresModal(): void {
    this.showMembresModal = false;
    this.selectedFormation = null;
    this.formationMembres = [];
    this.loadingMembres = false;
  }
}

// ============ ADMIN DOCUMENTS ============
@Component({
  selector: 'app-admin-documents',
  template: `
    <div class="d-flex">
      <app-sidebar></app-sidebar>
      <div class="admin-content flex-grow-1">
        <div class="admin-topbar d-flex justify-content-between align-items-center">
          <div>
            <h4 class="mb-0 fw-bold"><i class="bi bi-folder-fill me-2 text-warning"></i>Gestion des Documents</h4>
            <small class="text-muted">Bibliothèque de documents de l'association</small>
          </div>
        </div>
        <div class="p-5 text-center">
          <i class="bi bi-folder2-open" style="font-size:4rem;color:#dee2e6;"></i>
          <h5 class="mt-3 text-muted">Module GED disponible dans le menu Documents</h5>
          <p class="text-muted small">Utilisez la Gestion Électronique des Documents (GED) pour gérer tous les fichiers de l'association.</p>
          <a routerLink="/admin/ged" class="btn btn-warning mt-2">
            <i class="bi bi-folder-symlink me-2"></i>Accéder à la GED
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-topbar { background: white; padding: 20px 28px; border-bottom: 1px solid #f0f0f0; }
    .admin-content { margin-left: 260px; background: #f4f6f8; min-height: 100vh; }
  `]
})
export class AdminDocumentsComponent implements OnInit {
  documents: any[] = [];
  constructor() {}
  ngOnInit(): void {}
}