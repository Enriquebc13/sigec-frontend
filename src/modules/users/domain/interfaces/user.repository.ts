import { NewUser } from '../entities/new-user.entity';
import { User } from '../entities/user.entity';

export interface UserRepository {
  getAll(): Promise<User[]>;
  create(user: NewUser): Promise<void>;
  delete(id: string): Promise<void>;
}