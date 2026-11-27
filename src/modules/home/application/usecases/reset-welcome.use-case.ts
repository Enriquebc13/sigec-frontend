import { WelcomeStorage } from '../../domain/interfaces/welcome.storage';

export class ResetWelcomeUseCase {
  constructor(private readonly storage: WelcomeStorage) {}

  execute(userId: string): Promise<void> {
    return this.storage.reset(userId);
  }
}
