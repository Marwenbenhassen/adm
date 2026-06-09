import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-demandes-inscription',
  template: `
    <div class="d-flex">
      <app-sidebar></app-sidebar>
      <div class="admin-content flex-grow-1">
        <div class="topbar">
          <div>
            <h4 class="mb-0 fw-bold"><i class="bi bi-person-plus-fill me-2 text-primary"></i>Demandes d'inscription</h4>
            <small class="text-muted">Valider les nouvelles demandes de membres</small>
          </div>
          <span class="badge bg-warning text-dark fw-semibold" *ngIf="enAttente.length > 0">
            {{ enAttente.length }} en attente
          </span>
        </div>

        <div class="p-4">
          <!-- Stats -->
          <div class="row g-3 mb-4">
            <div class="col-md-3" *ngFor="let s of stats">
              <div class="stat-card" [style.border-left-color]="s.color">
                <i class="bi {{ s.icon }}" [style.color]="s.color"></i>
                <div><div class="stat-val">{{ s.value }}</div><div class="stat-lbl">{{ s.label }}</div></div>
              </div>
            </div>
          </div>

          <!-- Tabs -->
          <div class="tabs-bar mb-4">
            <button class="tab-btn" [class.active]="tab==='attente'" (click)="tab='attente'">
              En attente ({{ enAttente.length }})
            </button>
            <button class="tab-btn" [class.active]="tab==='traitees'" (click)="tab='traitees'">
              Traitées
            </button>
          </div>

          <div class="text-center py-5" *ngIf="loading">
            <div class="spinner-border text-success" style="width:3rem;height:3rem"></div>
          </div>

          <!-- Liste des demandes -->
          <div class="table-responsive admin-table-wrap" *ngIf="!loading">
            <table class="table table-mellita mb-0">
              <thead>
                <tr>
                  <th>Date</th><th>Nom complet</th><th>Email</th>
                  <th>Téléphone</th><th>Statut</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let d of getDisplayed()">
                  <td class="text-muted small">{{ d.createdAt | date:'dd/MM/yyyy HH:mm' }}</td>
                  <td class="fw-semibold">{{ d.prenom }} {{ d.nom }}</td>
                  <td>{{ d.email }}</td>
                  <td class="text-muted small">{{ d.telephone || '—' }}</td>
                  <td>
                    <span class="statut-badge {{ d.statut?.toLowerCase() }}">{{ d.statut }}</span>
                    <div class="small text-muted" *ngIf="d.motifRejet">{{ d.motifRejet }}</div>
                  </td>
                  <td>
                    <div class="d-flex gap-1" *ngIf="d.statut==='EN_ATTENTE'">
                      <button class="action-btn ok" (click)="accepter(d)" title="Accepter">
                        <i class="bi bi-check-lg"></i>
                      </button>
                      <button class="action-btn rej" (click)="openRejetModal(d)" title="Rejeter">
                        <i class="bi bi-x-lg"></i>
                      </button>
                      <button class="action-btn info" (click)="voirDetails(d)" title="Détails">
                        <i class="bi bi-eye-fill"></i>
                      </button>
                    </div>
                    <small class="text-muted" *ngIf="d.statut!=='EN_ATTENTE'">
                      Traité par {{ d.traitePar?.prenom }} {{ d.traitePar?.nom }}
                    </small>
                  </td>
                </tr>
                <tr *ngIf="getDisplayed().length===0">
                  <td colspan="6" class="text-center text-muted py-5">Aucune demande</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Rejet -->
    <div class="modal-overlay" *ngIf="showRejetModal" (click)="showRejetModal=false">
      <div class="modal-box" style="max-width:420px" (click)="$event.stopPropagation()">
        <div class="modal-hdr">
          <h5 class="fw-bold mb-0 text-danger"><i class="bi bi-x-circle me-2"></i>Rejeter la demande</h5>
          <button class="close-btn" (click)="showRejetModal=false"><i class="bi bi-x-lg"></i></button>
        </div>
        <div class="modal-bdy">
          <p><strong>{{ selectedDemande?.prenom }} {{ selectedDemande?.nom }}</strong></p>
          <label class="form-label fw-semibold">Motif du rejet *</label>
          <textarea class="form-control" [(ngModel)]="motifRejet" rows="3" 
                    placeholder="Expliquez pourquoi..."></textarea>
        </div>
        <div class="modal-ftr">
          <button class="btn btn-outline-secondary" (click)="showRejetModal=false">Annuler</button>
          <button class="btn btn-danger" (click)="confirmerRejet()" [disabled]="!motifRejet">
            <i class="bi bi-x-lg me-1"></i>Rejeter
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Détails -->
    <div class="modal-overlay" *ngIf="showDetailsModal" (click)="showDetailsModal=false">
      <div class="modal-box" (click)="$event.stopPropagation()">
        <div class="modal-hdr">
          <h5 class="fw-bold mb-0"><i class="bi bi-person-vcard me-2"></i>Détails de la demande</h5>
          <button class="close-btn" (click)="showDetailsModal=false"><i class="bi bi-x-lg"></i></button>
        </div>
        <div class="modal-bdy" *ngIf="selectedDemande">
          <div class="detail-row"><strong>Nom :</strong> {{ selectedDemande.nom }}</div>
          <div class="detail-row"><strong>Prénom :</strong> {{ selectedDemande.prenom }}</div>
          <div class="detail-row"><strong>Email :</strong> {{ selectedDemande.email }}</div>
          <div class="detail-row"><strong>Téléphone :</strong> {{ selectedDemande.telephone || 'Non renseigné' }}</div>
          <div class="detail-row"><strong>Adresse :</strong> {{ selectedDemande.adresse || 'Non renseignée' }}</div>
          <div class="detail-row" *ngIf="selectedDemande.message">
            <strong>Message :</strong><br>
            <em class="text-muted">{{ selectedDemande.message }}</em>
          </div>
          <div class="detail-row"><strong>Date demande :</strong> {{ selectedDemande.createdAt | date:'dd/MM/yyyy à HH:mm' }}</div>
          <div class="detail-row" *ngIf="selectedDemande.statut!=='EN_ATTENTE'">
            <strong>Traité par :</strong> {{ selectedDemande.traitePar?.prenom }} {{ selectedDemande.traitePar?.nom }}
            le {{ selectedDemande.dateTraitement | date:'dd/MM/yyyy' }}
          </div>
          <div class="detail-row" *ngIf="selectedDemande.motDePasseTemporaire">
            <strong>Mot de passe envoyé :</strong> <code>{{ selectedDemande.motDePasseTemporaire }}</code>
          </div>
        </div>
        <div class="modal-ftr">
          <button class="btn btn-outline-secondary" (click)="showDetailsModal=false">Fermer</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-content { margin-left:260px; background:#f4f6f8; min-height:100vh; }
    .topbar { background:white; padding:20px 28px; border-bottom:1px solid #f0f0f0; display:flex; justify-content:space-between; align-items:center; }
    .stat-card { background:white; border-radius:14px; padding:18px; border-left:4px solid; display:flex; align-items:center; gap:14px; box-shadow:0 2px 8px rgba(0,0,0,.05); }
    .stat-card i { font-size:1.8rem; }
    .stat-val { font-size:1.6rem; font-weight:900; }
    .stat-lbl { color:#6c757d; font-size:.8rem; }
    .tabs-bar { display:flex; gap:4px; background:white; padding:6px; border-radius:12px; width:fit-content; }
    .tab-btn { background:none; border:none; padding:8px 20px; border-radius:8px; font-weight:600; color:#6c757d; cursor:pointer; }
    .tab-btn.active { background:#1a6b3c; color:white; }
    .admin-table-wrap { background:white; border-radius:14px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,.05); }
    .statut-badge { padding:3px 10px; border-radius:20px; font-size:.72rem; font-weight:700; display:inline-block; }
    .statut-badge.en_attente { background:#fff3cd; color:#856404; }
    .statut-badge.acceptee { background:#d4edda; color:#155724; }
    .statut-badge.rejetee { background:#f8d7da; color:#721c24; }
    .action-btn { width:30px; height:30px; border:none; border-radius:7px; display:flex; align-items:center; justify-content:center; font-size:.8rem; cursor:pointer; }
    .action-btn.ok { background:#d4edda; color:#155724; } .action-btn.ok:hover { background:#155724; color:white; }
    .action-btn.rej { background:#fff3cd; color:#856404; } .action-btn.rej:hover { background:#dc3545; color:white; }
    .action-btn.info { background:#d1ecf1; color:#0c5460; } .action-btn.info:hover { background:#0c5460; color:white; }
    .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,.5); z-index:9000; display:flex; align-items:center; justify-content:center; }
    .modal-box { background:white; border-radius:20px; width:100%; max-width:540px; max-height:90vh; overflow-y:auto; }
    .modal-hdr { padding:20px 24px; border-bottom:1px solid #f0f0f0; display:flex; justify-content:space-between; align-items:center; }
    .modal-bdy { padding:24px; }
    .modal-ftr { padding:16px 24px; border-top:1px solid #f0f0f0; display:flex; justify-content:flex-end; gap:10px; }
    .close-btn { background:none; border:none; font-size:1.1rem; color:#6c757d; cursor:pointer; }
    .detail-row { padding:8px 0; border-bottom:1px solid #f0f0f0; }
    .detail-row:last-child { border-bottom:none; }
  `]
})
export class DemandesInscriptionComponent implements OnInit {
  demandes: any[] = [];
  enAttente: any[] = [];
  loading = true;
  tab = 'attente';
  stats: any[] = [];
  showRejetModal = false;
  showDetailsModal = false;
  selectedDemande: any = null;
  motifRejet = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadDemandes();
    this.loadStats();
  }

  loadDemandes(): void {
    this.loading = true;
    this.http.get<any[]>(`${environment.apiUrl}/demandes-inscription`).subscribe({
      next: d => {
        this.demandes = d;
        this.enAttente = d.filter(x => x.statut === 'EN_ATTENTE');
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  loadStats(): void {
    this.http.get<any>(`${environment.apiUrl}/demandes-inscription/stats`).subscribe({
      next: s => {
        this.stats = [
          { icon:'bi-inbox-fill', label:'Total', value:s.total, color:'#6c757d' },
          { icon:'bi-hourglass-split', label:'En attente', value:s.enAttente, color:'#ffc107' },
          { icon:'bi-check-circle-fill', label:'Acceptées', value:s.acceptees, color:'#28a745' },
          { icon:'bi-x-circle-fill', label:'Rejetées', value:s.rejetees, color:'#dc3545' },
        ];
      }
    });
  }

  getDisplayed(): any[] {
    if (this.tab === 'attente') return this.enAttente;
    return this.demandes.filter(d => d.statut !== 'EN_ATTENTE');
  }

  accepter(d: any): void {
    if (!confirm(`Accepter la demande de ${d.prenom} ${d.nom} ?\n\nUn email avec un mot de passe temporaire sera envoyé automatiquement.`)) return;
    this.http.put(`${environment.apiUrl}/demandes-inscription/${d.id}/accepter`, {}).subscribe({
      next: (res: any) => {
        alert(`✅ Demande acceptée !\n\nEmail envoyé à ${d.email}\nMot de passe temporaire : ${res.motDePasseTemporaire}`);
        this.loadDemandes();
        this.loadStats();
      },
      error: () => alert('❌ Erreur lors de l\'acceptation')
    });
  }

  openRejetModal(d: any): void {
    this.selectedDemande = d;
    this.motifRejet = '';
    this.showRejetModal = true;
  }

  confirmerRejet(): void {
    if (!this.selectedDemande || !this.motifRejet) return;
    this.http.put(`${environment.apiUrl}/demandes-inscription/${this.selectedDemande.id}/rejeter`, 
      { motif: this.motifRejet }).subscribe({
      next: () => {
        this.showRejetModal = false;
        this.loadDemandes();
        this.loadStats();
      }
    });
  }

  voirDetails(d: any): void {
    this.selectedDemande = d;
    this.showDetailsModal = true;
  }
}
