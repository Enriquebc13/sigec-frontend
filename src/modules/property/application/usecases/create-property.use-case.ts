import { CreatePropertyInput } from "../../domain/entities/create-property-input";
import { Property } from "../../domain/entities/property.entity";
import { PropertyRepository } from "../../domain/interfaces/property.repository";

export class CreatePropertyUseCase {
  constructor(private readonly repository: PropertyRepository) {}

  execute(input: CreatePropertyInput): Promise<Property> {
    return this.repository.create(input);
  }
}