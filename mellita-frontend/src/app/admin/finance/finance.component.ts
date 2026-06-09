import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { TransactionService, DonService } from '../../core/services/api.services';
import { Transaction, Don, Bilan } from '../../models/models';
import * as FileSaver from 'file-saver';

// ============ VALIDATEURS PERSONNALISÉS ============
function alphaNumWithAccentsValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value || control.value === '') return null;
  const pattern = /^[a-zA-ZÀ-ÿ0-9\s\-'´`,.()]+$/;
  if (pattern.test(control.value)) {
    return null;
  }
  return { notAlphabetic: true };
}

// Interface pour les catégories
interface CategorieFinance {
  id?: number;
  nom: string;
  type: string;
  description?: string;
  icon?: string;
  couleur?: string;
  parDefaut?: boolean;
  active?: boolean;
}

@Component({
  selector: 'app-finance',
  template: `
    <div class="d-flex">
      <app-sidebar></app-sidebar>
      <div class="admin-content flex-grow-1">
        <div class="admin-topbar d-flex justify-content-between align-items-center">
          <div>
            <h4 class="mb-0 fw-bold"><i class="bi bi-cash-coin me-2 text-warning"></i>Gestion Financière</h4>
            <small class="text-muted">Suivi des recettes et dépenses</small>
          </div>
          <div>
            <button class="btn btn-info me-2" (click)="exportToCSV()">
              <i class="bi bi-file-spreadsheet me-2"></i>CSV
            </button>
            <button class="btn btn-secondary me-2" (click)="exportToPDF()">
              <i class="bi bi-file-pdf me-2"></i>PDF
            </button>
            <button class="btn btn-mellita" (click)="openModal()">
              <i class="bi bi-plus-lg me-2"></i>Nouvelle Transaction
            </button>
          </div>
        </div>

        <div class="p-4">
          <!-- Bilan Cards -->
          <div class="row g-4 mb-4" *ngIf="bilan">
            <div class="col-6 col-lg-3">
              <div class="bilan-card" style="border-left-color:#28a745">
                <div class="bilan-icon" style="background:#d4edda;color:#28a745"><i class="bi bi-arrow-up-circle-fill"></i></div>
                <div class="bilan-value text-success">{{ bilan.totalRecettes | number:'1.0-2' }}</div>
                <div class="bilan-label">Recettes (TND)</div>
              </div>
            </div>
            <div class="col-6 col-lg-3">
              <div class="bilan-card" style="border-left-color:#dc3545">
                <div class="bilan-icon" style="background:#f8d7da;color:#dc3545"><i class="bi bi-arrow-down-circle-fill"></i></div>
                <div class="bilan-value text-danger">{{ bilan.totalDepenses | number:'1.0-2' }}</div>
                <div class="bilan-label">Dépenses (TND)</div>
              </div>
            </div>
            <div class="col-6 col-lg-3">
              <div class="bilan-card" style="border-left-color:#c8a84b">
                <div class="bilan-icon" style="background:#fef9e7;color:#c8a84b"><i class="bi bi-heart-fill"></i></div>
                <div class="bilan-value" style="color:#c8a84b">{{ bilan.totalDons | number:'1.0-2' }}</div>
                <div class="bilan-label">Dons (TND)</div>
              </div>
            </div>
            <div class="col-6 col-lg-3">
              <div class="bilan-card" [style.border-left-color]="bilan.solde >= 0 ? '#1a6b3c' : '#dc3545'">
                <div class="bilan-icon" [style.background]="bilan.solde >= 0 ? '#d4edda' : '#f8d7da'"
                     [style.color]="bilan.solde >= 0 ? '#1a6b3c' : '#dc3545'">
                  <i class="bi bi-wallet2-fill"></i>
                </div>
                <div class="bilan-value" [class.text-success]="bilan.solde >= 0" [class.text-danger]="bilan.solde < 0">
                  {{ bilan.solde | number:'1.0-2' }}
                </div>
                <div class="bilan-label">Solde (TND)</div>
              </div>
            </div>
          </div>

          <!-- Filtres -->
          <div class="filters-section mb-4">
            <div class="card">
              <div class="card-header bg-white d-flex justify-content-between align-items-center">
                <h6 class="mb-0"><i class="bi bi-funnel me-2"></i>Filtres</h6>
                <div class="btn-group">
                  <button class="btn btn-sm btn-outline-success" (click)="openCategorieModal('RECETTE')">
                    <i class="bi bi-plus-circle me-1"></i>Nouvelle Recette
                  </button>
                  <button class="btn btn-sm btn-outline-danger" (click)="openCategorieModal('DEPENSE')">
                    <i class="bi bi-plus-circle me-1"></i>Nouvelle Dépense
                  </button>
                </div>
              </div>
              <div class="card-body">
                <div class="row g-3">
                  <div class="col-md-3">
                    <label class="form-label">Date début</label>
                    <input type="date" class="form-control" [(ngModel)]="dateDebut" (change)="applyFiltres()">
                  </div>
                  <div class="col-md-3">
                    <label class="form-label">Date fin</label>
                    <input type="date" class="form-control" [(ngModel)]="dateFin" (change)="applyFiltres()">
                  </div>
                  <div class="col-md-3">
                    <label class="form-label">Type</label>
                    <select class="form-select" [(ngModel)]="typeFiltre" (change)="applyFiltres()">
                      <option value="">Tous</option>
                      <option value="RECETTE">Recettes</option>
                      <option value="DEPENSE">Dépenses</option>
                    </select>
                  </div>
                  <div class="col-md-3">
                    <label class="form-label">Catégorie</label>
                    <select class="form-select" [(ngModel)]="categorieFiltre" (change)="applyFiltres()">
                      <option value="">Toutes</option>
                      <optgroup label="Recettes">
                        <option *ngFor="let c of categoriesRecettes" [value]="c.id">{{ c.nom }}</option>
                      </optgroup>
                      <optgroup label="Dépenses">
                        <option *ngFor="let c of categoriesDepenses" [value]="c.id">{{ c.nom }}</option>
                      </optgroup>
                    </select>
                  </div>
                </div>

                <div class="row mt-3">
                  <div class="col-12">
                    <div class="d-flex flex-wrap gap-2 align-items-center">
                      <span class="text-muted small">Gestion rapide:</span>

                      <div class="dropdown d-inline-block">
                        <button class="btn btn-sm btn-outline-success dropdown-toggle" data-bs-toggle="dropdown">
                          <i class="bi bi-tag me-1"></i>Recettes
                        </button>
                        <div class="dropdown-menu p-2" style="min-width: 250px;">
                          <div class="fw-bold px-2 py-1 border-bottom mb-2">Gérer les catégories Recettes</div>
                          <div *ngFor="let cat of categoriesRecettes" class="d-flex justify-content-between align-items-center px-2 py-1">
                            <span>
                              <span class="color-dot-sm" [style.backgroundColor]="cat.couleur || '#28a745'"></span>
                              {{ cat.nom }}
                              <span *ngIf="cat.parDefaut" class="badge-default-edit ms-1">Défaut</span>
                            </span>
                            <div>
                              <button class="btn btn-sm btn-link p-0 me-2" (click)="editCategorie(cat)">
                                <i class="bi bi-pencil-square text-warning"></i>
                              </button>
                              <button class="btn btn-sm btn-link p-0" (click)="confirmDelete(cat)" [disabled]="cat.parDefaut">
                                <i class="bi bi-trash text-danger" [class.text-muted]="cat.parDefaut"></i>
                              </button>
                            </div>
                          </div>
                          <div class="dropdown-divider"></div>
                          <button class="btn btn-sm btn-success w-100" (click)="openCategorieModal('RECETTE')">
                            <i class="bi bi-plus-lg"></i> Ajouter une recette
                          </button>
                        </div>
                      </div>

                      <div class="dropdown d-inline-block">
                        <button class="btn btn-sm btn-outline-danger dropdown-toggle" data-bs-toggle="dropdown">
                          <i class="bi bi-tag me-1"></i>Dépenses
                        </button>
                        <div class="dropdown-menu p-2" style="min-width: 250px;">
                          <div class="fw-bold px-2 py-1 border-bottom mb-2">Gérer les catégories Dépenses</div>
                          <div *ngFor="let cat of categoriesDepenses" class="d-flex justify-content-between align-items-center px-2 py-1">
                            <span>
                              <span class="color-dot-sm" [style.backgroundColor]="cat.couleur || '#dc3545'"></span>
                              {{ cat.nom }}
                              <span *ngIf="cat.parDefaut" class="badge-default-edit ms-1">Défaut</span>
                            </span>
                            <div>
                              <button class="btn btn-sm btn-link p-0 me-2" (click)="editCategorie(cat)">
                                <i class="bi bi-pencil-square text-warning"></i>
                              </button>
                              <button class="btn btn-sm btn-link p-0" (click)="confirmDelete(cat)" [disabled]="cat.parDefaut">
                                <i class="bi bi-trash text-danger" [class.text-muted]="cat.parDefaut"></i>
                              </button>
                            </div>
                          </div>
                          <div class="dropdown-divider"></div>
                          <button class="btn btn-sm btn-danger w-100" (click)="openCategorieModal('DEPENSE')">
                            <i class="bi bi-plus-lg"></i> Ajouter une dépense
                          </button>
                        </div>
                      </div>

                      <button class="btn btn-primary btn-sm ms-auto" (click)="applyFiltres()">
                        <i class="bi bi-search me-1"></i>Appliquer
                      </button>
                      <button class="btn btn-secondary btn-sm" (click)="resetFiltres()">
                        <i class="bi bi-arrow-repeat me-1"></i>Réinitialiser
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Tabs -->
          <div class="tabs-bar mb-4">
            <button class="tab-btn" [class.active]="activeTab === 'transactions'" (click)="activeTab = 'transactions'">
              <i class="bi bi-list-ul me-2"></i>Transactions ({{ filteredTransactions.length }})
            </button>
            <button class="tab-btn" [class.active]="activeTab === 'dons'" (click)="activeTab = 'dons'">
              <i class="bi bi-heart me-2"></i>Dons ({{ dons.length }})
            </button>
          </div>

          <!-- Transactions Table -->
          <div *ngIf="activeTab === 'transactions'">
            <div class="table-responsive admin-table-wrap">
              <table class="table table-mellita mb-0">
                <thead>
                  <tr>
                    <th>Libellé</th>
                    <th>Type</th>
                    <th>Catégorie</th>
                    <th>Montant</th>
                    <th>Date</th>
                    <th>Référence</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let t of filteredTransactions">
                    <td class="fw-semibold">{{ t.libelle }}</td>
                    <td>
                      <span class="type-badge" [class.recette]="t.type==='RECETTE'" [class.depense]="t.type==='DEPENSE'">
                        {{ t.type }}
                      </span>
                    </td>
                    <td><span class="cat-badge">{{ t.categorie }}</span></td>
                    <td [class.text-success]="t.type==='RECETTE'" [class.text-danger]="t.type==='DEPENSE'" class="fw-bold">
                      {{ t.type === 'RECETTE' ? '+' : '-' }}{{ t.montant | number:'1.0-2' }} TND
                    </td>
                    <td class="text-muted">{{ t.dateTransaction | date:'dd/MM/yyyy' }}</td>
                    <td class="small text-muted">{{ t.reference || '-' }}</td>
                    <td>
                      <button class="btn btn-sm btn-icon-del" (click)="deleteTransaction(t.id!)">
                        <i class="bi bi-trash-fill"></i>
                      </button>
                    </td>
                  </tr>
                  <tr *ngIf="filteredTransactions.length === 0">
                    <td colspan="7" class="text-center text-muted py-5">Aucune transaction</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Dons Table -->
          <div *ngIf="activeTab === 'dons'">
            <div class="table-responsive admin-table-wrap">
              <table class="table table-mellita mb-0">
                <thead>
                  <tr>
                    <th>Donateur</th>
                    <th>Montant</th>
                    <th>Date</th>
                    <th>Message</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let d of dons">
                    <td>
                      <div class="fw-semibold">{{ d.anonyme ? 'Anonyme' : d.donateur }}</div>
                      <small class="text-muted">{{ d.email }}</small>
                    </td>
                    <td class="fw-bold text-warning">{{ d.montant | number:'1.0-2' }} TND</td>
                    <td>{{ d.dateDon | date:'dd/MM/yyyy' }}</td>
                    <td><small>{{ d.message || '-' }}</small></td>
                    <td>
                      <span class="status-badge {{ d.statut?.toLowerCase() }}">{{ d.statut }}</span>
                    </td>
                    <td>
                      <div class="d-flex gap-1">
                        <button class="btn btn-sm btn-icon-ok" *ngIf="d.statut === 'EN_ATTENTE'"
                                (click)="updateDonStatut(d.id!, 'CONFIRME')">
                          <i class="bi bi-check-lg"></i>
                        </button>
                        <button class="btn btn-sm btn-icon-del" (click)="deleteDon(d.id!)">
                          <i class="bi bi-trash-fill"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Transaction Modal -->
    <div class="modal-overlay" *ngIf="showModal" (click)="closeModal()">
      <div class="modal-box" (click)="$event.stopPropagation()">
        <div class="modal-header-custom">
          <h5 class="fw-bold mb-0">Nouvelle Transaction</h5>
          <button class="btn-close-custom" (click)="closeModal()"><i class="bi bi-x-lg"></i></button>
        </div>
        <div class="modal-body-custom">
          <form [formGroup]="transactionForm">
            <div class="mb-3">
              <label class="form-label">Libellé *</label>
              <input type="text" class="form-control" formControlName="libelle"
                     placeholder="Ex: Cotisations membres"
                     [class.is-invalid]="transactionForm.get('libelle')?.invalid && transactionForm.get('libelle')?.touched">
              <div class="text-danger small mt-1" *ngIf="transactionForm.get('libelle')?.invalid && transactionForm.get('libelle')?.touched">
                <span *ngIf="transactionForm.get('libelle')?.errors?.['required']">⛔ Le libellé est obligatoire</span>
                <span *ngIf="transactionForm.get('libelle')?.errors?.['notAlphabetic']">⛔ Le libellé doit contenir uniquement des lettres, chiffres, espaces, apostrophes et tirets</span>
              </div>
            </div>

            <div class="row g-3">
              <div class="col-6">
                <label class="form-label">Type *</label>
                <select class="form-select" formControlName="type"
                        [class.is-invalid]="transactionForm.get('type')?.invalid && transactionForm.get('type')?.touched"
                        (change)="onTypeChange()">
                  <option value="">— Sélectionnez un type —</option>
                  <option value="RECETTE">Recette</option>
                  <option value="DEPENSE">Dépense</option>
                </select>
                <div class="text-danger small mt-1" *ngIf="transactionForm.get('type')?.invalid && transactionForm.get('type')?.touched">
                  ⛔ Le type est obligatoire
                </div>
              </div>

              <div class="col-6">
                <label class="form-label">Catégorie *</label>
                <select class="form-select" formControlName="categorie"
                        [class.is-invalid]="transactionForm.get('categorie')?.invalid && transactionForm.get('categorie')?.touched">
                  <option value="">— Sélectionnez une catégorie —</option>
                  <option *ngFor="let cat of dynamicCategories" [value]="cat.nom">
                    {{ cat.nom }}
                  </option>
                </select>
                <div class="text-danger small mt-1" *ngIf="transactionForm.get('categorie')?.invalid && transactionForm.get('categorie')?.touched">
                  ⛔ La catégorie est obligatoire
                </div>
              </div>

              <div class="col-6">
                <label class="form-label">Montant (TND) *</label>
                <input type="number" class="form-control" formControlName="montant" min="0.01" step="0.01"
                       [class.is-invalid]="transactionForm.get('montant')?.invalid && transactionForm.get('montant')?.touched">
                <div class="text-danger small mt-1" *ngIf="transactionForm.get('montant')?.invalid && transactionForm.get('montant')?.touched">
                  <span *ngIf="transactionForm.get('montant')?.errors?.['required']">⛔ Le montant est obligatoire</span>
                  <span *ngIf="transactionForm.get('montant')?.errors?.['min']">⛔ Le montant doit être > 0 TND</span>
                </div>
              </div>

              <div class="col-6">
                <label class="form-label">Date *</label>
                <input type="date" class="form-control" formControlName="dateTransaction"
                       [class.is-invalid]="transactionForm.get('dateTransaction')?.invalid && transactionForm.get('dateTransaction')?.touched">
                <div class="text-danger small mt-1" *ngIf="transactionForm.get('dateTransaction')?.invalid && transactionForm.get('dateTransaction')?.touched">
                  ⛔ La date est obligatoire
                </div>
              </div>
            </div>

            <div class="mt-3">
              <label class="form-label">Description</label>
              <textarea class="form-control" formControlName="description" rows="3"></textarea>
            </div>

            <div class="mt-3">
              <label class="form-label">Référence *</label>
              <input type="text" class="form-control" formControlName="reference"
                     placeholder="Ex: FACT-2024-001, RECU-001"
                     [class.is-invalid]="transactionForm.get('reference')?.invalid && transactionForm.get('reference')?.touched">
              <div class="text-danger small mt-1" *ngIf="transactionForm.get('reference')?.invalid && transactionForm.get('reference')?.touched">
                <span *ngIf="transactionForm.get('reference')?.errors?.['required']">⛔ La référence est obligatoire</span>
                <span *ngIf="transactionForm.get('reference')?.errors?.['notAlphabetic']">⛔ La référence doit contenir uniquement des lettres, chiffres, espaces, apostrophes et tirets</span>
              </div>
            </div>

            <div class="alert alert-danger mt-3" *ngIf="transactionForm.invalid && transactionForm.touched">
              <i class="bi bi-exclamation-triangle-fill me-2"></i>
              Veuillez corriger toutes les erreurs ci-dessus avant d'enregistrer.
            </div>
          </form>
        </div>
        <div class="modal-footer-custom">
          <button class="btn btn-outline-secondary" (click)="closeModal()">Annuler</button>
          <button class="btn btn-mellita" (click)="saveTransaction()" [disabled]="saving || transactionForm.invalid">
            <span *ngIf="!saving"><i class="bi bi-check-lg me-1"></i>Enregistrer</span>
            <span *ngIf="saving"><span class="spinner-border spinner-border-sm me-1"></span>...</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Catégorie -->
    <div class="modal-overlay" *ngIf="showCategorieModal" (click)="closeCategorieModal()">
      <div class="modal-box" (click)="$event.stopPropagation()">
        <div class="modal-header-custom">
          <h5 class="fw-bold mb-0">
            <i class="bi bi-tag-fill me-2" [class.text-success]="selectedCategorieType === 'RECETTE'" [class.text-danger]="selectedCategorieType === 'DEPENSE'"></i>
            {{ editMode ? 'Modifier' : 'Ajouter' }} une catégorie de {{ selectedCategorieType === 'RECETTE' ? 'Recette' : 'Dépense' }}
          </h5>
          <button class="btn-close-custom" (click)="closeCategorieModal()"><i class="bi bi-x-lg"></i></button>
        </div>
        <div class="modal-body-custom">
          <form [formGroup]="categorieForm">
            <div class="mb-3">
              <label class="form-label">Nom *</label>
              <input type="text" class="form-control" formControlName="nom" placeholder="Ex: Ventes, Achats...">
            </div>
            <div class="mb-3">
              <label class="form-label">Couleur</label>
              <div class="d-flex align-items-center gap-2">
                <input type="color" class="form-control-color" formControlName="couleur" style="width: 60px; height: 40px;">
                <input type="text" class="form-control" formControlName="couleur" placeholder="#1a6b3c">
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label">Description</label>
              <textarea class="form-control" formControlName="description" rows="2"></textarea>
            </div>
          </form>
        </div>
        <div class="modal-footer-custom">
          <button class="btn btn-secondary" (click)="closeCategorieModal()">Annuler</button>
          <button class="btn" [class.btn-success]="selectedCategorieType === 'RECETTE'" [class.btn-danger]="selectedCategorieType === 'DEPENSE'"
                  (click)="saveCategorie()" [disabled]="categorieForm.invalid">
            <i class="bi bi-check-lg me-1"></i>{{ editMode ? 'Modifier' : 'Ajouter' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal confirmation suppression -->
    <div class="modal-overlay" *ngIf="categorieToDelete" (click)="cancelDelete()">
      <div class="modal-box" style="max-width: 400px;" (click)="$event.stopPropagation()">
        <div class="modal-header-custom">
          <h5 class="fw-bold mb-0 text-danger"><i class="bi bi-exclamation-triangle-fill me-2"></i>Confirmation</h5>
          <button class="btn-close-custom" (click)="cancelDelete()"><i class="bi bi-x-lg"></i></button>
        </div>
        <div class="modal-body-custom">
          <p>Supprimer la catégorie <strong>{{ categorieToDelete?.nom }}</strong> ?</p>
          <small class="text-muted">Cette action est irréversible.</small>
        </div>
        <div class="modal-footer-custom">
          <button class="btn btn-secondary" (click)="cancelDelete()">Annuler</button>
          <button class="btn btn-danger" (click)="deleteCategorie()">Supprimer</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-content { margin-left:260px; background:#f4f6f8; min-height:100vh; }
    .admin-topbar { background: white; padding: 20px 28px; border-bottom: 1px solid #f0f0f0; }
    .btn-mellita { background: linear-gradient(135deg, #1a6b3c, #2d9e5f); color: white; border: none; border-radius: 10px; font-weight: 600; padding: 9px 22px; }
    .btn-mellita:hover { color: white; }
    .btn-mellita:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-info { background-color: #17a2b8; border-color: #17a2b8; color: white; }
    .btn-info:hover { background-color: #138496; border-color: #117a8b; }
    .bilan-card { background: white; border-radius: 16px; padding: 20px; border-left: 4px solid; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
    .bilan-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; margin-bottom: 12px; }
    .bilan-value { font-size: 1.6rem; font-weight: 900; line-height: 1; }
    .bilan-label { color: #6c757d; font-size: 0.8rem; margin-top: 4px; }
    .tabs-bar { display: flex; gap: 4px; background: white; padding: 6px; border-radius: 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); width: fit-content; }
    .tab-btn { background: none; border: none; padding: 8px 20px; border-radius: 10px; font-weight: 600; color: #6c757d; cursor: pointer; transition: all 0.2s; }
    .tab-btn.active { background: #1a6b3c; color: white; }
    .admin-table-wrap { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
    .type-badge { padding: 3px 10px; border-radius: 20px; font-size: 0.72rem; font-weight: 700; }
    .type-badge.recette { background: #d4edda; color: #155724; }
    .type-badge.depense { background: #f8d7da; color: #721c24; }
    .cat-badge { background: #f0f4ff; color: #4361ee; padding: 2px 8px; border-radius: 6px; font-size: 0.72rem; font-weight: 600; }
    .status-badge { padding: 3px 10px; border-radius: 20px; font-size: 0.72rem; font-weight: 700; }
    .status-badge.confirme { background: #d4edda; color: #155724; }
    .status-badge.en_attente { background: #fff3cd; color: #856404; }
    .status-badge.annule { background: #f8d7da; color: #721c24; }
    .btn-icon-del { background: #fde8e8; color: #c0392b; border: none; border-radius: 8px; width: 32px; height: 32px; padding: 0; }
    .btn-icon-ok { background: #d4edda; color: #155724; border: none; border-radius: 8px; width: 32px; height: 32px; padding: 0; }
    .btn-icon-del:hover { background: #c0392b; color: white; }
    .btn-icon-ok:hover { background: #155724; color: white; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 9000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); }
    .modal-box { background: white; border-radius: 20px; width: 100%; max-width: 520px; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
    .modal-header-custom { padding: 20px 24px; border-bottom: 1px solid #f0f0f0; display: flex; justify-content: space-between; align-items: center; }
    .modal-body-custom { padding: 24px; }
    .modal-footer-custom { padding: 16px 24px; border-top: 1px solid #f0f0f0; display: flex; justify-content: flex-end; gap: 10px; }
    .btn-close-custom { background: none; border: none; font-size: 1.1rem; color: #6c757d; cursor: pointer; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
    .btn-close-custom:hover { background: #f0f0f0; }
    .color-dot-sm { display: inline-block; width: 12px; height: 12px; border-radius: 50%; margin-right: 6px; vertical-align: middle; }
    .badge-default-edit { background: #e9ecef; color: #6c757d; padding: 2px 6px; border-radius: 10px; font-size: 0.65rem; }
    .form-control-color { border: 1px solid #e0e0e0; border-radius: 8px; cursor: pointer; }
    .text-danger { color: #dc3545; }
    .is-invalid { border-color: #dc3545; }
    .alert-danger { background-color: #f8d7da; border-color: #f5c6cb; color: #721c24; border-radius: 8px; padding: 10px; }
  `]
})
export class FinanceComponent implements OnInit {
  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  dons: Don[] = [];
  bilan: Bilan | null = null;
  loading = true;
  showModal = false;
  saving = false;
  activeTab = 'transactions';
  transactionForm!: FormGroup;

