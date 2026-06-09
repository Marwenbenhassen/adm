import { Component, OnInit } from '@angular/core';
import { ClubService } from '../core/services/api.services';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-animateur-dashboard',
  template: `
    <div class="d-flex">
      <app-sidebar></app-sidebar>

      <div class="adb-content flex-grow-1">

        <!-- ── Hero salutation ── -->
        <div class="adb-hero">
          <div class="adb-hero-inner">
            <div class="adb-date">
              <i class="bi bi-calendar3 me-2"></i>{{ today | date:'EEEE d MMMM yyyy' }}
            </div>
            <h2 class="adb-greeting">
              {{ greetingMsg }}, <span class="adb-name">{{ prenom }}</span> 👋
            </h2>
            <p class="adb-subtitle">Voici un aperçu de vos clubs</p>
          </div>
          <div class="adb-hero-deco">
            <i class="bi bi-trophy-fill"></i>
          </div>
        </div>

        <!-- ── Cartes stats ── -->
        <div class="adb-stats">

          <div class="stat-card stat-pink">
            <div class="stat-icon"><i class="bi bi-trophy-fill"></i></div>
            <div class="stat-body">
              <div class="stat-value">{{ totalClubs }}</div>
              <div class="stat-label">Clubs assignés</div>
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
              <div class="stat-value">{{ clubsActifs }}</div>
              <div class="stat-label">Clubs actifs</div>
            </div>
          </div>

          <div class="stat-card stat-purple">
            <div class="stat-icon"><i class="bi bi-clipboard-check-fill"></i></div>
            <div class="stat-body">
              <div class="stat-value">{{ totalSeances }}</div>
              <div class="stat-label">Séances enregistrées</div>
            </div>
          </div>

        </div>

        <!-- ── Liste clubs récents ── -->
        <div class="adb-section">
          <h6 class="adb-section-title">
            <i class="bi bi-list-ul me-2"></i>Mes clubs
          </h6>

          <div *ngIf="loading" class="text-center py-5">
            <div class="spinner-border" style="color:#e83e8c"></div>
          </div>

          <div *ngIf="!loading">
            <div class="adb-club-row" *ngFor="let c of clubs">
              <div class="adb-club-icon">
                <i class="bi bi-trophy-fill"></i>
              </div>
              <div class="adb-club-info">
                <div class="fw-semibold">{{ c.nom }}</div>
                <small class="text-muted">
                  <i class="bi bi-geo-alt me-1"></i>{{ c.lieu || 'À définir' }}
                  &nbsp;·&nbsp;
                  <i class="bi bi-clock me-1"></i>{{ c.horaire || '—' }}
                  &nbsp;·&nbsp;
                  <i class="bi bi-people me-1"></i>{{ c.totalInscrits || 0 }} inscrit(s)
                </small>
              </div>
              <span class="adb-statut-badge" [ngClass]="badgeClass(c.statut)">
                {{ c.statut }}
              </span>
            </div>

            <div class="text-center text-muted py-4" *ngIf="clubs.length === 0">
              <i class="bi bi-trophy fs-2 d-block mb-2" style="color:#e83e8c"></i>
              Aucun club ne vous est assigné pour le moment.
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .adb-content {
      margin-left: 260px;
      background: #f4f6f8;
      min-height: 100vh;
    }

    /* ── Hero ── */
    .adb-hero {
      background: linear-gradient(135deg, #880e4f 0%, #e83e8c 55%, #4a148c 100%);
      padding: 36px 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
      overflow: hidden;
    }
    .adb-hero::before {
      content: '';
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at 70% 50%, rgba(255,255,255,0.07) 0%, transparent 60%);
    }
    .adb-hero-inner { position: relative; z-index: 1; }
    .adb-date {
      color: rgba(255,255,255,0.65);
      font-size: 0.82rem;
      margin-bottom: 8px;
      text-transform: capitalize;
    }
    .adb-greeting {
      color: white;
      font-weight: 700;
      font-size: 1.6rem;
      margin-bottom: 4px;
    }
    .adb-name { color: #ffd6ec; }
    .adb-subtitle {
      color: rgba(255,255,255,0.6);
      font-size: 0.88rem;
      margin: 0;
    }
    .adb-hero-deco {
      font-size: 6rem;
      color: rgba(255,255,255,0.08);
      position: relative;
      z-index: 1;
      line-height: 1;
    }

    /* ── Stats ── */
    .adb-stats {
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
    .stat-pink   { border-left-color: #e83e8c; }
    .stat-green  { border-left-color: #28a745; }
    .stat-blue   { border-left-color: #0d6efd; }
    .stat-purple { border-left-color: #6f42c1; }
    .stat-icon {
      width: 46px; height: 46px;
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.3rem;
    }
    .stat-pink   .stat-icon { background: #fce4ec; color: #e83e8c; }
    .stat-green  .stat-icon { background: #d4edda; color: #28a745; }
    .stat-blue   .stat-icon { background: #d0e8ff; color: #0d6efd; }
    .stat-purple .stat-icon { background: #f0e8ff; color: #6f42c1; }
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

    /* ── Section clubs ── */
    .adb-section {
      margin: 24px 28px;
      background: white;
      border-radius: 16px;
      padding: 20px 24px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    }
    .adb-section-title {
      font-weight: 700;
      color: #1a1a2e;
      margin-bottom: 16px;
      font-size: 0.95rem;
    }
    .adb-club-row {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 12px 0;
      border-bottom: 1px solid #f5f5f5;
    }
    .adb-club-row:last-child { border-bottom: none; }
    .adb-club-icon {
      width: 40px; height: 40px;
      border-radius: 10px;
      background: #fce4ec;
      color: #e83e8c;
      display: flex; align-items: center; justify-content: center;
      font-size: 1rem;
      flex-shrink: 0;
    }
    .adb-club-info { flex: 1; }
    .adb-statut-badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.72rem;
      font-weight: 700;
      white-space: nowrap;
    }
    .badge-actif    { background: #d4edda; color: #155724; }
    .badge-inactif  { background: #e2e3e5; color: #383d41; }
    .badge-suspendu { background: #f8d7da; color: #721c24; }
  `]
})
export class AnimateurDashboardComponent implements OnInit {

