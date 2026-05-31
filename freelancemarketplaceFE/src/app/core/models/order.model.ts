export enum OrderStatus {
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export interface OrderTimelineEvent {
  label: string;
  status: OrderStatus;
  occurredAt: string;
}

export interface FreelancerSummary {
  id: number;
  name: string;
  specialty: string | null;
  yearsOfExperience: number | null;
  dailyRate: number | null;
  availability: string | null;
  skills: string | null;
  averageRating: number;
}

export interface Order {
  id: number;
  clientId: number;
  clientName: string;
  serviceId: number | null;
  serviceTitle: string | null;
  title: string;
  technology: string | null;
  description: string;
  status: OrderStatus;
  progressPercent: number;
  assignedFreelancerId: number | null;
  assignedFreelancerName: string | null;
  deadline: string | null;
  createdAt: string | null;
  timeline: OrderTimelineEvent[];
  assignedFreelancer: FreelancerSummary | null;
}

export interface CreateOrderRequest {
  serviceId?: number | null;
  title?: string | null;
  technology?: string | null;
  description: string;
  deadline?: string | null;
}

export interface CreateAdminOrderRequest {
  clientId: number;
  serviceId?: number | null;
  title?: string | null;
  technology?: string | null;
  description: string;
  deadline?: string | null;
  assignedFreelancerId?: number | null;
  status?: OrderStatus | null;
}

export interface UpdateOrderRequest {
  title?: string | null;
  technology?: string | null;
  description?: string | null;
  deadline?: string | null;
  assignedFreelancerId?: number | null;
  status?: OrderStatus | null;
}

export interface AssignFreelancerRequest {
  freelancerId: number;
  deadline?: string | null;
}

export interface UpdateOrderProgressRequest {
  progressPercent: number;
}
