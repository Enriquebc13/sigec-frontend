export interface WelcomeStorage {
  /** true si ese usuario ya vio la bienvenida en este dispositivo. */
  hasSeen(userId: string): Promise<boolean>;
  markSeen(userId: string): Promise<void>;
  /** Borra la marca de ese usuario para volver a verla (pruebas). */
  reset(userId: string): Promise<void>;
}
