import { Session } from '../entities/session.entity';

export interface AuthRepository {
  login(email: string, password: string): Promise<Session>;
}