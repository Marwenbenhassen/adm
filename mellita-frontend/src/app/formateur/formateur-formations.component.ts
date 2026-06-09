import { Component, OnInit } from '@angular/core';
import { FormationService } from '../core/services/api.services';
import { AuthService }      from '../core/services/auth.service';
import { forkJoin }         from 'rxjs';

const STYLES = `
  .fm-content { margin-left: 260px; background: #f4f6f8; min-height: 100vh; }
  .fm-topbar  { background: white; padding: 20px 28px; border-bottom: 1px solid #f0f0f0; }
  .form-card { background: white; border-radius: 16px; box-shadow: 0 2px 10px rgba(0,0,0,0.06);
               overflow: hidden; transition: all 0.3s; display: flex; flex-direction: column; }
  .form-card:hover { transform: translateY(-4px); box-shadow: 0 8px 25px rgba(0,0,0,0.1); }
  .form-card-top { background: linear-gradient(135deg,#4a148c,#6f42c1); padding: 12px 16px;
                   display: flex; justify-content: space-between; align-items: center; }
  .form-statut { padding: 3px 10px; border-radius: 20px; background: rgba(255,255,255,0.2);
                 color: white; font-size: 0.72rem; font-weight: 700; }
  .info-tag { background: #f0f4ff; color: #4361ee; padding: 3px 8px; border-radius: 6px; font-size: 0.72rem; }
  .info-tag.price { background: #fef9e7; color: #c8a84b; }
  .form-footer { padding: 10px 14px; border-top: 1px solid #f0f0f0; display: flex; gap: 8px; margin-top: auto; }
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 9000;
                   display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); }
  .modal-box-lg  { background: white; border-radius: 20px; width: 100%; max-width: 700px;
                   max-height: 92vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
  .modal-hdr { padding: 20px 24px; border-bottom: 1px solid #f0f0f0;
               display: flex; justify-content: space-between; align-items: center; }
  .modal-bdy { padding: 24px; }
  .modal-ftr { padding: 16px 24px; border-top: 1px solid #f0f0f0; display: flex; justify-content: flex-end; gap: 10px; }
  .close-btn { background: none; border: none; font-size: 1.1rem; color: #6c757d; cursor: pointer;
               width: 32px; height: 32px; border-radius: 8px; display: flex;
               align-items: center; justify-content: center; }
  .close-btn:hover { background: #f0f0f0; }
  .stats-bar { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 14px; }
  .stat-chip       { background: #f0f4ff; color: #4361ee; padding: 5px 14px; border-radius: 20px; font-size: 0.78rem; font-weight: 600; }
  .stat-chip.green { background: #d4edda; color: #155724; }
  .stat-chip.red   { background: #f8d7da; color: #721c24; }
  .badge-present { background: #d4edda; color: #155724; padding: 3px 10px; border-radius: 20px; font-size: 0.72rem; font-weight: 700; }
  .badge-absent  { background: #f8d7da; color: #721c24; padding: 3px 10px; border-radius: 20px; font-size: 0.72rem; font-weight: 700; }
  .presence-list { display: flex; flex-direction: column; gap: 8px; max-height: 420px; overflow-y: auto; padding-right: 4px; }
  .presence-row  { display: flex; justify-content: space-between; align-items: center;
                   background: #f8f9fa; border-radius: 12px; padding: 10px 16px; }
  .membre-info   { display: flex; align-items: center; gap: 12px; }
  .membre-avatar { width: 38px; height: 38px; border-radius: 50%; color: white;
                   display: flex; align-items: center; justify-content: center;
                   font-weight: 700; font-size: 0.85rem; flex-shrink: 0; }
  .presence-toggle { display: flex; align-items: center; gap: 10px; }
  .toggle-switch   { position: relative; display: inline-block; width: 46px; height: 24px; }
  .toggle-switch input { opacity: 0; width: 0; height: 0; }
  .toggle-slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0;
                   background-color: #28a745; border-radius: 24px; transition: 0.3s; }
  .toggle-slider:before { position: absolute; content: ""; height: 18px; width: 18px;
                           left: 3px; bottom: 3px; background-color: white; border-radius: 50%; transition: 0.3s; }
  input:checked + .toggle-slider { background-color: #dc3545; }
  input:checked + .toggle-slider:before { transform: translateX(22px); }
  .btn-save-presence {
    background: linear-gradient(135deg,#4a148c,#6f42c1);
    color: white; border: none; border-radius: 10px;
    font-weight: 600; padding: 9px 22px;
  }
  .btn-save-presence:hover { color: white; opacity: 0.9; }
  .btn-save-presence:disabled { opacity: 0.6; }
`;

