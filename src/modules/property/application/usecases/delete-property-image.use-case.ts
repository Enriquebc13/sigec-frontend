import { PropertyRepository } from "../../domain/interfaces/property.repository";

export class DeletePropertyImageUseCase {
  constructor(private readonly repository: PropertyRepository) {}

  execute(imageId: string): Promise<void> {
    return this.repository.deleteImage(imageId);
  }
}