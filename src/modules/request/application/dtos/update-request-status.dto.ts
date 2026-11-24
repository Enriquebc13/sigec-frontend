import { DecisionStatus } from '../../domain/entities/request.entity';

export interface UpdateRequestStatusDto {
  status: DecisionStatus;
}
