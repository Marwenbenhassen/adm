import { Component, OnInit } from '@angular/core';
import { ClubService } from '../core/services/api.services';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-animateur-clubs',
  template: `
    <div class="d-flex">
      <app-sidebar></app-sidebar>

      <div class="ac-content flex-grow-1">

        <div class="ac-topbar d-flex justify-content-between align-items-center">
          <div>
            <h4 class="mb-0 fw-bold">
              <i class="bi bi-trophy-fill me-2" style="color:#e83e8c"></i>Mes Clubs
            </h4>
            <small class="text-muted">{{ clubs.length }} club(s) assigné(s)</small>
          </div>
          <div class="d-flex gap-2">
            <button class="btn btn-sm btn-outline-secondary" (click)="vueSemaine = true" [class.active]="vueSemaine">
              <i class="bi bi-calendar-week me-1"></i>Semaine
            </button>
            <button class="btn btn-sm btn-outline-secondary" (click)="vueSemaine = false" [class.active]="!vueSemaine">
              <i class="bi bi-calendar-day me-1"></i>Jour unique
            </button>
          </div>
        </div>

        <!-- Toast de notification -->
        <div class="toast-notification" [class.show]="showToast" [class.error]="toastType === 'error'">
          <div class="toast-content">
            <i class="bi" [class.bi-check-circle-fill]="toastType === 'success'"
                         [class.bi-exclamation-triangle-fill]="toastType === 'error'"></i>
            <span>{{ toastMessage }}</span>
          </div>
        </div>

        <div class="p-4">
          <div class="text-center py-5" *ngIf="loading">
            <div class="spinner-border" style="color:#e83e8c"></div>
          </div>

          <div class="row g-4" *ngIf="!loading">
            <div class="col-md-6 col-lg-4" *ngFor="let club of clubs">
              <div class="ac-club-card">
                <div class="ac-card-header">
                  <div class="ac-card-icon"><i class="bi bi-trophy-fill"></i></div>
                  <div class="ac-card-title">
                    <h6 class="fw-bold text-white mb-0">{{ club.nom }}</h6>
                    <small style="color:rgba(255,255,255,.6)">{{ club.horaire }}</small>
                  </div>
                  <span class="ac-statut">{{ club.statut }}</span>
                </div>
                <div class="ac-card-body">
                  <p class="text-muted small mb-3">{{ club.description | slice:0:90 }}...</p>
                  <div class="ac-meta">
                    <div class="meta-item" *ngIf="club.lieu">
                      <i class="bi bi-geo-alt-fill" style="color:#28a745"></i>{{ club.lieu }}
                    </div>
                    <div class="meta-item">
                      <i class="bi bi-tag-fill" style="color:#ffc107"></i>{{ club.tarifSeance }} TND/séance
                    </div>
                  </div>
                </div>
                <div class="ac-card-footer">
                  <button class="btn btn-sm btn-outline-success" (click)="voirMembres(club)">
                    <i class="bi bi-people me-1"></i>Membres
                  </button>
                  <button class="btn btn-sm btn-outline-primary" (click)="ouvrirPresence(club)">
                    <i class="bi bi-clipboard-check me-1"></i>Présence
                  </button>
                </div>
              </div>
            </div>

            <div class="col-12 text-center text-muted py-5" *ngIf="clubs.length === 0">
              <i class="bi bi-trophy fs-1 mb-3 d-block" style="color:#e83e8c"></i>
              Aucun club ne vous est assigné pour le moment.
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL MEMBRES -->
    <div class="modal-overlay" *ngIf="showMembresModal" (click)="showMembresModal=false">
      <div class="modal-box-lg" (click)="$event.stopPropagation()">
        <div class="modal-hdr">
          <h5 class="fw-bold mb-0">
            <i class="bi bi-people-fill me-2" style="color:#e83e8c"></i>
            Membres — {{ selectedClub?.nom }}
          </h5>
          <button class="close-btn" (click)="showMembresModal=false">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <div class="modal-bdy">
          <div class="stats-bar mb-3" *ngIf="membresClub.length > 0">
            <span class="stat-chip">Total : {{ membresClub.length }}</span>
          </div>
          <div class="table-responsive">
            <table class="table table-sm table-hover mb-0">
              <thead style="background:#fce4ec">
                <tr><th>Membre</th><th>Email</th><th>Téléphone</th></tr>
              </thead>
              <tbody>
                <tr *ngFor="let insc of membresClub">
                  <td class="fw-semibold">{{ insc.membre?.prenom || insc.membrePrenom || insc.prenom }} {{ insc.membre?.nom || insc.membreNom || insc.nom }}</td>
                  <td class="text-muted small">{{ insc.membre?.email || insc.membreEmail || insc.email }}</td>
                  <td class="text-muted small">{{ insc.membre?.telephone || insc.membreTelephone || insc.telephone || '—' }}</td>
                </tr>
                <tr *ngIf="membresClub.length === 0">
                  <td colspan="3" class="text-center text-muted py-4">Aucun membre inscrit</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL PRÉSENCE (VUE SEMAINE) -->
    <div class="modal-overlay" *ngIf="showPresenceModal && vueSemaine" (click)="showPresenceModal=false">
      <div class="modal-box-lg" (click)="$event.stopPropagation()">
        <div class="modal-hdr" style="background:linear-gradient(135deg,#880e4f,#e83e8c,#4a148c);border-radius:20px 20px 0 0;">
          <h5 class="fw-bold mb-0 text-white">
            <i class="bi bi-calendar-week-fill me-2"></i>
            Présences semaine — {{ selectedClub?.nom }}
          </h5>
          <button class="close-btn" style="color:rgba(255,255,255,0.8)" (click)="showPresenceModal=false">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <div class="modal-bdy">
          <div *ngIf="loadingAll" class="text-center py-5">
            <div class="spinner-border" style="color:#e83e8c"></div>
            <p class="mt-3 text-muted">Chargement des séances de la semaine...</p>
          </div>

          <div *ngIf="!loadingAll">
            <div class="stats-bar mb-4" *ngIf="semaineJours.length > 0">
              <span class="stat-chip"><i class="bi bi-calendar-week me-1"></i>{{ semaineJours.length }} séance(s)</span>
              <span class="stat-chip green"><i class="bi bi-check-circle me-1"></i>Total présents : {{ totalPresents }}</span>
              <span class="stat-chip red"><i class="bi bi-x-circle me-1"></i>Total absents : {{ totalAbsents }}</span>
            </div>

            <div *ngIf="semaineJours.length === 0">
              <div class="alert alert-warning text-center">
                <i class="bi bi-info-circle me-2"></i>
                Aucune séance prévue cette semaine (lundi, mercredi ou vendredi)
              </div>
            </div>

            <div class="semaine-jours" *ngFor="let jour of semaineJours; let i = index">
              <div class="jour-card" [class.expanded]="jour.ouvert">
                <div class="jour-header" (click)="jour.ouvert = !jour.ouvert">
                  <div class="jour-info">
                    <div class="jour-date">
                      <i class="bi bi-calendar-check me-2" style="color:#e83e8c"></i>
                      <strong>{{ jour.label }}</strong>
                    </div>
                    <div class="jour-stats">
                      <span class="stat-badge present"><i class="bi bi-check-circle"></i> {{ jour.nbPresents }}</span>
                      <span class="stat-badge absent"><i class="bi bi-x-circle"></i> {{ jour.nbAbsents }}</span>
                      <span class="stat-badge taux" [class.high]="jour.taux >= 70" [class.medium]="jour.taux >= 40 && jour.taux < 70" [class.low]="jour.taux < 40">
                        {{ jour.taux }}%
                      </span>
                      <span class="save-status" *ngIf="jour.sauvegarde">
                        <i class="bi bi-check-circle-fill text-success"></i> Sauvegardé
                      </span>
                      <span class="save-status" *ngIf="!jour.sauvegarde && jour.membres.length > 0">
                        <i class="bi bi-pencil-square text-warning"></i> Non sauvegardé
                      </span>
                    </div>
                  </div>
                  <i class="bi" [class.bi-chevron-down]="!jour.ouvert" [class.bi-chevron-up]="jour.ouvert"></i>
                </div>

                <div class="jour-body" *ngIf="jour.ouvert">
                  <div class="quick-actions mb-3">
                    <button class="btn btn-sm btn-outline-success" (click)="tousPresentsJour(jour); $event.stopPropagation()">
                      <i class="bi bi-check-all me-1"></i>Tous présents
                    </button>
                    <button class="btn btn-sm btn-outline-danger" (click)="tousAbsentsJour(jour); $event.stopPropagation()">
                      <i class="bi bi-x-circle me-1"></i>Tous absents
                    </button>
                  </div>

                  <div class="presence-list">
                    <div class="presence-row" *ngFor="let membre of jour.membres">
                      <div class="membre-info">
                        <div class="membre-avatar">{{ (membre.prenom || '?')[0] }}{{ (membre.nom || '?')[0] }}</div>
                        <div>
                          <div class="fw-semibold">{{ membre.prenom }} {{ membre.nom }}</div>
                          <small class="text-muted">{{ membre.email }}</small>
                        </div>
                      </div>
                      <div class="presence-toggle">
                        <label class="toggle-switch">
                          <input type="checkbox" [checked]="membre.present" (change)="toggleJour(membre, jour)">
                          <span class="toggle-slider"></span>
                        </label>
                        <span [class]="membre.present ? 'badge-present' : 'badge-absent'">
                          {{ membre.present ? 'Présent' : 'Absent' }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div class="mt-3 d-flex justify-content-end">
                    <button class="btn btn-ac-save" (click)="enregistrerJour(jour)" [disabled]="jour.saving">
                      <span *ngIf="!jour.saving"><i class="bi bi-save me-1"></i>Enregistrer cette séance</span>
                      <span *ngIf="jour.saving"><span class="spinner-border spinner-border-sm me-1"></span>Enregistrement...</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL PRÉSENCE (VUE JOUR UNIQUE) -->
    <div class="modal-overlay" *ngIf="showPresenceModal && !vueSemaine" (click)="showPresenceModal=false">
      <div class="modal-box-lg" (click)="$event.stopPropagation()">
        <div class="modal-hdr" style="background:linear-gradient(135deg,#880e4f,#e83e8c,#4a148c);border-radius:20px 20px 0 0;">
          <h5 class="fw-bold mb-0 text-white">
            <i class="bi bi-clipboard-check-fill me-2"></i>
            Présence — {{ selectedClub?.nom }}
          </h5>
          <button class="close-btn" style="color:rgba(255,255,255,0.8)" (click)="showPresenceModal=false">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <div class="modal-bdy">
          <div *ngIf="presenceLoading" class="text-center py-4">
            <div class="spinner-border" style="color:#e83e8c"></div>
          </div>

          <div *ngIf="!presenceLoading">
            <div class="seance-header mb-4">
              <div class="row g-3 align-items-end">
                <div class="col-md-5">
                  <label class="form-label fw-semibold">Date de la séance *</label>
                  <input type="date" class="form-control" [(ngModel)]="dateSeance" [max]="todayStr" (change)="onDateChange()">
                </div>
                <div class="col-md-7">
                  <div class="stats-bar">
                    <span class="stat-chip">Total : {{ membresPresence.length }}</span>
                    <span class="stat-chip green">
                      <i class="bi bi-check-circle me-1"></i>Présents : {{ nbPresents }}
                    </span>
                    <span class="stat-chip red">
                      <i class="bi bi-x-circle me-1"></i>Absents : {{ membresPresence.length - nbPresents }}
                    </span>
                  </div>
                </div>
              </div>
              <div class="d-flex gap-2 mt-3">
                <button class="btn btn-sm btn-outline-success" (click)="tousPresents()">
                  <i class="bi bi-check-all me-1"></i>Tous présents
                </button>
                <button class="btn btn-sm btn-outline-danger" (click)="tousAbsents()">
                  <i class="bi bi-x-circle me-1"></i>Tous absents
                </button>
              </div>
            </div>

            <div class="alert alert-info py-2 px-3 mb-3" style="font-size:0.82rem;border-radius:10px;">
              <i class="bi bi-info-circle me-1"></i>
              <strong>Important :</strong> Les présences déjà enregistrées pour cette date sont chargées automatiquement.
              Modifiez les toggles selon les absences du jour.
            </div>

            <div class="presence-list">
              <div class="presence-row" *ngFor="let item of membresPresence">
                <div class="membre-info">
                  <div class="membre-avatar">{{ (item.prenom || '?')[0] }}{{ (item.nom || '?')[0] }}</div>
                  <div>
                    <div class="fw-semibold">{{ item.prenom }} {{ item.nom }}</div>
                    <small class="text-muted">{{ item.email }}</small>
                  </div>
                </div>
                <div class="presence-toggle">
                  <label class="toggle-switch">
                    <input type="checkbox" [checked]="!item.present" (change)="item.present = !item.present">
                    <span class="toggle-slider"></span>
                  </label>
                  <span [class]="item.present ? 'badge-present' : 'badge-absent'">
                    {{ item.present ? 'Présent' : 'Absent' }}
                  </span>
                </div>
              </div>

              <div class="text-center text-muted py-4" *ngIf="membresPresence.length === 0">
                <i class="bi bi-people fs-2 d-block mb-2"></i>
                Aucun membre inscrit à ce club.
              </div>
            </div>

            <div class="mt-4 d-flex justify-content-end gap-2" *ngIf="membresPresence.length > 0">
              <button class="btn btn-outline-secondary" (click)="showPresenceModal=false">Annuler</button>
              <button class="btn btn-ac-save" (click)="enregistrerPresence()" [disabled]="!dateSeance || savingPresence">
                <span *ngIf="!savingPresence"><i class="bi bi-save me-1"></i>Enregistrer la séance</span>
                <span *ngIf="savingPresence"><span class="spinner-border spinner-border-sm me-1"></span>Enregistrement...</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .ac-content { margin-left: 260px; background: #f4f6f8; min-height: 100vh; }
    .ac-topbar  { background: white; padding: 20px 28px; border-bottom: 1px solid #f0f0f0; }

    .ac-club-card {
      background: white; border-radius: 18px; overflow: hidden;
      box-shadow: 0 2px 12px rgba(0,0,0,.06); transition: all .3s;
      display: flex; flex-direction: column;
    }
    .ac-club-card:hover { transform: translateY(-5px); box-shadow: 0 10px 30px rgba(0,0,0,.1); }
    .ac-card-header {
      background: linear-gradient(135deg,#880e4f,#e83e8c,#4a148c);
      padding: 18px; display: flex; align-items: center; gap: 12px;
    }
    .ac-card-icon {
      width: 40px; height: 40px;
      background: rgba(255,255,255,.15); border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      color: white; font-size: 1.2rem; flex-shrink: 0;
    }
    .ac-card-title { flex-grow: 1; min-width: 0; }
    .ac-statut {
      padding: 3px 10px; border-radius: 20px; font-size: .65rem; font-weight: 700;
      background: rgba(255,255,255,.2); color: white; flex-shrink: 0;
    }
    .ac-card-body { padding: 18px; flex-grow: 1; }
    .ac-meta { display: flex; flex-direction: column; gap: 7px; }
    .meta-item { display: flex; align-items: center; gap: 8px; font-size: .83rem; color: #495057; }
    .ac-card-footer {
      padding: 12px 16px; border-top: 1px solid #f0f0f0;
      display: flex; align-items: center; gap: 8px;
    }

    .toast-notification {
      position: fixed; top: 20px; right: 20px; z-index: 10000;
      background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      padding: 12px 20px; transform: translateX(400px); transition: transform 0.3s ease-in-out;
      border-left: 4px solid #28a745;
    }
    .toast-notification.show { transform: translateX(0); }
    .toast-notification.error { border-left-color: #dc3545; }
    .toast-content { display: flex; align-items: center; gap: 12px; }
    .toast-content i { font-size: 1.2rem; color: #28a745; }
    .toast-notification.error .toast-content i { color: #dc3545; }
    .btn-outline-secondary.active { background: #e83e8c; color: white; border-color: #e83e8c; }

    .modal-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,.5); z-index: 9000;
      display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px);
    }
    .modal-box-lg {
      background: white; border-radius: 20px; width: 100%; max-width: 800px;
      max-height: 92vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,.2);
    }
    .modal-hdr {
      padding: 20px 24px; border-bottom: 1px solid #f0f0f0;
      display: flex; justify-content: space-between; align-items: center;
    }
    .modal-bdy { padding: 24px; }
    .close-btn {
      background: none; border: none; font-size: 1.1rem; color: #6c757d; cursor: pointer;
      width: 32px; height: 32px; border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
    }
    .close-btn:hover { background: rgba(0,0,0,0.05); }

    .stats-bar { display: flex; gap: 10px; flex-wrap: wrap; }
    .stat-chip { background: #f0f4ff; color: #4361ee; padding: 5px 12px; border-radius: 20px; font-size: 0.78rem; font-weight: 600; }
    .stat-chip.green { background: #d4edda; color: #155724; }
    .stat-chip.red { background: #f8d7da; color: #721c24; }

    .semaine-jours { margin-bottom: 16px; }
    .jour-card { background: white; border-radius: 12px; border: 1px solid #e0e0e0; overflow: hidden; transition: all 0.3s; }
    .jour-card.expanded { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .jour-header { padding: 16px 20px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; background: #f8f9fa; transition: background 0.2s; }
    .jour-header:hover { background: #f0f0f0; }
    .jour-info { flex: 1; }
    .jour-date { font-size: 1rem; margin-bottom: 8px; }
    .jour-stats { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
    .stat-badge { padding: 3px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; display: inline-flex; align-items: center; gap: 5px; }
    .stat-badge.present { background: #d4edda; color: #155724; }
    .stat-badge.absent { background: #f8d7da; color: #721c24; }
    .stat-badge.taux { background: #e9ecef; color: #495057; }
    .stat-badge.taux.high { background: #d4edda; color: #155724; }
    .stat-badge.taux.medium { background: #fff3cd; color: #856404; }
    .stat-badge.taux.low { background: #f8d7da; color: #721c24; }
    .save-status { font-size: 0.7rem; padding: 3px 8px; border-radius: 12px; background: #f8f9fa; display: inline-flex; align-items: center; gap: 5px; }
    .jour-body { padding: 20px; border-top: 1px solid #e0e0e0; }
    .quick-actions { display: flex; gap: 10px; }

    .seance-header { background: #fff5f8; border-radius: 12px; padding: 16px; border: 1px solid #ffd6e7; }
    .presence-list { display: flex; flex-direction: column; gap: 8px; max-height: 400px; overflow-y: auto; padding-right: 4px; }
    .presence-row { display: flex; justify-content: space-between; align-items: center; background: #f8f9fa; border-radius: 12px; padding: 10px 16px; }
    .membre-info { display: flex; align-items: center; gap: 12px; }
    .membre-avatar {
      width: 38px; height: 38px; border-radius: 50%;
      background: linear-gradient(135deg,#880e4f,#e83e8c);
      color: white; display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 0.85rem; flex-shrink: 0;
    }
    .presence-toggle { display: flex; align-items: center; gap: 10px; }
    .toggle-switch { position: relative; display: inline-block; width: 46px; height: 24px; }
    .toggle-switch input { opacity: 0; width: 0; height: 0; }
    .toggle-slider {
      position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0;
      background-color: #28a745; border-radius: 24px; transition: 0.3s;
    }
    .toggle-slider:before {
      position: absolute; content: ""; height: 18px; width: 18px;
      left: 3px; bottom: 3px; background-color: white; border-radius: 50%; transition: 0.3s;
    }
    input:checked + .toggle-slider { background-color: #dc3545; }
    input:checked + .toggle-slider:before { transform: translateX(22px); }
    .badge-present { background: #d4edda; color: #155724; padding: 3px 10px; border-radius: 20px; font-size: 0.72rem; font-weight: 700; }
    .badge-absent { background: #f8d7da; color: #721c24; padding: 3px 10px; border-radius: 20px; font-size: 0.72rem; font-weight: 700; }

    .btn-ac-save { background: linear-gradient(135deg,#880e4f,#e83e8c); color: white; border: none; border-radius: 10px; font-weight: 600; padding: 9px 22px; }
    .btn-ac-save:hover { color: white; opacity: 0.9; }
    .btn-ac-save:disabled { opacity: 0.6; }
  `]
})
export class AnimateurClubsComponent implements OnInit {