  // Filtres
  dateDebut: string = '';
  dateFin: string = '';
  typeFiltre: string = '';
  categorieFiltre: string = '';

  // Catégories
  categoriesRecettes: CategorieFinance[] = [];
  categoriesDepenses: CategorieFinance[] = [];
  dynamicCategories: CategorieFinance[] = [];
  showCategorieModal = false;
  editMode = false;
  categorieForm!: FormGroup;
  selectedCategorieType: string = 'RECETTE';
  categorieToDelete: CategorieFinance | null = null;

  // Mapping enum backend pour catégories par défaut
  private readonly defaultCategorieMapping: { [key: string]: string } = {
    'Cotisations': 'COTISATION', 'Cotisation': 'COTISATION',
    'Dons': 'DON', 'Don': 'DON',
    'Événements': 'EVENEMENT', 'Evenements': 'EVENEMENT',
    'Événement': 'EVENEMENT', 'Evenement': 'EVENEMENT',
    'Formations': 'FORMATION', 'Formation': 'FORMATION',
    'Administratif': 'AUTRE', 'Matériel': 'AUTRE',
    'Materiel': 'AUTRE', 'Autre': 'AUTRE'
  };

  constructor(
    private transactionService: TransactionService,
    private donService: DonService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.initCategorieForm();
    this.loadCategoriesFromLocalStorage();
    this.loadTransactionsFromLocalStorage();
    this.loadDataFromBackend();
  }

