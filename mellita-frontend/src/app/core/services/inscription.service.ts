import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// Suppression des imports du modèle qui n'existe pas
// import { EvenementPublic, FormationPublic, DemandeInscriptionEvenement, DemandeInscriptionFormation } from '../models/inscription.model';

@Injectable({ providedIn: 'root' })
export class InscriptionService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ========== ÉVÉNEMENTS PUBLICS ==========
  getEvenementsPublics(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/evenements/public`);
  }

  // ========== FORMATIONS PUBLIQUES ==========
  getFormationsPubliques(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/formations/public`);
  }

  // ========== DEMANDE D'INSCRIPTION (MEMBRE) ==========
  demanderInscriptionEvenement(evenementId: number, membreId: number, message?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/evenements/${evenementId}/inscriptions`, { membreId, message });
  }

  demanderInscriptionFormation(formationId: number, membreId: number, motivation?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/formations/${formationId}/inscriptions`, { membreId, prixPaye: 0, motivation });
  }

  // ========== ADMIN : RÉCUPÉRER LES DEMANDES ==========
  getDemandesEvenements(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/demandes/evenements`);
  }

  getDemandesFormations(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/demandes/formations`);
  }

  // ========== ADMIN : GÉRER LES DEMANDES ==========
  accepterDemandeEvenement(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/demandes/evenements/${id}/accepter`, {});
  }

  rejeterDemandeEvenement(id: number, motif?: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/demandes/evenements/${id}/rejeter`, { motif });
  }

  accepterDemandeFormation(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/demandes/formations/${id}/accepter`, {});
  }

  rejeterDemandeFormation(id: number, motif?: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/demandes/formations/${id}/rejeter`, { motif });
  }

  // ========== VÉRIFIER SI DÉJÀ INSCRIT ==========
  verifierInscriptionEvenement(evenementId: number, membreId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/evenements/${evenementId}/verifier-inscription?membreId=${membreId}`);
  }

  verifierInscriptionFormation(formationId: number, membreId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/formations/${formationId}/verifier-inscription?membreId=${membreId}`);
  }
}