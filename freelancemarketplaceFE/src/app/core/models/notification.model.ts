export type EmailDeliveryStatus = 'NOT_APPLICABLE' | 'PENDING' | 'SENT' | 'FAILED';

export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  referenceId: number | null;
  read: boolean;
  emailDeliveryStatus: EmailDeliveryStatus;
  createdAt: string;
}

export interface AdminNotificationLog {
  id: number;
  recipientId: number;
  recipientName: string;
  recipientEmail: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  emailDeliveryStatus: EmailDeliveryStatus;
  createdAt: string;
}
