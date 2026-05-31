export interface Feedback {
  id: number;
  orderId: number | null;
  clientId: number | null;
  clientName: string | null;
  adminId: number | null;
  adminName: string | null;
  freelancerId: number;
  freelancerName: string;
  rating: number;
  qualityScore: number | null;
  communicationScore: number | null;
  timelinessScore: number | null;
  adminCreated: boolean;
  comment: string;
  createdAt: string;
}

export interface CreateFeedbackRequest {
  orderId: number;
  rating: number;
  qualityScore: number;
  communicationScore: number;
  timelinessScore: number;
  comment: string;
}

export interface CreateAdminFeedbackRequest {
  freelancerId: number;
  orderId?: number | null;
  rating: number;
  qualityScore: number;
  communicationScore: number;
  timelinessScore: number;
  comment: string;
}
