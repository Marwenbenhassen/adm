import { Component, OnInit } from '@angular/core';
import { ClubService, EvenementService, FormationService, UserService } from '../../core/services/api.services';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-presences',
  template: `
    <div class="d-flex">
      <app-sidebar></app-sidebar>
      <div class="admin-content flex-grow-1">
        <div class="topbar d-flex justify-content-between align-items-center">
          <div>
            <h4 class="mb-0 fw-bold">
              <i class="bi bi-clipboard-check-fill me-2" style="color:#e83e8c"></i>
              Gestion des Présences
            </h4>
            <small class="text-muted">Gérez les présences des membres par club, événement ou formation</small>
          </div>
        </div>

        <div class="p-4">

          <!-- Filtres -->
          <div class="filters-card">
            <div class="row g-3 align-items-end">

              <div class="col-md-3">
                <label class="form-label fw-semibold">Type</label>
                <select class="form-select" [(ngModel)]="selectedType" (change)="onTypeChange()">
                  <option value="">-- Sélectionner un type --</option>
                  <option value="club">🏆 Club</option>
                  <option value="evenement">📅 Événement</option>
                  <option value="formation">🎓 Formation</option>
                </select>
              </div>

              <div class="col-md-3">
                <label class="form-label fw-semibold">Sélectionner</label>
                <select class="form-select" [(ngModel)]="selectedItemId"
                        (change)="onItemChange()" [disabled]="!selectedType">
                  <option value="">-- Choisir --</option>
                  <option *ngFor="let item of itemsList" [value]="item.id">
                    {{ item.nom || item.titre }}
                  </option>
                </select>
              </div>

              <div class="col-md-2">
                <label class="form-label fw-semibold">
                  <i class="bi bi-calendar-plus me-1"></i>Date début
                </label>
                <input type="date" class="form-control"
                       [(ngModel)]="dateDebut"
                       [max]="dateFin || today"
                       (change)="onDatesChange()"
                       [disabled]="!selectedItemId">
              </div>

              <div class="col-md-2">
                <label class="form-label fw-semibold">
                  <i class="bi bi-calendar-x me-1"></i>Date fin
                </label>
                <input type="date" class="form-control"
                       [(ngModel)]="dateFin"
                       [min]="dateDebut"
                       [max]="today"
                       (change)="onDatesChange()"
                       [disabled]="!dateDebut">
              </div>

            </div>
          </div>

          <!-- Mode par jour uniquement (accordéon) -->
          <div *ngIf="datesSeances.length > 0">

            <!-- Avertissement pour événements -->
            <div class="alert alert-warning mb-3" *ngIf="selectedType === 'evenement'">
              <i class="bi bi-info-circle-fill me-2"></i>
              <strong>Note :</strong> Pour les événements, les présences sont <strong>globales</strong>
              (non liées à une date spécifique). Modifier la présence affectera toutes les séances de la période.
            </div>

            <div class="alert alert-info mt-3" *ngIf="loadingAll">
              <div class="spinner-border spinner-border-sm me-2"></div>
              Chargement de toutes les séances...
            </div>

            <div *ngIf="!loadingAll">

              <!-- Résumé global -->
              <div class="resume-global mt-3 mb-4" *ngIf="joursData.length > 0">
                <div class="resume-title">
                  <i class="bi bi-bar-chart-fill me-2"></i>
                  Résumé — {{ datesSeances.length }} jour(s) — {{ getSelectedItemName() }}
                </div>
                <div class="stats-bar mt-2">
                  <span class="stat-chip">
                    <i class="bi bi-calendar3 me-1"></i>Séances : {{ joursData.length }}
                  </span>
                  <span class="stat-chip green">
                    <i class="bi bi-check-circle me-1"></i>Total présents : {{ totalPresentsGlobal }}
                  </span>
                  <span class="stat-chip red">
                    <i class="bi bi-x-circle me-1"></i>Total absents : {{ totalAbsentsGlobal }}
                  </span>
                  <span class="stat-chip info">
                    <i class="bi bi-percent me-1"></i>Taux moyen : {{ tauxMoyen }}%
                  </span>
                </div>
              </div>

              <!-- Accordéon : un bloc par jour -->
              <div class="jour-block" *ngFor="let jour of joursData; let i = index">

                <div class="jour-header" (click)="jour.ouvert = !jour.ouvert">
                  <div class="jour-header-left">
                    <i class="bi bi-calendar-check me-2" style="color:#1a6b3c"></i>
                    <span class="jour-date">{{ jour.date | date:'EEEE dd MMMM yyyy' }}</span>
                    <span class="stat-chip green ms-3">{{ jour.nbPresents }} présent(s)</span>
                    <span class="stat-chip red ms-2">{{ jour.nbAbsents }} absent(s)</span>
                    <span class="stat-chip info ms-2">{{ jour.taux }}%</span>
                  </div>
                  <div class="jour-header-right">
                    <span class="badge-saved" *ngIf="jour.sauvegarde">
                      <i class="bi bi-check-circle-fill me-1"></i>Enregistré
                    </span>
                    <i class="bi" [class.bi-chevron-down]="!jour.ouvert"
                                  [class.bi-chevron-up]="jour.ouvert"></i>
                  </div>
                </div>

                <div class="jour-body" *ngIf="jour.ouvert">

                  <div class="alert alert-warning" *ngIf="estAnimateur && selectedType !== 'club'">
                    <i class="bi bi-shield-shaded me-2"></i>
                    <strong>Attention :</strong> En tant qu'animateur, vos saisies seront en attente de validation.
                  </div>

                  <div class="d-flex gap-2 mb-3">
                    <button class="btn btn-sm btn-outline-success" (click)="tousPresentsJour(jour)">
                      <i class="bi bi-check-all me-1"></i>Tous présents
                    </button>
                    <button class="btn btn-sm btn-outline-danger" (click)="tousAbsentsJour(jour)">
                      <i class="bi bi-x-circle me-1"></i>Tous absents
                    </button>
                  </div>

                  <div class="presence-list">
                    <div class="presence-row" *ngFor="let m of jour.membres">
                      <div class="membre-info">
                        <div class="membre-avatar"
                             [style.background]="m.present
                               ? 'linear-gradient(135deg,#1a6b3c,#2d9e5f)'
                               : 'linear-gradient(135deg,#6c757d,#495057)'">
                          {{ (m.prenom || '?')[0] }}{{ (m.nom || '?')[0] }}
                        </div>
                        <div>
                          <div class="fw-semibold">{{ m.prenom }} {{ m.nom }}</div>
                          <small class="text-muted">{{ m.email }}</small>
                        </div>
                      </div>
                      <div class="presence-toggle">
                        <label class="toggle-switch">
                          <input type="checkbox"
                                 [checked]="m.present"
                                 (change)="toggleJour(m, jour)">
                          <span class="toggle-slider"></span>
                        </label>
                        <span [class]="m.present ? 'badge-present' : 'badge-absent'">
                          <i [class]="m.present ? 'bi bi-check-circle' : 'bi bi-x-circle'"></i>
                          {{ m.present ? 'Présent' : 'Absent' }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div class="jour-footer">
                    <button class="btn btn-mellita btn-sm"
                            [disabled]="jour.saving"
                            (click)="enregistrerJour(jour)">
                      <span *ngIf="!jour.saving">
                        <i class="bi bi-save me-1"></i>Enregistrer le {{ jour.date | date:'dd/MM/yyyy' }}
                      </span>
                      <span *ngIf="jour.saving">
                        <span class="spinner-border spinner-border-sm me-1"></span>Enregistrement...
                      </span>
                    </button>
                  </div>

                </div>
              </div>

              <div class="alert alert-info mt-3" *ngIf="joursData.length === 0 && !loadingAll">
                <i class="bi bi-info-circle me-2"></i>
                Aucune donnée disponible pour cette période.
              </div>

            </div>
          </div>

          <!-- Message si aucune date sélectionnée -->
          <div class="alert alert-secondary mt-3 text-center" *ngIf="selectedItemId && (!dateDebut || !dateFin)">
            <i class="bi bi-calendar-range me-2"></i>
            Veuillez sélectionner une période (date début et date fin) pour gérer les présences.
          </div>

          <div class="alert alert-info mt-3 text-center" *ngIf="!selectedItemId && selectedType">
            <i class="bi bi-info-circle me-2"></i>
            Veuillez sélectionner un {{ getTypeLabel() }}.
          </div>

          <div class="alert alert-secondary mt-3 text-center" *ngIf="!selectedType">
            <i class="bi bi-funnel me-2"></i>
            Sélectionnez un type (Club, Événement ou Formation) pour commencer.
          </div>

        </div>

        <!-- Toast -->
        <div class="toast-notification" [class.show]="showToast" [class.error]="toastType === 'error'">
          <div class="toast-content">
            <i class="bi" [class.bi-check-circle-fill]="toastType === 'success'"
                         [class.bi-exclamation-triangle-fill]="toastType === 'error'"></i>
            <span>{{ toastMessage }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-content { margin-left:260px; background:#f4f6f8; min-height:100vh; }
    .topbar { background:white; padding:20px 28px; border-bottom:1px solid #f0f0f0; }
    .btn-mellita { background:linear-gradient(135deg,#1a6b3c,#2d9e5f); color:white; border:none; border-radius:10px; font-weight:600; padding:9px 22px; }
    .btn-mellita:hover { color:white; }
    .btn-mellita:disabled { opacity:.6; }
    .toast-notification { position:fixed; top:20px; right:20px; z-index:10000; background:white; border-radius:12px; box-shadow:0 4px 20px rgba(0,0,0,.15); padding:12px 20px; transform:translateX(400px); transition:transform .3s; border-left:4px solid #28a745; }
    .toast-notification.show { transform:translateX(0); }
    .toast-notification.error { border-left-color:#dc3545; }
    .toast-content { display:flex; align-items:center; gap:12px; font-weight:600; }
    .toast-content i { font-size:1.2rem; color:#28a745; }
    .toast-notification.error .toast-content i { color:#dc3545; }
    .filters-card { background:white; border-radius:16px; padding:24px; box-shadow:0 2px 12px rgba(0,0,0,.06); margin-bottom:20px; }
    .form-label { font-size:.85rem; margin-bottom:6px; color:#495057; font-weight:600; }
    .form-select,.form-control { border-radius:10px; border:1px solid #e0e0e0; padding:8px 12px; }

    /* ── Résumé global ── */
    .resume-global { background:white; border-radius:16px; padding:20px 24px; box-shadow:0 2px 12px rgba(0,0,0,.06); }
    .resume-title { font-weight:700; font-size:1rem; color:#1a1a2e; }

    /* ── Accordéon par jour ── */
    .jour-block { background:white; border-radius:14px; margin-bottom:12px; box-shadow:0 2px 10px rgba(0,0,0,.05); overflow:hidden; }
    .jour-header { display:flex; justify-content:space-between; align-items:center; padding:14px 20px; cursor:pointer; transition:background .2s; }
    .jour-header:hover { background:#f8f9fa; }
    .jour-header-left { display:flex; align-items:center; flex-wrap:wrap; gap:4px; }
    .jour-date { font-weight:700; color:#1a1a2e; text-transform:capitalize; }
    .jour-header-right { display:flex; align-items:center; gap:10px; color:#6c757d; }
    .badge-saved { background:#d4edda; color:#155724; padding:3px 10px; border-radius:20px; font-size:.72rem; font-weight:700; }
    .jour-body { border-top:1px solid #f0f0f0; padding:16px 20px; }
    .jour-footer { margin-top:14px; padding-top:14px; border-top:1px solid #f0f0f0; }

    /* ── Liste présences ── */
    .presence-list { display:flex; flex-direction:column; gap:8px; max-height:500px; overflow-y:auto; padding:16px; }
    .presence-row { display:flex; justify-content:space-between; align-items:center; background:#f8f9fa; border-radius:12px; padding:12px 16px; }
    .membre-info { display:flex; align-items:center; gap:12px; flex:1; }
    .membre-avatar { width:42px; height:42px; border-radius:50%; color:white; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:.9rem; flex-shrink:0; }
    .presence-toggle { display:flex; align-items:center; gap:12px; }
    .toggle-switch { position:relative; display:inline-block; width:52px; height:26px; }
    .toggle-switch input { opacity:0; width:0; height:0; }
    .toggle-slider { position:absolute; cursor:pointer; top:0; left:0; right:0; bottom:0; background-color:#dc3545; border-radius:26px; transition:.3s; }
    .toggle-slider:before { position:absolute; content:""; height:20px; width:20px; left:3px; bottom:3px; background-color:white; border-radius:50%; transition:.3s; }
    input:checked + .toggle-slider { background-color:#28a745; }
    input:checked + .toggle-slider:before { transform:translateX(26px); }
    .badge-present,.badge-absent { padding:5px 12px; border-radius:20px; font-size:.75rem; font-weight:700; display:inline-flex; align-items:center; gap:5px; }
    .badge-present { background:#d4edda; color:#155724; }
    .badge-absent  { background:#f8d7da; color:#721c24; }
    .alert { border-radius:12px; }
    .stats-bar { display:flex; gap:12px; flex-wrap:wrap; }
    .stat-chip { background:#f0f4ff; color:#4361ee; padding:6px 14px; border-radius:20px; font-size:.85rem; font-weight:600; }
    .stat-chip.green { background:#d4edda; color:#155724; }
    .stat-chip.red   { background:#f8d7da; color:#721c24; }
    .stat-chip.info  { background:#d1ecf1; color:#0c5460; }
  `]
})
export class PresencesComponent implements OnInit {

