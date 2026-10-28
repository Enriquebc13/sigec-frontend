export type UserRole = 'ADMIN' | 'CLIENT';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  active: boolean;
  createdAt: Date;
}