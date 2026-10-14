//@ts-ignore
import { getReactNativePersistence } from "@firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp } from "firebase/app";
import { Auth, getAuth, initializeAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBc41pD08icjqzaT7epDy9aEaPMI-P9BQ0",
    authDomain: "tests-8026a.firebaseapp.com",
    projectId: "tests-8026a",
    storageBucket: "tests-8026a.firebasestorage.app",
    messagingSenderId: "805338897514",
    appId: "1:805338897514:web:140341270ab7432ede3e13"
};

// Evita reinicializar la app si ya existe (por Fast Refresh)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let auth: Auth;
try {
    auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
    });
} catch (error) {
    // Si ya fue inicializado antes (Fast Refresh), reutiliza la instancia existente
    auth = getAuth(app);
}

export { app, auth };

