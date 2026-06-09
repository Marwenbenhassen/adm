// src/app/shared/sidebar-extended/sidebar-extended.component.ts
import { Component } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-sidebar-extended',
  template: `
    <aside class="admin-sidebar d-flex flex-column">
      <div class="sidebar-header">
        <div class="d-flex align-items-center gap-2">
          <div class="sidebar-logo"><i class="bi bi-flower1"></i></div>
          <div>
            <div class="text-white fw-bold fs-6">Mellita</div>
            <div style="font-size:0.65rem;color:rgba(255,255,255,0.45)">Plateforme Intégrée</div>
          </div>
        </div>
      </div>

      <div class="sidebar-profile" *ngIf="currentUser">
        <div class="profile-avatar">{{ currentUser.prenom.charAt(0) }}{{ currentUser.nom.charAt(0) }}</div>
        <div class="profile-info">
          <div class="profile-name">{{ currentUser.prenom }} {{ currentUser.nom }}</div>
          <span class="role-chip" [style.background]="getRoleColor() + '30'" [style.color]="getRoleColor()">
            {{ getRoleLabel() }}
          </span>
        </div>
      </div>

      <nav class="sidebar-nav flex-grow-1">
        <div class="nav-section-label">Général</div>
        <a class="nav-item" routerLink="/admin/dashboard" routerLinkActive="active">
          <i class="bi bi-speedometer2"></i><span>Tableau de Bord</span>
        </a>

        <!-- GESTION - ADMIN + ADMINISTRATIF -->
        <ng-container *ngIf="hasGestion()">
          <div class="nav-section-label">Gestion</div>
          <a class="nav-item" routerLink="/admin/demandes-inscription" routerLinkActive="active">
            <i class="bi bi-person-plus-fill"></i><span>Demandes d'inscription</span>
            <span class="nav-badge new" *ngIf="demandesEnAttente > 0">{{ demandesEnAttente }}</span>
          </a>
          <a class="nav-item" routerLink="/admin/users" routerLinkActive="active">
            <i class="bi bi-people-fill"></i><span>Membres</span>
          </a>
          <a class="nav-item" routerLink="/admin/events" routerLinkActive="active">
            <i class="bi bi-calendar-event-fill"></i><span>Événements</span>
          </a>
          <a class="nav-item" routerLink="/admin/actualites" routerLinkActive="active">
            <i class="bi bi-newspaper"></i><span>Actualités</span>
          </a>

          <!-- 🆕 LIEN GED AJOUTÉ ICI -->
          <a class="nav-item" routerLink="/admin/ged" routerLinkActive="active">
            <i class="bi bi-folder2-open"></i><span>GED</span>
          </a>
        </ng-container>

        <!-- CLUBS -->
        <ng-container *ngIf="hasGestion() || isAnimateur()">
          <div class="nav-section-label" *ngIf="!hasGestion()">Clubs</div>
          <a class="nav-item" routerLink="/admin/clubs" routerLinkActive="active">
            <i class="bi bi-trophy-fill"></i><span>{{ isAnimateur() ? 'Mes Clubs' : 'Clubs' }}</span>
          </a>
          <a class="nav-item" routerLink="/admin/presences" routerLinkActive="active" *ngIf="canSaisirPresence()">
            <i class="bi bi-clipboard-check-fill"></i><span>Présences</span>
          </a>
        </ng-container>

        <!-- RÉMUNÉRATION - ANIMATEUR -->
        <ng-container *ngIf="isAnimateur()">
          <a class="nav-item" routerLink="/admin/remuneration" routerLinkActive="active">
            <i class="bi bi-cash-stack"></i><span>Ma Rémunération</span>
          </a>
        </ng-container>

        <!-- FORMATIONS -->
        <ng-container *ngIf="hasGestion() || isFormateur()">
          <a class="nav-item" routerLink="/admin/formations" routerLinkActive="active">
            <i class="bi bi-mortarboard-fill"></i><span>Formations</span>
          </a>
        </ng-container>

        <!-- FINANCES -->
        <ng-container *ngIf="hasFinance() || isAdministratif()">
          <div class="nav-section-label">Finance</div>
          <!-- LIEN ÉCRITURES COMPTABLES SUPPRIMÉ -->
          <a class="nav-item" routerLink="/admin/finance" routerLinkActive="active" *ngIf="hasFinance()">
            <i class="bi bi-cash-coin"></i><span>Bilan Financier</span>
          </a>
          <!-- LIEN DONS SUPPRIMÉ -->
        </ng-container>

        <!-- MEMBRE -->
        <ng-container *ngIf="isMembre()">
          <div class="nav-section-label">Mon Espace</div>
          <a class="nav-item" routerLink="/admin/mes-clubs" routerLinkActive="active">
            <i class="bi bi-trophy"></i><span>Mes Clubs</span>
          </a>

        </ng-container>

        <div class="nav-section-label">Site</div>
        <a class="nav-item" routerLink="/">
          <i class="bi bi-globe"></i><span>Site Public</span>
        </a>
      </nav>

      <div class="sidebar-footer">
        <button class="logout-btn w-100" (click)="logout()">
          <i class="bi bi-box-arrow-right me-2"></i>Déconnexion
        </button>
      </div>
    </aside>
  `,
  styles: [`
    .admin-sidebar { width:260px; background:linear-gradient(180deg,#0f2318 0%,#0f1923 100%); min-height:100vh; position:fixed; left:0; top:0; z-index:1000; overflow-y:auto; }
    .sidebar-header { padding:20px 16px; border-bottom:1px solid rgba(255,255,255,0.08); }
    .sidebar-logo { width:38px; height:38px; background:linear-gradient(135deg,#1a6b3c,#2d9e5f); border-radius:10px; display:flex; align-items:center; justify-content:center; color:white; font-size:1.2rem; }
    .sidebar-profile { padding:14px 16px; border-bottom:1px solid rgba(255,255,255,0.08); display:flex; align-items:center; gap:10px; }
    .profile-avatar { width:38px; height:38px; background:linear-gradient(135deg,#1a6b3c,#1e4d7b); border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-weight:700; font-size:0.8rem; }
    .profile-name { color:white; font-weight:600; font-size:0.85rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .role-chip { display:inline-block; padding:2px 8px; border-radius:20px; font-size:0.65rem; font-weight:700; margin-top:3px; }
    .sidebar-nav { padding:10px; }
    .nav-section-label { font-size:0.6rem; text-transform:uppercase; letter-spacing:1.5px; color:rgba(255,255,255,0.3); padding:12px 10px 4px; font-weight:700; }
    .nav-item { display:flex; align-items:center; gap:10px; padding:9px 12px; color:rgba(255,255,255,0.65); text-decoration:none; border-radius:9px; margin-bottom:2px; transition:all 0.2s; font-size:0.88rem; font-weight:500; }
    .nav-item:hover { background:rgba(255,255,255,0.08); color:white; }
    .nav-item.active { background:linear-gradient(135deg,rgba(26,107,60,0.5),rgba(30,77,123,0.3)); color:white; border-left:3px solid #2d9e5f; }
    .nav-item i { font-size:1rem; min-width:18px; }
    .nav-badge { margin-left:auto; font-size:0.6rem; padding:2px 6px; border-radius:10px; font-weight:700; background:rgba(255,255,255,0.12); color:rgba(255,255,255,0.6); }
    .nav-badge.new { background:rgba(255,193,7,0.3); color:#ffc107; }
    .sidebar-footer { padding:12px; border-top:1px solid rgba(255,255,255,0.08); }
    .logout-btn { background:rgba(255,255,255,0.06); color:rgba(255,255,255,0.65); border:1px solid rgba(255,255,255,0.1); border-radius:9px; padding:9px 16px; font-size:0.88rem; cursor:pointer; transition:all 0.2s; }
    .logout-btn:hover { background:rgba(220,53,69,0.25); color:#ff6b6b; border-color:rgba(220,53,69,0.4); }
  `]
})
export class SidebarExtendedComponent extends SidebarComponent {
  // Toutes les propriétés et méthodes sont héritées du composant parent
  // Rien à ajouter ici - l'héritage fait tout le travail
}