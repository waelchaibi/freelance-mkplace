export interface ActivityDataPoint {
  label: string;
  orders: number;
  messages: number;
}

export interface AdminStatsResponse {
  ordersByStatus: Record<string, number>;
  usersByRole: Record<string, number>;
  servicesByStatus: Record<string, number>;
  activeProjects: number;
  unreadNotifications: number;
  totalFeedbacks: number;
  averageFeedbackRating: number;
  totalMessages: number;
  unreadMessages: number;
  activityLast7Days: ActivityDataPoint[];
}

export type AdminStats = AdminStatsResponse;
