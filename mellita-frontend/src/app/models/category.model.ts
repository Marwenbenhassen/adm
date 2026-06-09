export interface Category {
  id?: number;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const DEFAULT_ICONS = [
  { value: 'bi-building', label: 'Bâtiment' },
  { value: 'bi-cash-stack', label: 'Finance' },
  { value: 'bi-trophy', label: 'Trophée' },
  { value: 'bi-mortarboard', label: 'Formation' },
  { value: 'bi-calendar-event', label: 'Événement' },
  { value: 'bi-people', label: 'Personnes' },
  { value: 'bi-file-text', label: 'Document' },
  { value: 'bi-graph-up', label: 'Statistiques' }
];

export const DEFAULT_COLORS = [
  { value: '#4CAF50', label: 'Vert' },
  { value: '#2196F3', label: 'Bleu' },
  { value: '#FF9800', label: 'Orange' },
  { value: '#F44336', label: 'Rouge' },
  { value: '#9C27B0', label: 'Violet' },
  { value: '#00BCD4', label: 'Cyan' },
  { value: '#FFC107', label: 'Jaune' },
  { value: '#795548', label: 'Marron' }
];
