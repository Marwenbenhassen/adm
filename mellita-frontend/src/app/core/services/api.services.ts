import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../../models/user.model';
import { Evenement, Actualite, Transaction, Don, Document, Formation, Bilan } from '../../models/models';

// ===== USER SERVICE =====
@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = `${environment.apiUrl}/admin/users`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<User[]> { return this.http.get<User[]>(this.apiUrl); }
  getById(id: number): Observable<User> { return this.http.get<User>(`${this.apiUrl}/${id}`); }
  getListeMembres(): Observable<User[]> { return this.http.get<User[]>(`${this.apiUrl}/liste-membres`); }
  create(user: any): Observable<User> { return this.http.post<User>(this.apiUrl, user); }
  createNewMembre(data: any): Observable<any> { return this.http.post<any>(`${this.apiUrl}`, data); }
  update(id: number, user: any): Observable<User> { return this.http.put<User>(`${this.apiUrl}/${id}`, user); }
  updateRole(id: number, role: string): Observable<User> { return this.http.put<User>(`${this.apiUrl}/${id}/role`, { role }); }
  delete(id: number): Observable<any> { return this.http.delete(`${this.apiUrl}/${id}`); }
  getStats(): Observable<any> { return this.http.get<any>(`${environment.apiUrl}/admin/stats`); }
}

// ===== EVENEMENT SERVICE =====
@Injectable({ providedIn: 'root' })
export class EvenementService {
  private apiUrl = `${environment.apiUrl}/evenements`;

  constructor(private http: HttpClient) {}

  getPublic(): Observable<Evenement[]> { return this.http.get<Evenement[]>(`${this.apiUrl}/public`); }
  getAll(): Observable<Evenement[]> { return this.http.get<Evenement[]>(this.apiUrl); }
  getById(id: number): Observable<Evenement> { return this.http.get<Evenement>(`${this.apiUrl}/${id}`); }
  create(e: Evenement): Observable<Evenement> { return this.http.post<Evenement>(this.apiUrl, e); }
  update(id: number, e: Evenement): Observable<Evenement> { return this.http.put<Evenement>(`${this.apiUrl}/${id}`, e); }
  delete(id: number): Observable<any> { return this.http.delete(`${this.apiUrl}/${id}`); }

