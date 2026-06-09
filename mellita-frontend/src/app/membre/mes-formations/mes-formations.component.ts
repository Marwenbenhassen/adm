import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormationService } from '../../core/services/api.services';
import { AuthService } from '../../core/services/auth.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-mes-formations',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="mes-formations">
      <div class="header">
        <h2>🎓 Mes Formations</h2>
        <p>Retrouvez ici toutes les formations auxquelles vous êtes inscrit</p>
      </div>

      <div class="loading-spinner" *ngIf="loading">
        <div class="spinner"></div>
        <p>Chargement de vos formations...</p>
      </div>

      <div class="formations-grid" *ngIf="!loading && formations.length > 0">
        <div class="formation-card" *ngFor="let formation of formations">
          <div class="card-header">
            <h3>{{ formation.titre }}</h3>
            <span class="statut-badge" [class]="formation.statut?.toLowerCase()">
              {{ formation.statut }}
            </span>
          </div>
          <div class="card-body">
            <p class="description">{{ formation.description | slice:0:100 }}...</p>
            <div class="formation-details">
              <span class="detail"><i class="bi bi-calendar"></i> {{ formation.dateDebut | date:'dd/MM/yyyy' }}</span>
              <span class="detail"><i class="bi bi-clock"></i> {{ formation.dureeHeures }}h</span>
              <span class="detail"><i class="bi bi-geo-alt"></i> {{ formation.lieu }}</span>
              <span class="detail" [class.paye]="formation.statutPaiement === 'PAYE'" [class.en-attente]="formation.statutPaiement === 'EN_ATTENTE'">
                <i class="bi bi-credit-card"></i> {{ formation.statutPaiement === 'PAYE' ? 'Payé' : 'En attente' }}
              </span>
              <span class="detail" [class.present]="formation.presence" [class.absent]="!formation.presence">
                <i class="bi bi-person-check"></i> {{ formation.presence ? 'Présent' : 'Absent' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="empty-state" *ngIf="!loading && formations.length === 0">
        <i class="bi bi-mortarboard"></i>
        <h3>Aucune formation</h3>
        <p>Vous n'êtes inscrit à aucune formation pour le moment.</p>
        <a routerLink="/formations" class="btn-action">Découvrir les formations</a>
      </div>
    </div>
  `,
  styles: [`
    .mes-formations { padding: 20px; max-width: 1200px; margin: 0 auto; }
    .header { margin-bottom: 30px; }
    .header h2 { color: #1e293b; margin-bottom: 5px; }
    .header p { color: #64748b; }
    .loading-spinner { text-align: center; padding: 50px; }
    .spinner { width: 40px; height: 40px; border: 3px solid #e2e8f0; border-top-color: #6f42c1; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 15px; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .formations-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; }
    .formation-card { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.08); transition: transform 0.3s; }
    .formation-card:hover { transform: translateY(-4px); box-shadow: 0 8px 25px rgba(0,0,0,0.1); }
    .card-header { background: linear-gradient(135deg, #4a148c, #6f42c1); padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; }
    .card-header h3 { color: white; margin: 0; font-size: 1.1rem; }
    .statut-badge { padding: 4px 12px; border-radius: 20px; font-size: 0.7rem; font-weight: 600; background: rgba(255,255,255,0.2); color: white; }
    .card-body { padding: 20px; }
    .description { color: #64748b; line-height: 1.5; margin-bottom: 15px; }
    .formation-details { display: flex; flex-wrap: wrap; gap: 15px; padding-top: 10px; border-top: 1px solid #e2e8f0; }
    .detail { font-size: 0.75rem; color: #64748b; display: flex; align-items: center; gap: 5px; }
    .detail.paye { color: #22c55e; }
    .detail.en-attente { color: #f59e0b; }
    .detail.present { color: #22c55e; }
    .detail.absent { color: #ef4444; }
    .empty-state { text-align: center; padding: 60px 20px; background: #f8fafc; border-radius: 20px; }
    .empty-state i { font-size: 4rem; color: #cbd5e1; margin-bottom: 20px; }
    .empty-state h3 { color: #1e293b; margin-bottom: 10px; }
    .empty-state p { color: #64748b; margin-bottom: 20px; }
    .btn-action { display: inline-block; background: linear-gradient(135deg, #4a148c, #6f42c1); color: white; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-weight: 500; transition: all 0.3s; }
    .btn-action:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
  `]
})
export class MesFormationsComponent implements OnInit {
  formations: any[] = [];
  loading = true;

  constructor(
    private formationService: FormationService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.formationService.getMesFormations().subscribe({
      next: (data) => {
        this.formations = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement formations:', err);
        this.loading = false;
      }
    });
  }
}