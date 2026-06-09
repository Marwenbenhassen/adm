import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { GedService, GedDocument } from '../../../core/services/ged.service';
import { DOCUMENT_CATEGORIES, AVAILABLE_ROLES } from '../../../models/ged.models';
import { AuthService } from '../../../core/services/auth.service';
import { saveAs } from 'file-saver';
import { SidebarComponent } from '../../../shared/sidebar/sidebar.component';

declare var bootstrap: any;

@Component({
  selector: 'app-ged-document-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SidebarComponent],
  templateUrl: './document-list.component.html',
  styleUrls: ['./document-list.component.css']
})
export class GedDocumentListComponent implements OnInit {
  private gedService = inject(GedService);
  private authService = inject(AuthService);
  private router = inject(Router);

  documents: GedDocument[] = [];
  loading = true;
  categories = DOCUMENT_CATEGORIES;
  availableRoles = AVAILABLE_ROLES;
  years: number[] = [];
  showArchived = false;
  searchTitle = '';
  searchCategory = '';
  searchYear = '';
  currentRole = '';
  selectionMode = false;
  selectedIds: number[] = [];
  selectedDoc: GedDocument | null = null;
  permissions = { visibleToAll: true, allowedRoles: [] as string[] };

  constructor() {
    const currentYear = new Date().getFullYear();
    for (let y = currentYear; y >= currentYear - 10; y--) this.years.push(y);
    this.currentRole = this.authService.getRole();
  }

  ngOnInit(): void {
    this.loadCategories();
    this.search();
  }

  loadCategories(): void {
    this.gedService.getCategories().subscribe({
      next: (data) => {
        const dynamic = data || [];
        const staticNames = DOCUMENT_CATEGORIES.map(c => c.value);
        const dynamicMapped = dynamic
          .filter(c => !staticNames.includes(c.name))
          .map(c => ({ value: c.name, label: c.name, icon: 'bi-folder' }));
        this.categories = [...DOCUMENT_CATEGORIES, ...dynamicMapped];
      },
      error: (err) => {
        console.error('Erreur chargement categories:', err);
      }
    });
  }

  search(): void {
    this.loading = true;
    const params: any = {};
    if (this.searchTitle) params.title = this.searchTitle;
    if (this.searchCategory) params.category = this.searchCategory;
    if (this.searchYear) params.year = this.searchYear;
    if (!this.showArchived) params.status = 'ACTIVE';
    this.gedService.searchDocuments(params).subscribe({
      next: (res: any) => { this.documents = res.content || []; this.loading = false; },
      error: () => this.loading = false
    });
  }

  resetFilters(): void { this.searchTitle = ''; this.searchCategory = ''; this.searchYear = ''; this.search(); }
  toggleArchived(): void { this.showArchived = !this.showArchived; this.search(); }

  download(doc: GedDocument): void {
    this.gedService.downloadDocument(doc.id!).subscribe({
      next: (blob) => saveAs(blob, doc.fileName || `document_${doc.id}.pdf`),
      error: () => alert('Erreur de téléchargement')
    });
  }

  canArchive(): boolean { return this.currentRole === 'ADMIN' || this.currentRole === 'ADMINISTRATIF'; }
  canDelete(): boolean { return this.currentRole === 'ADMIN'; }
  canUpload(): boolean { return this.currentRole === 'ADMIN' || this.currentRole === 'ADMINISTRATIF' || this.currentRole === 'TRESORIER'; }
  canManagePermissions(): boolean { return this.currentRole === 'ADMIN' || this.currentRole === 'TRESORIER' || this.currentRole === 'ADMINISTRATIF'; }
  isAdmin(): boolean { return this.currentRole === 'ADMIN'; }

  archive(doc: GedDocument): void {
    if (confirm('Archiver ?')) this.gedService.archiveDocument(doc.id!).subscribe(() => this.search());
  }
  restore(doc: GedDocument): void {
    if (confirm('Restaurer ?')) this.gedService.restoreDocument(doc.id!).subscribe(() => this.search());
  }
  deleteDoc(doc: GedDocument): void {
    if (confirm('Supprimer ?')) this.gedService.deleteDocument(doc.id!).subscribe(() => this.search());
  }
  goToUpload(): void { this.router.navigate(['/admin/ged/upload']); }

  openPermissionsModal(doc: GedDocument): void {
    this.selectedDoc = doc;
    this.permissions.visibleToAll = doc.visibleToAll !== false;
    this.permissions.allowedRoles = doc.allowedRoles ? doc.allowedRoles.split(',') : [];
    const modal = new bootstrap.Modal(document.getElementById('permissionsModal'));
    modal.show();
  }

  toggleRole(role: string): void {
    const idx = this.permissions.allowedRoles.indexOf(role);
    idx === -1 ? this.permissions.allowedRoles.push(role) : this.permissions.allowedRoles.splice(idx, 1);
  }

  isRoleSelected(role: string): boolean { return this.permissions.allowedRoles.indexOf(role) !== -1; }

  savePermissions(): void {
    if (!this.selectedDoc) return;
    this.gedService.updatePermissions(this.selectedDoc.id!, {
      visibleToAll: this.permissions.visibleToAll,
      allowedRoles: this.permissions.visibleToAll ? '' : this.permissions.allowedRoles.join(',')
    }).subscribe(() => {
      alert('Permissions mises à jour');
      this.search();
      bootstrap.Modal.getInstance(document.getElementById('permissionsModal'))?.hide();
    });
  }

  toggleSelectionMode(): void { this.selectionMode = !this.selectionMode; this.selectedIds = []; }
  toggleSelection(id: number): void {
    const idx = this.selectedIds.indexOf(id);
    idx === -1 ? this.selectedIds.push(id) : this.selectedIds.splice(idx, 1);
  }
  isSelected(id: number): boolean { return this.selectedIds.indexOf(id) !== -1; }

  deleteSelected(): void {
    if (this.selectedIds.length && confirm(`Supprimer ${this.selectedIds.length} document(s) ?`)) {
      this.gedService.deleteSelectedDocuments(this.selectedIds).subscribe(() => {
        alert('Documents supprimés');
        this.selectionMode = false;
        this.selectedIds = [];
        this.search();
      });
    }
  }

  openDeleteAllModal(): void { new bootstrap.Modal(document.getElementById('deleteAllModal')).show(); }
  confirmDeleteAll(): void {
    this.gedService.deleteAllDocuments().subscribe(() => {
      alert('Tous les documents supprimés');
      this.search();
      bootstrap.Modal.getInstance(document.getElementById('deleteAllModal'))?.hide();
    });
  }
}
