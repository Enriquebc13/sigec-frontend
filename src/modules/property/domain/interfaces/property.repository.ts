import { Property } from "../entities/property.entity";

export interface PropertyRepository {
  getAll(): Promise<Property[]>;
  delete(id: string): Promise<void>;

}