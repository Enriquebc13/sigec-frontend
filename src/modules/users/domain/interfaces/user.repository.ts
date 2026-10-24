import { NewUser } from '../entities/new-user.entity';
import { UserChanges } from '../entities/user-changes.entity';
import { User } from '../entities/user.entity';

export interface UserRepository {
  getAll(): Promise<User[]>;
  create(user: NewUser): Promise<void>;
  update(id: string, changes: UserChanges): Promise<void>;
  delete(id: string): Promise<void>;
}