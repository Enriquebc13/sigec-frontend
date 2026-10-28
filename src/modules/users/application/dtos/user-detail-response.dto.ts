export interface UserDetailResponseDto {
  id: string;
  name: string;
  lastname: string;
  email: string;
  role: 'ADMIN' | 'CLIENT';
  active: boolean;
  createdAt: string;
  updatedAt?: string | null;
}