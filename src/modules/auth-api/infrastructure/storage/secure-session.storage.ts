import * as SecureStore from 'expo-secure-store';
import { Session } from '../../domain/entities/session.entity';
import { SessionStorage } from '../../domain/interfaces/session.storage';
import { tokenToSession } from '../token-to-session';

const KEY = 'sigec_token';

export class SecureSessionStorage implements SessionStorage {
  async save(session: Session): Promise<void> {
    await SecureStore.setItemAsync(KEY, session.token);
  }

  async load(): Promise<Session | null> {
    const token = await SecureStore.getItemAsync(KEY);
    if (!token) return null;

    try {
      const session = tokenToSession(token);
      if (session.expiresAt.getTime() <= Date.now()) {
        await this.clear(); // token vencido
        return null;
      }
      return session;
    } catch {
      await this.clear(); // token corrupto
      return null;
    }
  }

  async clear(): Promise<void> {
    await SecureStore.deleteItemAsync(KEY);
  }
}