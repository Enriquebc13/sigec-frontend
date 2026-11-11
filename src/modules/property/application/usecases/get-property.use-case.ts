import { Property } from "../../domain/entities/property.entity";
import { PropertyRepository } from "../../domain/interfaces/property.repository";

export class GetPropertyUseCase {
  constructor(private readonly repository: PropertyRepository) {}

  execute(id: string): Promise<Property> {
    return this.repository.getById(id);
  }
}