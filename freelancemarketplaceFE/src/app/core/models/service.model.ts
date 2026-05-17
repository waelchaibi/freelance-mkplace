export enum ServiceStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
}

export interface CreateServiceRequest {
  title: string;
  description: string;
  price: number;
}

export interface MarketplaceService {
  id: number;
  freelancerId: number;
  freelancerName: string;
  title: string;
  description: string;
  price: number;
  status: ServiceStatus;
}