  selectedType:   string        = '';
  selectedItemId: number | null = null;
  today:          string        = new Date().toISOString().split('T')[0];
  dateDebut:      string        = '';
  dateFin:        string        = '';
  datesSeances:   { value: string; label: string }[] = [];

  clubs:       any[] = [];
  evenements:  any[] = [];
  formations:  any[] = [];
  itemsList:   any[] = [];

  // Données pour le mode par-jour
  joursData:   any[] = [];
  loadingAll   = false;

  loading:        boolean = false;
  saving:         boolean = false;
  successMessage: string  = '';
  showToast       = false;
  toastMessage    = '';
  toastType: 'success' | 'error' = 'success';

  constructor(
    private clubService:      ClubService,
    private evenementService: EvenementService,
    private formationService: FormationService,
    private userService:      UserService,
    private authService:      AuthService
  ) {}

  ngOnInit(): void {
    this.chargerClubs();
    this.chargerEvenements();
    this.chargerFormations();
  }

  get estAdmin():       boolean { return this.authService.isAdmin(); }
  get estAdministratif(): boolean { return this.authService.isAdministratif(); }
  get estAnimateur():   boolean { return this.authService.isAnimateur(); }

  // ✅ NOUVEAU : Retourne les jours autorisés selon le type
  private getJoursAutorises(): number[] {
    switch (this.selectedType) {
      case 'club':      return [1, 3, 5]; // Lundi, Mercredi, Vendredi
      case 'evenement': return [6]; // Samedi
      case 'formation': return [2, 4];    // Mardi, Jeudi
      default:          return [];
    }
  }

