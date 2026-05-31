import { OrderStatus } from './order.model';

export interface ConversationSummary {
  orderId: number;
  orderTitle: string;
  orderDescription: string;
  orderStatus: OrderStatus;
  counterpartName: string;
  lastMessagePreview: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
}
