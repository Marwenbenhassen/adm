import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ClubService } from '../../core/services/api.services';
import { AuthService } from '../../core/services/auth.service';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';

@Component({
  selector: 'app-mes-clubs',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent],
  template: `
    <div class="d-flex">
      <app-sidebar></app-sidebar>
      <div class="admin-content flex-grow-1">
        <div class="admin-topbar">
          <h4 class="fw-bold mb-0">
            <i class="bi bi-trophy-fill me-2 text-warning"></i>
            Mes Clubs
          </h4>
        </div>
        <div class="p-4">
          <div class="loading-spinner" *ngIf="loading">
            <div class="spinner"></div>
            <p>Chargement de vos clubs...</p>
          </div>

          <div class="clubs-grid" *ngIf="!loading && clubs.length > 0">
            <div class="club-card" *ngFor="let club of clubs">
              <div class="card-header">
                <i class="bi bi-trophy-fill"></i>
                <h3>{{ club.nom }}</h3>
                <span class="statut-badge">{{ club.statut || 'Actif' }}</span>
              </div>
              <div class="card-body">
                <p class="description">{{ club.description | slice:0:100 }}...</p>
                <div class="club-details">
                  <span class="detail"><i class="bi bi-tag"></i> {{ club.categorie }}</span>
                  <span class="detail"><i class="bi bi-people"></i> {{ club.capacite }} membres</span>
                  <span class="detail" *ngIf="club.prix > 0"><i class="bi bi-credit-card"></i> {{ club.prix }} DT/mois</span>
                  <span class="detail" *ngIf="club.prix === 0"><i class="bi bi-gift"></i> Gratuit</span>
                </div>
              </div>
            </div>
          </div>

          <div class="empty-state" *ngIf="!loading && clubs.length === 0">
            <i class="bi bi-trophy"></i>
            <h3>Aucun club</h3>
            <p>Vous n'êtes inscrit à aucun club pour le moment.</p>
            <a routerLink="/clubs" class="btn-action">Découvrir les clubs</a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-content { margin-left: 260px; background: #f4f6f8; min-height: 100vh; }
    .admin-topbar { background: white; padding: 20px 28px; border-bottom: 1px solid #f0f0f0; }
    .loading-spinner { text-align: center; padding: 50px; }
    .spinner { width: 40px; height: 40px; border: 3px solid #e2e8f0; border-top-color: #eab308; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 15px; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .clubs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; }
    .club-card { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.08); transition: transform 0.3s; }
    .club-card:hover { transform: translateY(-4px); box-shadow: 0 8px 25px rgba(0,0,0,0.1); }
    .card-header { background: linear-gradient(135deg, #b45309, #eab308); padding: 15px 20px; display: flex; align-items: center; gap: 10px; }
    .card-header i { font-size: 1.5rem; color: white; }
    .card-header h3 { color: white; margin: 0; font-size: 1.1rem; flex: 1; }
    .statut-badge { padding: 4px 12px; border-radius: 20px; font-size: 0.7rem; font-weight: 600; background: rgba(255,255,255,0.2); color: white; }
    .card-body { padding: 20px; }
    .description { color: #64748b; line-height: 1.5; margin-bottom: 15px; }
    .club-details { display: flex; flex-wrap: wrap; gap: 15px; padding-top: 10px; border-top: 1px solid #e2e8f0; }
    .detail { font-size: 0.75rem; color: #64748b; display: flex; align-items: center; gap: 5px; }
    .empty-state { text-align: center; padding: 60px 20px; background: #f8fafc; border-radius: 20px; }
    .empty-state i { font-size: 4rem; color: #cbd5e1; margin-bottom: 20px; }
    .empty-state h3 { color: #1e293b; margin-bottom: 10px; }
    .empty-state p { color: #64748b; margin-bottom: 20px; }
    .btn-action { display: inline-block; background: linear-gradient(135deg, #b45309, #eab308); color: white; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-weight: 500; transition: all 0.3s; }
    .btn-action:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
  `]
})
export class MesClubsComponent implements OnInit {
  clubs: any[] = [];
  loading = true;

  constructor(
    private clubService: ClubService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.clubService.getMesClubs().subscribe({
      next: (data) => {
        this.clubs = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement clubs:', err);
        this.loading = false;
      }
    });
  }
}