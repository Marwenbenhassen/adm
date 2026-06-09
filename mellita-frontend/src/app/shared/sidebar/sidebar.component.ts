import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AuthResponse, ROLE_LABELS, ROLE_COLORS } from '../../models/user.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  template: `
    <aside class="admin-sidebar d-flex flex-column">

      <!-- ── Header ── -->
      <div class="sidebar-header">
        <div class="d-flex align-items-center gap-2">
          <div class="sidebar-logo"><i class="bi bi-flower1"></i></div>
          <div>
            <div class="text-white fw-bold fs-6">Mellita</div>
            <div style="font-size:0.65rem;color:rgba(255,255,255,0.45)">Plateforme Intégrée</div>
          </div>
        </div>
      </div>

      <!-- ── Profil ── -->
      <div class="sidebar-profile" *ngIf="currentUser">
        <div class="profile-avatar">
          {{ currentUser.prenom.charAt(0) }}{{ currentUser.nom.charAt(0) }}
        </div>
        <div class="profile-info">
          <div class="profile-name">{{ currentUser.prenom }} {{ currentUser.nom }}</div>
          <span class="role-chip"
                [style.background]="getRoleColor() + '30'"
                [style.color]="getRoleColor()">
            {{ getRoleLabel() }}
          </span>
        </div>
      </div>

      <!-- ── Navigation ── -->
      <nav class="sidebar-nav flex-grow-1">

        <!-- ════════════════════════════════
             GÉNÉRAL — Tableau de bord
        ════════════════════════════════ -->
        <div class="nav-section-label">{{ 'ADMIN.GENERAL' | translate }}</div>

        <!-- Admin / Administratif / Trésorier / Membre -->
        <a class="nav-item"
           routerLink="/admin/dashboard"
           routerLinkActive="active"
           [routerLinkActiveOptions]="{ exact: true }"
           *ngIf="!isFormateur() && !isAnimateur()">
          <i class="bi bi-speedometer2"></i>
          <span>{{ 'ADMIN.DASHBOARD' | translate }}</span>
        </a>

        <!-- Formateur -->
        <a class="nav-item"
           routerLink="/formateur/dashboard"
           routerLinkActive="active"
           [routerLinkActiveOptions]="{ exact: true }"
           *ngIf="isFormateur()">
          <i class="bi bi-speedometer2"></i>
          <span>{{ 'ADMIN.DASHBOARD' | translate }}</span>
        </a>

        <!-- Animateur -->
        <a class="nav-item"
           routerLink="/animateur/dashboard"
           routerLinkActive="active"
           [routerLinkActiveOptions]="{ exact: true }"
           *ngIf="isAnimateur()">
          <i class="bi bi-speedometer2"></i>
          <span>{{ 'ADMIN.DASHBOARD' | translate }}</span>
        </a>

        <!-- ════════════════════════════════
             GESTION — Admin + Administratif
        ════════════════════════════════ -->
        <ng-container *ngIf="hasGestion()">

          <div class="nav-section-label">{{ 'ADMIN.GESTION' | translate }}</div>

          <a class="nav-item"
             routerLink="/admin/demandes-inscription"
             routerLinkActive="active">
            <i class="bi bi-person-plus-fill"></i>
            <span>{{ 'ADMIN.DEMANDES_INSCRIPTION' | translate }}</span>
            <span class="nav-badge new" *ngIf="demandesEnAttente > 0">
              {{ demandesEnAttente }}
            </span>
          </a>

          <a class="nav-item" routerLink="/admin/users" routerLinkActive="active">
            <i class="bi bi-people-fill"></i>
            <span>{{ 'ADMIN.USERS' | translate }}</span>
          </a>

          <a class="nav-item" routerLink="/admin/events" routerLinkActive="active">
            <i class="bi bi-calendar-event-fill"></i>
            <span>{{ 'ADMIN.EVENTS' | translate }}</span>
          </a>

          <a class="nav-item" routerLink="/admin/actualites" routerLinkActive="active">
            <i class="bi bi-newspaper"></i>
            <span>{{ 'ADMIN.NEWS' | translate }}</span>
          </a>

          <a class="nav-item" routerLink="/admin/ged" routerLinkActive="active">
            <i class="bi bi-folder-fill"></i>
            <span>{{ 'ADMIN.DOCUMENTS' | translate }}</span>
          </a>

        </ng-container>

        <!-- ════════════════════════════════
             CLUBS — Admin/Administratif
        ════════════════════════════════ -->
        <ng-container *ngIf="hasGestion()">

          <a class="nav-item" routerLink="/admin/clubs" routerLinkActive="active">
            <i class="bi bi-trophy-fill"></i>
            <span>{{ 'ADMIN.CLUBS' | translate }}</span>
          </a>

          <a class="nav-item" routerLink="/admin/presences" routerLinkActive="active">
            <i class="bi bi-clipboard-check-fill"></i>
            <span>{{ 'ADMIN.PRESENCES' | translate }}</span>
          </a>

        </ng-container>

        <!-- ════════════════════════════════
             MES CLUBS — Animateur uniquement
        ════════════════════════════════ -->
        <ng-container *ngIf="isAnimateur()">

          <div class="nav-section-label">{{ 'ADMIN.MES_CLUBS' | translate }}</div>

          <a class="nav-item"
             routerLink="/animateur/mes-clubs"
             routerLinkActive="active">
            <i class="bi bi-trophy-fill"></i>
            <span>{{ 'ADMIN.MES_CLUBS' | translate }}</span>
          </a>

          <a class="nav-item" routerLink="/admin/ged" routerLinkActive="active">
            <i class="bi bi-folder-fill"></i>
            <span>{{ 'ADMIN.MES_DOCUMENTS' | translate }}</span>
          </a>

        </ng-container>

        <!-- ════════════════════════════════
             FORMATIONS — Admin/Administratif
        ════════════════════════════════ -->
        <ng-container *ngIf="hasGestion()">

          <div class="nav-section-label">{{ 'ADMIN.FORMATIONS' | translate }}</div>

          <a class="nav-item" routerLink="/admin/formations" routerLinkActive="active">
            <i class="bi bi-mortarboard-fill"></i>
            <span>{{ 'ADMIN.FORMATIONS' | translate }}</span>
          </a>

        </ng-container>

        <!-- ════════════════════════════════
             MES FORMATIONS — Formateur
        ════════════════════════════════ -->
        <ng-container *ngIf="isFormateur()">

          <div class="nav-section-label">{{ 'ADMIN.FORMATIONS' | translate }}</div>

          <a class="nav-item"
             routerLink="/formateur/mes-formations"
             routerLinkActive="active">
            <i class="bi bi-mortarboard-fill"></i>
            <span>{{ 'ADMIN.MES_FORMATIONS' | translate }}</span>
          </a>

          <a class="nav-item" routerLink="/admin/ged" routerLinkActive="active">
            <i class="bi bi-folder-fill"></i>
            <span>{{ 'ADMIN.MES_DOCUMENTS' | translate }}</span>
          </a>

        </ng-container>

        <!-- ════════════════════════════════
             FINANCE
        ════════════════════════════════ -->
        <ng-container *ngIf="hasFinance() || isAdministratif()">

          <div class="nav-section-label">{{ 'ADMIN.FINANCE' | translate }}</div>

          <!-- LIEN ÉCRITURES COMPTABLES SUPPRIMÉ -->
          <!-- LIEN DONS SUPPRIMÉ -->

          <a class="nav-item" routerLink="/admin/finance" routerLinkActive="active"
             *ngIf="hasFinance()">
            <i class="bi bi-cash-coin"></i>
            <span>{{ 'ADMIN.BILAN_FINANCIER' | translate }}</span>
          </a>

        </ng-container>

        <!-- ════════════════════════════════
             DOCUMENTATION (Trésorier)
        ════════════════════════════════ -->
        <ng-container *ngIf="isTresorier()">

          <div class="nav-section-label">{{ 'ADMIN.DOCUMENTATION' | translate }}</div>

          <a class="nav-item" routerLink="/admin/ged" routerLinkActive="active">
            <i class="bi bi-folder-fill"></i>
            <span>{{ 'ADMIN.DOCUMENTS' | translate }}</span>
          </a>

        </ng-container>

        <!-- ════════════════════════════════
             ESPACE MEMBRE
        ════════════════════════════════ -->
        <ng-container *ngIf="isMembre()">

          <div class="nav-section-label">{{ 'ADMIN.MON_ESPACE' | translate }}</div>

          <a class="nav-item" routerLink="/admin/mes-clubs" routerLinkActive="active">
            <i class="bi bi-trophy"></i>
            <span>{{ 'ADMIN.MES_CLUBS' | translate }}</span>
          </a>

          <a class="nav-item" routerLink="/admin/ged" routerLinkActive="active">
            <i class="bi bi-folder-fill"></i>
            <span>{{ 'ADMIN.MES_DOCUMENTS' | translate }}</span>
          </a>

        </ng-container>

        <!-- ════════════════════════════════
             SITE PUBLIC
        ════════════════════════════════ -->
        <div class="nav-section-label">{{ 'ADMIN.SITE' | translate }}</div>

        <a class="nav-item" routerLink="/">
          <i class="bi bi-globe"></i>
          <span>{{ 'ADMIN.SITE_PUBLIC' | translate }}</span>
        </a>

      </nav>

      <!-- ── Déconnexion ── -->
      <div class="sidebar-footer">
        <button class="logout-btn w-100" (click)="logout()">
          <i class="bi bi-box-arrow-right me-2"></i>
          {{ 'NAV.LOGOUT' | translate }}
        </button>
      </div>

    </aside>
  `,
  styles: [`
    .admin-sidebar {
      width: 260px;
      background: linear-gradient(180deg, #0f2318 0%, #0f1923 100%);
      min-height: 100vh;
      position: fixed;
      left: 0; top: 0;
      z-index: 1000;
      overflow-y: auto;
    }
    .sidebar-header {
      padding: 20px 16px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .sidebar-logo {
      width: 38px; height: 38px;
      background: linear-gradient(135deg, #1a6b3c, #2d9e5f);
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      color: white; font-size: 1.2rem;
    }
    .sidebar-profile {
      padding: 14px 16px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      display: flex; align-items: center; gap: 10px;
    }
    .profile-avatar {
      width: 38px; height: 38px;
      background: linear-gradient(135deg, #1a6b3c, #1e4d7b);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      color: white; font-weight: 700; font-size: 0.8rem;
    }
    .profile-name {
      color: white; font-weight: 600; font-size: 0.85rem;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .role-chip {
      display: inline-block; padding: 2px 8px;
      border-radius: 20px; font-size: 0.65rem; font-weight: 700; margin-top: 3px;
    }
    .sidebar-nav { padding: 10px; }
    .nav-section-label {
      font-size: 0.6rem; text-transform: uppercase; letter-spacing: 1.5px;
      color: rgba(255,255,255,0.3); padding: 12px 10px 4px; font-weight: 700;
    }
    .nav-item {
      display: flex; align-items: center; gap: 10px;
      padding: 9px 12px; color: rgba(255,255,255,0.65);
      text-decoration: none; border-radius: 9px; margin-bottom: 2px;
      transition: all 0.2s; font-size: 0.88rem; font-weight: 500; cursor: pointer;
    }
    .nav-item:hover { background: rgba(255,255,255,0.08); color: white; }
    .nav-item.active {
      background: linear-gradient(135deg, rgba(26,107,60,0.5), rgba(30,77,123,0.3));
      color: white; border-left: 3px solid #2d9e5f;
    }
    .nav-item i { font-size: 1rem; min-width: 18px; }
    .nav-badge {
      margin-left: auto; font-size: 0.6rem; padding: 2px 6px;
      border-radius: 10px; font-weight: 700;
      background: rgba(255,255,255,0.12); color: rgba(255,255,255,0.6);
    }
    .nav-badge.new { background: rgba(255,193,7,0.3); color: #ffc107; }
    .sidebar-footer {
      padding: 12px;
      border-top: 1px solid rgba(255,255,255,0.08);
    }
    .logout-btn {
      background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.65);
      border: 1px solid rgba(255,255,255,0.1); border-radius: 9px;
      padding: 9px 16px; font-size: 0.88rem; cursor: pointer; transition: all 0.2s;
    }
    .logout-btn:hover {
      background: rgba(220,53,69,0.25); color: #ff6b6b;
      border-color: rgba(220,53,69,0.4);
    }
  `]
})
export class SidebarComponent implements OnInit {

  currentUser: AuthResponse | null = null;
  demandesEnAttente = 0;

  constructor(
    public authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(u => { this.currentUser = u; });
    if (this.hasGestion()) { this.loadDemandesStats(); }
  }

  loadDemandesStats(): void {
    this.http.get<any>(`${environment.apiUrl}/demandes-inscription/stats`).subscribe({
      next: (s) => { this.demandesEnAttente = s.enAttente; },
      error: () => {}
    });
  }

  isAdmin()        { return this.authService.isAdmin(); }
  isAdministratif(){ return this.authService.isAdministratif(); }
  isTresorier()    { return this.authService.isTresorier(); }
  isFormateur()    { return this.authService.isFormateur(); }
  isAnimateur()    { return this.authService.isAnimateur(); }
  isMembre()       { return this.authService.isMembre(); }
  hasGestion()     { return this.authService.hasGestionAccess(); }
  hasFinance()     { return this.authService.hasFinanceAccess(); }
  canSaisirPresence() { return this.authService.canSaisirPresence() && !this.isMembre(); }

  getRoleLabel(): string {
    return ROLE_LABELS[this.currentUser?.role!] || this.currentUser?.role || '';
  }
  getRoleColor(): string {
    return ROLE_COLORS[this.currentUser?.role!] || '#6c757d';
  }
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}