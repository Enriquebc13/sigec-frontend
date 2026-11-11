import { CreatePropertyInput } from "../entities/create-property-input";
import { ImageFile } from "../entities/image-file";
import { Property, PropertyImage } from "../entities/property.entity";
import { UpdatePropertyInput } from "../entities/update-property-input";

export interface PropertyRepository {
  getAll(): Promise<Property[]>;
  getById(id: string): Promise<Property>;
  create(input: CreatePropertyInput): Promise<Property>;
  update(id: string, input: UpdatePropertyInput): Promise<Property>;
  delete(id: string): Promise<void>;
  addImage(propertyId: string, image: ImageFile): Promise<PropertyImage>;
}