  buildForm(): void {
    this.transactionForm = this.fb.group({
      libelle: ['', [Validators.required, alphaNumWithAccentsValidator]],
      type: ['', Validators.required],
      categorie: ['', Validators.required],
      montant: [0, [Validators.required, Validators.min(0.01)]],
      dateTransaction: ['', Validators.required],
      description: [''],
      reference: ['', [Validators.required, alphaNumWithAccentsValidator]]
    });
  }

  initCategorieForm(): void {
    this.categorieForm = this.fb.group({
      id: [null],
      nom: ['', [Validators.required, Validators.minLength(2)]],
      type: ['RECETTE', Validators.required],
      couleur: ['#1a6b3c'],
      description: ['']
    });
  }

  // ========== PERSISTANCE LOCALSTORAGE ==========

  private saveCategoriesToLocalStorage(): void {
    const categoriesData = {
      recettes: this.categoriesRecettes,
      depenses: this.categoriesDepenses
    };
    localStorage.setItem('finance_categories', JSON.stringify(categoriesData));
  }

  private loadCategoriesFromLocalStorage(): void {
    const savedData = localStorage.getItem('finance_categories');

    if (savedData) {
      const categoriesData = JSON.parse(savedData);
      this.categoriesRecettes = categoriesData.recettes;
      this.categoriesDepenses = categoriesData.depenses;
    } else {
      // Données par défaut
      this.categoriesRecettes = [
        { id: 1, nom: 'Cotisations', type: 'RECETTE', couleur: '#28a745', parDefaut: true },
        { id: 2, nom: 'Dons', type: 'RECETTE', couleur: '#17a2b8', parDefaut: true },
        { id: 3, nom: 'Événements', type: 'RECETTE', couleur: '#ffc107', parDefaut: true },
        { id: 7, nom: 'Formations', type: 'RECETTE', couleur: '#9C27B0', parDefaut: false }
      ];
      this.categoriesDepenses = [
        { id: 4, nom: 'Administratif', type: 'DEPENSE', couleur: '#dc3545', parDefaut: true },
        { id: 5, nom: 'Événements', type: 'DEPENSE', couleur: '#fd7e14', parDefaut: true },
        { id: 6, nom: 'Matériel', type: 'DEPENSE', couleur: '#6c757d', parDefaut: true }
      ];
    }

    this.onTypeChange();
  }

