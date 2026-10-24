import { UserChanges } from '../../domain/entities/user-changes.entity';
import { UserRepository } from '../../domain/interfaces/user.repository';

export class UpdateUserUseCase {
  constructor(private readonly repository: UserRepository) {}

  // Devuelve los cambios ya limpios para que el hook actualice la lista con ellos
  async execute(id: string, changes: UserChanges): Promise<UserChanges> {
    if (!id) {
      throw new Error('El id del usuario es obligatorio');
    }

    const clean: UserChanges = {};

    if (changes.name !== undefined) {
      const name = changes.name.trim();
      if (!name) throw new Error('El nombre no puede estar vacío');
      clean.name = name;
    }
    if (changes.lastname !== undefined) {
      const lastname = changes.lastname.trim();
      if (!lastname) throw new Error('El apellido no puede estar vacío');
      clean.lastname = lastname;
    }
    if (changes.email !== undefined) {
      const email = changes.email.trim().toLowerCase();
      if (!/^\S+@\S+\.\S+$/.test(email)) {
        throw new Error('El correo no tiene un formato válido');
      }
      clean.email = email;
    }

    if (Object.keys(clean).length === 0) {
      throw new Error('No hay cambios para guardar');
    }

    await this.repository.update(id, clean);
    return clean;
  }
}