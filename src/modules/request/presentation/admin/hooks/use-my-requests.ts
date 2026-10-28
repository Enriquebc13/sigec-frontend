import { GetMyRequestsUseCase } from '@/modules/request/application/usecases/get-my-requests.use-case';
import { RequestApiRepository } from '@/modules/request/infrastructure/repositories/request-api.repository';
import { useRequestList } from './use-request-list';

const useCase = new GetMyRequestsUseCase(new RequestApiRepository());
const fetchMine = () => useCase.execute();

export const useMyRequests = () => useRequestList(fetchMine);