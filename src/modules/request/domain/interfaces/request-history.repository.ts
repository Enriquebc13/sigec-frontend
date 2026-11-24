import { RequestHistory } from '../entities/request-history.entity';

export interface RequestHistoryRepository {
  /** GET /requests/history (solo ADMIN), del más reciente al más antiguo. */
  findAll(): Promise<RequestHistory[]>;
}
