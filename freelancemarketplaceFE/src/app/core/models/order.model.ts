export enum OrderStatus {
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export interface Order {
  id: number;
  clientId: number;
  clientName: string;
  serviceId: number | null;
  serviceTitle: string | null;
  description: string;
  status: OrderStatus;
  assignedFreelancerId: number | null;
  assignedFreelancerName: string | null;
}

export interface CreateOrderRequest {
  serviceId?: number | null;
  description: string;
}
