import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Category {
  id?: number;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  active?: boolean;
}

export interface GedDocument {
  id: number;
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  title: string;
  description?: string;
  category: string;
  status: string;
  year: number;
  visibleToAll: boolean;
  allowedRoles?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class GedService {
  private apiUrl = 'http://localhost:8080/api/ged/documents';
  private categoriesUrl = 'http://localhost:8080/api/categories';

  constructor(private http: HttpClient) {}

  // Upload document
  uploadDocument(file: File, metadata: any): Observable<GedDocument> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', metadata.title);
    formData.append('category', metadata.category);
    formData.append('year', metadata.year.toString());
    if (metadata.description) {
      formData.append('description', metadata.description);
    }
    return this.http.post<GedDocument>(`${this.apiUrl}/upload`, formData);
  }

  // Search documents
  searchDocuments(params: any): Observable<any> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        httpParams = httpParams.set(key, params[key].toString());
      }
    });
    return this.http.get(`${this.apiUrl}/search`, { params: httpParams });
  }

  // Download document
  downloadDocument(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/download/${id}`, { responseType: 'blob' });
  }

  // Archive document
  archiveDocument(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/archive/${id}`, {});
  }

  // Restore document
  restoreDocument(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/restore/${id}`, {});
  }

  // Delete document
  deleteDocument(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Delete all documents (admin only)
  deleteAllDocuments(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/delete-all`);
  }

  // Delete selected documents (admin only)
  deleteSelectedDocuments(ids: number[]): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/delete-selected`, { body: ids });
  }

  // Update permissions
  updatePermissions(id: number, permissions: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/permissions`, permissions);
  }

  // === METHODES POUR LES CATEGORIES ===
  
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.categoriesUrl);
  }

  createCategory(category: Category): Observable<Category> {
    return this.http.post<Category>(this.categoriesUrl, category);
  }

  updateCategory(id: number, category: Category): Observable<Category> {
    return this.http.put<Category>(`${this.categoriesUrl}/${id}`, category);
  }

  deleteCategory(id: number): Observable<any> {
    return this.http.delete(`${this.categoriesUrl}/${id}`);
  }
}
