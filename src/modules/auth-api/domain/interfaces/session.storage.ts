import { Session } from '../entities/session.entity';

export interface SessionStorage {
  save(session: Session): Promise<void>;
  load(): Promise<Session | null>; // null si no hay sesión o ya expiró
  clear(): Promise<void>;
}