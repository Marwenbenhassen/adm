import { Component, OnInit } from '@angular/core';
import { FormationService } from '../core/services/api.services';
import { AuthService } from '../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-formateur-dashboard',
  template: `
    <div class="d-flex">
      <app-sidebar></app-sidebar>

      <div class="fdb-content flex-grow-1">

        <!-- ── Topbar salutation ── -->
        <div class="fdb-hero">
          <div class="fdb-hero-inner">
            <div class="fdb-date">
              <i class="bi bi-calendar3 me-2"></i>{{ today | date:'EEEE d MMMM yyyy' }}
            </div>
            <h2 class="fdb-greeting">
              {{ greetingMsg }}, <span class="fdb-name">{{ prenom }}</span> 👋
            </h2>
            <p class="fdb-subtitle">Voici un aperçu de vos formations</p>
          </div>
          <div class="fdb-hero-deco">
            <i class="bi bi-mortarboard-fill"></i>
          </div>
        </div>

        <!-- ── Cartes stats ── -->
        <div class="fdb-stats">

          <div class="stat-card stat-purple">
            <div class="stat-icon"><i class="bi bi-mortarboard-fill"></i></div>
            <div class="stat-body">
              <div class="stat-value">{{ totalFormations }}</div>
              <div class="stat-label">Formations assignées</div>
            </div>
          </div>

          <div class="stat-card stat-green">
            <div class="stat-icon"><i class="bi bi-people-fill"></i></div>
            <div class="stat-body">
              <div class="stat-value">{{ totalMembres }}</div>
              <div class="stat-label">Membres inscrits</div>
            </div>
          </div>

          <div class="stat-card stat-blue">
            <div class="stat-icon"><i class="bi bi-play-circle-fill"></i></div>
            <div class="stat-body">
              <div class="stat-value">{{ formationsEnCours }}</div>
              <div class="stat-label">En cours</div>
            </div>
          </div>

          <div class="stat-card stat-orange">
            <div class="stat-icon"><i class="bi bi-hourglass-split"></i></div>
            <div class="stat-body">
              <div class="stat-value">{{ formationsPlanifiees }}</div>
              <div class="stat-label">Planifiées</div>
            </div>
          </div>

        </div>

        <!-- ── Liste formations récentes ── -->
        <div class="fdb-section">
          <h6 class="fdb-section-title mb-3">
            <i class="bi bi-list-ul me-2"></i>Mes formations récentes
          </h6>

          <div *ngIf="loading" class="text-center py-5">
            <div class="spinner-border" style="color:#6f42c1" role="status">
              <span class="visually-hidden">Chargement...</span>
            </div>
            <p class="text-muted mt-2 mb-0">Chargement de vos formations...</p>
          </div>

          <div *ngIf="!loading">
            <div class="fdb-formation-row" *ngFor="let f of formations.slice(0, 5)">
              <div class="fdb-formation-icon">
                <i class="bi bi-mortarboard-fill"></i>
              </div>
              <div class="fdb-formation-info">
                <div class="fw-semibold">{{ f.titre }}</div>
                <small class="text-muted">
                  <i class="bi bi-geo-alt me-1"></i>{{ f.lieu || 'À définir' }}
                  &nbsp;·&nbsp;
                  <i class="bi bi-calendar me-1"></i>{{ getJourFormation(f.dateDebut) }}
                  &nbsp;·&nbsp;
                  <i class="bi bi-people me-1"></i>{{ f.totalInscrits || 0 }} inscrit(s)
                </small>
              </div>
              <span class="fdb-statut-badge" [ngClass]="badgeClass(f.statut)">
                {{ getStatutLabel(f.statut) }}
              </span>

            </div>

            <div class="text-center text-muted py-4" *ngIf="formations.length === 0">
              <i class="bi bi-mortarboard fs-2 d-block mb-2" style="color:#6f42c1"></i>
              <p class="mb-2">Aucune formation assignée pour le moment.</p>
              <small>Contactez l'administrateur pour obtenir des formations.</small>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .fdb-content {
      margin-left: 260px;
      background: #f4f6f8;
      min-height: 100vh;
    }
    .fdb-hero {
      background: linear-gradient(135deg, #4a148c 0%, #6f42c1 60%, #1e4d7b 100%);
      padding: 36px 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
      overflow: hidden;
    }
    .fdb-hero::before {
      content: '';
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at 70% 50%, rgba(255,255,255,0.07) 0%, transparent 60%);
    }
    .fdb-hero-inner { position: relative; z-index: 1; }
    .fdb-date {
      color: rgba(255,255,255,0.65);
      font-size: 0.82rem;
      margin-bottom: 8px;
      text-transform: capitalize;
    }
    .fdb-greeting {
      color: white;
      font-weight: 700;
      font-size: 1.6rem;
      margin-bottom: 4px;
    }
    .fdb-name { color: #c8b6ff; }
    .fdb-subtitle {
      color: rgba(255,255,255,0.6);
      font-size: 0.88rem;
      margin: 0;
    }
    .fdb-hero-deco {
      font-size: 6rem;
      color: rgba(255,255,255,0.08);
      position: relative;
      z-index: 1;
      line-height: 1;
    }
    .fdb-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 16px;
      padding: 24px 28px 0;
    }
    .stat-card {
      background: white;
      border-radius: 16px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
      border-left: 4px solid transparent;
      transition: transform 0.2s;
    }
    .stat-card:hover { transform: translateY(-3px); }
    .stat-purple { border-left-color: #6f42c1; }
    .stat-green  { border-left-color: #28a745; }
    .stat-blue   { border-left-color: #0d6efd; }
    .stat-orange { border-left-color: #fd7e14; }
    .stat-icon {
      width: 46px; height: 46px;
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.3rem;
    }
    .stat-purple .stat-icon { background: #f0e8ff; color: #6f42c1; }
    .stat-green  .stat-icon { background: #d4edda; color: #28a745; }
    .stat-blue   .stat-icon { background: #d0e8ff; color: #0d6efd; }
    .stat-orange .stat-icon { background: #fff0e0; color: #fd7e14; }
    .stat-value {
      font-size: 1.7rem;
      font-weight: 800;
      line-height: 1;
      color: #1a1a2e;
    }
    .stat-label {
      font-size: 0.78rem;
      color: #6c757d;
      margin-top: 2px;
    }
    .fdb-section {
      margin: 24px 28px;
      background: white;
      border-radius: 16px;
      padding: 20px 24px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    }
    .fdb-section-title {
      font-weight: 700;
      color: #1a1a2e;
      margin-bottom: 0;
      font-size: 0.95rem;
    }
    .fdb-formation-row {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 12px 0;
      border-bottom: 1px solid #f5f5f5;
    }
    .fdb-formation-row:last-child { border-bottom: none; }
    .fdb-formation-icon {
      width: 40px; height: 40px;
      border-radius: 10px;
      background: #f0e8ff;
      color: #6f42c1;
      display: flex; align-items: center; justify-content: center;
      font-size: 1rem;
      flex-shrink: 0;
    }
    .fdb-formation-info { flex: 1; }
    .fdb-statut-badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.72rem;
      font-weight: 700;
      white-space: nowrap;
    }
    .badge-en-cours   { background: #d4edda; color: #155724; }
    .badge-planifiee  { background: #fff3cd; color: #856404; }
    .badge-terminee   { background: #e2e3e5; color: #383d41; }
    .badge-annulee    { background: #f8d7da; color: #721c24; }
    .btn-outline-primary {
      border-color: #6f42c1;
      color: #6f42c1;
    }
    .btn-outline-primary:hover {
      background-color: #6f42c1;
      color: white;
    }
    .btn-outline-secondary {
      border-color: #6c757d;
      color: #6c757d;
    }
    .btn-outline-secondary:hover {
      background-color: #6c757d;
      color: white;
    }
  `]
})
export class FormateurDashboardComponent implements OnInit {

