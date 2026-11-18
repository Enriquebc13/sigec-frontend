import { ImageFile } from "../../domain/entities/image-file";
import { PropertyImage } from "../../domain/entities/property.entity";
import { PropertyRepository } from "../../domain/interfaces/property.repository";

export class AddPropertyImageUseCase {
  constructor(private readonly repository: PropertyRepository) {}

  execute(propertyId: string, image: ImageFile): Promise<PropertyImage> {
    return this.repository.addImage(propertyId, image);
  }
}