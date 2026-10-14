import { AuthUser } from "../entities/auth-user.entity";

export interface AuthRepository {
    login(email: string, password: string): Promise<AuthUser>;
}
// Este será el contrato que indica qué operaciones de autenticación necesitamos: