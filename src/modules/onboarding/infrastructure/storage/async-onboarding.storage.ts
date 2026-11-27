import AsyncStorage from '@react-native-async-storage/async-storage';
import { OnboardingStorage } from '../../domain/interfaces/onboarding.storage';

const KEY = 'sigec_onboarding_seen';

/**
 * Guarda la marca en AsyncStorage (y no en SecureStore) a propósito: al
 * desinstalar la app se borra, así que una reinstalación vuelve a mostrar el
 * intro. SecureStore usa el Keychain en iOS y puede sobrevivir a la desinstalación.
 */
export class AsyncOnboardingStorage implements OnboardingStorage {
  async hasSeen(): Promise<boolean> {
    try {
      return (await AsyncStorage.getItem(KEY)) === 'true';
    } catch {
      // Si el almacenamiento falla, mejor no estorbar: se salta el intro
      return true;
    }
  }

  async markSeen(): Promise<void> {
    try {
      await AsyncStorage.setItem(KEY, 'true');
    } catch (e) {
      console.warn('No se pudo guardar que el intro ya se vio:', e);
    }
  }

  async reset(): Promise<void> {
    try {
      await AsyncStorage.removeItem(KEY);
    } catch (e) {
      console.warn('No se pudo reiniciar el intro:', e);
    }
  }
}
