export interface Message {
  id: number;
  orderId: number;
  senderId: number;
  senderName: string;
  receiverId: number;
  receiverName: string;
  content: string;
  createdAt: string;
}

export interface SendMessageRequest {
  orderId: number;
  receiverId: number;
  content: string;
}
