export interface OnboardingStorage {
  /** true si este dispositivo ya vio (o saltó) la introducción. */
  hasSeen(): Promise<boolean>;
  markSeen(): Promise<void>;
  /** Borra la marca para volver a verla como en una instalación nueva (pruebas). */
  reset(): Promise<void>;
}
