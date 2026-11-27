import { WelcomeStorage } from '../../domain/interfaces/welcome.storage';

export class CompleteWelcomeUseCase {
  constructor(private readonly storage: WelcomeStorage) {}

  execute(userId: string): Promise<void> {
    return this.storage.markSeen(userId);
  }
}
