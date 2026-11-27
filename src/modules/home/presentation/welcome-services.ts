import { CheckWelcomeSeenUseCase } from '../application/usecases/check-welcome-seen.use-case';
import { CompleteWelcomeUseCase } from '../application/usecases/complete-welcome.use-case';
import { ResetWelcomeUseCase } from '../application/usecases/reset-welcome.use-case';
import { AsyncWelcomeStorage } from '../infrastructure/storage/async-welcome.storage';

const storage = new AsyncWelcomeStorage();

export const checkWelcomeSeen = new CheckWelcomeSeenUseCase(storage);
export const completeWelcome = new CompleteWelcomeUseCase(storage);
export const resetWelcome = new ResetWelcomeUseCase(storage);