@Component({
  selector: 'app-formateur-formations',
  template: `
    <div class="d-flex">
      <app-sidebar></app-sidebar>

      <div class="fm-content flex-grow-1">

        <div class="fm-topbar">
          <div>
            <h4 class="mb-0 fw-bold">
              <i class="bi bi-mortarboard-fill me-2" style="color:#6f42c1"></i>Mes Formations
            </h4>
            <small class="text-muted">{{ formations.length }} formation(s) assignée(s)</small>
          </div>
        </div>

        <div class="p-4">
          <div class="text-center py-5" *ngIf="loading">
            <div class="spinner-border" style="color:#6f42c1"></div>
          </div>

          <div class="row g-4" *ngIf="!loading">
            <div class="col-md-6 col-lg-4" *ngFor="let f of formations">
              <div class="form-card">
                <div class="form-card-top">
                  <span class="form-statut">{{ getStatutLabel(f.statut) }}</span>
                </div>
                <div class="p-3">
                  <h6 class="fw-bold mb-1">{{ f.titre }}</h6>
                  <p class="text-muted small mb-2">{{ (f.description | slice:0:80) || 'Aucune description' }}...</p>
                  <div class="d-flex flex-wrap gap-2">
                    <span class="info-tag" *ngIf="f.dateDebut">
                      <i class="bi bi-calendar me-1"></i>{{ getJourFormation(f.dateDebut) }}
                    </span>
                    <span class="info-tag price">
                      {{ f.prix === 0 ? 'Gratuit' : (f.prix + ' TND') }}
                    </span>
                    <span class="info-tag" *ngIf="f.dureeHeures">
                      <i class="bi bi-clock me-1"></i>{{ f.dureeHeures }}h
                    </span>
                    <span class="info-tag" *ngIf="f.lieu">
                      <i class="bi bi-geo-alt me-1"></i>{{ f.lieu }}
                    </span>
                  </div>
                </div>
                <div class="form-footer">
                  <button class="btn btn-sm btn-outline-success" (click)="voirMembres(f)">
                    <i class="bi bi-people me-1"></i>Membres
                  </button>
                  <button class="btn btn-sm btn-outline-primary" (click)="ouvrirPresence(f)">
                    <i class="bi bi-clipboard-check me-1"></i>Présence
                  </button>
                </div>
              </div>
            </div>

            <div class="col-12 text-center text-muted py-5" *ngIf="formations.length === 0">
              <i class="bi bi-mortarboard fs-1 mb-3 d-block" style="color:#6f42c1"></i>
              Aucune formation ne vous est assignée pour le moment.
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== MODAL MEMBRES ===== -->
    <div class="modal-overlay" *ngIf="showMembresModal" (click)="showMembresModal=false">
      <div class="modal-box-lg" (click)="$event.stopPropagation()">
        <div class="modal-hdr">
          <h5 class="fw-bold mb-0">
            <i class="bi bi-people-fill me-2" style="color:#6f42c1"></i>
            Membres inscrits — {{ selectedFormation?.titre }}
          </h5>
          <button class="close-btn" (click)="showMembresModal=false">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <div class="modal-bdy">
          <div class="stats-bar" *ngIf="membresInscriptions.length > 0">
            <span class="stat-chip">Total : {{ membresInscriptions.length }}</span>
            <span class="stat-chip green">Présents : {{ nbMembresPresents }}</span>
            <span class="stat-chip red">Absents : {{ membresInscriptions.length - nbMembresPresents }}</span>
          </div>
          <div class="table-responsive">
            <table class="table table-sm table-hover mb-0">
              <thead style="background:#ede9f8">
                <tr><th>Membre</th><th>Email</th><th>Présence</th></tr>
              </thead>
              <tbody>
                <tr *ngFor="let insc of membresInscriptions">
                  <td class="fw-semibold">{{ insc.membre?.prenom }} {{ insc.membre?.nom }}</td>
                  <td class="text-muted small">{{ insc.membre?.email }}</td>
                  <td>
                    <span [class]="insc.present ? 'badge-present' : 'badge-absent'">
                      {{ insc.present ? 'Présent' : 'Absent' }}
                    </span>
                  </td>
                </tr>
                <tr *ngIf="membresInscriptions.length === 0">
                  <td colspan="3" class="text-center text-muted py-4">Aucun membre inscrit</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== MODAL PRÉSENCE ===== -->
    <div class="modal-overlay" *ngIf="showPresenceModal" (click)="showPresenceModal=false">
      <div class="modal-box-lg" (click)="$event.stopPropagation()">

        <div class="modal-hdr"
             style="background:linear-gradient(135deg,#4a148c,#6f42c1);border-radius:20px 20px 0 0;">
          <h5 class="fw-bold mb-0 text-white">
            <i class="bi bi-clipboard-check-fill me-2"></i>
            Feuille de Présence — {{ selectedFormation?.titre }}
          </h5>
          <button class="close-btn" style="color:rgba(255,255,255,0.8)"
                  (click)="showPresenceModal=false">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <div class="modal-bdy">
          <div *ngIf="presenceLoading" class="text-center py-4">
            <div class="spinner-border" style="color:#6f42c1"></div>
            <p class="text-muted mt-2 small">Chargement des présences...</p>
          </div>

          <div *ngIf="!presenceLoading">
          
            <div class="mb-3 d-flex align-items-center gap-3 p-3 rounded-3" style="background:#f0f4ff; border:1px solid #dce4ff;">
              <label class="fw-bold mb-0 text-dark" style="font-size:0.9rem;">
                <i class="bi bi-calendar-event me-2" style="color:#6f42c1"></i>Date de la séance :
              </label>
              <input type="date" class="form-control w-auto" [(ngModel)]="dateSeance" (change)="chargerPresencesDuJour()" style="border-radius:8px;">
            </div>

            <div class="stats-bar mb-3">
              <span class="stat-chip">Total : {{ inscriptions.length }}</span>
              <span class="stat-chip green">
                <i class="bi bi-check-circle me-1"></i>Présents : {{ nbPresents }}
              </span>
              <span class="stat-chip red">
                <i class="bi bi-x-circle me-1"></i>Absents : {{ inscriptions.length - nbPresents }}
              </span>
            </div>

            <div class="alert alert-success py-2 px-3 mb-3" *ngIf="presenceSaved"
                 style="font-size:0.82rem;border-radius:10px;">
              <i class="bi bi-check-circle me-1"></i>
              Présences enregistrées avec succès !
            </div>

            <div class="alert alert-info py-2 px-3 mb-3"
                 style="font-size:0.82rem;border-radius:10px;">
              <i class="bi bi-info-circle me-1"></i>
              Tous les membres sont <strong>présents par défaut</strong>.
              Activez le toggle pour marquer un <strong>absent</strong>.
            </div>

            <div class="d-flex gap-2 mb-3">
              <button class="btn btn-sm btn-outline-success" (click)="tousPresents()">
                <i class="bi bi-check-all me-1"></i>Tous présents
              </button>
              <button class="btn btn-sm btn-outline-danger" (click)="tousAbsents()">
                <i class="bi bi-x-circle me-1"></i>Tous absents
              </button>
            </div>

            <div class="presence-list">
              <div class="presence-row" *ngFor="let insc of inscriptions">
                <div class="membre-info">
                  <div class="membre-avatar"
                       style="background:linear-gradient(135deg,#4a148c,#6f42c1)">
                    {{ (insc.membre?.prenom || '?')[0] }}{{ (insc.membre?.nom || '?')[0] }}
                  </div>
                  <div>
                    <div class="fw-semibold">{{ insc.membre?.prenom }} {{ insc.membre?.nom }}</div>
                    <small class="text-muted">{{ insc.membre?.email }}</small>
                  </div>
                </div>

                <div class="presence-toggle">
                  <label class="toggle-switch">
                    <input type="checkbox"
                           [checked]="!insc.present"
                           (change)="togglePresence(insc)">
                    <span class="toggle-slider"></span>
                  </label>
                  <span [class]="insc.present ? 'badge-present' : 'badge-absent'">
                    {{ insc.present ? 'Présent' : 'Absent' }}
                  </span>
                </div>
              </div>

              <div class="text-center text-muted py-4" *ngIf="inscriptions.length === 0">
                <i class="bi bi-people fs-2 d-block mb-2"></i>
                Aucun membre inscrit à cette formation.
              </div>
            </div>

          </div>
        </div>

        <div class="modal-ftr" *ngIf="!presenceLoading && inscriptions.length > 0">
          <button class="btn btn-secondary btn-sm" (click)="showPresenceModal=false">
            Annuler
          </button>
          <button class="btn-save-presence"
                  [disabled]="savingPresence"
                  (click)="enregistrerPresence()">
            <span *ngIf="savingPresence">
              <span class="spinner-border spinner-border-sm me-1"></span>Enregistrement...
            </span>
            <span *ngIf="!savingPresence">
              <i class="bi bi-save me-1"></i>Enregistrer les présences
            </span>
          </button>
        </div>

      </div>
    </div>
  `,
  styles: [STYLES]
})
export class FormateurFormationsComponent implements OnInit {

