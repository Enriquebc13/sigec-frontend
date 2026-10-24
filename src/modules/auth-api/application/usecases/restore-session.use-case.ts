import { Session } from '../../domain/entities/session.entity';
import { SessionStorage } from '../../domain/interfaces/session.storage';

export class RestoreSessionUseCase {
  constructor(private readonly storage: SessionStorage) {}

  execute(): Promise<Session | null> {
    return this.storage.load();
  }
}