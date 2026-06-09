import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { GedService, Category } from '../../../core/services/ged.service';
import { AuthService } from '../../../core/services/auth.service';
import { SidebarComponent } from '../../../shared/sidebar/sidebar.component';

@Component({
  selector: 'app-ged-document-upload',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SidebarComponent],
  templateUrl: './document-upload.component.html',
  styleUrls: ['./document-upload.component.css']
})
export class GedDocumentUploadComponent implements OnInit {
  private gedService = inject(GedService);
  private router = inject(Router);
  private authService = inject(AuthService);

  selectedFile: File | null = null;
  isAdmin = false;
  title = '';
  description = '';
  category = '';
  year = new Date().getFullYear();
  uploading = false;
  categories: Category[] = [];
  years: number[] = [];
  errorMessage = '';
  loadingCategories = true;

  allowedExtensions: string[] = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png'];
  maxFileSize = 25 * 1024 * 1024;

  private readonly STORAGE_KEY = 'ged_upload_form';

  private readonly STATIC_CATEGORIES: Category[] = [
    { id: 1, name: 'ADMINISTRATIF', description: 'Documents administratifs', active: true },
    { id: 2, name: 'FINANCIER', description: 'Documents financiers', active: true },
    { id: 3, name: 'CLUB', description: 'Documents des clubs', active: true },
    { id: 4, name: 'FORMATION', description: 'Documents de formation', active: true },
    { id: 5, name: 'RAPPORT', description: 'Rapports divers', active: true },
    { id: 6, name: 'CONVENTION', description: 'Conventions et accords', active: true },
    { id: 7, name: 'RESSOURCES_HUMAINES', description: 'Documents RH', active: true },
    { id: 8, name: 'COMMUNICATION', description: 'Communication externe', active: true },
    { id: 9, name: 'TECHNIQUE', description: 'Documents techniques', active: true },
    { id: 10, name: 'JURIDIQUE', description: 'Documents juridiques', active: true }
  ];

  // Variables pour le CRUD des catégories
  categoryForm = { name: '', description: '' };
  editingCategory: Category | null = null;
  savingCategory = false;
  categoryFormError = '';

  constructor() {
    const currentYear = new Date().getFullYear();
    for (let y = currentYear; y >= currentYear - 10; y--) {
      this.years.push(y);
    }
    this.restoreFormData();
  }

  ngOnInit(): void {
    this.isAdmin = this.authService.getRole() === 'ADMIN';
    this.loadCategories();
  }

  private sanitizeCategory(): void {
    if (this.category) {
      this.category = this.category.toUpperCase();
      this.saveFormData();
    }
  }

  private saveFormData(): void {
    const formData = {
      title: this.title,
      description: this.description,
      category: this.category,
      year: this.year
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(formData));
  }

