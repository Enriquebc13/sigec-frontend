import { CreatePropertyInput } from "../entities/create-property-input";
import { Property } from "../entities/property.entity";

export interface PropertyRepository {
  getAll(): Promise<Property[]>;
  create(input: CreatePropertyInput): Promise<Property>;
  delete(id: string): Promise<void>;

}