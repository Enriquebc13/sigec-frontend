import { GetRequestsUseCase } from '@/modules/request/application/usecases/get-requests.use-case';
import { RequestApiRepository } from '@/modules/request/infrastructure/repositories/request-api.repository';
import { useRequestList } from '../../hooks/use-request-list';

const useCase = new GetRequestsUseCase(new RequestApiRepository());
const fetchAll = () => useCase.execute();

export const useRequests = () => useRequestList(fetchAll);