  clubs: any[] = [];
  membresClub: any[] = [];
  selectedClub: any = null;
  loading = true;
  showMembresModal = false;
  showPresenceModal = false;

  // Vue semaine
  vueSemaine = true;
  semaineJours: any[] = [];
  loadingAll = false;

  // Vue jour unique
  membresPresence: any[] = [];
  presenceLoading = false;
  savingPresence = false;
  dateSeance = '';
  todayStr = new Date().toISOString().split('T')[0];

  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';

  get totalPresents(): number {
    return this.semaineJours.reduce((s, j) => s + j.nbPresents, 0);
  }

  get totalAbsents(): number {
    return this.semaineJours.reduce((s, j) => s + j.nbAbsents, 0);
  }

  get nbPresents(): number {
    return this.membresPresence.filter(m => m.present).length;
  }

  constructor(
    private clubService: ClubService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadMesClubs();
  }

  loadMesClubs(): void {
    this.loading = true;
    this.clubService.getMesClubs().subscribe({
      next: (clubs: any[]) => {
        this.clubs = clubs;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.showNotification('Erreur lors du chargement des clubs', 'error');
      }
    });
  }

  voirMembres(club: any): void {
    this.selectedClub = club;
    this.clubService.getMembres(club.id).subscribe({
      next: (m) => {
        this.membresClub = m;
        this.showMembresModal = true;
      },
      error: () => this.showNotification('Erreur chargement membres', 'error')
    });
  }

