import { Component, OnInit } from '@angular/core';
import { ActualiteService, FormationService, EvenementService, ClubService } from '../../core/services/api.services';
import { Actualite } from '../../models/models';

interface FeedItem {
  type: 'actualite' | 'formation' | 'evenement' | 'club';
  titre: string;
  description: string;
  date: string;
  statut?: string;
  icon: string;
  color: string;
  badgeLabel: string;
  badgeClass: string;
  id?: number;
}

@Component({
  selector: 'app-news-public',
  template: `
    <app-navbar></app-navbar>

    <div class="page-header">
      <div class="container text-center">
        <h1 class="fw-bold">Actualités & Nouveautés</h1>
        <p class="text-white-50 mt-2">Formations, événements, clubs et nouvelles de l'association</p>
      </div>
    </div>

    <div class="container py-5">
      <!-- Search -->
      <div class="row justify-content-center mb-4">
        <div class="col-md-6">
          <div class="search-wrap">
            <i class="bi bi-search search-icon"></i>
            <input type="text" class="form-control search-input" placeholder="Rechercher..."
                   [(ngModel)]="searchTerm" (input)="filterItems()">
          </div>
        </div>
      </div>

      <!-- Type Filters -->
      <div class="filters-row mb-5">
        <button class="filter-btn" [class.active]="activeType === 'ALL'" (click)="setType('ALL')">
          <i class="bi bi-grid me-1"></i>Tout
        </button>
        <!-- BOUTON ACTUALITÉS SUPPRIMÉ -->
        <button class="filter-btn" [class.active]="activeType === 'formation'" (click)="setType('formation')">
          <i class="bi bi-mortarboard me-1"></i>Formations
        </button>
        <button class="filter-btn" [class.active]="activeType === 'evenement'" (click)="setType('evenement')">
          <i class="bi bi-calendar-event me-1"></i>Événements
        </button>
        <button class="filter-btn" [class.active]="activeType === 'club'" (click)="setType('club')">
          <i class="bi bi-people me-1"></i>Clubs
        </button>
      </div>

      <div class="text-center py-5" *ngIf="loading">
        <div class="spinner-border text-success" style="width:3rem;height:3rem"></div>
        <p class="text-muted mt-3">Chargement des actualités...</p>
      </div>

      <div *ngIf="!loading">
        <!-- Featured top item -->
        <div class="row mb-5" *ngIf="displayItems.length > 0">
          <div class="col-lg-8">
            <div class="featured-news-card" *ngIf="displayItems[0] as featured">
              <div class="fn-img-placeholder" [style.background]="featured.color">
                <i class="bi {{ featured.icon }}"></i>
              </div>
              <div class="fn-content">
                <span class="fn-cat badge {{ featured.badgeClass }}">{{ featured.badgeLabel }}</span>
                <h2 class="fw-bold mt-2">{{ featured.titre }}</h2>
                <p class="text-muted">{{ featured.description | slice:0:250 }}...</p>
                <div class="d-flex align-items-center gap-3 mt-3">
                  <small class="text-muted"><i class="bi bi-clock me-1"></i>{{ featured.date | date:'dd MMMM yyyy' }}</small>
                  <a *ngIf="featured.type === 'formation' && featured.id"
                     [routerLink]="['/formations', featured.id]"
                     class="btn btn-sm btn-mellita-sm">Voir détails <i class="bi bi-arrow-right ms-1"></i></a>
                  <a *ngIf="featured.type === 'evenement'"
                     routerLink="/events"
                     class="btn btn-sm btn-mellita-sm">Voir événements <i class="bi bi-arrow-right ms-1"></i></a>
                </div>
              </div>
            </div>
          </div>
          <div class="col-lg-4">
            <h6 class="fw-bold text-muted mb-3 text-uppercase" style="letter-spacing:1px;font-size:0.75rem">Autres Nouveautés</h6>
            <div class="side-news-item" *ngFor="let n of displayItems.slice(1, 5)">
              <div class="d-flex align-items-center gap-2 mb-1">
                <span class="badge {{ n.badgeClass }} rounded-pill">{{ n.badgeLabel }}</span>
              </div>
              <h6 class="fw-bold mb-1">{{ n.titre }}</h6>
              <small class="text-muted"><i class="bi bi-clock me-1"></i>{{ n.date | date:'dd/MM/yyyy' }}</small>
            </div>
          </div>
        </div>

        <!-- Grid -->
        <div class="row g-4" *ngIf="displayItems.length > 5">
          <div class="col-12 mb-2">
            <h5 class="fw-bold">Toutes les Nouveautés</h5>
          </div>
          <div class="col-md-6 col-lg-4" *ngFor="let n of displayItems.slice(5)">
            <div class="news-grid-card">
              <div class="ngc-img" [style.background]="n.color">
                <i class="bi {{ n.icon }}"></i>
              </div>
              <div class="ngc-body">
                <span class="badge {{ n.badgeClass }} rounded-pill mb-2">{{ n.badgeLabel }}</span>
                <h6 class="fw-bold mt-1">{{ n.titre }}</h6>
                <p class="text-muted small">{{ n.description | slice:0:100 }}...</p>
                <div class="d-flex justify-content-between align-items-center mt-2">
                  <small class="text-muted"><i class="bi bi-clock me-1"></i>{{ n.date | date:'dd/MM/yyyy' }}</small>
                  <a *ngIf="n.type === 'formation' && n.id"
                     [routerLink]="['/formations', n.id]"
                     class="btn btn-sm btn-link text-success p-0">Détails →</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="text-center py-5" *ngIf="displayItems.length === 0">
          <i class="bi bi-inbox" style="font-size:4rem;color:#dee2e6"></i>
          <p class="text-muted mt-3 fs-5">Aucune nouveauté trouvée</p>
        </div>
      </div>
    </div>

    <app-footer></app-footer>
  `,
  styles: [`
    .page-header { background: linear-gradient(135deg, #1e4d7b, #1a6b3c); color: white; padding: 80px 0 60px; }
    .search-wrap { position: relative; }
    .search-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: #adb5bd; z-index: 2; font-size: 1.1rem; }
    .search-input { padding-left: 46px; height: 52px; border-radius: 14px; border: 2px solid #e0e0e0; font-size: 1rem; }
    .search-input:focus { border-color: #1a6b3c; box-shadow: 0 0 0 0.2rem rgba(26,107,60,0.15); }

    .filters-row { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; }
    .filter-btn { background: white; border: 2px solid #e0e0e0; color: #6c757d; padding: 8px 20px; border-radius: 50px; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; }
    .filter-btn:hover, .filter-btn.active { background: #1a6b3c; color: white; border-color: #1a6b3c; }

    .featured-news-card { background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .fn-img-placeholder { height: 240px; display: flex; align-items: center; justify-content: center; font-size: 5rem; color: rgba(255,255,255,0.4); }
    .fn-content { padding: 28px; }
    .fn-cat { font-size: 0.8rem; font-weight: 700; }
    .fn-content h2 { font-size: 1.5rem; }

    .side-news-item { background: white; border-radius: 14px; padding: 16px; margin-bottom: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); transition: all 0.2s; cursor: pointer; }
    .side-news-item:hover { transform: translateX(4px); }

    .news-grid-card { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.06); transition: all 0.3s; }
    .news-grid-card:hover { transform: translateY(-4px); box-shadow: 0 8px 25px rgba(0,0,0,0.1); }
    .ngc-img { height: 140px; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; color: rgba(255,255,255,0.4); }
    .ngc-body { padding: 18px; }

    .btn-mellita-sm { background: linear-gradient(135deg, #1a6b3c, #2d9e5f); color: white; border: none; border-radius: 8px; padding: 6px 16px; font-weight: 600; }
    .btn-mellita-sm:hover { color: white; opacity: 0.9; }
  `]
})
export class NewsPublicComponent implements OnInit {
  allItems: FeedItem[] = [];
  filteredItems: FeedItem[] = [];
  displayItems: FeedItem[] = [];
  loading = true;
  searchTerm = '';
  activeType = 'ALL';

