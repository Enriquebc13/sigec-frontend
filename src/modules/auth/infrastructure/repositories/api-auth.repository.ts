import { apiClient, setAuthToken } from "@/core/http/api-client";
import { AuthUser } from "../../domain/entities/auth-user.entity";
import { AuthRepository, LoginResult } from "../../domain/repositories/auth.repository";

interface LoginApiResponse {
  access_token: string;
}

interface JwtPayload {
  sub: string;
  email: string;
  role: 'ADMIN' | 'CLIENT';
  iat?: number;
  exp?: number;
}

interface UserDetailResponse {
  id: string;
  name: string;
  lastname: string;
  email: string;
  role: 'ADMIN' | 'CLIENT';
  active: boolean;
  createdAt: string;
}

function decodeJwtPayload<T = any>(token: string): T {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) {
      throw new Error('Token inválido');
    }
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const pad = base64.length % 4;
    const padded = pad ? base64 + '='.repeat(4 - pad) : base64;

    let decoded = '';
    if (typeof atob === 'function') {
      decoded = atob(padded);
    } else {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
      let bc = 0;
      let bs = 0;
      let buffer = 0;
      let idx = 0;
      for (; (buffer = padded.charCodeAt(idx++)); ) {
        const val = chars.indexOf(String.fromCharCode(buffer));
        if (~val) {
          bs = bc % 4 ? bs * 64 + val : val;
          if (bc++ % 4) {
            decoded += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6)));
          }
        }
      }
    }
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Error decodificando JWT:', error);
    throw new Error('No se pudo decodificar el token de autenticación');
  }
}

export class ApiAuthRepository implements AuthRepository {
  async login(email: string, password: string): Promise<LoginResult> {
    const response = await apiClient<LoginApiResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (!response || !response.access_token) {
      throw new Error('Respuesta inválida del servidor');
    }

    const payload = decodeJwtPayload<JwtPayload>(response.access_token);
    setAuthToken(response.access_token);

    let name = '';
    let lastname = '';
    let createdAt = '';

    try {
      const userDetail = await apiClient<UserDetailResponse>(`/users/${payload.sub}`);
      name = userDetail.name;
      lastname = userDetail.lastname;
      createdAt = userDetail.createdAt;
    } catch {
      // Si falla obtener detalles adicionales, seguimos con los datos del token
    }

    const user: AuthUser = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      name: name || undefined,
      lastname: lastname || undefined,
      metadata: {
        lastSignInTime: new Date().toLocaleString(),
        creationTime: createdAt ? new Date(createdAt).toLocaleString() : undefined,
      },
    };

    return {
      user,
      token: response.access_token,
    };
  }
}
