import { Property } from "../../domain/entities/property.entity";
import { PropertyRepository } from "../../domain/interfaces/property.repository";

export class GetPropertiesUseCase {
  constructor(private readonly repository: PropertyRepository) {}

  execute(): Promise<Property[]> {
    return this.repository.getAll();
  }
}