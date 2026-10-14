import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut as signOutFirebase, User } from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { LoginUser } from '../../domain/usecases/login.use-case';
import { FirebaseAuthRepository } from '../../infrastructure/repositories/firebase-auth.repository';

type AuthContextType = {
  user: User | null;      // usuario autenticado actual (o null si no hay sesión)
  loading: boolean;                  // true mientras Firebase verifica si hay sesión guardada
  login: (email: string, password: string) => Promise<void>; // función para iniciar sesión
  setUser: (user: User | null) => void;  // permite actualizar el usuario manualmente si hace falta
  signOut: () => void;            // función para cerrar sesión
  checkLogued: () => boolean; // indica si hay un usuario autenticado (true/false)
};

// Valores por defecto del contexto
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  setUser: () => {},
  signOut: () => {},
  checkLogued: () => false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged es un listener de Firebase: se dispara
    // automáticamente cada vez que cambia el estado de autenticación
    // (login, logout, o al restaurar una sesión guardada al abrir la app)
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log("info del usuario:", firebaseUser?.email ?? "sin usuario");
      setUser(firebaseUser);   // actualiza el usuario con el valor real de Firebase
      setLoading(false);        // ya termino de verificar, se puede dejar de mostrar el splash/loader
    });
    return () => unsubscribe();
  }, []);

  // Autenticación: Ocupa lógica al caso de uso (LoginUser),
  // que a su vez usa el repositorio concreto de Firebase.
  // onAuthStateChanged lo detecta y lo actualiza automáticamente.
  const login = async (email: string, password: string) => {
    const repository = new FirebaseAuthRepository();
    const loginUser = new LoginUser(repository);
    await loginUser.execute(email, password);
  };

  // Cierre de sesion
  const signOut = async () => {
    try {
      await signOutFirebase(auth);
      setUser(null);
    } catch (error) {
      console.log('Error al cerrar sesión:', error);
      throw error;
    }
  };
  const checkLogued = () => {
    return !!user;
  };

  // Expone el estado y las funciones a todos los componentes hijos
  return (
    <AuthContext.Provider value={{ user, loading, login, setUser, signOut, checkLogued }}>
      {children}
    </AuthContext.Provider>
  );
};

// se usa useAuth()
export const useAuth = () => useContext(AuthContext);


  // const signOut = () => {   
  //   const auth = getAuth(app);
  //   signOutFirebase(auth).then(() => {
  //     setUser(null);
  //   }).catch((error) => {
  //     console.log('Error al cerrar sesión:', error);
  //   });
  // };