import { OnboardingStorage } from '../../domain/interfaces/onboarding.storage';

export class ResetOnboardingUseCase {
  constructor(private readonly storage: OnboardingStorage) {}

  execute(): Promise<void> {
    return this.storage.reset();
  }
}
