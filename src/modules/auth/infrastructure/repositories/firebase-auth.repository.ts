import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

import { AuthUser } from "../../domain/entities/auth-user.entity";
import { AuthRepository, LoginResult } from "../../domain/repositories/auth.repository";

export class FirebaseAuthRepository implements AuthRepository {
  async login(
    email: string,
    password: string
  ): Promise<LoginResult> {
    const result = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const token = await result.user.getIdToken();

    const user: AuthUser = {
      id: result.user.uid,
      email: result.user.email ?? "",
      role: 'CLIENT',
      metadata: {
        lastSignInTime: result.user.metadata.lastSignInTime,
        creationTime: result.user.metadata.creationTime,
      },
    };

    return {
      user,
      token,
    };
  }
}
