import { SessionStorage } from '../../domain/interfaces/session.storage';

export class LogoutUseCase {
  constructor(private readonly storage: SessionStorage) {}

  execute(): Promise<void> {
    return this.storage.clear();
  }
}