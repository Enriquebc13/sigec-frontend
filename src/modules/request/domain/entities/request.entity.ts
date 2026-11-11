export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'WAITLIST';

export interface Request {
  id: string;
  telefono: string;
  status: RequestStatus;
  createdAt: Date;
  userName: string;
  propertyName: string;
  history: string[];
}
