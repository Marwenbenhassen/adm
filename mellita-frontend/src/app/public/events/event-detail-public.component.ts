import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EvenementService } from '../../core/services/api.services';
import { InscriptionButtonComponent } from '../../shared/inscription-button/inscription-button.component';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { FooterComponent } from '../../shared/footer/footer.component';

@Component({
  selector: 'app-event-detail-public',
  standalone: true,
  imports: [CommonModule, RouterLink, InscriptionButtonComponent, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>
    <div class="container py-5">
      <div *ngIf="loading" class="text-center py-5">
        <div class="spinner-border text-success" style="width: 3rem; height: 3rem;"></div>
        <p class="text-muted mt-3">Chargement de l'événement...</p>
      </div>

      <div *ngIf="!loading && event" class="event-detail">
        <nav aria-label="breadcrumb" class="mb-4">
          <ol class="breadcrumb">
            <li class="breadcrumb-item"><a routerLink="/" class="text-decoration-none">Accueil</a></li>
            <li class="breadcrumb-item"><a routerLink="/events" class="text-decoration-none">Événements</a></li>
            <li class="breadcrumb-item active" aria-current="page">{{ event.titre }}</li>
          </ol>
        </nav>

        <div class="cover-image mb-4" *ngIf="event.image">
          <img [src]="event.image" class="img-fluid w-100 rounded" style="max-height: 400px; object-fit: cover;" onerror="this.src='assets/images/event-placeholder.jpg'">
        </div>

        <h1 class="fw-bold mb-3">{{ event.titre }}</h1>
        <h2 class="text-muted mb-4" *ngIf="event.titreAr" dir="rtl">{{ event.titreAr }}</h2>

        <div class="mb-3">
          <span class="badge-statut {{ getStatutClass(event.statut) }}">{{ getStatutLabel(event.statut) }}</span>
        </div>

        <div class="info-cards row g-3 mb-4">
          <div class="col-md-3 col-sm-6">
            <div class="card text-center p-3 h-100">
              <i class="bi bi-calendar-event fs-2 text-success"></i>
              <div class="fw-bold mt-2">Date</div>
              <small>{{ formatDate(event.dateDebut) }} - {{ formatDate(event.dateFin) }}</small>
            </div>
          </div>
          <div class="col-md-3 col-sm-6">
            <div class="card text-center p-3 h-100">
              <i class="bi bi-geo-alt fs-2 text-danger"></i>
              <div class="fw-bold mt-2">Lieu</div>
              <small>{{ event.lieu || 'Non spécifié' }}</small>
            </div>
          </div>
          <div class="col-md-3 col-sm-6">
            <div class="card text-center p-3 h-100">
              <i class="bi bi-clock fs-2 text-warning"></i>
              <div class="fw-bold mt-2">Horaires</div>
              <small>{{ formatTime(event.dateDebut) }} - {{ formatTime(event.dateFin) }}</small>
            </div>
          </div>
          <div class="col-md-3 col-sm-6">
            <div class="card text-center p-3 h-100">
              <i class="bi bi-ticket-perforated fs-2 text-info"></i>
              <div class="fw-bold mt-2">Tarif</div>
              <small>{{ event.prix === 0 ? 'Gratuit' : event.prix + ' TND' }}</small>
            </div>
          </div>
        </div>

        <div class="description mb-4">
          <h3 class="fw-bold border-start border-success border-4 ps-3">Description</h3>
          <p class="mt-3">{{ event.description }}</p>
          <p *ngIf="event.descriptionAr" dir="rtl" class="text-muted">{{ event.descriptionAr }}</p>
        </div>

        <div class="contenu-html mb-4" *ngIf="event.contenuHtml">
          <h3 class="fw-bold border-start border-success border-4 ps-3">Détails de l'événement</h3>
          <div [innerHTML]="event.contenuHtml" class="rich-content mt-3"></div>
        </div>

        <div class="programme mb-4" *ngIf="event.programme">
          <h3 class="fw-bold border-start border-success border-4 ps-3">Programme</h3>
          <div [innerHTML]="event.programme" class="rich-content mt-3"></div>
        </div>

        <!-- ⭐ AJOUT : SECTIONS DYNAMIQUES ⭐ -->
        <div *ngFor="let section of sections; let i = index" class="section-dynamique mb-4">
          <h3 *ngIf="section.titre" class="fw-bold border-start border-success border-4 ps-3">
            {{ section.titre }}
          </h3>
          <div *ngIf="section.texte" class="mt-3">
            <p>{{ section.texte }}</p>
          </div>
          <div *ngIf="section.image" class="mt-3">
            <img [src]="section.image" class="img-fluid rounded" style="max-height: 300px; width: auto;">
          </div>
        </div>

        <!-- ⭐ AJOUT : GALERIE D'IMAGES ⭐ -->
        <div *ngIf="galerieImages.length > 0" class="galerie mb-4">
          <h3 class="fw-bold border-start border-success border-4 ps-3">Galerie</h3>
          <div class="row g-3 mt-2">
            <div class="col-md-3 col-sm-4 col-6" *ngFor="let img of galerieImages">
              <img [src]="img" class="img-fluid rounded galerie-img" style="height: 150px; width: 100%; object-fit: cover; cursor: pointer;" (click)="openImage(img)">
            </div>
          </div>
        </div>

        <!-- ⭐ AJOUT : MODAL POUR AGRANDIR L'IMAGE ⭐ -->
        <div class="modal-image" *ngIf="selectedImage" (click)="closeImage()">
          <span class="modal-close">&times;</span>
          <img [src]="selectedImage" class="modal-image-content">
        </div>

        <div class="capacite mb-4" *ngIf="event.capaciteMax">
          <div class="alert alert-info">
            <i class="bi bi-people-fill me-2"></i>
            <strong>Capacité maximale :</strong> {{ event.capaciteMax }} participants
          </div>
        </div>

        <div class="text-center mt-5">
          <app-inscription-button 
            *ngIf="event.statut === 'A_VENIR'"
            type="evenement" 
            [entityId]="event.id" 
            [entityTitle]="event.titre"
            class="d-inline-block">
          </app-inscription-button>
          <div class="alert alert-warning" *ngIf="event.statut === 'TERMINE'">
            <i class="bi bi-calendar-check me-2"></i>Cet événement est terminé
          </div>
          <div class="alert alert-secondary" *ngIf="event.statut === 'ANNULE'">
            <i class="bi bi-calendar-x me-2"></i>Cet événement a été annulé
          </div>
        </div>

        <div class="text-center mt-4">
          <a routerLink="/events" class="btn btn-outline-success">
            <i class="bi bi-arrow-left me-2"></i>Retour aux événements
          </a>
        </div>
      </div>

      <div *ngIf="!loading && !event" class="text-center py-5">
        <i class="bi bi-calendar-x" style="font-size: 4rem; color: #dee2e6;"></i>
        <p class="text-muted mt-3 fs-5">Événement non trouvé</p>
        <a routerLink="/events" class="btn btn-mellita mt-3">Voir tous les événements</a>
      </div>
    </div>
    <app-footer></app-footer>
  `,
  styles: [`
    .event-detail { max-width: 1200px; margin: 0 auto; }
    .info-cards .card { border: none; box-shadow: 0 2px 12px rgba(0,0,0,0.08); transition: transform 0.3s; }
    .info-cards .card:hover { transform: translateY(-5px); }
    .rich-content { line-height: 1.8; }
    .rich-content img { max-width: 100%; border-radius: 8px; margin: 20px 0; }
    .badge-statut { display: inline-block; padding: 5px 15px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; }
    .badge-statut.a_venir { background: #d4edda; color: #155724; }
    .badge-statut.en_cours { background: #fff3cd; color: #856404; }
    .badge-statut.termine { background: #e2e3e5; color: #383d41; }
    .badge-statut.annule { background: #f8d7da; color: #721c24; }
    .breadcrumb { background: transparent; padding: 0; }
    .breadcrumb-item a { color: #1a6b3c; }
    .btn-mellita { background: linear-gradient(135deg, #1a6b3c, #2d9e5f); color: white; border: none; border-radius: 10px; padding: 10px 30px; font-weight: 600; }
    .btn-mellita:hover { color: white; opacity: 0.9; }
    .btn-outline-success { border-radius: 10px; padding: 8px 25px; }
    
    /* ⭐ AJOUT : STYLES POUR SECTIONS ET GALERIE ⭐ */
    .section-dynamique { 
      margin-bottom: 2rem; 
      padding: 1rem; 
      background: #f8f9fa; 
      border-radius: 12px; 
    }
    .galerie { 
      margin-top: 2rem; 
    }
    .galerie-img { 
      transition: transform 0.3s; 
    }
    .galerie-img:hover { 
      transform: scale(1.05); 
    }
    .modal-image { 
      position: fixed; 
      top: 0; 
      left: 0; 
      width: 100%; 
      height: 100%; 
      background: rgba(0,0,0,0.9); 
      z-index: 10000; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      cursor: pointer; 
    }
    .modal-image-content { 
      max-width: 90%; 
      max-height: 90%; 
      object-fit: contain; 
    }
    .modal-close { 
      position: absolute; 
      top: 20px; 
      right: 35px; 
      color: white; 
      font-size: 40px; 
      font-weight: bold; 
      cursor: pointer; 
    }
    .modal-close:hover { 
      color: #ccc; 
    }
  `]
})
export class EventDetailPublicComponent implements OnInit {
  event: any = null;
  loading = true;
  
  // ⭐ AJOUT : PROPRIÉTÉS POUR SECTIONS ET GALERIE ⭐
  sections: Array<{ titre: string; texte: string; image: string | null }> = [];
  galerieImages: string[] = [];
  selectedImage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private eventService: EvenementService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.loadEventDetail(id);
    }
  }

  loadEventDetail(id: number): void {
    this.loading = true;
    this.eventService.getById(id).subscribe({
      next: (data) => {
        this.event = data;
        
        // ⭐ AJOUT : CHARGER LES SECTIONS DYNAMIQUES ⭐
        this.sections = [];
        for (let i = 1; i <= 10; i++) {
          const titre = data[`section${i}Titre`];
          const texte = data[`section${i}Texte`];
          const image = data[`section${i}Image`];
          if (titre || texte || image) {
            this.sections.push({ 
              titre: titre || '', 
              texte: texte || '', 
              image: image || null 
            });
          }
        }
        
        // ⭐ AJOUT : CHARGER LA GALERIE D'IMAGES ⭐
        if (data.galerieImages) {
          try {
            this.galerieImages = JSON.parse(data.galerieImages);
          } catch(e) {
            this.galerieImages = data.galerieImages ? [data.galerieImages] : [];
          }
        } else {
          this.galerieImages = [];
        }
        
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement événement:', err);
        this.loading = false;
      }
    });
  }

  // ⭐ AJOUT : MÉTHODES POUR LA GALERIE ⭐
  openImage(img: string): void {
    this.selectedImage = img;
  }

  closeImage(): void {
    this.selectedImage = null;
  }

  formatDate(date: string): string {
    if (!date) return 'Date non définie';
    return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  formatTime(date: string): string {
    if (!date) return 'Horaire non défini';
    return new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  getStatutLabel(statut: string): string {
    switch(statut) {
      case 'A_VENIR': return 'À venir';
      case 'EN_COURS': return 'En cours';
      case 'TERMINE': return 'Terminé';
      case 'ANNULE': return 'Annulé';
      default: return statut || 'À venir';
    }
  }

  getStatutClass(statut: string): string {
    if (!statut) return 'a_venir';
    return statut.toLowerCase();
  }
}