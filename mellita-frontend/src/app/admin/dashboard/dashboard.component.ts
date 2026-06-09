import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserService, EvenementService, DonService, FormationService } from '../../core/services/api.services';
import { ClubService, EcritureService } from '../../core/services/api.services';
import { ROLE_LABELS, ROLE_COLORS } from '../../models/user.model';

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="d-flex">
      <app-sidebar></app-sidebar>
      <div class="admin-content flex-grow-1">

        <!-- Top Bar -->
        <div class="topbar">
          <div>
            <h4 class="mb-0 fw-bold">Tableau de Bord</h4>
            <small class="text-muted">{{ today | date:'EEEE d MMMM yyyy' }}</small>
          </div>
          <div class="d-flex align-items-center gap-2">
            <span class="role-badge" [style.background]="getRoleColor() + '20'" [style.color]="getRoleColor()">
              <i class="bi bi-circle-fill me-1" style="font-size:0.5rem"></i>
              {{ getRoleLabel() }}
            </span>
            <span class="text-muted">{{ currentUser?.prenom }} {{ currentUser?.nom }}</span>
            <button class="btn btn-outline-danger btn-sm logout-topbar" (click)="logout()">
              <i class="bi bi-box-arrow-right me-1"></i>Déconnexion
            </button>
          </div>
        </div>

        <div class="p-4">

          <!-- ===== ADMIN / ADMINISTRATIF KPIs ===== -->
          <div class="row g-3 mb-4" *ngIf="isAdmin() || isAdministratif()">
            <div class="col-6 col-lg-3" *ngFor="let k of kpiAdmin">
              <div class="kpi-card" [style.border-left-color]="k.color">
                <div class="kpi-top">
                  <div class="kpi-icon" [style.background]="k.color + '18'" [style.color]="k.color">
                    <i class="bi {{ k.icon }}"></i>
                  </div>
                  <span class="kpi-trend up">{{ k.trend }}</span>
                </div>
                <div class="kpi-val" [style.color]="k.color">{{ k.value }}</div>
                <div class="kpi-lbl">{{ k.label }}</div>
              </div>
            </div>
          </div>

          <!-- ===== TRÉSORIER : bilan financier ===== -->
          <div class="row g-3 mb-4" *ngIf="isTresorier()">
            <div class="col-12 mb-2">
              <h5 class="fw-bold">Bilan Financier</h5>
            </div>
            <div class="col-md-4" *ngFor="let f of financeBilan">
              <div class="finance-kpi" [style.border-color]="f.color">
                <i class="bi {{ f.icon }}" [style.color]="f.color" style="font-size:1.8rem;display:block;margin-bottom:8px"></i>
                <div class="fk-val" [style.color]="f.color">{{ f.value }}</div>
                <div class="fk-lbl">{{ f.label }}</div>
              </div>
            </div>
          </div>

          <!-- ===== ANIMATEUR : mes clubs et rémunération ===== -->
          <div class="row g-3 mb-4" *ngIf="isAnimateur()">
            <div class="col-12 mb-2">
              <h5 class="fw-bold">Mon Espace Animateur</h5>
            </div>
            <div class="col-md-4">
              <div class="anim-card" style="border-left-color:#e83e8c">
                <i class="bi bi-trophy-fill" style="color:#e83e8c;font-size:2rem"></i>
                <div class="anim-val">{{ mesClubs.length }}</div>
                <div class="anim-lbl">Club(s) animé(s)</div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="anim-card" style="border-left-color:#c8a84b">
                <i class="bi bi-cash-stack" style="color:#c8a84b;font-size:2rem"></i>
                <div class="anim-val">{{ remunerationTotal | number:'1.0-2' }} TND</div>
                <div class="anim-lbl">Rémunération estimée</div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="anim-card" style="border-left-color:#1a6b3c">
                <i class="bi bi-clipboard-check-fill" style="color:#1a6b3c;font-size:2rem"></i>
                <div class="anim-val">{{ nombreSeancesAnim }}</div>
                <div class="anim-lbl">Séances animées</div>
              </div>
            </div>
            <div class="col-12" *ngIf="mesClubs.length > 0">
              <div class="clubs-list">
                <h6 class="fw-bold mb-3">Mes Clubs</h6>
                <div class="row g-3">
                  <div class="col-md-4" *ngFor="let c of mesClubs">
                    <div class="club-mini-card">
                      <i class="bi bi-trophy-fill text-warning"></i>
                      <div class="ms-2">
                        <div class="fw-semibold">{{ c.nom }}</div>
                        <small class="text-muted">{{ c.horaire }}</small>
                      </div>
                      <a [routerLink]="['/admin/clubs', c.id]" class="ms-auto btn btn-sm btn-outline-success">Gérer</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ===== FORMATEUR : ses formations ===== -->
          <div class="row g-3 mb-4" *ngIf="isFormateur()">
            <div class="col-12 mb-2">
              <h5 class="fw-bold">Mon Espace Formateur</h5>
            </div>
            <div class="col-md-4">
              <div class="anim-card" style="border-left-color:#6f42c1">
                <i class="bi bi-mortarboard-fill" style="color:#6f42c1;font-size:2rem"></i>
                <div class="anim-val">{{ totalFormations }}</div>
                <div class="anim-lbl">Mes Formations</div>
              </div>
            </div>
            <div class="col-12">
              <a routerLink="/admin/formations" class="btn btn-mellita">
                <i class="bi bi-mortarboard me-2"></i>Gérer mes formations
              </a>
            </div>
          </div>

          <!-- ===== MEMBRE : espace personnel ===== -->
          <div class="row g-3 mb-4" *ngIf="isMembre()">
            <div class="col-12 mb-2">
              <h5 class="fw-bold">Mon Espace Membre</h5>
            </div>
            <div class="col-12">
              <div class="membre-welcome">
                <div class="mw-avatar">{{ currentUser?.prenom?.charAt(0) }}{{ currentUser?.nom?.charAt(0) }}</div>
                <div>
                  <h5 class="fw-bold mb-1">Bienvenue, {{ currentUser?.prenom }} !</h5>
                  <p class="text-muted mb-3">Consultez vos clubs, vos inscriptions et votre historique de présences.</p>
                  <div class="d-flex gap-2 flex-wrap">
                    <a routerLink="/admin/events" class="btn btn-mellita btn-sm">Mes événements</a>
                    <a routerLink="/admin/mes-clubs" class="btn btn-outline-success btn-sm">Mes clubs</a>
                    <a routerLink="/admin/formations" class="btn btn-outline-secondary btn-sm" style="border-color:#6f42c1;color:#6f42c1">
                      <i class="bi bi-mortarboard me-1"></i>Mes formations
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ===== ACTIONS RAPIDES ===== -->
          <div class="row g-3">
            <div class="col-12 mb-1">
              <h5 class="fw-bold">Actions Rapides</h5>
            </div>
            <div class="col-6 col-md-4 col-lg-2" *ngFor="let a of quickActions">
              <a [routerLink]="a.link" class="quick-action">
                <div class="qa-icon" [style.background]="a.color + '18'" [style.color]="a.color">
                  <i class="bi {{ a.icon }}"></i>
                </div>
                <span class="qa-label">{{ a.label }}</span>
                <span class="qa-badge" *ngIf="a.badge">{{ a.badge }}</span>
              </a>
            </div>

            <!-- BOUTONS D'AJOUT DE MEMBRES -->
            <div class="col-12 mt-3" *ngIf="isAdmin() || isAdministratif()">
              <div class="row g-3">
                <div class="col-md-4">
                  <button class="quick-action w-100" (click)="openInscrireClubModal()" style="border: 2px dashed #e83e8c">
                    <div class="qa-icon" style="background: #e83e8c18; color: #e83e8c">
                      <i class="bi bi-person-plus-fill"></i>
                    </div>
                    <span class="qa-label fw-bold">Nouveau membre + Club</span>
                  </button>
                </div>
                <div class="col-md-4">
                  <button class="quick-action w-100" (click)="openInscrireEventModal()" style="border: 2px dashed #1e4d7b">
                    <div class="qa-icon" style="background: #1e4d7b18; color: #1e4d7b">
                      <i class="bi bi-person-plus-fill"></i>
                    </div>
                    <span class="qa-label fw-bold">Nouveau membre + Événement</span>
                  </button>
                </div>
                <div class="col-md-4">
                  <button class="quick-action w-100" (click)="openInscrireFormationModal()" style="border: 2px dashed #6f42c1">
                    <div class="qa-icon" style="background: #6f42c118; color: #6f42c1">
                      <i class="bi bi-person-plus-fill"></i>
                    </div>
                    <span class="qa-label fw-bold">Nouveau membre + Formation</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== MODAL NOUVEAU MEMBRE + CLUB ===== -->
    <div class="modal" [class.show]="showInscrireClubModal" [style.display]="showInscrireClubModal ? 'block' : 'none'" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header" style="background: linear-gradient(135deg, #e83e8c, #c2185b); color: white;">
            <h5 class="modal-title"><i class="bi bi-person-plus-fill me-2"></i>Nouveau membre + Inscription au club</h5>
            <button type="button" class="btn-close btn-close-white" (click)="closeInscrireClubModal()"></button>
          </div>
          <div class="modal-body">
            <form #clubForm="ngForm">
              <h6 class="fw-bold mb-3"><i class="bi bi-person-badge me-2"></i>Informations du membre</h6>
              <div class="row g-3 mb-4">
                <div class="col-md-6">
                  <label class="form-label">Prénom *</label>
                  <input type="text" class="form-control" [(ngModel)]="newMembre.prenom" name="prenom" #prenom="ngModel" required>
                  <div *ngIf="prenom.invalid && (prenom.dirty || prenom.touched)" class="text-danger small">
                    <div *ngIf="prenom.errors?.['required']">Prénom obligatoire</div>
                  </div>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Nom *</label>
                  <input type="text" class="form-control" [(ngModel)]="newMembre.nom" name="nom" #nom="ngModel" required>
                  <div *ngIf="nom.invalid && (nom.dirty || nom.touched)" class="text-danger small">
                    <div *ngIf="nom.errors?.['required']">Nom obligatoire</div>
                  </div>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Date de naissance *</label>
                  <input type="date" class="form-control" [(ngModel)]="newMembre.dateNaissance" name="dateNaissance" #dateNaissance="ngModel" required>
                  <div *ngIf="dateNaissance.invalid && (dateNaissance.dirty || dateNaissance.touched)" class="text-danger small">
                    Date de naissance obligatoire
                  </div>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Lieu de naissance</label>
                  <input type="text" class="form-control" [(ngModel)]="newMembre.lieuNaissance" name="lieuNaissance">
                </div>
              </div>
              <h6 class="fw-bold mb-3"><i class="bi bi-person-lines-fill me-2"></i>Informations familiales</h6>
              <div class="row g-3 mb-4">
                <div class="col-md-6">
                  <label class="form-label">Nom du père *</label>
                  <input type="text" class="form-control" [(ngModel)]="newMembre.nomPere" name="nomPere" #nomPere="ngModel" required>
                  <div *ngIf="nomPere.invalid && (nomPere.dirty || nomPere.touched)" class="text-danger small">
                    <div *ngIf="nomPere.errors?.['required']">Nom du père obligatoire</div>
                  </div>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Nom de la mère</label>
                  <input type="text" class="form-control" [(ngModel)]="newMembre.nomMere" name="nomMere">
                </div>
                <div class="col-md-6">
                  <label class="form-label">Téléphone *</label>
                  <input type="tel" class="form-control" [(ngModel)]="newMembre.telephone" name="telephone" #telephone="ngModel" required>
                  <div *ngIf="telephone.invalid && (telephone.dirty || telephone.touched)" class="text-danger small">
                    <div *ngIf="telephone.errors?.['required']">Téléphone obligatoire</div>
                  </div>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Email du responsable (optionnel)</label>
                  <input type="email" class="form-control" [(ngModel)]="emailResponsable" name="emailResponsable">
                  <small class="text-muted">Laissez vide pour créer un compte autonome</small>
                </div>
                <div class="col-12">
                  <label class="form-label">Adresse *</label>
                  <input type="text" class="form-control" [(ngModel)]="newMembre.adresse" name="adresse" #adresse="ngModel" required>
                  <div *ngIf="adresse.invalid && (adresse.dirty || adresse.touched)" class="text-danger small">
                    <div *ngIf="adresse.errors?.['required']">Adresse obligatoire</div>
                  </div>
                </div>
              </div>
              <h6 class="fw-bold mb-3"><i class="bi bi-trophy-fill me-2"></i>Sélection du club</h6>
              <div class="row g-3 mb-4">
                <div class="col-md-8">
                  <label class="form-label">Choisir un club *</label>
                  <select class="form-select" [(ngModel)]="inscriptionClub.clubId" name="clubId" #clubId="ngModel" required>
                    <option [value]="null">-- Sélectionner un club --</option>
                    <option *ngFor="let club of clubs" [value]="club.id">{{ club.nom }} ({{ club.horaire }})</option>
                  </select>
                  <div *ngIf="clubId.invalid && (clubId.dirty || clubId.touched)" class="text-danger small">
                    Club obligatoire
                  </div>
                </div>
                <div class="col-md-4">
                  <label class="form-label">Cotisation (TND) *</label>
                  <input type="number" class="form-control" [(ngModel)]="inscriptionClub.montant" name="montantClub" #montantClub="ngModel" required min="0.01" step="0.01">
                  <div *ngIf="montantClub.invalid && (montantClub.dirty || montantClub.touched)" class="text-danger small">
                    <div *ngIf="montantClub.errors?.['required']">Cotisation obligatoire</div>
                    <div *ngIf="montantClub.errors?.['min']">Doit être supérieur à 0</div>
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="closeInscrireClubModal()">Annuler</button>
            <button type="button" class="btn btn-danger" (click)="saveNewMembreWithClub()" style="background: #e83e8c;"><i class="bi bi-save me-2"></i>Enregistrer et inscrire au club</button>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== MODAL NOUVEAU MEMBRE + ÉVÉNEMENT ===== -->
    <div class="modal" [class.show]="showInscrireEventModal" [style.display]="showInscrireEventModal ? 'block' : 'none'" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header" style="background: linear-gradient(135deg, #1e4d7b, #0d3b5e); color: white;">
            <h5 class="modal-title"><i class="bi bi-person-plus-fill me-2"></i>Nouveau membre + Inscription à l'événement</h5>
            <button type="button" class="btn-close btn-close-white" (click)="closeInscrireEventModal()"></button>
          </div>
          <div class="modal-body">
            <form #eventForm="ngForm">
              <h6 class="fw-bold mb-3"><i class="bi bi-person-badge me-2"></i>Informations du membre</h6>
              <div class="row g-3 mb-4">
                <div class="col-md-6">
                  <label class="form-label">Prénom *</label>
                  <input type="text" class="form-control" [(ngModel)]="newMembre.prenom" name="prenom" #prenom="ngModel" required>
                  <div *ngIf="prenom.invalid && (prenom.dirty || prenom.touched)" class="text-danger small">
                    <div *ngIf="prenom.errors?.['required']">Prénom obligatoire</div>
                  </div>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Nom *</label>
                  <input type="text" class="form-control" [(ngModel)]="newMembre.nom" name="nom" #nom="ngModel" required>
                  <div *ngIf="nom.invalid && (nom.dirty || nom.touched)" class="text-danger small">
                    <div *ngIf="nom.errors?.['required']">Nom obligatoire</div>
                  </div>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Date de naissance *</label>
                  <input type="date" class="form-control" [(ngModel)]="newMembre.dateNaissance" name="dateNaissance" #dateNaissance="ngModel" required>
                  <div *ngIf="dateNaissance.invalid && (dateNaissance.dirty || dateNaissance.touched)" class="text-danger small">
                    Date de naissance obligatoire
                  </div>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Lieu de naissance</label>
                  <input type="text" class="form-control" [(ngModel)]="newMembre.lieuNaissance" name="lieuNaissance">
                </div>
              </div>
              <h6 class="fw-bold mb-3"><i class="bi bi-person-lines-fill me-2"></i>Informations familiales</h6>
              <div class="row g-3 mb-4">
                <div class="col-md-6">
                  <label class="form-label">Nom du père *</label>
                  <input type="text" class="form-control" [(ngModel)]="newMembre.nomPere" name="nomPere" #nomPere="ngModel" required>
                  <div *ngIf="nomPere.invalid && (nomPere.dirty || nomPere.touched)" class="text-danger small">
                    <div *ngIf="nomPere.errors?.['required']">Nom du père obligatoire</div>
                  </div>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Nom de la mère</label>
                  <input type="text" class="form-control" [(ngModel)]="newMembre.nomMere" name="nomMere">
                </div>
                <div class="col-md-6">
                  <label class="form-label">Téléphone *</label>
                  <input type="tel" class="form-control" [(ngModel)]="newMembre.telephone" name="telephone" #telephone="ngModel" required>
                  <div *ngIf="telephone.invalid && (telephone.dirty || telephone.touched)" class="text-danger small">
                    <div *ngIf="telephone.errors?.['required']">Téléphone obligatoire</div>
                  </div>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Email du responsable (optionnel)</label>
                  <input type="email" class="form-control" [(ngModel)]="emailResponsable" name="emailResponsable">
                  <small class="text-muted">Laissez vide pour créer un compte autonome</small>
                </div>
                <div class="col-12">
                  <label class="form-label">Adresse *</label>
                  <input type="text" class="form-control" [(ngModel)]="newMembre.adresse" name="adresse" #adresse="ngModel" required>
                  <div *ngIf="adresse.invalid && (adresse.dirty || adresse.touched)" class="text-danger small">
                    <div *ngIf="adresse.errors?.['required']">Adresse obligatoire</div>
                  </div>
                </div>
              </div>
              <h6 class="fw-bold mb-3"><i class="bi bi-calendar-event-fill me-2"></i>Sélection de l'événement</h6>
              <div class="row g-3 mb-4">
                <div class="col-md-8">
                  <label class="form-label">Choisir un événement *</label>
                  <select class="form-select" [(ngModel)]="inscriptionEvent.eventId" name="eventId" #eventId="ngModel" required>
                    <option [value]="null">-- Sélectionner un événement --</option>
                    <option *ngFor="let event of events" [value]="event.id">{{ event.titre }} ({{ event.dateDebut | date:'dd/MM/yyyy' }})</option>
                  </select>
                  <div *ngIf="eventId.invalid && (eventId.dirty || eventId.touched)" class="text-danger small">
                    Événement obligatoire
                  </div>
                </div>
                <div class="col-md-4">
                  <label class="form-label">Prix du ticket (TND) *</label>
                  <input type="number" class="form-control" [(ngModel)]="inscriptionEvent.montant" name="montantEvent" #montantEvent="ngModel" required min="0.01" step="0.01">
                  <div *ngIf="montantEvent.invalid && (montantEvent.dirty || montantEvent.touched)" class="text-danger small">
                    <div *ngIf="montantEvent.errors?.['required']">Prix obligatoire</div>
                    <div *ngIf="montantEvent.errors?.['min']">Doit être supérieur à 0</div>
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="closeInscrireEventModal()">Annuler</button>
            <button type="button" class="btn btn-primary" (click)="saveNewMembreWithEvent()"><i class="bi bi-save me-2"></i>Enregistrer et inscrire à l'événement</button>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== MODAL NOUVEAU MEMBRE + FORMATION ===== -->
    <div class="modal" [class.show]="showInscrireFormationModal" [style.display]="showInscrireFormationModal ? 'block' : 'none'" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header" style="background: linear-gradient(135deg, #6f42c1, #5538a0); color: white;">
            <h5 class="modal-title"><i class="bi bi-person-plus-fill me-2"></i>Nouveau membre + Inscription à la formation</h5>
            <button type="button" class="btn-close btn-close-white" (click)="closeInscrireFormationModal()"></button>
          </div>
          <div class="modal-body">
            <form #formationForm="ngForm">
              <h6 class="fw-bold mb-3"><i class="bi bi-person-badge me-2"></i>Informations du membre</h6>
              <div class="row g-3 mb-4">
                <div class="col-md-6">
                  <label class="form-label">Prénom *</label>
                  <input type="text" class="form-control" [(ngModel)]="newMembre.prenom" name="prenom" #prenom="ngModel" required>
                  <div *ngIf="prenom.invalid && (prenom.dirty || prenom.touched)" class="text-danger small">
                    <div *ngIf="prenom.errors?.['required']">Prénom obligatoire</div>
                  </div>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Nom *</label>
                  <input type="text" class="form-control" [(ngModel)]="newMembre.nom" name="nom" #nom="ngModel" required>
                  <div *ngIf="nom.invalid && (nom.dirty || nom.touched)" class="text-danger small">
                    <div *ngIf="nom.errors?.['required']">Nom obligatoire</div>
                  </div>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Date de naissance *</label>
                  <input type="date" class="form-control" [(ngModel)]="newMembre.dateNaissance" name="dateNaissance" #dateNaissance="ngModel" required>
                  <div *ngIf="dateNaissance.invalid && (dateNaissance.dirty || dateNaissance.touched)" class="text-danger small">
                    Date de naissance obligatoire
                  </div>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Lieu de naissance</label>
                  <input type="text" class="form-control" [(ngModel)]="newMembre.lieuNaissance" name="lieuNaissance">
                </div>
              </div>
              <h6 class="fw-bold mb-3"><i class="bi bi-person-lines-fill me-2"></i>Informations familiales</h6>
              <div class="row g-3 mb-4">
                <div class="col-md-6">
                  <label class="form-label">Nom du père *</label>
                  <input type="text" class="form-control" [(ngModel)]="newMembre.nomPere" name="nomPere" #nomPere="ngModel" required>
                  <div *ngIf="nomPere.invalid && (nomPere.dirty || nomPere.touched)" class="text-danger small">
                    <div *ngIf="nomPere.errors?.['required']">Nom du père obligatoire</div>
                  </div>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Nom de la mère</label>
                  <input type="text" class="form-control" [(ngModel)]="newMembre.nomMere" name="nomMere">
                </div>
                <div class="col-md-6">
                  <label class="form-label">Téléphone *</label>
                  <input type="tel" class="form-control" [(ngModel)]="newMembre.telephone" name="telephone" #telephone="ngModel" required>
                  <div *ngIf="telephone.invalid && (telephone.dirty || telephone.touched)" class="text-danger small">
                    <div *ngIf="telephone.errors?.['required']">Téléphone obligatoire</div>
                  </div>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Email du responsable (optionnel)</label>
                  <input type="email" class="form-control" [(ngModel)]="emailResponsable" name="emailResponsable">
                  <small class="text-muted">Laissez vide pour créer un compte autonome</small>
                </div>
                <div class="col-12">
                  <label class="form-label">Adresse *</label>
                  <input type="text" class="form-control" [(ngModel)]="newMembre.adresse" name="adresse" #adresse="ngModel" required>
                  <div *ngIf="adresse.invalid && (adresse.dirty || adresse.touched)" class="text-danger small">
                    <div *ngIf="adresse.errors?.['required']">Adresse obligatoire</div>
                  </div>
                </div>
              </div>
              <h6 class="fw-bold mb-3"><i class="bi bi-mortarboard-fill me-2"></i>Sélection de la formation</h6>
              <div class="row g-3 mb-4">
                <div class="col-md-8">
                  <label class="form-label">Choisir une formation *</label>
                  <select class="form-select" [(ngModel)]="inscriptionFormation.formationId" name="formationId" #formationId="ngModel" required>
                    <option [value]="null">-- Sélectionner une formation --</option>
                    <option *ngFor="let formation of formations" [value]="formation.id">{{ formation.titre }} ({{ formation.dateDebut | date:'dd/MM/yyyy' }})</option>
                  </select>
                  <div *ngIf="formationId.invalid && (formationId.dirty || formationId.touched)" class="text-danger small">
                    Formation obligatoire
                  </div>
                </div>
                <div class="col-md-4">
                  <label class="form-label">Frais de formation (TND) *</label>
                  <input type="number" class="form-control" [(ngModel)]="inscriptionFormation.montant" name="montantFormation" #montantFormation="ngModel" required min="0.01" step="0.01">
                  <div *ngIf="montantFormation.invalid && (montantFormation.dirty || montantFormation.touched)" class="text-danger small">
                    <div *ngIf="montantFormation.errors?.['required']">Frais obligatoire</div>
                    <div *ngIf="montantFormation.errors?.['min']">Doit être supérieur à 0</div>
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="closeInscrireFormationModal()">Annuler</button>
            <button type="button" class="btn" style="background: #6f42c1; color: white;" (click)="saveNewMembreWithFormation()"><i class="bi bi-save me-2"></i>Enregistrer et inscrire à la formation</button>
          </div>
        </div>
      </div>
    </div>

    <div class="modal-backdrop fade show" *ngIf="showInscrireClubModal || showInscrireEventModal || showInscrireFormationModal" style="z-index: 1040"></div>
  `,
  styles: [`
    .admin-content { margin-left: 260px; background: #f4f6f8; min-height: 100vh; }
    .topbar { background: white; padding: 18px 28px; border-bottom: 1px solid #f0f0f0; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
    .role-badge { padding: 5px 12px; border-radius: 20px; font-size: 0.78rem; font-weight: 700; display: flex; align-items: center; }
    .kpi-card { background: white; border-radius: 14px; padding: 18px; border-left: 4px solid; box-shadow: 0 2px 8px rgba(0,0,0,0.05); transition: all 0.3s; }
    .kpi-card:hover { transform: translateY(-3px); box-shadow: 0 6px 20px rgba(0,0,0,0.08); }
    .kpi-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
    .kpi-icon { width: 42px; height: 42px; border-radius: 11px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; }
    .kpi-trend { font-size: 0.72rem; font-weight: 700; padding: 2px 8px; border-radius: 20px; }
    .kpi-trend.up { background: #d4edda; color: #155724; }
    .kpi-val { font-size: 1.8rem; font-weight: 900; line-height: 1; }
    .kpi-lbl { color: #6c757d; font-size: 0.8rem; margin-top: 5px; }
    .finance-kpi { background: white; border-radius: 14px; padding: 20px; border: 2px solid; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
    .fk-val { font-size: 1.5rem; font-weight: 900; }
    .fk-lbl { color: #6c757d; font-size: 0.8rem; margin-top: 4px; }
    .validation-alert { background: rgba(255,193,7,0.1); border: 1px solid rgba(255,193,7,0.4); border-radius: 12px; padding: 14px 20px; display: flex; align-items: center; color: #856404; }
    .anim-card { background: white; border-radius: 14px; padding: 20px; border-left: 4px solid; box-shadow: 0 2px 8px rgba(0,0,0,0.05); text-align: center; }
    .anim-val { font-size: 1.8rem; font-weight: 900; margin: 8px 0 4px; }
    .anim-lbl { color: #6c757d; font-size: 0.8rem; }
    .clubs-list { background: white; border-radius: 14px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
    .club-mini-card { display: flex; align-items: center; background: #f8f9fa; border-radius: 10px; padding: 12px 14px; }
    .membre-welcome { background: white; border-radius: 14px; padding: 28px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); display: flex; align-items: center; gap: 24px; }
    .mw-avatar { width: 60px; height: 60px; background: linear-gradient(135deg, #1a6b3c, #1e4d7b); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.4rem; font-weight: 800; flex-shrink: 0; }
    .quick-action { display: flex; flex-direction: column; align-items: center; gap: 8px; background: white; border-radius: 14px; padding: 18px 10px; text-decoration: none; color: inherit; box-shadow: 0 2px 8px rgba(0,0,0,0.05); transition: all 0.3s; position: relative; cursor: pointer; border: none; width: 100%; }
    .quick-action:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); color: inherit; }
    .qa-icon { width: 48px; height: 48px; border-radius: 13px; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; }
    .qa-label { font-size: 0.75rem; font-weight: 600; text-align: center; color: #495057; }
    .qa-badge { position: absolute; top: 8px; right: 8px; background: #dc3545; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 0.65rem; font-weight: 700; }
    .btn-mellita { background: linear-gradient(135deg, #1a6b3c, #2d9e5f); color: white; border: none; border-radius: 10px; font-weight: 600; padding: 8px 20px; }
    .btn-mellita:hover { color: white; opacity: 0.9; }
    .logout-topbar { border-radius: 10px; font-weight: 600; font-size: 0.82rem; }
    .modal { background-color: rgba(0,0,0,0.5); z-index: 1050; }
    .modal-backdrop { z-index: 1040; }
  `]
})
export class DashboardComponent implements OnInit {
  currentUser: any;
  today = new Date();

  kpiAdmin: any[] = [];
  financeBilan: any[] = [];
  ecrituresEnAttente = 0;
  mesClubs: any[] = [];
  remunerationTotal = 0;
  nombreSeancesAnim = 0;
  totalFormations = 0;
  quickActions: any[] = [];

  showInscrireClubModal = false;
  showInscrireEventModal = false;
  showInscrireFormationModal = false;

  clubs: any[] = [];
  events: any[] = [];
  formations: any[] = [];

  newMembre: any = {
    prenom: '', nom: '', dateNaissance: '', lieuNaissance: '',
    nomPere: '', nomMere: '', telephone: '', email: '', adresse: '', role: 'MEMBRE'
  };

  inscriptionClub: any = { clubId: null, montant: 0 };
  inscriptionEvent: any = { eventId: null, montant: 0 };
  inscriptionFormation: any = { formationId: null, montant: 0 };

  emailResponsable: string = ''; // Email du responsable pour associer le membre

  existingMembreId: number | null = null;

  constructor(
    public authService: AuthService,
    private router: Router,
    private userService: UserService,
    private evenementService: EvenementService,
    private clubService: ClubService,
    private ecritureService: EcritureService,
    private formationService: FormationService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadData();
    this.buildQuickActions();
  }

  isAdmin() { return this.authService.isAdmin(); }
  isAdministratif() { return this.authService.isAdministratif(); }
  isTresorier() { return this.authService.isTresorier(); }
  isFormateur() { return this.authService.isFormateur(); }
  isAnimateur() { return this.authService.isAnimateur(); }
  isMembre() { return this.authService.isMembre(); }

  logout(): void { this.authService.logout(); this.router.navigate(['/auth/login']); }

  getRoleLabel(): string { return ROLE_LABELS[this.currentUser?.role] || this.currentUser?.role; }
  getRoleColor(): string { return ROLE_COLORS[this.currentUser?.role] || '#6c757d'; }

  loadData(): void {
    if (this.isAdmin() || this.isAdministratif()) {
      this.userService.getAll().subscribe((u: any[]) => {
        this.kpiAdmin = [
          { icon: 'bi-people-fill', label: 'Membres', value: u.length, trend: '+5%', color: '#1a6b3c' },
          { icon: 'bi-trophy-fill', label: 'Clubs', value: '--', trend: 'Actifs', color: '#e83e8c' },
          { icon: 'bi-calendar-event-fill', label: 'Événements', value: '--', trend: 'À venir', color: '#1e4d7b' },
          { icon: 'bi-mortarboard-fill', label: 'Formations', value: '--', trend: 'Planifiées', color: '#6f42c1' },
        ];
        this.clubService.getStats().subscribe((s: any) => { this.kpiAdmin[1].value = s.clubsActifs; });
        this.evenementService.getPublic().subscribe((e: any[]) => {
          this.kpiAdmin[2].value = e.filter((ev: any) => ev.statut === 'A_VENIR').length;
        });
        this.formationService.getAll().subscribe((f: any[]) => { this.kpiAdmin[3].value = f.length; });
      });
    }
    if (this.isTresorier()) {
      this.ecritureService.getBilan().subscribe((b: any) => {
        this.financeBilan = [
          { icon: 'bi-arrow-up-circle-fill', label: 'Recettes validées', value: b.totalRecettes.toFixed(2) + ' TND', color: '#28a745' },
          { icon: 'bi-arrow-down-circle-fill', label: 'Dépenses validées', value: b.totalDepenses.toFixed(2) + ' TND', color: '#dc3545' },
          { icon: 'bi-wallet2-fill', label: 'Solde', value: b.solde.toFixed(2) + ' TND', color: b.solde >= 0 ? '#1a6b3c' : '#dc3545' }
        ];
        this.ecrituresEnAttente = b.ecrituresEnAttente;
      });
    }
    if (this.isAnimateur()) {
      this.clubService.getMesClubs().subscribe((c: any[]) => this.mesClubs = c);
      this.clubService.getMaRemuneration().subscribe((r: any) => {
        this.remunerationTotal = r.remunerationTotale;
        this.nombreSeancesAnim = r.nombreSeances;
      });
    }
    if (this.isFormateur()) {
      this.formationService.getAll().subscribe((f: any[]) => this.totalFormations = f.length);
    }
  }

  buildQuickActions(): void {
    const role = this.currentUser?.role;
    const all: any[] = [
      { label: 'Membres',    icon: 'bi-people-fill',         link: '/admin/users',      color: '#1a6b3c', roles: ['ADMIN','ADMINISTRATIF'] },
      { label: 'Clubs',      icon: 'bi-trophy-fill',          link: '/admin/clubs',      color: '#e83e8c', roles: ['ADMIN','ADMINISTRATIF','ANIMATEUR'] },
      { label: 'Présences',  icon: 'bi-clipboard-check-fill', link: '/admin/presences',  color: '#20c997', roles: ['ADMIN','ADMINISTRATIF'] },
      { label: 'Événements', icon: 'bi-calendar-event-fill',  link: '/admin/events',     color: '#1e4d7b', roles: ['ADMIN','ADMINISTRATIF'] },
      // { label: 'Écritures',  icon: 'bi-journal-text',         link: '/admin/ecritures',  color: '#c8a84b', roles: ['ADMIN','ADMINISTRATIF','TRESORIER'] }, // SUPPRIMÉ
      { label: 'Bilan',      icon: 'bi-bar-chart-fill',       link: '/admin/finance',    color: '#28a745', roles: ['ADMIN','TRESORIER'] },
      { label: 'Dons',       icon: 'bi-heart-fill',           link: '/admin/dons',       color: '#fd7e14', roles: ['ADMIN','ADMINISTRATIF','TRESORIER'] },
      { label: 'Formations', icon: 'bi-mortarboard-fill',     link: '/admin/formations', color: '#6f42c1', roles: ['ADMIN','ADMINISTRATIF','FORMATEUR','MEMBRE'] },
      { label: 'Documents',  icon: 'bi-folder-fill',          link: '/admin/documents',  color: '#17a2b8', roles: ['ADMIN','ADMINISTRATIF','TRESORIER','FORMATEUR','ANIMATEUR','MEMBRE'] },
      { label: 'Site Public',icon: 'bi-globe',                link: '/',                 color: '#6c757d', roles: ['ADMIN','ADMINISTRATIF','TRESORIER','FORMATEUR','ANIMATEUR','MEMBRE'] },
    ];
    this.quickActions = all.filter(a => a.roles.includes(role));
  }

  resetNewMembreForm(): void {
    this.newMembre = {
      prenom: '', nom: '', dateNaissance: '', lieuNaissance: '',
      nomPere: '', nomMere: '', telephone: '', email: '', adresse: '', role: 'MEMBRE'
    };
    this.emailResponsable = '';
    this.existingMembreId = null;
  }

  private validateAlphabetique(value: string): boolean {
    if (!value) return true;
    const regex = /^[A-Za-zÀ-ÿ\s-]+$/;
    return regex.test(value);
  }

  private validatePhone(phone: string): boolean {
    const regex = /^[0-9]{8}$/;
    return regex.test(phone);
  }

  private validateEmail(email: string): boolean {
    if (!email) return true;
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  }

  private validateFormData(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.newMembre.prenom) errors.push('Le prénom est obligatoire');
    else if (!this.validateAlphabetique(this.newMembre.prenom)) errors.push('Le prénom doit contenir uniquement des lettres');

    if (!this.newMembre.nom) errors.push('Le nom est obligatoire');
    else if (!this.validateAlphabetique(this.newMembre.nom)) errors.push('Le nom doit contenir uniquement des lettres');

    if (!this.newMembre.dateNaissance) errors.push('La date de naissance est obligatoire');

    if (!this.newMembre.nomPere) errors.push('Le nom du père est obligatoire');
    else if (!this.validateAlphabetique(this.newMembre.nomPere)) errors.push('Le nom du père doit contenir uniquement des lettres');

    if (this.newMembre.nomMere && !this.validateAlphabetique(this.newMembre.nomMere)) {
      errors.push('Le nom de la mère doit contenir uniquement des lettres');
    }

    if (!this.newMembre.telephone) errors.push('Le téléphone est obligatoire');
    else if (!this.validatePhone(this.newMembre.telephone)) errors.push('Le téléphone doit contenir exactement 8 chiffres');

    if (!this.newMembre.adresse) errors.push('L\'adresse est obligatoire');

    return { isValid: errors.length === 0, errors };
  }

  private validateMontant(montant: number): { isValid: boolean; error: string | null } {
    if (montant === undefined || montant === null) {
      return { isValid: false, error: 'Le montant est obligatoire' };
    }
    if (montant <= 0) {
      return { isValid: false, error: 'Le montant doit être supérieur à 0' };
    }
    return { isValid: true, error: null };
  }

  private checkExistingUser(email: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.userService.getAll().subscribe({
        next: (users: any[]) => {
          const existingUser = users.find(u => u.email === email);
          resolve(existingUser);
        },
        error: (err) => reject(err)
      });
    });
  }

  // Nouvelle méthode : Créer un membre associé à un responsable
  private async createMembreWithResponsable(responsableId: number): Promise<number | null> {
    const uniqueEmail = `membre_${responsableId}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}@mellita.tn`;
    
    const membreData = {
      prenom: this.newMembre.prenom,
      nom: this.newMembre.nom,
      dateNaissance: this.newMembre.dateNaissance,
      lieuNaissance: this.newMembre.lieuNaissance,
      nomPere: this.newMembre.nomPere,
      nomMere: this.newMembre.nomMere,
      telephone: this.newMembre.telephone,
      email: uniqueEmail,
      adresse: this.newMembre.adresse,
      motDePasse: 'default123',
      role: 'MEMBRE'
    };

    return new Promise((resolve, reject) => {
      this.userService.createNewMembre(membreData).subscribe({
        next: (response: any) => {
          resolve(response?.id || null);
        },
        error: (err) => {
          console.error('Erreur création membre:', err);
          reject(err);
        }
      });
    });
  }

  // Méthode modifiée : Gère l'inscription avec responsable existant ou nouveau membre
  private async getOrCreateMembre(): Promise<number | null> {
    // Cas 1: Email responsable fourni - associer le nouveau membre
    if (this.emailResponsable && this.emailResponsable.trim() !== '') {
      const responsableUser = await this.checkExistingUser(this.emailResponsable);
      if (responsableUser) {
        const confirm = window.confirm(
          `L'email ${this.emailResponsable} correspond à un membre existant.\n` +
          `Voulez-vous associer ${this.newMembre.prenom} ${this.newMembre.nom} à ce compte ?`
        );
        if (confirm) {
          return await this.createMembreWithResponsable(responsableUser.id);
        } else {
          return null;
        }
      } else {
        alert(`Aucun membre trouvé avec l'email ${this.emailResponsable}. Veuillez vérifier l'email.`);
        return null;
      }
    }
    
    // Cas 2: Email du membre fourni (ancien comportement)
    const email = this.newMembre.email;
    if (email && email.trim() !== '') {
      const existingUser = await this.checkExistingUser(email);
      if (existingUser) {
        const confirm = window.confirm(
          `Un membre avec l'email ${email} existe déjà.\n` +
          `Voulez-vous utiliser ce compte existant ?`
        );
        if (confirm) {
          return existingUser.id;
        } else {
          return null;
        }
      }
    }

    // Cas 3: Créer un nouveau membre autonome
    const membreData = {
      prenom: this.newMembre.prenom,
      nom: this.newMembre.nom,
      dateNaissance: this.newMembre.dateNaissance,
      lieuNaissance: this.newMembre.lieuNaissance,
      nomPere: this.newMembre.nomPere,
      nomMere: this.newMembre.nomMere,
      telephone: this.newMembre.telephone,
      email: this.newMembre.email || `membre_${Date.now()}@temp.mellita.tn`,
      adresse: this.newMembre.adresse,
      motDePasse: 'default123',
      role: 'MEMBRE'
    };

    return new Promise((resolve, reject) => {
      this.userService.createNewMembre(membreData).subscribe({
        next: (response: any) => {
          resolve(response?.id || null);
        },
        error: (err: any) => {
          console.error(err);
          reject(err);
        }
      });
    });
  }

  // ===== MODAL CLUB =====
  openInscrireClubModal(): void {
    this.showInscrireClubModal = true;
    this.loadClubs();
    this.resetNewMembreForm();
    this.inscriptionClub = { clubId: null, montant: 0 };
  }

  closeInscrireClubModal(): void { 
    this.showInscrireClubModal = false; 
  }

  async saveNewMembreWithClub(): Promise<void> {
    if (!this.newMembre.prenom || !this.newMembre.nom || !this.newMembre.dateNaissance || 
        !this.newMembre.nomPere || !this.newMembre.telephone || !this.newMembre.adresse) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const membreValidation = this.validateFormData();
    if (!membreValidation.isValid) {
      alert('Erreurs de validation:\n- ' + membreValidation.errors.join('\n- '));
      return;
    }

    if (!this.inscriptionClub.clubId) {
      alert('Veuillez sélectionner un club');
      return;
    }

    const montantValidation = this.validateMontant(this.inscriptionClub.montant);
    if (!montantValidation.isValid) {
      alert(montantValidation.error);
      return;
    }

    try {
      const membreId = await this.getOrCreateMembre();
      
      if (!membreId) {
        alert('Opération annulée ou échec de création du membre');
        return;
      }

      this.clubService.inscrireMembre(this.inscriptionClub.clubId, membreId).subscribe({
        next: (response: any) => {
          if (this.inscriptionClub.montant > 0) {
            this.ecritureService.create({
              description: `Cotisation club - ${this.newMembre.prenom} ${this.newMembre.nom}`,
              montant: this.inscriptionClub.montant,
              type: 'RECETTE',
              membreId: membreId,
              clubId: this.inscriptionClub.clubId,
              date: new Date()
            }).subscribe();
          }
          
          let message = `Membre ${this.newMembre.prenom} ${this.newMembre.nom} inscrit au club avec succès !`;
          if (this.emailResponsable) {
            message += `\nCe membre est associé au responsable avec l'email: ${this.emailResponsable}`;
          } else if (this.newMembre.email) {
            message += `\nIl pourra se connecter avec l'email: ${this.newMembre.email}`;
          } else {
            message += `\nUn email temporaire a été généré pour ce membre.`;
          }
          alert(message);
          
          this.closeInscrireClubModal();
          this.loadData();
        },
        error: (err: any) => {
          console.error('Erreur inscription club:', err);
          let errorMsg = 'Erreur lors de l\'inscription au club';
          if (err.error && err.error.message) {
            errorMsg = err.error.message;
          } else if (err.status === 400) {
            errorMsg = 'Le membre est déjà inscrit à ce club';
          }
          alert(errorMsg);
        }
      });
    } catch (err: any) {
      console.error(err);
      alert('Erreur: ' + (err?.error?.message || err?.error?.error || 'Erreur inconnue'));
    }
  }

  // ===== MODAL ÉVÉNEMENT =====
  openInscrireEventModal(): void {
    this.showInscrireEventModal = true;
    this.loadEvents();
    this.resetNewMembreForm();
    this.inscriptionEvent = { eventId: null, montant: 0 };
  }

  closeInscrireEventModal(): void { 
    this.showInscrireEventModal = false; 
  }

  async saveNewMembreWithEvent(): Promise<void> {
    if (!this.newMembre.prenom || !this.newMembre.nom || !this.newMembre.dateNaissance || 
        !this.newMembre.nomPere || !this.newMembre.telephone || !this.newMembre.adresse) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const membreValidation = this.validateFormData();
    if (!membreValidation.isValid) {
      alert('Erreurs de validation:\n- ' + membreValidation.errors.join('\n- '));
      return;
    }

    if (!this.inscriptionEvent.eventId) {
      alert('Veuillez sélectionner un événement');
      return;
    }

    const montantValidation = this.validateMontant(this.inscriptionEvent.montant);
    if (!montantValidation.isValid) {
      alert(montantValidation.error);
      return;
    }

    try {
      const membreId = await this.getOrCreateMembre();
      
      if (!membreId) {
        alert('Opération annulée ou échec de création du membre');
        return;
      }

      this.evenementService.inscrireMembre(
        this.inscriptionEvent.eventId, membreId, this.inscriptionEvent.montant
      ).subscribe({
        next: () => {
          let message = `Membre ${this.newMembre.prenom} ${this.newMembre.nom} inscrit à l'événement avec succès !`;
          if (this.emailResponsable) {
            message += `\nCe membre est associé au responsable avec l'email: ${this.emailResponsable}`;
          }
          alert(message);
          this.closeInscrireEventModal();
          this.loadData();
        },
        error: (err: any) => {
          console.error(err);
          alert('Erreur lors de l\'inscription à l\'événement: ' + (err?.error?.message || 'Erreur inconnue'));
        }
      });
    } catch (err: any) {
      console.error(err);
      alert('Erreur: ' + (err?.error?.message || err?.error?.error || 'Erreur inconnue'));
    }
  }

  // ===== MODAL FORMATION =====
  openInscrireFormationModal(): void {
    this.showInscrireFormationModal = true;
    this.loadFormations();
    this.resetNewMembreForm();
    this.inscriptionFormation = { formationId: null, montant: 0 };
  }

  closeInscrireFormationModal(): void { 
    this.showInscrireFormationModal = false; 
  }

  async saveNewMembreWithFormation(): Promise<void> {
    if (!this.newMembre.prenom || !this.newMembre.nom || !this.newMembre.dateNaissance || 
        !this.newMembre.nomPere || !this.newMembre.telephone || !this.newMembre.adresse) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const membreValidation = this.validateFormData();
    if (!membreValidation.isValid) {
      alert('Erreurs de validation:\n- ' + membreValidation.errors.join('\n- '));
      return;
    }

    if (!this.inscriptionFormation.formationId) {
      alert('Veuillez sélectionner une formation');
      return;
    }

    const montantValidation = this.validateMontant(this.inscriptionFormation.montant);
    if (!montantValidation.isValid) {
      alert(montantValidation.error);
      return;
    }

    try {
      const membreId = await this.getOrCreateMembre();
      
      if (!membreId) {
        alert('Opération annulée ou échec de création du membre');
        return;
      }

      this.formationService.inscrireMembre(
        this.inscriptionFormation.formationId, membreId, this.inscriptionFormation.montant
      ).subscribe({
        next: () => {
          let message = `Membre ${this.newMembre.prenom} ${this.newMembre.nom} inscrit à la formation avec succès !`;
          if (this.emailResponsable) {
            message += `\nCe membre est associé au responsable avec l'email: ${this.emailResponsable}`;
          }
          alert(message);
          this.closeInscrireFormationModal();
          this.loadData();
        },
        error: (err: any) => {
          console.error(err);
          alert('Erreur lors de l\'inscription à la formation: ' + (err?.error?.message || 'Erreur inconnue'));
        }
      });
    } catch (err: any) {
      console.error(err);
      alert('Erreur: ' + (err?.error?.message || err?.error?.error || 'Erreur inconnue'));
    }
  }

  loadClubs(): void {
    this.clubService.getAll().subscribe({
      next: (data: any[]) => this.clubs = data,
      error: (err: any) => console.error(err)
    });
  }

  loadEvents(): void {
    this.evenementService.getAll().subscribe({
      next: (data: any[]) => this.events = data,
      error: (err: any) => console.error(err)
    });
  }

  loadFormations(): void {
    this.formationService.getAll().subscribe({
      next: (data: any[]) => this.formations = data,
      error: (err: any) => console.error(err)
    });
  }
}