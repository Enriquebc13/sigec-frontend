import { Request } from '../entities/request.entity';

export interface RequestRepository {
  getMyRequests(): Promise<Request[]>;
}