  formations:          any[] = [];
  inscriptions:        any[] = [];
  membresInscriptions: any[] = [];
  selectedFormation:   any   = null;
  loading           = true;
  presenceLoading   = false;
  savingPresence    = false;
  presenceSaved     = false;
  showMembresModal  = false;
  showPresenceModal = false;
  dateSeance        = new Date().toISOString().split('T')[0];

  get nbPresents(): number {
    return this.inscriptions.filter(i => i.present).length;
  }

  get nbMembresPresents(): number {
    return this.membresInscriptions.filter(i => i.present).length;
  }

  private mapInscriptions(insc: any[]): any[] {
    return insc.map((i: any) => ({
      ...i,
      present: (i.presence === true || i.presence === false) ? i.presence : true
    }));
  }

  constructor(
    private formationService: FormationService,
    private authService:      AuthService
  ) {}

  ngOnInit(): void {
    this.loadMesFormations();
  }

  loadMesFormations(): void {
    this.loading = true;
    this.formationService.getMesFormations().subscribe({
      next: (formations: any[]) => {
        this.formations = formations;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement formations:', err);
        this.loading = false;
      }
    });
  }

  getStatutLabel(statut: string): string {
    switch (statut) {
      case 'EN_COURS': return 'En cours';
      case 'PLANIFIEE': return 'Planifiée';
      case 'TERMINEE': return 'Terminée';
      case 'ANNULEE': return 'Annulée';
      default: return statut || 'Planifiée';
    }
  }

