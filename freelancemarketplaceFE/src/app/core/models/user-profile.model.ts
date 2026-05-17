import { Role } from './role.enum';

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: Role;
}
