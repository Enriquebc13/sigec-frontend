import { jwtDecode } from 'jwt-decode';
import { Session, SessionRole } from '../domain/entities/session.entity';

type JwtPayload = {
  sub: string;
  email: string;
  role: SessionRole;
  exp: number; // segundos desde 1970
};

export function tokenToSession(token: string): Session {
  const p = jwtDecode<JwtPayload>(token);
  return {
    token,
    userId: p.sub,
    email: p.email,
    role: p.role,
    expiresAt: new Date(p.exp * 1000),
  };
}