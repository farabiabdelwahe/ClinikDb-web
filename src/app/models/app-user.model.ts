export type UserRole = 'admin' | 'agent';

export interface AppUser {
  id: string; // matches Firebase UID or backend id
  email: string;
  role: UserRole;
  displayName: string;
  createdAt: number;
}