  private saveTransactionsToLocalStorage(): void {
    localStorage.setItem('finance_transactions', JSON.stringify(this.transactions));
  }

  private loadTransactionsFromLocalStorage(): void {
    const savedTransactions = localStorage.getItem('finance_transactions');
    if (savedTransactions) {
      this.transactions = JSON.parse(savedTransactions);
    } else {
      this.transactions = [];
    }
    this.applyFiltres();
  }

  // ========== CHARGEMENT DONNÉES BACKEND ==========

  loadDataFromBackend(): void {
    this.transactionService.getAll().subscribe(backendTransactions => {
      if (backendTransactions && backendTransactions.length > 0) {
        const localIds = new Set(this.transactions.map(t => t.id));
        const newFromBackend = backendTransactions.filter(t => !localIds.has(t.id));
        if (newFromBackend.length > 0) {
          this.transactions = [...newFromBackend, ...this.transactions];
          this.saveTransactionsToLocalStorage();
        }
      }
      this.applyFiltres();
    });

    this.transactionService.getBilan().subscribe(b => this.bilan = b);
    this.donService.getAll().subscribe(d => {
      this.dons = d;
      this.loading = false;
    });
  }

  onTypeChange(): void {
    const type = this.transactionForm.get('type')?.value;
    if (type === 'RECETTE') {
      this.dynamicCategories = this.categoriesRecettes;
    } else if (type === 'DEPENSE') {
      this.dynamicCategories = this.categoriesDepenses;
    } else {
      this.dynamicCategories = [];
    }
  }

