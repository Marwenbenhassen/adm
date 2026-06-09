import { Component, OnInit } from '@angular/core';
import { EvenementService, ActualiteService, FormationService, ClubService } from '../../core/services/api.services';
import { Evenement, Actualite, Formation } from '../../models/models';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  upcomingEvents: Evenement[] = [];
  latestNews: Actualite[] = [];
  formations: Formation[] = [];
  clubs: any[] = [];
  loading = true;

  stats = [
    { icon: 'bi-people-fill', value: '120+', label: 'Membres Actifs' },
    { icon: 'bi-calendar-check-fill', value: '45+', label: 'Événements Organisés' },
    { icon: 'bi-trophy-fill', value: '28', label: 'Projets Réalisés' },
    { icon: 'bi-clock-history', value: '10', label: "Années d'Existence" }
  ];

  constructor(
    private evenementService: EvenementService,
    private actualiteService: ActualiteService,
    private formationService: FormationService,
    private clubService: ClubService
  ) {}

  ngOnInit(): void {
    this.evenementService.getPublic().subscribe({
      next: events => {
        // Only A_VENIR and EN_COURS events
        this.upcomingEvents = events
          .filter(e => e.statut === 'A_VENIR' || e.statut === 'EN_COURS')
          .slice(0, 3);
      },
      error: () => this.upcomingEvents = []
    });

    this.actualiteService.getPublished().subscribe({
      next: news => {
        this.latestNews = news.slice(0, 3);
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });

    this.formationService.getPublic().subscribe({
      next: f => {
        // Only PLANIFIEE and EN_COURS formations
        this.formations = f
          .filter(fm => fm.statut === 'PLANIFIEE' || fm.statut === 'EN_COURS')
          .slice(0, 3);
      },
      error: () => {}
    });

    this.clubService.getPublic().subscribe({
      next: c => this.clubs = c.slice(0, 3),
      error: () => this.clubs = []
    });
  }

  formatDate(dateStr: string): { day: string; month: string } {
    if (!dateStr) return { day: '--', month: '---' };
    const d = new Date(dateStr);
    return {
      day: d.getDate().toString().padStart(2, '0'),
      month: d.toLocaleString('fr-FR', { month: 'short' }).toUpperCase()
    };
  }

  getStatusClass(statut?: string): string {
    const map: any = {
      'A_VENIR': 'badge-a_venir',
      'EN_COURS': 'badge-actif',
      'TERMINE': 'badge-termine',
      'ANNULE': 'badge-inactif'
    };
    return map[statut || ''] || 'badge-termine';
  }

  getFormationStatusClass(statut?: string): string {
    const map: any = {
      'PLANIFIEE': 'badge-planifiee',
      'EN_COURS': 'badge-en_cours',
      'TERMINEE': 'badge-terminee',
      'ANNULEE': 'badge-annulee'
    };
    return map[statut || ''] || 'badge-planifiee';
  }

  getFormationStatusLabel(statut?: string): string {
    const map: any = {
      'PLANIFIEE': 'À Venir',
      'EN_COURS': 'En Cours',
      'TERMINEE': 'Terminée',
      'ANNULEE': 'Annulée'
    };
    return map[statut || ''] || 'À Venir';
  }
}
