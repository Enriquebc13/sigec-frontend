import { apiClient } from '@/core/http/api-client';
import { LoginResponseDto } from '../../application/dtos/login-response.dto';
import { Session } from '../../domain/entities/session.entity';
import { AuthRepository } from '../../domain/interfaces/auth.repository';
import { tokenToSession } from '../token-to-session';

export class AuthApiRepository implements AuthRepository {
  async login(email: string, password: string): Promise<Session> {
    const data = await apiClient<LoginResponseDto>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return tokenToSession(data.access_token);
  }
}