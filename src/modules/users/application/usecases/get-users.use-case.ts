import { User } from "../../domain/entities/user.entity";
import { UserRepository } from "../../domain/interfaces/user.repository";


export class GetUsersUseCase {
  constructor(private readonly repository: UserRepository) {}

  execute(): Promise<User[]> {
    return this.repository.getAll();
  }
}