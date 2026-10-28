import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuthToken } from '@/core/http/api-client';
import { AuthUser } from '../../domain/entities/auth-user.entity';
import { LoginUser } from '../../domain/usecases/login.use-case';
import { ApiAuthRepository } from '../../infrastructure/repositories/api-auth.repository';

const STORAGE_KEY_TOKEN = '@sigec_auth_token';
const STORAGE_KEY_USER = '@sigec_auth_user';

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  setUser: (user: AuthUser | null) => void;
  signOut: () => Promise<void>;
  checkLogued: () => boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {
    throw new Error('AuthContext no inicializado');
  },
  setUser: () => {},
  signOut: async () => {},
  checkLogued: () => false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const [savedToken, savedUser] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY_TOKEN),
          AsyncStorage.getItem(STORAGE_KEY_USER),
        ]);

        if (savedToken && savedUser) {
          setAuthToken(savedToken);
          setUser(JSON.parse(savedUser));
        } else {
          setAuthToken(null);
          setUser(null);
        }
      } catch (error) {
        console.error('Error restaurando la sesión:', error);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (email: string, password: string): Promise<AuthUser> => {
    const repository = new ApiAuthRepository();
    const loginUser = new LoginUser(repository);
    const result = await loginUser.execute(email, password);

    setAuthToken(result.token);
    setUser(result.user);

    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEY_TOKEN, result.token),
      AsyncStorage.setItem(STORAGE_KEY_USER, JSON.stringify(result.user)),
    ]);

    return result.user;
  };

  const signOut = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEY_TOKEN),
        AsyncStorage.removeItem(STORAGE_KEY_USER),
      ]);
      setAuthToken(null);
      setUser(null);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      throw error;
    }
  };

  const checkLogued = () => {
    return !!user;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, setUser, signOut, checkLogued }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