  ouvrirPresence(club: any): void {
    this.selectedClub = club;
    this.showPresenceModal = true;

    if (this.vueSemaine) {
      this.loadSemainePresences();
    } else {
      this.dateSeance = this.todayStr;
      this.presenceLoading = true;
      this.loadPresencesParDate();
    }
  }

  // ==================== VUE SEMAINE ====================
  private getLundiSemaine(): Date {
    const today = new Date();
    const day = today.getDay();
    const diff = (day === 0) ? -6 : 1 - day;
    const lundi = new Date(today);
    lundi.setDate(today.getDate() + diff);
    lundi.setHours(0, 0, 0, 0);
    return lundi;
  }

  private getJoursClub(): number[] {
    return [1, 3, 5]; // lundi, mercredi, vendredi
  }

  loadSemainePresences(): void {
    this.loadingAll = true;
    this.semaineJours = [];

    const lundi = this.getLundiSemaine();
    const today = new Date();
    today.setHours(23, 59, 59, 0);
    const joursAutorises = this.getJoursClub();

    const joursSemaine: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(lundi);
      d.setDate(lundi.getDate() + i);
      if (joursAutorises.includes(d.getDay()) && d <= today) {
        joursSemaine.push(d);
      }
    }

    if (joursSemaine.length === 0) {
      this.loadingAll = false;
      this.showNotification('Aucune séance cette semaine pour ce club.', 'error');
      return;
    }

