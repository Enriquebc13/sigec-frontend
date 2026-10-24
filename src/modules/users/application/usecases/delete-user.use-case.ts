import { UserRepository } from '../../domain/interfaces/user.repository';

export class DeleteUserUseCase {
  constructor(private readonly repository: UserRepository) {}

  async execute(id: string): Promise<void> {
    if (!id) {
      throw new Error('El id del usuario es obligatorio');
    }
    await this.repository.delete(id);
  }
}