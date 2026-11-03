import { PropertyRepository } from "../../domain/interfaces/property.repository";

export class DeletePropertyUseCase {
  constructor(private readonly repository: PropertyRepository) {}

  execute(id: string): Promise<void> {
    return this.repository.delete(id);
  }
}