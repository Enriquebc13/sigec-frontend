import { Session } from '../../domain/entities/session.entity';
import { AuthRepository } from '../../domain/interfaces/auth.repository';
import { SessionStorage } from '../../domain/interfaces/session.storage';

export class LoginUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly storage: SessionStorage,
  ) {}

  async execute(email: string, password: string): Promise<Session> {
    if (!email.trim() || !password) {
      throw new Error('Ingresa tu correo y tu contraseña');
    }
    const session = await this.authRepository.login(email.trim().toLowerCase(), password);
    await this.storage.save(session);
    return session;
  }
}