    this.clubService.getMembres(this.selectedClub.id).subscribe({
      next: (membres: any[]) => {
        let loaded = 0;
        const total = joursSemaine.length;

        joursSemaine.forEach(date => {
          const dateStr = date.toISOString().split('T')[0];
          this.clubService.getPresencesByDate(this.selectedClub.id, dateStr).subscribe({
            next: (presencesExistantes: any[]) => {
              const presenceMap = new Map<number, boolean>();
              presencesExistantes.forEach(p => presenceMap.set(p.membreId, p.present));

              const membresJour = membres.map((insc: any) => {
                const membreId = insc.membre?.id || insc.membreId || insc.id;
                return {
                  id: membreId,
                  prenom: insc.membre?.prenom || insc.membrePrenom || insc.prenom,
                  nom: insc.membre?.nom || insc.membreNom || insc.nom,
                  email: insc.membre?.email || insc.membreEmail || insc.email,
                  present: presenceMap.has(membreId) ? presenceMap.get(membreId)! : true
                };
              });

              const nbPresents = membresJour.filter(m => m.present).length;

              this.semaineJours.push({
                date: dateStr,
                label: date.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: '2-digit' }),
                membres: membresJour,
                nbPresents,
                nbAbsents: membresJour.length - nbPresents,
                taux: membresJour.length ? Math.round((nbPresents / membresJour.length) * 100) : 0,
                ouvert: false,
                saving: false,
                sauvegarde: presencesExistantes.length > 0
              });

              loaded++;
              if (loaded === total) {
                this.semaineJours.sort((a, b) => a.date.localeCompare(b.date));
                this.loadingAll = false;
              }
            },
            error: () => {
              loaded++;
              if (loaded === total) this.loadingAll = false;
            }
          });
        });
      },
      error: () => {
        this.loadingAll = false;
        this.showNotification('Erreur chargement des membres', 'error');
      }
    });
  }

  toggleJour(membre: any, jour: any): void {
    membre.present = !membre.present;
    jour.nbPresents = jour.membres.filter((m: any) => m.present).length;
    jour.nbAbsents = jour.membres.length - jour.nbPresents;
    jour.taux = jour.membres.length ? Math.round((jour.nbPresents / jour.membres.length) * 100) : 0;
    jour.sauvegarde = false;
  }

  tousPresentsJour(jour: any): void {
    jour.membres.forEach((m: any) => m.present = true);
    jour.nbPresents = jour.membres.length;
    jour.nbAbsents = 0;
    jour.taux = 100;
    jour.sauvegarde = false;
  }

  tousAbsentsJour(jour: any): void {
    jour.membres.forEach((m: any) => m.present = false);
    jour.nbPresents = 0;
    jour.nbAbsents = jour.membres.length;
    jour.taux = 0;
    jour.sauvegarde = false;
  }

  enregistrerJour(jour: any): void {
    if (!this.selectedClub) return;
    jour.saving = true;

    const presences = jour.membres.map((m: any) => ({
      membreId: m.id,
      present: m.present
    }));

    this.clubService.saisirPresenceBatch(this.selectedClub.id, jour.date, presences).subscribe({
      next: () => {
        jour.saving = false;
        jour.sauvegarde = true;
        this.showNotification(`✓ Séance du ${jour.label} enregistrée !`, 'success');
      },
      error: () => {
        jour.saving = false;
        this.showNotification('Erreur enregistrement', 'error');
      }
    });
  }

  // ==================== VUE JOUR UNIQUE ====================
  loadPresencesParDate(): void {
    if (!this.selectedClub || !this.dateSeance) return;

    this.presenceLoading = true;

    this.clubService.getMembres(this.selectedClub.id).subscribe({
      next: (membres: any[]) => {
        this.clubService.getPresencesByDate(this.selectedClub.id, this.dateSeance).subscribe({
          next: (presencesExistantes: any[]) => {
            const presenceMap = new Map();
            presencesExistantes.forEach(p => presenceMap.set(p.membreId, p.present));

            this.membresPresence = membres.map((insc: any) => {
              const membreId = insc.membre?.id || insc.membreId || insc.id;
              const presenceExistante = presenceMap.get(membreId);

              return {
                id: membreId,
                prenom: insc.membre?.prenom || insc.membrePrenom || insc.prenom,
                nom: insc.membre?.nom || insc.membreNom || insc.nom,
                email: insc.membre?.email || insc.membreEmail || insc.email,
                present: presenceExistante !== undefined ? presenceExistante : true
              };
            });

            this.presenceLoading = false;
          },
          error: () => {
            this.membresPresence = membres.map((insc: any) => ({
              id: insc.membre?.id || insc.membreId || insc.id,
              prenom: insc.membre?.prenom || insc.membrePrenom || insc.prenom,
              nom: insc.membre?.nom || insc.membreNom || insc.nom,
              email: insc.membre?.email || insc.membreEmail || insc.email,
              present: true
            }));
            this.presenceLoading = false;
          }
        });
      },
      error: () => {
        this.presenceLoading = false;
        this.showNotification('Erreur chargement des membres', 'error');
      }
    });
  }

  onDateChange(): void {
    this.loadPresencesParDate();
  }

  tousPresents(): void {
    this.membresPresence.forEach(m => m.present = true);
  }

  tousAbsents(): void {
    this.membresPresence.forEach(m => m.present = false);
  }

  enregistrerPresence(): void {
    if (!this.dateSeance || !this.selectedClub) {
      this.showNotification('Veuillez sélectionner une date', 'error');
      return;
    }

    this.savingPresence = true;

    const presences = this.membresPresence.map(m => ({
      membreId: m.id,
      present: m.present
    }));

    this.clubService.saisirPresenceBatch(this.selectedClub.id, this.dateSeance, presences).subscribe({
      next: (response: any) => {
        this.savingPresence = false;
        this.loadPresencesParDate();
        this.showNotification(`✓ Séance du ${this.dateSeance} enregistrée !`, 'success');
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.savingPresence = false;
        this.showNotification('Erreur lors de l\'enregistrement', 'error');
      }
    });
  }

  // ==================== UTILITAIRES ====================
  private showNotification(message: string, type: 'success' | 'error'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;

    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }
}
