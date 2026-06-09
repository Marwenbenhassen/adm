export interface User {
  id?: number;
  prenom: string;
  nom: string;
  email: string;
  telephone?: string;
  adresse?: string;
  photo?: string;
  role: Role;
  statut?: StatutMembre;
  dateAdhesion?: string;
  createdAt?: string;
}

export type Role = 'ADMIN' | 'ADMINISTRATIF' | 'TRESORIER' | 'FORMATEUR' | 'ANIMATEUR' | 'MEMBRE';
export type StatutMembre = 'ACTIF' | 'INACTIF' | 'EN_ATTENTE';

// ✅ Ces constantes sont déjà présentes
export const ROLE_LABELS: Record<Role, string> = {
  ADMIN:          'Administrateur',
  ADMINISTRATIF:  'Administratif',
  TRESORIER:      'Trésorier',
  FORMATEUR:      'Formateur',
  ANIMATEUR:      'Animateur de Club',
  MEMBRE:         'Membre'
};

export const ROLE_COLORS: Record<Role, string> = {
  ADMIN:          '#dc3545',
  ADMINISTRATIF:  '#1a6b3c',
  TRESORIER:      '#c8a84b',
  FORMATEUR:      '#6f42c1',
  ANIMATEUR:      '#e83e8c',
  MEMBRE:         '#1e4d7b'
};

export interface AuthRequest {
  email: string;
  motDePasse: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  id: number;
  prenom: string;
  nom: string;
  email: string;
  role: Role;
}

export interface RegisterRequest {
  prenom: string;
  nom: string;
  email: string;
  motDePasse: string;
  telephone?: string;
  adresse?: string;
}