  chargerClubs(): void {
    const obs = this.estAnimateur ? this.clubService.getMesClubs() : this.clubService.getAll();
    obs.subscribe(data => this.clubs = data);
  }
  chargerEvenements(): void { this.evenementService.getAll().subscribe(data => this.evenements = data); }
  chargerFormations(): void { this.formationService.getAll().subscribe(data => this.formations = data); }

  onTypeChange(): void {
    this.selectedItemId = null;
    this.dateDebut      = '';
    this.dateFin        = '';
    this.datesSeances   = [];
    this.joursData      = [];
    switch (this.selectedType) {
      case 'club':      this.itemsList = this.clubs;      break;
      case 'evenement': this.itemsList = this.evenements; break;
      case 'formation': this.itemsList = this.formations; break;
      default:          this.itemsList = [];
    }
  }

  onItemChange(): void {
    this.dateDebut    = '';
    this.dateFin      = '';
    this.datesSeances = [];
    this.joursData    = [];
  }

  // ✅ MODIFICATION : onDatesChange() avec filtrage par jours autorisés
  onDatesChange(): void {
    this.datesSeances = [];
    this.joursData    = [];

    if (!this.dateDebut || !this.dateFin) return;

    const debut        = new Date(this.dateDebut);
    const fin          = new Date(this.dateFin);
    const todayDate    = new Date(this.today);
    const finEffective = fin < todayDate ? fin : todayDate;

    const toStr   = (d: Date): string => d.toISOString().split('T')[0];
    const toLabel = (d: Date): string =>
      d.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' });

    const joursAutorises = this.getJoursAutorises();
    const dates: Date[] = [];
    let current = new Date(debut);

    while (current <= finEffective) {
      // ✅ FILTRAGE : ne garder que les jours autorisés
      if (joursAutorises.includes(current.getDay())) {
        dates.push(new Date(current));
      }
      current.setDate(current.getDate() + 1);
    }

    this.datesSeances = dates.map(d => ({ value: toStr(d), label: toLabel(d) }));

    if (this.datesSeances.length > 0) {
      this.chargerTousLesJours();
    }
  }