  inscrireMembre(eventId: number, membreId: number, message?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${eventId}/inscriptions`, { membreId, message });
  }

  getInscriptions(eventId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${eventId}/inscriptions`);
  }

  togglePresence(eventId: number, inscriptionId: number, present: boolean): Observable<any> {
    return this.http.put(`${this.apiUrl}/${eventId}/inscriptions/${inscriptionId}/presence`, { present });
  }

  getMesEvenements(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/mes-evenements`);
  }

  getUpcoming(): Observable<Evenement[]> {
    return this.http.get<Evenement[]>(`${this.apiUrl}/public/upcoming`);
  }
}

// ===== ACTUALITE SERVICE =====
@Injectable({ providedIn: 'root' })
export class ActualiteService {
  private apiUrl = `${environment.apiUrl}/actualites`;

  constructor(private http: HttpClient) {}

  getPublished(): Observable<Actualite[]> { return this.http.get<Actualite[]>(`${this.apiUrl}/publics`); }
  getAll(): Observable<Actualite[]> { return this.http.get<Actualite[]>(this.apiUrl); }
  getById(id: number): Observable<Actualite> { return this.http.get<Actualite>(`${this.apiUrl}/${id}`); }
  create(a: Actualite): Observable<Actualite> { return this.http.post<Actualite>(this.apiUrl, a); }
  update(id: number, a: Actualite): Observable<Actualite> { return this.http.put<Actualite>(`${this.apiUrl}/${id}`, a); }
  delete(id: number): Observable<any> { return this.http.delete(`${this.apiUrl}/${id}`); }
}

// ===== TRANSACTION SERVICE =====
@Injectable({ providedIn: 'root' })
export class TransactionService {
  private apiUrl = `${environment.apiUrl}/transactions`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Transaction[]> { return this.http.get<Transaction[]>(this.apiUrl); }
  create(t: Transaction): Observable<Transaction> { return this.http.post<Transaction>(this.apiUrl, t); }
  update(id: number, t: Transaction): Observable<Transaction> { return this.http.put<Transaction>(`${this.apiUrl}/${id}`, t); }
  delete(id: number): Observable<any> { return this.http.delete(`${this.apiUrl}/${id}`); }
  getBilan(): Observable<Bilan> { return this.http.get<Bilan>(`${this.apiUrl}/bilan`); }
}

// ===== DON SERVICE =====
@Injectable({ providedIn: 'root' })
export class DonService {
  private apiUrl = `${environment.apiUrl}/dons`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Don[]> { return this.http.get<Don[]>(this.apiUrl); }
  create(d: Don): Observable<Don> { return this.http.post<Don>(this.apiUrl, d); }
  createPublic(d: Don): Observable<Don> { return this.http.post<Don>(`${this.apiUrl}/public`, d); }
  updateStatut(id: number, statut: string): Observable<Don> {
    return this.http.put<Don>(`${this.apiUrl}/${id}/statut?statut=${statut}`, {});
  }
  delete(id: number): Observable<any> { return this.http.delete(`${this.apiUrl}/${id}`); }
}

// ===== DOCUMENT SERVICE =====
@Injectable({ providedIn: 'root' })
export class DocumentService {
  private apiUrl = `${environment.apiUrl}/documents`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Document[]> { return this.http.get<Document[]>(this.apiUrl); }
  getPublic(): Observable<Document[]> { return this.http.get<Document[]>(`${this.apiUrl}/public`); }
  create(d: Document): Observable<Document> { return this.http.post<Document>(this.apiUrl, d); }
  delete(id: number): Observable<any> { return this.http.delete(`${this.apiUrl}/${id}`); }
}

// ===== FORMATION SERVICE =====
@Injectable({ providedIn: 'root' })
export class FormationService {
  private apiUrl = `${environment.apiUrl}/formations`;

  constructor(private http: HttpClient) {}

  getPublic(): Observable<Formation[]> { return this.http.get<Formation[]>(`${this.apiUrl}/public`); }
  getAll(): Observable<Formation[]> { return this.http.get<Formation[]>(this.apiUrl); }
  getById(id: number): Observable<Formation> { return this.http.get<Formation>(`${this.apiUrl}/${id}`); }
  create(f: Formation): Observable<Formation> { return this.http.post<Formation>(this.apiUrl, f); }
  update(id: number, f: Formation): Observable<Formation> { return this.http.put<Formation>(`${this.apiUrl}/${id}`, f); }
  delete(id: number): Observable<any> { return this.http.delete(`${this.apiUrl}/${id}`); }

  inscrireMembre(formationId: number, membreId: number, prixPaye?: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${formationId}/inscriptions`, { membreId, prixPaye });
  }

  getInscriptions(formationId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${formationId}/inscriptions`);
  }

  togglePresence(formationId: number, inscriptionId: number, present: boolean): Observable<any> {
    return this.http.put(`${this.apiUrl}/${formationId}/inscriptions/${inscriptionId}/presence`, { present });
  }

  getPresencesByDate(formationId: number, date: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${formationId}/presences?date=${date}`);
  }

  saisirPresenceBatch(formationId: number, dateSeance: string, presences: {membreId: number, present: boolean}[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${formationId}/presences/batch`, { dateSeance, presences });
  }

  getMesFormations(): Observable<Formation[]> {
    return this.http.get<Formation[]>(`${this.apiUrl}/mes-formations`);
  }

  getFormateursDisponibles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/formateurs-disponibles`);
  }

  getStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats`);
  }
}

// ===== CLUB SERVICE =====
@Injectable({ providedIn: 'root' })
export class ClubService {
  private apiUrl = `${environment.apiUrl}/clubs`;
  constructor(private http: HttpClient) {}

  getPublic(): Observable<any[]>    { return this.http.get<any[]>(`${this.apiUrl}/public`); }
  getAll(): Observable<any[]>       { return this.http.get<any[]>(this.apiUrl); }
  getById(id: number): Observable<any> { return this.http.get<any>(`${this.apiUrl}/${id}`); }

  // ✅ CORRECTION : utiliser /mes-clubs au lieu de /mes-inscriptions
  getMesClubs(): Observable<any[]>  {
    return this.http.get<any[]>(`${this.apiUrl}/mes-clubs`);
  }

  getMaRemuneration(): Observable<any> { return this.http.get<any>(`${this.apiUrl}/ma-remuneration`); }
  getStats(): Observable<any>       { return this.http.get<any>(`${this.apiUrl}/stats`); }

  create(c: any): Observable<any>   { return this.http.post<any>(this.apiUrl, c); }
  update(id: number, c: any): Observable<any> { return this.http.put<any>(`${this.apiUrl}/${id}`, c); }
  delete(id: number): Observable<any> { return this.http.delete(`${this.apiUrl}/${id}`); }

  affecterAnimateur(clubId: number, animateurId: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${clubId}/animateur/${animateurId}`, {});
  }

  getMembres(clubId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${clubId}/membres`);
  }

  inscrireMembre(clubId: number, membreId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${clubId}/inscrire/${membreId}`, {});
  }

  getPresences(clubId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${clubId}/presences`);
  }

  getPresencesByDate(clubId: number, date: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${clubId}/presences/date?date=${date}`);
  }

  saisirPresence(clubId: number, presence: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${clubId}/presences`, presence);
  }

  saisirPresenceBatch(clubId: number, dateSeance: string, presences: {membreId: number, present: boolean}[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${clubId}/presences/batch`, { dateSeance, presences });
  }

  calculerFraisMensuels(clubId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${clubId}/calculer-frais-mensuels`, {});
  }

  getMesInscriptionsClub(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/mes-inscriptions`);
  }
}

// ===== ÉCRITURE COMPTABLE SERVICE =====
@Injectable({ providedIn: 'root' })
export class EcritureService {
  private apiUrl = `${environment.apiUrl}/ecritures`;
  constructor(private http: HttpClient) {}

  getAll(): Observable<any[]>       { return this.http.get<any[]>(this.apiUrl); }
  getEnAttente(): Observable<any[]> { return this.http.get<any[]>(`${this.apiUrl}/en-attente`); }
  getBilan(): Observable<any>       { return this.http.get<any>(`${this.apiUrl}/bilan`); }
  create(e: any): Observable<any>   { return this.http.post<any>(this.apiUrl, e); }
  delete(id: number): Observable<any> { return this.http.delete(`${this.apiUrl}/${id}`); }
  valider(id: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/valider`, {});
  }
  rejeter(id: number, motif: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/rejeter`, { motif });
  }
}

// ===== DASHBOARD SERVICE =====
@Injectable({ providedIn: 'root' })
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  getAdminStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/admin`);
  }

  getFormateurStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/formateur`);
  }

  getAnimateurStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/animateur`);
  }

  getTresorierStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/tresorier`);
  }
}

// ===== STATS SERVICE =====
@Injectable({ providedIn: 'root' })
export class StatsService {
  private apiUrl = `${environment.apiUrl}/stats`;

  constructor(private http: HttpClient) {}

  getGlobalStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/global`);
  }

  getFormationsStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/formations`);
  }

  getClubsStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/clubs`);
  }

  getFinanceStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/finance`);
  }
}
