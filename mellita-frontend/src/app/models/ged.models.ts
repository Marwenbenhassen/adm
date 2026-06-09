export interface GedDocument {
  id?: number;
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  title: string;
  description?: string;
  category: string;
  status: string;
  year: number;
  createdAt: string;
  createdBy: string;
  allowedRoles?: string;
  visibleToAll?: boolean;
}

export const DOCUMENT_CATEGORIES = [
  { value: 'ADMINISTRATIF', label: 'Administratif', icon: 'bi-building' },
  { value: 'FINANCIER', label: 'Financier', icon: 'bi-cash-stack' },
  { value: 'CLUB', label: 'Clubs', icon: 'bi-trophy' },
  { value: 'FORMATION', label: 'Formations', icon: 'bi-mortarboard' },
  { value: 'RAPPORT', label: 'Rapports divers', icon: 'bi-file-earmark-bar-graph' },
  { value: 'CONVENTION', label: 'Conventions et accords', icon: 'bi-file-earmark-text' },
  { value: 'RESSOURCES_HUMAINES', label: 'Ressources Humaines', icon: 'bi-people' },
  { value: 'COMMUNICATION', label: 'Communication externe', icon: 'bi-megaphone' },
  { value: 'TECHNIQUE', label: 'Documents techniques', icon: 'bi-tools' },
  { value: 'JURIDIQUE', label: 'Documents juridiques', icon: 'bi-bank' }
];

export const AVAILABLE_ROLES = [
  { value: 'ROLE_FORMATEUR', label: 'Formateur' },
  { value: 'ROLE_ANIMATEUR', label: 'Animateur' },
  { value: 'ROLE_MEMBRE', label: 'Membre' },
  { value: 'ROLE_TRESORIER', label: 'Trésorier' }
];