  // Charge toutes les dates de la période et construit joursData
  chargerTousLesJours(): void {
    if (!this.selectedItemId || this.datesSeances.length === 0) return;
    this.loadingAll = true;
    this.joursData  = [];

    // D'abord charger la liste des membres
    this.getMembresBase((membres: any[]) => {
      if (membres.length === 0) {
        this.loadingAll = false;
        return;
      }

      let loaded = 0;
      const total = this.datesSeances.length;

      this.datesSeances.forEach(seance => {
        this.getPresencesParDate(seance.value, (presencesExistantes: any[]) => {
          const presenceMap = new Map<number, boolean>();

          // Pour événements, les présences sont les mêmes pour toutes les dates (global)
          // Pour clubs et formations, les présences sont par date
          const isGlobalPresence = this.selectedType === 'evenement';

          if (isGlobalPresence) {
            // Pour événements : utiliser la présence globale de l'inscription
            presencesExistantes.forEach(p => {
              presenceMap.set(p.membreId, p.present);
            });
          } else {
            // Pour clubs : présence par date spécifique
            presencesExistantes.forEach(p => {
              const pid = p.membreId || p.id;
              presenceMap.set(pid, p.present);
            });
          }

          const membresJour = membres.map((m: any) => {
            let present = true; // défaut présent

            if (presenceMap.has(m.id)) {
              present = presenceMap.get(m.id)!;
            } else if (!isGlobalPresence) {
              // Pour clubs sans présence enregistrée, présent par défaut
              present = true;
            }

            return {
              id:            m.id,
              prenom:        m.prenom,
              nom:           m.nom,
              email:         m.email,
              inscriptionId: m.inscriptionId,
              present:       present
            };
          });

          const nbPresents = membresJour.filter(m => m.present).length;
          const nbAbsents  = membresJour.length - nbPresents;

          this.joursData.push({
            date:       seance.value,
            label:      seance.label,
            membres:    membresJour,
            nbPresents,
            nbAbsents,
            taux:       Math.round((nbPresents / membresJour.length) * 100),
            ouvert:     false,
            saving:     false,
            sauvegarde: presencesExistantes.length > 0
          });

          loaded++;
          if (loaded === total) {
            this.joursData.sort((a, b) => a.date.localeCompare(b.date));
            this.loadingAll = false;
          }
        });
      });
    });
  }

