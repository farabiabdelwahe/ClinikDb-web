export type UserRole = 'admin' | 'agent' | 'doctor';

export interface AppUser {
  id: string; // matches Firebase UID or backend id
  email: string;
  role: UserRole;
  displayName: string;
  createdAt: number;
  photoURL?: string | null;
}