  private loadedCount = 0;
  private totalSources = 4;

  constructor(
    private newsService: ActualiteService,
    private formationService: FormationService,
    private evenementService: EvenementService,
    private clubService: ClubService
  ) {}

  ngOnInit(): void {
    this.loadedCount = 0;

    this.newsService.getPublished().subscribe({
      next: items => {
        const mapped: FeedItem[] = (items || []).map(n => ({
          type: 'actualite' as const,
          titre: n.titre,
          description: n.contenu,
          date: n.createdAt,
          icon: 'bi-newspaper',
          color: 'linear-gradient(135deg, #0f4024, #1e4d7b)',
          badgeLabel: 'Actualité',
          badgeClass: 'bg-success text-white'
        }));
        this.allItems.push(...mapped);
        this.checkDone();
      },
      error: () => this.checkDone()
    });

    this.formationService.getPublic().subscribe({
      next: items => {
        const mapped: FeedItem[] = (items || []).map(f => ({
          type: 'formation' as const,
          titre: f.titre,
          description: f.description || f.titre,
          date: f.dateDebut || (f as any).createdAt || new Date().toISOString(),
          statut: f.statut,
          icon: 'bi-mortarboard',
          color: 'linear-gradient(135deg, #1e4d7b, #2a6fa8)',
          badgeLabel: this.getFormationLabel(f.statut),
          badgeClass: this.getFormationBadgeClass(f.statut),
          id: f.id
        }));
        this.allItems.push(...mapped);
        this.checkDone();
      },
      error: () => this.checkDone()
    });

    this.evenementService.getPublic().subscribe({
      next: items => {
        const mapped: FeedItem[] = (items || []).map(e => ({
          type: 'evenement' as const,
          titre: e.titre,
          description: e.description,
          date: e.dateDebut,
          statut: e.statut,
          icon: 'bi-calendar-event',
          color: 'linear-gradient(135deg, #c8a84b, #e5c96e)',
          badgeLabel: 'Événement',
          badgeClass: 'bg-warning text-dark'
        }));
        this.allItems.push(...mapped);
        this.checkDone();
      },
      error: () => this.checkDone()
    });

    this.clubService.getPublic().subscribe({
      next: items => {
        const mapped: FeedItem[] = (items || []).map(c => ({
          type: 'club' as const,
          titre: c.nom,
          description: c.description || c.nom,
          date: c.createdAt || new Date().toISOString(),
          icon: 'bi-people-fill',
          color: 'linear-gradient(135deg, #6f42c1, #9563e0)',
          badgeLabel: 'Club',
          badgeClass: 'bg-purple text-white',
          id: c.id
        }));
        this.allItems.push(...mapped);
        this.checkDone();
      },
      error: () => this.checkDone()
    });
  }