  formations: any[] = [];
  loading = true;
  today = new Date();
  prenom = '';
  greetingMsg = '';
  totalFormations = 0;
  totalMembres = 0;
  formationsEnCours = 0;
  formationsPlanifiees = 0;

  constructor(
    private formationService: FormationService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.prenom = user?.prenom || 'Formateur';
    this.greetingMsg = this.buildGreeting();
    this.loadDashboard();
  }

  buildGreeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Bonjour';
    if (h < 18) return 'Bon après-midi';
    return 'Bonsoir';
  }

  loadDashboard(): void {
    this.loading = true;
    this.totalMembres = 0;

    this.formationService.getMesFormations().subscribe({
      next: (mesFormations: any[]) => {
        this.formations = mesFormations;

        this.totalFormations = this.formations.length;
        this.formationsEnCours = this.formations.filter(f => f.statut === 'EN_COURS').length;
        this.formationsPlanifiees = this.formations.filter(f => f.statut === 'PLANIFIEE').length;

        this.totalMembres = this.formations.reduce(
          (sum: number, f: any) => sum + (f.totalInscrits || 0), 0
        );

        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des formations:', err);
        this.loading = false;
      }
    });
  }

  voirDetails(formationId: number): void {
    this.router.navigate(['/formateur/mes-formations']);
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

  badgeClass(statut: string): string {
    switch (statut) {
      case 'EN_COURS': return 'fdb-statut-badge badge-en-cours';
      case 'PLANIFIEE': return 'fdb-statut-badge badge-planifiee';
      case 'TERMINEE': return 'fdb-statut-badge badge-terminee';
      case 'ANNULEE': return 'fdb-statut-badge badge-annulee';
      default: return 'fdb-statut-badge badge-planifiee';
    }
  }

  getJourFormation(dateStr: string): string {
    if (!dateStr) return 'Jour à définir';
    const date = new Date(dateStr);
    const jours = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
    return 'Chaque ' + jours[date.getDay()];
  }
}
