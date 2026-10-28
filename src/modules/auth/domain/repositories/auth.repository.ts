import { AuthUser } from "../entities/auth-user.entity";

export interface LoginResult {
  user: AuthUser;
  token: string;
}

export interface AuthRepository {
  login(email: string, password: string): Promise<LoginResult>;
}
