import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { UserService } from '../../core/services/api.services';
import { User, Role, ROLE_LABELS, ROLE_COLORS } from '../../models/user.model';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

// ============ VALIDATEURS PERSONNALISÉS ============

function onlyAlpha(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const regex = /^[a-zA-Z\u00C0-\u00FF\s\-']+$/;
  return regex.test(control.value) ? null : { onlyAlpha: true };
}

function emailCustom(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const regex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
  return regex.test(control.value) ? null : { emailInvalide: true };
}

function telephone8(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  return /^\d{8}$/.test(control.value) ? null : { telephone8: true };
}

@Component({
  selector: 'app-users',
  template: `
    <div class="d-flex">
      <app-sidebar></app-sidebar>
      <div class="admin-content flex-grow-1">
        <div class="admin-topbar d-flex justify-content-between align-items-center">
          <div>
            <h4 class="mb-0 fw-bold"><i class="bi bi-people-fill me-2 text-success"></i>Gestion des Membres</h4>
            <small class="text-muted">{{ users.length }} utilisateurs — aucun n'est supprimé définitivement</small>
          </div>
          <button class="btn btn-mellita" (click)="openModal()">
            <i class="bi bi-person-plus-fill me-2"></i>Ajouter
          </button>
        </div>

        <div class="p-4">
          <!-- Filtres -->
          <div class="filters-bar mb-4">
            <div class="row g-3 align-items-center">
              <div class="col-md-4">
                <div class="search-box">
                  <i class="bi bi-search"></i>
                  <input type="text" class="form-control" placeholder="Rechercher..."
                         [(ngModel)]="searchTerm" (input)="filterUsers()">
                </div>
              </div>
              <div class="col-md-3">
                <select class="form-select" [(ngModel)]="roleFilter" (change)="filterUsers()">
                  <option value="">Tous les rôles</option>
                  <option *ngFor="let r of allRoles" [value]="r.value">{{ r.label }}</option>
                </select>
              </div>
              <div class="col-md-3">
                <select class="form-select" [(ngModel)]="statutFilter" (change)="filterUsers()">
                  <option value="">Tous les statuts</option>
                  <option value="ACTIF">Actif</option>
                  <option value="INACTIF">Inactif</option>
                  <option value="EN_ATTENTE">En Attente</option>
                </select>
              </div>
              <div class="col-md-2 text-end">
                <span class="badge bg-light text-dark fw-semibold">{{ filteredUsers.length }} résultat(s)</span>
              </div>
            </div>
          </div>

          <!-- Tableau -->
          <div class="table-responsive admin-table-wrap">
            <div class="text-center py-5" *ngIf="loading">
              <div class="spinner-border text-success"></div>
            </div>
            <table class="table table-mellita mb-0" *ngIf="!loading">
              <thead>
                <tr>
                  <th>Utilisateur</th>
                  <th>Email</th>
                  <th>Téléphone</th>
                  <th>Rôle</th>
                  <th>Statut</th>
                  <th>Adhésion</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let user of filteredUsers; let i = index">
                  <td>
                    <div class="d-flex align-items-center gap-2">
                      <div class="member-avatar" [style.background]="getRoleColor(user.role)">
                        {{ user.prenom?.charAt(0) }}{{ user.nom?.charAt(0) }}
                      </div>
                      <div>
                        <div class="fw-semibold">{{ user.prenom }} {{ user.nom }}</div>
                      </div>
                    </div>
                  </td>
                  <td>{{ user.email }}</td>
                  <td>{{ user.telephone || '—' }}</td>
                  <td>
                    <span class="role-tag" [class]="getRoleClass(user.role)">
                      {{ getRoleLabel(user.role) }}
                    </span>
                  </td>
                  <td>
                    <span class="status-badge" [class]="(user.statut || '').toLowerCase()">
                      {{ user.statut }}
                    </span>
                  </td>
                  <td class="text-muted small">{{ user.dateAdhesion | date:'dd/MM/yyyy' }}</td>
                  <td>
                    <div class="d-flex gap-1">
                      <button class="btn-icon-edit" (click)="editUser(user)" title="Modifier">
                        <i class="bi bi-pencil-fill"></i>
                      </button>
                      <button class="btn-icon-del" (click)="desactiverUser(user)" title="Désactiver"
                              *ngIf="user.statut === 'ACTIF'">
                        <i class="bi bi-person-dash-fill"></i>
                      </button>
                      <button class="action-btn activ" (click)="activerUser(user)" title="Activer"
                              *ngIf="user.statut !== 'ACTIF'">
                        <i class="bi bi-person-check-fill"></i>
                      </button>
                    </div>
                   </td>
                 </tr>
                <tr *ngIf="filteredUsers.length === 0">
                  <td colspan="7" class="text-center text-muted py-5">
                    <i class="bi bi-people fs-1 d-block mb-2" style="opacity:.3"></i>
                    Aucun utilisateur trouvé
                   </td>
                 </tr>
              </tbody>
            </table>
          </div>

          <!-- Info : pas de suppression définitive -->
          <div class="info-note mt-3">
            <i class="bi bi-info-circle-fill me-2 text-info"></i>
            <small>Conformément aux règles de gestion, aucun membre n'est supprimé définitivement. Utilisez le bouton de désactivation.</small>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL -->
    <div class="modal-overlay" *ngIf="showModal" (click)="closeModal()">
      <div class="modal-box" (click)="$event.stopPropagation()">
        <div class="modal-header-custom">
          <h5 class="fw-bold mb-0">
            <i class="bi bi-person-{{ editMode ? 'gear' : 'plus-fill' }} me-2"></i>
            {{ editMode ? 'Modifier' : 'Ajouter' }} un Utilisateur
          </h5>
          <button class="btn-close-custom" (click)="closeModal()"><i class="bi bi-x-lg"></i></button>
        </div>
        <div class="modal-body-custom">
          <form [formGroup]="userForm" novalidate>
            <div class="row g-3">

              <!-- Prénom -->
              <div class="col-6">
                <label class="form-label fw-semibold">Prénom *</label>
                <input type="text" class="form-control"
                       [class.is-invalid]="isInvalid('prenom')"
                       [class.is-valid]="isValid('prenom')"
                       formControlName="prenom">
                <div class="invalid-feedback" *ngIf="hasError('prenom', 'required')">
                  <i class="bi bi-x-circle-fill me-1"></i>Le prénom est obligatoire.
                </div>
                <div class="invalid-feedback" *ngIf="hasError('prenom', 'onlyAlpha')">
                  <i class="bi bi-x-circle-fill me-1"></i>Lettres uniquement, pas de chiffres.
                </div>
              </div>

              <!-- Nom -->
              <div class="col-6">
                <label class="form-label fw-semibold">Nom *</label>
                <input type="text" class="form-control"
                       [class.is-invalid]="isInvalid('nom')"
                       [class.is-valid]="isValid('nom')"
                       formControlName="nom">
                <div class="invalid-feedback" *ngIf="hasError('nom', 'required')">
                  <i class="bi bi-x-circle-fill me-1"></i>Le nom est obligatoire.
                </div>
                <div class="invalid-feedback" *ngIf="hasError('nom', 'onlyAlpha')">
                  <i class="bi bi-x-circle-fill me-1"></i>Lettres uniquement, pas de chiffres.
                </div>
              </div>

              <!-- Email (création uniquement) -->
              <div class="col-12" *ngIf="!editMode">
                <label class="form-label fw-semibold">Email *</label>
                <input type="email" class="form-control"
                       [class.is-invalid]="isInvalid('email')"
                       [class.is-valid]="isValid('email')"
                       formControlName="email">
                <div class="invalid-feedback" *ngIf="hasError('email', 'required')">
                  <i class="bi bi-x-circle-fill me-1"></i>L'email est obligatoire.
                </div>
                <div class="invalid-feedback" *ngIf="hasError('email', 'emailInvalide')">
                  <i class="bi bi-x-circle-fill me-1"></i>Adresse email invalide.
                </div>
              </div>

              <!-- Mot de passe -->
              <div class="col-12">
                <label class="form-label fw-semibold">
                  Mot de Passe 
                </label>
                <input type="password" class="form-control"
                       [class.is-invalid]="isInvalid('motDePasse')"
                       [class.is-valid]="isValid('motDePasse')"
                       formControlName="motDePasse">
                <div class="invalid-feedback" *ngIf="hasError('motDePasse', 'minlength')">
                  <i class="bi bi-x-circle-fill me-1"></i>Minimum 6 caractères.
                </div>
              </div>

              <!-- Téléphone -->
              <div class="col-6">
                <label class="form-label fw-semibold">Téléphone</label>
                <input type="tel" class="form-control"
                       [class.is-invalid]="isInvalid('telephone')"
                       [class.is-valid]="isValid('telephone')"
                       formControlName="telephone" maxlength="8">
                <div class="invalid-feedback" *ngIf="hasError('telephone', 'telephone8')">
                  <i class="bi bi-x-circle-fill me-1"></i>Le téléphone doit contenir exactement 8 chiffres.
                </div>
              </div>

              <!-- Rôle -->
              <div class="col-6">
                <label class="form-label fw-semibold">Rôle *</label>
                <select class="form-select" formControlName="role">
                  <option *ngFor="let r of allRoles" [value]="r.value">{{ r.label }}</option>
                </select>
              </div>

              <!-- Statut (édition uniquement) -->
              <div class="col-6" *ngIf="editMode">
                <label class="form-label fw-semibold">Statut</label>
                <select class="form-select" formControlName="statut">
                  <option value="ACTIF">Actif</option>
                  <option value="INACTIF">Inactif</option>
                  <option value="EN_ATTENTE">En Attente</option>
                </select>
              </div>

              <!-- Adresse -->
              <div class="col-12">
                <label class="form-label fw-semibold">Adresse</label>
                <input type="text" class="form-control" formControlName="adresse">
              </div>

              <!-- Champs supplémentaires pour l'ajout de membre -->
              <div class="col-6" *ngIf="!editMode">
                <label class="form-label fw-semibold">Date de naissance</label>
                <input type="date" class="form-control" formControlName="dateNaissance">
              </div>

              <div class="col-6" *ngIf="!editMode">
                <label class="form-label fw-semibold">Lieu de naissance</label>
                <input type="text" class="form-control" formControlName="lieuNaissance">
              </div>

              <div class="col-6" *ngIf="!editMode">
                <label class="form-label fw-semibold">Nom du père</label>
                <input type="text" class="form-control" formControlName="nomPere">
              </div>

              <div class="col-6" *ngIf="!editMode">
                <label class="form-label fw-semibold">Nom de la mère</label>
                <input type="text" class="form-control" formControlName="nomMere">
              </div>

            </div>
          </form>
        </div>
        <div class="modal-footer-custom">
          <button class="btn btn-outline-secondary" (click)="closeModal()">Annuler</button>
          <button class="btn btn-mellita" (click)="saveUser()" [disabled]="saving">
            <span *ngIf="!saving"><i class="bi bi-check-lg me-1"></i>Enregistrer</span>
            <span *ngIf="saving"><span class="spinner-border spinner-border-sm me-1"></span>Enregistrement...</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-content { margin-left: 260px; background: #f4f6f8; min-height: 100vh; }
    .admin-topbar { background: white; padding: 20px 28px; border-bottom: 1px solid #f0f0f0; }
    .btn-mellita { background: linear-gradient(135deg, #1a6b3c, #2d9e5f); color: white; border: none; border-radius: 10px; font-weight: 600; padding: 9px 22px; transition: all .2s; }
    .btn-mellita:hover { color: white; transform: translateY(-1px); }
    .btn-mellita:disabled { opacity: .7; transform: none; }
    .filters-bar { background: white; border-radius: 16px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
    .search-box { position: relative; }
    .search-box i { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #adb5bd; }
    .search-box input { padding-left: 36px; border-radius: 10px; }
    .admin-table-wrap { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
    .member-avatar { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 0.75rem; flex-shrink: 0; }
    .role-tag { padding: 3px 10px; border-radius: 20px; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; }
    .role-tag.admin { background: #fde8e8; color: #c0392b; }
    .role-tag.administratif { background: #e8f0fe; color: #2c5f8a; }
    .role-tag.tresorier { background: #fef9e7; color: #d35400; }
    .role-tag.formateur { background: #e8f5e9; color: #1a6b3c; }
    .role-tag.animateur { background: #f3e8ff; color: #7b2cbf; }
    .role-tag.membre { background: #eaf7ee; color: #1a6b3c; }
    .status-badge { padding: 3px 10px; border-radius: 20px; font-size: 0.72rem; font-weight: 700; }
    .status-badge.actif { background: #d4edda; color: #155724; }
    .status-badge.inactif { background: #f8d7da; color: #721c24; }
    .status-badge.en_attente { background: #fff3cd; color: #856404; }
    .btn-icon-edit { background: #e8f5e9; color: #1a6b3c; border: none; border-radius: 8px; width: 32px; height: 32px; padding: 0; transition: all .2s; }
    .btn-icon-edit:hover { background: #1a6b3c; color: white; }
    .btn-icon-del { background: #fde8e8; color: #c0392b; border: none; border-radius: 8px; width: 32px; height: 32px; padding: 0; transition: all .2s; }
    .btn-icon-del:hover { background: #c0392b; color: white; }
    .action-btn { width: 32px; height: 32px; border: none; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: .75rem; cursor: pointer; transition: all .2s; }
    .action-btn.activ { background: #d4edda; color: #155724; }
    .action-btn.activ:hover { background: #155724; color: white; }
    .info-note { background: rgba(23,162,184,.08); border: 1px solid rgba(23,162,184,.2); border-radius: 10px; padding: 10px 16px; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 9000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); }
    .modal-box { background: white; border-radius: 20px; width: 100%; max-width: 540px; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
    .modal-header-custom { padding: 20px 24px; border-bottom: 1px solid #f0f0f0; display: flex; justify-content: space-between; align-items: center; }
    .modal-body-custom { padding: 24px; }
    .modal-footer-custom { padding: 16px 24px; border-top: 1px solid #f0f0f0; display: flex; justify-content: flex-end; gap: 10px; }
    .btn-close-custom { background: none; border: none; font-size: 1.1rem; color: #6c757d; cursor: pointer; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; transition: all .2s; }
    .btn-close-custom:hover { background: #f0f0f0; }
    .invalid-feedback { display: block; font-size: 0.82rem; color: #dc3545; margin-top: 4px; }
    .form-control.is-invalid { border-color: #dc3545; background-image: none; }
    .form-control.is-valid { border-color: #198754; background-image: none; }
    @media (max-width: 768px) { .admin-content { margin-left: 0; } .modal-box { max-width: 95%; margin: 10px; } }
  `]
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  loading = true;
  showModal = false;
  editMode = false;
  editingId: number | null = null;
  saving = false;
  formSubmitted = false;
  searchTerm = '';
  roleFilter = '';
  statutFilter = '';
  userForm!: FormGroup;

  allRoles = [
    { value: 'ADMIN', label: 'Administrateur' },
    { value: 'ADMINISTRATIF', label: 'Administratif' },
    { value: 'TRESORIER', label: 'Trésorier' },
    { value: 'FORMATEUR', label: 'Formateur' },
    { value: 'ANIMATEUR', label: 'Animateur de Club' },
    { value: 'MEMBRE', label: 'Membre' },
  ];

  constructor(private userService: UserService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadUsers();
  }

  buildForm(user?: any): void {
    this.formSubmitted = false;

    this.userForm = this.fb.group({
      prenom: [user?.prenom || '', [Validators.required, onlyAlpha]],
      nom: [user?.nom || '', [Validators.required, onlyAlpha]],
      email: [user?.email || '', this.editMode ? [] : [Validators.required, emailCustom]],
      motDePasse: ['', this.editMode ? [Validators.minLength(6)] : [Validators.required, Validators.minLength(6)]],
      telephone: [user?.telephone || '', [telephone8]],
      adresse: [user?.adresse || ''],
      role: [user?.role || 'MEMBRE', Validators.required],
      statut: [user?.statut || 'ACTIF'],
      dateNaissance: [user?.dateNaissance || ''],
      lieuNaissance: [user?.lieuNaissance || ''],
      nomPere: [user?.nomPere || ''],
      nomMere: [user?.nomMere || '']
    });
  }

  isInvalid(field: string): boolean {
    const c = this.userForm.get(field);
    return !!c && c.invalid && (c.touched || this.formSubmitted);
  }

  isValid(field: string): boolean {
    const c = this.userForm.get(field);
    return !!c && c.valid && (c.touched || this.formSubmitted);
  }

  hasError(field: string, error: string): boolean {
    const c = this.userForm.get(field);
    return !!c && c.hasError(error) && (c.touched || this.formSubmitted);
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getAll().subscribe({
      next: (u) => {
        this.users = u.sort((a, b) => (b.id || 0) - (a.id || 0));
        this.filterUsers();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  filterUsers(): void {
    this.filteredUsers = this.users.filter(u => {
      const matchSearch = !this.searchTerm ||
        `${u.prenom} ${u.nom} ${u.email}`.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchRole = !this.roleFilter || u.role === this.roleFilter;
      const matchStatut = !this.statutFilter || (u as any).statut === this.statutFilter;
      return matchSearch && matchRole && matchStatut;
    });
  }

  openModal(): void {
    this.editMode = false;
    this.editingId = null;
    this.buildForm();
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.formSubmitted = false;
  }

  editUser(u: any): void {
    this.editMode = true;
    this.editingId = u.id;
    this.buildForm(u);
    this.showModal = true;
  }

  saveUser(): void {
    this.formSubmitted = true;
    this.userForm.markAllAsTouched();

    if (this.userForm.invalid) return;

    this.saving = true;

    let obs: Observable<any>;
    let data: any = {};

    if (this.editMode) {
      const originalUser = this.users.find(u => u.id === this.editingId);
      const newRole = this.userForm.get('role')?.value;
      const roleChanged = originalUser && originalUser.role !== newRole;

      const generalData = {
        prenom: this.userForm.get('prenom')?.value,
        nom: this.userForm.get('nom')?.value,
        telephone: this.userForm.get('telephone')?.value,
        adresse: this.userForm.get('adresse')?.value,
        statut: this.userForm.get('statut')?.value
      } as any;

      const motDePasse = this.userForm.get('motDePasse')?.value;
      if (motDePasse && motDePasse.trim() !== '') {
        generalData.motDePasse = motDePasse;
      }

      obs = this.userService.update(this.editingId!, generalData).pipe(
        switchMap((res) => {
          if (roleChanged) {
            return this.userService.updateRole(this.editingId!, newRole);
          }
          return of(res);
        })
      );
    } else {
      data = this.userForm.value;
      Object.keys(data).forEach(key => {
        if (data[key] === '' || data[key] === null || data[key] === undefined) {
          delete data[key];
        }
      });
      obs = this.userService.create(data);
    }

    obs.subscribe({
      next: () => {
        this.loadUsers();
        this.closeModal();
        this.saving = false;
      },
      error: (err) => {
        console.error('Erreur lors de la sauvegarde:', err);
        this.saving = false;
      }
    });
  }

  desactiverUser(user: any): void {
    if (!confirm(`Désactiver ${user.prenom} ${user.nom} ? (Non supprimé)`)) return;
    this.userService.update(user.id, { statut: 'INACTIF' }).subscribe(() => this.loadUsers());
  }

  activerUser(user: any): void {
    if (!confirm(`Activer ${user.prenom} ${user.nom} ?`)) return;
    this.userService.update(user.id, { statut: 'ACTIF' }).subscribe(() => this.loadUsers());
  }

  getRoleLabel(role: string): string {
    return ROLE_LABELS[role as Role] || role;
  }

  getRoleColor(role: string): string {
    return ROLE_COLORS[role as Role] || '#6c757d';
  }

  getRoleClass(role: string): string {
    return role.toLowerCase();
  }
}