  applyFiltres(): void {
    this.filteredTransactions = this.transactions.filter(t => {
      if (this.dateDebut && t.dateTransaction && new Date(t.dateTransaction) < new Date(this.dateDebut)) {
        return false;
      }
      if (this.dateFin && t.dateTransaction && new Date(t.dateTransaction) > new Date(this.dateFin)) {
        return false;
      }
      if (this.typeFiltre && t.type !== this.typeFiltre) {
        return false;
      }
      if (this.categorieFiltre) {
        const catId = parseInt(this.categorieFiltre);
        const allCategories = [...this.categoriesRecettes, ...this.categoriesDepenses];
        const cat = allCategories.find(c => c.id === catId);
        if (cat) {
          const enumVal = this.defaultCategorieMapping[cat.nom];
          const match = enumVal
            ? (t.categorie === enumVal || t.categorie === cat.nom)
            : (t.categorie === cat.nom);
          if (!match) return false;
        }
      }
      return true;
    });
  }

  resetFiltres(): void {
    this.dateDebut = '';
    this.dateFin = '';
    this.typeFiltre = '';
    this.categorieFiltre = '';
    this.applyFiltres();
  }

  openCategorieModal(type: string): void {
    this.selectedCategorieType = type;
    this.editMode = false;
    this.categorieForm.reset({
      type: type,
      couleur: type === 'RECETTE' ? '#28a745' : '#dc3545',
      nom: ''
    });
    this.showCategorieModal = true;
  }

