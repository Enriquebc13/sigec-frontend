export type SessionRole = 'ADMIN' | 'CLIENT';

export interface Session {
  token: string;
  userId: string;
  email: string;
  role: SessionRole;
  expiresAt: Date;
}