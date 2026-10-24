import { NewUser } from '../../domain/entities/new-user.entity';
import { UserRepository } from '../../domain/interfaces/user.repository';

export class CreateUserUseCase {
  constructor(private readonly repository: UserRepository) {}

  async execute(user: NewUser): Promise<void> {
    const name = user.name.trim();
    const lastname = user.lastname.trim();
    const email = user.email.trim().toLowerCase();

    if (!name || !lastname) {
      throw new Error('El nombre y el apellido son obligatorios');
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      throw new Error('El correo no tiene un formato válido');
    }
    if (user.password.length < 8) {
      throw new Error('La contraseña debe tener al menos 8 caracteres');
    }

    await this.repository.create({ ...user, name, lastname, email });
  }
}