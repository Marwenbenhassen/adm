import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EvenementService } from '../../core/services/api.services';
import { AuthService } from '../../core/services/auth.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-mes-evenements',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="mes-evenements">
      <div class="header">
        <h2>📅 Mes Événements</h2>
        <p>Retrouvez ici tous les événements auxquels vous êtes inscrit</p>
      </div>

      <div class="loading-spinner" *ngIf="loading">
        <div class="spinner"></div>
        <p>Chargement de vos événements...</p>
      </div>

      <div class="events-grid" *ngIf="!loading && events.length > 0">
        <div class="event-card" *ngFor="let event of events">
          <div class="card-header">
            <h3>{{ event.titre }}</h3>
            <span class="statut-badge" [class]="event.statut?.toLowerCase()">
              {{ event.statut?.replace('_', ' ') }}
            </span>
          </div>
          <div class="card-body">
            <p class="description">{{ event.description | slice:0:100 }}...</p>
            <div class="event-details">
              <span class="detail"><i class="bi bi-calendar"></i> {{ event.dateDebut | date:'dd/MM/yyyy' }}</span>
              <span class="detail"><i class="bi bi-geo-alt"></i> {{ event.lieu }}</span>
              <span class="detail" [class.paye]="event.statutPaiement === 'PAYE'" [class.en-attente]="event.statutPaiement === 'EN_ATTENTE'">
                <i class="bi bi-credit-card"></i> {{ event.statutPaiement === 'PAYE' ? 'Payé' : 'En attente' }}
              </span>
              <span class="detail" [class.present]="event.presence" [class.absent]="!event.presence">
                <i class="bi bi-person-check"></i> {{ event.presence ? 'Présent' : 'Absent' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="empty-state" *ngIf="!loading && events.length === 0">
        <i class="bi bi-calendar-x"></i>
        <h3>Aucun événement</h3>
        <p>Vous n'êtes inscrit à aucun événement pour le moment.</p>
        <a routerLink="/events" class="btn-action">Découvrir les événements</a>
      </div>
    </div>
  `,
  styles: [`
    .mes-evenements { padding: 20px; max-width: 1200px; margin: 0 auto; }
    .header { margin-bottom: 30px; }
    .header h2 { color: #1e293b; margin-bottom: 5px; }
    .header p { color: #64748b; }
    .loading-spinner { text-align: center; padding: 50px; }
    .spinner { width: 40px; height: 40px; border: 3px solid #e2e8f0; border-top-color: #1a6b3c; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 15px; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .events-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; }
    .event-card { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.08); transition: transform 0.3s; }
    .event-card:hover { transform: translateY(-4px); box-shadow: 0 8px 25px rgba(0,0,0,0.1); }
    .card-header { background: linear-gradient(135deg, #0f4024, #1a6b3c); padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; }
    .card-header h3 { color: white; margin: 0; font-size: 1.1rem; }
    .statut-badge { padding: 4px 12px; border-radius: 20px; font-size: 0.7rem; font-weight: 600; background: rgba(255,255,255,0.2); color: white; }
    .card-body { padding: 20px; }
    .description { color: #64748b; line-height: 1.5; margin-bottom: 15px; }
    .event-details { display: flex; flex-wrap: wrap; gap: 15px; padding-top: 10px; border-top: 1px solid #e2e8f0; }
    .detail { font-size: 0.75rem; color: #64748b; display: flex; align-items: center; gap: 5px; }
    .detail.paye { color: #22c55e; }
    .detail.en-attente { color: #f59e0b; }
    .detail.present { color: #22c55e; }
    .detail.absent { color: #ef4444; }
    .empty-state { text-align: center; padding: 60px 20px; background: #f8fafc; border-radius: 20px; }
    .empty-state i { font-size: 4rem; color: #cbd5e1; margin-bottom: 20px; }
    .empty-state h3 { color: #1e293b; margin-bottom: 10px; }
    .empty-state p { color: #64748b; margin-bottom: 20px; }
    .btn-action { display: inline-block; background: linear-gradient(135deg, #1a6b3c, #2d9e5f); color: white; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-weight: 500; transition: all 0.3s; }
    .btn-action:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
  `]
})
export class MesEvenementsComponent implements OnInit {
  events: any[] = [];
  loading = true;

  constructor(
    private evenementService: EvenementService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.evenementService.getMesEvenements().subscribe({
      next: (data) => {
        this.events = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement événements:', err);
        this.loading = false;
      }
    });
  }
}