  // Récupère la liste de base des membres selon le type
  private getMembresBase(callback: (membres: any[]) => void): void {
    switch (this.selectedType) {
      case 'club':
        this.clubService.getMembres(this.selectedItemId!).subscribe({
          next: (inscriptions: any[]) => {
            const membres = inscriptions.map((insc: any) => ({
              id:     insc.membre?.id     || insc.membreId,
              prenom: insc.membre?.prenom || insc.membrePrenom,
              nom:    insc.membre?.nom    || insc.membreNom,
              email:  insc.membre?.email  || insc.membreEmail,
            }));
            callback(membres);
          },
          error: () => callback([])
        });
        break;

      case 'evenement':
        this.evenementService.getInscriptions(this.selectedItemId!).subscribe({
          next: (inscriptions: any[]) => {
            const membres = inscriptions.map((insc: any) => ({
              id:            insc.membre?.id     || insc.membreId,
              prenom:        insc.membre?.prenom || insc.membrePrenom,
              nom:           insc.membre?.nom    || insc.membreNom,
              email:         insc.membre?.email  || insc.membreEmail,
              inscriptionId: insc.id
            }));
            callback(membres);
          },
          error: () => callback([])
        });
        break;

      case 'formation':
        this.formationService.getInscriptions(this.selectedItemId!).subscribe({
          next: (inscriptions: any[]) => {
            const membres = inscriptions.map((insc: any) => ({
              id:            insc.membre?.id     || insc.membreId,
              prenom:        insc.membre?.prenom || insc.membrePrenom,
              nom:           insc.membre?.nom    || insc.membreNom,
              email:         insc.membre?.email  || insc.membreEmail,
              inscriptionId: insc.id
            }));
            callback(membres);
          },
          error: () => callback([])
        });
        break;
    }
  }

  // Récupère les présences existantes pour une date donnée
  private getPresencesParDate(date: string, callback: (presences: any[]) => void): void {
    if (this.selectedType === 'club') {
      this.clubService.getPresencesByDate(this.selectedItemId!, date).subscribe({
        next: (p: any[]) => callback(p),
        error: () => callback([])
      });
    } else if (this.selectedType === 'formation') {
      this.formationService.getPresencesByDate(this.selectedItemId!, date).subscribe({
        next: (p: any[]) => callback(p),
        error: () => callback([])
      });
    } else if (this.selectedType === 'evenement') {
      this.evenementService.getInscriptions(this.selectedItemId!).subscribe({
        next: (inscriptions: any[]) => {
          const presences = inscriptions.map(insc => ({
            membreId: insc.membre?.id || insc.membreId,
            present: insc.presence === true || insc.presence === false ? insc.presence : true,
            inscriptionId: insc.id
          }));
          callback(presences);
        },
        error: () => callback([])
      });
    } else {
      callback([]);
    }
  }

