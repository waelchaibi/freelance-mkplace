import { Role } from './role.enum';

export type AvailabilityStatus = 'AVAILABLE' | 'BUSY' | 'UNAVAILABLE';

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: Role;
  enabled: boolean;
  specialty: string | null;
  yearsOfExperience: number | null;
  dailyRate: number | null;
  availability: AvailabilityStatus | null;
  skills: string | null;
  cvUrl: string | null;
  cvUploadedAt: string | null;
  averageRating: number | null;
}

export interface UpdateProfileRequest {
  name: string;
  email: string;
  specialty?: string | null;
  yearsOfExperience?: number | null;
  dailyRate?: number | null;
  availability?: AvailabilityStatus | null;
  skills?: string | null;
  cvUrl?: string | null;
}

export interface UserListFilters {
  specialty?: string;
  availability?: AvailabilityStatus;
  minRating?: number;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
