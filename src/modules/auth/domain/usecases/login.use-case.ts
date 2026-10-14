import { AuthUser } from "../entities/auth-user.entity";
import { AuthRepository } from "../repositories/auth.repository";

export class LoginUser {
    constructor(private readonly authRepository: AuthRepository) {}

    async execute(email: string, password: string): Promise<AuthUser> {
        return await this.authRepository.login(email, password);
    }
}