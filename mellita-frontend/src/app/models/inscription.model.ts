export interface EvenementPublic {
  id: number;
  titre: string;
  titreAr?: string;
  description?: string;
  dateDebut: string;
  dateFin: string;
  lieu: string;
  prix: number;
  capaciteMax: number;
  statut: string;
}

export interface FormationPublic {
  id: number;
  titre: string;
  titreAr?: string;
  description?: string;
  dateDebut: string;
  dateFin: string;
  dureeHeures: number;
  lieu: string;
  prix: number;
  capaciteMax: number;
  statut: string;
  formateur?: string;
}

export interface DemandeInscriptionEvenement {
  id: number;
  evenementId: number;
  evenementTitre: string;
  membreId: number;
  membreNom: string;
  membreEmail: string;
  message?: string;
  statut: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  dateDemande: string;
}

export interface DemandeInscriptionFormation {
  id: number;
  formationId: number;
  formationTitre: string;
  membreId: number;
  membreNom: string;
  membreEmail: string;
  motivation?: string;
  statut: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  dateDemande: string;
}