import { WelcomeStorage } from '../../domain/interfaces/welcome.storage';

export class CheckWelcomeSeenUseCase {
  constructor(private readonly storage: WelcomeStorage) {}

  execute(userId: string): Promise<boolean> {
    return this.storage.hasSeen(userId);
  }
}
