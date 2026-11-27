import { OnboardingStorage } from '../../domain/interfaces/onboarding.storage';

export class CompleteOnboardingUseCase {
  constructor(private readonly storage: OnboardingStorage) {}

  execute(): Promise<void> {
    return this.storage.markSeen();
  }
}