  voirMembres(f: any): void {
    this.selectedFormation = f;
    this.formationService.getInscriptions(f.id).subscribe(insc => {
      this.membresInscriptions = this.mapInscriptions(insc);
      this.showMembresModal    = true;
    });
  }

  ouvrirPresence(f: any): void {
    this.selectedFormation = f;
    this.dateSeance = new Date().toISOString().split('T')[0];
    this.showPresenceModal = true;
    this.chargerPresencesDuJour();
  }

  chargerPresencesDuJour(): void {
    if (!this.selectedFormation) return;
    this.presenceLoading = true;
    this.presenceSaved   = false;

    forkJoin({
      inscriptions: this.formationService.getInscriptions(this.selectedFormation.id),
      presences: this.formationService.getPresencesByDate(this.selectedFormation.id, this.dateSeance)
    }).subscribe({
      next: (res: any) => {
        const presenceMap = new Map<number, boolean>();
        if (res.presences) {
          res.presences.forEach((p: any) => presenceMap.set(p.membreId, p.present));
        }

        this.inscriptions = res.inscriptions.map((insc: any) => {
          const mId = insc.membre?.id || insc.membreId;
          let isPresent = true; // Par défaut, tout le monde est présent
          if (presenceMap.has(mId)) {
            isPresent = presenceMap.get(mId)!;
          }
          return {
            ...insc,
            membreId: mId,
            present: isPresent
          };
        });
        
        this.presenceLoading = false;
      },
      error: () => {
        this.presenceLoading = false;
        alert('Erreur lors du chargement des présences');
      }
    });
  }

  togglePresence(insc: any): void {
    insc.present = !insc.present;
    this.presenceSaved = false;
  }

  tousPresents(): void {
    this.inscriptions.forEach(i => i.present = true);
    this.presenceSaved = false;
  }

  tousAbsents(): void {
    this.inscriptions.forEach(i => i.present = false);
    this.presenceSaved = false;
  }

  enregistrerPresence(): void {
    if (!this.selectedFormation || this.inscriptions.length === 0) return;

    this.savingPresence = true;
    this.presenceSaved  = false;

    const presencesPayload = this.inscriptions.map(insc => ({
      membreId: insc.membreId,
      present:  insc.present
    }));

    this.formationService.saisirPresenceBatch(this.selectedFormation.id, this.dateSeance, presencesPayload).subscribe({
      next: () => {
        this.savingPresence = false;
        this.presenceSaved  = true;
        setTimeout(() => this.presenceSaved = false, 4000);
      },
      error: (err) => {
        console.error('Erreur enregistrement présence:', err);
        this.savingPresence = false;
        alert('Erreur lors de l\'enregistrement. Veuillez réessayer.');
      }
    });
  }

  badgeClass(statut: string): string {
    switch (statut) {
      case 'EN_COURS':  return 'fdb-statut-badge badge-en-cours';
      case 'PLANIFIEE': return 'fdb-statut-badge badge-planifiee';
      case 'TERMINEE':  return 'fdb-statut-badge badge-terminee';
      case 'ANNULEE':   return 'fdb-statut-badge badge-annulee';
      default:          return 'fdb-statut-badge badge-planifiee';
    }
  }

  getJourFormation(dateStr: string): string {
    if (!dateStr) return 'Jour à définir';
    const date = new Date(dateStr);
    const jours = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
    return 'Chaque ' + jours[date.getDay()];
  }
}
