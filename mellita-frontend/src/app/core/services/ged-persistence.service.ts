import { Injectable } from '@angular/core';

export interface GedFilters {
  title: string;
  category: string;
  year: number | null;
  status: string;
  page: number;
}

@Injectable({ providedIn: 'root' })
export class GedPersistenceService {
  private readonly STORAGE_KEY = 'ged_upload_filters';

  saveFilters(filters: Partial<GedFilters>): void {
    try {
      const current = this.getFilters();
      const merged = { ...current, ...filters };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(merged));
      console.log('✅ Filtres GED sauvegardés:', merged);
    } catch (e) {
      console.warn('Erreur sauvegarde GED:', e);
    }
  }

  getFilters(): GedFilters {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Erreur lecture GED:', e);
    }
    return { title: '', category: '', year: null, status: '', page: 0 };
  }

  clearFilters(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    console.log('✅ Filtres GED nettoyés');
  }
}