// models/evenement.model.ts
export interface Evenement {
  id?: number;
  titre: string;
  titreAr?: string;
  description?: string;
  descriptionAr?: string;
  dateDebut: string;
  dateFin?: string;
  lieu?: string;
  image?: string;
  statut?: StatutEvenement;
  capaciteMax?: number;
  prix?: number;
  createdAt?: string;
  
  // ⭐ NOUVEAUX CHAMPS POUR CONTENU RICHE ⭐
  contenuHtml?: string;
  programme?: string;
  lieuDetaille?: string;
  horaireDetaille?: string;
  galerieImages?: string;
  
  // Champs pour l'affichage membre
  inscriptionId?: number;
  presence?: boolean;
  montantPaye?: number;
  statutPaiement?: string;
}

export type StatutEvenement = 'A_VENIR' | 'EN_COURS' | 'TERMINE' | 'ANNULE';

// models/actualite.model.ts
export interface Actualite {
  id?: number;
  titre: string;
  titreAr?: string;
  contenu: string;
  contenuAr?: string;
  image?: string;
  categorie?: string;
  publie?: boolean;
  createdAt?: string;
  auteur?: any;
}

// models/transaction.model.ts
export interface Transaction {
  id?: number;
  libelle: string;
  montant: number;
  type: TypeTransaction;
  categorie?: CategorieTransaction;
  dateTransaction?: string;
  description?: string;
  reference?: string;
  createdAt?: string;
}

export type TypeTransaction = 'RECETTE' | 'DEPENSE';
export type CategorieTransaction = 'COTISATION' | 'DON' | 'EVENEMENT' | 'FORMATION' | 'AUTRE';

// models/don.model.ts
export interface Don {
  id?: number;
  montant: number;
  donateur?: string;
  email?: string;
  telephone?: string;
  statut?: StatutDon;
  message?: string;
  anonyme?: boolean;
  dateDon?: string;
}

export type StatutDon = 'EN_ATTENTE' | 'CONFIRME' | 'ANNULE';

// models/document.model.ts
export interface Document {
  id?: number;
  titre: string;
  description?: string;
  fichier?: string;
  type?: string;
  taille?: number;
  visibilite?: Visibilite;
  createdAt?: string;
}

export type Visibilite = 'PUBLIC' | 'MEMBRES' | 'ADMIN';

// models/formation.model.ts
export interface Formation {
  id?: number;
  titre: string;
  titreAr?: string;
  description?: string;
  descriptionAr?: string;
  formateur?: string;
  formateurId?: number;
  dateDebut?: string;
  dateFin?: string;
  dureeHeures?: number;
  lieu?: string;
  prix?: number;
  capaciteMax?: number;
  image?: string;
  statut?: StatutFormation;
  createdAt?: string;
  createdById?: number;
  createdByNom?: string;
  
  // ⭐ NOUVEAUX CHAMPS POUR CONTENU RICHE ⭐
  contenuHtml?: string;
  programme?: string;
  prerequisites?: string;
  objectifs?: string;
  publicCible?: string;
  certification?: string;
  galerieImages?: string;
  
  // Champs pour l'affichage membre
  inscriptionId?: number;
  presence?: boolean;
  montantPaye?: number;
  statutPaiement?: string;
}

export type StatutFormation = 'PLANIFIEE' | 'EN_COURS' | 'TERMINEE' | 'ANNULEE';

// models/bilan.model.ts
export interface Bilan {
  totalRecettes: number;
  totalDepenses: number;
  totalDons: number;
  solde: number;
  nbTransactions: number;
}

// ===== CLUB MODEL =====
export interface Club {
  id?: number;
  nom: string;
  nomAr?: string;
  description?: string;
  tarifSeance?: number;
  partAnimateur?: number;
  typePartAnimateur?: 'FIXE' | 'POURCENTAGE';
  lieu?: string;
  horaire?: string;
  capaciteMax?: number;
  statut?: StatutClub;
  animateur?: any;
  createdAt?: string;
}
export type StatutClub = 'ACTIF' | 'INACTIF' | 'SUSPENDU';

// ===== PRESENCE MODEL =====
export interface Presence {
  id?: number;
  membre?: any;
  club?: any;
  animateur?: any;
  dateSeance?: string;
  present?: boolean;
  commentaire?: string;
  fraisSeance?: number;
  partAnimateurSeance?: number;
  createdAt?: string;
}

// ===== INSCRIPTION CLUB =====
export interface InscriptionClub {
  id?: number;
  membre?: any;
  club?: any;
  dateInscription?: string;
  statut?: string;
  nombreSeances?: number;
  montantDuMois?: number;
  paye?: boolean;
}

// ===== ÉCRITURE COMPTABLE =====
export interface EcritureComptable {
  id?: number;
  libelle: string;
  montant: number;
  type: 'RECETTE' | 'DEPENSE';
  categorie?: CategorieEcriture;
  dateEcriture?: string;
  description?: string;
  reference?: string;
  statut?: StatutEcriture;
  motifRejet?: string;
  saisiPar?: any;
  validePar?: any;
  dateValidation?: string;
  createdAt?: string;
}
export type CategorieEcriture = 'COTISATION' | 'DON' | 'FRAIS_CLUB' | 'SUBVENTION' | 'FORMATION' | 'FOURNITURES' | 'SALAIRE_ANIMATEUR' | 'LOYER' | 'EVENEMENT' | 'AUTRE';
export type StatutEcriture = 'EN_ATTENTE' | 'VALIDEE' | 'REJETEE';