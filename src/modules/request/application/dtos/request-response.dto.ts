export type RequestStatusDto = 'PENDING' | 'APPROVED' | 'REJECTED' | 'WAITLIST';

export interface RequestResponseDto {
  id: string;
  telefono?: string;
  status: RequestStatusDto;
  createdAt: string | Date;
  user?:
    | {
        id?: string;
        name?: string;
        lastname?: string;
        fullName?: string;
        email?: string;
      }
    | string;
  property?:
    | {
        id?: string;
        name?: string;
        title?: string;
      }
    | string;
  nombre?: string;
  apellidos?: string;
  correo?: string;
  propertyId?: string;
  propertyTitle?: string;
  propertyName?: string;
  history?: (string | { action?: string; changedAt?: string })[];
  action?: string;
  request?: RequestResponseDto;
}
