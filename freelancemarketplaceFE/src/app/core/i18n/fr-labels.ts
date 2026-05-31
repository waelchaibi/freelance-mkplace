import { OrderStatus } from '../models/order.model';
import { ServiceStatus } from '../models/service.model';
import { Role } from '../models/role.enum';

export const FR_ORDER_STATUS: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'En attente',
  [OrderStatus.ASSIGNED]: 'Assigné',
  [OrderStatus.IN_PROGRESS]: 'En cours',
  [OrderStatus.DONE]: 'Terminé',
};

export const FR_SERVICE_STATUS: Record<ServiceStatus, string> = {
  [ServiceStatus.PENDING]: 'En attente',
  [ServiceStatus.APPROVED]: 'Approuvé',
  [ServiceStatus.REJECTED]: 'Rejeté',
};

export const FR_AVAILABILITY: Record<string, string> = {
  AVAILABLE: 'Disponible',
  BUSY: 'Occupé',
  UNAVAILABLE: 'Indisponible',
};

export const FR_ROLE: Record<Role, string> = {
  [Role.CLIENT]: 'Client',
  [Role.FREELANCER]: 'Freelancer',
  [Role.ADMIN]: 'Administrateur',
};

export const FR_SNACK = {
  close: 'Fermer',
  saved: 'Enregistré',
  deleted: 'Supprimé',
  error: 'Une erreur est survenue',
  profileUpdated: 'Profil mis à jour',
  passwordChanged: 'Mot de passe modifié',
  passwordsMismatch: 'Les mots de passe ne correspondent pas',
  cvUploaded: 'CV téléversé',
  serviceApproved: 'Service approuvé',
  serviceRejected: 'Service rejeté',
  serviceSubmitted: 'Service soumis pour validation',
  projectCreated: 'Projet créé',
  projectUpdated: 'Projet mis à jour',
  projectDeleted: 'Projet supprimé',
  freelancerAssigned: 'Freelancer assigné',
  statusUpdated: 'Statut mis à jour',
  progressUpdated: 'Progression mise à jour',
  feedbackThanks: 'Merci pour votre évaluation',
  evaluationCreated: 'Évaluation créée',
  accountEnabled: 'Compte activé',
  accountDisabled: 'Compte désactivé',
} as const;

export const FR_ERR = {
  loadDashboard: 'Impossible de charger le tableau de bord',
  loadInbox: 'Impossible de charger la messagerie',
  loadNotifications: 'Impossible de charger les notifications',
  loadMessages: 'Impossible de charger les messages',
  loadAdminContact: 'Impossible de charger le contact admin',
  adminNotReady: 'Contact admin non disponible',
  sendMessage: "Impossible d'envoyer le message",
  createOrder: 'Impossible de créer le projet',
  updateFailed: 'Échec de la mise à jour',
  loginFailed: 'Connexion échouée. Vérifiez vos identifiants.',
  registerFailed: 'Inscription échouée. Essayez un autre email.',
  publishService: 'Impossible de publier le service',
  approveFailed: "Impossible d'approuver",
  rejectFailed: 'Impossible de rejeter',
  assignFailed: "Impossible d'assigner",
  statusUpdateFailed: 'Impossible de mettre à jour le statut',
  passwordChangeFailed: 'Impossible de changer le mot de passe',
  cvUploadFailed: 'Impossible de téléverser le CV',
  deleteFailed: 'Suppression impossible',
  feedbackSend: "Impossible d'envoyer l'évaluation",
} as const;

export function frOrderStatus(status: OrderStatus | string): string {
  return FR_ORDER_STATUS[status as OrderStatus] ?? String(status).replaceAll('_', ' ');
}

export function frServiceStatus(status: ServiceStatus | string): string {
  return FR_SERVICE_STATUS[status as ServiceStatus] ?? String(status);
}

export function frAvailability(status: string | null | undefined): string {
  if (!status) return '—';
  return FR_AVAILABILITY[status] ?? status;
}

export function frRole(role: Role | string): string {
  return FR_ROLE[role as Role] ?? String(role);
}

export function resolveApiFileUrl(path: string | null | undefined, apiBase: string): string | null {
  if (!path) return null;
  return path.startsWith('http') ? path : `${apiBase}${path}`;
}
