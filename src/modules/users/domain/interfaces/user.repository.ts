import { User } from '../entities/user.entity';

export interface UserRepository {
  getAll(): Promise<User[]>;
}