import { AuthRepository, LoginResult } from "../repositories/auth.repository";

export class LoginUser {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(email: string, password: string): Promise<LoginResult> {
    return await this.authRepository.login(email, password);
  }
}
