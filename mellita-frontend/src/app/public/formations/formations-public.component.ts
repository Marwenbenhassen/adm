import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormationService } from '../../core/services/api.services';
import { InscriptionButtonComponent } from '../../shared/inscription-button/inscription-button.component';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { FooterComponent } from '../../shared/footer/footer.component';

@Component({
  selector: 'app-formations-public',
  standalone: true,
  imports: [CommonModule, InscriptionButtonComponent, RouterLink, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>
    <!-- Page Header -->
    <div class="page-header">
      <div class="container text-center">
        <h1 class="fw-bold">Nos Formations</h1>
        <p class="text-white-50 mt-2">Découvrez nos programmes de formation professionnelle</p>
      </div>
    </div>

    <div class="container py-5">
      <div class="filters-row mb-5">
        <button class="filter-btn" [class.active]="activeFilter === 'ALL'" (click)="setFilter('ALL')">Tous</button>
        <button class="filter-btn" [class.active]="activeFilter === 'PLANIFIEE'" (click)="setFilter('PLANIFIEE')">À Venir</button>
        <button class="filter-btn" [class.active]="activeFilter === 'EN_COURS'" (click)="setFilter('EN_COURS')">En Cours</button>
        <button class="filter-btn" [class.active]="activeFilter === 'TERMINEE'" (click)="setFilter('TERMINEE')">Terminés</button>
      </div>

      <div class="text-center py-5" *ngIf="loading">
        <div class="spinner-border text-success" style="width:3rem;height:3rem"></div>
        <p class="text-muted mt-3">Chargement des formations...</p>
      </div>

      <div class="row g-4" *ngIf="!loading">
        <div class="col-md-6 col-lg-4" *ngFor="let formation of filteredFormations">
          <div class="pub-event-card">
            <div class="pec-header">
              <div class="pec-date">
                <span class="pec-day">{{ getDay(formation.dateDebut) }}</span>
                <span class="pec-month">{{ getMonth(formation.dateDebut) }}</span>
              </div>
              <span class="pec-statut {{ getStatutClass(formation.statut) }}">{{ getStatutLabel(formation.statut) }}</span>
            </div>
            <div class="pec-body">
              <h5 class="fw-bold mb-2">
                <a [routerLink]="['/formations', formation.id]" class="text-decoration-none text-dark stretched-link">{{ formation.titre }}</a>
              </h5>
              <p class="text-muted small">{{ (formation.description || formation.titre) | slice:0:120 }}...</p>
              <div class="pec-meta">
                <span *ngIf="formation.lieu"><i class="bi bi-geo-alt-fill text-success me-1"></i>{{ formation.lieu }}</span>
                <span *ngIf="formation.capaciteMax"><i class="bi bi-people-fill text-primary me-1"></i>{{ formation.capaciteMax }} places</span>
                <span [class.text-success]="formation.prix === 0" [class.text-warning]="formation.prix && formation.prix > 0">
                  <i class="bi bi-tag-fill me-1"></i>{{ formation.prix === 0 ? 'Gratuit' : formation.prix + ' TND' }}
                </span>
                <span *ngIf="formation.dureeHeures">
                  <i class="bi bi-clock-history me-1"></i>{{ formation.dureeHeures }}h
                </span>
              </div>
              <app-inscription-button 
                type="formation" 
                [entityId]="formation.id" 
                [entityTitle]="formation.titre">
              </app-inscription-button>
            </div>
            <div class="pec-footer">
              <span class="text-muted small"><i class="bi bi-calendar me-1"></i>{{ formatDate(formation.dateDebut) }}</span>
            </div>
          </div>
        </div>

        <div class="col-12 text-center py-5" *ngIf="filteredFormations.length === 0">
          <i class="bi bi-mortarboard" style="font-size:4rem;color:#dee2e6"></i>
          <p class="text-muted mt-3 fs-5">Aucune formation dans cette catégorie</p>
        </div>
      </div>
    </div>
    <app-footer></app-footer>
  `,
  styles: [`
    .page-header { background: linear-gradient(135deg, #0f4024, #1a6b3c); color: white; padding: 80px 0 60px; }
    .filters-row { display: flex; gap: 8px; flex-wrap: wrap; }
    .filter-btn { background: white; border: 2px solid #e0e0e0; color: #6c757d; padding: 8px 20px; border-radius: 50px; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; }
    .filter-btn:hover, .filter-btn.active { background: #1a6b3c; color: white; border-color: #1a6b3c; }
    .pub-event-card { background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.06); transition: all 0.3s; display: flex; flex-direction: column; position: relative; }
    .pub-event-card:hover { transform: translateY(-6px); box-shadow: 0 12px 40px rgba(0,0,0,0.12); }
    .pec-header { background: linear-gradient(135deg, #0f4024, #1a6b3c); padding: 20px; display: flex; justify-content: space-between; align-items: flex-start; }
    .pec-date { text-align: center; color: white; }
    .pec-day { font-size: 2.2rem; font-weight: 900; display: block; line-height: 1; }
    .pec-month { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1px; opacity: 0.8; }
    .pec-statut { padding: 4px 12px; border-radius: 20px; font-size: 0.72rem; font-weight: 700; background: rgba(255,255,255,0.2); color: white; }
    .pec-statut.planifiee { background: rgba(100,200,255,0.25); }
    .pec-statut.en_cours { background: rgba(100,255,100,0.25); }
    .pec-statut.terminee { background: rgba(200,200,200,0.25); }
    .pec-statut.annulee { background: rgba(255,100,100,0.25); }
    .pec-body { padding: 20px; flex-grow: 1; }
    .pec-meta { display: flex; flex-wrap: wrap; gap: 10px; font-size: 0.82rem; color: #6c757d; margin-top: 12px; }
    .pec-footer { padding: 12px 20px; border-top: 1px solid #f0f0f0; display: flex; justify-content: flex-start; align-items: center; }
    .stretched-link::after { position: absolute; top: 0; right: 0; bottom: 0; left: 0; z-index: 1; content: ""; }
  `]
})
export class FormationsPublicComponent implements OnInit {
  formations: any[] = [];
  filteredFormations: any[] = [];
  loading = true;
  activeFilter = 'ALL';

  constructor(private formationService: FormationService) {}

  ngOnInit(): void {
    this.loadFormations();
  }

  loadFormations(): void {
    this.loading = true;
    this.formationService.getPublic().subscribe({
      next: (data) => {
        this.formations = data || [];
        this.filteredFormations = this.formations;
        this.loading = false;
      },
      error: (err) => {
        this.formations = [];
        this.filteredFormations = [];
        this.loading = false;
      }
    });
  }

  setFilter(filter: string): void {
    this.activeFilter = filter;
    if (filter === 'ALL') {
      this.filteredFormations = this.formations;
    } else {
      this.filteredFormations = this.formations.filter(f => f.statut === filter);
    }
  }

  getDay(date: string): string { 
    return date ? new Date(date).getDate().toString().padStart(2, '0') : '--'; 
  }
  
  getMonth(date: string): string { 
    return date ? new Date(date).toLocaleString('fr-FR', { month: 'short' }).toUpperCase() : '---'; 
  }

  formatDate(date: string): string {
    if (!date) return 'Date non définie';
    return new Date(date).toLocaleDateString('fr-FR');
  }

  getStatutLabel(statut: string): string {
    switch(statut) {
      case 'PLANIFIEE': return 'À Venir';
      case 'EN_COURS': return 'En Cours';
      case 'TERMINEE': return 'Terminé';
      case 'ANNULEE': return 'Annulé';
      default: return statut || 'Planifiée';
    }
  }

  getStatutClass(statut: string): string {
    if (!statut) return 'planifiee';
    return statut.toLowerCase();
  }
}