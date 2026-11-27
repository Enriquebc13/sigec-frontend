import { UpdatePropertyResult } from "../../domain/entities/property.entity";
import { UpdatePropertyInput } from "../../domain/entities/update-property-input";
import { PropertyRepository } from "../../domain/interfaces/property.repository";

export class UpdatePropertyUseCase {
  constructor(private readonly repository: PropertyRepository) {}

  execute(id: string, input: UpdatePropertyInput): Promise<UpdatePropertyResult> {
    return this.repository.update(id, input);
  }
}