import { CreateRequestDto } from '../dtos/create-request.dto';
import { Request } from '../../domain/entities/request.entity';
import { RequestRepository } from '../../domain/interfaces/request.repository';

export class CreateRequestUseCase {
  constructor(private readonly repository: RequestRepository) {}

  execute(input: CreateRequestDto): Promise<Request> {
    return this.repository.create(input);
  }
}
