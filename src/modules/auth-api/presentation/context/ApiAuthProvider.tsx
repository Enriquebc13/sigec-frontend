import { setAuthToken, setUnauthorizedHandler } from '@/core/http/api-client';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { LoginUseCase } from '../../application/usecases/login.use-case';
import { LogoutUseCase } from '../../application/usecases/logout.use-case';
import { RestoreSessionUseCase } from '../../application/usecases/restore-session.use-case';
import { Session } from '../../domain/entities/session.entity';
import { AuthApiRepository } from '../../infrastructure/repositories/auth-api.repository';
import { SecureSessionStorage } from '../../infrastructure/storage/secure-session.storage';

const storage = new SecureSessionStorage();
const loginUseCase = new LoginUseCase(new AuthApiRepository(), storage);
const restoreSessionUseCase = new RestoreSessionUseCase(storage);
const logoutUseCase = new LogoutUseCase(storage);

type ApiAuthContextValue = {
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<Session>;
  logout: () => Promise<void>;
  checkLogued: () => boolean;
};

const ApiAuthContext = createContext<ApiAuthContextValue | null>(null);

export function ApiAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Al abrir la app: restaurar la sesión guardada
  useEffect(() => {
    restoreSessionUseCase
      .execute()
      .then((s) => {
        if (s) {
          setAuthToken(s.token);
          setSession(s);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const s = await loginUseCase.execute(email, password);
    setAuthToken(s.token);
    setSession(s);
    return s;
  }, []);

  const logout = useCallback(async () => {
    await logoutUseCase.execute();
    setAuthToken(null);
    setSession(null);
  }, []);

  // Si la API responde 401, cerrar sesión
  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout();
    });
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  const value = useMemo(
    () => ({ session, loading, login, logout, checkLogued: () => session !== null }),
    [session, loading, login, logout],
  );

  return <ApiAuthContext.Provider value={value}>{children}</ApiAuthContext.Provider>;
}

export function useApiAuth() {
  const ctx = useContext(ApiAuthContext);
  if (!ctx) throw new Error('useApiAuth debe usarse dentro de ApiAuthProvider');
  return ctx;
}