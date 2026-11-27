import { OnboardingStorage } from '../../domain/interfaces/onboarding.storage';

export class CheckOnboardingSeenUseCase {
  constructor(private readonly storage: OnboardingStorage) {}

  execute(): Promise<boolean> {
    return this.storage.hasSeen();
  }
}