  // Toggle dans le mode par-jour
  toggleJour(membre: any, jour: any): void {
    membre.present = !membre.present;
    jour.nbPresents = jour.membres.filter((m: any) => m.present).length;
    jour.nbAbsents  = jour.membres.length - jour.nbPresents;
    jour.taux = Math.round((jour.nbPresents / jour.membres.length) * 100);
    jour.sauvegarde = false;
  }

  tousPresentsJour(jour: any): void {
    jour.membres.forEach((m: any) => m.present = true);
    jour.nbPresents = jour.membres.length;
    jour.nbAbsents  = 0;
    jour.taux       = 100;
    jour.sauvegarde = false;
  }

  tousAbsentsJour(jour: any): void {
    jour.membres.forEach((m: any) => m.present = false);
    jour.nbPresents = 0;
    jour.nbAbsents  = jour.membres.length;
    jour.taux       = 0;
    jour.sauvegarde = false;
  }

  // Enregistrer un seul jour
  enregistrerJour(jour: any): void {
    if (!this.selectedItemId) return;
    jour.saving = true;

    if (this.selectedType === 'club' || this.selectedType === 'formation') {
      const presences = jour.membres.map((m: any) => ({
        membreId: m.id,
        present:  m.present
      }));
      
      const obs = this.selectedType === 'club' 
          ? this.clubService.saisirPresenceBatch(this.selectedItemId!, jour.date, presences)
          : this.formationService.saisirPresenceBatch(this.selectedItemId!, jour.date, presences);
          
      obs.subscribe({
        next: () => {
          jour.saving     = false;
          jour.sauvegarde = true;
          this.showNotification(`✓ Séance du ${jour.date} enregistrée !`, 'success');
        },
        error: () => {
          jour.saving = false;
          this.showNotification('Erreur enregistrement', 'error');
        }
      });
    } else {
      // Pour événement : la présence est la même pour toutes les dates
      const confirmMsg = `Attention : La modification de présence pour l'événement
                          affectera TOUTES les séances de la période.
                          Voulez-vous continuer ?`;

      if (confirm(confirmMsg)) {
        let done = 0;
        const total = jour.membres.length;
        if (total === 0) {
          jour.saving = false;
          return;
        }

        jour.membres.forEach((m: any) => {
          const obs = this.evenementService.togglePresence(this.selectedItemId!, m.inscriptionId, m.present);
          obs.subscribe({
            next: () => {
              done++;
              if (done === total) {
                jour.saving     = false;
                jour.sauvegarde = true;
                this.showNotification(`✓ Présences pour ${this.getTypeLabel()} enregistrées !`, 'success');
                // Recharger toutes les dates pour synchroniser
                this.chargerTousLesJours();
              }
            },
            error: () => {
              jour.saving = false;
              this.showNotification('Erreur enregistrement', 'error');
            }
          });
        });
      } else {
        jour.saving = false;
      }
    }
  }

  // Stats globales mode par-jour
  get totalPresentsGlobal(): number {
    return this.joursData.reduce((s, j) => s + j.nbPresents, 0);
  }
  get totalAbsentsGlobal(): number {
    return this.joursData.reduce((s, j) => s + j.nbAbsents, 0);
  }
  get tauxMoyen(): number {
    if (this.joursData.length === 0) return 0;
    return Math.round(this.joursData.reduce((s, j) => s + j.taux, 0) / this.joursData.length);
  }

  showNotification(message: string, type: 'success' | 'error'): void {
    this.toastMessage = message;
    this.toastType    = type;
    this.showToast    = true;
    setTimeout(() => { this.showToast = false; }, 3000);
  }

  getTypeLabel(): string {
    switch (this.selectedType) {
      case 'club': return 'club';
      case 'evenement': return 'événement';
      case 'formation': return 'formation';
      default: return '';
    }
  }

  getSelectedItemName(): string {
    const item = this.itemsList.find(i => i.id == this.selectedItemId);
    return item ? (item.nom || item.titre) : '';
  }
}