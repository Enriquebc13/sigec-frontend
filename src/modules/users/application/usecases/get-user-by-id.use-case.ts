import { User } from '../../domain/entities/user.entity';
import { UserRepository } from '../../domain/interfaces/user.repository';

export class GetUserByIdUseCase {
  constructor(private readonly repository: UserRepository) {}

  execute(id: string): Promise<User> {
    if (!id) {
      throw new Error('El id del usuario es obligatorio');
    }
    return this.repository.getById(id);
  }
}