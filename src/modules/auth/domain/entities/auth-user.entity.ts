export interface AuthUser {
  id: string;
  email: string;
  role: 'ADMIN' | 'CLIENT';
  name?: string;
  lastname?: string;
  metadata?: {
    lastSignInTime?: string;
    creationTime?: string;
  };
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  role?: 'ADMIN' | 'CLIENT';
}
