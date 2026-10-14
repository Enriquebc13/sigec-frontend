import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

import { AuthUser } from "../../domain/entities/auth-user.entity";
import { AuthRepository } from "../../domain/repositories/auth.repository";

export class FirebaseAuthRepository implements AuthRepository {

    async login(
        email: string,
        password: string
    ): Promise<AuthUser> {

        const result = await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

        return {
            id: result.user.uid,
            email: result.user.email ?? "",
        };
    }
}