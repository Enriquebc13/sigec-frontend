import AsyncStorage from '@react-native-async-storage/async-storage';
import { WelcomeStorage } from '../../domain/interfaces/welcome.storage';

// Una marca por usuario: otro usuario en el mismo dispositivo sí ve su bienvenida
const keyFor = (userId: string) => `sigec_welcome_seen_${userId}`;

export class AsyncWelcomeStorage implements WelcomeStorage {
  async hasSeen(userId: string): Promise<boolean> {
    try {
      return (await AsyncStorage.getItem(keyFor(userId))) === 'true';
    } catch {
      // Si el almacenamiento falla, mejor no estorbar: se salta la bienvenida
      return true;
    }
  }

  async markSeen(userId: string): Promise<void> {
    try {
      await AsyncStorage.setItem(keyFor(userId), 'true');
    } catch (e) {
      console.warn('No se pudo guardar que la bienvenida ya se vio:', e);
    }
  }

  async reset(userId: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(keyFor(userId));
    } catch (e) {
      console.warn('No se pudo reiniciar la bienvenida:', e);
    }
  }
}