  clubs:        any[] = [];
  loading       = true;
  today         = new Date();
  prenom        = '';
  greetingMsg   = '';
  totalClubs    = 0;
  totalMembres  = 0;
  clubsActifs   = 0;
  totalSeances  = 0;

  constructor(
    private clubService: ClubService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user   = this.authService.getCurrentUser();
    this.prenom  = user?.prenom || 'Animateur';
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
    this.clubService.getMesClubs().subscribe({
      next: (clubs: any[]) => {
        this.clubs       = clubs;
        this.totalClubs  = clubs.length;
        this.clubsActifs = clubs.filter(c => c.statut === 'ACTIF').length;

        // Compter membres et séances sur tous les clubs
        let loaded = 0;
        if (clubs.length === 0) { this.loading = false; return; }

        clubs.forEach(c => {
          this.clubService.getMembres(c.id).subscribe({
            next: (membres: any[]) => {
              this.totalMembres += membres.length;
              c.totalInscrits = membres.length;
              loaded++;
              if (loaded === clubs.length) this.loading = false;
            },
            error: () => { loaded++; if (loaded === clubs.length) this.loading = false; }
          });
        });

        // Séances : utiliser getPresences sur chaque club
        clubs.forEach(c => {
          this.clubService.getPresences(c.id).subscribe({
            next: (p: any[]) => { this.totalSeances += p.length; },
            error: () => {}
          });
        });
      },
      error: () => { this.loading = false; }
    });
  }

  badgeClass(statut: string): string {
    switch (statut) {
      case 'ACTIF':    return 'adb-statut-badge badge-actif';
      case 'INACTIF':  return 'adb-statut-badge badge-inactif';
      case 'SUSPENDU': return 'adb-statut-badge badge-suspendu';
      default:         return 'adb-statut-badge badge-inactif';
    }
  }
}
