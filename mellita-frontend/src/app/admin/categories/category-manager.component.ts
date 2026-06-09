import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService, Category } from './services/category.service';
import { AuthService } from '../../core/services/auth.service';

declare var bootstrap: any;

@Component({
  selector: 'app-category-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './category-manager.component.html',
  styleUrls: ['./category-manager.component.css']
})
export class CategoryManagerComponent implements OnInit {
  private categoryService = inject(CategoryService);
  private authService = inject(AuthService);

  categories: Category[] = [];
  loading = true;
  isAdmin = false;
  newCategory: Category = { name: '', description: '' };
  errorMessage = '';

  ngOnInit(): void {
    this.isAdmin = this.authService.getRole() === 'ADMIN';
    if (this.isAdmin) {
      this.loadCategories();
    }
  }

  loadCategories(): void {
    this.loading = true;
    this.categoryService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  openModal(): void {
    this.newCategory = { name: '', description: '' };
    this.errorMessage = '';
    const modalElement = document.getElementById('categoryModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  saveCategory(): void {
    if (!this.newCategory.name?.trim()) {
      this.errorMessage = 'Le nom de la catégorie est requis';
      return;
    }

    this.categoryService.createCategory(this.newCategory).subscribe({
      next: () => {
        this.loadCategories();
        this.closeModal();
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Erreur lors de la création';
      }
    });
  }

  deleteCategory(id: number, name: string): void {
    if (confirm(`Supprimer la catégorie "${name}" ?`)) {
      this.categoryService.deleteCategory(id).subscribe({
        next: () => this.loadCategories(),
        error: () => alert('Erreur lors de la suppression')
      });
    }
  }

  closeModal(): void {
    const modalElement = document.getElementById('categoryModal');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      modal?.hide();
    }
  }
}
