import { CheckOnboardingSeenUseCase } from '../application/usecases/check-onboarding-seen.use-case';
import { CompleteOnboardingUseCase } from '../application/usecases/complete-onboarding.use-case';
import { ResetOnboardingUseCase } from '../application/usecases/reset-onboarding.use-case';
import { AsyncOnboardingStorage } from '../infrastructure/storage/async-onboarding.storage';

const storage = new AsyncOnboardingStorage();

export const checkOnboardingSeen = new CheckOnboardingSeenUseCase(storage);
export const completeOnboarding = new CompleteOnboardingUseCase(storage);
export const resetOnboarding = new ResetOnboardingUseCase(storage);
