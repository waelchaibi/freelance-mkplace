import { Role } from './role.enum';

export interface AuthUser {
  userId: number;
  name: string;
  email: string;
  role: Role;
}

export interface AuthResponse {
  token: string;
  userId: number;
  name: string;
  email: string;
  role: Role;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: Role.CLIENT | Role.FREELANCER;
}
