import type { Href } from 'expo-router';
import { SessionRole } from '../../domain/entities/session.entity';

export const getHomeRoute = (role?: SessionRole | null): Href =>
  (role === 'ADMIN' ? '/(admin)/home' : '/(client)/home') as Href;