  private checkDone(): void {
    this.loadedCount++;
    if (this.loadedCount >= this.totalSources) {
      // Sort by date desc
      this.allItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      this.filteredItems = [...this.allItems];
      this.displayItems = [...this.filteredItems];
      this.loading = false;
    }
  }

  setType(type: string): void {
    this.activeType = type;
    this.applyFilters();
  }

  filterItems(): void {
    this.applyFilters();
  }

  private applyFilters(): void {
    let result = [...this.allItems];
    if (this.activeType !== 'ALL') {
      result = result.filter(i => i.type === this.activeType);
    }
    if (this.searchTerm.trim()) {
      const s = this.searchTerm.toLowerCase();
      result = result.filter(i =>
        i.titre.toLowerCase().includes(s) ||
        i.description.toLowerCase().includes(s)
      );
    }
    this.displayItems = result;
  }

  getFormationLabel(statut: string): string {
    const map: any = { 'PLANIFIEE': 'Formation à venir', 'EN_COURS': 'Formation en cours', 'TERMINEE': 'Formation terminée', 'ANNULEE': 'Formation annulée' };
    return map[statut] || 'Formation';
  }

  getFormationBadgeClass(statut: string): string {
    const map: any = { 'PLANIFIEE': 'bg-primary text-white', 'EN_COURS': 'bg-success text-white', 'TERMINEE': 'bg-secondary text-white', 'ANNULEE': 'bg-danger text-white' };
    return map[statut] || 'bg-primary text-white';
  }
}