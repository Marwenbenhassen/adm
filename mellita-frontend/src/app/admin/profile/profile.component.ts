import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/api.services';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  template: `
    <div class="d-flex">
      <app-sidebar></app-sidebar>
      <div class="admin-content flex-grow-1">
        <div class="admin-topbar">
          <h4 class="fw-bold mb-0">
            <i class="bi bi-person-circle me-2 text-primary"></i>
            Mon Profil
          </h4>
        </div>
        <div class="p-4">
          <div class="row">
            <div class="col-md-4">
              <div class="profile-card text-center">
                <div class="profile-avatar">
                  {{ user?.prenom?.charAt(0) }}{{ user?.nom?.charAt(0) }}
                </div>
                <h4 class="mt-3 mb-1">{{ user?.prenom }} {{ user?.nom }}</h4>
                <span class="role-badge" [style.background]="getRoleColor()">
                  {{ getRoleLabel() }}
                </span>
                <p class="text-muted mt-3">{{ user?.email }}</p>
              </div>
            </div>
            <div class="col-md-8">
              <div class="info-card">
                <h5 class="fw-bold mb-3"><i class="bi bi-info-circle me-2"></i>Informations personnelles</h5>
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="text-muted small">Nom complet</label>
                    <p class="fw-semibold">{{ user?.prenom }} {{ user?.nom }}</p>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="text-muted small">Email</label>
                    <p class="fw-semibold">{{ user?.email || 'Non renseigné' }}</p>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="text-muted small">Téléphone</label>
                    <p class="fw-semibold">{{ user?.telephone || 'Non renseigné' }}</p>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="text-muted small">Adresse</label>
                    <p class="fw-semibold">{{ user?.adresse || 'Non renseignée' }}</p>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="text-muted small">Date d'adhésion</label>
                    <p class="fw-semibold">{{ user?.dateAdhesion ? (user.dateAdhesion | date:'dd/MM/yyyy') : 'Non renseignée' }}</p>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="text-muted small">Rôle</label>
                    <p class="fw-semibold">{{ getRoleLabel() }}</p>
                  </div>
                </div>
                <hr>
                <button class="btn btn-mellita" (click)="editProfile()">
                  <i class="bi bi-pencil-square me-2"></i>Modifier mon profil
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Édition Profil -->
    <div class="modal" [class.show]="showEditModal" [style.display]="showEditModal ? 'block' : 'none'" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Modifier mon profil</h5>
            <button type="button" class="btn-close" (click)="closeEditModal()"></button>
          </div>
          <div class="modal-body">
            <form #profileForm="ngForm">
              <div class="mb-3">
                <label class="form-label">Prénom</label>
                <input type="text" class="form-control" [(ngModel)]="editUser.prenom" name="prenom" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Nom</label>
                <input type="text" class="form-control" [(ngModel)]="editUser.nom" name="nom" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Email</label>
                <input type="email" class="form-control" [(ngModel)]="editUser.email" name="email" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Téléphone</label>
                <input type="tel" class="form-control" [(ngModel)]="editUser.telephone" name="telephone">
              </div>
              <div class="mb-3">
                <label class="form-label">Adresse</label>
                <textarea class="form-control" [(ngModel)]="editUser.adresse" name="adresse" rows="2"></textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="closeEditModal()">Annuler</button>
            <button type="button" class="btn btn-mellita" (click)="saveProfile()" [disabled]="profileForm.invalid">Enregistrer</button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show" *ngIf="showEditModal" style="z-index: 1040"></div>
  `,
  styles: [`
    .admin-content { margin-left: 260px; background: #f4f6f8; min-height: 100vh; }
    .admin-topbar { background: white; padding: 20px 28px; border-bottom: 1px solid #f0f0f0; }
    .profile-card { background: white; border-radius: 20px; padding: 30px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.06); }
    .profile-avatar { width: 100px; height: 100px; background: linear-gradient(135deg, #1a6b3c, #2d9e5f); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto; color: white; font-size: 2.5rem; font-weight: bold; }
    .role-badge { display: inline-block; padding: 5px 15px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; color: white; background: #1a6b3c; }
    .info-card { background: white; border-radius: 20px; padding: 25px; box-shadow: 0 2px 10px rgba(0,0,0,0.06); }
    .btn-mellita { background: linear-gradient(135deg, #1a6b3c, #2d9e5f); color: white; border: none; padding: 8px 20px; border-radius: 8px; cursor: pointer; }
    .modal { background-color: rgba(0,0,0,0.5); z-index: 1050; }
    .modal-backdrop { z-index: 1040; }
  `]
})
export class ProfileComponent implements OnInit {
  user: any = {};
  editUser: any = {};
  showEditModal = false;
  roles: any = {};

  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.user = this.authService.getCurrentUser();
    this.loadUserDetails();
  }

  loadUserDetails() {
    if (this.user?.id) {
      this.userService.getById(this.user.id).subscribe({
        next: (data) => {
          this.user = data;
          this.editUser = { ...data };
        },
        error: (err) => console.error(err)
      });
    }
  }

  getRoleLabel(): string {
    const roles: any = {
      'ADMIN': 'Administrateur',
      'ADMINISTRATIF': 'Administratif',
      'TRESORIER': 'Trésorier',
      'FORMATEUR': 'Formateur',
      'ANIMATEUR': 'Animateur',
      'MEMBRE': 'Membre'
    };
    return roles[this.user?.role] || this.user?.role || 'Membre';
  }

  getRoleColor(): string {
    const colors: any = {
      'ADMIN': '#dc3545',
      'ADMINISTRATIF': '#17a2b8',
      'TRESORIER': '#c8a84b',
      'FORMATEUR': '#6f42c1',
      'ANIMATEUR': '#e83e8c',
      'MEMBRE': '#1a6b3c'
    };
    return colors[this.user?.role] || '#6c757d';
  }

  editProfile() {
    this.editUser = { ...this.user };
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
  }

  saveProfile() {
    this.userService.update(this.user.id, this.editUser).subscribe({
      next: (data) => {
        this.user = data;
        this.authService.updateCurrentUser(data);
        alert('Profil mis à jour avec succès !');
        this.closeEditModal();
      },
      error: (err) => {
        console.error(err);
        alert('Erreur lors de la mise à jour du profil');
      }
    });
  }
}