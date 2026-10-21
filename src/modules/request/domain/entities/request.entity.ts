export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Request {
  id: string;
  telefono: string;
  status: RequestStatus;
  createdAt: Date;
  userName: string;
  propertyName: string;
  history: string[];
}