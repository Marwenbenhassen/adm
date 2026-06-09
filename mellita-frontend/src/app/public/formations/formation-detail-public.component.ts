import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormationService } from '../../core/services/api.services';
import { InscriptionButtonComponent } from '../../shared/inscription-button/inscription-button.component';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { FooterComponent } from '../../shared/footer/footer.component';

@Component({
  selector: 'app-formation-detail-public',
  standalone: true,
  imports: [CommonModule, RouterLink, InscriptionButtonComponent, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>
    <div class="container py-5">
      <div *ngIf="loading" class="text-center py-5">
        <div class="spinner-border text-success" style="width: 3rem; height: 3rem;"></div>
        <p class="text-muted mt-3">Chargement de la formation...</p>
      </div>

      <div *ngIf="!loading && formation" class="formation-detail">
        <nav aria-label="breadcrumb" class="mb-4">
          <ol class="breadcrumb">
            <li class="breadcrumb-item"><a routerLink="/" class="text-decoration-none">Accueil</a></li>
            <li class="breadcrumb-item"><a routerLink="/formations" class="text-decoration-none">Formations</a></li>
            <li class="breadcrumb-item active" aria-current="page">{{ formation.titre }}</li>
          </ol>
        </nav>

        <div class="cover-image mb-4" *ngIf="formation.image">
          <img [src]="formation.image" class="img-fluid w-100 rounded" style="max-height: 400px; object-fit: cover;" onerror="this.src='assets/images/formation-placeholder.jpg'">
        </div>

        <h1 class="fw-bold mb-3">{{ formation.titre }}</h1>
        <h2 class="text-muted mb-4" *ngIf="formation.titreAr" dir="rtl">{{ formation.titreAr }}</h2>

        <div class="badges mb-4">
          <span class="badge-statut {{ getStatutClass(formation.statut) }}">{{ getStatutLabel(formation.statut) }}</span>
          <span class="badge bg-primary ms-2" *ngIf="formation.dureeHeures"><i class="bi bi-clock me-1"></i>{{ formation.dureeHeures }} heures</span>
          <span class="badge bg-info ms-2" *ngIf="formation.formateur"><i class="bi bi-person me-1"></i>{{ formation.formateur }}</span>
        </div>

        <div class="info-cards row g-3 mb-4">
          <div class="col-md-3 col-sm-6">
            <div class="card text-center p-3 h-100">
              <i class="bi bi-calendar-event fs-2 text-success"></i>
              <div class="fw-bold mt-2">Dates</div>
              <small>{{ formatDate(formation.dateDebut) }} - {{ formatDate(formation.dateFin) }}</small>
            </div>
          </div>
          <div class="col-md-3 col-sm-6">
            <div class="card text-center p-3 h-100">
              <i class="bi bi-geo-alt fs-2 text-danger"></i>
              <div class="fw-bold mt-2">Lieu</div>
              <small>{{ formation.lieu || 'Non spécifié' }}</small>
            </div>
          </div>
          <div class="col-md-3 col-sm-6">
            <div class="card text-center p-3 h-100">
              <i class="bi bi-cash-stack fs-2 text-warning"></i>
              <div class="fw-bold mt-2">Tarif</div>
              <small>{{ formation.prix === 0 ? 'Gratuit' : formation.prix + ' TND' }}</small>
            </div>
          </div>
          <div class="col-md-3 col-sm-6">
            <div class="card text-center p-3 h-100">
              <i class="bi bi-people fs-2 text-purple"></i>
              <div class="fw-bold mt-2">Places</div>
              <small>{{ formation.capaciteMax || 'Illimité' }} places</small>
            </div>
          </div>
        </div>

        <div class="description mb-4">
          <h3 class="fw-bold border-start border-success border-4 ps-3">Description</h3>
          <p class="mt-3">{{ formation.description }}</p>
          <p *ngIf="formation.descriptionAr" dir="rtl" class="text-muted">{{ formation.descriptionAr }}</p>
        </div>

        <div class="objectifs mb-4" *ngIf="formation.objectifs">
          <h3 class="fw-bold border-start border-success border-4 ps-3">Objectifs pédagogiques</h3>
          <div [innerHTML]="formation.objectifs" class="rich-content mt-3"></div>
        </div>

        <div class="programme mb-4" *ngIf="formation.programme">
          <h3 class="fw-bold border-start border-success border-4 ps-3">Programme détaillé</h3>
          <div [innerHTML]="formation.programme" class="rich-content mt-3"></div>
        </div>

        <div class="prerequis mb-4" *ngIf="formation.prerequisites">
          <h3 class="fw-bold border-start border-success border-4 ps-3">Prérequis</h3>
          <div [innerHTML]="formation.prerequisites" class="rich-content mt-3"></div>
        </div>

        <!-- ⭐ SECTIONS DYNAMIQUES 1 à 10 ⭐ -->
        <div class="alert alert-info" *ngIf="sections.length === 0 && !loading">
          <i class="bi bi-info-circle me-2"></i>Aucune section supplémentaire n'a été ajoutée à cette formation.
        </div>
        
        <div *ngFor="let section of sections; let i = index" class="section-dynamique mb-4">
          <h3 *ngIf="section.titre" class="fw-bold border-start border-success border-4 ps-3">
            {{ section.titre }}
          </h3>
          <div *ngIf="section.texte" class="mt-3">
            <p class="section-texte">{{ section.texte }}</p>
          </div>
          <div *ngIf="section.image" class="mt-3 text-center">
            <img [src]="section.image" class="img-fluid rounded section-image" (click)="openImage(section.image)">
          </div>
        </div>

        <!-- ⭐ GALERIE D'IMAGES ⭐ -->
        <div *ngIf="galerieImages.length > 0" class="galerie mb-4">
          <h3 class="fw-bold border-start border-success border-4 ps-3">Galerie</h3>
          <div class="row g-3 mt-2">
            <div class="col-md-3 col-sm-4 col-6" *ngFor="let img of galerieImages">
              <img [src]="img" class="img-fluid rounded galerie-img" (click)="openImage(img)">
            </div>
          </div>
        </div>

        <!-- ⭐ MODAL POUR AGRANDIR L'IMAGE ⭐ -->
        <div class="modal-image" *ngIf="selectedImage" (click)="closeImage()">
          <span class="modal-close">&times;</span>
          <img [src]="selectedImage" class="modal-image-content">
        </div>

        <div class="text-center mt-5">
          <app-inscription-button 
            *ngIf="formation.statut === 'PLANIFIEE'"
            type="formation" 
            [entityId]="formation.id" 
            [entityTitle]="formation.titre"
            class="d-inline-block">
          </app-inscription-button>
          <div class="alert alert-warning" *ngIf="formation.statut === 'TERMINEE'">
            <i class="bi bi-mortarboard me-2"></i>Cette formation est terminée
          </div>
          <div class="alert alert-secondary" *ngIf="formation.statut === 'ANNULEE'">
            <i class="bi bi-x-circle me-2"></i>Cette formation a été annulée
          </div>
        </div>

        <div class="text-center mt-4">
          <a routerLink="/formations" class="btn btn-outline-success">
            <i class="bi bi-arrow-left me-2"></i>Retour aux formations
          </a>
        </div>
      </div>

      <div *ngIf="!loading && !formation" class="text-center py-5">
        <i class="bi bi-mortarboard" style="font-size: 4rem; color: #dee2e6;"></i>
        <p class="text-muted mt-3 fs-5">Formation non trouvée</p>
        <a routerLink="/formations" class="btn btn-mellita mt-3">Voir toutes les formations</a>
      </div>
    </div>
    <app-footer></app-footer>
  `,
  styles: [`
    .formation-detail { max-width: 1200px; margin: 0 auto; }
    .info-cards .card { border: none; box-shadow: 0 2px 12px rgba(0,0,0,0.08); transition: transform 0.3s; }
    .info-cards .card:hover { transform: translateY(-5px); }
    .rich-content { line-height: 1.8; }
    .rich-content img { max-width: 100%; border-radius: 8px; margin: 20px 0; }
    .badge-statut { display: inline-block; padding: 5px 15px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; }
    .badge-statut.planifiee { background: #d4edda; color: #155724; }
    .badge-statut.en_cours { background: #fff3cd; color: #856404; }
    .badge-statut.terminee { background: #e2e3e5; color: #383d41; }
    .badge-statut.annulee { background: #f8d7da; color: #721c24; }
    .badges .badge { font-size: 0.85rem; padding: 6px 15px; }
    .text-purple { color: #6f42c1; }
    .breadcrumb { background: transparent; padding: 0; }
    .breadcrumb-item a { color: #1a6b3c; }
    .btn-mellita { background: linear-gradient(135deg, #1a6b3c, #2d9e5f); color: white; border: none; border-radius: 10px; padding: 10px 30px; font-weight: 600; }
    .btn-mellita:hover { color: white; opacity: 0.9; }
    .btn-outline-success { border-radius: 10px; padding: 8px 25px; }
    
    .section-dynamique {
      margin-bottom: 2rem;
      padding: 1.5rem;
      background: #f8f9fa;
      border-radius: 12px;
      transition: all 0.3s ease;
    }
    .section-dynamique:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .section-texte {
      font-size: 1rem;
      line-height: 1.6;
      color: #333;
    }
    .section-image {
      max-height: 300px;
      width: auto;
      cursor: pointer;
      transition: transform 0.3s ease;
    }
    .section-image:hover {
      transform: scale(1.02);
    }
    .galerie {
      margin-top: 2rem;
    }
    .galerie-img {
      height: 150px;
      width: 100%;
      object-fit: cover;
      cursor: pointer;
      transition: transform 0.3s ease, opacity 0.3s ease;
    }
    .galerie-img:hover {
      transform: scale(1.05);
      opacity: 0.9;
    }
    .modal-image {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.95);
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
      animation: fadeIn 0.3s ease;
    }
    .modal-close {
      position: absolute;
      top: 20px;
      right: 35px;
      color: white;
      font-size: 40px;
      font-weight: bold;
      cursor: pointer;
      transition: color 0.3s ease;
    }
    .modal-close:hover {
      color: #ccc;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.9); }
      to { opacity: 1; transform: scale(1); }
    }
  `]
})
export class FormationDetailPublicComponent implements OnInit {
  formation: any = null;
  loading = true;
  
  sections: Array<{ titre: string; texte: string; image: string | null }> = [];
  galerieImages: string[] = [];
  selectedImage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private formationService: FormationService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.loadFormationDetail(id);
    }
  }

  loadFormationDetail(id: number): void {
    this.loading = true;
    this.formationService.getById(id).subscribe({
      next: (data) => {
        console.log('📦 Données reçues de l\'API:', data);
        
        this.formation = data;
        
        // ⭐ CHARGER LES SECTIONS 1 À 10 ⭐
        this.sections = [];
        for (let i = 1; i <= 10; i++) {
          const titre = data[`section${i}Titre`];
          const texte = data[`section${i}Texte`];
          const image = data[`section${i}Image`];
          
          console.log(`Section ${i}:`, { titre, texte, image: image ? 'Image présente' : 'Pas d\'image' });
          
          if (titre || texte || image) {
            this.sections.push({ 
              titre: titre || '', 
              texte: texte || '', 
              image: image || null 
            });
          }
        }
        
        // ⭐ CHARGER LA GALERIE D'IMAGES ⭐
        if (data.galerieImages) {
          try {
            this.galerieImages = JSON.parse(data.galerieImages);
            console.log('📸 Galerie chargée:', this.galerieImages.length, 'images');
          } catch(e) {
            console.error('Erreur parsing galerie:', e);
            this.galerieImages = data.galerieImages ? [data.galerieImages] : [];
          }
        } else {
          this.galerieImages = [];
          console.log('📸 Pas de galerie');
        }
        
        console.log('✅ Sections chargées:', this.sections.length);
        console.log('✅ Galerie chargée:', this.galerieImages.length);
        
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Erreur chargement formation:', err);
        this.loading = false;
      }
    });
  }

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

  getStatutLabel(statut: string): string {
    switch(statut) {
      case 'PLANIFIEE': return 'À venir';
      case 'EN_COURS': return 'En cours';
      case 'TERMINEE': return 'Terminée';
      case 'ANNULEE': return 'Annulée';
      default: return statut || 'À venir';
    }
  }

  getStatutClass(statut: string): string {
    if (!statut) return 'planifiee';
    return statut.toLowerCase();
  }
}