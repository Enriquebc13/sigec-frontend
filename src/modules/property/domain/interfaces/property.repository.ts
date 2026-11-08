import { CreatePropertyInput } from "../entities/create-property-input";
import { ImageFile } from "../entities/image-file";
import { Property, PropertyImage } from "../entities/property.entity";

export interface PropertyRepository {
  getAll(): Promise<Property[]>;
  create(input: CreatePropertyInput): Promise<Property>;
  delete(id: string): Promise<void>;
  addImage(propertyId: string, image: ImageFile): Promise<PropertyImage>;
}