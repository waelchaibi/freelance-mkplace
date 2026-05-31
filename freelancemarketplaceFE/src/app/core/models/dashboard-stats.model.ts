export interface ClientStats {
  totalOrders: number;
  submittedOrders: number;
  completedOrders: number;
  pendingOrders: number;
  inProgressOrders: number;
  unreadMessages: number;
}

export interface FreelancerStats {
  assignedOrders: number;
  inProgressOrders: number;
  completedOrders: number;
  pendingServices: number;
  approvedServices: number;
  averageRating: number;
  reviewCount: number;
  unreadMessages: number;
}