  editCategorie(cat: CategorieFinance): void {
    this.selectedCategorieType = cat.type;
    this.editMode = true;
    this.categorieForm.patchValue({
      id: cat.id,
      nom: cat.nom,
      type: cat.type,
      couleur: cat.couleur || (cat.type === 'RECETTE' ? '#28a745' : '#dc3545'),
      description: cat.description || ''
    });
    this.showCategorieModal = true;
  }

  saveCategorie(): void {
    if (this.categorieForm.invalid) return;

    const categorie = this.categorieForm.value;

    if (this.editMode) {
      if (categorie.type === 'RECETTE') {
        const index = this.categoriesRecettes.findIndex(c => c.id === categorie.id);
        if (index !== -1) this.categoriesRecettes[index] = categorie;
      } else {
        const index = this.categoriesDepenses.findIndex(c => c.id === categorie.id);
        if (index !== -1) this.categoriesDepenses[index] = categorie;
      }
    } else {
      const newCategorie = { ...categorie, id: Date.now(), parDefaut: false };
      if (categorie.type === 'RECETTE') {
        this.categoriesRecettes.push(newCategorie);
      } else {
        this.categoriesDepenses.push(newCategorie);
      }
    }

    this.saveCategoriesToLocalStorage();
    this.onTypeChange();
    this.closeCategorieModal();
    this.applyFiltres();
  }