  private restoreFormData(): void {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        this.title = data.title || '';
        this.description = data.description || '';
        this.category = data.category || '';
        this.year = data.year || new Date().getFullYear();
        if (this.category) {
          this.category = this.category.toUpperCase();
        }
        console.log('Restored:', this.category, this.year);
      }
    } catch (e) {
      console.warn('Restore error:', e);
    }
  }

  onFormChange(): void {
    this.saveFormData();
  }

  loadCategories(): void {
    this.loadingCategories = true;

    this.gedService.getCategories().subscribe({
      next: (data) => {
        console.log('✅ Catégories chargées depuis le backend:', data);
        const dynamicCategories = data || [];
        // Fusionner les catégories statiques et dynamiques, sans doublons
        const allCategories = [...this.STATIC_CATEGORIES, ...dynamicCategories];
        this.categories = allCategories.filter((cat, index, self) =>
          index === self.findIndex((c) => c.name === cat.name)
        );
        // Trier par nom
        this.categories.sort((a, b) => a.name.localeCompare(b.name));
        this.loadingCategories = false;
        if (this.categories.length > 0 && !this.category) {
          this.category = this.categories[0].name;
          this.saveFormData();
        }
      },
      error: (err) => {
        console.error('❌ Erreur chargement catégories, utilisation des catégories statiques:', err);
        // Fallback sur les catégories statiques uniquement
        this.categories = [...this.STATIC_CATEGORIES];
        this.categories.sort((a, b) => a.name.localeCompare(b.name));
        this.loadingCategories = false;
        if (this.categories.length > 0 && !this.category) {
          this.category = this.categories[0].name;
          this.saveFormData();
        }
      }
    });
  }

  refreshCategories(): void {
    this.loadCategories();
  }

  setDefaultCategories(): void {
    this.categories = [
      { id: 1, name: 'ADMINISTRATIF' },
      { id: 2, name: 'FINANCIER' },
      { id: 3, name: 'CLUB' },
      { id: 4, name: 'FORMATION' },
      { id: 5, name: 'RAPPORT' },
      { id: 6, name: 'CONVENTION' }
    ];
    this.loadingCategories = false;
    if (this.categories.length > 0 && !this.category) {
      this.category = this.categories[0].name;
      this.saveFormData();
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const extension = file.name.split('.').pop()?.toLowerCase() || '';

      if (file.size > this.maxFileSize) {
        this.errorMessage = 'Le fichier dépasse 25 Mo';
        this.selectedFile = null;
        return;
      }

      if (this.allowedExtensions.indexOf(extension) === -1) {
        this.errorMessage = 'Format non supporté. Formats acceptés: ' + this.allowedExtensions.join(', ');
        this.selectedFile = null;
        return;
      }

      this.selectedFile = file;
      this.errorMessage = '';
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' Ko';
    return (bytes / (1024 * 1024)).toFixed(1) + ' Mo';
  }

  goBack(): void {
    this.router.navigate(['/admin/ged']);
  }

  // ========== CRUD CATEGORIES ==========

  openCategoryModal(): void {
    if (!this.isAdmin) return;
    this.resetCategoryForm();
    this.categoryFormError = '';
    const modalElement = document.getElementById('categoryModal');
    if (modalElement) {
      const modal = new (window as any).bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  resetCategoryForm(): void {
    this.categoryForm = { name: '', description: '' };
    this.editingCategory = null;
    this.savingCategory = false;
    this.categoryFormError = '';
  }

  editCategory(category: Category): void {
    if (!this.isAdmin) return;
    this.editingCategory = category;
    this.categoryForm = {
      name: category.name,
      description: category.description || ''
    };
    this.categoryFormError = '';
  }

  saveCategory(): void {
    if (!this.categoryForm.name || !this.categoryForm.name.trim()) {
      this.categoryFormError = 'Le nom de la catégorie est requis';
      return;
    }

    const categoryName = this.categoryForm.name.trim().toUpperCase();

    const exists = this.categories.some(c =>
      c.name === categoryName && (!this.editingCategory || c.id !== this.editingCategory.id)
    );

    if (exists) {
      this.categoryFormError = 'Cette catégorie existe déjà';
      return;
    }

    this.savingCategory = true;
    this.categoryFormError = '';

    if (this.editingCategory) {
      const oldName = this.editingCategory.name;
      const index = this.categories.findIndex(c => c.id === this.editingCategory!.id);

      if (index !== -1) {
        this.categories[index] = {
          ...this.categories[index],
          name: categoryName,
          description: this.categoryForm.description
        };
      }

      if (this.category === oldName) {
        this.category = categoryName;
        this.saveFormData();
      }

      this.categories = [...this.categories];

      this.gedService.updateCategory(this.editingCategory.id!, {
        name: categoryName,
        description: this.categoryForm.description
      }).subscribe({
        next: (updatedCategory) => {
          this.loadCategories();
          this.savingCategory = false;
          this.resetCategoryForm();
          const modalElement = document.getElementById('categoryModal');
          if (modalElement) {
            const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
            modal?.hide();
          }
        },
        error: (err) => {
          this.savingCategory = false;
          this.categoryFormError = err.error?.message || 'Erreur lors de la modification';
          this.loadCategories();
        }
      });
    } else {
      this.gedService.createCategory({
        name: categoryName,
        description: this.categoryForm.description
      }).subscribe({
        next: (newCategory) => {
          this.loadCategories();
          if (!this.category) {
            this.category = categoryName;
            this.saveFormData();
          }
          this.savingCategory = false;
          this.resetCategoryForm();
          const modalElement = document.getElementById('categoryModal');
          if (modalElement) {
            const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
            modal?.hide();
          }
        },
        error: (err) => {
          this.savingCategory = false;
          this.categoryFormError = err.error?.message || 'Erreur lors de la création';
          this.loadCategories();
        }
      });
    }
  }

  deleteCategory(id: number, name: string): void {
    if (!this.isAdmin) return;
    if (confirm(`Supprimer la catégorie "${name}" ?\nLes documents associés ne seront pas supprimés.`)) {
      this.gedService.deleteCategory(id).subscribe({
        next: () => {
          this.loadCategories();
          if (this.category === name) {
            this.category = this.categories.length > 0 ? this.categories[0].name : '';
            this.saveFormData();
          }
          console.log('✅ Catégorie supprimée:', name);
        },
        error: (err) => {
          this.categoryFormError = err.error?.message || 'Erreur lors de la suppression';
          console.error('Error deleting category:', err);
          this.loadCategories();
        }
      });
    }
  }

  // ========== UPLOAD ==========

  upload() {
    // Nettoyer et valider la catégorie
    if (this.category) {
      this.category = this.category.toUpperCase().trim();
    }

    // Validations
    if (!this.selectedFile) {
      this.errorMessage = 'Veuillez sélectionner un fichier';
      return;
    }

    if (!this.title || !this.title.trim()) {
      this.errorMessage = 'Veuillez saisir un titre';
      return;
    }

    if (!this.category) {
      this.errorMessage = 'Veuillez sélectionner une catégorie';
      return;
    }

    // Vérifier que la catégorie existe dans la liste
    const categoryExists = this.categories.some(c => c.name === this.category);
    if (!categoryExists) {
      this.errorMessage = `La catégorie "${this.category}" n'existe pas. Veuillez la créer d'abord via le bouton "+".`;
      return;
    }

    this.uploading = true;
    this.errorMessage = '';

    const titleClean = this.title.trim();
    const descriptionClean = this.description ? this.description.trim() : '';
    const categoryUpper = this.category.toUpperCase();
    const yearValue = this.year ? Number(this.year) : new Date().getFullYear();

    console.log('📤 Upload du document:', {
      title: titleClean,
      category: categoryUpper,
      year: yearValue,
      fileName: this.selectedFile.name,
      fileSize: this.selectedFile.size
    });

    this.gedService.uploadDocument(this.selectedFile, {
      title: titleClean,
      description: descriptionClean,
      category: categoryUpper,
      year: yearValue
    }).subscribe({
      next: (response) => {
        console.log('✅ Upload réussi:', response);
        localStorage.removeItem(this.STORAGE_KEY);
        this.router.navigate(['/admin/ged']);
      },
      error: (err) => {
        this.uploading = false;
        console.error('❌ Erreur upload:', err);
        
        let errorMsg = 'Erreur lors du téléversement';
        
        if (err.status === 400) {
          if (err.error && typeof err.error === 'string') {
            errorMsg = err.error;
          } else if (err.error && err.error.message) {
            errorMsg = err.error.message;
          } else {
            errorMsg = 'Données invalides. Vérifiez que la catégorie existe dans la base de données.';
          }
        } else if (err.status === 413) {
          errorMsg = 'Fichier trop volumineux. Taille maximale: 25 Mo';
        } else if (err.status === 415) {
          errorMsg = 'Type de fichier non supporté';
        } else if (err.status === 0) {
          errorMsg = 'Impossible de se connecter au serveur. Vérifiez que le backend est démarré.';
        } else if (err.status === 401 || err.status === 403) {
          errorMsg = 'Vous n\'avez pas les droits pour téléverser des documents';
        }
        
        this.errorMessage = errorMsg;
        this.saveFormData();
      }
    });
  }
}