import { CreateRequestDto } from '../../application/dtos/create-request.dto';
import { Request, RequestStatus } from '../entities/request.entity';

export interface RequestRepository {
  getMyRequests(): Promise<Request[]>;
  getAll(): Promise<Request[]>;
  create(input: CreateRequestDto): Promise<Request>;
  updateStatus(id: string, status: RequestStatus): Promise<Request>;
  delete(id: string): Promise<void>;
}