  confirmDelete(cat: CategorieFinance): void {
    if (cat.parDefaut) {
      alert('Les catégories par défaut ne peuvent pas être supprimées');
      return;
    }
    this.categorieToDelete = cat;
  }

  deleteCategorie(): void {
    if (this.categorieToDelete) {
      if (this.categorieToDelete.type === 'RECETTE') {
        this.categoriesRecettes = this.categoriesRecettes.filter(c => c.id !== this.categorieToDelete?.id);
      } else {
        this.categoriesDepenses = this.categoriesDepenses.filter(c => c.id !== this.categorieToDelete?.id);
      }
      this.categorieToDelete = null;
      this.saveCategoriesToLocalStorage();
      this.onTypeChange();
      this.applyFiltres();
    }
  }

  cancelDelete(): void {
    this.categorieToDelete = null;
  }

  closeCategorieModal(): void {
    this.showCategorieModal = false;
  }

  exportToCSV(): void {
    const rows = [['Date', 'Libellé', 'Type', 'Catégorie', 'Montant', 'Référence']];
    this.filteredTransactions.forEach(t => {
      rows.push([
        t.dateTransaction || new Date().toISOString().split('T')[0],
        t.libelle,
        t.type,
        t.categorie || '',
        t.montant.toString(),
        t.reference || ''
      ]);
    });
    const csv = rows.map(row => row.join(';')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    FileSaver.saveAs(blob, `bilan_financier_${new Date().toISOString().split('T')[0]}.csv`);
  }

  exportToPDF(): void {
    const printWindow = window.open('', '_blank');
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Bilan Financier</title>
        <meta charset="UTF-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; background: white; }
          h1 { color: #1a6b3c; font-size: 28px; margin-bottom: 10px; border-left: 4px solid #1a6b3c; padding-left: 20px; }
          .subtitle { color: #6c757d; margin-bottom: 30px; padding-left: 24px; font-size: 14px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
          th { background: linear-gradient(135deg, #1a6b3c, #2d9e5f); color: white; padding: 14px 12px; text-align: left; font-weight: 600; }
          td { padding: 12px; border-bottom: 1px solid #e9ecef; color: #495057; }
          .recette { color: #28a745; font-weight: 600; }
          .depense { color: #dc3545; font-weight: 600; }
          .totals { background: #f8f9fa; border-radius: 12px; padding: 20px; margin-top: 20px; }
          .footer { margin-top: 40px; text-align: center; color: #6c757d; font-size: 12px; border-top: 1px solid #e9ecef; padding-top: 20px; }
          .badge { display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
          .badge-recette { background: #d4edda; color: #155724; }
          .badge-depense { background: #f8d7da; color: #721c24; }
        </style>
      </head>
      <body>
        <h1>📊 Bilan Financier</h1>
        <div class="subtitle">Généré le: ${new Date().toLocaleString()}</div>
        <table>
          <thead><tr><th>Date</th><th>Libellé</th><th>Type</th><th>Catégorie</th><th>Montant (TND)</th><th>Référence</th></thead>
          <tbody>`;

    this.filteredTransactions.forEach(t => {
      const date = t.dateTransaction ? new Date(t.dateTransaction).toLocaleDateString('fr-FR') : '-';
      const typeClass = t.type === 'RECETTE' ? 'recette' : 'depense';
      const sign = t.type === 'RECETTE' ? '+' : '-';
      html += `<tr>
        <td>${this.escapeHtml(date)}</td>
        <td><strong>${this.escapeHtml(t.libelle)}</strong></td>
        <td><span class="badge ${t.type === 'RECETTE' ? 'badge-recette' : 'badge-depense'}">${t.type}</span></td>
        <td>${this.escapeHtml(t.categorie || '-')}</td>
        <td class="${typeClass}">${sign} ${t.montant.toFixed(2)}</td>
        <td>${this.escapeHtml(t.reference || '-')}</td>
      </tr>`;
    });

    if (this.filteredTransactions.length === 0) {
      html += `<tr><td colspan="6" style="text-align:center;padding:40px;">Aucune transaction trouvée</td></tr>`;
    }

    html += `
          </tbody>
        </table>
        <div class="totals">
          <p><strong>📈 Total Recettes:</strong> <span style="color:#28a745;font-weight:bold;font-size:18px;">${(this.bilan?.totalRecettes || 0).toFixed(2)} TND</span></p>
          <p><strong>📉 Total Dépenses:</strong> <span style="color:#dc3545;font-weight:bold;font-size:18px;">${(this.bilan?.totalDepenses || 0).toFixed(2)} TND</span></p>
          <p><strong>💵 Solde:</strong> <span style="color:${(this.bilan?.solde || 0) >= 0 ? '#28a745' : '#dc3545'};font-weight:bold;font-size:20px;">${(this.bilan?.solde || 0).toFixed(2)} TND</span></p>
        </div>
        <div class="footer">Document généré automatiquement - Association Mellita</div>
      </body>
      </html>`;

    printWindow?.document.write(html);
    printWindow?.document.close();
    printWindow?.print();
  }

  private escapeHtml(str: string): string {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  openModal(): void {
    this.buildForm();
    this.onTypeChange();
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveTransaction(): void {
    // Marquer tous les champs comme touchés
    Object.keys(this.transactionForm.controls).forEach(key => {
      const control = this.transactionForm.get(key);
      control?.markAsTouched();
    });
    this.transactionForm.markAllAsTouched();

    // Vérifier si le formulaire est valide
    if (this.transactionForm.invalid) {
      console.log('❌ Formulaire invalide - Envoi bloqué');
      console.log('Erreurs détaillées:', this.transactionForm.errors);
      Object.keys(this.transactionForm.controls).forEach(key => {
        const control = this.transactionForm.get(key);
        if (control?.invalid) {
          console.log(`- ${key}:`, control.errors);
        }
      });
      return; // ⛔ BLOQUE L'ENVOI
    }

    this.saving = true;
    const formValue = this.transactionForm.value;

    let categorieValue: string = 'AUTRE';

    if (formValue.categorie && formValue.categorie !== '') {
      if (this.defaultCategorieMapping[formValue.categorie]) {
        categorieValue = this.defaultCategorieMapping[formValue.categorie];
      } else {
        categorieValue = formValue.categorie;
      }
    }

    const newTransaction: any = {
      id: Date.now(),
      libelle: formValue.libelle,
      montant: Number(formValue.montant),
      type: formValue.type,
      categorie: formValue.categorie || 'AUTRE',
      dateTransaction: formValue.dateTransaction,
      description: formValue.description || '',
      reference: formValue.reference || ''
    };

    // Sauvegarder localement d'abord
    this.transactions.unshift(newTransaction);
    this.saveTransactionsToLocalStorage();
    this.applyFiltres();

    // Envoyer au backend
    const transactionData = {
      libelle: formValue.libelle,
      montant: Number(formValue.montant),
      type: formValue.type,
      categorie: categorieValue,
      dateTransaction: formValue.dateTransaction,
      description: formValue.description || '',
      reference: formValue.reference || ''
    };

    this.transactionService.create(transactionData as any).subscribe({
      next: () => {
        this.transactionService.getAll().subscribe(backendTransactions => {
          if (backendTransactions && backendTransactions.length > 0) {
            this.transactions = backendTransactions;
            this.saveTransactionsToLocalStorage();
            this.applyFiltres();
          }
        });
        this.loadDataFromBackend();
        this.closeModal();
        this.saving = false;
      },
      error: (err) => {
        console.error('Erreur création transaction:', err);
        this.saving = false;
        alert('Erreur: ' + (err.error?.message || 'Impossible de créer la transaction, mais sauvegardé localement'));
      }
    });
  }

  deleteTransaction(id: number): void {
    if (!confirm('Supprimer cette transaction ?')) return;

    // Supprimer localement
    this.transactions = this.transactions.filter(t => t.id !== id);
    this.saveTransactionsToLocalStorage();
    this.applyFiltres();

    // Supprimer du backend
    this.transactionService.delete(id).subscribe({
      error: (err) => {
        console.error('Erreur suppression:', err);
      }
    });
  }

  updateDonStatut(id: number, statut: string): void {
    this.donService.updateStatut(id, statut).subscribe(() => this.loadDataFromBackend());
  }

  deleteDon(id: number): void {
    if (!confirm('Supprimer ce don ?')) return;
    this.donService.delete(id).subscribe(() => this.loadDataFromBackend());
  }
}
